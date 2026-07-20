import {
  afterEach,
  beforeEach,
  describe,
  expect,
  spyOn,
  test,
  vi,
} from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useSocketBridge } from "@/features/socket-tester/hooks/use-socket-bridge";

type SocketListener = (event: { readonly data?: string }) => void;

class FakeWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static instances: FakeWebSocket[] = [];

  readonly listeners = new Map<string, SocketListener[]>();
  readonly sent: string[] = [];
  readonly url: string;
  readyState = FakeWebSocket.CONNECTING;

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
    this.readyState = FakeWebSocket.OPEN;
    this.emit("open");
  }

  send(message: string) {
    this.sent.push(message);
  }
}

describe("useSocketBridge", () => {
  const originalWebSocket = globalThis.WebSocket;
  let fetchSpy: ReturnType<typeof spyOn>;
  let ticketNumber: number;

  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
    ticketNumber = 0;
    localStorage.clear();
    localStorage.setItem("auth_token", "full-jwt-value");
    globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
    const fetchMock = (() => {
      ticketNumber += 1;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          data: {
            ticket: `socket-ticket-${ticketNumber}`,
            expiresAt: "2026-07-14T00:00:30Z",
          },
        }),
      } as Response);
    }) as unknown as typeof fetch;
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(fetchMock);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    globalThis.WebSocket = originalWebSocket;
    localStorage.clear();
    vi.useRealTimers();
  });

  test("handles lifecycle, commands, malformed frames, metrics, and cleanup", async () => {
    const { result, unmount } = renderHook(() => useSocketBridge());
    await act(async () => {
      vi.advanceTimersByTime(0);
      await Promise.resolve();
      await Promise.resolve();
    });

    const socket = FakeWebSocket.instances[0];
    expect(socket?.url).toContain("ticket=socket-ticket-1");
    expect(socket?.url).not.toContain("full-jwt-value");

    act(() => socket?.open());
    expect(result.current.bridgeStatus).toBe("connected");

    act(() => result.current.connectTcpClient("127.0.0.1", 8080));
    act(() => result.current.startTcpServer(18_090));
    act(() => result.current.startUdpServer(18_091));
    expect(JSON.parse(socket?.sent[0] ?? "{}").type).toBe("tcp_client_connect");
    expect(JSON.parse(socket?.sent[1] ?? "{}").type).toBe("tcp_server_start");
    expect(JSON.parse(socket?.sent[2] ?? "{}").type).toBe("udp_server_start");

    act(() => {
      socket?.emit(
        "message",
        JSON.stringify({ type: "tcp_client_connected", payload: {} })
      );
      socket?.emit("message", "not-json");
      socket?.emit(
        "message",
        JSON.stringify({ type: "tcp_server_started", payload: {} })
      );
      socket?.emit(
        "message",
        JSON.stringify({
          type: "tcp_server_client_connected",
          payload: { clientId: "client-1", address: "127.0.0.1:4000" },
        })
      );
      socket?.emit(
        "message",
        JSON.stringify({ type: "udp_server_started", payload: {} })
      );
      socket?.emit(
        "message",
        JSON.stringify({ type: "udp_sent", payload: { data: "ok" } })
      );
    });

    expect(result.current.tcpClient.connected).toBeTrue();
    expect(result.current.tcpServer.listening).toBeTrue();
    expect(result.current.tcpServer.clients).toHaveLength(1);
    expect(result.current.udpServer.listening).toBeTrue();
    expect(result.current.metrics.activeConnections).toBe(3);
    expect(result.current.metrics.packetsIn).toBe(1);
    expect(result.current.metrics.packetsOut).toBe(1);
    expect(result.current.logs.length).toBeGreaterThanOrEqual(4);

    unmount();
    expect(socket?.readyState).toBe(3);
  });

  test("limits logs and cancels reconnect after manual disconnect", async () => {
    const { result } = renderHook(() => useSocketBridge());
    await act(async () => {
      vi.advanceTimersByTime(0);
      await Promise.resolve();
      await Promise.resolve();
    });
    const socket = FakeWebSocket.instances[0];
    act(() => socket?.open());

    act(() => {
      for (let index = 0; index < 610; index += 1) {
        socket?.emit(
          "message",
          JSON.stringify({ type: "udp_data", payload: { data: String(index) } })
        );
      }
    });
    expect(result.current.logs).toHaveLength(600);

    act(() => socket?.emit("close"));
    act(() => result.current.disconnectBridge());
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });
    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});
