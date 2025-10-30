import { z } from "zod";

const MIN_URL_LENGTH = 1;
const MAX_URL_LENGTH = 500;
const MIN_GROUP_NAME_LENGTH = 3;
const MAX_GROUP_NAME_LENGTH = 50;

/**
 * HTTP methods supported by the API
 */
export const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

/**
 * Zod schema for endpoint form validation
 */
export const endpointSchema = z
  .object({
    method: z.enum(httpMethods, {
      required_error: "Please select a method",
    }),
    url: z
      .string()
      .min(MIN_URL_LENGTH, "URL is required")
      .max(MAX_URL_LENGTH, `URL must not exceed ${MAX_URL_LENGTH} characters`)
      .regex(/^\//, "URL must start with /"),
    groupId: z.string(),
    newGroupName: z.string().optional(),
  })
  .refine(
    (data) => {
      // Either groupId must be selected OR newGroupName must be provided
      if (data.groupId === "new") {
        return (
          data.newGroupName &&
          data.newGroupName.trim().length >= MIN_GROUP_NAME_LENGTH &&
          data.newGroupName.trim().length <= MAX_GROUP_NAME_LENGTH
        );
      }
      return data.groupId.length > 0;
    },
    {
      message: `Please select a group or enter a new group name (${MIN_GROUP_NAME_LENGTH}-${MAX_GROUP_NAME_LENGTH} characters)`,
      path: ["groupId"],
    }
  );

/**
 * Type inferred from the endpoint schema
 */
export type EndpointFormData = z.infer<typeof endpointSchema>;
