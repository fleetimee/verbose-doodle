import { describe, expect, test } from "bun:test";
import {
  extractNdefMessage,
  type NdefScanResult,
  parseNdefMessage,
} from "./ndef";

const textRecord = Uint8Array.from([
  0xd1, 0x01, 0x08, 0x54, 0x02, 0x65, 0x6e, 0x48, 0x65, 0x6c, 0x6c, 0x6f,
]);

describe("NDEF inspection fixture", () => {
  test("extracts a Type 2 NDEF TLV and decodes a text record", () => {
    const memory = Uint8Array.from([0x00, 0x03, 0x0c, ...textRecord, 0xfe]);

    expect(extractNdefMessage(memory)).toEqual(textRecord);
    expect(
      parseNdefMessage(textRecord, {
        timestamp: "2026-07-24T12:00:00.000Z",
        uid: Uint8Array.from([0x04, 0xaa, 0xbb, 0xcc]),
      })
    ).toEqual<NdefScanResult>({
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
    });
  });

  test("preserves raw NDEF data when no text record is available", () => {
    const uriRecord = Uint8Array.from([
      0xd1, 0x01, 0x07, 0x55, 0x01, 0x6f, 0x70, 0x65, 0x6e, 0x61, 0x69,
    ]);

    expect(parseNdefMessage(uriRecord)).toMatchObject({
      decodingStatus: "no-text",
      rawNdef: "D1 01 07 55 01 6F 70 65 6E 61 69",
      records: [
        {
          payload: null,
          payloadHex: "01 6F 70 65 6E 61 69",
          type: "U",
        },
      ],
    });
  });

  test("returns an actionable malformed result for truncated records", () => {
    expect(parseNdefMessage(Uint8Array.from([0xd1, 0x01]))).toEqual({
      decodingStatus: "malformed",
      rawNdef: "D1 01",
      records: [],
      timestamp: expect.any(String),
      warning: "The NDEF message contains a truncated payload length.",
    });
  });
});
