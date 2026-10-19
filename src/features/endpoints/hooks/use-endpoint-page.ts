import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { endpointDataQueryKeys } from "@/features/endpoints/data/endpoint-data-query-keys";
import type {
  EndpointListQuery,
  EndpointPage,
} from "@/features/endpoints/types";
import { apiGet } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export const defaultEndpointQuery: EndpointListQuery = {
  page: 0,
  size: 25,
  search: "",
  billerSlug: "",
  method: "",
  enabled: "",
  responseStatus: "",
  sortBy: "url",
  direction: "asc",
};

function endpointPageOptions(query: EndpointListQuery) {
  return {
    queryKey: [...endpointDataQueryKeys.catalog, "page", query],
    queryFn: async () => {
      const params = new URLSearchParams(
        Object.entries(query).map(([key, value]) => [key, String(value)])
      );
      const response = await apiGet<{ data: EndpointPage }>(
        `${API_ENDPOINTS.admin.endpoints.list}/page?${params}`
      );
      return response.data;
    },
    staleTime: 30_000,
  };
}

export function useEndpointPage(query: EndpointListQuery) {
  return useQuery({
    ...endpointPageOptions(query),
    placeholderData: keepPreviousData,
  });
}

export function usePrefetchEndpointPage() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.prefetchQuery(endpointPageOptions(defaultEndpointQuery));
}
