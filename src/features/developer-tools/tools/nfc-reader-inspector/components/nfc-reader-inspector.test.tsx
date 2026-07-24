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
});
