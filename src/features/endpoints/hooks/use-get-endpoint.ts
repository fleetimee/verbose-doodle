import { getAuthToken } from "@/features/auth/utils";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { Endpoint } from "@/features/endpoints/types";
import { getEndpointDetailUrl } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";
import { createQueryHook } from "@/lib/query-hooks";

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
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found. Please login first.");
  }

  const response = await fetch(getEndpointDetailUrl(id), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === HTTP_NOT_FOUND) {
      return;
    }
    throw new Error(`Failed to fetch endpoint: ${response.statusText}`);
  }

  const data = (await response.json()) as ApiResponse;

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
}

export function useGetEndpoint(id: string) {
  const useQuery = createQueryHook<Endpoint | undefined>({
    queryKey: endpointQueryKeys.detail(id),
    queryFn: () => fetchEndpoint(id),
    options: {
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
      enabled: !!id,
    },
  });

  return useQuery();
}
