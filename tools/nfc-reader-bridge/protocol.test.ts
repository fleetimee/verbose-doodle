import { describe, expect, test } from "bun:test";
import {
  NFC_BRIDGE_PROTOCOL_VERSION,
  parseBridgeCommand,
  serializeBridgeEvent,
  snapshotToEvents,
} from "./protocol";

describe("NFC bridge protocol", () => {
  test("accepts versioned lifecycle commands", () => {
    expect(
      parseBridgeCommand(
        JSON.stringify({
          protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
          type: "status",
        })
      )
    ).toEqual({
      command: {
        protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
        type: "status",
      },
    });
  });

  test("rejects malformed, unknown, and incompatible commands with actionable errors", () => {
    for (const raw of [
      "not-json",
      JSON.stringify({ type: "status" }),
      JSON.stringify({ protocolVersion: "99", type: "status" }),
      JSON.stringify({ protocolVersion: "1", type: "reset" }),
    ]) {
      const result = parseBridgeCommand(raw);
      expect("error" in result).toBeTrue();
      if ("error" in result) {
        expect(result.error.type).toBe("error");
        expect(result.error.action).toBeTruthy();
      }
    }
  });

  test("serializes a stable bridge and reader status snapshot", () => {
    const events = snapshotToEvents({
      bridge: {
        bridgeVersion: "0.1.0",
        capabilities: ["health", "reader-status"],
        host: "127.0.0.1",
        port: 7788,
        tokenRequired: true,
      },
      reader: {
        readerState: "waiting",
        readerName: "ACS ACR122U 00 00",
      },
    });

    expect(JSON.parse(serializeBridgeEvent(events[0]))).toEqual({
      protocolVersion: "1",
      type: "bridge-status",
      bridgeVersion: "0.1.0",
      capabilities: ["health", "reader-status"],
      host: "127.0.0.1",
      port: 7788,
      tokenRequired: true,
    });
    expect(events[1].type).toBe("reader-status");
  });
});
