import { useMutation } from "@tanstack/react-query";
import { validateJsonSchema } from "@/features/json-schema-validator/api";

export function useValidateJsonSchema() {
  return useMutation({ mutationFn: validateJsonSchema });
}
