import { z } from "zod";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;

export const userSchema = z.object({
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH, {
      message: "Username must be at least 3 characters long",
    })
    .max(USERNAME_MAX_LENGTH, {
      message: "Username must not exceed 20 characters",
    }),
  role: z.enum(["ADMIN", "USER"], { message: "Invalid role" }),
  active: z.boolean(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/[A-Za-z]/, { message: "Password must contain at least one letter" })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .or(z.literal(""))
    .optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
