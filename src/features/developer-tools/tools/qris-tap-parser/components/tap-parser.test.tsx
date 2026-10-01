import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QrisTapParserPage } from "@/pages/dashboard/qris-tap-parser";

test("the separate TAP page decodes generic constructed tags and clears stale results", () => {
  render(
    <MemoryRouter>
      <QrisTapParserPage />
    </MemoryRouter>
  );
  expect(screen.getByRole("heading", { name: "QRIS TAP parser" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "About tag 61" })).toBeTruthy();
  expect(screen.getAllByText("Novian Andika")[0]).toBeTruthy();
  fireEvent.change(screen.getByLabelText("TAP payload"), {
    target: { value: "e103500241" },
  });
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(screen.getByText("E103500241")).toBeTruthy();
  expect(screen.getByText("Parsing failed")).toBeTruthy();
  expect(screen.getByText("Decoded HEX")).toBeTruthy();
  expect(screen.getByText("Execution log")).toBeTruthy();
  expect(screen.queryByText("Novian Andika")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(screen.queryByRole("alert")).toBeNull();
});
