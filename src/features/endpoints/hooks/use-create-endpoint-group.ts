import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { EndpointGroupFormData } from "@/features/endpoints/schemas/endpoint-group-schema";
import type {
  CreateEndpointGroupResponse,
  EndpointGroupError,
} from "@/features/endpoints/types";

/**
 * Simulated API delay for demonstration purposes
 */
const SIMULATED_API_DELAY_MS = 800;

/**
 * Create endpoint group API call
 * TODO: Replace with actual API endpoint when backend is ready
 */
async function createEndpointGroup(
  data: EndpointGroupFormData
): Promise<CreateEndpointGroupResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_API_DELAY_MS));

  // TODO: Replace with actual API call
  // return apiPost<CreateEndpointGroupResponse, CreateEndpointGroupData>('/api/endpoint-groups', data);

  // Simulated success response
  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      name: data.name,
    },
    message: "Endpoint group created successfully",
  };
}

/**
 * Custom hook for creating an endpoint group
 * Uses TanStack Query mutation for state management
 *
 * @example
 * ```tsx
 * const { mutate: createGroup, isPending } = useCreateEndpointGroup();
 *
 * const handleSubmit = (data: EndpointGroupFormData) => {
 *   createGroup(data);
 * };
 * ```
 */
export function useCreateEndpointGroup() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateEndpointGroupResponse,
    EndpointGroupError,
    EndpointGroupFormData
  >({
    mutationFn: createEndpointGroup,
    onSuccess: (response) => {
      // Show success message
      toast.success("Success", {
        description: response.message,
      });

      // Invalidate and refetch endpoint groups query
      // TODO: Add query key when implementing data fetching
      queryClient.invalidateQueries({ queryKey: ["endpoint-groups"] });
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to create endpoint group", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });
}
