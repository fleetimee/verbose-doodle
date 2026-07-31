import { describe, expect, test } from "bun:test";
import "@testing-library/react";
import { createAuthenticatedSession } from "@/features/auth/session";

const TRAILING_PADDING_REGEX = /[=]+$/u;

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(TRAILING_PADDING_REGEX, "");
}

function createJwtToken(payload: Record<string, unknown>): string {
  return [
    toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    toBase64Url(JSON.stringify(payload)),
    toBase64Url("signature"),
  ].join(".");
}

function createHarness(initial?: {
  accessToken?: string;
  refreshToken?: string;
}) {
  let now = 1_000_000;
  const storage: {
    accessToken?: string;
    refreshToken?: string | null;
  } = { ...initial };
  const scheduled: Array<{ callback: () => void; delayMs: number }> = [];
  let cacheClears = 0;
  let refreshCalls = 0;
  let resolveRefresh:
    | ((value: { accessToken: string; refreshToken: string }) => void)
    | undefined;

  const session = createAuthenticatedSession({
    clearPrivateCache: () => {
      cacheClears += 1;
    },
    clock: () => now,
    refresh: () => {
      refreshCalls += 1;
      return new Promise((resolve) => {
        resolveRefresh = resolve;
      });
    },
    scheduler: {
      cancel: () => undefined,
      schedule: (callback, delayMs) => {
        scheduled.push({ callback, delayMs });
        return scheduled.length - 1;
      },
    },
    storage: {
      clear: () => {
        storage.accessToken = undefined;
        storage.refreshToken = undefined;
      },
      read: () => ({ ...storage }),
      write: (tokens) => {
        storage.accessToken = tokens.accessToken;
        storage.refreshToken = tokens.refreshToken;
      },
    },
  });

  return {
    get cacheClears() {
      return cacheClears;
    },
    get refreshCalls() {
      return refreshCalls;
    },
    resolveRefresh: (tokens: { accessToken: string; refreshToken: string }) => {
      resolveRefresh?.(tokens);
    },
    scheduled,
    session,
    setNow: (value: number) => {
      now = value;
    },
  };
}

function validToken(role = "ADMIN", exp = 2000): string {
  return createJwtToken({
    exp,
    role,
    user_id: "user-1",
    username: "alice",
  });
}

describe("authenticated session", () => {
  test("restores persisted sessions and rejects invalid tokens", () => {
    const valid = validToken();
    const restored = createHarness({
      accessToken: valid,
      refreshToken: "refresh-1",
    });

    expect(restored.session.getSnapshot()).toMatchObject({
      accessToken: valid,
      isAuthenticated: true,
      refreshToken: "refresh-1",
      user: { role: "ADMIN", username: "alice" },
    });

    const invalid = createHarness({
      accessToken: "invalid",
      refreshToken: "refresh-1",
    });
    expect(invalid.session.getSnapshot().isAuthenticated).toBe(false);
  });

  test("schedules proactive refresh before expiry", () => {
    const harness = createHarness();
    harness.session.signIn({
      accessToken: validToken("USER", 1000.2),
      refreshToken: "refresh-1",
    });

    expect(harness.scheduled[0]?.delayMs).toBe(0);
  });

  test("shares one refresh across concurrent callers", async () => {
    const harness = createHarness();
    harness.session.signIn({
      accessToken: validToken(),
      refreshToken: "refresh-1",
    });

    const first = harness.session.refresh();
    const second = harness.session.refresh();
    expect(harness.refreshCalls).toBe(1);

    const refreshedToken = validToken("USER", 3000);
    harness.resolveRefresh({
      accessToken: refreshedToken,
      refreshToken: "refresh-2",
    });

    expect(await Promise.all([first, second])).toHaveLength(2);
    expect(harness.session.getSnapshot().refreshToken).toBe("refresh-2");
  });

  test("signs out, clears private cache, and notifies subscribers", () => {
    const harness = createHarness();
    const notifications: number[] = [];
    harness.session.subscribe(() => notifications.push(1));
    harness.session.signIn({
      accessToken: validToken(),
      refreshToken: "refresh-1",
    });
    harness.session.signOut();

    expect(harness.session.getSnapshot().isAuthenticated).toBe(false);
    expect(harness.cacheClears).toBe(1);
    expect(notifications).toHaveLength(2);
  });

  test("answers role-to-ability checks through the public interface", () => {
    const harness = createHarness();
    harness.session.signIn({
      accessToken: validToken("USER"),
      refreshToken: "refresh-1",
    });

    expect(harness.session.can("canViewEndpoints")).toBe(true);
    expect(harness.session.can("canAddEndpoint")).toBe(false);
  });
});
