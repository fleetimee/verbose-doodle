import { afterEach, describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { NfcReaderInspector } from "@/features/developer-tools/tools/nfc-reader-inspector/components/nfc-reader-inspector";
import type { NfcBridgeState } from "@/features/developer-tools/tools/nfc-reader-inspector/types";

let bridge = {
  action: null as string | null,
  bridgeVersion: null as string | null,
  capabilities: [] as readonly string[],
  connect: mock(() => undefined),
  connectionStatus: "disconnected" as NfcBridgeState["connectionStatus"],
  disconnect: mock(() => undefined),
  error: null as string | null,
  latestScan: null as NfcBridgeState["latestScan"],
  readerName: null as string | null,
  readerState: "unavailable" as NfcBridgeState["readerState"],
  reason: null as string | null,
  refresh: mock(() => undefined),
};

mock.module(
  "@/features/developer-tools/tools/nfc-reader-inspector/hooks/use-nfc-bridge",
  () => ({
    useNfcBridge: () => bridge,
  })
);

afterEach(() => {
  bridge = {
    action: null,
    bridgeVersion: null,
    capabilities: [],
    connect: mock(() => undefined),
    connectionStatus: "disconnected",
    disconnect: mock(() => undefined),
    error: null,
    latestScan: null,
    readerName: null,
    readerState: "unavailable",
    reason: null,
    refresh: mock(() => undefined),
  };
});

describe("NFC Reader Inspector", () => {
  test("shows disconnected and unavailable setup state with a connect action", () => {
    render(<NfcReaderInspector />);

    expect(
      screen.getByRole("heading", { name: "NFC Reader Inspector" })
    ).toBeDefined();
    expect(screen.getAllByText("Disconnected")).toHaveLength(2);
    expect(screen.getAllByText("Reader unavailable")).toHaveLength(2);
    screen.getByRole("button", { name: "Connect bridge" }).click();
    expect(bridge.connect).toHaveBeenCalledTimes(1);
  });

  test("shows a connected bridge and waiting ACS reader state with disconnect action", () => {
    bridge = {
      ...bridge,
      bridgeVersion: "0.1.0",
      connectionStatus: "connected",
      readerName: "ACS ACR1252U 00 00",
      readerState: "waiting",
    };
    render(<NfcReaderInspector />);

    expect(screen.getAllByText("Connected")).toHaveLength(2);
    expect(screen.getAllByText("Waiting for tag")).toHaveLength(2);
    expect(screen.getByText("ACS ACR1252U 00 00")).toBeDefined();
    screen.getByRole("button", { name: "Disconnect" }).click();
    expect(bridge.disconnect).toHaveBeenCalledTimes(1);
  });

  test("renders decoded text, raw NDEF, and UID independently", () => {
    bridge = {
      ...bridge,
      bridgeVersion: "0.1.0",
      connectionStatus: "connected",
      latestScan: {
        decodingStatus: "decoded",
        decodedText: "Hello",
        rawNdef: "D1 01 08 54 02 65 6E 48 65 6C 6C 6F",
        records: [
          {
            id: "text",
            idHex: "74 65 78 74",
            index: 0,
            payload: "Hello",
            payloadHex: "02 65 6E 48 65 6C 6C 6F",
            raw: "D1 01 08 54 02 65 6E 48 65 6C 6C 6F",
            tnf: 1,
            type: "T",
            typeHex: "54",
          },
          {
            id: null,
            idHex: null,
            index: 1,
            payload: null,
            payloadHex: "01 6F 70 65 6E 61 69",
            raw: "51 01 07 55 01 6F 70 65 6E 61 69",
            tnf: 1,
            type: "U",
            typeHex: "55",
          },
        ],
        timestamp: "2026-07-24T12:00:00.000Z",
        uid: "04 AA BB CC",
      },
      readerName: "ACS ACR1252U 00 00",
      readerState: "tag-detected",
    };
    render(<NfcReaderInspector />);

    expect(screen.getAllByText("Hello")).toHaveLength(2);
    expect(
      screen.getAllByText("D1 01 08 54 02 65 6E 48 65 6C 6C 6F")
    ).toHaveLength(2);
    expect(screen.getByText("04 AA BB CC")).toBeDefined();
    expect(screen.getByText("Record 1")).toBeDefined();
    expect(screen.getByText("Record 2")).toBeDefined();
    expect(screen.getByText("74 65 78 74")).toBeDefined();
    expect(screen.getByText("No decoded payload")).toBeDefined();
    expect(screen.getByText("01 6F 70 65 6E 61 69")).toBeDefined();
  });

  test("renders explicit status and raw fallback for non-text scans", () => {
    const scans = [
      {
        decodingStatus: "no-text" as const,
        rawNdef: "51 01 07 55 01 6F 70 65 6E 61 69",
        records: [
          {
            id: null,
            idHex: null,
            index: 0,
            payload: null,
            payloadHex: "01 6F 70 65 6E 61 69",
            raw: "51 01 07 55 01 6F 70 65 6E 61 69",
            tnf: 1,
            type: "U",
            typeHex: "55",
          },
        ],
        timestamp: "2026-07-24T12:00:00.000Z",
      },
      {
        decodingStatus: "unsupported" as const,
        rawNdef: "D4 03 02 61 62 63 01 02",
        records: [
          {
            id: null,
            idHex: null,
            index: 0,
            payload: null,
            payloadHex: "01 02",
            raw: "D4 03 02 61 62 63 01 02",
            tnf: 4,
            type: "abc",
            typeHex: "61 62 63",
          },
        ],
        timestamp: "2026-07-24T12:00:00.000Z",
        warning: "Raw data is preserved.",
      },
      {
        decodingStatus: "malformed" as const,
        rawNdef: "D1 01",
        records: [
          {
            id: null,
            idHex: null,
            index: 0,
            payload: null,
            payloadHex: "D1 01",
            raw: "D1 01",
            tnf: 0,
            type: "Unparsed record",
            typeHex: "",
          },
        ],
        timestamp: "2026-07-24T12:00:00.000Z",
        warning: "The record is malformed.",
      },
    ];

    const statusLabels = [
      "No text record",
      "Unsupported record",
      "Malformed record",
    ];
    for (const [index, scan] of scans.entries()) {
      bridge = {
        ...bridge,
        connectionStatus: "connected",
        latestScan: scan,
        readerState: "tag-detected",
      };
      const view = render(<NfcReaderInspector />);
      expect(screen.getByText(statusLabels[index] ?? "")).toBeDefined();
      expect(screen.getByText("No decoded payload")).toBeDefined();
      expect(screen.getAllByText(scan.rawNdef).length).toBeGreaterThan(1);
      view.unmount();
    }
  });
});
