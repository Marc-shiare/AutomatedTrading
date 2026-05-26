import { LoginCredentials, User, ValidationErrors } from "./types";

// ── Constants ───────────────────────────────────────────────────────
const AUTH_COOKIE_NAME = "qta_auth";
const AUTH_LOCAL_KEY = "qta_auth";
const REMEMBER_KEY = "qta_auth_rm";

// ── Token Helpers ──────────────────────────────────────────────────
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  }
  return btoa(String.fromCharCode(...array));
}

function setAuthCookie(value: string, days?: number): void {
  if (typeof document === "undefined") return;
  const expires = days
    ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
    : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${value}${expires}; path=/; SameSite=Strict; Secure`;
}

function removeAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`;
}

// ── Rate Limiting ──────────────────────────────────────────────────
let loginAttempts = 0;
let lastAttemptTime = 0;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300000; // 5 minutes

function isRateLimited(): boolean {
  const now = Date.now();
  if (now - lastAttemptTime > LOCKOUT_DURATION) {
    loginAttempts = 0;
  }
  return loginAttempts >= MAX_ATTEMPTS;
}

function recordAttempt() {
  loginAttempts++;
  lastAttemptTime = Date.now();
}

// ── Validation ──────────────────────────────────────────────────────
export function validateCredentials(credentials: LoginCredentials): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!credentials.email || credentials.email.trim().length === 0) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!credentials.password || credentials.password.trim().length === 0) {
    errors.password = "Password is required";
  } else if (credentials.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

// ── Login ─────────────────────────────────────────────────────────
export async function login(credentials: LoginCredentials): Promise<User> {
  return new Promise((resolve, reject) => {
    // Rate limiting check
    if (isRateLimited()) {
      reject(new Error("Too many failed attempts. Please try again in 5 minutes."));
      return;
    }

    setTimeout(() => {
      const email = credentials.email.toLowerCase().trim();

      // In production, this would call the real backend API
      // const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) })
      // For demo, we validate against env vars or API response
      // DO NOT hardcode production credentials here
      const validEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || "trader@quantumtrade.com";
      const validPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "QuantumTrade2026!";

      if (email === validEmail && credentials.password === validPassword) {
        recordAttempt();
        loginAttempts = 0; // Reset on success

        const token = generateSecureToken();

        if (credentials.rememberMe) {
          localStorage.setItem(AUTH_LOCAL_KEY, token);
          setAuthCookie(token, 30);
          localStorage.setItem(REMEMBER_KEY, "true");
        } else {
          sessionStorage.setItem(AUTH_LOCAL_KEY, token);
          setAuthCookie(token);
          localStorage.removeItem(AUTH_LOCAL_KEY);
          localStorage.removeItem(REMEMBER_KEY);
        }

        const user: User = {
          id: "user-" + crypto.randomUUID().slice(0, 8),
          email: credentials.email,
          name: "Quantum Trader",
          role: "admin",
        };

        resolve(user);
      } else {
        recordAttempt();
        reject(new Error("Invalid email or password"));
      }
    }, 1200);
  });
}

// ── Logout ────────────────────────────────────────────────────────
export function logout(): void {
  localStorage.removeItem(AUTH_LOCAL_KEY);
  sessionStorage.removeItem(AUTH_LOCAL_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  removeAuthCookie();
  loginAttempts = 0;
  lastAttemptTime = 0;
}

// ── Token / Session ──────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem(AUTH_LOCAL_KEY) || sessionStorage.getItem(AUTH_LOCAL_KEY);
}

export function hasSession(): boolean {
  return !!getToken();
}

export function getCurrentUser(): User | null {
  const token = getToken();
  if (!token) return null;

  // In production, verify JWT server-side or decode from token
  // For now, return minimal user from localStorage if present
  const stored = localStorage.getItem("qta_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  return {
    id: "demo-user",
    email: "trader@quantumtrade.com",
    name: "Quantum Trader",
    role: "admin",
  };
}
