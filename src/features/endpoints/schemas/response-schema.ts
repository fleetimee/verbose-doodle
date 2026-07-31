import { z } from "zod";
import { messages } from "@/lib/i18n";

const MAX_NAME_LENGTH = 100;
const MIN_STATUS_CODE = 100;
const MAX_STATUS_CODE = 599;

export const responseSchema = z.object({
  activated: z.boolean().optional(),
  json: z
    .string()
    .min(1, messages.endpoints.jsonRequiredError)
    .refine(
      (value) => {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: messages.endpoints.invalidJsonError,
      }
    ),
  name: z
    .string()
    .min(1, messages.endpoints.nameRequiredError)
    .max(MAX_NAME_LENGTH, messages.endpoints.nameTooLongError),
  statusCode: z
    .number()
    .int()
    .min(MIN_STATUS_CODE, messages.endpoints.statusCodeRangeError)
    .max(MAX_STATUS_CODE, messages.endpoints.statusCodeRangeError),
});

export type ResponseFormData = z.infer<typeof responseSchema>;
