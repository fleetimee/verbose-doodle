import { afterEach, describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { QrisMdrCalculator } from "./qris-mdr-calculator";

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

function renderCalculator() {
  return render(
    <MemoryRouter>
      <QrisMdrCalculator />
    </MemoryRouter>
  );
}

const NET_107K_REGEX = /107\.568/;
const TOTAL_432_REGEX = /432/;
const SWITCH_104_REGEX = /104/;
const ISSUER_134_REGEX = /134/;
const ACQUIRER_194_REGEX = /194/;
const NET_199K_REGEX = /199\.200/;
const TOTAL_800_REGEX = /800/;
const TOTAL_756_REGEX = /756/;
const SWITCH_103_68_REGEX = /103,68/;
const ISSUER_133_92_REGEX = /133,92/;
const ACQUIRER_194_4_REGEX = /194,4/;

describe("QrisMdrCalculator component", () => {
  test("renders default state with spreadsheet sample (108k, 0.4% MDR)", () => {
    renderCalculator();

    // Check input fields
    const amountInput = screen.getByLabelText(
      "Transaction amount (IDR)"
    ) as HTMLInputElement;
    expect(amountInput.value).toBe("108000");

    const mdrInput = screen.getByLabelText("MDR rate (%)") as HTMLInputElement;
    expect(mdrInput.value).toBe("0.4");

    const switchInput = screen.getByLabelText("Switch (%)") as HTMLInputElement;
    expect(switchInput.value).toBe("24");

    const issuerInput = screen.getByLabelText("Issuer (%)") as HTMLInputElement;
    expect(issuerInput.value).toBe("31");

    const acquirerInput = screen.getByLabelText(
      "Acquirer (%)"
    ) as HTMLInputElement;
    expect(acquirerInput.value).toBe("45");

    // Check calculated displays
    expect(screen.getByText("100% allocated")).toBeDefined();
    expect(screen.getAllByText(NET_107K_REGEX).length).toBeGreaterThan(0);
    expect(screen.getAllByText(TOTAL_432_REGEX).length).toBeGreaterThan(0);
    expect(screen.getAllByText(SWITCH_104_REGEX).length).toBeGreaterThan(0);
    expect(screen.getAllByText(ISSUER_134_REGEX).length).toBeGreaterThan(0);
    expect(screen.getAllByText(ACQUIRER_194_REGEX).length).toBeGreaterThan(0);
  });

  test("recalculates when transaction amount changes", () => {
    renderCalculator();

    const amountInput = screen.getByLabelText("Transaction amount (IDR)");
    fireEvent.change(amountInput, { target: { value: "200000" } });

    // 200,000 * 0.4% = 800 MDR, Net = 199,200
    expect(screen.getAllByText(NET_199K_REGEX).length).toBeGreaterThan(0);
    expect(screen.getAllByText(TOTAL_800_REGEX).length).toBeGreaterThan(0);
  });

  test("applies MDR rate presets", () => {
    renderCalculator();

    // Click UKE 0.7% preset
    fireEvent.click(
      screen.getByRole("button", { name: "UKE / Menengah / Besar (0.7%)" })
    );
    const mdrInput = screen.getByLabelText("MDR rate (%)") as HTMLInputElement;
    expect(mdrInput.value).toBe("0.7");

    // 108,000 * 0.7% = 756 MDR, Net = 107,244
    expect(screen.getAllByText(TOTAL_756_REGEX).length).toBeGreaterThan(0);
  });

  test("displays warning when revenue shares do not sum to 100%", () => {
    renderCalculator();

    const switchInput = screen.getByLabelText("Switch (%)");
    fireEvent.change(switchInput, { target: { value: "20" } });

    // 20 + 31 + 45 = 96%
    expect(
      screen.getByText("Total share percentage is 96%. It must equal 100%.")
    ).toBeDefined();
  });

  test("toggles between rounded and exact decimal view", () => {
    renderCalculator();

    // Default is rounded (104, 134, 194)
    expect(screen.getAllByText(SWITCH_104_REGEX).length).toBeGreaterThan(0);

    // Toggle to exact decimals
    fireEvent.click(screen.getByRole("button", { name: "Rounded" }));

    // Exact switch: 103,68
    expect(screen.getAllByText(SWITCH_103_68_REGEX).length).toBeGreaterThan(0);
    expect(screen.getAllByText(ISSUER_133_92_REGEX).length).toBeGreaterThan(0);
    expect(screen.getAllByText(ACQUIRER_194_4_REGEX).length).toBeGreaterThan(0);
  });

  test("clears and restores default sample", () => {
    renderCalculator();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    const amountInput = screen.getByLabelText(
      "Transaction amount (IDR)"
    ) as HTMLInputElement;
    expect(amountInput.value).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Sample (108k)" }));
    expect(
      (screen.getByLabelText("Transaction amount (IDR)") as HTMLInputElement)
        .value
    ).toBe("108000");
  });

  test("copies calculation summary to clipboard", async () => {
    const user = userEvent.setup();
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderCalculator();
    await user.click(screen.getByRole("button", { name: "Copy summary" }));
    expect(writeText).toHaveBeenCalled();
  });
});
