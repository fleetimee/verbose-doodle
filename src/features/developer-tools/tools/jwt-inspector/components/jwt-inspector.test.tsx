import { describe, expect, mock, test } from "bun:test";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TourProvider } from "@/components/tour";
import { JwtInspector } from "@/features/developer-tools/tools/jwt-inspector/components/jwt-inspector";

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

function renderJwtInspector() {
  localStorage.setItem("jwt-inspector-tour-seen", "true");
  const view = render(
    <TourProvider closeable>
      <JwtInspector />
    </TourProvider>
  );
  return view;
}

describe("JwtInspector Component", () => {
  test("copies the Base64URL signature and preserves edits in an expanded editor", async () => {
    const writeText = mock(async (_value: string) => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderJwtInspector();
    await waitFor(() =>
      expect(screen.getByText("Signature Verified")).toBeDefined()
    );
    const token = (
      screen.getByRole("textbox", {
        name: "Encoded Token",
      }) as HTMLTextAreaElement
    ).value;
    expect(
      (
        screen.getByRole("textbox", {
          name: "Signature (Base64URL)",
        }) as HTMLTextAreaElement
      ).value
    ).toBe(token.split(".")[2]);
    fireEvent.click(
      screen.getByRole("button", { name: "Copy Signature (Base64URL)" })
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(token.split(".")[2])
    );
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand Payload" }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeDefined());
    const editor = within(screen.getByRole("dialog")).getByRole("textbox", {
      name: "Payload",
    });
    fireEvent.change(editor, {
      target: { value: '{"sub":"expanded-edit"}' },
    });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(
      (screen.getByRole("textbox", { name: "Payload" }) as HTMLTextAreaElement)
        .value
    ).toBe('{"sub":"expanded-edit"}');
  });

  test("loads an asymmetric preset with a matching public key", async () => {
    const user = userEvent.setup();
    renderJwtInspector();
    await waitFor(() =>
      expect(screen.getByText("Signature Verified")).toBeDefined()
    );
    await user.click(screen.getByRole("combobox", { name: "Algorithm" }));
    await user.click(screen.getByRole("option", { name: "ES256" }));
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "Public key (SPKI PEM)" })
      ).toBeDefined()
    );
    await waitFor(() =>
      expect(screen.getByText("Signature Verified")).toBeDefined()
    );
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Private key (PKCS8 PEM)",
        }) as HTMLTextAreaElement
      ).value
    ).toContain("BEGIN PRIVATE KEY");
  });

  test("places the JSON editors before the token in create mode", () => {
    renderJwtInspector();
    const workspace = screen.getByTestId("jwt-editor-workspace");
    const paneOrder = () =>
      Array.from(
        workspace.querySelectorAll<HTMLElement>("[data-jwt-pane]")
      ).map((pane) => pane.dataset.jwtPane);

    expect(paneOrder()).toEqual(["token", "decoded"]);
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(paneOrder()).toEqual(["decoded", "token"]);
  });

  test("loads the example on initial render with default token details", async () => {
    renderJwtInspector();

    expect(screen.getByText("JWT Inspector")).toBeDefined();
    expect(screen.getByText("Encoded Token")).toBeDefined();
    expect(screen.getByText("HMAC Secret Key")).toBeDefined();

    // The default token has issuer "biller-simulator-backend"
    await waitFor(() => {
      const payloadEditor = screen.getByRole("textbox", { name: "Payload" });
      expect((payloadEditor as HTMLTextAreaElement).value).toContain(
        "biller-simulator-backend"
      );
    });
  });

  test("validates HS256 signature and shows invalid status on signature mismatch", async () => {
    renderJwtInspector();

    // Default status should settle on verified (since default secret matches default token)
    await waitFor(() => {
      expect(screen.getByText("Signature Verified")).toBeDefined();
    });

    // Mutate the encoded token's signature part so that it becomes invalid for the current secret
    const encodedInput = screen.getByRole("textbox", { name: "Encoded Token" });
    const originalToken = (encodedInput as HTMLTextAreaElement).value;
    const parts = originalToken.split(".");
    const invalidToken = `${parts[0]}.${parts[1]}.invalid_sig_suffix`;

    fireEvent.change(encodedInput, {
      target: { value: invalidToken },
    });

    // Status should update to invalid signature
    await waitFor(() => {
      expect(screen.getByText("Invalid Signature")).toBeDefined();
    });
  });

  test("creates a token only after Generate is clicked", async () => {
    renderJwtInspector();

    const payloadEditor = screen.getByRole("textbox", { name: "Payload" });

    // Wait for the default token to load in the textarea
    let originalToken = "";
    await waitFor(() => {
      originalToken = (
        screen.getByRole("textbox", {
          name: "Encoded Token",
        }) as HTMLTextAreaElement
      ).value;
      expect(originalToken).not.toBe("");
    });

    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    // Modify payload
    fireEvent.change(payloadEditor, {
      target: { value: '{"sub":"custom_subject","name":"Tester"}' },
    });
    expect(
      (
        screen.getByRole("textbox", {
          name: "Encoded Token",
        }) as HTMLTextAreaElement
      ).value
    ).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Generate token" }));

    await waitFor(() => {
      const newToken = (
        screen.getByRole("textbox", {
          name: "Encoded Token",
        }) as HTMLTextAreaElement
      ).value;
      expect(newToken).not.toBe(originalToken);
      expect(newToken.split(".").length).toBe(3);
    });
  });

  test("shows structure error when an invalid JWT is pasted", async () => {
    renderJwtInspector();

    // Wait for default token to load
    await waitFor(() => {
      const originalToken = (
        screen.getByRole("textbox", {
          name: "Encoded Token",
        }) as HTMLTextAreaElement
      ).value;
      expect(originalToken).not.toBe("");
    });

    const encodedInput = screen.getByRole("textbox", { name: "Encoded Token" });
    fireEvent.change(encodedInput, {
      target: { value: "invalid-token-without-three-parts" },
    });

    await waitFor(() => {
      expect(screen.getByText("Expected 3 dot-separated parts.")).toBeDefined();
    });
    expect(
      (screen.getByRole("textbox", { name: "Payload" }) as HTMLTextAreaElement)
        .value
    ).toBe("");
  });

  test("changing the verification secret never changes the inspected token", async () => {
    renderJwtInspector();
    await waitFor(() =>
      expect(screen.getByText("Signature Verified")).toBeDefined()
    );
    const input = screen.getByRole("textbox", {
      name: "Encoded Token",
    }) as HTMLTextAreaElement;
    const original = input.value;
    fireEvent.change(screen.getByLabelText("HMAC Secret Key"), {
      target: { value: "wrong-secret" },
    });
    await waitFor(() =>
      expect(screen.getByText("Invalid Signature")).toBeDefined()
    );
    expect(input.value).toBe(original);
    expect(
      (screen.getByRole("textbox", { name: "Payload" }) as HTMLTextAreaElement)
        .readOnly
    ).toBe(true);
  });

  test("accepts a Bearer token and returns to neutral status when cleared", async () => {
    renderJwtInspector();
    await waitFor(() =>
      expect(screen.getByText("Signature Verified")).toBeDefined()
    );
    const input = screen.getByRole("textbox", {
      name: "Encoded Token",
    }) as HTMLTextAreaElement;
    const original = input.value;
    fireEvent.change(input, { target: { value: `  Bearer ${original}  ` } });
    expect(input.value).toBe(original);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("Signature not checked.")).toBeDefined();
    expect(input.value).toBe("");
  });
});
