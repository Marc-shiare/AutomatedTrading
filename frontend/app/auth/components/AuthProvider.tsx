"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, AuthState } from "../types";
import { getCurrentUser, hasSession } from "../service";
import LoadingScreen from "@/app/components/LoadingScreen";

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_PATHS = ["/login", "/"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const user = getCurrentUser();
    const isAuth = hasSession();
    setAuthState(() => ({ isAuthenticated: isAuth, user: user, isLoading: false }));
  }, []);

  useEffect(() => {
    if (authState.isLoading) return;

    const isDashboardPath = pathname?.startsWith("/dashboard");
    const isLoginPath = pathname === "/login";

    if (!authState.isAuthenticated && isDashboardPath) {
      router.replace("/login");
    } else if (authState.isAuthenticated && isLoginPath) {
      router.replace("/dashboard");
    }
  }, [authState.isLoading, authState.isAuthenticated, pathname, router]);

  const login = (user: User) => {
    setAuthState({
      isAuthenticated: true,
      user,
      isLoading: false,
    });
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  if (authState.isLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { PUBLIC_PATHS };
