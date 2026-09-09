import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Iso8583Generator } from "./iso8583-generator";

const RAW_STREAM_0800_PATTERN =
  /^0060080082200000800000000400000000000000\d{10}00364603112001$/;
const RAW_STREAM_DISABLED_70_PATTERN =
  /^004108000220000080000000\d{10}00364603112$/;
const BIT_60_PATTERN = /Bit 60/i;
const CONFIGURE_CUSTOM_BIT_PATTERN = /configure custom bit/i;
const BIT_NUMBER_LABEL_PATTERN = /bit number/i;
const FIELD_NAME_LABEL_PATTERN = /field name/i;
const INITIAL_VALUE_LABEL_PATTERN = /initial value/i;
const ADD_BIT_48_PATTERN = /add bit 48 to message/i;

function renderGenerator() {
  return render(<Iso8583Generator />);
}

describe("Iso8583Generator", () => {
  test("renders 0800 as the default message", () => {
    renderGenerator();

    expect(
      screen.getByRole("heading", { name: "Sign-On message" })
    ).toBeDefined();
    expect(
      (
        screen.getByRole("textbox", {
          name: "Bit 7 Transmission date / time",
        }) as HTMLInputElement
      ).value
    ).toBe("0901080037");
    expect(
      screen.getByRole("combobox", {
        name: "Bit 70 Network management information code",
      })
    ).toBeDefined();
  });

  test("generates and parses raw ISO 8583 message on submit", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );

    expect(screen.getByRole("dialog", { name: "Raw message" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Raw message" })).toBeDefined();
    expect(
      (
        screen.getByRole("textbox", {
          name: "Raw stream",
        }) as HTMLTextAreaElement
      ).value
    ).toMatch(RAW_STREAM_0800_PATTERN);
    expect(
      screen.getByRole("heading", { name: "Bitmap Inspector" })
    ).toBeDefined();
  });

  test("keeps raw preview hidden until generated", () => {
    renderGenerator();

    expect(screen.queryByRole("dialog", { name: "Raw message" })).toBeNull();
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
      screen.getByRole("combobox", { name: "Bit 39 Response code" })
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

  test("shows fixed-width fields without invisible padding", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));

    expect(
      (
        screen.getByRole("textbox", {
          name: "Bit 41 Card acceptor terminal ID",
        }) as HTMLInputElement
      ).value
    ).toBe("TERM0001");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Bit 43 Card acceptor name / location",
        }) as HTMLInputElement
      ).value
    ).toBe("MERCHANT TEST 01          YOGYAKARTA IDN");
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
      screen.getByRole("combobox", { name: "Bit 39 Response code" })
    ).toBeDefined();
  });

  test("updates the bitmap when a bit is disabled", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("checkbox", { name: "Enable bit 70" }));
    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );

    expect(
      (
        screen.getByRole("textbox", {
          name: "Raw stream",
        }) as HTMLTextAreaElement
      ).value
    ).toMatch(RAW_STREAM_DISABLED_70_PATTERN);
  });

  test("copies the generated stream", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );
    await user.click(screen.getByRole("button", { name: "Copy raw string" }));

    expect(await navigator.clipboard.readText()).toMatch(
      RAW_STREAM_0800_PATTERN
    );
  });

  test("adds a situational field from catalog and allows removing it", async () => {
    const user = userEvent.setup();
    renderGenerator();

    // Switch to 0200 Transaction
    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));

    // Verify Bit 60 is not in the form initially
    expect(screen.queryByRole("textbox", { name: BIT_60_PATTERN })).toBeNull();

    // Open Add Field drawer
    await user.click(screen.getByRole("button", { name: "Add field" }));

    // Find and click the Add button for Bit 60 in the situational catalog
    const addBit60Btn = screen.getByRole("button", {
      name: "Add bit 60 to message",
    });
    await user.click(addBit60Btn);

    // Close the drawer
    await user.click(screen.getByRole("button", { name: "Close" }));

    // Verify Bit 60 is now present and enabled in the form
    expect(
      screen.getByRole("textbox", { name: "Bit 60 Reserved private data" })
    ).toBeDefined();

    // Verify remove button exists and remove it
    const removeBtn = screen.getByRole("button", { name: "Remove bit 60" });
    await user.click(removeBtn);

    // Verify Bit 60 is removed
    expect(
      screen.queryByRole("textbox", { name: "Bit 60 Reserved private data" })
    ).toBeNull();
  });

  test("adds a custom bit with custom specifications via nested drawer", async () => {
    const user = userEvent.setup();
    renderGenerator();

    // Switch to 0200 Transaction
    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));

    // Open Add Field drawer
    await user.click(screen.getByRole("button", { name: "Add field" }));

    // Click "Configure Custom Bit" button to open the nested drawer
    await user.click(
      screen.getByRole("button", { name: CONFIGURE_CUSTOM_BIT_PATTERN })
    );

    // Fill the custom field form in the nested drawer
    const bitInput = screen.getByLabelText(BIT_NUMBER_LABEL_PATTERN);
    await user.clear(bitInput);
    await user.type(bitInput, "48");

    const nameInput = screen.getByLabelText(FIELD_NAME_LABEL_PATTERN);
    await user.clear(nameInput);
    await user.type(nameInput, "Private Data Custom");

    const valInput = screen.getByLabelText(INITIAL_VALUE_LABEL_PATTERN);
    await user.type(valInput, "TEST48VAL");

    // Submit custom field form
    await user.click(screen.getByRole("button", { name: ADD_BIT_48_PATTERN }));

    // Verify Bit 48 now exists in the main form
    expect(
      screen.getByRole("textbox", { name: "Bit 48 Private Data Custom" })
    ).toBeDefined();
    expect(
      (
        screen.getByRole("textbox", {
          name: "Bit 48 Private Data Custom",
        }) as HTMLInputElement
      ).value
    ).toBe("TEST48VAL");
  });
});
