import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import { getEndpointMetricsHourlyUrl, getEndpointMetricsSummaryUrl } from "@/lib/api-endpoints";
import { apiGet, type ApiError } from "@/lib/api";
import { createQueryHook } from "@/lib/query-hooks";

export type EndpointMetric = {
  readonly requestCount: number;
  readonly hitStatusCounts: Record<string, number>;
  readonly httpStatusCounts: Record<string, number>;
  readonly totalDurationMs: number;
  readonly minDurationMs: number | null;
  readonly maxDurationMs: number | null;
  readonly averageDurationMs: number;
};

export type EndpointHourlyMetric = EndpointMetric & {
  readonly bucketStart: string;
};

type ApiResponse<T> = {
  readonly data?: T;
};

async function fetchSummary(endpointId: string) {
  const response = await apiGet<ApiResponse<EndpointMetric>>(
    getEndpointMetricsSummaryUrl(endpointId)
  );
  return response.data ?? emptyMetric();
}

async function fetchHourly(endpointId: string, from: string, to: string) {
  const query = new URLSearchParams({ from, to });
  const response = await apiGet<ApiResponse<EndpointHourlyMetric[]>>(
    `${getEndpointMetricsHourlyUrl(endpointId)}?${query}`
  );
  return response.data ?? [];
}

export function useGetEndpointMetricsSummary(endpointId: string, enabled: boolean) {
  const useQuery = createQueryHook<EndpointMetric, ApiError>({
    queryKey: endpointQueryKeys.metricsSummary(endpointId),
    queryFn: () => fetchSummary(endpointId),
    options: {
      enabled: enabled && Boolean(endpointId),
      staleTime: 15_000,
    },
  });
  return useQuery();
}

export function useGetEndpointHourlyMetrics(
  endpointId: string,
  from: string,
  to: string,
  enabled: boolean
) {
  const useQuery = createQueryHook<EndpointHourlyMetric[], ApiError>({
    queryKey: endpointQueryKeys.metricsHourly(endpointId, from, to),
    queryFn: () => fetchHourly(endpointId, from, to),
    options: {
      enabled: enabled && Boolean(endpointId),
      staleTime: 15_000,
    },
  });
  return useQuery();
}

function emptyMetric(): EndpointMetric {
  return {
    requestCount: 0,
    hitStatusCounts: {},
    httpStatusCounts: {},
    totalDurationMs: 0,
    minDurationMs: null,
    maxDurationMs: null,
    averageDurationMs: 0,
  };
}
