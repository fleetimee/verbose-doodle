import { describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MacOsLogin } from "@/features/login/components/macos-login";

describe("MacOsLogin", () => {
  test("submits credentials, rejects an empty password, and supports switching login", async () => {
    const mockOnSubmit = mock(() => {});
    const mockOnSwitchToClassic = mock(() => {});

    render(
      <MacOsLogin
        error={{
          description: "Server error. Please try again later.",
          message: "Login Failed",
        }}
        isComplete={false}
        onSubmit={mockOnSubmit}
        onSwitchToClassic={mockOnSwitchToClassic}
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

    // Clicking switch to classic calls callback
    const classicBtn = screen.getByText("Use standard login");
    fireEvent.click(classicBtn);
    expect(mockOnSwitchToClassic).toHaveBeenCalledTimes(1);

    // Clicking switch user reveals username input
    const switchUserBtn = screen.getByText("Switch User");
    fireEvent.click(switchUserBtn);
    expect(screen.getByLabelText("Username")).toBeDefined();
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
