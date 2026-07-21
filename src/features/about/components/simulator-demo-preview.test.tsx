import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { SimulatorDemoPreview } from "./simulator-demo-preview";

describe("SimulatorDemoPreview component", () => {
  test("renders interactive demo tabs and switches views", async () => {
    render(<SimulatorDemoPreview locale="en-US" />);

    expect(screen.getByText("Interactive Simulator Preview")).toBeDefined();
    expect(screen.getByText("/api/v1/biller/inquiry")).toBeDefined();

    // Click Socket Bridge tab
    const socketTab = screen.getByRole("button", { name: /Socket Bridge/i });
    fireEvent.click(socketTab);
    expect(await screen.findByText(/SocketBridgeEngine \[TCP: 8080\]/i)).toBeDefined();

    // Click Dev Tools tab
    const devToolsTab = screen.getByRole("button", { name: /Dev Tools/i });
    fireEvent.click(devToolsTab);
    expect(await screen.findByText("YAML Output")).toBeDefined();
  });
});
