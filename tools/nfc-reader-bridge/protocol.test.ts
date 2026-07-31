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
        readerName: "ACS ACR122U 00 00",
        readerState: "waiting",
      },
      scanStatus: "stopped",
    });

    expect(JSON.parse(serializeBridgeEvent(events[0]))).toEqual({
      bridgeVersion: "0.1.0",
      capabilities: ["health", "reader-status"],
      host: "127.0.0.1",
      port: 7788,
      protocolVersion: "1",
      tokenRequired: true,
      type: "bridge-status",
    });
    expect(events[1].type).toBe("reader-status");
    expect(events[2]).toMatchObject({
      scanning: false,
      type: "scan-status",
    });
  });

  test("serializes a versioned scan event with raw and decoded fields", () => {
    const [scan] = snapshotToEvents({
      bridge: {
        bridgeVersion: "0.1.0",
        capabilities: ["health", "reader-status", "scan"],
        host: "127.0.0.1",
        port: 7788,
        tokenRequired: true,
      },
      latestScan: {
        decodedText: "Hello",
        decodingStatus: "decoded",
        rawNdef: "D1 01 08 54 02 65 6E 48 65 6C 6C 6F",
        records: [
          {
            id: null,
            idHex: null,
            index: 0,
            payload: "Hello",
            payloadHex: "02 65 6E 48 65 6C 6C 6F",
            raw: "D1 01 08 54 02 65 6E 48 65 6C 6C 6F",
            tnf: 1,
            type: "T",
            typeHex: "54",
          },
        ],
        timestamp: "2026-07-24T12:00:00.000Z",
        uid: "04 AA BB CC",
      },
      reader: { readerState: "tag-detected" },
      scanStatus: "scanning",
    }).slice(3);

    expect(JSON.parse(serializeBridgeEvent(scan))).toEqual({
      decodedText: "Hello",
      decodingStatus: "decoded",
      protocolVersion: "1",
      rawNdef: "D1 01 08 54 02 65 6E 48 65 6C 6C 6F",
      records: [
        {
          id: null,
          idHex: null,
          index: 0,
          payload: "Hello",
          payloadHex: "02 65 6E 48 65 6C 6C 6F",
          raw: "D1 01 08 54 02 65 6E 48 65 6C 6C 6F",
          tnf: 1,
          type: "T",
          typeHex: "54",
        },
      ],
      timestamp: "2026-07-24T12:00:00.000Z",
      type: "scan",
      uid: "04 AA BB CC",
    });
  });
});
