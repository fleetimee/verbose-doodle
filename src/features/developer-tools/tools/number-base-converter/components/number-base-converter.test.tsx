import { afterEach, describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement, forwardRef, type ReactNode } from "react";
import { TourProvider } from "@/components/tour";
import { NumberBaseConverter } from "@/features/developer-tools/tools/number-base-converter/components/number-base-converter";

type MotionTestProps = {
  readonly children?: ReactNode;
  readonly [key: string]: unknown;
};

const createMotionElement = (tag: "aside" | "div" | "section" | "svg") =>
  forwardRef<HTMLElement, MotionTestProps>((props, ref) => {
    const {
      animate: _animate,
      exit: _exit,
      initial: _initial,
      layout: _layout,
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
    section: createMotionElement("section"),
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
  test("converts the default example into four bases and byte views", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("button", { name: "Convert" }));

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
    expect(screen.getAllByText("FF", { selector: "code" })).toHaveLength(2);
  });

  test("interprets hexadecimal FF as signed negative one", async () => {
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
    await user.click(screen.getByRole("button", { name: "Convert" }));

    expect(
      screen.getByRole("region", { name: "Decimal output" }).textContent
    ).toContain("-1");
    expect(screen.getByText("Signed -1")).toBeDefined();
    expect(screen.getByText("Unsigned 255")).toBeDefined();
  });

  test("clears stale output when conversion fails", () => {
    renderConverter();
    const input = screen.getByRole("textbox", { name: "Value" });

    fireEvent.click(screen.getByRole("button", { name: "Convert" }));
    expect(screen.getByRole("region", { name: "Binary output" })).toBeDefined();
    fireEvent.change(input, { target: { value: "256" } });
    fireEvent.click(screen.getByRole("button", { name: "Convert" }));

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.queryByRole("region", { name: "Binary output" })).toBeNull();
  });

  test("copies an output and converts with the keyboard without a request", async () => {
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

    fireEvent.keyDown(window, { key: "Enter", metaKey: true });
    expect(
      screen.getByRole("region", { name: "Hexadecimal output" })
    ).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Copy hexadecimal" }));
    expect(writeText).toHaveBeenCalledWith("FF");
  });

  test("clears the workspace and restores the example", async () => {
    const user = userEvent.setup();
    renderConverter();
    const input = screen.getByRole("textbox", { name: "Value" });

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect((input as HTMLInputElement).value).toBe("");
    await user.click(screen.getByRole("button", { name: "Reset example" }));
    expect((input as HTMLInputElement).value).toBe("255");
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
