import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type ApiCreateBillerResponse,
  mapCreatedBiller,
} from "@/features/billers/data/http-biller-adapter";
import { billerQueryKeys } from "@/features/billers/query-keys";
import type { Biller } from "@/features/billers/types";
import { type ApiError, apiPost } from "@/lib/api";
import { getAdminBillerCreateUrl } from "@/lib/api-endpoints";
import { messages } from "@/lib/i18n";
import { createMutationHook } from "@/lib/query-hooks";

export type CreateBillerInput = {
  readonly billerName: string;
};

async function createBiller(input: CreateBillerInput): Promise<Biller> {
  const response = await apiPost<
    ApiCreateBillerResponse,
    { billerName: string }
  >(getAdminBillerCreateUrl(), { billerName: input.billerName });

  if (!response.data?.biller) {
    const error: ApiError = {
      code: "INVALID_RESPONSE",
      message: messages.errors.invalidResponseStructure,
      status: 500,
    };
    throw error;
  }

  return mapCreatedBiller(response);
}

export function useCreateBiller() {
  const queryClient = useQueryClient();
  const mutation = createMutationHook<Biller, CreateBillerInput, ApiError>(
    createBiller,
    {
      onError: (error) => {
        toast.error(messages.billers.createFailed, {
          description: error.message,
        });
      },
      onSuccess: async () => {
        toast.success(messages.billers.createSuccess);
        await queryClient.invalidateQueries({ queryKey: billerQueryKeys.all });
      },
    }
  );

  return mutation();
}
