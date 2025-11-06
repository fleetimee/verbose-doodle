import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import { type ApiError, apiPatch } from "@/lib/api";
import { getResponseSimulationUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

export type UpdateResponseSimulationRequest = {
  responseId: string;
  delayMs?: number;
  simulateTimeout?: boolean;
};

type UpdateResponseSimulationResponse = {
  responseId: string;
};

/**
 * Update response simulation settings API call
 * Makes PATCH request to backend to update delay/timeout simulation
 */
async function updateResponseSimulation(
  data: UpdateResponseSimulationRequest
): Promise<UpdateResponseSimulationResponse> {
  try {
    await apiPatch(getResponseSimulationUrl(data.responseId), {
      delayMs: data.delayMs,
      simulateTimeout: data.simulateTimeout,
    });

    return {
      responseId: data.responseId,
    };
  } catch (error) {
    throw error as ApiError;
  }
}

/**
 * Custom hook for updating response simulation settings
 * Uses TanStack Query mutation for state management
 */
export function useUpdateResponseSimulation() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    UpdateResponseSimulationResponse,
    UpdateResponseSimulationRequest,
    ApiError
  >(updateResponseSimulation, {
    onSuccess: () => {
      // Invalidate and refetch queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      // Invalidate overview to update statistics
      queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });

      toast.success("Simulation settings updated successfully");
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to update simulation settings", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
