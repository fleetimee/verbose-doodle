import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type {
  CreateEndpointResponse,
  EndpointError,
} from "@/features/endpoints/types";
import { createMutationHook } from "@/lib/query-hooks";

/**
 * Simulated API delay for demonstration purposes
 */
const SIMULATED_API_DELAY_MS = 800;

/**
 * Create endpoint API call
 * TODO: Replace with actual API endpoint when backend is ready
 */
async function createEndpoint(
  data: EndpointFormData
): Promise<CreateEndpointResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_API_DELAY_MS));

  // TODO: Replace with actual API call
  // return apiPost<CreateEndpointResponse, EndpointFormData>('/api/endpoints', data);

  // Simulated success response
  return {
    response_code: "00",
    response_desc: "Endpoint created successfully",
    endpoint: {
      id: crypto.randomUUID(),
      method: data.method,
      url: data.url,
      billerId: data.billerId,
      responses: [],
    },
  };
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
        description: response.response_desc,
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
