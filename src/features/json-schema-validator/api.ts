import type {
  JsonSchemaValidationRequest,
  JsonSchemaValidationResult,
} from "@/features/json-schema-validator/types";
import { apiPost } from "@/lib/api";

type ValidationApiResponse = {
  readonly responseCode: string;
  readonly responseDesc: string;
  readonly data: JsonSchemaValidationResult;
};

export async function validateJsonSchema(
  request: JsonSchemaValidationRequest
): Promise<JsonSchemaValidationResult> {
  const response = await apiPost<
    ValidationApiResponse,
    JsonSchemaValidationRequest
  >("/api/tools/json-schema/validate", request, { timeout: 5000 });

  return response.data;
}
