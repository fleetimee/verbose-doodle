import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { ArchitectureDiagram } from "@/features/about/components/architecture-diagram";

const frontendDescription =
  "Single-page application built with React 19, TypeScript, and TanStack Query. Communicates with the backend via REST API and WebSocket bridge for real-time protocol simulation.";
const idlePromptPattern = /Hover or focus a node to explore/;

describe("ArchitectureDiagram", () => {
  test("reveals node details through pointer and keyboard interactions", async () => {
    render(<ArchitectureDiagram />);

    const diagramNode = screen.getByLabelText(
      "React Frontend: Vite + TanStack Query"
    );
    const legendNode = screen.getByRole("button", { name: "React Frontend" });

    fireEvent.mouseEnter(diagramNode);
    expect(await screen.findByText(frontendDescription)).toBeDefined();
    fireEvent.mouseLeave(diagramNode);

    fireEvent.focus(diagramNode);
    expect(await screen.findByText(frontendDescription)).toBeDefined();
    fireEvent.blur(diagramNode);

    fireEvent.mouseEnter(legendNode);
    expect(await screen.findByText(frontendDescription)).toBeDefined();
    fireEvent.mouseLeave(legendNode);

    fireEvent.focus(legendNode);
    expect(await screen.findByText(frontendDescription)).toBeDefined();
    fireEvent.blur(legendNode);

    fireEvent.click(legendNode);
    expect(await screen.findByText(frontendDescription)).toBeDefined();
    fireEvent.click(legendNode);
    expect(await screen.findByText(idlePromptPattern)).toBeDefined();
  });
});
