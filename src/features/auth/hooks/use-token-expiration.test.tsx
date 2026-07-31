import { afterEach, beforeEach, describe, expect, test, vi } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { AuthProvider } from "@/features/auth/context";
import { useTokenExpiration } from "@/features/auth/hooks/use-token-expiration";

const TRAILING_PADDING_REGEX = /[=]+$/u;
const REMAINING_TIME_PATTERN = /^1m \d+s$/u;

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(TRAILING_PADDING_REGEX, "");
}

function createJwtToken(expiresAt: number): string {
  return [
    toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    toBase64Url(
      JSON.stringify({
        exp: Math.floor(expiresAt / 1000),
        role: "USER",
        user_id: "user-1",
        username: "alice",
      })
    ),
    toBase64Url("signature"),
  ].join(".");
}

function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("useTokenExpiration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  test("returns null when the session has no expiration", () => {
    const { result } = renderHook(() => useTokenExpiration(), {
      wrapper: AuthProviderWrapper,
    });

    expect(result.current).toBeNull();
  });

  test("reads expiration from the session snapshot", () => {
    localStorage.setItem("auth_token", createJwtToken(Date.now() + 7_200_000));

    const { result } = renderHook(() => useTokenExpiration(), {
      wrapper: AuthProviderWrapper,
    });

    expect(result.current).toMatchObject({
      isExpired: false,
    });
    expect(result.current?.remainingMs).toBeGreaterThan(7_198_000);
    expect(result.current?.formattedTime).toBe("1h 59m");
  });

  test("updates the session expiration display as time advances", () => {
    localStorage.setItem("auth_token", createJwtToken(Date.now() + 65_000));

    const { result } = renderHook(() => useTokenExpiration(), {
      wrapper: AuthProviderWrapper,
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current?.remainingMs).toBeGreaterThan(63_000);
    expect(result.current?.formattedTime).toMatch(REMAINING_TIME_PATTERN);
  });
});
