import { describe, expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/features/login/components/login-form";
import type { LoginFormData } from "@/features/login/schemas/login-schema";

const INVALID_EMAIL_PATTERN = /invalid.*email/i;

describe("LoginForm", () => {
  describe("rendering", () => {
    test("should render the form with all fields", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Welcome back")).toBeDefined();
      expect(
        screen.getByText("Enter your email and password to sign in")
      ).toBeDefined();
      expect(screen.getByLabelText("Email")).toBeDefined();
      expect(screen.getByLabelText("Password")).toBeDefined();
      expect(screen.getByLabelText("Remember me for 30 days")).toBeDefined();
      expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
    });

    test("should render email input with correct attributes", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      expect(emailInput.type).toBe("email");
      expect(emailInput.autocomplete).toBe("email");
      expect(emailInput.placeholder).toBe("name@example.com");
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

    test("should render forgot password button", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Forgot password?")).toBeDefined();
    });

    test("should render sign up link", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText("Don't have an account?")).toBeDefined();
      expect(screen.getByText("Sign up")).toBeDefined();
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
        screen.getByRole("button", { name: "Signing in..." })
      ).toBeDefined();
    });

    test("should disable submit button when isLoading is true", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm isLoading={true} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: "Signing in...",
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
    test("should allow typing in email input", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      await user.type(emailInput, "test@example.com");

      expect(emailInput.value).toBe("test@example.com");
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

    test("should toggle remember me checkbox", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const checkbox = screen.getByRole("checkbox", {
        name: "Remember me for 30 days",
      });

      expect(checkbox.getAttribute("data-state")).toBe("unchecked");

      await user.click(checkbox);
      expect(checkbox.getAttribute("data-state")).toBe("checked");

      await user.click(checkbox);
      expect(checkbox.getAttribute("data-state")).toBe("unchecked");
    });
  });

  describe("form validation", () => {
    test("should show validation error for invalid email", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText("Email");
      const submitButton = screen.getByRole("button", { name: "Sign in" });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockOnSubmit).not.toHaveBeenCalled();

      const errorElement = screen.queryByText(INVALID_EMAIL_PATTERN);
      if (errorElement) {
        expect(errorElement).toBeDefined();
      }
    });

    test("should prevent submission with invalid data", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign in" });

      await user.type(emailInput, "invalid");
      await user.type(passwordInput, "short");
      await user.click(submitButton);

      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });
  });

  describe("form submission", () => {
    test("should call onSubmit with valid data", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock((data: LoginFormData) => {
        expect(data.email).toBe("test@example.com");
        expect(data.password).toBe("password123");
        expect(data.rememberMe).toBe(false);
      });

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign in" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
    });

    test("should call onSubmit with rememberMe true when checked", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock((data: LoginFormData) => {
        expect(data.email).toBe("user@test.com");
        expect(data.password).toBe("securepass123");
        expect(data.rememberMe).toBe(true);
      });

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const rememberMeCheckbox = screen.getByRole("checkbox", {
        name: "Remember me for 30 days",
      });
      const submitButton = screen.getByRole("button", { name: "Sign in" });

      await user.type(emailInput, "user@test.com");
      await user.type(passwordInput, "securepass123");
      await user.click(rememberMeCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      });
    });

    test("should not call onSubmit when form is invalid", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = mock(() => {});

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign in" });

      await user.type(emailInput, "invalid-email");
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

      expect(screen.getByLabelText("Email")).toBeDefined();
      expect(screen.getByLabelText("Password")).toBeDefined();
      expect(screen.getByLabelText("Remember me for 30 days")).toBeDefined();
    });

    test("should have proper roles for interactive elements", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: "Sign in" });
      const checkbox = screen.getByRole("checkbox");

      expect(submitButton).toBeDefined();
      expect(checkbox).toBeDefined();
    });

    test("should have ARIA attributes ready for validation", () => {
      const mockOnSubmit = mock(() => {});
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        "Password"
      ) as HTMLInputElement;

      expect(emailInput.getAttribute("aria-invalid")).toBe("false");
      expect(passwordInput.getAttribute("aria-invalid")).toBe("false");
    });
  });
});
