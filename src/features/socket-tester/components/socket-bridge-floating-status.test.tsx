import { afterEach, describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { SocketBridgeStatus } from "@/features/socket-tester/components/socket-bridge-floating-status";
import type { BridgeStatus } from "@/features/socket-tester/types";

let bridge = {
  bridgeAutoConnect: false,
  bridgeStatus: "disconnected" as BridgeStatus,
  connectBridge: mock(() => undefined),
  disconnectBridge: mock(() => undefined),
};

mock.module("@/features/socket-tester/context/socket-bridge-context", () => ({
  useOptionalSocketBridgeContext: () => bridge,
}));

afterEach(() => {
  bridge = {
    bridgeAutoConnect: false,
    bridgeStatus: "disconnected",
    connectBridge: mock(() => undefined),
    disconnectBridge: mock(() => undefined),
  };
});

describe("SocketBridgeStatus", () => {
  test("connects and disconnects the bridge", () => {
    const { rerender } = render(<SocketBridgeStatus />);

    screen.getByRole("button", { name: "On" }).click();
    expect(bridge.connectBridge).toHaveBeenCalledTimes(1);

    bridge.bridgeAutoConnect = true;
    rerender(<SocketBridgeStatus />);
    screen.getByRole("button", { name: "Off" }).click();
    expect(bridge.disconnectBridge).toHaveBeenCalledTimes(1);
  });
});
