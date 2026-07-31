import { describe, expect, test } from "bun:test";
import {
  type LoginFormData,
  loginSchema,
} from "@/features/login/schemas/login-schema";

describe("loginSchema", () => {
  describe("with valid credentials", () => {
    test("should accept valid username and password", () => {
      const validData = {
        captchaVerified: true,
        password: "password123",
        username: "user123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("should accept valid credentials with captcha verified", () => {
      const validData = {
        captchaVerified: true,
        password: "securePass123",
        username: "admin",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.captchaVerified).toBe(true);
      }
    });

    test("should accept exactly 8 character password", () => {
      const validData = {
        captchaVerified: true,
        password: "12345678",
        username: "testuser",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("with invalid username", () => {
    test("should reject empty username", () => {
      const invalidData = {
        captchaVerified: true,
        password: "validPassword123",
        username: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const usernameError = result.error.issues.find(
          (issue) => issue.path[0] === "username"
        );
        expect(usernameError).toBeDefined();
        expect(usernameError?.message).toContain("Username is required");
      }
    });
  });

  describe("with invalid password", () => {
    test("should reject password shorter than 8 characters", () => {
      const invalidData = {
        captchaVerified: true,
        password: "short",
        username: "user123",
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
        captchaVerified: true,
        password: "1234567", // exactly 7 chars
        username: "user123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should reject empty password", () => {
      const invalidData = {
        captchaVerified: true,
        password: "",
        username: "user123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("with missing fields", () => {
    test("should reject missing username", () => {
      const invalidData = {
        captchaVerified: true,
        password: "validPassword123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should reject missing password", () => {
      const invalidData = {
        captchaVerified: true,
        username: "user123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should reject missing captchaVerified", () => {
      const invalidData = {
        password: "validPassword123",
        username: "user123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test("should reject completely empty object", () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe("with invalid captcha", () => {
    test("should reject when captchaVerified is false", () => {
      const invalidData = {
        captchaVerified: false,
        password: "validPassword123",
        username: "user123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const captchaError = result.error.issues.find(
          (issue) => issue.path[0] === "captchaVerified"
        );
        expect(captchaError).toBeDefined();
        expect(captchaError?.message).toContain("captcha verification");
      }
    });
  });

  describe("type inference", () => {
    test("should have correct TypeScript type", () => {
      const validData: LoginFormData = {
        captchaVerified: true,
        password: "password123",
        username: "user123",
      };

      expect(validData.username).toBeString();
      expect(validData.password).toBeString();
      expect(validData.captchaVerified).toBeBoolean();
    });
  });
});
