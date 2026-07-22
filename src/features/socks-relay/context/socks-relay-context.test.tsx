import {
  afterEach,
  beforeEach,
  describe,
  expect,
  spyOn,
  test,
  vi,
} from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, StrictMode } from "react";
import {
  SocksRelayProvider,
  useSocksRelayContext,
} from "@/features/socks-relay/context/socks-relay-context";
import { socksRelayQueryKeys } from "@/features/socks-relay/query-keys";

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];

  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((message: { readonly data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  readonly url: string;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  addEventListener(
    type: string,
    listener: (event?: { readonly data: string }) => void
  ) {
    if (type === "close") {
      this.onclose = listener as () => void;
    } else if (type === "error") {
      this.onerror = listener as () => void;
    } else if (type === "message") {
      this.onmessage = listener as (message: { readonly data: string }) => void;
    } else if (type === "open") {
      this.onopen = listener as () => void;
    }
  }

  close() {
    this.onclose?.();
  }
}

describe("SocksRelayProvider", () => {
  const originalWebSocket = globalThis.WebSocket;
  let fetchSpy: ReturnType<typeof spyOn>;
  let ticketNumber: number;

  beforeEach(() => {
    FakeWebSocket.instances = [];
    ticketNumber = 0;
    localStorage.setItem("auth_token", "relay-token");
    window.location.href = "http://localhost/dashboard";
    globalThis.WebSocket =
      FakeWebSocket as unknown as typeof globalThis.WebSocket;
    const fetchMock = (() => {
      ticketNumber += 1;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          data: {
            ticket: `ticket-${ticketNumber}`,
            expiresAt: "2026-07-14T00:00:30Z",
          },
        }),
      } as Response);
    }) as unknown as typeof fetch;
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(fetchMock);
  });

  afterEach(() => {
    localStorage.clear();
    fetchSpy.mockRestore();
    vi.useRealTimers();
    globalThis.WebSocket = originalWebSocket;
  });

  test("invalidates the relay list when a lifecycle event arrives", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = spyOn(queryClient, "invalidateQueries");

    render(
      <QueryClientProvider client={queryClient}>
        <SocksRelayProvider>
          <div />
        </SocksRelayProvider>
      </QueryClientProvider>
    );

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));
    expect(FakeWebSocket.instances[0]?.url).toContain("ticket=ticket-1");
    expect(FakeWebSocket.instances[0]?.url).not.toContain("relay-token");

    act(() => {
      FakeWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: "relay_started",
          payload: {
            relayId: "relay-smoke-18096",
            mode: "REST_API",
            listeningPort: 18_096,
          },
        }),
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: socksRelayQueryKeys.all,
    });
  });

  test("mints a fresh ticket before reconnecting", async () => {
    vi.useFakeTimers();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SocksRelayProvider>
          <div />
        </SocksRelayProvider>
      </QueryClientProvider>
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(FakeWebSocket.instances).toHaveLength(1);

    act(() => {
      FakeWebSocket.instances[0]?.onclose?.();
    });
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(FakeWebSocket.instances).toHaveLength(2);
    expect(FakeWebSocket.instances[1]?.url).toContain("ticket=ticket-2");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test("retains parsed events and counts malformed frames", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <SocksRelayProvider>{children}</SocksRelayProvider>
      </QueryClientProvider>
    );
    const { result } = renderHook(() => useSocksRelayContext(), { wrapper });

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));
    act(() => {
      FakeWebSocket.instances[0]?.onmessage?.({ data: "{" });
      for (let index = 0; index <= 1000; index += 1) {
        FakeWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({
            type: "relay_message",
            payload: { relayId: `relay-${index}`, mode: "REST_API" },
          }),
        });
      }
    });

    expect(result.current.malformedEventCount).toBe(1);
    expect(result.current.events).toHaveLength(1000);
    expect(result.current.events[0]?.payload.relayId).toBe("relay-1");
  });

  test("discards a ticket minted by a superseded StrictMode effect", async () => {
    let resolveFirstTicket: ((response: Response) => void) | undefined;
    const deferredFetch = (() =>
      new Promise<Response>((resolve) => {
        resolveFirstTicket = resolve;
      })) as unknown as typeof fetch;
    const currentFetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          data: {
            ticket: "current-ticket",
            expiresAt: "2026-07-14T00:00:30Z",
          },
        }),
      } as Response)) as unknown as typeof fetch;
    fetchSpy.mockImplementationOnce(deferredFetch);
    fetchSpy.mockImplementationOnce(currentFetch);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <SocksRelayProvider>
            <div />
          </SocksRelayProvider>
        </QueryClientProvider>
      </StrictMode>
    );

    await waitFor(() => expect(FakeWebSocket.instances).toHaveLength(1));
    expect(FakeWebSocket.instances[0]?.url).toContain("current-ticket");

    await act(async () => {
      resolveFirstTicket?.({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          data: {
            ticket: "stale-ticket",
            expiresAt: "2026-07-14T00:00:30Z",
          },
        }),
      } as Response);
      await Promise.resolve();
    });

    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});
