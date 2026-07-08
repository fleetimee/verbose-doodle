import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react";
import { SocksRelayProvider } from "@/features/socks-relay/context/socks-relay-context";
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

  close() {
    this.onclose?.();
  }
}

describe("SocksRelayProvider", () => {
  const originalWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    FakeWebSocket.instances = [];
    localStorage.setItem("auth_token", "relay-token");
    window.location.href = "http://localhost/dashboard";
    globalThis.WebSocket =
      FakeWebSocket as unknown as typeof globalThis.WebSocket;
  });

  afterEach(() => {
    localStorage.clear();
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
});
