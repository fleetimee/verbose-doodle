import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  EndpointDataAdapter,
  EndpointHourlyMetricsInput,
  EndpointTelemetryInput,
} from "@/features/endpoints/data/endpoint-data-adapter";
import {
  endpointDataQueryKeys,
  endpointDataTelemetryPrefix,
} from "@/features/endpoints/data/endpoint-data-query-keys";
import { httpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
import type {
  EndpointHourlyMetric,
  EndpointMetric,
  EndpointTrafficLogDetail,
  EndpointTrafficLogsFilters,
  EndpointTrafficLogsResult,
} from "@/features/endpoints/types";
import type { ApiError } from "@/lib/api";

export type EndpointTelemetryOptions = {
  readonly enabled?: boolean;
  readonly selectedLogId?: string | null;
  readonly from?: string;
  readonly to?: string;
};

/**
 * Endpoint telemetry: traffic logs, log details, metrics, and log clearing.
 * Filters, telemetry DTO normalization, query keys, cache policy, and invalidation stay private.
 */
export function useEndpointTelemetry(
  endpointId: string,
  filters: EndpointTrafficLogsFilters,
  options: EndpointTelemetryOptions = {},
  adapter: EndpointDataAdapter = httpEndpointAdapter
) {
  const queryClient = useQueryClient();
  const enabled = (options.enabled ?? true) && Boolean(endpointId);
  const telemetryInput: EndpointTelemetryInput = { endpointId, filters };
  const trafficLogs = useQuery<EndpointTrafficLogsResult, ApiError>({
    queryKey: endpointDataQueryKeys.telemetry(endpointId, filters),
    queryFn: () => adapter.listTrafficLogs(telemetryInput),
    enabled,
    staleTime: 10 * 1000,
  });
  const trafficLogDetail = useQuery<EndpointTrafficLogDetail, ApiError>({
    queryKey: endpointDataQueryKeys.telemetryDetail(
      endpointId,
      options.selectedLogId ?? ""
    ),
    queryFn: () =>
      adapter.getTrafficLogDetail(endpointId, options.selectedLogId ?? ""),
    enabled: enabled && Boolean(options.selectedLogId),
  });
  const metricsSummary = useQuery<EndpointMetric, ApiError>({
    queryKey: endpointDataQueryKeys.metrics(endpointId),
    queryFn: () => adapter.getMetricsSummary(endpointId),
    enabled,
    staleTime: 15 * 1000,
  });
  const hourlyInput: EndpointHourlyMetricsInput = {
    endpointId,
    from: options.from ?? "",
    to: options.to ?? "",
  };
  const hourlyMetrics = useQuery<EndpointHourlyMetric[], ApiError>({
    queryKey: endpointDataQueryKeys.hourlyMetrics(
      endpointId,
      hourlyInput.from,
      hourlyInput.to
    ),
    queryFn: () => adapter.getHourlyMetrics(hourlyInput),
    enabled: enabled && Boolean(options.from) && Boolean(options.to),
    staleTime: 15 * 1000,
  });
  const clearTrafficLogs = useMutation<void, ApiError, string>({
    mutationFn: adapter.clearTrafficLogs,
    onSuccess: async (_, clearedEndpointId) => {
      await queryClient.invalidateQueries({
        queryKey: endpointDataTelemetryPrefix(clearedEndpointId),
      });
    },
  });

  return {
    trafficLogs,
    trafficLogDetail,
    metricsSummary,
    hourlyMetrics,
    clearTrafficLogs,
  };
}
