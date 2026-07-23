import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateResponseInput,
  EndpointDataAdapter,
  ResponseActivationInput,
  ResponseSimulationInput,
  UpdateResponseInput,
} from "@/features/endpoints/data/endpoint-data-adapter";
import { endpointDataQueryKeys } from "@/features/endpoints/data/endpoint-data-query-keys";
import { httpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
import type { Endpoint, EndpointResponse } from "@/features/endpoints/types";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import type { ApiError } from "@/lib/api";
import { formatMessage, messages } from "@/lib/i18n";

/**
 * Endpoint workspace: load one endpoint and manage its response configurations.
 * Response DTOs and mutation invalidation are intentionally hidden behind this seam.
 */
export function useEndpointWorkspace(
  endpointId: string,
  adapter: EndpointDataAdapter = httpEndpointAdapter
) {
  const queryClient = useQueryClient();
  const endpoint = useQuery<Endpoint | null, ApiError>({
    queryKey: endpointDataQueryKeys.workspace(endpointId),
    queryFn: () => adapter.getEndpoint(endpointId),
    enabled: Boolean(endpointId),
    staleTime: 5 * 60 * 1000,
  });
  const invalidateWorkspace = async () => {
    await queryClient.invalidateQueries({
      queryKey: endpointDataQueryKeys.workspace(endpointId),
    });
    await queryClient.invalidateQueries({
      queryKey: endpointDataQueryKeys.catalog,
    });
    await queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
  };
  const createResponse = useMutation<
    EndpointResponse,
    ApiError,
    CreateResponseInput
  >({
    mutationFn: adapter.createResponse,
    onSuccess: async (response) => {
      toast.success(messages.endpoints.responseCreateSuccess, {
        description: formatMessage(
          messages.endpoints.responseCreateDescription,
          {
            name: response.name,
          }
        ),
      });
      await invalidateWorkspace();
    },
    onError: (error) => {
      toast.error(messages.endpoints.responseCreateError, {
        description: error.message,
      });
    },
  });
  const updateResponse = useMutation<
    EndpointResponse,
    ApiError,
    UpdateResponseInput
  >({
    mutationFn: adapter.updateResponse,
    onSuccess: async () => {
      toast.success(messages.endpoints.responseUpdateSuccess);
      await invalidateWorkspace();
    },
    onError: (error) => {
      toast.error(messages.endpoints.responseUpdateError, {
        description: error.message,
      });
    },
  });
  const deleteResponse = useMutation<void, ApiError, ResponseActivationInput>({
    mutationFn: adapter.deleteResponse,
    onSuccess: async () => {
      toast.success(messages.endpoints.responseDeleteSuccessTitle, {
        description: messages.endpoints.responseDeleteSuccessDescription,
      });
      await invalidateWorkspace();
    },
    onError: (error) => {
      toast.error(messages.endpoints.responseDeleteError, {
        description: error.message,
      });
    },
  });
  const activateResponse = useMutation<
    EndpointResponse,
    ApiError,
    ResponseActivationInput
  >({
    mutationFn: adapter.activateResponse,
    onSuccess: invalidateWorkspace,
    onError: (error) => {
      toast.error("Failed to activate response", {
        description: error.message,
      });
    },
  });
  const deactivateResponse = useMutation<
    EndpointResponse,
    ApiError,
    ResponseActivationInput
  >({
    mutationFn: adapter.deactivateResponse,
    onSuccess: invalidateWorkspace,
    onError: (error) => {
      toast.error("Failed to deactivate response", {
        description: error.message,
      });
    },
  });
  const updateResponseSimulation = useMutation<
    EndpointResponse,
    ApiError,
    ResponseSimulationInput
  >({
    mutationFn: adapter.updateResponseSimulation,
    onSuccess: async () => {
      toast.success("Simulation settings updated successfully");
      await invalidateWorkspace();
    },
    onError: (error) => {
      toast.error("Failed to update simulation settings", {
        description: error.message,
      });
    },
  });

  return {
    endpoint,
    createResponse,
    updateResponse,
    deleteResponse,
    activateResponse,
    deactivateResponse,
    updateResponseSimulation,
  };
}
