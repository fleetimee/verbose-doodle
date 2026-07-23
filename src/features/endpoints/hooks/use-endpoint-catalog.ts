import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateEndpointInput,
  EndpointDataAdapter,
  UpdateEndpointInput,
} from "@/features/endpoints/data/endpoint-data-adapter";
import { endpointDataQueryKeys } from "@/features/endpoints/data/endpoint-data-query-keys";
import { httpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
import type { Endpoint } from "@/features/endpoints/types";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import type { ApiError } from "@/lib/api";

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
    queryKey: endpointDataQueryKeys.catalog,
    queryFn: adapter.listEndpoints,
    staleTime: 5 * 60 * 1000,
  });
  const createEndpoint = useMutation<Endpoint, ApiError, CreateEndpointInput>({
    mutationFn: adapter.createEndpoint,
    onSuccess: async () => {
      toast.success("Success", {
        description: "Endpoint created successfully",
      });
      await queryClient.invalidateQueries({
        queryKey: endpointDataQueryKeys.catalog,
      });
      await queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Failed to create endpoint", {
        description: error.message,
      });
    },
  });
  const updateEndpoint = useMutation<Endpoint, ApiError, UpdateEndpointInput>({
    mutationFn: adapter.updateEndpoint,
    onSuccess: async (_, input) => {
      toast.success("Success", {
        description: "Endpoint updated successfully",
      });
      await queryClient.invalidateQueries({
        queryKey: endpointDataQueryKeys.catalog,
      });
      await queryClient.invalidateQueries({
        queryKey: endpointDataQueryKeys.workspace(input.endpointId),
      });
      await queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Failed to update endpoint", {
        description: error.message,
      });
    },
  });
  const deleteEndpoint = useMutation<void, ApiError, string>({
    mutationFn: adapter.deleteEndpoint,
    onSuccess: async (_, endpointId) => {
      toast.success("Success", {
        description: "Endpoint deleted successfully",
      });
      await queryClient.invalidateQueries({
        queryKey: endpointDataQueryKeys.catalog,
      });
      queryClient.removeQueries({
        queryKey: endpointDataQueryKeys.workspace(endpointId),
      });
      await queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
    onError: (error) => {
      toast.error("Failed to delete endpoint", {
        description: error.message,
      });
    },
  });

  return {
    endpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    prefetchEndpoints: () =>
      queryClient.prefetchQuery({
        queryKey: endpointDataQueryKeys.catalog,
        queryFn: adapter.listEndpoints,
        staleTime: 5 * 60 * 1000,
      }),
    prefetchEndpoint: (endpointId: string) =>
      queryClient.prefetchQuery({
        queryKey: endpointDataQueryKeys.workspace(endpointId),
        queryFn: () => adapter.getEndpoint(endpointId),
        staleTime: 5 * 60 * 1000,
      }),
  };
}
