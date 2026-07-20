import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimulationForm } from "@/features/endpoints/forms/simulation-form";

describe("SimulationForm", () => {
  test("updates the delay value without replacing the preview", async () => {
    const user = userEvent.setup();

    render(<SimulationForm onSubmit={mock(() => {})} />);

    await user.click(screen.getByText("Latency Simulation"));

    const delayInput = await screen.findByLabelText("Custom Delay");
    await user.type(delayInput, "1");

    const preview = await screen.findByText("Preview");
    const previewContainer = preview.parentElement;

    await user.type(delayInput, "2");

    expect(screen.getByText("12ms")).toBeDefined();
    expect(screen.getByText("Preview").parentElement).toBe(previewContainer);
  });
});
