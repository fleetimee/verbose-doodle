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
import {
  hasManualLogout,
  markManualLogout,
} from "@/features/auth/manual-logout";
import {
  type AuthenticatedSession,
  type AuthenticatedSessionSnapshot,
  createAuthenticatedSession,
  type SessionTokens,
} from "@/features/auth/session";
import { apiFetch, setDefaultApiSession } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { queryClient } from "@/lib/query-client";

type RefreshTokenResponse = {
  responseCode: string;
  responseDesc: string;
  data: SessionTokens;
};

type AuthContextValue = {
  session: AuthenticatedSession;
  snapshot: AuthenticatedSessionSnapshot;
  login: (tokens: SessionTokens) => boolean;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function createBrowserSession(): AuthenticatedSession {
  return createAuthenticatedSession({
    storage: {
      read: () => ({
        accessToken: localStorage.getItem("auth_token") ?? undefined,
        refreshToken: localStorage.getItem("refresh_token") ?? undefined,
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
  const session = useMemo(() => {
    const nextSession = createBrowserSession();
    setDefaultApiSession({
      getSnapshot: nextSession.getSnapshot,
      refresh: nextSession.refresh,
      signOut: () => {
        nextSession.signOut();
        navigate("/login?reason=expired-during-request");
      },
    });
    return nextSession;
  }, [navigate]);
  const snapshot = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot
  );

  useEffect(() => () => session.dispose(), [session]);

  const login = useCallback(
    (tokens: SessionTokens) => {
      const didSignIn = session.signIn(tokens);
      if (!didSignIn) {
        session.signOut();
      }
      return didSignIn;
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
    } catch {
      session.signOut();
      return false;
    }
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        snapshot,
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
