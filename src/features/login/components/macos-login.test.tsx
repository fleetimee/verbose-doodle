import { describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MacOsLogin } from "@/features/login/components/macos-login";

describe("MacOsLogin", () => {
  test("submits credentials for admin and rejects an empty password", async () => {
    const mockOnSubmit = mock(() => {});

    render(
      <MacOsLogin
        error={{
          description: "Server error. Please try again later.",
          message: "Login Failed",
        }}
        isComplete={false}
        onSubmit={mockOnSubmit}
        onTransitionComplete={() => undefined}
        progress={0}
      />
    );

    // Error badge is rendered
    expect(
      screen.getByText("Server error. Please try again later.")
    ).toBeDefined();

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toBeDefined();

    // Submitting empty password does not call onSubmit
    fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));
    expect(mockOnSubmit).not.toHaveBeenCalled();

    // Type password and submit
    await userEvent.type(passwordInput, "password123");
    fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));
    expect(mockOnSubmit).toHaveBeenCalledWith({
      captchaVerified: true,
      password: "password123",
      username: "admin",
    });

    // The hardcoded admin account has no account-switch action
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  test("shows loading spinner when isLoading is true", () => {
    render(
      <MacOsLogin
        error={{ message: "Invalid credentials" }}
        isComplete={false}
        isLoading={true}
        onTransitionComplete={() => undefined}
        progress={0}
      />
    );

    const submitBtn = screen.getByRole("button", { name: "Signing in..." });
    expect(submitBtn).toBeDefined();
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByLabelText("Loading")).toBeDefined();
  });
});
