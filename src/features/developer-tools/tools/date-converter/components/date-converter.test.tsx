import { afterEach, describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TourProvider } from "@/components/tour";
import { DateConverter } from "@/features/developer-tools/tools/date-converter/components/date-converter";

const originalFetch = globalThis.fetch;
const originalDateNow = Date.now;
const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard"
);

afterEach(() => {
  globalThis.fetch = originalFetch;
  Date.now = originalDateNow;
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
  localStorage.clear();
});

function renderConverter() {
  localStorage.setItem("date-converter-tour-seen", "true");
  localStorage.setItem("date-converter-timezone", '"UTC"');
  return render(
    <TourProvider closeable>
      <DateConverter />
    </TourProvider>
  );
}

describe("DateConverter", () => {
  test("converts the ISO example into timestamps and date standards", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("button", { name: "Convert" }));

    expect(
      screen.getByRole("region", { name: "Unix seconds output" }).textContent
    ).toContain("1704067200");
    expect(
      screen.getByRole("region", { name: "Unix milliseconds output" })
        .textContent
    ).toContain("1704067200000");
    expect(
      screen.getByRole("region", { name: "ISO 8601 output" }).textContent
    ).toContain("2024-01-01T00:00:00.000Z");
    expect(screen.getByText("2024-01-01 00:00:00.000 GMT+00:00")).toBeDefined();
  });

  test("updates the selected timezone and recalculates the result", async () => {
    const user = userEvent.setup();
    renderConverter();
    await user.click(screen.getByRole("button", { name: "Convert" }));

    await user.click(
      screen.getByRole("combobox", { name: "Display timezone" })
    );
    await user.type(
      await screen.findByPlaceholderText("Search timezones..."),
      "Asia/Jakarta"
    );
    await user.click(await screen.findByText("Asia/Jakarta"));

    expect(screen.getByText("2024-01-01 07:00:00.000 GMT+07:00")).toBeDefined();
    expect(localStorage.getItem("date-converter-timezone")).toBe(
      '"Asia/Jakarta"'
    );
  });

  test("clears stale results when conversion fails", async () => {
    const user = userEvent.setup();
    renderConverter();
    const input = screen.getByRole("textbox", { name: "Date or timestamp" });

    await user.click(screen.getByRole("button", { name: "Convert" }));
    await user.clear(input);
    await user.type(input, "not a date");
    await user.click(screen.getByRole("button", { name: "Convert" }));

    expect(await screen.findByRole("alert")).toBeDefined();
    expect(
      screen.queryByRole("region", { name: "ISO 8601 output" })
    ).toBeNull();
  });

  test("uses the current instant and copies without making a request", async () => {
    Date.now = () => 1_704_067_200_123;
    const user = userEvent.setup();
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const fetchMock = mock(async () => new Response());
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    renderConverter();
    fetchMock.mockClear();

    await user.click(screen.getByRole("button", { name: "Use current time" }));
    fireEvent.keyDown(window, { key: "Enter", metaKey: true });
    expect(fetchMock).not.toHaveBeenCalled();
    const copyButton = screen.getByRole("button", { name: "Copy ISO 8601" });
    expect(
      copyButton.querySelector('[data-icon="clipboard-copy"]')
    ).not.toBeNull();

    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith("2024-01-01T00:00:00.123Z");
    expect(copyButton.querySelector('[data-icon="check"]')).not.toBeNull();
  });

  test("keeps its guided-tour targets after clearing", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      document.getElementById("date-converter-tour-results")
    ).not.toBeNull();
    expect(
      document.getElementById("date-converter-tour-timezone")
    ).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Start tour" }));
    expect(await screen.findByText("Choose the input format")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Compare canonical formats")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      await screen.findByText("Move the instant across zones")
    ).toBeDefined();
  });
});
