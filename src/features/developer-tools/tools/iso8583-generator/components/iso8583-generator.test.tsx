import { afterEach, describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Iso8583Generator } from "@/features/developer-tools/tools/iso8583-generator/components/iso8583-generator";

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard"
);

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
});

function renderGenerator() {
  return render(<Iso8583Generator />);
}

describe("Iso8583Generator", () => {
  test("shows the simple three-message workflow", () => {
    renderGenerator();

    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByRole("tab", { name: "0800 Sign-On" })).toBeDefined();
    expect(screen.getByRole("tab", { name: "0200 Transaction" })).toBeDefined();
    expect(
      screen.getByRole("tab", { name: "0220 Notification" })
    ).toBeDefined();
    expect(
      screen.getByRole("combobox", { name: "More messages" })
    ).toBeDefined();
    expect(screen.queryByRole("textbox", { name: "Raw stream" })).toBeNull();
  });

  test("loads additional request and response MTIs from one menu", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("combobox", { name: "More messages" }));
    expect(await screen.findAllByRole("option")).toHaveLength(6);
    await user.click(
      screen.getByRole("option", { name: "0210 · Transaction Response" })
    );

    expect(
      screen.getByRole("heading", { name: "Transaction Response message" })
    ).toBeDefined();
    expect(
      screen.getByRole("textbox", { name: "Bit 39 Response code" })
    ).toBeDefined();
  });

  test("explains a field without adding permanent form copy", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("button", { name: "Explain bit 7" }));

    expect(
      screen.getByRole("heading", {
        name: "Bit 7: Transmission date / time",
      })
    ).toBeDefined();
    expect(screen.getByText("Exactly 10 digits.")).toBeDefined();
    expect(
      screen.getByText(
        "The date and time the message enters the network, formatted as MMDDhhmmss."
      )
    ).toBeDefined();
  });

  test("refreshes transmission time and STAN when generating", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );
    expect(screen.getByRole("dialog", { name: "Raw message" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(
      (
        screen.getByRole("textbox", {
          name: "Bit 7 Transmission date / time",
        }) as HTMLInputElement
      ).value
    ).not.toBe("0901080037");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Bit 11 System trace audit number",
        }) as HTMLInputElement
      ).value
    ).toBe("003646");
    expect(
      screen.getByRole("button", { name: "View raw message" })
    ).toBeDefined();
  });

  test("offers bit 62 as an optional transaction field", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));

    expect(
      screen
        .getByRole("checkbox", { name: "Enable bit 62" })
        .getAttribute("aria-checked")
    ).toBe("false");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Bit 62 Reserved private data",
        }) as HTMLInputElement
      ).disabled
    ).toBe(true);
  });

  test("uses a field-aware time picker for ISO time values", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));
    await user.click(
      screen.getByRole("button", { name: "Pick value for bit 12" })
    );
    fireEvent.change(screen.getByLabelText("Time"), {
      target: { value: "14:25:30" },
    });

    expect(
      (
        screen.getByRole("textbox", {
          name: "Bit 12 Local transaction time",
        }) as HTMLInputElement
      ).value
    ).toBe("142530");
    expect(
      screen.getByRole("button", { name: "Pick value for bit 13" })
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Pick value for bit 14" })
    ).toBeDefined();
  });

  test("switches to the notification form", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("tab", { name: "0220 Notification" }));

    expect(
      screen.getByRole("heading", { name: "Notification message" })
    ).toBeDefined();
    expect(
      screen.getByRole("textbox", { name: "Bit 39 Response code" })
    ).toBeDefined();
  });

  test("updates the bitmap when a bit is disabled", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("checkbox", { name: "Enable bit 70" }));
    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );

    expect(screen.getByText("0220000080000000")).toBeDefined();
  });

  test("copies the generated stream", async () => {
    const user = userEvent.setup();
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderGenerator();

    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );
    const generatedValue = (
      screen.getByRole("textbox", { name: "Raw stream" }) as HTMLTextAreaElement
    ).value;
    await user.click(screen.getByRole("tab", { name: "Raw Stream" }));
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith(generatedValue);
  });

  test("copies the formatted JSON message by default", async () => {
    const user = userEvent.setup();
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderGenerator();

    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalled();
    const copiedText = (writeText.mock.calls[0] as [string])[0];
    expect(copiedText).toContain('"mti": "0800"');
    expect(copiedText).toContain('"bitmap"');
  });
});
