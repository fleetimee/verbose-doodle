import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/features/login/components/login-form";

const SIGNING_IN_PATTERN = /Signing in/i;

describe("LoginForm", () => {
  describe("rendering", () => {
    test("should render password input with correct attributes", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(
        "Password"
      ) as HTMLInputElement;
      expect(passwordInput.type).toBe("password");
      expect(passwordInput.autocomplete).toBe("current-password");
    });
  });

  describe("error states", () => {
    test("should display error alert when error prop is provided", () => {
      const mockOnSubmit = mock(() => {});
      const error = {
        description: "Invalid credentials",
        message: "Authentication failed",
      };

      render(<LoginForm error={error} onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Authentication failed")).toBeDefined();
      expect(screen.getByText("Invalid credentials")).toBeDefined();
    });
  });

  describe("loading state", () => {
    test("should disable submit button when isLoading is true", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm isLoading={true} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: SIGNING_IN_PATTERN,
      }) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });
  });

  describe("form validation", () => {
    test("should prevent submission with invalid data", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign in" });

      await user.type(usernameInput, "testuser");
      await user.type(passwordInput, "short");
      await user.click(submitButton);

      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });
  });

  describe("form submission", () => {
    test("should require captcha verification before submission", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign in" });

      await user.type(usernameInput, "testuser");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Should not submit without captcha verification
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
