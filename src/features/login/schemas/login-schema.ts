import { z } from "zod";

/**
 * Minimum password length for login validation
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Login form validation schema
 * Validates username and password requirements
 */
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters"),
  captchaVerified: z
    .boolean()
    .refine((val) => val === true, "Please complete the captcha verification"),
});

/**
 * Inferred type from the login schema
 */
export type LoginFormData = z.infer<typeof loginSchema>;
