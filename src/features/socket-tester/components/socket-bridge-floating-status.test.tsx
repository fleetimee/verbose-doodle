import { afterEach, describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SocketBridgeStatus } from "@/features/socket-tester/components/socket-bridge-floating-status";
import type { BridgeStatus } from "@/features/socket-tester/types";

const TARGET_CONNECTION_EXPLANATION =
  /does not mean you are connected to a target TCP server/;

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

describe("SocketBridgeStatus", () => {
  test("shows each bridge status and only pings while connected", () => {
    const { container, rerender } = render(<SocketBridgeStatus />);

    expect(screen.getByRole("status").className).not.toContain("fixed");
    expect(container.querySelector('[class*="animate-ping"]')).toBeNull();

    bridge.bridgeStatus = "connecting";
    rerender(<SocketBridgeStatus />);
    expect(screen.getByText("connecting")).toBeDefined();
    expect(container.querySelector('[class*="animate-ping"]')).toBeNull();

    bridge.bridgeStatus = "connected";
    rerender(<SocketBridgeStatus />);
    expect(screen.getByText("connected")).toBeDefined();
    expect(container.querySelector('[class*="animate-ping"]')).not.toBeNull();
  });

  test("explains what the bridge connection represents", async () => {
    const user = userEvent.setup();
    render(<SocketBridgeStatus />);

    await user.click(
      screen.getByRole("button", { name: "What is the socket bridge?" })
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Socket bridge")).toBeDefined();
    expect(screen.getByText(TARGET_CONNECTION_EXPLANATION)).toBeDefined();
  });

  test("transitions the action and preserves its bridge command", () => {
    const { rerender } = render(<SocketBridgeStatus />);

    screen.getByRole("button", { name: "On" }).click();
    expect(bridge.connectBridge).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "On" }).parentElement?.parentElement
        ?.className
    ).toContain("w-11");

    bridge.bridgeAutoConnect = true;
    rerender(<SocketBridgeStatus />);
    screen.getByRole("button", { name: "Off" }).click();
    expect(bridge.disconnectBridge).toHaveBeenCalledTimes(1);
  });
});
