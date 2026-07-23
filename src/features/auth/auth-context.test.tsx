import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { AuthProvider, useAuth } from "@/features/auth/context";

const TRAILING_PADDING_REGEX = /=+$/u;

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(TRAILING_PADDING_REGEX, "");
}

function createJwtToken({
  role = "ADMIN",
  expiresAt = Math.floor(Date.now() / 1000) + 3600,
  username = "alice",
}: {
  role?: "ADMIN" | "USER";
  expiresAt?: number;
  username?: string;
} = {}): string {
  const payload = {
    exp: expiresAt,
    role,
    user_id: "user-1",
    username,
  };

  return [
    toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    toBase64Url(JSON.stringify(payload)),
    toBase64Url("signature"),
  ].join(".");
}

function AuthTestConsumer({ loginToken }: { loginToken: string }) {
  const { login, logout, session, snapshot } = useAuth();

  return (
    <div>
      <span data-testid="is-authenticated">
        {snapshot.isAuthenticated ? "true" : "false"}
      </span>
      <span data-testid="username">{snapshot.user?.username ?? ""}</span>
      <span data-testid="can-add">
        {session.can("canAddEndpoint") ? "true" : "false"}
      </span>
      <button
        onClick={() =>
          login({ accessToken: loginToken, refreshToken: "refresh-token" })
        }
        type="button"
      >
        Trigger Login
      </button>
      <button onClick={logout} type="button">
        Trigger Logout
      </button>
    </div>
  );
}

function renderAuthProvider(loginToken: string) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AuthTestConsumer loginToken={loginToken} />
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("AuthProvider", () => {
  test("restores the Authenticated Session snapshot from persisted tokens", () => {
    const persistedToken = createJwtToken({ username: "persisted-user" });
    localStorage.setItem("auth_token", persistedToken);
    localStorage.setItem("refresh_token", "refresh-token");

    renderAuthProvider("unused-token");

    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
    expect(screen.getByTestId("username").textContent).toBe("persisted-user");
    expect(screen.getByTestId("can-add").textContent).toBe("true");
  });

  test("clears invalid persisted access tokens", () => {
    localStorage.setItem("auth_token", "invalid-token");
    localStorage.setItem("refresh_token", "refresh-token");

    renderAuthProvider("unused-token");

    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
  });

  test("signs in through the session interface and updates the snapshot", async () => {
    const user = userEvent.setup();
    const loginToken = createJwtToken({ role: "USER", username: "login-user" });

    renderAuthProvider(loginToken);
    await user.click(screen.getByRole("button", { name: "Trigger Login" }));

    expect(localStorage.getItem("auth_token")).toBe(loginToken);
    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
    expect(screen.getByTestId("username").textContent).toBe("login-user");
    expect(screen.getByTestId("can-add").textContent).toBe("false");
  });

  test("signs out through the session interface and clears persisted tokens", async () => {
    const user = userEvent.setup();
    const loginToken = createJwtToken();

    renderAuthProvider(loginToken);
    await user.click(screen.getByRole("button", { name: "Trigger Login" }));
    await user.click(screen.getByRole("button", { name: "Trigger Logout" }));

    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
    expect(screen.getByTestId("username").textContent).toBe("");
  });
});
