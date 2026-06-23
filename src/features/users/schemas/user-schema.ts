import { z } from "zod";
import { messages } from "@/lib/i18n";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;

export const userSchema = z.object({
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH, {
      message: messages.users.usernameMinError,
    })
    .max(USERNAME_MAX_LENGTH, {
      message: messages.users.usernameMaxError,
    }),
  role: z.enum(["ADMIN", "USER"], { message: messages.users.invalidRoleError }),
  active: z.boolean(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
      message: messages.users.passwordMinError,
    })
    .regex(/[A-Za-z]/, { message: messages.users.passwordLetterError })
    .regex(/\d/, { message: messages.users.passwordNumberError })
    .or(z.literal(""))
    .optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
