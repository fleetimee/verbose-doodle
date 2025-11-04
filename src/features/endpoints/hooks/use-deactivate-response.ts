import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import { apiPut } from "@/lib/api";
import { getResponseDeactivateUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

type DeactivateResponseRequest = {
  endpointId: string;
  responseId: string;
};

type DeactivateResponseResponse = {
  endpointId: string;
  responseId: string;
};

type ResponseError = {
  message: string;
  code?: string;
  status?: number;
};

/**
 * Deactivate response API call
 * Makes PUT request to backend to deactivate a response
 */
async function deactivateResponse(
  data: DeactivateResponseRequest
): Promise<DeactivateResponseResponse> {
  try {
    await apiPut(getResponseDeactivateUrl(data.endpointId, data.responseId));

    return {
      endpointId: data.endpointId,
      responseId: data.responseId,
    };
  } catch (error) {
    throw error as ResponseError;
  }
}

/**
 * Custom hook for deactivating a response
 * Uses TanStack Query mutation for state management
 */
export function useDeactivateResponse() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    DeactivateResponseResponse,
    DeactivateResponseRequest,
    ResponseError
  >(deactivateResponse, {
    onSuccess: (_response, variables) => {
      // Invalidate and refetch queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: endpointQueryKeys.detail(variables.endpointId),
      });
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to deactivate response", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
