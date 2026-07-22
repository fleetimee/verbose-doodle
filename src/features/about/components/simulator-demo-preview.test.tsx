import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimulatorDemoPreview } from "@/features/about/components/simulator-demo-preview";

const apiEndpointsPattern = /API Endpoints/i;
const devToolsPattern = /Dev Tools/i;
const socketBridgePattern = /Socket Bridge/i;
const socketEnginePattern = /SocketBridgeEngine \[TCP: 8080\]/i;

describe("SimulatorDemoPreview component", () => {
  test("renders interactive demo tabs and switches views", async () => {
    render(<SimulatorDemoPreview locale="en-US" />);

    expect(screen.getByText("Interactive Simulator Preview")).toBeDefined();
    expect(screen.getByText("/api/v1/biller/inquiry")).toBeDefined();

    // Click Socket Bridge tab
    const socketTab = screen.getByRole("button", {
      name: socketBridgePattern,
    });
    fireEvent.click(socketTab);
    expect(await screen.findByText(socketEnginePattern)).toBeDefined();

    // Click Dev Tools tab
    const devToolsTab = screen.getByRole("button", { name: devToolsPattern });
    fireEvent.click(devToolsTab);
    expect(await screen.findByText("YAML Output")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: apiEndpointsPattern }));
    expect(await screen.findByText("/api/v1/biller/inquiry")).toBeDefined();
  });

  test("shows and clears the endpoint simulation state", async () => {
    const user = userEvent.setup();
    render(<SimulatorDemoPreview locale="en-US" />);

    await user.click(screen.getByRole("button", { name: "Test Endpoint" }));
    expect(screen.getByRole("button", { name: "Simulating..." })).toBeDefined();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });
    expect(screen.getByRole("button", { name: "Test Endpoint" })).toBeDefined();
  });
});
