import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type {
  CreateEndpointResponse,
  EndpointGroupError,
} from "@/features/endpoints/types";

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

  const defaultResponse = {
    id: crypto.randomUUID(),
    name: "Default Response",
    json: "{}",
    statusCode: 200,
    activated: true,
  } as const;

  // Simulated success response
  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      method: data.method,
      url: data.url,
      groupId: data.groupId,
      responses: [defaultResponse],
    },
    message: "Endpoint created successfully",
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

  return useMutation<
    CreateEndpointResponse,
    EndpointGroupError,
    EndpointFormData
  >({
    mutationFn: createEndpoint,
    onSuccess: (response) => {
      // Show success message
      toast.success("Success", {
        description: response.message,
      });

      // Invalidate and refetch endpoints query
      // TODO: Add query key when implementing data fetching
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      queryClient.invalidateQueries({ queryKey: ["endpoint-groups"] });
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to create endpoint", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
