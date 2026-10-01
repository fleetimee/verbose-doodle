import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { CpmParser } from "@/features/developer-tools/tools/qris-cpm-parser/components/cpm-parser";
import { CPM_SAMPLE_HEX } from "@/features/developer-tools/tools/qris-cpm-parser/parse-cpm";

test("updates fields when encoding changes and removes stale output on errors or clear", () => {
  render(
    <MemoryRouter>
      <CpmParser />
    </MemoryRouter>
  );
  expect(screen.getAllByText("9360011210006580709")[0]).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Hex" }));
  expect(screen.getByRole("alert")).toBeTruthy();
  expect(screen.queryByText("9360011210006580709")).toBeNull();
  fireEvent.change(screen.getByLabelText("CPM payload"), {
    target: { value: CPM_SAMPLE_HEX },
  });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getAllByText("9360011210006580709")[0]).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(screen.queryByText("9360011210006580709")).toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("opens tag help without collapsing its template", async () => {
  render(
    <MemoryRouter>
      <CpmParser />
    </MemoryRouter>
  );
  const trigger = screen.getByRole("button", { name: "About tag 61" });
  const template = trigger.closest("li")?.querySelector("details");
  expect(template?.open).toBe(true);
  fireEvent.click(trigger);
  expect(
    await screen.findByText(
      "Groups the fields for a payment application. Its value contains child TLV tags, which this parser decodes recursively."
    )
  ).toBeTruthy();
  expect(template?.open).toBe(true);
});
