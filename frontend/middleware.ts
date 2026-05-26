import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Path Whitelist ─────────────────────────────────────────────────
const PUBLIC_PATHS = ["/login", "/"];

// ── Auth Token Extractor ────────────────────────────────────────────
function extractToken(request: NextRequest): string | null {
  // 1. Check cookies
  const cookieToken = request.cookies.get("qta_auth")?.value;
  if (cookieToken) return cookieToken;

  // 2. Check Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // 3. Check custom header
  return request.headers.get("x-auth-token");
}

// ── Token Validator (placeholder for JWT verify) ────────────────────
function isValidToken(token: string | null): boolean {
  if (!token || token.length < 32) return false;
  // TODO: In production, verify JWT signature with server secret
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Always allow public assets ───────────────────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/api/") || // API routes handle their own auth
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // ── State-changing requests require valid token ──────────────────
  const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/mt5") ||
    pathname.startsWith("/api/optimizer") ||
    isMutation;

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = extractToken(request);

  if (!isValidToken(token)) {
    // API requests get 401, page requests redirect to login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|public|.*\\..*).*)"],
};
