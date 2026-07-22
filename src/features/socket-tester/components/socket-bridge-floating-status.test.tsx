import { afterEach, describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { SocketBridgeFloatingStatus } from "@/features/socket-tester/components/socket-bridge-floating-status";
import type { BridgeStatus } from "@/features/socket-tester/types";

let bridge = {
  bridgeAutoConnect: false,
  bridgeStatus: "disconnected" as BridgeStatus,
  connectBridge: mock(() => undefined),
  disconnectBridge: mock(() => undefined),
};

mock.module("@/features/socket-tester/context/socket-bridge-context", () => ({
  useSocketBridgeContext: () => bridge,
}));

afterEach(() => {
  bridge = {
    bridgeAutoConnect: false,
    bridgeStatus: "disconnected",
    connectBridge: mock(() => undefined),
    disconnectBridge: mock(() => undefined),
  };
});

describe("SocketBridgeFloatingStatus", () => {
  test("shows each bridge status and only pings while connected", () => {
    const { container, rerender } = render(<SocketBridgeFloatingStatus />);

    expect(screen.getByText("disconnected").parentElement?.className).toContain(
      "w-[12ch]"
    );
    expect(container.querySelector('[class*="animate-ping"]')).toBeNull();

    bridge.bridgeStatus = "connecting";
    rerender(<SocketBridgeFloatingStatus />);
    expect(screen.getByText("connecting")).toBeDefined();
    expect(container.querySelector('[class*="animate-ping"]')).toBeNull();

    bridge.bridgeStatus = "connected";
    rerender(<SocketBridgeFloatingStatus />);
    expect(screen.getByText("connected")).toBeDefined();
    expect(container.querySelector('[class*="animate-ping"]')).not.toBeNull();
  });

  test("transitions the action and preserves its bridge command", () => {
    const { rerender } = render(<SocketBridgeFloatingStatus />);

    screen.getByRole("button", { name: "On" }).click();
    expect(bridge.connectBridge).toHaveBeenCalledTimes(1);

    bridge.bridgeAutoConnect = true;
    rerender(<SocketBridgeFloatingStatus />);
    screen.getByRole("button", { name: "Off" }).click();
    expect(bridge.disconnectBridge).toHaveBeenCalledTimes(1);
  });
});
