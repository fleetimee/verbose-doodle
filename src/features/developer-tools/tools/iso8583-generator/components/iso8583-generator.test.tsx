import { afterEach, describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Iso8583Generator } from "@/features/developer-tools/tools/iso8583-generator/components/iso8583-generator";

const sendTcpClient = mock(() => undefined);

mock.module("@/features/socket-tester/context/socket-bridge-context", () => ({
  useSocketBridgeContext: () => ({
    sendTcpClient,
    tcpClient: { connected: true },
  }),
}));

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard"
);

afterEach(() => {
  sendTcpClient.mockClear();
  localStorage.clear();
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
  test("loads the Sign-On sample and shows the resolved bitmap", () => {
    renderGenerator();

    const output = screen.getByRole("textbox", { name: "Raw stream" });
    expect((output as HTMLTextAreaElement).value).toBe(
      "0060080082200000800000000400000000000000090108003700364503112001"
    );
    expect(screen.getByText("8220000080000000")).toBeDefined();
    expect(screen.getByText("0400000000000000")).toBeDefined();
    expect(screen.getAllByText("Bit 70").length).toBeGreaterThanOrEqual(2);
  });

  test("switches to the Account Inquiry preset with its full sample stream", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("combobox", { name: "Preset" }));
    await user.click(
      await screen.findByRole("option", { name: "0200 · Account Inquiry" })
    );

    const output = screen.getByRole("textbox", { name: "Raw stream" });
    expect(
      (output as HTMLTextAreaElement).value.startsWith("03730200F23A")
    ).toBe(true);
    expect((output as HTMLTextAreaElement).value.length).toBe(377);
    expect(screen.getAllByText("Bit 106").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Bit 111")).toBeDefined();
  });

  test("updates the bitmap when a bit is disabled", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("checkbox", { name: "Enable bit 70" }));

    expect(screen.getByText("0220000080000000")).toBeDefined();
    expect(screen.queryByText("0400000000000000")).toBeNull();
  });

  test("copies the printable stream and sends it to the TCP bridge", async () => {
    const user = userEvent.setup();
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderGenerator();

    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith(
      "0060080082200000800000000400000000000000090108003700364503112001"
    );
    expect(screen.getByRole("status").textContent).toContain("Copied");

    await user.click(screen.getByRole("button", { name: "Send to TCP" }));
    expect(sendTcpClient).toHaveBeenCalledWith(
      "0060080082200000800000000400000000000000090108003700364503112001",
      "ascii",
      ""
    );
  });

  test("offers bit-aware helpers and saves the current template locally", async () => {
    const user = userEvent.setup();
    renderGenerator();

    await user.click(screen.getByRole("button", { name: "Auto +1 Bit 11" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Bit 11 System trace audit number",
        }) as HTMLInputElement
      ).value
    ).toBe("003646");

    await user.click(screen.getByRole("button", { name: "Save template" }));
    expect(localStorage.getItem("iso8583-generator-template")).toContain(
      '"presetId":"sign-on"'
    );
    expect(screen.getByRole("status").textContent).toContain("Template saved");
  });
});
