import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import {
  clearAuthToken,
  decodeJWT,
  getAuthToken,
  saveAuthToken,
} from "@/features/auth/utils";
import type { AuthUser } from "@/features/login/types";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
};

type AuthContextValue = {
  authState: AuthState;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize from JWT token in localStorage
    const token = getAuthToken();
    if (!token) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    const user = decodeJWT(token);
    return {
      user,
      isAuthenticated: user !== null,
    };
  });

  const login = (token: string) => {
    saveAuthToken(token);
    const user = decodeJWT(token);
    setAuthState({
      user,
      isAuthenticated: user !== null,
    });
  };

  const logout = () => {
    clearAuthToken();
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
