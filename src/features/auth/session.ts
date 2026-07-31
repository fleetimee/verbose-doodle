import { jwtDecode } from "jwt-decode";
import type { Ability, Role } from "@/features/auth/types";
import { ROLE_ABILITIES } from "@/features/auth/types";

const REFRESH_BEFORE_EXPIRY_MS = 180_000;

export type SessionUser = {
  user_id: string;
  username: string;
  role: Role;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string | null;
};

export type AuthenticatedSessionSnapshot = {
  user: SessionUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
};

export type SessionTokenStorage = {
  read: () => Partial<SessionTokens>;
  write: (tokens: SessionTokens) => void;
  clear: () => void;
};

export type SessionScheduler = {
  schedule: (callback: () => void, delayMs: number) => unknown;
  cancel: (handle: unknown) => void;
};

export type AuthenticatedSessionOptions = {
  storage: SessionTokenStorage;
  clock: () => number;
  scheduler: SessionScheduler;
  refresh: (refreshToken: string) => Promise<SessionTokens>;
  clearPrivateCache: () => void;
  decodeToken?: (
    token: string,
    now: number
  ) => { user: SessionUser; expiresAt: number | null } | null;
};

type JwtPayload = {
  user_id?: unknown;
  username?: unknown;
  role?: unknown;
  exp?: unknown;
};

type Listener = () => void;

function decodeToken(
  token: string,
  now: number
): {
  user: SessionUser;
  expiresAt: number | null;
} | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (
      typeof payload.user_id !== "string" ||
      typeof payload.username !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "USER")
    ) {
      return null;
    }

    const expiresAt =
      typeof payload.exp === "number" && Number.isFinite(payload.exp)
        ? payload.exp * 1000
        : null;

    if (expiresAt !== null && expiresAt <= now) {
      return null;
    }

    return {
      expiresAt,
      user: {
        role: payload.role,
        user_id: payload.user_id,
        username: payload.username,
      },
    };
  } catch {
    return null;
  }
}

export function createAuthenticatedSession(
  options: AuthenticatedSessionOptions
) {
  const listeners = new Set<Listener>();
  let expiryHandle: unknown;
  let refreshOperation: Promise<AuthenticatedSessionSnapshot> | null = null;
  let disposed = false;
  let snapshot: AuthenticatedSessionSnapshot = {
    accessToken: null,
    expiresAt: null,
    isAuthenticated: false,
    refreshToken: null,
    user: null,
  };

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const cancelExpiry = () => {
    if (expiryHandle !== undefined) {
      options.scheduler.cancel(expiryHandle);
      expiryHandle = undefined;
    }
  };

  const scheduleRefresh = () => {
    cancelExpiry();
    if (snapshot.expiresAt === null || snapshot.refreshToken === null) {
      return;
    }

    const delayMs = Math.max(
      0,
      snapshot.expiresAt - options.clock() - REFRESH_BEFORE_EXPIRY_MS
    );
    expiryHandle = options.scheduler.schedule(async () => {
      try {
        await session.refresh();
      } catch {
        session.signOut();
      }
    }, delayMs);
  };

  const setSnapshot = (tokens: SessionTokens, notifyListeners = true) => {
    const decoded = (options.decodeToken ?? decodeToken)(
      tokens.accessToken,
      options.clock()
    );
    if (!decoded) {
      options.storage.clear();
      snapshot = {
        accessToken: null,
        expiresAt: null,
        isAuthenticated: false,
        refreshToken: null,
        user: null,
      };
      cancelExpiry();
      if (notifyListeners) {
        notify();
      }
      return false;
    }

    options.storage.write(tokens);
    snapshot = {
      accessToken: tokens.accessToken,
      expiresAt: decoded.expiresAt,
      isAuthenticated: true,
      refreshToken: tokens.refreshToken,
      user: decoded.user,
    };
    scheduleRefresh();
    if (notifyListeners) {
      notify();
    }
    return true;
  };

  const session = {
    can: (ability: Ability) => {
      const role = snapshot.user?.role;
      return role ? ROLE_ABILITIES[role][ability] : false;
    },

    dispose: () => {
      if (disposed) {
        return;
      }
      disposed = true;
      cancelExpiry();
      listeners.clear();
    },
    getSnapshot: () => snapshot,

    refresh: (): Promise<AuthenticatedSessionSnapshot> => {
      if (disposed || snapshot.refreshToken === null) {
        return Promise.reject(new Error("No refresh token available"));
      }
      if (refreshOperation) {
        return refreshOperation;
      }

      const currentRefreshToken = snapshot.refreshToken;
      refreshOperation = options
        .refresh(currentRefreshToken)
        .then((tokens) => {
          if (!setSnapshot(tokens)) {
            throw new Error("Refresh returned an invalid access token");
          }
          return snapshot;
        })
        .finally(() => {
          refreshOperation = null;
        });
      return refreshOperation;
    },

    signIn: (tokens: SessionTokens) => {
      if (disposed || !setSnapshot(tokens)) {
        return false;
      }
      return true;
    },

    signOut: () => {
      if (disposed || !snapshot.isAuthenticated) {
        return;
      }
      cancelExpiry();
      options.storage.clear();
      options.clearPrivateCache();
      snapshot = {
        accessToken: null,
        expiresAt: null,
        isAuthenticated: false,
        refreshToken: null,
        user: null,
      };
      notify();
    },

    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  const persistedTokens = options.storage.read();
  if (persistedTokens.accessToken) {
    setSnapshot(
      {
        accessToken: persistedTokens.accessToken,
        refreshToken: persistedTokens.refreshToken ?? null,
      },
      false
    );
  } else if (persistedTokens.accessToken || persistedTokens.refreshToken) {
    options.storage.clear();
  }

  return session;
}

export type AuthenticatedSession = ReturnType<
  typeof createAuthenticatedSession
>;
