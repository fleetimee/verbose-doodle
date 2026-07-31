import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  type ApiUpdateBillerResponse,
  mapUpdatedBiller,
} from "@/features/billers/data/http-biller-adapter";
import { billerQueryKeys } from "@/features/billers/query-keys";
import type { Biller } from "@/features/billers/types";
import { endpointDataQueryKeys } from "@/features/endpoints/data/endpoint-data-query-keys";
import { type ApiError, apiPatch } from "@/lib/api";
import { getAdminBillerUpdateUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

export type UpdateBillerInput = {
  readonly slug: string;
  readonly billerName: string;
};

async function updateBiller(input: UpdateBillerInput): Promise<Biller> {
  const response = await apiPatch<
    ApiUpdateBillerResponse,
    { billerName: string }
  >(getAdminBillerUpdateUrl(input.slug), { billerName: input.billerName });

  if (!response.data?.biller) {
    throw {
      code: "INVALID_RESPONSE",
      message: "Invalid response structure from server",
      status: 500,
    } as ApiError;
  }

  return mapUpdatedBiller(response);
}

export function useUpdateBiller() {
  const queryClient = useQueryClient();
  const mutation = createMutationHook<Biller, UpdateBillerInput, ApiError>(
    updateBiller,
    {
      onError: (error) => {
        toast.error("Failed to update biller", {
          description: error.message,
        });
      },
      onSuccess: async () => {
        toast.success("Biller updated successfully");
        await queryClient.invalidateQueries({ queryKey: billerQueryKeys.all });
        await queryClient.invalidateQueries({
          queryKey: endpointDataQueryKeys.catalog,
        });
        await queryClient.invalidateQueries({
          queryKey: endpointDataQueryKeys.workspacePrefix,
        });
      },
    }
  );

  return mutation();
}
