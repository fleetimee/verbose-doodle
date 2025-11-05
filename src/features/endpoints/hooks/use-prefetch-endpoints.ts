import { useQueryClient } from "@tanstack/react-query";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { Endpoint } from "@/features/endpoints/types";
import { apiGet } from "@/lib/api";
import { getAdminEndpointList } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";

type ApiEndpointResponse = {
  response_id: number;
  json: string;
  status_code: number;
  activated: boolean;
  name: string;
};

type ApiEndpoint = {
  endpoint_id: number;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  biller_id: number;
  biller_name: string;
  responses: ApiEndpointResponse[];
};

type ApiResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    endpoints: ApiEndpoint[];
  };
};

async function fetchEndpoints(): Promise<Endpoint[]> {
  const data = await apiGet<ApiResponse>(getAdminEndpointList());

  return data.data.endpoints.map((apiEndpoint) => ({
    id: apiEndpoint.endpoint_id.toString(),
    method: apiEndpoint.method,
    url: apiEndpoint.url,
    billerId: apiEndpoint.biller_id,
    billerName: apiEndpoint.biller_name,
    responses: apiEndpoint.responses.map((apiResponse) => ({
      id: apiResponse.response_id.toString(),
      name: apiResponse.name,
      json: apiResponse.json,
      statusCode: apiResponse.status_code,
      activated: apiResponse.activated,
    })),
  }));
}

/**
 * Hook to prefetch endpoints list on hover
 * Implements the 100ms rule - prefetches immediately so click feels instantaneous
 */
export function usePrefetchEndpoints() {
  const queryClient = useQueryClient();

  const prefetchEndpoints = () => {
    // Prefetch immediately on hover - no delay
    // This ensures when user clicks, data is already cached (< 100ms response)
    queryClient.prefetchQuery({
      queryKey: endpointQueryKeys.all,
      queryFn: fetchEndpoints,
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    });
  };

  return { prefetchEndpoints };
}
