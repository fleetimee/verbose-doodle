import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useNavigate } from "react-router";
import { handleRefreshFailureOnce } from "@/features/auth/refresh-coordinator";
import {
  type AuthenticatedSession,
  createAuthenticatedSession,
} from "@/features/auth/session";
import type { Ability, Role } from "@/features/auth/types";
import {
  AUTH_UNAUTHORIZED_EVENT,
  decodeJWT,
  getAuthToken,
  getRefreshToken,
  getTokenExpiration,
  hasManualLogout,
  markManualLogout,
} from "@/features/auth/utils";
import type { AuthUser } from "@/features/login/types";
import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { queryClient } from "@/lib/query-client";

type RefreshTokenResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
};

type AuthContextValue = {
  authState: AuthState;
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: Role | undefined;
  isAdmin: boolean;
  isUser: boolean;
  can: (ability: Ability) => boolean;
  hasRole: (requiredRole: Role) => boolean;
  login: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function createBrowserSession(): AuthenticatedSession {
  return createAuthenticatedSession({
    storage: {
      read: () => ({
        accessToken: getAuthToken() ?? undefined,
        refreshToken: getRefreshToken() ?? undefined,
      }),
      write: ({ accessToken, refreshToken }) => {
        localStorage.setItem("auth_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        } else {
          localStorage.removeItem("refresh_token");
        }
      },
      clear: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
      },
    },
    clock: () => Date.now(),
    decodeToken: (token) => {
      const user = decodeJWT(token);
      return user ? { user, expiresAt: getTokenExpiration(token) } : null;
    },
    scheduler: {
      schedule: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
      cancel: (handle) => globalThis.clearTimeout(handle as number),
    },
    refresh: async (refreshToken) => {
      const response = await apiFetch<RefreshTokenResponse>(
        API_ENDPOINTS.auth.refresh,
        {
          auth: false,
          emitUnauthorized: false,
          method: "POST",
          retryOnUnauthorized: false,
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (response.responseCode !== "00") {
        throw new Error(response.responseDesc || "Failed to refresh token");
      }

      return response.data;
    },
    clearPrivateCache: () => queryClient.clear(),
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const session = useMemo(createBrowserSession, []);
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot
  );

  const login = useCallback(
    (accessToken: string, refreshToken?: string) => {
      const didSignIn = session.signIn({
        accessToken,
        refreshToken: refreshToken ?? null,
      });
      if (!didSignIn) {
        session.signOut();
      }
    },
    [session]
  );

  const logout = useCallback(() => {
    const shouldKeepManualLogout = hasManualLogout();
    session.signOut();
    try {
      sessionStorage.clear();
      if (shouldKeepManualLogout) {
        markManualLogout();
      }
    } catch {
      // Silently fail if sessionStorage is unavailable
    }
  }, [session]);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      await session.refresh();
      return true;
    } catch (error) {
      handleRefreshFailureOnce(error, logout);
      return false;
    }
  }, [logout, session]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate("/login?reason=expired-during-request");
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [logout, navigate]);

  const role = snapshot.user?.role;
  const isAdmin = role === "ADMIN";
  const isUser = role === "USER";
  const can = useCallback(
    (ability: Ability) => session.can(ability),
    [session]
  );
  const hasRole = useCallback(
    (requiredRole: Role) => role === requiredRole,
    [role]
  );
  const authState = {
    user: snapshot.user,
    isAuthenticated: snapshot.isAuthenticated,
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        user: snapshot.user,
        isAuthenticated: snapshot.isAuthenticated,
        role,
        isAdmin,
        isUser,
        can,
        hasRole,
        login,
        logout,
        refreshAuth,
      }}
    >
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
