import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { TrafficConsole } from "@/features/socket-tester/components/traffic-console";

describe("TrafficConsole", () => {
  test("uses the endpoint-detail terminal dimensions and empty-state layout", () => {
    const { container } = render(
      <TrafficConsole
        logs={[]}
        onClear={() => undefined}
        onInspect={() => undefined}
      />
    );

    const emptyConsole = screen.getByTestId("socket-console-empty");
    expect(emptyConsole.className).toContain("h-[560px]");
    expect(emptyConsole.className).toContain("items-center");
    expect(container.querySelector('[data-slot="scroll-area"]')).toBeNull();

    expect(screen.getByText("simulator@socket")).toBeDefined();
    expect(screen.getByText("tail -f socket.log")).toBeDefined();
  });
});
