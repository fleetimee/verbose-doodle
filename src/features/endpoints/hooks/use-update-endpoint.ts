import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { EndpointError } from "@/features/endpoints/types";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import { apiPatch } from "@/lib/api";
import { getEndpointUpdateUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

/**
 * Request payload for partial endpoint update
 */
type UpdateEndpointRequest = {
  endpointId: string;
  method?: string;
  url?: string;
  billerId?: number;
};

/**
 * API response structure for endpoint update
 */
type ApiUpdateEndpointResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    endpoint: {
      id: number;
      method: string;
      url: string;
      biller_id: number;
      biller_name: string;
    };
  };
};

/**
 * Update endpoint API call (partial update using PATCH)
 * Makes PATCH request to backend to update specific endpoint fields
 */
async function updateEndpoint(
  request: UpdateEndpointRequest
): Promise<ApiUpdateEndpointResponse> {
  try {
    const { endpointId, ...data } = request;

    const apiResponse = await apiPatch<
      ApiUpdateEndpointResponse,
      {
        method?: string;
        url?: string;
        billerId?: number;
      }
    >(getEndpointUpdateUrl(endpointId), data);

    // Validate that we have the expected response structure
    if (!apiResponse.data?.endpoint) {
      throw {
        message: "Invalid response structure from server",
        code: "INVALID_RESPONSE",
        status: 500,
      } as EndpointError;
    }

    return apiResponse;
  } catch (error) {
    // Re-throw as EndpointError for consistent error handling
    throw error as EndpointError;
  }
}

/**
 * Custom hook for updating an endpoint (partial update)
 * Uses TanStack Query mutation for state management
 *
 * @example
 * ```tsx
 * const { mutate: updateEndpoint, isPending } = useUpdateEndpoint();
 *
 * // Update only the URL
 * updateEndpoint({ endpointId: "1", url: "/new-path" });
 *
 * // Update only the method
 * updateEndpoint({ endpointId: "1", method: "POST" });
 *
 * // Update multiple fields
 * updateEndpoint({ endpointId: "1", method: "POST", url: "/api/v2" });
 * ```
 */
export function useUpdateEndpoint() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    ApiUpdateEndpointResponse,
    UpdateEndpointRequest,
    EndpointError
  >(updateEndpoint, {
    onSuccess: (response) => {
      // Show success message
      toast.success("Success", {
        description: response.responseDesc || "Endpoint updated successfully",
      });

      // Invalidate and refetch endpoints to get fresh data from server
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      // Invalidate overview to update statistics if needed
      queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to update endpoint", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
