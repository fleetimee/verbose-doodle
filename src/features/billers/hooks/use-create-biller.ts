import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { billerQueryKeys } from "@/features/billers/query-keys";
import type { Biller } from "@/features/billers/types";
import { type ApiError, apiPost } from "@/lib/api";
import { getAdminBillerCreateUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

export type CreateBillerInput = {
  readonly billerName: string;
};

type ApiCreateBillerResponse = {
  data: {
    biller: {
      id: number;
      biller_name: string;
    };
  };
};

async function createBiller(input: CreateBillerInput): Promise<Biller> {
  const response = await apiPost<
    ApiCreateBillerResponse,
    { billerName: string }
  >(getAdminBillerCreateUrl(), { billerName: input.billerName });

  if (!response.data?.biller) {
    throw {
      message: "Invalid response structure from server",
      code: "INVALID_RESPONSE",
      status: 500,
    } as ApiError;
  }

  return {
    id: response.data.biller.id,
    name: response.data.biller.biller_name,
  };
}

export function useCreateBiller() {
  const queryClient = useQueryClient();
  const mutation = createMutationHook<Biller, CreateBillerInput, ApiError>(
    createBiller,
    {
      onSuccess: () => {
        toast.success("Biller created successfully");
        queryClient.invalidateQueries({ queryKey: billerQueryKeys.all });
      },
      onError: (error) => {
        toast.error("Failed to create biller", {
          description: error.message,
        });
      },
    }
  );

  return mutation();
}
