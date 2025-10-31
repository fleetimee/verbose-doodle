import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  clearAuthUser,
  getAuthUser,
  saveAuthUser,
} from "@/features/auth/utils";
import type { AuthUser } from "@/features/login/types";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
};

type AuthContextValue = {
  authState: AuthState;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const user = getAuthUser();
    return {
      user,
      isAuthenticated: user !== null,
    };
  });

  useEffect(() => {
    // Sync with sessionStorage on mount
    const user = getAuthUser();
    setAuthState({
      user,
      isAuthenticated: user !== null,
    });
  }, []);

  const login = (user: AuthUser) => {
    saveAuthUser(user);
    setAuthState({
      user,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    clearAuthUser();
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
