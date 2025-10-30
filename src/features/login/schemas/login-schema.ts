import { z } from "zod";

/**
 * Minimum password length for login validation
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Login form validation schema
 * Validates email format and password requirements
 */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

/**
 * Inferred type from the login schema
 */
export type LoginFormData = z.infer<typeof loginSchema>;
