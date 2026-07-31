import { describe, expect, test } from "bun:test";
import {
  FakeReaderAdapter,
  isSupportedReaderName,
  pcscUnavailableStatus,
  readNdefScan,
} from "./reader-adapter";

describe("NFC reader adapter seam", () => {
  test("accepts ACS readers across model names", () => {
    expect(isSupportedReaderName("ACS ACR122U 00 00")).toBe(true);
    expect(isSupportedReaderName("ACS ACR1252U 00 00")).toBe(true);
    expect(isSupportedReaderName("ACS ACR1552U 00 00")).toBe(true);
    expect(isSupportedReaderName("Generic PC/SC Reader 00 00")).toBe(false);
  });

  test("emits deterministic waiting and reader-unavailable states", async () => {
    const waiting = new FakeReaderAdapter();
    const states: string[] = [];
    await waiting.start((status) => states.push(status.readerState));
    expect(states).toEqual(["waiting"]);

    const unavailable = new FakeReaderAdapter(pcscUnavailableStatus);
    await unavailable.start((status) => states.push(status.readerState));
    expect(states.at(-1)).toBe("unavailable");
  });

  test("can drive detected and waiting transitions without hardware", async () => {
    const adapter = new FakeReaderAdapter();
    const states: string[] = [];
    await adapter.start((status) => states.push(status.readerState));
    adapter.setStatus({
      readerName: "ACS ACR122U 00 00",
      readerState: "detected",
    });
    adapter.setStatus({
      readerName: "ACS ACR122U 00 00",
      readerState: "waiting",
      reason: "The ACS reader is ready and waiting for a tag.",
    });
    expect(states).toEqual(["waiting", "detected", "waiting"]);
  });

  test("emits a deterministic scan fixture through the adapter seam", async () => {
    const adapter = new FakeReaderAdapter();
    const scans: string[] = [];
    await adapter.start(
      () => undefined,
      (scan) => {
        scans.push(scan.decodedText ?? scan.rawNdef);
      }
    );
    adapter.setScan({
      decodedText: "Hello",
      decodingStatus: "decoded",
      rawNdef: "D1 01 08 54 02 65 6E 48 65 6C 6C 6F",
      records: [],
      timestamp: "2026-07-24T12:00:00.000Z",
      uid: "04 AA BB CC",
    });
    expect(scans).toEqual(["Hello"]);
  });

  test("reads a Type 2 NDEF text tag through the PC/SC APDU seam", async () => {
    const commands: string[] = [];
    const textMemory = Buffer.from([
      0x00, 0x03, 0x0c, 0xd1, 0x01, 0x08, 0x54, 0x02, 0x65, 0x6e, 0x48, 0x65,
      0x6c, 0x6c, 0x6f, 0xfe,
    ]);
    const reader = {
      close: () => undefined,
      connect: (
        _options: { readonly share_mode: number },
        callback: (error: Error | null, protocol: number) => void
      ) => callback(null, 1),
      disconnect: (
        _disposition: number,
        callback: (error: Error | null) => void
      ) => callback(null),
      name: "ACS ACR1252U 00 00",
      on: () => undefined,
      SCARD_LEAVE_CARD: 0,
      SCARD_PROTOCOL_T0: 1,
      SCARD_PROTOCOL_T1: 2,
      SCARD_SHARE_SHARED: 2,
      SCARD_STATE_PRESENT: 1,
      state: 1,
      transmit: (
        input: Buffer,
        _responseLength: number,
        _protocol: number,
        callback: (error: Error | null, output: Buffer) => void
      ) => {
        const command = input.toString("hex");
        commands.push(command);
        if (command === "ffca000000") {
          callback(null, Buffer.from([0x04, 0xaa, 0xbb, 0xcc, 0x90, 0x00]));
          return;
        }
        if (command === "ffb0000410") {
          callback(
            null,
            Buffer.concat([textMemory, Buffer.from([0x90, 0x00])])
          );
          return;
        }
        callback(new Error(`Unexpected APDU: ${command}`), Buffer.alloc(0));
      },
    } as Parameters<typeof readNdefScan>[0];

    const scan = await readNdefScan(reader);

    expect(scan.decodedText).toBe("Hello");
    expect(scan.uid).toBe("04 AA BB CC");
    expect(commands).toEqual(["ffca000000", "ffb0000410"]);
  });
});
