import { z } from "zod";
import { messages } from "@/lib/i18n";

/**
 * Minimum password length for login validation
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Login form validation schema
 * Validates username and password requirements
 */
export const loginSchema = z.object({
  captchaVerified: z
    .boolean()
    .refine((val) => val === true, messages.auth.captchaRequiredError),
  password: z.string().min(MIN_PASSWORD_LENGTH, messages.auth.passwordMinError),
  username: z.string().min(1, messages.auth.usernameRequiredError),
});

/**
 * Inferred type from the login schema
 */
export type LoginFormData = z.infer<typeof loginSchema>;
