import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type {
  ApiCreateEndpointResponse,
  CreateEndpointResponse,
  EndpointError,
} from "@/features/endpoints/types";
import { apiPost } from "@/lib/api";
import { getAdminEndpointList } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

/**
 * Create endpoint API call
 * Makes POST request to backend to create a new endpoint
 */
async function createEndpoint(
  data: EndpointFormData
): Promise<CreateEndpointResponse> {
  try {
    const apiResponse = await apiPost<
      ApiCreateEndpointResponse,
      {
        method: string;
        url: string;
        billerId: number;
      }
    >(getAdminEndpointList(), {
      method: data.method,
      url: data.url,
      billerId: data.billerId,
    });

    // Validate that we have the expected response structure
    if (!apiResponse.data?.endpoint) {
      throw {
        message: "Invalid response structure from server",
        code: "INVALID_RESPONSE",
        status: 500,
      } as EndpointError;
    }

    // Transform API response to internal format
    return {
      responseCode: apiResponse.responseCode,
      responseDesc: apiResponse.responseDesc,
      endpoint: {
        id: apiResponse.data.endpoint.id.toString(),
        method: apiResponse.data.endpoint.method,
        url: apiResponse.data.endpoint.url,
        billerId: apiResponse.data.endpoint.biller_id,
        billerName: apiResponse.data.endpoint.biller_name,
        responses: [],
      },
    };
  } catch (error) {
    // Re-throw as EndpointError for consistent error handling
    throw error as EndpointError;
  }
}

/**
 * Custom hook for creating an endpoint
 * Uses TanStack Query mutation for state management
 *
 * @example
 * ```tsx
 * const { mutate: createEndpoint, isPending } = useCreateEndpoint();
 *
 * const handleSubmit = (data: EndpointFormData) => {
 *   createEndpoint(data);
 * };
 * ```
 */
export function useCreateEndpoint() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    CreateEndpointResponse,
    EndpointFormData,
    EndpointError
  >(createEndpoint, {
    onSuccess: (response) => {
      // Show success message
      toast.success("Success", {
        description: response.responseDesc,
      });

      // Invalidate and refetch endpoints to get fresh data from server
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to create endpoint", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
