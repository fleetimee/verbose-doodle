import { describe, expect, test } from "bun:test";
import type { RelayStartInput } from "@/features/socks-relay/types";
import {
  buildRelayWebSocketUrl,
  parseRelayEvent,
  truncateMiddle,
  validateRelayStartInput,
} from "@/features/socks-relay/utils";

const VALID_INPUT: RelayStartInput = {
  relayId: "relay-1",
  mode: "REST_API",
  listeningPort: 18_090,
  hostAddress: "127.0.0.1",
  hostPort: 8081,
  holdClient: false,
  holdHost: false,
  dropClient: false,
  dropHost: false,
  removeHeaders: false,
  timerMs: 1000,
};

describe("socks relay validation", () => {
  test("accepts valid relay start input", () => {
    expect(validateRelayStartInput(VALID_INPUT)).toEqual({});
  });

  test("accepts blank relay ID because the backend can generate it", () => {
    expect(
      validateRelayStartInput({
        ...VALID_INPUT,
        relayId: "",
      })
    ).toEqual({});
  });

  test("rejects required host fields, invalid ports, and short timer", () => {
    const errors = validateRelayStartInput({
      ...VALID_INPUT,
      relayId: "",
      listeningPort: 0,
      hostAddress: "",
      hostPort: 70_000,
      timerMs: 999,
    });

    expect(errors.listeningPort).toBeDefined();
    expect(errors.listeningPort).toContain("18090 and 18100");
    expect(errors.hostAddress).toBeDefined();
    expect(errors.hostPort).toBeDefined();
    expect(errors.timerMs).toBeDefined();
  });

  test("rejects multiple hold or drop options", () => {
    const errors = validateRelayStartInput({
      ...VALID_INPUT,
      holdClient: true,
      dropHost: true,
    });

    expect(errors.options).toBeDefined();
  });
});

describe("socks relay events", () => {
  test("parses a valid relay event", () => {
    const event = parseRelayEvent(
      JSON.stringify({
        type: "relay_message",
        payload: {
          relayId: "relay-1",
          mode: "REST_API",
          flow: "RC",
          data: "hello",
          displayLine: "2026-07-03 12:00:00 1200000000 RC hello",
        },
      }),
      "event-1"
    );

    expect(event?.id).toBe("event-1");
    expect(event?.type).toBe("relay_message");
    expect(event?.payload.flow).toBe("RC");
    expect(event?.payload.displayLine).toBe(
      "2026-07-03 12:00:00 1200000000 RC hello"
    );
  });

  test("returns null for malformed events", () => {
    expect(parseRelayEvent("{", "event-1")).toBeNull();
    expect(
      parseRelayEvent(JSON.stringify({ type: "relay_message" }), "event-2")
    ).toBeNull();
  });
});

describe("socks relay formatting", () => {
  test("truncates long relay IDs in the middle", () => {
    expect(truncateMiddle("rest-mr4fof1d-827ad700")).toBe(
      "rest-mr4....827ad700"
    );
  });

  test("keeps short relay IDs unchanged", () => {
    expect(truncateMiddle("relay-1")).toBe("relay-1");
  });
});

describe("socks relay websocket url", () => {
  test("builds a ticketed websocket url without a bearer token", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: new URL("http://localhost:5173/dashboard"),
    });

    expect(buildRelayWebSocketUrl("one-time ticket", "")).toBe(
      "ws://localhost:5173/api/relay/events?ticket=one-time+ticket"
    );
  });
});
