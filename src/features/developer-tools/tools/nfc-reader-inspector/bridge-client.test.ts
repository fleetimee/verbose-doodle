import { describe, expect, test, vi } from "bun:test";
import {
  createNfcBridgeUrl,
  NFC_WEBSOCKET_OPEN,
  NfcBridgeClient,
  type NfcWebSocket,
  parseNfcBridgeEvent,
} from "@/features/developer-tools/tools/nfc-reader-inspector/bridge-client";

class FakeWebSocket implements NfcWebSocket {
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { readonly data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  readonly sent: string[] = [];
  readonly url: string;
  readyState = 0;

  constructor(url: string) {
    this.url = url;
  }

  close(): void {
    this.readyState = 3;
    this.onclose?.();
  }

  send(data: string): void {
    this.sent.push(data);
  }

  open(): void {
    this.readyState = NFC_WEBSOCKET_OPEN;
    this.onopen?.();
  }

  receive(data: string): void {
    this.onmessage?.({ data });
  }
}

describe("NFC bridge browser client", () => {
  test("adds the configured token without changing the loopback endpoint", () => {
    expect(createNfcBridgeUrl("ws://127.0.0.1:7788/ws", "secret")).toBe(
      "ws://127.0.0.1:7788/ws?token=secret"
    );
  });

  test("connects, requests status, and renders waiting reader health", () => {
    let socket: FakeWebSocket | undefined;
    const client = new NfcBridgeClient("ws://127.0.0.1:7788/ws", (url) => {
      socket = new FakeWebSocket(url);
      return socket;
    });

    client.connect();
    expect(client.getState().connectionStatus).toBe("connecting");
    socket?.open();
    expect(client.getState().connectionStatus).toBe("connected");
    expect(JSON.parse(socket?.sent[0] ?? "{}")).toEqual({
      protocolVersion: "1",
      type: "status",
    });
    socket?.receive(
      JSON.stringify({
        bridgeVersion: "0.1.0",
        capabilities: ["health", "reader-status"],
        host: "127.0.0.1",
        port: 7788,
        protocolVersion: "1",
        tokenRequired: true,
        type: "bridge-status",
      })
    );
    socket?.receive(
      JSON.stringify({
        protocolVersion: "1",
        readerName: "ACS ACR122U 00 00",
        readerState: "waiting",
        type: "reader-status",
      })
    );
    expect(client.getState().readerState).toBe("waiting");
    expect(client.getState().readerName).toBe("ACS ACR122U 00 00");
  });

  test("shows actionable bridge errors and disconnects cleanly", () => {
    let socket: FakeWebSocket | undefined;
    const client = new NfcBridgeClient("ws://127.0.0.1:7788/ws", (url) => {
      socket = new FakeWebSocket(url);
      return socket;
    });
    client.connect();
    socket?.open();
    socket?.receive(
      JSON.stringify({
        action: "Start the bridge and retry.",
        code: "reader-unavailable",
        message: "No ACS reader detected.",
        protocolVersion: "1",
        type: "error",
      })
    );
    expect(client.getState().connectionStatus).toBe("error");
    expect(client.getState().error).toBe("No ACS reader detected.");
    expect(client.getState().action).toBe("Start the bridge and retry.");
    client.disconnect();
    expect(client.getState().connectionStatus).toBe("disconnected");
  });

  test("controls the scan session and clears the latest scan locally", () => {
    let socket: FakeWebSocket | undefined;
    const client = new NfcBridgeClient("ws://127.0.0.1:7788/ws", (url) => {
      socket = new FakeWebSocket(url);
      return socket;
    });

    client.connect();
    socket?.open();
    expect(client.startScan()).toBe(true);
    expect(JSON.parse(socket?.sent.at(-1) ?? "{}")).toEqual({
      protocolVersion: "1",
      type: "start-scan",
    });
    socket?.receive(
      JSON.stringify({
        protocolVersion: "1",
        scanning: true,
        type: "scan-status",
      })
    );
    expect(client.getState().scanStatus).toBe("scanning");
    client.clearScan();
    expect(client.getState().latestScan).toBeNull();
    client.stopScan();
    expect(client.getState().scanStatus).toBe("stopped");
  });

  test("reconnects after an interruption and resumes the scan intent", () => {
    vi.useFakeTimers();
    try {
      const sockets: FakeWebSocket[] = [];
      const client = new NfcBridgeClient("ws://127.0.0.1:7788/ws", (url) => {
        const socket = new FakeWebSocket(url);
        sockets.push(socket);
        return socket;
      });

      client.connect();
      sockets[0]?.open();
      client.startScan();
      sockets[0]?.close();
      expect(client.getState().connectionStatus).toBe("reconnecting");

      vi.advanceTimersByTime(1000);
      expect(sockets).toHaveLength(2);
      sockets[1]?.open();
      expect(client.getState().connectionStatus).toBe("connected");
      expect(JSON.parse(sockets[1]?.sent.at(-1) ?? "{}")).toEqual({
        protocolVersion: "1",
        type: "start-scan",
      });
    } finally {
      vi.useRealTimers();
    }
  });

  test("stores the latest versioned scan with decoded text, raw NDEF, and UID", () => {
    let socket: FakeWebSocket | undefined;
    const client = new NfcBridgeClient("ws://127.0.0.1:7788/ws", (url) => {
      socket = new FakeWebSocket(url);
      return socket;
    });

    client.connect();
    socket?.open();
    socket?.receive(
      JSON.stringify({
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
      })
    );

    expect(client.getState().readerState).toBe("tag-detected");
    expect(client.getState().latestScan).toEqual({
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

  test("rejects malformed and unknown bridge events", () => {
    expect(parseNfcBridgeEvent("not-json")).toEqual({
      error: "The bridge sent malformed JSON.",
    });
    expect(
      parseNfcBridgeEvent(
        JSON.stringify({ protocolVersion: "1", type: "future" })
      )
    ).toEqual({ error: "The bridge sent an unknown event: future." });
  });
});
