import { describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MacOsLogin } from "@/features/login/components/macos-login";

describe("MacOsLogin", () => {
  test("renders the animated password state accessibly", () => {
    const { container } = render(
      <MacOsLogin
        isComplete={false}
        onTransitionComplete={() => undefined}
        progress={42}
      />
    );

    expect(screen.getByText("Fleetime Labs")).toBeDefined();
    expect(screen.getByLabelText("Validating demo credentials")).toBeDefined();
    expect(
      screen.getByText("Creating a secure simulator session")
    ).toBeDefined();
    expect(container.querySelectorAll(".macos-password-dot")).toHaveLength(11);
    expect(
      container.querySelector(".macos-lock-mascot")?.getAttribute("src")
    ).toBe("/brand/biller-operator-mascot-lockscreen.webp");
    expect(container.querySelectorAll(".macos-glass-break span")).toHaveLength(
      8
    );
    expect(
      container.querySelector(".macos-lock-screen")?.getAttribute("data-state")
    ).toBe("loading");
  });

  test("announces when the session is ready", () => {
    const { container } = render(
      <MacOsLogin
        isComplete={true}
        onTransitionComplete={() => undefined}
        progress={100}
      />
    );

    expect(screen.getByText("Session ready. Redirecting...")).toBeDefined();
    expect(
      container.querySelector(".macos-lock-screen")?.getAttribute("data-state")
    ).toBe("loading");
  });

  test("renders interactive password input and error state with shake", async () => {
    const mockOnSubmit = mock(() => {});
    const mockOnSwitchToClassic = mock(() => {});

    const { container } = render(
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

    // Account card has shake animation class
    expect(
      container.querySelector(".macos-account-card.macos-shake")
    ).not.toBeNull();

    // Password input is rendered
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
