import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/features/auth/context";
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearAuthToken,
  decodeJWT,
  getAuthToken,
  saveAuthToken,
} from "@/features/auth/utils";

const TOKEN_STORAGE_KEY = "auth_token";
const TRAILING_PADDING_REGEX = /=+$/u;

type LocalStorageMocks = {
  storage: Record<string, string>;
  getItemMock: ReturnType<typeof mock>;
  setItemMock: ReturnType<typeof mock>;
  removeItemMock: ReturnType<typeof mock>;
};

type JwtPayload = {
  user_id: string;
  username: string;
  role: "ADMIN" | "USER";
  exp?: number;
};

const originalLocalStorage = window.localStorage;

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(TRAILING_PADDING_REGEX, "");
}

function createJwtToken(payload: JwtPayload): string {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = toBase64Url(JSON.stringify(payload));
  const signature = toBase64Url("signature");
  return `${header}.${body}.${signature}`;
}

function stubLocalStorage(overrides?: Partial<Storage>): LocalStorageMocks {
  const storage: Record<string, string> = {};

  const setItemMock = mock((key: string, value: string) => {
    storage[key] = value;
  });

  const getItemMock = mock((key: string) =>
    Object.hasOwn(storage, key) ? storage[key] : null
  );

  const removeItemMock = mock((key: string) => {
    delete storage[key];
  });

  const localStorage: Storage = {
    getItem:
      overrides?.getItem ?? (getItemMock as unknown as Storage["getItem"]),
    setItem:
      overrides?.setItem ?? (setItemMock as unknown as Storage["setItem"]),
    removeItem:
      overrides?.removeItem ??
      (removeItemMock as unknown as Storage["removeItem"]),
    clear:
      overrides?.clear ??
      (() => {
        for (const key of Object.keys(storage)) {
          delete storage[key];
        }
      }),
    key:
      overrides?.key ??
      ((index: number) => Object.keys(storage)[index] ?? null),
    get length() {
      return Object.keys(storage).length;
    },
  };

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: localStorage,
  });

  return {
    storage,
    getItemMock,
    setItemMock,
    removeItemMock,
  };
}

function restoreLocalStorage() {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: originalLocalStorage,
  });
  originalLocalStorage.clear();
}

async function createDecodeSpy() {
  const authUtilsModule = await import("@/features/auth/utils");
  return spyOn(authUtilsModule, "decodeJWT");
}

function AuthTestConsumer({ loginToken }: { loginToken: string }) {
  const { authState, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="is-authenticated">
        {authState.isAuthenticated ? "true" : "false"}
      </span>
      <span data-testid="username">{authState.user?.username ?? ""}</span>
      <button onClick={() => login(loginToken)} type="button">
        Trigger Login
      </button>
      <button onClick={logout} type="button">
        Trigger Logout
      </button>
    </div>
  );
}

beforeEach(() => {
  restoreLocalStorage();
});

afterEach(() => {
  restoreLocalStorage();
});

describe("auth utils", () => {
  test("decodeJWT returns parsed user for a valid token", () => {
    const payload: JwtPayload = {
      user_id: "user-123",
      username: "alice",
      role: "ADMIN",
    };
    const token = createJwtToken(payload);

    expect(decodeJWT(token)).toEqual(payload);
  });

  test("decodeJWT returns null when token structure is invalid", () => {
    expect(decodeJWT("not-a-jwt")).toBeNull();
  });

  test("decodeJWT returns null when payload cannot be parsed", () => {
    const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const malformedPayload = toBase64Url('{"user_id": "user-1"');
    const signature = toBase64Url("sig");
    const token = `${header}.${malformedPayload}.${signature}`;

    expect(decodeJWT(token)).toBeNull();
  });

  test("decodeJWT returns null when token is expired", () => {
    const payload: JwtPayload = {
      user_id: "user-expired",
      username: "expired-user",
      role: "USER",
      exp: Math.floor(Date.now() / 1000) - 10,
    };
    const token = createJwtToken(payload);

    expect(decodeJWT(token)).toBeNull();
  });

  test("saveAuthToken stores token in localStorage", () => {
    const { storage, setItemMock } = stubLocalStorage();

    saveAuthToken("token-abc");

    expect(setItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, "token-abc");
    expect(storage[TOKEN_STORAGE_KEY]).toBe("token-abc");
  });

  test("saveAuthToken swallows storage errors", () => {
    const failingSetItem = mock(() => {
      throw new Error("quota exceeded");
    });

    stubLocalStorage({
      setItem: failingSetItem as Storage["setItem"],
    });

    expect(() => saveAuthToken("token-def")).not.toThrow();
    expect(failingSetItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, "token-def");
  });

  test("getAuthToken returns stored token", () => {
    const { storage, getItemMock } = stubLocalStorage();
    storage[TOKEN_STORAGE_KEY] = "persisted-token";

    expect(getAuthToken()).toBe("persisted-token");
    expect(getItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
  });

  test("getAuthToken returns null when storage throws", () => {
    const failingGetItem = mock(() => {
      throw new Error("storage unavailable");
    });

    stubLocalStorage({
      getItem: failingGetItem as Storage["getItem"],
    });

    expect(getAuthToken()).toBeNull();
    expect(failingGetItem).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
  });

  test("clearAuthToken removes token from storage", () => {
    const { storage, removeItemMock } = stubLocalStorage();
    storage[TOKEN_STORAGE_KEY] = "active-token";

    clearAuthToken();

    expect(removeItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(storage[TOKEN_STORAGE_KEY]).toBeUndefined();
  });
});

describe("AuthProvider", () => {
  test("initializes auth state from persisted token", async () => {
    const { storage, getItemMock } = stubLocalStorage();
    const persistedToken = "persisted-token";
    storage[TOKEN_STORAGE_KEY] = persistedToken;

    const decodeSpy = await createDecodeSpy();
    const mockUser = {
      user_id: "user-42",
      username: "persisted-user",
      role: "USER" as const,
    };

    decodeSpy.mockReturnValue(mockUser);

    render(
      <AuthProvider>
        <AuthTestConsumer loginToken="new-token" />
      </AuthProvider>
    );

    expect(getItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(decodeSpy).toHaveBeenCalledWith(persistedToken);
    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
    expect(screen.getByTestId("username").textContent).toBe("persisted-user");

    decodeSpy.mockRestore();
  });

  test("clears invalid persisted token during initialization", async () => {
    const { storage, removeItemMock } = stubLocalStorage();
    const persistedToken = "invalid-token";
    storage[TOKEN_STORAGE_KEY] = persistedToken;

    const decodeSpy = await createDecodeSpy();
    decodeSpy.mockReturnValue(null);

    render(
      <AuthProvider>
        <AuthTestConsumer loginToken="unused" />
      </AuthProvider>
    );

    expect(removeItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(storage[TOKEN_STORAGE_KEY]).toBeUndefined();
    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
    expect(screen.getByTestId("username").textContent).toBe("");

    decodeSpy.mockRestore();
  });

  test("login stores token and updates auth state", async () => {
    const { setItemMock } = stubLocalStorage();
    const loginToken = "login-token";

    const decodeSpy = await createDecodeSpy();
    const authedUser = {
      user_id: "user-login",
      username: "login-user",
      role: "ADMIN" as const,
    };

    decodeSpy.mockImplementation((token: string) =>
      token === loginToken ? authedUser : null
    );

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthTestConsumer loginToken={loginToken} />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: "Trigger Login" }));

    expect(decodeSpy).toHaveBeenCalledWith(loginToken);
    expect(setItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, loginToken);
    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
    expect(screen.getByTestId("username").textContent).toBe("login-user");

    decodeSpy.mockRestore();
  });

  test("logout clears storage and resets auth state", async () => {
    const { setItemMock, removeItemMock } = stubLocalStorage();
    const loginToken = "session-token";

    const decodeSpy = await createDecodeSpy();
    const authedUser = {
      user_id: "user-session",
      username: "session-user",
      role: "USER" as const,
    };

    decodeSpy.mockImplementation((token: string) =>
      token === loginToken ? authedUser : null
    );

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthTestConsumer loginToken={loginToken} />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: "Trigger Login" }));
    await user.click(screen.getByRole("button", { name: "Trigger Logout" }));

    expect(setItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, loginToken);
    expect(removeItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
    expect(screen.getByTestId("username").textContent).toBe("");

    decodeSpy.mockRestore();
  });

  test("handles unauthorized event by logging out", async () => {
    const { storage, setItemMock, removeItemMock } = stubLocalStorage();
    const loginToken = "event-token";

    const decodeSpy = await createDecodeSpy();
    const authedUser = {
      user_id: "user-event",
      username: "event-user",
      role: "ADMIN" as const,
    };

    decodeSpy.mockReturnValue(authedUser);

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthTestConsumer loginToken={loginToken} />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: "Trigger Login" }));

    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
    expect(storage[TOKEN_STORAGE_KEY]).toBe(loginToken);

    await act(() => {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    });

    expect(removeItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY);
    expect(setItemMock).toHaveBeenCalledWith(TOKEN_STORAGE_KEY, loginToken);
    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
    expect(screen.getByTestId("username").textContent).toBe("");
    expect(storage[TOKEN_STORAGE_KEY]).toBeUndefined();

    decodeSpy.mockRestore();
  });
});
