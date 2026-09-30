import { describe, expect, spyOn, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
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
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 7 Transmission date / time",
      }).value
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
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Raw stream",
      }).value
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
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 7 Transmission date / time",
      }).value
    ).not.toBe("0901080037");
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 11 System trace audit number",
      }).value
    ).toBe("003646");
    expect(
      screen.getByRole("button", { name: "View raw message" })
    ).toBeDefined();
  });

  test("preserves exact time and STAN when automatic updates are off", async () => {
    const user = userEvent.setup();
    renderGenerator();
    await user.click(
      screen.getByRole("checkbox", {
        name: "Refresh transmission time (Bit 7)",
      })
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Increment STAN (Bit 11)" })
    );
    const time = screen.getByRole("textbox", {
      name: "Bit 7 Transmission date / time",
    });
    const stan = screen.getByRole("textbox", {
      name: "Bit 11 System trace audit number",
    });
    fireEvent.change(time, { target: { value: "0102030405" } });
    fireEvent.change(stan, { target: { value: "123456" } });
    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );
    const first = screen.getByRole<HTMLTextAreaElement>("textbox", {
      name: "Raw stream",
    }).value;
    expect(first).toContain("0102030405123456");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Raw stream",
      }).value
    ).toBe(first);
  });

  test("restores preset drafts and resets only the current preset", async () => {
    const user = userEvent.setup();
    renderGenerator();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Bit 11 System trace audit number" }),
      { target: { value: "123456" } }
    );
    await user.click(screen.getByRole("checkbox", { name: "Enable bit 70" }));
    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "Bit 11 System trace audit number" }),
      { target: { value: "654321" } }
    );
    await user.click(screen.getByRole("tab", { name: "0800 Sign-On" }));
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 11 System trace audit number",
      }).value
    ).toBe("123456");
    expect(
      screen
        .getByRole("checkbox", { name: "Enable bit 70" })
        .getAttribute("aria-checked")
    ).toBe("false");
    await user.click(screen.getByRole("button", { name: "Reset fields" }));
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 11 System trace audit number",
      }).value
    ).toBe("003645");
    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 11 System trace audit number",
      }).value
    ).toBe("654321");
  });

  test("associates packing errors with fields and focuses the invalid input", async () => {
    const user = userEvent.setup();
    renderGenerator();
    const stan = screen.getByRole("textbox", {
      name: "Bit 11 System trace audit number",
    });
    fireEvent.change(stan, { target: { value: "abc" } });
    expect(stan.getAttribute("aria-invalid")).toBe("true");
    expect(
      document.getElementById(stan.getAttribute("aria-describedby") ?? "")
        ?.textContent
    ).toContain("Exactly 6 digits.");
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Generate raw message",
      }).disabled
    ).toBe(true);
    await user.click(
      screen.getByRole("button", { name: "Go to invalid field" })
    );
    expect(document.activeElement).toBe(stan);
    fireEvent.change(stan, { target: { value: "123456" } });
    expect(stan.getAttribute("aria-invalid")).toBeNull();
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Generate raw message",
      }).disabled
    ).toBe(false);
  });

  test("invalidates generated output after adding, removing, and undoing a field", async () => {
    const user = userEvent.setup();
    const messageSpy = spyOn(toast, "message");
    renderGenerator();
    const generateAndClose = async () => {
      await user.click(
        screen.getByRole("button", { name: "Generate raw message" })
      );
      await user.click(screen.getByRole("button", { name: "Close" }));
      expect(
        screen.getByRole("button", { name: "View raw message" })
      ).toBeDefined();
    };
    await generateAndClose();
    await user.click(screen.getByRole("button", { name: "Add field" }));
    await user.click(
      screen.getByRole("button", { name: "Add bit 60 to message" })
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(
      screen.queryByRole("button", { name: "View raw message" })
    ).toBeNull();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Bit 60 Reserved private data" }),
      { target: { value: "TEST" } }
    );
    await generateAndClose();
    await user.click(screen.getByRole("button", { name: "Remove bit 60" }));
    expect(
      screen.queryByRole("button", { name: "View raw message" })
    ).toBeNull();
    // SAFETY: messageSpy option payload includes optional toast action callback
    const undo = (
      messageSpy.mock.calls.at(-1)?.[1] as { action?: { onClick?: () => void } }
    )?.action?.onClick;
    expect(undo).toBeDefined();
    await generateAndClose();
    act(() => undo?.());
    expect(
      screen.queryByRole("button", { name: "View raw message" })
    ).toBeNull();
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 60 Reserved private data",
      }).value
    ).toBe("TEST");
  });

  test("updates the readable amount when its value or currency changes", async () => {
    const user = userEvent.setup();
    renderGenerator();
    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));
    const amount = screen.getByRole("textbox", {
      name: "Bit 4 Amount, transaction",
    });
    fireEvent.change(amount, { target: { value: "000000010000" } });
    expect(
      document.getElementById(amount.getAttribute("aria-describedby") ?? "")
        ?.textContent
    ).toBe("IDR\u00a010,000");
    await user.click(
      screen.getByRole("combobox", {
        name: "Bit 49 Currency code, transaction",
      })
    );
    await user.click(
      screen.getByRole("option", { name: "840 · USD (US Dollar)" })
    );
    expect(
      document.getElementById(amount.getAttribute("aria-describedby") ?? "")
        ?.textContent
    ).toBe("USD\u00a0100.00");
    fireEvent.change(amount, { target: { value: "000000012345" } });
    expect(
      document.getElementById(amount.getAttribute("aria-describedby") ?? "")
        ?.textContent
    ).toBe("USD\u00a0123.45");
    await user.click(screen.getByRole("checkbox", { name: "Enable bit 49" }));
    expect(document.getElementById("iso-field-4-readable")).toBeNull();
  });

  test("filtering and sorting preserve the generated message and field values", async () => {
    const user = userEvent.setup();
    renderGenerator();
    await user.click(
      screen.getByRole("checkbox", {
        name: "Refresh transmission time (Bit 7)",
      })
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Increment STAN (Bit 11)" })
    );
    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );
    const original = screen.getByRole<HTMLTextAreaElement>("textbox", {
      name: "Raw stream",
    }).value;
    await user.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Search fields" }), {
      target: { value: "trace" },
    });
    expect(
      screen.queryByRole("textbox", { name: "Bit 7 Transmission date / time" })
    ).toBeNull();
    expect(
      screen.getByRole("textbox", { name: "Bit 11 System trace audit number" })
    ).toBeDefined();
    await user.click(screen.getByRole("combobox", { name: "Sort by" }));
    await user.click(screen.getByRole("option", { name: "Name: Z to A" }));
    await user.click(
      screen.getByRole("button", { name: "Generate raw message" })
    );
    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Raw stream",
      }).value
    ).toBe(original);
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 7 Transmission date / time",
      }).value
    ).toBe("0901080037");
  });

  test("reveals an invalid field hidden by grouping and filters", async () => {
    const user = userEvent.setup();
    renderGenerator();
    await user.click(screen.getByRole("combobox", { name: "Group by" }));
    await user.click(screen.getByRole("option", { name: "Category" }));
    const stan = screen.getByRole("textbox", {
      name: "Bit 11 System trace audit number",
    });
    fireEvent.change(stan, { target: { value: "bad" } });
    await user.click(
      screen.getByRole("button", {
        name: "Transaction & references 1 Collapse",
      })
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Search fields" }), {
      target: { value: "no matching field" },
    });
    expect(
      screen.queryByRole("textbox", {
        name: "Bit 11 System trace audit number",
      })
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Go to invalid field" })
    );
    const revealed = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Bit 11 System trace audit number",
    });
    expect(document.activeElement).toBe(revealed);
    expect(revealed.value).toBe("bad");
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
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 62 Reserved private data",
      }).disabled
    ).toBe(true);
  });

  test("shows fixed-width fields without invisible padding", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));

    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 41 Card acceptor terminal ID",
      }).value
    ).toBe("TERM0001");
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 43 Card acceptor name / location",
      }).value
    ).toBe("MERCHANT TEST 01          YOGYAKARTA IDN");
  });

  test("shows the Indonesian Bit 43 delimiter layout", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));

    const input = screen.getByRole("textbox", {
      name: "Bit 43 Card acceptor name / location",
    });
    const legend = screen.getByRole("list", { name: "Bit 43 segments" });
    const segmentText = (key: string) =>
      legend.querySelector(`[data-bit43-segment="${key}"]`)?.textContent;

    expect(input.getAttribute("aria-describedby")).toContain(
      "iso-field-43-segments"
    );
    expect(segmentText("merchant-name")).toContain("Merchant name");
    expect(segmentText("merchant-name")).toContain("1–22");
    expect(segmentText("delimiter-1")).toContain("Space delimiter");
    expect(segmentText("delimiter-1")).toContain("23");
    expect(segmentText("city")).toContain("City");
    expect(segmentText("city")).toContain("24–36");
    expect(segmentText("delimiter-2")).toContain("37");
    expect(segmentText("country-code")).toContain("Country code");
    expect(segmentText("country-code")).toContain("38–40");
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
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 12 Local transaction time",
      }).value
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
      screen.getByRole<HTMLTextAreaElement>("textbox", {
        name: "Raw stream",
      }).value
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

  test("adds a situational field from catalog and allows removing it with toast notifications and undo", async () => {
    const successSpy = spyOn(toast, "success");
    const messageSpy = spyOn(toast, "message");
    const infoSpy = spyOn(toast, "info");

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

    // Verify success toast triggered when bit was added
    expect(successSpy).toHaveBeenCalledWith(
      "Bit 60 (Reserved private data) added to message"
    );

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

    // Verify toast notification on removal with Undo action
    expect(messageSpy).toHaveBeenCalledWith(
      "Bit 60 (Reserved private data) removed",
      expect.objectContaining({
        action: expect.objectContaining({
          label: "Undo",
        }),
      })
    );

    // Trigger Undo action and verify Bit 60 is restored
    const lastToastCall = messageSpy.mock.calls.at(-1);
    // SAFETY: messageSpy option payload includes optional toast action callback
    const undoAction = (
      lastToastCall?.[1] as { action?: { onClick?: () => void } }
    )?.action;
    expect(undoAction).toBeDefined();

    act(() => {
      undoAction?.onClick?.();
    });

    expect(
      screen.getByRole("textbox", { name: "Bit 60 Reserved private data" })
    ).toBeDefined();
    expect(infoSpy).toHaveBeenCalledWith(
      "Bit 60 (Reserved private data) restored"
    );
  });

  test("adds and removes a situational field directly from inside the drawer", async () => {
    const successSpy = spyOn(toast, "success");
    const messageSpy = spyOn(toast, "message");

    const user = userEvent.setup();
    renderGenerator();

    // Switch to 0200 Transaction
    await user.click(screen.getByRole("tab", { name: "0200 Transaction" }));

    // Open Add Field drawer
    await user.click(screen.getByRole("button", { name: "Add field" }));

    // Click Add bit 60 to message
    const addBtn = screen.getByRole("button", {
      name: "Add bit 60 to message",
    });
    await user.click(addBtn);

    expect(successSpy).toHaveBeenCalledWith(
      "Bit 60 (Reserved private data) added to message"
    );

    // Verify button in drawer immediately turns into remove button
    const removeDrawerBtn = screen.getByRole("button", {
      name: "Remove bit 60 from message",
    });
    expect(removeDrawerBtn).toBeDefined();

    // Click remove directly from drawer
    await user.click(removeDrawerBtn);

    expect(messageSpy).toHaveBeenCalledWith(
      "Bit 60 (Reserved private data) removed",
      expect.objectContaining({
        action: expect.objectContaining({ label: "Undo" }),
      })
    );

    // Verify button switches back to add in the drawer
    expect(
      screen.getByRole("button", { name: "Add bit 60 to message" })
    ).toBeDefined();

    // Close drawer and verify it is not in the form
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("textbox", { name: BIT_60_PATTERN })).toBeNull();
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
      screen.getByRole<HTMLInputElement>("textbox", {
        name: "Bit 48 Private Data Custom",
      }).value
    ).toBe("TEST48VAL");
  });
});
