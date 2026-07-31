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
    throw {
      code: "INVALID_RESPONSE",
      message: "Invalid response structure from server",
      status: 500,
    } as ApiError;
  }

  return mapCreatedBiller(response);
}

export function useCreateBiller() {
  const queryClient = useQueryClient();
  const mutation = createMutationHook<Biller, CreateBillerInput, ApiError>(
    createBiller,
    {
      onError: (error) => {
        toast.error("Failed to create biller", {
          description: error.message,
        });
      },
      onSuccess: async () => {
        toast.success("Biller created successfully");
        await queryClient.invalidateQueries({ queryKey: billerQueryKeys.all });
      },
    }
  );

  return mutation();
}
