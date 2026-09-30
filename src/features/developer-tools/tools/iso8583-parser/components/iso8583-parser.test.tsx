import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Iso8583Parser } from "./iso8583-parser";

const BIT_7_ACTIVE_PATTERN = /Bit 7 is active/;
const ASSIGN_BUTTON_PATTERN = /Assign to Generator/i;

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Iso8583Parser component", () => {
  test("renders the parsed message overview", () => {
    renderWithRouter(<Iso8583Parser />);

    expect(
      screen.getByRole("heading", { name: "ISO 8583 Parser" })
    ).toBeTruthy();
    expect(screen.getAllByText("0800").length).toBeGreaterThan(0);
  });

  test("renders parsed elements for default sample stream", () => {
    renderWithRouter(<Iso8583Parser />);

    // Should display active data elements
    expect(screen.getByText("BIT 07")).toBeTruthy();
    expect(screen.getByText("BIT 11")).toBeTruthy();
    expect(screen.getByText("BIT 33")).toBeTruthy();
    expect(screen.getByText("BIT 70")).toBeTruthy();
    expect(screen.getByText("Sign-On")).toBeTruthy();
  });

  test("renders interactive bitmap matrix with active bits", () => {
    renderWithRouter(<Iso8583Parser />);

    expect(screen.getByText("Interactive Bitmap Matrix")).toBeTruthy();
    expect(screen.getByTitle(BIT_7_ACTIVE_PATTERN)).toBeTruthy();
  });

  test("pretty print keeps lengths beside values without padding to the longest field", () => {
    renderWithRouter(<Iso8583Parser />);
    fireEvent.click(screen.getByRole("tab", { name: "Pretty print" }));
    const output =
      screen.getByLabelText("Pretty print").querySelector("pre")?.textContent ??
      "";
    expect(output).toContain("[007] : '0901080037'");
    expect(output).toContain("[070] : '001'");
    const rows = output.split("\n").slice(1);
    expect(rows[0]).toBe("[007] : '0901080037'  (10)");
    expect(rows.at(-1)).toBe("[070] : '001'  (3)");
    expect(rows[0]).toEndWith("(10)");
    expect(rows.at(-1)).toEndWith("(3)");
  });

  test("renders Assign to Generator button", () => {
    renderWithRouter(<Iso8583Parser />);

    const assignButtons = screen.getAllByRole("button", {
      name: ASSIGN_BUTTON_PATTERN,
    });
    expect(assignButtons.length).toBeGreaterThanOrEqual(1);
  });
});
