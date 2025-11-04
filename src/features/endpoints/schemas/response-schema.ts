import { z } from "zod";

const MAX_NAME_LENGTH = 100;
const MIN_STATUS_CODE = 100;
const MAX_STATUS_CODE = 599;

export const responseSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(MAX_NAME_LENGTH, "Name is too long"),
  json: z
    .string()
    .min(1, "JSON content is required")
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
        message: "Invalid JSON format",
      }
    ),
  statusCode: z
    .number()
    .int()
    .min(MIN_STATUS_CODE, "Status code must be between 100-599")
    .max(MAX_STATUS_CODE, "Status code must be between 100-599"),
  activated: z.boolean().optional(),
});

export type ResponseFormData = z.infer<typeof responseSchema>;
