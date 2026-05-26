export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "trader";
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}
