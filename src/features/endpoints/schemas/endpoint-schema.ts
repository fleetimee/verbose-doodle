import { z } from "zod";

const MIN_URL_LENGTH = 1;
const MAX_URL_LENGTH = 500;
const MIN_BILLER_ID = 1;

/**
 * HTTP methods supported by the API
 */
export const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

/**
 * Regex pattern for valid API endpoint paths
 * Enforces patterns like /rest, /rest/api, /api/v1/users, etc.
 * Must start with / followed by at least one path segment
 */
const API_PATH_PATTERN = /^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\/?$/;

/**
 * Zod schema for endpoint form validation
 */
export const endpointSchema = z.object({
  method: z.enum(httpMethods),
  url: z
    .string()
    .min(MIN_URL_LENGTH, "URL is required")
    .max(MAX_URL_LENGTH, `URL must not exceed ${MAX_URL_LENGTH} characters`)
    .regex(/^\//, "URL must start with /")
    .regex(
      API_PATH_PATTERN,
      "URL must be a valid API path (e.g., /rest, /rest/api, /api/v1/users)"
    ),
  billerId: z
    .number({ message: "Biller ID must be a number" })
    .int("Biller ID must be an integer")
    .min(MIN_BILLER_ID, "Biller ID must be at least 1"),
});

/**
 * Type inferred from the endpoint schema
 */
export type EndpointFormData = z.infer<typeof endpointSchema>;
