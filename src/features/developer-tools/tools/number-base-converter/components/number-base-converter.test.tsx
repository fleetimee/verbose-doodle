import { afterEach, describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createElement,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { TourProvider } from "@/components/tour";
import { NumberBaseConverter } from "@/features/developer-tools/tools/number-base-converter/components/number-base-converter";

type MotionTestProps = HTMLAttributes<HTMLElement> & {
  readonly [key: string]:
    | string
    | number
    | boolean
    | ReactNode
    | null
    | undefined;
};

const createMotionElement = (
  tag: "aside" | "div" | "header" | "section" | "span" | "svg"
) =>
  forwardRef<HTMLElement, MotionTestProps>((props, ref) => {
    const {
      animate: _animate,
      exit: _exit,
      initial: _initial,
      layout: _layout,
      layoutId: _layoutId,
      onAnimationComplete: _onAnimationComplete,
      transition: _transition,
      variants: _variants,
      ...elementProps
    } = props;
    return createElement(tag, { ...elementProps, ref });
  });

mock.module("motion/react", () => ({
  AnimatePresence: ({ children }: { readonly children?: ReactNode }) =>
    children,
  motion: {
    aside: createMotionElement("aside"),
    div: createMotionElement("div"),
    header: createMotionElement("header"),
    section: createMotionElement("section"),
    span: createMotionElement("span"),
    svg: createMotionElement("svg"),
  },
  useReducedMotion: () => true,
}));

const originalFetch = globalThis.fetch;
const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard"
);

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
  localStorage.clear();
});

function renderConverter() {
  localStorage.setItem("number-base-converter-tour-seen", "true");
  return render(
    <TourProvider closeable>
      <NumberBaseConverter />
    </TourProvider>
  );
}

describe("NumberBaseConverter", () => {
  test("shows the default example in four bases and byte views", () => {
    renderConverter();

    expect(
      screen.getByRole("region", { name: "Binary output" }).textContent
    ).toContain("1111 1111");
    expect(
      screen.getByRole("region", { name: "Octal output" }).textContent
    ).toContain("377");
    expect(
      screen.getByRole("region", { name: "Decimal output" }).textContent
    ).toContain("255");
    expect(
      screen.getByRole("region", { name: "Hexadecimal output" }).textContent
    ).toContain("FF");
    expect(screen.getByText("Byte 00").parentElement?.textContent).toContain(
      "FF"
    );
    expect(screen.queryByRole("button", { name: "Convert" })).toBeNull();
  });

  test("reinterprets hexadecimal FF when switching representation", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("combobox", { name: "Input base" }));
    await user.click(
      await screen.findByRole("option", { name: "Hexadecimal" })
    );
    await user.click(screen.getByRole("button", { name: "Signed" }));
    const input = screen.getByRole("textbox", { name: "Value" });
    await user.clear(input);
    await user.type(input, "FF");

    expect(
      screen.getByRole("region", { name: "Decimal output" }).textContent
    ).toContain("-1");
    expect(screen.getByText("Signed -1")).toBeDefined();
    expect(screen.getByText("Unsigned 255")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Unsigned" }));

    expect(
      screen.getByRole("region", { name: "Decimal output" }).textContent
    ).toContain("255");
  });

  test("clears stale output when conversion fails", () => {
    renderConverter();
    const input = screen.getByRole("textbox", { name: "Value" });

    expect(screen.getByRole("region", { name: "Binary output" })).toBeDefined();
    fireEvent.change(input, { target: { value: "256" } });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.queryByRole("region", { name: "Binary output" })).toBeNull();
  });

  test("copies an automatically converted output without a request", async () => {
    const user = userEvent.setup();
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const fetchMock = mock(async () => new Response());
    // SAFETY: Test mock fulfills fetch without Bun-specific preconnect
    globalThis.fetch = fetchMock as never;
    renderConverter();
    fetchMock.mockClear();

    expect(
      screen.getByRole("region", { name: "Hexadecimal output" })
    ).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();

    const copyButton = screen.getByRole("button", { name: "Copy hexadecimal" });
    expect(
      copyButton.querySelector('[data-icon="clipboard-copy"]')
    ).not.toBeNull();

    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith("FF");
    expect(copyButton.querySelector('[data-icon="check"]')).not.toBeNull();
  });

  test("clears the workspace and restores the example", async () => {
    const user = userEvent.setup();
    renderConverter();
    const input = screen.getByRole("textbox", { name: "Value" });

    await user.click(screen.getByRole("button", { name: "Clear" }));
    // SAFETY: The accessible textbox query targets the native input element.
    expect((input as HTMLInputElement).value).toBe("");
    await user.click(screen.getByRole("button", { name: "Reset example" }));
    // SAFETY: The accessible textbox query targets the native input element.
    expect((input as HTMLInputElement).value).toBe("255");
  });

  test("applies presets with their matching base, width, and interpretation", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("button", { name: "ASCII Hi" }));

    expect(
      screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Value" }).value
    ).toBe("4869");
    expect(
      screen.getByRole("combobox", { name: "Input base" }).textContent
    ).toContain("Hexadecimal");
    expect(
      screen
        .getByRole("button", { name: "16 bit" })
        .getAttribute("aria-pressed")
    ).toBe("true");
    expect(screen.getByText("Hi", { selector: "code" })).toBeDefined();
  });

  test("keeps negative decimal results when switching to unsigned", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("button", { name: "-42 / signed" }));
    await user.click(screen.getByRole("button", { name: "Unsigned" }));

    expect(
      screen.getByRole("region", { name: "Decimal output" }).textContent
    ).toContain("214");
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "Value" }).value
    ).toBe("214");
  });

  test("recalculates results when changing bit width", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("button", { name: "16 bit" }));
    expect(
      screen.getByRole("region", { name: "Hexadecimal output" }).textContent
    ).toContain("00 FF");

    await user.click(screen.getByRole("button", { name: "8 bit" }));
    expect(
      screen.getByRole("region", { name: "Hexadecimal output" }).textContent
    ).toContain("FF");
  });

  test("keeps every guided-tour target available after clearing", () => {
    renderConverter();

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.queryByRole("region", { name: "Binary output" })).toBeNull();
    expect(
      document.getElementById("number-base-converter-tour-results")
    ).not.toBeNull();
    expect(
      document.getElementById("number-base-converter-tour-bytes")
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Start tour" }));
    expect(screen.getByText("Choose how to read the input")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Compare every representation")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Read the underlying bytes")).toBeDefined();
  });
});
