import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthToken } from "@/features/auth/utils";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
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
  const token = getAuthToken();

  if (!token) {
    throw {
      message: "No authentication token found. Please login first.",
      code: "AUTH_REQUIRED",
      status: 401,
    } as ResponseError;
  }

  const response = await fetch(
    getResponseDeactivateUrl(data.endpointId, data.responseId),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw {
      message: `Failed to deactivate response: ${response.statusText}`,
      code: "DEACTIVATE_FAILED",
      status: response.status,
    } as ResponseError;
  }

  await response.json();

  return {
    endpointId: data.endpointId,
    responseId: data.responseId,
  };
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
