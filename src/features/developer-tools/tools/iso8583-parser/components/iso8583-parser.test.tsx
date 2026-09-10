import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Iso8583Parser } from "./iso8583-parser";

const BIT_7_ACTIVE_PATTERN = /Bit 7 is active/;
const ASSIGN_BUTTON_PATTERN = /Assign to Generator/i;

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("Iso8583Parser component", () => {
  test("renders tool layout with title and badge", () => {
    renderWithRouter(<Iso8583Parser />);

    expect(
      screen.getByRole("heading", { name: "ISO 8583 Parser" })
    ).toBeTruthy();
    expect(screen.getByText("ISO 8583:1987 / ASCII")).toBeTruthy();
    expect(screen.getByText("Message Type (MTI)")).toBeTruthy();
    expect(screen.getByText("0800")).toBeTruthy();
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

  test("renders Assign to Generator button", () => {
    renderWithRouter(<Iso8583Parser />);

    const assignButtons = screen.getAllByRole("button", {
      name: ASSIGN_BUTTON_PATTERN,
    });
    expect(assignButtons.length).toBeGreaterThanOrEqual(1);
  });
});
