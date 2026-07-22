import { afterEach, beforeEach, describe, expect, test, vi } from "bun:test";
import {
  createFakeRealtimeSocketAdapter,
  createTicketedRealtimeConnection,
} from "@/features/realtime/ticketed-realtime-connection";

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe("ticketed realtime connection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("acquires a fresh ticket for every connection attempt", async () => {
    const socketAdapter = createFakeRealtimeSocketAdapter();
    let ticketNumber = 0;
    const connection = createTicketedRealtimeConnection({
      acquireTicket: async () => ({
        ticket: `ticket-${++ticketNumber}`,
      }),
      path: "/api/socket-test",
      socketAdapter,
    });

    await connection.connect();
    expect(socketAdapter.sockets[0]?.url).toContain("ticket=ticket-1");

    socketAdapter.sockets[0]?.open();
    socketAdapter.sockets[0]?.close();
    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(socketAdapter.sockets[1]?.url).toContain("ticket=ticket-2");
    expect(ticketNumber).toBe(2);

    connection.dispose();
  });

  test("uses the capped reconnect schedule", async () => {
    const socketAdapter = createFakeRealtimeSocketAdapter();
    const connection = createTicketedRealtimeConnection({
      acquireTicket: async () => ({ ticket: "one-time-ticket" }),
      path: "/api/socket-test",
      socketAdapter,
    });

    await connection.connect();

    for (const delay of [1000, 2000, 4000, 8000, 15_000]) {
      const previousSocketCount = socketAdapter.sockets.length;
      socketAdapter.sockets.at(-1)?.fail();
      vi.advanceTimersByTime(delay - 1);
      expect(socketAdapter.sockets).toHaveLength(previousSocketCount);
      vi.advanceTimersByTime(1);
      await flushPromises();
      expect(socketAdapter.sockets).toHaveLength(previousSocketCount + 1);
    }

    socketAdapter.sockets.at(-1)?.fail();
    vi.advanceTimersByTime(15_000);
    await flushPromises();
    expect(socketAdapter.sockets).toHaveLength(7);

    connection.dispose();
  });

  test("disposes a pending ticket attempt without creating a socket", async () => {
    const socketAdapter = createFakeRealtimeSocketAdapter();
    let resolveTicket = (_ticket: { readonly ticket: string }): void =>
      undefined;
    const connection = createTicketedRealtimeConnection({
      acquireTicket: () =>
        new Promise((resolve) => {
          resolveTicket = resolve;
        }),
      path: "/api/socket-test",
      socketAdapter,
    });

    const pendingConnection = connection.connect();
    connection.dispose();
    resolveTicket({ ticket: "stale-ticket" });
    await pendingConnection;

    expect(socketAdapter.sockets).toHaveLength(0);
    expect(connection.getSnapshot().status).toBe("disconnected");
  });

  test("disposes an active socket and prevents reconnects", async () => {
    const socketAdapter = createFakeRealtimeSocketAdapter();
    const connection = createTicketedRealtimeConnection({
      acquireTicket: async () => ({ ticket: "ticket-1" }),
      path: "/api/socket-test",
      socketAdapter,
    });

    await connection.connect();
    const socket = socketAdapter.sockets[0];
    socket?.open();
    connection.dispose();
    vi.advanceTimersByTime(60_000);

    expect(socket?.readyState).toBe(3);
    expect(socketAdapter.sockets).toHaveLength(1);
    expect(connection.getSnapshot().status).toBe("disconnected");
  });

  test("retries after ticket acquisition fails", async () => {
    const socketAdapter = createFakeRealtimeSocketAdapter();
    let ticketNumber = 0;
    const connection = createTicketedRealtimeConnection({
      acquireTicket: () => {
        ticketNumber += 1;
        if (ticketNumber === 1) {
          return Promise.reject(new Error("ticket unavailable"));
        }
        return Promise.resolve({ ticket: `ticket-${ticketNumber}` });
      },
      path: "/api/socket-test",
      socketAdapter,
    });

    await connection.connect();
    expect(connection.getSnapshot().status).toBe("reconnecting");

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(socketAdapter.sockets).toHaveLength(1);
    expect(ticketNumber).toBe(2);
    connection.dispose();
  });

  test("does not create a socket for a malformed URL", async () => {
    const socketAdapter = createFakeRealtimeSocketAdapter();
    const connection = createTicketedRealtimeConnection({
      acquireTicket: async () => ({ ticket: "ticket-1" }),
      configuredUrl: "ftp://invalid-websocket-host",
      path: "/api/socket-test",
      socketAdapter,
    });

    await connection.connect();

    expect(socketAdapter.sockets).toHaveLength(0);
    expect(connection.getSnapshot().status).toBe("reconnecting");
    connection.dispose();
  });

  test("manual disconnect cancels reconnects and closes the socket", async () => {
    const socketAdapter = createFakeRealtimeSocketAdapter();
    const connection = createTicketedRealtimeConnection({
      acquireTicket: async () => ({ ticket: "ticket-1" }),
      path: "/api/socket-test",
      socketAdapter,
    });

    await connection.connect();
    const socket = socketAdapter.sockets[0];
    socket?.open();
    socket?.close();
    connection.disconnect();
    vi.advanceTimersByTime(60_000);

    expect(socket?.readyState).toBe(3);
    expect(socketAdapter.sockets).toHaveLength(1);
    expect(connection.getSnapshot().status).toBe("disconnected");
    connection.dispose();
  });

  test("sends through an open socket and notifies subscribers", async () => {
    const socketAdapter = createFakeRealtimeSocketAdapter();
    const connection = createTicketedRealtimeConnection({
      acquireTicket: async () => ({ ticket: "ticket-1" }),
      path: "/api/socket-test",
      socketAdapter,
    });
    const snapshots: string[] = [];
    const unsubscribe = connection.subscribe((snapshot) => {
      snapshots.push(snapshot.status);
    });

    expect(connection.send("before-open")).toBeFalse();
    await connection.connect();
    const socket = socketAdapter.sockets[0];
    socket?.open();

    expect(connection.send("hello")).toBeTrue();
    expect(socket?.sent).toEqual(["hello"]);

    unsubscribe();
    connection.dispose();
    expect(snapshots).toContain("connected");
  });
});
