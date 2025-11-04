import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthToken,
  decodeJWT,
  getAuthToken,
  saveAuthToken,
} from "@/features/auth/utils";
import type { AuthUser } from "@/features/login/types";
import { queryClient } from "@/lib/query-client";

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

    if (!user) {
      clearAuthToken();
      return {
        user: null,
        isAuthenticated: false,
      };
    }

    return {
      user,
      isAuthenticated: true,
    };
  });

  const login = useCallback((token: string) => {
    saveAuthToken(token);
    const user = decodeJWT(token);
    if (!user) {
      clearAuthToken();
      setAuthState({
        user: null,
        isAuthenticated: false,
      });
      return;
    }

    setAuthState({
      user,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
    // Clear all TanStack Query cache to prevent data leakage between sessions
    queryClient.clear();
    // Clear all sessionStorage (including expiration reasons)
    try {
      sessionStorage.clear();
    } catch {
      // Silently fail if sessionStorage is unavailable
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [logout]);

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
