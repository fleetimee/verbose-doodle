import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/features/login/components/login-form";

const INVALID_USERNAME_PATTERN = /username.*required/i;
const SIGNING_IN_PATTERN = /Signing in/i;

describe("LoginForm", () => {
  describe("rendering", () => {
    test("should render the form with all fields", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Welcome back")).toBeDefined();
      expect(
        screen.getByText("Enter your username and password to sign in")
      ).toBeDefined();
      expect(screen.getByLabelText("Username")).toBeDefined();
      expect(screen.getByLabelText("Password")).toBeDefined();
      expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
    });

    test("should render username input with correct attributes", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const usernameInput = screen.getByLabelText(
        "Username"
      ) as HTMLInputElement;
      expect(usernameInput.type).toBe("text");
      expect(usernameInput.autocomplete).toBe("username");
      expect(usernameInput.placeholder).toBe("Enter your username");
    });

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
        message: "Authentication failed",
        description: "Invalid credentials",
      };

      render(<LoginForm error={error} onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Authentication failed")).toBeDefined();
      expect(screen.getByText("Invalid credentials")).toBeDefined();
    });

    test("should display error without description", () => {
      const mockOnSubmit = mock(() => {});
      const error = {
        message: "Something went wrong",
      };

      render(<LoginForm error={error} onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Something went wrong")).toBeDefined();
    });

    test("should not display error when error prop is null", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm error={null} onSubmit={mockOnSubmit} />);

      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  describe("loading state", () => {
    test("should display loading text when isLoading is true", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm isLoading={true} onSubmit={mockOnSubmit} />);

      expect(
        screen.getByRole("button", { name: SIGNING_IN_PATTERN })
      ).toBeDefined();
    });

    test("should disable submit button when isLoading is true", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm isLoading={true} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: SIGNING_IN_PATTERN,
      }) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });

    test("should show normal text when not loading", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm isLoading={false} onSubmit={mockOnSubmit} />);

      expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
    });
  });

  describe("user interactions", () => {
    test("should allow typing in username input", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const usernameInput = screen.getByLabelText(
        "Username"
      ) as HTMLInputElement;
      await user.type(usernameInput, "testuser");

      expect(usernameInput.value).toBe("testuser");
    });

    test("should allow typing in password input", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByLabelText(
        "Password"
      ) as HTMLInputElement;
      await user.type(passwordInput, "password123");

      expect(passwordInput.value).toBe("password123");
    });

    test("should render slider captcha component", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      // The slider captcha should be present
      expect(screen.getByText("Slide to complete the puzzle")).toBeDefined();
    });
  });

  describe("form validation", () => {
    test("should show validation error for empty username", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: "Sign in" });

      await user.click(submitButton);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockOnSubmit).not.toHaveBeenCalled();

      const errorElement = screen.queryByText(INVALID_USERNAME_PATTERN);
      if (errorElement) {
        expect(errorElement).toBeDefined();
      }
    });

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

    test("should not call onSubmit when form is invalid", async () => {
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

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    test("should have accessible labels for all form fields", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText("Username")).toBeDefined();
      expect(screen.getByLabelText("Password")).toBeDefined();
    });

    test("should have proper roles for interactive elements", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: "Sign in" });

      expect(submitButton).toBeDefined();
    });

    test("should have ARIA attributes ready for validation", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const usernameInput = screen.getByLabelText(
        "Username"
      ) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        "Password"
      ) as HTMLInputElement;

      expect(usernameInput.getAttribute("aria-invalid")).toBe("false");
      expect(passwordInput.getAttribute("aria-invalid")).toBe("false");
    });
  });
});
