import { z } from "zod";

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 50;

/**
 * Zod schema for endpoint group form validation
 */
export const endpointGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters`)
    .max(MAX_NAME_LENGTH, `Name must not exceed ${MAX_NAME_LENGTH} characters`),
});

/**
 * Type inferred from the endpoint group schema
 */
export type EndpointGroupFormData = z.infer<typeof endpointGroupSchema>;
