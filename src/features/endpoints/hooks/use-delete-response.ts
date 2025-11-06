import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { EndpointError } from "@/features/endpoints/types";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import { apiDelete } from "@/lib/api";
import { createMutationHook } from "@/lib/query-hooks";

/**
 * Request payload for deleting a response
 */
type DeleteResponseRequest = {
  responseId: string;
};

/**
 * API response structure for response deletion
 */
type ApiDeleteResponseResponse = {
  responseCode: string;
  responseDesc: string;
};

/**
 * Delete response API call
 * Makes DELETE request to backend to delete a response configuration
 */
async function deleteResponse(
  request: DeleteResponseRequest
): Promise<ApiDeleteResponseResponse> {
  try {
    const apiResponse = await apiDelete<ApiDeleteResponseResponse>(
      `/api/response/${request.responseId}`
    );

    return apiResponse;
  } catch (error) {
    // Re-throw as EndpointError for consistent error handling
    throw error as EndpointError;
  }
}

/**
 * Custom hook for deleting a response
 * Uses TanStack Query mutation for state management
 *
 * @example
 * ```tsx
 * const { mutate: deleteResponse, isPending } = useDeleteResponse();
 *
 * const handleDelete = () => {
 *   deleteResponse({ responseId: "123" });
 * };
 * ```
 */
export function useDeleteResponse() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    ApiDeleteResponseResponse,
    DeleteResponseRequest,
    EndpointError
  >(deleteResponse, {
    onSuccess: (response) => {
      // Show success message
      toast.success("Success", {
        description: response.responseDesc || "Response deleted successfully",
      });

      // Invalidate and refetch endpoints to get fresh data from server
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      // Invalidate overview to update statistics
      queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to delete response", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
