import { describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  return render(
    <TourProvider closeable>
      <JwtInspector />
    </TourProvider>
  );
}

describe("JwtInspector Component", () => {
  test("renders the JWT Inspector UI with default token details", async () => {
    renderJwtInspector();

    expect(screen.getByText("JWT Inspector")).toBeDefined();
    expect(screen.getByText("Encoded Token")).toBeDefined();
    expect(screen.getByText("HMAC Secret Key (symmetric HS256)")).toBeDefined();

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

  test("updates encoded token when header or payload is edited", async () => {
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

    // Modify payload
    fireEvent.change(payloadEditor, {
      target: { value: '{"sub":"custom_subject","name":"Tester"}' },
    });

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
      expect(
        screen.getByText(
          "Invalid JWT structure (must contain 3 dot-separated parts)"
        )
      ).toBeDefined();
    });
  });
});
