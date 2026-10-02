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

test("renders QR preview and opens enlarged QR dialog with download buttons", async () => {
  render(
    <MemoryRouter>
      <CpmParser />
    </MemoryRouter>
  );
  const qrButton = screen.getByRole("button", { name: "View larger QR code" });
  expect(qrButton).toBeTruthy();
  fireEvent.click(qrButton);
  expect(
    await screen.findByRole("button", { name: "Download PNG" })
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Download SVG" })).toBeTruthy();
});

test("copies summary fields and decoded values when copy button is clicked", async () => {
  let copiedText = "";
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: (text: string) => {
        copiedText = text;
        return Promise.resolve();
      },
    },
  });

  render(
    <MemoryRouter>
      <CpmParser />
    </MemoryRouter>
  );

  const copyCpanButton = screen.getByRole("button", { name: "Copy CPAN" });
  expect(copyCpanButton).toBeTruthy();
  fireEvent.click(copyCpanButton);
  expect(await screen.findByRole("button", { name: "Copy CPAN" })).toBeTruthy();
  expect(copiedText).toBe("9360011210006580709");
});
