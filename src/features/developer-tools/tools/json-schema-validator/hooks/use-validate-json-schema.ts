import { useMutation } from "@tanstack/react-query";
import { validateJsonSchema } from "@/features/developer-tools/tools/json-schema-validator/api";

export function useValidateJsonSchema() {
  return useMutation({ mutationFn: validateJsonSchema });
}
