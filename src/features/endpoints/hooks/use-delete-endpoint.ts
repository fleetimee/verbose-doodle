import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { EndpointError } from "@/features/endpoints/types";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import { apiDelete } from "@/lib/api";
import { getEndpointDeleteUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

/**
 * Request payload for deleting an endpoint
 */
type DeleteEndpointRequest = {
  endpointId: string;
};

/**
 * API response structure for endpoint deletion
 */
type ApiDeleteEndpointResponse = {
  responseCode: string;
  responseDesc: string;
};

/**
 * Delete endpoint API call
 * Makes DELETE request to backend to delete an endpoint and all its responses
 */
async function deleteEndpoint(
  request: DeleteEndpointRequest
): Promise<ApiDeleteEndpointResponse> {
  try {
    const apiResponse = await apiDelete<ApiDeleteEndpointResponse>(
      getEndpointDeleteUrl(request.endpointId)
    );

    return apiResponse;
  } catch (error) {
    // Re-throw as EndpointError for consistent error handling
    throw error as EndpointError;
  }
}

/**
 * Custom hook for deleting an endpoint
 * Uses TanStack Query mutation for state management
 *
 * @example
 * ```tsx
 * const { mutate: deleteEndpoint, isPending } = useDeleteEndpoint();
 *
 * const handleDelete = () => {
 *   deleteEndpoint({ endpointId: "123" });
 * };
 * ```
 */
export function useDeleteEndpoint() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    ApiDeleteEndpointResponse,
    DeleteEndpointRequest,
    EndpointError
  >(deleteEndpoint, {
    onSuccess: (response) => {
      // Show success message
      toast.success("Success", {
        description: response.responseDesc || "Endpoint deleted successfully",
      });

      // Invalidate and refetch endpoints to get fresh data from server
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      // Invalidate overview to update statistics
      queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to delete endpoint", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
