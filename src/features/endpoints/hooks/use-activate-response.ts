import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import { apiPut } from "@/lib/api";
import { getResponseActivateUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

type ActivateResponseRequest = {
  endpointId: string;
  responseId: string;
};

type ActivateResponseResponse = {
  endpointId: string;
  responseId: string;
};

type ResponseError = {
  message: string;
  code?: string;
  status?: number;
};

/**
 * Activate response API call
 * Makes PUT request to backend to activate a response
 */
async function activateResponse(
  data: ActivateResponseRequest
): Promise<ActivateResponseResponse> {
  try {
    await apiPut(getResponseActivateUrl(data.endpointId, data.responseId));

    return {
      endpointId: data.endpointId,
      responseId: data.responseId,
    };
  } catch (error) {
    throw error as ResponseError;
  }
}

/**
 * Custom hook for activating a response
 * Uses TanStack Query mutation for state management
 */
export function useActivateResponse() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    ActivateResponseResponse,
    ActivateResponseRequest,
    ResponseError
  >(activateResponse, {
    onSuccess: (_response, variables) => {
      // Invalidate and refetch queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: endpointQueryKeys.detail(variables.endpointId),
      });
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to activate response", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
