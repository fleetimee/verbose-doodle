import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import { type ApiError, apiPatch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

export type UpdateResponseRequest = {
  responseId: string;
  name?: string;
  json?: string;
  statusCode?: number;
};

type UpdateResponseResponse = {
  responseId: string;
};

/**
 * Update response fields API call
 * Makes PATCH request to backend to update response configuration
 */
async function updateResponse(
  data: UpdateResponseRequest
): Promise<UpdateResponseResponse> {
  try {
    await apiPatch(API_ENDPOINTS.admin.responses.update(data.responseId), {
      name: data.name,
      json: data.json,
      statusCode: data.statusCode,
    });

    return {
      responseId: data.responseId,
    };
  } catch (error) {
    throw error as ApiError;
  }
}

/**
 * Custom hook for updating response configuration
 * Uses TanStack Query mutation for state management
 */
export function useUpdateResponse() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    UpdateResponseResponse,
    UpdateResponseRequest,
    ApiError
  >(updateResponse, {
    onSuccess: () => {
      // Invalidate and refetch queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      // Invalidate overview to update statistics
      queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });

      toast.success("Response updated successfully");
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to update response", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
