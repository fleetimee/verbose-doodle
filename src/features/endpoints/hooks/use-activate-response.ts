import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthToken } from "@/features/auth/utils";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
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
  const token = getAuthToken();

  if (!token) {
    throw {
      message: "No authentication token found. Please login first.",
      code: "AUTH_REQUIRED",
      status: 401,
    } as ResponseError;
  }

  const response = await fetch(
    getResponseActivateUrl(data.endpointId, data.responseId),
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
      message: `Failed to activate response: ${response.statusText}`,
      code: "ACTIVATE_FAILED",
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
