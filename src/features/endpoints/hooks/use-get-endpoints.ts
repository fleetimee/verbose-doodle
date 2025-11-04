import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { Endpoint } from "@/features/endpoints/types";
import { apiGet } from "@/lib/api";
import { getAdminEndpointList } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";
import { createQueryHook } from "@/lib/query-hooks";

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

export function useGetEndpoints() {
  const useQuery = createQueryHook<Endpoint[]>({
    queryKey: endpointQueryKeys.all,
    queryFn: fetchEndpoints,
    options: {
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    },
  });

  return useQuery();
}
