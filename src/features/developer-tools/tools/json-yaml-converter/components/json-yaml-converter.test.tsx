import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TourProvider } from "@/components/tour";
import { JsonYamlConverter } from "@/features/developer-tools/tools/json-yaml-converter/components/json-yaml-converter";

type CodeMirrorProps = {
  readonly "aria-label"?: string;
  readonly editable?: boolean;
  readonly onChange?: (value: string) => void;
  readonly value?: string;
};

mock.module("@uiw/react-codemirror", () => ({
  default: ({
    "aria-label": ariaLabel,
    editable,
    onChange,
    value,
  }: CodeMirrorProps) => (
    <textarea
      aria-label={ariaLabel}
      onChange={(event) => onChange?.(event.currentTarget.value)}
      readOnly={editable === false}
      value={value}
    />
  ),
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
});

function renderConverter() {
  localStorage.setItem("json-yaml-converter-tour-seen", "true");
  return render(
    <TourProvider closeable>
      <JsonYamlConverter />
    </TourProvider>
  );
}

describe("JsonYamlConverter", () => {
  test("converts locally by button and keyboard while keeping the last output after an error", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("button", { name: "Convert" }));
    const output = screen.getByRole("textbox", { name: "Output YAML" });
    expect(output.getAttribute("readonly")).not.toBeNull();
    expect((output as HTMLTextAreaElement).value).toContain("customer:");

    fireEvent.change(screen.getByRole("textbox", { name: "Source JSON" }), {
      target: { value: "{" },
    });
    await user.click(screen.getByRole("button", { name: "Convert" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "JSON could not be parsed"
    );
    expect((output as HTMLTextAreaElement).value).toContain("customer:");

    fireEvent.change(screen.getByRole("textbox", { name: "Source JSON" }), {
      target: { value: '{"ok":true}' },
    });
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", metaKey: true })
      );
    });
    await waitFor(() =>
      expect((output as HTMLTextAreaElement).value).toContain("ok: true")
    );

    const fetchMock = mock(async () => new Response());
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    fireEvent.click(screen.getByRole("button", { name: "Convert" }));
    expect(fetchMock).not.toHaveBeenCalled();
    globalThis.fetch = originalFetch;
  });

  test("walks through conversion controls and document panes", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("button", { name: "Start tour" }));
    expect(
      await screen.findByText("Set the conversion direction")
    ).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Work across two panes")).toBeDefined();
  });

  test("switches direction and swaps a successful output into the source", async () => {
    const user = userEvent.setup();
    renderConverter();
    const swap = screen.getByRole("button", { name: "Swap" });
    expect((swap as HTMLButtonElement).disabled).toBeTrue();

    await user.click(screen.getByRole("combobox", { name: "Source format" }));
    await user.click(await screen.findByRole("option", { name: "YAML" }));
    expect(screen.getByRole("textbox", { name: "Source YAML" })).toBeDefined();
    expect(screen.getByRole("textbox", { name: "Output JSON" })).toBeDefined();

    fireEvent.change(screen.getByRole("textbox", { name: "Source YAML" }), {
      target: { value: "name: Ayu\n" },
    });
    await user.click(screen.getByRole("button", { name: "Convert" }));
    expect((swap as HTMLButtonElement).disabled).toBeFalse();

    await user.click(swap);
    expect(
      (
        screen.getByRole("textbox", {
          name: "Source JSON",
        }) as HTMLTextAreaElement
      ).value
    ).toBe('{\n  "name": "Ayu"\n}');
    expect(
      (
        screen.getByRole("textbox", {
          name: "Output YAML",
        }) as HTMLTextAreaElement
      ).value
    ).toBe("");
    expect((swap as HTMLButtonElement).disabled).toBeTrue();
  });

  test("copies output and reports clipboard failures", async () => {
    const user = userEvent.setup();
    const writeText = mock(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderConverter();

    const copy = screen.getByRole("button", { name: "Copy output" });
    expect((copy as HTMLButtonElement).disabled).toBeTrue();
    await user.click(screen.getByRole("button", { name: "Convert" }));
    await user.click(copy);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Copied" })).toBeDefined();

    writeText.mockImplementation(() =>
      Promise.reject(new Error("clipboard denied"))
    );
    await user.click(screen.getByRole("button", { name: "Copied" }));
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Could not copy output"
    );
  });

  test("clears both panes and resets the JSON example", async () => {
    const user = userEvent.setup();
    renderConverter();

    await user.click(screen.getByRole("button", { name: "Convert" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Source JSON",
        }) as HTMLTextAreaElement
      ).value
    ).toBe("");
    expect(
      (
        screen.getByRole("textbox", {
          name: "Output YAML",
        }) as HTMLTextAreaElement
      ).value
    ).toBe("");

    await user.click(screen.getByRole("button", { name: "Reset example" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Source JSON",
        }) as HTMLTextAreaElement
      ).value
    ).toContain('"customer"');
  });
});
