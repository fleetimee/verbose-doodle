import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthToken,
  clearRefreshToken,
  decodeJWT,
  getAuthToken,
  saveAuthToken,
  saveRefreshToken,
} from "@/features/auth/utils";
import type { AuthUser } from "@/features/login/types";
import { queryClient } from "@/lib/query-client";

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
};

type AuthContextValue = {
  authState: AuthState;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
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

  const login = useCallback((accessToken: string, refreshToken?: string) => {
    saveAuthToken(accessToken);
    if (refreshToken) {
      saveRefreshToken(refreshToken);
    }
    const user = decodeJWT(accessToken);
    if (!user) {
      clearAuthToken();
      clearRefreshToken();
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
    clearRefreshToken();
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

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    // Import dynamically to avoid circular dependency
    const { refreshToken: refreshTokenFn } = await import(
      "@/features/auth/api/refresh-token"
    );

    try {
      const response = await refreshTokenFn();
      login(response.accessToken, response.refreshToken);
      return true;
    } catch {
      // If refresh fails, logout user
      logout();
      return false;
    }
  }, [login, logout]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleUnauthorized = () => {
      logout();
      // Use React Router navigate instead of window.location.href
      navigate("/login?reason=expired-during-request");
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [logout, navigate]);

  return (
    <AuthContext.Provider value={{ authState, login, logout, refreshAuth }}>
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
