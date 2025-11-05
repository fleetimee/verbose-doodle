import { useQueryClient } from "@tanstack/react-query";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { Endpoint } from "@/features/endpoints/types";
import type { ApiError } from "@/lib/api";
import { apiGet } from "@/lib/api";
import { getEndpointDetailUrl } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";

const HTTP_NOT_FOUND = 404;

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
    endpoint: ApiEndpoint;
  };
};

async function fetchEndpoint(id: string): Promise<Endpoint | undefined> {
  try {
    const data = await apiGet<ApiResponse>(getEndpointDetailUrl(id));
    const apiEndpoint = data.data.endpoint;

    return {
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
    };
  } catch (error) {
    // Return undefined for 404 errors (endpoint not found)
    if ((error as ApiError).status === HTTP_NOT_FOUND) {
      return;
    }
    throw error;
  }
}

/**
 * Hook to prefetch endpoint details on hover
 * Implements the 100ms rule - prefetches immediately so click feels instantaneous
 */
export function usePrefetchEndpoint() {
  const queryClient = useQueryClient();

  const prefetchEndpoint = (id: string | number) => {
    // Prefetch immediately on hover - no delay
    // This ensures when user clicks, data is already cached (< 100ms response)
    queryClient.prefetchQuery({
      queryKey: endpointQueryKeys.detail(id),
      queryFn: () => fetchEndpoint(id.toString()),
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    });
  };

  return { prefetchEndpoint };
}
