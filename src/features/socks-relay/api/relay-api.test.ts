import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  listRelayLogs,
  listRelays,
  startRelay,
  stopRelay,
  updateRelayOptions,
} from "@/features/socks-relay/api/relay-api";
import type {
  RelayInstance,
  RelayStartInput,
} from "@/features/socks-relay/types";

const relay: RelayInstance = {
  hostAddress: "127.0.0.1",
  hostPort: 8081,
  listeningPort: 8080,
  mode: "REST_API",
  options: {
    dropClient: false,
    dropHost: false,
    holdClient: false,
    holdHost: false,
    removeHeaders: false,
    timerMs: 1000,
  },
  relayId: "relay-1",
  running: true,
};

const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
}

function getFetchMock() {
  return globalThis.fetch as unknown as ReturnType<typeof mock>;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("relay api", () => {
  test("lists saved relay logs", async () => {
    const logs = [
      {
        id: 1,
        occurredAt: "2026-01-01T00:00:00Z",
        payload: {},
        type: "relay_started",
      },
    ];
    globalThis.fetch = mock(() =>
      Promise.resolve(jsonResponse({ data: { logs } }))
    ) as unknown as typeof fetch;

    await expect(listRelayLogs()).resolves.toEqual(logs);
    expect(getFetchMock()).toHaveBeenCalledWith(
      "/api/relay/logs",
      expect.objectContaining({ method: "GET" })
    );
  });

  test("lists relays from /api/relay", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(jsonResponse({ data: { relays: [relay] } }))
    ) as unknown as typeof fetch;

    await expect(listRelays()).resolves.toEqual([relay]);
    expect(getFetchMock()).toHaveBeenCalledWith(
      "/api/relay",
      expect.objectContaining({ method: "GET" })
    );
  });

  test("starts a relay with fixed mode payload", async () => {
    const input: RelayStartInput = {
      ...relay.options,
      hostAddress: "10.0.0.5",
      hostPort: 9091,
      listeningPort: 9090,
      mode: "ISO_8583",
      relayId: "relay-1",
    };
    globalThis.fetch = mock(() =>
      Promise.resolve(jsonResponse({ data: { relay } }))
    ) as unknown as typeof fetch;

    await startRelay(input);

    expect(getFetchMock()).toHaveBeenCalledWith(
      "/api/relay/start",
      expect.objectContaining({
        body: JSON.stringify(input),
        method: "POST",
      })
    );
  });

  test("passes blank relay ID through for backend generation", async () => {
    const input: RelayStartInput = {
      ...relay.options,
      hostAddress: "10.0.0.5",
      hostPort: 9091,
      listeningPort: 9090,
      mode: "REST_API",
      relayId: "",
    };
    globalThis.fetch = mock(() =>
      Promise.resolve(jsonResponse({ data: { relay } }))
    ) as unknown as typeof fetch;

    await startRelay(input);

    expect(getFetchMock()).toHaveBeenCalledWith(
      "/api/relay/start",
      expect.objectContaining({
        body: JSON.stringify(input),
        method: "POST",
      })
    );
  });

  test("stops a relay using encoded relay id", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(jsonResponse({ data: { relay } }))
    ) as unknown as typeof fetch;

    await stopRelay("relay/main");

    expect(getFetchMock()).toHaveBeenCalledWith(
      "/api/relay/relay%2Fmain/stop",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("updates relay options through patch endpoint", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(jsonResponse({ data: { relay } }))
    ) as unknown as typeof fetch;

    await updateRelayOptions({
      options: { ...relay.options, holdClient: true },
      relayId: "relay-1",
    });

    expect(getFetchMock()).toHaveBeenCalledWith(
      "/api/relay/relay-1/options",
      expect.objectContaining({
        body: JSON.stringify({ ...relay.options, holdClient: true }),
        method: "PATCH",
      })
    );
  });
});
