import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  EndpointDataAdapter,
  EndpointHourlyMetricsInput,
  EndpointTelemetryInput,
} from "@/features/endpoints/data/endpoint-data-adapter";
import {
  endpointDataQueryKeys,
  endpointDataTelemetryPrefix,
} from "@/features/endpoints/data/endpoint-data-query-keys";
import { ENDPOINT_MUTATION_KEY } from "@/features/endpoints/data/endpoint-mutation-key";
import { httpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
import type {
  EndpointHourlyMetric,
  EndpointMetric,
  EndpointTrafficLogDetail,
  EndpointTrafficLogsFilters,
  EndpointTrafficLogsResult,
} from "@/features/endpoints/types";
import type { ApiError } from "@/lib/api";
import { messages } from "@/lib/i18n";

export type EndpointTelemetryOptions = {
  readonly enabled?: boolean;
  readonly includeMetrics?: boolean;
  readonly includeTrafficLogs?: boolean;
  readonly refetchInterval?: number | false;
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
  const includeMetrics = options.includeMetrics ?? true;
  const includeTrafficLogs = options.includeTrafficLogs ?? true;
  const telemetryInput: EndpointTelemetryInput = { endpointId, filters };
  const trafficLogs = useQuery<EndpointTrafficLogsResult, ApiError>({
    enabled: enabled && includeTrafficLogs,
    queryFn: () => adapter.listTrafficLogs(telemetryInput),
    queryKey: endpointDataQueryKeys.telemetry(endpointId, filters),
    refetchInterval: options.refetchInterval,
    staleTime: 10 * 1000,
  });
  const trafficLogDetail = useQuery<EndpointTrafficLogDetail, ApiError>({
    enabled: enabled && includeTrafficLogs && Boolean(options.selectedLogId),
    queryFn: () =>
      adapter.getTrafficLogDetail(endpointId, options.selectedLogId ?? ""),
    queryKey: endpointDataQueryKeys.telemetryDetail(
      endpointId,
      options.selectedLogId ?? ""
    ),
  });
  const metricsSummary = useQuery<EndpointMetric, ApiError>({
    enabled: enabled && includeMetrics,
    queryFn: () => adapter.getMetricsSummary(endpointId),
    queryKey: endpointDataQueryKeys.metrics(endpointId),
    staleTime: 15 * 1000,
  });
  const hourlyInput: EndpointHourlyMetricsInput = {
    endpointId,
    from: options.from ?? "",
    to: options.to ?? "",
  };
  const hourlyMetrics = useQuery<EndpointHourlyMetric[], ApiError>({
    enabled:
      enabled && includeMetrics && Boolean(options.from) && Boolean(options.to),
    queryFn: () => adapter.getHourlyMetrics(hourlyInput),
    queryKey: endpointDataQueryKeys.hourlyMetrics(
      endpointId,
      hourlyInput.from,
      hourlyInput.to
    ),
    staleTime: 15 * 1000,
  });
  const clearTrafficLogs = useMutation<void, ApiError, string>({
    mutationFn: adapter.clearTrafficLogs,
    mutationKey: ENDPOINT_MUTATION_KEY,
    onError: (error) => {
      toast.error(messages.endpoints.trafficLogsClearFailed, {
        description: error.message,
      });
    },
    onSuccess: async (_, clearedEndpointId) => {
      toast.success(messages.endpoints.trafficLogsCleared, {
        description: "All traffic logs for this endpoint were removed.",
      });
      await queryClient.invalidateQueries({
        queryKey: endpointDataTelemetryPrefix(clearedEndpointId),
      });
    },
  });

  return {
    clearTrafficLogs,
    hourlyMetrics,
    metricsSummary,
    trafficLogDetail,
    trafficLogs,
  };
}
