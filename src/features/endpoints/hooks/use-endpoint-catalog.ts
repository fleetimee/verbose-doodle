import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateEndpointInput,
  EndpointDataAdapter,
  UpdateEndpointInput,
} from "@/features/endpoints/data/endpoint-data-adapter";
import { endpointDataQueryKeys } from "@/features/endpoints/data/endpoint-data-query-keys";
import { ENDPOINT_MUTATION_KEY } from "@/features/endpoints/data/endpoint-mutation-key";
import { httpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
import type { Endpoint } from "@/features/endpoints/types";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import type { ApiError } from "@/lib/api";
import { messages } from "@/lib/i18n";

type CatalogAdapter = EndpointDataAdapter;

/**
 * Endpoint catalog: list, create, update, delete, and prefetch endpoint configurations.
 * The adapter, request DTOs, query keys, cache policy, and invalidation remain module-private.
 */
export function useEndpointCatalog(
  adapter: CatalogAdapter = httpEndpointAdapter
) {
  const queryClient = useQueryClient();
  const endpoints = useQuery<Endpoint[], ApiError>({
    queryFn: adapter.listEndpoints,
    queryKey: endpointDataQueryKeys.catalog,
    staleTime: 5 * 60 * 1000,
  });
  const createEndpoint = useMutation<Endpoint, ApiError, CreateEndpointInput>({
    mutationFn: adapter.createEndpoint,
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error(messages.endpoints.createFailed, {
        description: error.message,
      });
    },
    onSuccess: async () => {
      toast.success(messages.common.success, {
        description: messages.endpoints.createSuccess,
      });
      await queryClient.invalidateQueries({
        queryKey: endpointDataQueryKeys.catalog,
      });
      await queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
  });
  const updateEndpoint = useMutation<Endpoint, ApiError, UpdateEndpointInput>({
    mutationFn: adapter.updateEndpoint,
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error(messages.endpoints.updateFailed, {
        description: error.message,
      });
    },
    onSuccess: async (_, input) => {
      toast.success(messages.common.success, {
        description: messages.endpoints.updateSuccess,
      });
      await queryClient.invalidateQueries({
        queryKey: endpointDataQueryKeys.catalog,
      });
      await queryClient.invalidateQueries({
        queryKey: endpointDataQueryKeys.workspace(input.endpointSlug),
      });
      await queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
  });
  const deleteEndpoint = useMutation<void, ApiError, string>({
    mutationFn: adapter.deleteEndpoint,
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error(messages.endpoints.deleteFailed, {
        description: error.message,
      });
    },
    onSuccess: async (_, endpointSlug) => {
      toast.success(messages.common.success, {
        description: messages.endpoints.deleteSuccess,
      });
      await queryClient.invalidateQueries({
        queryKey: endpointDataQueryKeys.catalog,
      });
      queryClient.removeQueries({
        queryKey: endpointDataQueryKeys.workspace(endpointSlug),
      });
      await queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
  });

  return {
    createEndpoint,
    deleteEndpoint,
    endpoints,
    prefetchEndpoint: (endpointSlug: string) =>
      queryClient.prefetchQuery({
        queryFn: () => adapter.getEndpoint(endpointSlug),
        queryKey: endpointDataQueryKeys.workspace(endpointSlug),
        staleTime: 5 * 60 * 1000,
      }),
    prefetchEndpoints: () =>
      queryClient.prefetchQuery({
        queryFn: adapter.listEndpoints,
        queryKey: endpointDataQueryKeys.catalog,
        staleTime: 5 * 60 * 1000,
      }),
    updateEndpoint,
  };
}
