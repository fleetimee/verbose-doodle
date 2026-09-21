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
let fetchMock: ReturnType<typeof mock>;

function setFetchMock(handler: () => Promise<Response>) {
  fetchMock = mock(handler);
  // SAFETY: Test mock fulfills fetch without Bun-specific preconnect
  globalThis.fetch = fetchMock as never;
  return fetchMock;
}

function jsonResponse<T>(body: T): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status: 200,
  });
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
    setFetchMock(async () => jsonResponse({ data: { logs } }));

    await expect(listRelayLogs()).resolves.toEqual(logs);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/relay/logs",
      expect.objectContaining({ method: "GET" })
    );
  });

  test("lists relays from /api/relay", async () => {
    setFetchMock(async () => jsonResponse({ data: { relays: [relay] } }));

    await expect(listRelays()).resolves.toEqual([relay]);
    expect(fetchMock).toHaveBeenCalledWith(
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
    setFetchMock(async () => jsonResponse({ data: { relay } }));

    await startRelay(input);

    expect(fetchMock).toHaveBeenCalledWith(
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
    setFetchMock(async () => jsonResponse({ data: { relay } }));

    await startRelay(input);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/relay/start",
      expect.objectContaining({
        body: JSON.stringify(input),
        method: "POST",
      })
    );
  });

  test("stops a relay using encoded relay id", async () => {
    setFetchMock(async () => jsonResponse({ data: { relay } }));

    await stopRelay("relay/main");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/relay/relay%2Fmain/stop",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("updates relay options through patch endpoint", async () => {
    setFetchMock(async () => jsonResponse({ data: { relay } }));

    await updateRelayOptions({
      options: { ...relay.options, holdClient: true },
      relayId: "relay-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/relay/relay-1/options",
      expect.objectContaining({
        body: JSON.stringify({ ...relay.options, holdClient: true }),
        method: "PATCH",
      })
    );
  });
});
