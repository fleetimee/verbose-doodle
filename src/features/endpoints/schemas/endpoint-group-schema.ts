import { z } from "zod";

const MIN_GROUP_NAME_LENGTH = 3;
const MAX_GROUP_NAME_LENGTH = 50;

/**
 * Zod schema for endpoint group form validation
 */
export const endpointGroupSchema = z.object({
  name: z
    .string()
    .min(
      MIN_GROUP_NAME_LENGTH,
      `Group name must be at least ${MIN_GROUP_NAME_LENGTH} characters`
    )
    .max(
      MAX_GROUP_NAME_LENGTH,
      `Group name must not exceed ${MAX_GROUP_NAME_LENGTH} characters`
    )
    .regex(
      /^[a-zA-Z0-9\s-_]+$/,
      "Group name can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
});

/**
 * Type inferred from the endpoint group schema
 */
export type EndpointGroupFormData = z.infer<typeof endpointGroupSchema>;
