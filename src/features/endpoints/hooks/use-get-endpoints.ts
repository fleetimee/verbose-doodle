import type { Endpoint } from "@/features/endpoints/types";
import { getAdminEndpointList } from "@/lib/api-endpoints";
import { createQueryHook } from "@/lib/query-hooks";

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_TO_MS = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
const STALE_TIME_MINUTES = 5;
const FIVE_MINUTES_IN_MS = STALE_TIME_MINUTES * MINUTES_TO_MS;

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
  const token = import.meta.env.VITE_API_TOKEN;

  const response = await fetch(getAdminEndpointList(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch endpoints: ${response.statusText}`);
  }

  const data = (await response.json()) as ApiResponse;

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

export function useGetEndpoints() {
  const useQuery = createQueryHook<Endpoint[]>({
    queryKey: ["endpoints"],
    queryFn: fetchEndpoints,
    options: {
      staleTime: FIVE_MINUTES_IN_MS,
    },
  });

  return useQuery();
}
