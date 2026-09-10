import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router";
import { AuthProvider } from "@/features/auth/context";
import { DashboardVisitNotifications } from "@/features/dashboard/components/dashboard-visit-notifications";

type SocketListener = (event: { readonly data?: string }) => void;

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];

  readonly listeners = new Map<string, SocketListener[]>();
  readonly url: string;
  readyState = 0;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: SocketListener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  close() {
    this.readyState = 3;
    this.emit("close");
  }

  emit(type: string, data?: string) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ data });
    }
  }

  open() {
    this.readyState = 1;
    this.emit("open");
  }
}

function createToken(
  role: "ADMIN" | "USER",
  userId: string,
  username: string
): string {
  const payload = btoa(JSON.stringify({ role, user_id: userId, username }));
  return `header.${payload}.signature`;
}

function createAdminToken(): string {
  return createToken("ADMIN", "admin-1", "admin");
}

describe("DashboardVisitNotifications", () => {
  const originalWebSocket = globalThis.WebSocket;
  const originalFetch = globalThis.fetch;
  let dashboardVisitRequestCount: number;

  beforeEach(() => {
    FakeWebSocket.instances = [];
    dashboardVisitRequestCount = 0;
    localStorage.clear();
    localStorage.setItem("auth_token", createAdminToken());
    globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
    const fetchMock = (
      input: Parameters<typeof globalThis.fetch>[0],
      init?: Parameters<typeof globalThis.fetch>[1]
    ) => {
      if (
        String(input) === "/api/dashboard/visits" &&
        init?.method === "POST"
      ) {
        dashboardVisitRequestCount += 1;
        return Promise.resolve(
          Response.json({
            data: {
              payload: {
                ip_address: "127.0.0.1",
                user_id: "admin-1",
                username: "admin",
                visit_id: "visit-current",
                visited_at: "2026-09-10T12:30:00Z",
              },
              type: "dashboard_visited",
            },
          })
        );
      }

      if (String(input) === "/api/realtime/tickets") {
        return Promise.resolve(
          Response.json({
            data: {
              expiresAt: "2026-09-10T12:30:00Z",
              ticket: "dashboard-ticket",
            },
          })
        );
      }

      return Promise.resolve(new Response(null, { status: 204 }));
    };
    globalThis.fetch = Object.assign(fetchMock, {
      preconnect: originalFetch.preconnect,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    globalThis.WebSocket = originalWebSocket;
    localStorage.clear();
  });

  test("records a visit and shows another user's visit", async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/dashboard/overview"]}>
          <AuthProvider>
            <DashboardVisitNotifications />
          </AuthProvider>
        </MemoryRouter>
      </StrictMode>
    );

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));
    expect(dashboardVisitRequestCount).toBe(1);

    act(() => {
      FakeWebSocket.instances[0]?.emit(
        "message",
        JSON.stringify({
          payload: {
            ip_address: "203.0.113.15",
            user_id: "user-42",
            username: "alice",
            visit_id: "visit-1",
            visited_at: "2026-09-10T12:30:00Z",
          },
          type: "dashboard_visited",
        })
      );
    });

    const firstBubble = screen.getByRole("status");
    expect(firstBubble.textContent).toContain("203.0.113.15");
    expect(firstBubble.textContent).not.toContain("alice");

    act(() => {
      screen.getByRole("button", { name: "Dismiss dashboard visit" }).click();
    });
    expect(screen.getByRole("status").getAttribute("data-state")).toBe(
      "exiting"
    );
    await act(async () => {
      await new Promise((resolve) => globalThis.setTimeout(resolve, 300));
    });
    expect(screen.queryByRole("status")).toBeNull();

    act(() => {
      FakeWebSocket.instances[0]?.emit(
        "message",
        JSON.stringify({
          payload: {
            ip_address: "203.0.113.15",
            user_id: "user-43",
            username: "bob",
            visit_id: "visit-2",
            visited_at: "2026-09-10T12:31:00Z",
          },
          type: "dashboard_visited",
        })
      );
    });

    expect(screen.getByRole("status").textContent).not.toBe(
      firstBubble.textContent
    );
  });

  test("connects regular users to dashboard visit notifications", async () => {
    localStorage.setItem("auth_token", createToken("USER", "user-1", "user"));

    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/dashboard/overview"]}>
          <AuthProvider>
            <DashboardVisitNotifications />
          </AuthProvider>
        </MemoryRouter>
      </StrictMode>
    );

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));
    expect(dashboardVisitRequestCount).toBe(1);
  });

  test("shows a visit from another local admin session", async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/dashboard/overview"]}>
          <AuthProvider>
            <DashboardVisitNotifications />
          </AuthProvider>
        </MemoryRouter>
      </StrictMode>
    );

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    act(() => {
      FakeWebSocket.instances[0]?.emit(
        "message",
        JSON.stringify({
          payload: {
            ip_address: "127.0.0.1",
            user_id: "admin-1",
            username: "admin",
            visit_id: "visit-2",
            visited_at: "2026-09-10T12:30:00Z",
          },
          type: "dashboard_visited",
        })
      );
    });

    expect(screen.getByRole("status").textContent).toContain("127.0.0.1");
  });

  test("stacks concurrent visitor notices", async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/dashboard/overview"]}>
          <AuthProvider>
            <DashboardVisitNotifications />
          </AuthProvider>
        </MemoryRouter>
      </StrictMode>
    );

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    act(() => {
      const socket = FakeWebSocket.instances[0];
      socket?.emit(
        "message",
        JSON.stringify({
          payload: {
            ip_address: "127.0.0.1",
            user_id: "admin-1",
            username: "admin",
            visit_id: "visit-2",
            visited_at: "2026-09-10T12:30:00Z",
          },
          type: "dashboard_visited",
        })
      );
      socket?.emit(
        "message",
        JSON.stringify({
          payload: {
            ip_address: "203.0.113.15",
            user_id: "user-42",
            username: "alice",
            visit_id: "visit-3",
            visited_at: "2026-09-10T12:30:01Z",
          },
          type: "dashboard_visited",
        })
      );
    });

    const bubbles = screen.getAllByRole("status");
    expect(bubbles).toHaveLength(2);
    expect(bubbles[0]?.textContent).toContain("127.0.0.1");
    expect(bubbles[1]?.textContent).toContain("203.0.113.15");

    act(() => {
      screen.getAllByRole("button")[0]?.click();
    });
    expect(screen.getAllByRole("status")[0]?.getAttribute("data-state")).toBe(
      "exiting"
    );

    await act(async () => {
      await new Promise((resolve) => globalThis.setTimeout(resolve, 300));
    });

    const remainingBubbles = screen.getAllByRole("status");
    expect(remainingBubbles).toHaveLength(1);
    expect(remainingBubbles[0]?.textContent).toContain("203.0.113.15");
  });

  test("does not show the current browser's own visit", async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/dashboard/overview"]}>
          <AuthProvider>
            <DashboardVisitNotifications />
          </AuthProvider>
        </MemoryRouter>
      </StrictMode>
    );

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));

    act(() => {
      FakeWebSocket.instances[0]?.emit(
        "message",
        JSON.stringify({
          payload: {
            ip_address: "127.0.0.1",
            user_id: "admin-1",
            username: "admin",
            visit_id: "visit-current",
            visited_at: "2026-09-10T12:30:00Z",
          },
          type: "dashboard_visited",
        })
      );
    });

    expect(screen.queryByRole("status")).toBeNull();
  });
});
