import { afterEach, describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TourProvider } from "@/components/tour";
import { CronParser } from "@/features/cron-parser/components/cron-parser";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  localStorage.clear();
});

function renderCronParser() {
  localStorage.setItem("cron-parser-timezone", '"UTC"');
  localStorage.setItem("cron-parser-tour-seen", "true");
  return render(
    <TourProvider closeable>
      <CronParser />
    </TourProvider>
  );
}

describe("CronParser", () => {
  test("explains the example and shows its fields and next five runs", async () => {
    const user = userEvent.setup();
    const { container } = renderCronParser();

    await user.click(screen.getByRole("button", { name: "Parse" }));

    expect(screen.getByText("Every 15 minutes")).toBeDefined();
    expect(screen.getByText("Minute")).toBeDefined();
    expect(screen.queryByText("Second")).toBeNull();
    expect(container.querySelectorAll("time")).toHaveLength(5);
  });

  test("supports leading seconds and clears stale results after an error", async () => {
    const user = userEvent.setup();
    const { container } = renderCronParser();
    const input = screen.getByRole("textbox", { name: "Cron expression" });

    await user.clear(input);
    await user.type(input, "30 */10 * * * *");
    await user.click(screen.getByRole("button", { name: "Parse" }));
    expect(screen.getByText("Second")).toBeDefined();
    expect(container.querySelectorAll("time")).toHaveLength(5);

    await user.clear(input);
    await user.type(input, "0 0 L * *");
    await user.click(screen.getByRole("button", { name: "Parse" }));
    expect(await screen.findByRole("alert")).toBeDefined();
    expect(screen.queryByText("Upcoming executions")).toBeNull();
    expect(container.querySelectorAll("time")).toHaveLength(0);
  });

  test("parses with the keyboard shortcut without making a request", () => {
    const fetchMock = mock(async () => new Response());
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const { container } = renderCronParser();
    fetchMock.mockClear();

    fireEvent.keyDown(window, { key: "Enter", metaKey: true });

    expect(container.querySelectorAll("time")).toHaveLength(5);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("clears the expression and restores the example", async () => {
    const user = userEvent.setup();
    renderCronParser();
    const input = screen.getByRole("textbox", { name: "Cron expression" });

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect((input as HTMLInputElement).value).toBe("");

    await user.click(screen.getByRole("button", { name: "Reset example" }));
    expect((input as HTMLInputElement).value).toBe("*/15 * * * *");
  });

  test("falls back from an invalid saved timezone", async () => {
    localStorage.setItem("cron-parser-timezone", '"Mars/Olympus_Mons"');
    localStorage.setItem("cron-parser-tour-seen", "true");
    render(
      <TourProvider closeable>
        <CronParser />
      </TourProvider>
    );

    const expectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(
      screen.getByRole("combobox", { name: "Timezone" }).textContent
    ).toContain(expectedTimeZone);
    await waitFor(() =>
      expect(localStorage.getItem("cron-parser-timezone")).toBe(
        JSON.stringify(expectedTimeZone)
      )
    );
  });

  test("keeps a valid saved timezone that is absent from enumeration", () => {
    const customTimeZone = "US/Eastern";
    expect(Intl.supportedValuesOf("timeZone")).not.toContain(customTimeZone);
    localStorage.setItem(
      "cron-parser-timezone",
      JSON.stringify(customTimeZone)
    );
    localStorage.setItem("cron-parser-tour-seen", "true");
    render(
      <TourProvider closeable>
        <CronParser />
      </TourProvider>
    );

    expect(
      screen.getByRole("combobox", { name: "Timezone" }).textContent
    ).toContain(customTimeZone);
    expect(localStorage.getItem("cron-parser-timezone")).toBe(
      JSON.stringify(customTimeZone)
    );
  });

  test("persists a selected timezone and recalculates a parsed result", async () => {
    const user = userEvent.setup();
    const { container } = renderCronParser();
    await user.click(screen.getByRole("button", { name: "Parse" }));
    const firstRunBefore = container.querySelector("time")?.textContent;

    await user.click(screen.getByRole("combobox", { name: "Timezone" }));
    await user.type(
      await screen.findByPlaceholderText("Search timezones..."),
      "Asia/Jakarta"
    );
    await user.click(await screen.findByText("Asia/Jakarta"));

    expect(localStorage.getItem("cron-parser-timezone")).toBe('"Asia/Jakarta"');
    expect(container.querySelector("time")?.textContent).not.toBe(
      firstRunBefore
    );
  });

  test("walks through controls, fields, and upcoming runs", async () => {
    const user = userEvent.setup();
    renderCronParser();
    await user.click(screen.getByRole("button", { name: "Parse" }));
    await user.click(screen.getByRole("button", { name: "Start tour" }));

    expect(await screen.findByText("Set the schedule context")).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      await screen.findByText("Check how each field was read")
    ).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Verify the actual dates")).toBeDefined();
  });
});
