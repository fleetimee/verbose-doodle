import { describe, expect, test } from "bun:test";
import { loginSchema } from "@/features/login/schemas/login-schema";

describe("loginSchema", () => {
  describe("with valid credentials", () => {
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
    test("should reject 7 character password", () => {
      const invalidData = {
        captchaVerified: true,
        password: "1234567", // exactly 7 chars
        username: "user123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("with missing fields", () => {
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
});
