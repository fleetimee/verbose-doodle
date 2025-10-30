import { describe, expect, test } from "bun:test";
import {
  type LoginFormData,
  loginSchema,
} from "@/features/login/schemas/login-schema";

describe("loginSchema", () => {
  describe("with valid credentials", () => {
    test("should accept valid email and password", () => {
      const validData = {
        email: "user@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should accept valid credentials with rememberMe", () => {
      const validData = {
        email: "admin@company.com",
        password: "securePass123",
        rememberMe: true,
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rememberMe).toBe(true);
      }
    });

    test("should work without rememberMe field", () => {
      const validData = {
        email: "test@test.com",
        password: "12345678",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("with invalid email", () => {
    const invalidEmails = [
      ["missing @", "userexample.com"],
      ["missing domain", "user@"],
      ["missing local part", "@example.com"],
      ["empty string", ""],
      ["just @", "@"],
    ];

    test.each(invalidEmails)(
      "should reject email: %s",
      (_: string, email: string) => {
        const invalidData = {
          email,
          password: "validPassword123",
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toContain("email");
        }
      }
    );
  });

  describe("with invalid password", () => {
    test("should reject password shorter than 8 characters", () => {
      const invalidData = {
        email: "user@example.com",
        password: "short",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordError = result.error.issues.find(
          (issue) => issue.path[0] === "password"
        );
        expect(passwordError).toBeDefined();
        expect(passwordError?.message).toContain("at least 8 characters");
      }
    });

    test("should reject 7 character password", () => {
      const invalidData = {
        email: "user@example.com",
        password: "1234567", // exactly 7 chars
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should accept exactly 8 character password", () => {
      const validData = {
        email: "user@example.com",
        password: "12345678", // exactly 8 chars
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should reject empty password", () => {
      const invalidData = {
        email: "user@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("with missing fields", () => {
    test("should reject missing email", () => {
      const invalidData = {
        password: "validPassword123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should reject missing password", () => {
      const invalidData = {
        email: "user@example.com",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should reject completely empty object", () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("type inference", () => {
    test("should have correct TypeScript type", () => {
      const validData: LoginFormData = {
        email: "user@example.com",
        password: "password123",
      };

      expect(validData.email).toBeString();
      expect(validData.password).toBeString();
    });
  });
});
