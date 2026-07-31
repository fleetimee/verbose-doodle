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
import { ENDPOINT_MUTATION_KEY } from "@/features/endpoints/data/endpoint-mutation-key";
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
  endpointSlug: string,
  adapter: EndpointDataAdapter = httpEndpointAdapter
) {
  const queryClient = useQueryClient();
  const catalogEndpoint = queryClient
    .getQueryData<Endpoint[]>(endpointDataQueryKeys.catalog)
    ?.find((candidate) => candidate.slug === endpointSlug);
  const endpoint = useQuery<Endpoint | null, ApiError>({
    enabled: Boolean(endpointSlug),
    initialData: catalogEndpoint,
    initialDataUpdatedAt: catalogEndpoint ? 0 : undefined,
    queryFn: () => adapter.getEndpoint(endpointSlug),
    queryKey: endpointDataQueryKeys.workspace(endpointSlug),
    staleTime: 5 * 60 * 1000,
  });
  const invalidateWorkspace = async () => {
    await queryClient.invalidateQueries({
      queryKey: endpointDataQueryKeys.workspace(endpointSlug),
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
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error(messages.endpoints.responseCreateError, {
        description: error.message,
      });
    },
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
  });
  const updateResponse = useMutation<
    EndpointResponse,
    ApiError,
    UpdateResponseInput
  >({
    mutationFn: adapter.updateResponse,
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error(messages.endpoints.responseUpdateError, {
        description: error.message,
      });
    },
    onSuccess: async () => {
      toast.success(messages.endpoints.responseUpdateSuccess);
      await invalidateWorkspace();
    },
  });
  const deleteResponse = useMutation<void, ApiError, ResponseActivationInput>({
    mutationFn: adapter.deleteResponse,
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error(messages.endpoints.responseDeleteError, {
        description: error.message,
      });
    },
    onSuccess: async () => {
      toast.success(messages.endpoints.responseDeleteSuccessTitle, {
        description: messages.endpoints.responseDeleteSuccessDescription,
      });
      await invalidateWorkspace();
    },
  });
  const activateResponse = useMutation<
    EndpointResponse,
    ApiError,
    ResponseActivationInput
  >({
    mutationFn: adapter.activateResponse,
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error("Failed to activate response", {
        description: error.message,
      });
    },
    onSuccess: invalidateWorkspace,
  });
  const deactivateResponse = useMutation<
    EndpointResponse,
    ApiError,
    ResponseActivationInput
  >({
    mutationFn: adapter.deactivateResponse,
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error("Failed to deactivate response", {
        description: error.message,
      });
    },
    onSuccess: invalidateWorkspace,
  });
  const updateResponseSimulation = useMutation<
    EndpointResponse,
    ApiError,
    ResponseSimulationInput
  >({
    mutationFn: adapter.updateResponseSimulation,
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error("Failed to update simulation settings", {
        description: error.message,
      });
    },
    onSuccess: async () => {
      toast.success("Simulation settings updated successfully");
      await invalidateWorkspace();
    },
  });

  return {
    activateResponse,
    createResponse,
    deactivateResponse,
    deleteResponse,
    endpoint,
    updateResponse,
    updateResponseSimulation,
  };
}
