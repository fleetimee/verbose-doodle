import { z } from "zod";
import { formatMessage, messages } from "@/lib/i18n";

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
    .min(MIN_URL_LENGTH, messages.endpoints.urlRequiredError)
    .max(
      MAX_URL_LENGTH,
      formatMessage(messages.endpoints.urlMaxError, { max: MAX_URL_LENGTH })
    )
    .regex(/^\//, messages.endpoints.urlStartError)
    .regex(API_PATH_PATTERN, messages.endpoints.urlPathError),
  billerId: z
    .number({ message: messages.endpoints.billerNumberError })
    .int(messages.endpoints.billerIntegerError)
    .min(MIN_BILLER_ID, messages.endpoints.billerMinError),
});

/**
 * Type inferred from the endpoint schema
 */
export type EndpointFormData = z.infer<typeof endpointSchema>;
