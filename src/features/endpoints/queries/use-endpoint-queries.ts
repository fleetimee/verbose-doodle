import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type {
  Endpoint,
  EndpointTrafficLog,
  EndpointTrafficLogDetail,
  EndpointTrafficLogStatus,
  EndpointTrafficLogsFilters,
  EndpointTrafficLogsResult,
  HttpMethod,
} from "@/features/endpoints/types";
import {
  type ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";

const HTTP_NOT_FOUND = 404;

// Input / Request DTO Types
export type CreateEndpointInput = {
  method: HttpMethod;
  url: string;
  billerId: number;
};

export type UpdateEndpointInput = {
  method?: HttpMethod;
  url?: string;
  billerId?: number;
};

export type CreateResponseInput = {
  name: string;
  json: string;
  statusCode: number;
};

export type UpdateResponseInput = {
  name?: string;
  json?: string;
  statusCode?: number;
};

export type UpdateResponseSimulationInput = {
  responseId: string;
  endpointId?: string;
  delayMs?: number;
  simulateTimeout?: boolean;
};

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

// API DTO Types
type ApiEndpointResponse = {
  response_id: number;
  json: string;
  status_code: number;
  activated: boolean;
  name: string;
  delay_ms?: number;
  simulate_timeout?: boolean;
};

type ApiEndpoint = {
  endpoint_id: number;
  method: HttpMethod;
  url: string;
  biller_id: number;
  biller_name: string;
  responses: ApiEndpointResponse[];
};

type ApiEndpointsResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    endpoints: ApiEndpoint[];
  };
};

type ApiSingleEndpointResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    endpoint: ApiEndpoint;
  };
};

type ApiTrafficLog = Record<string, unknown>;

type ApiTrafficLogsResponse = {
  data?: {
    items?: ApiTrafficLog[];
    logs?: ApiTrafficLog[];
    nextCursor?: string | null;
    next_cursor?: string | null;
    hasMore?: boolean;
    has_more?: boolean;
  };
};

type ApiTrafficLogDetailResponse = {
  data: EndpointTrafficLogDetail;
};

type ApiMetricResponse<T> = {
  readonly data?: T;
};

// Helper Transformers
function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function booleanValue(value: unknown): boolean {
  return value === true || value === "true";
}

function normalizeHitStatus(value: unknown): EndpointTrafficLogStatus {
  const status = stringOrNull(value);
  switch (status) {
    case "matched_success":
    case "matched_empty":
    case "matched_timeout":
    case "matched_delayed":
    case "unmatched_endpoint":
    case "backend_error":
      return status;
    default:
      return "backend_error";
  }
}

function getField(record: ApiTrafficLog, camel: string, snake: string) {
  return record[camel] ?? record[snake];
}

function mapTrafficLog(apiLog: ApiTrafficLog): EndpointTrafficLog {
  return {
    id: stringOrNull(getField(apiLog, "id", "id")) ?? "",
    requestId: stringOrNull(getField(apiLog, "requestId", "request_id")) ?? "",
    occurredAt:
      stringOrNull(getField(apiLog, "occurredAt", "occurred_at")) ??
      new Date().toISOString(),
    endpointId: stringOrNull(getField(apiLog, "endpointId", "endpoint_id")),
    responseId: stringOrNull(getField(apiLog, "responseId", "response_id")),
    billerId: stringOrNull(getField(apiLog, "billerId", "biller_id")),
    method: stringOrNull(getField(apiLog, "method", "method")) ?? "-",
    path: stringOrNull(getField(apiLog, "path", "path")) ?? "-",
    queryString: stringOrNull(getField(apiLog, "queryString", "query_string")),
    matched: booleanValue(getField(apiLog, "matched", "matched")),
    hitStatus: normalizeHitStatus(getField(apiLog, "hitStatus", "hit_status")),
    httpStatusCode: numberOrNull(
      getField(apiLog, "httpStatusCode", "http_status_code")
    ),
    responseName: stringOrNull(
      getField(apiLog, "responseName", "response_name")
    ),
    sourceIp: stringOrNull(getField(apiLog, "sourceIp", "source_ip")) ?? "-",
    sourcePort: numberOrNull(getField(apiLog, "sourcePort", "source_port")),
    destinationIp: stringOrNull(
      getField(apiLog, "destinationIp", "destination_ip")
    ),
    destinationPort: numberOrNull(
      getField(apiLog, "destinationPort", "destination_port")
    ),
    forwardedFor: stringOrNull(
      getField(apiLog, "forwardedFor", "forwarded_for")
    ),
    userAgent: stringOrNull(getField(apiLog, "userAgent", "user_agent")),
    durationMs: numberOrNull(getField(apiLog, "durationMs", "duration_ms")),
    delayMs: numberOrNull(getField(apiLog, "delayMs", "delay_ms")),
    simulateTimeout: booleanValue(
      getField(apiLog, "simulateTimeout", "simulate_timeout")
    ),
    requestBodyPreview: stringOrNull(
      getField(apiLog, "requestBodyPreview", "request_body_preview")
    ),
    responseBodyPreview: stringOrNull(
      getField(apiLog, "responseBodyPreview", "response_body_preview")
    ),
  };
}

function mapApiEndpointToDomain(apiEndpoint: ApiEndpoint): Endpoint {
  return {
    id: apiEndpoint.endpoint_id.toString(),
    method: apiEndpoint.method,
    url: apiEndpoint.url,
    billerId: apiEndpoint.biller_id,
    billerName: apiEndpoint.biller_name,
    responses: (apiEndpoint.responses || []).map((apiResponse) => ({
      id: apiResponse.response_id.toString(),
      name: apiResponse.name,
      json: apiResponse.json,
      statusCode: apiResponse.status_code,
      activated: apiResponse.activated,
      delayMs: apiResponse.delay_ms,
      simulateTimeout: apiResponse.simulate_timeout,
    })),
  };
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

// Data Fetchers
export async function fetchEndpoints(): Promise<Endpoint[]> {
  const data = await apiGet<ApiEndpointsResponse>(
    API_ENDPOINTS.admin.endpoints.list
  );
  return data.data.endpoints.map(mapApiEndpointToDomain);
}

export async function fetchEndpoint(id: string): Promise<Endpoint | undefined> {
  try {
    const data = await apiGet<ApiSingleEndpointResponse>(
      API_ENDPOINTS.admin.endpoints.detail(id)
    );
    return mapApiEndpointToDomain(data.data.endpoint);
  } catch (error) {
    if ((error as ApiError).status === HTTP_NOT_FOUND) {
      return;
    }
    throw error;
  }
}

export async function fetchTrafficLogs(
  endpointId: string,
  filters: EndpointTrafficLogsFilters
): Promise<EndpointTrafficLogsResult> {
  const query = new URLSearchParams();
  if (filters.limit) {
    query.set("limit", String(filters.limit));
  }
  if (filters.status && filters.status !== "all") {
    query.set("status", filters.status);
  }
  if (filters.search) {
    query.set("search", filters.search);
  }
  if (filters.includeBody) {
    query.set("includeBody", "true");
  }

  const response = await apiGet<ApiApiResponseTrafficLogs>(
    `${API_ENDPOINTS.admin.endpoints.trafficLogs.list(endpointId)}?${query.toString()}`
  );
  const items = (response.data?.items ?? response.data?.logs ?? []).map(
    mapTrafficLog
  );
  const nextCursor =
    response.data?.nextCursor ?? response.data?.next_cursor ?? null;
  const hasMore = response.data?.hasMore ?? response.data?.has_more ?? false;

  return { items, nextCursor, hasMore };
}

type ApiApiResponseTrafficLogs = ApiTrafficLogsResponse;

export async function fetchTrafficLogDetail(
  endpointId: string,
  logId: string
): Promise<EndpointTrafficLogDetail> {
  const response = await apiGet<ApiTrafficLogDetailResponse>(
    API_ENDPOINTS.admin.endpoints.trafficLogs.detail(endpointId, logId)
  );
  return response.data;
}

async function fetchMetricsSummary(
  endpointId: string
): Promise<EndpointMetric> {
  const response = await apiGet<ApiMetricResponse<EndpointMetric>>(
    API_ENDPOINTS.admin.endpoints.metrics.summary(endpointId)
  );
  return response.data ?? emptyMetric();
}

async function fetchHourlyMetrics(
  endpointId: string,
  from: string,
  to: string
): Promise<EndpointHourlyMetric[]> {
  const query = new URLSearchParams({ from, to });
  const response = await apiGet<ApiMetricResponse<EndpointHourlyMetric[]>>(
    `${API_ENDPOINTS.admin.endpoints.metrics.hourly(endpointId)}?${query.toString()}`
  );
  return response.data ?? [];
}

// React Query Hooks
export function useGetEndpoints() {
  return useQuery<Endpoint[], ApiError>({
    queryKey: endpointQueryKeys.all,
    queryFn: fetchEndpoints,
    staleTime: TIME_DURATIONS.FIVE_MINUTES,
  });
}

export function useGetEndpoint(id: string) {
  return useQuery<Endpoint | undefined, ApiError>({
    queryKey: endpointQueryKeys.detail(id),
    queryFn: () => fetchEndpoint(id),
    staleTime: TIME_DURATIONS.FIVE_MINUTES,
    enabled: Boolean(id),
  });
}

export function useCreateEndpoint() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, CreateEndpointInput>({
    mutationFn: (data) =>
      apiPost(API_ENDPOINTS.admin.endpoints.create, {
        method: data.method,
        url: data.url,
        biller_id: data.billerId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
    },
  });
}

export type UpdateEndpointArgs =
  | { id: string; data: UpdateEndpointInput }
  | { endpointId: string; url?: string; method?: string; billerId?: number };

export function useUpdateEndpoint() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, UpdateEndpointArgs>({
    mutationFn: (args) => {
      const id = "id" in args ? args.id : args.endpointId;
      const data =
        "data" in args
          ? args.data
          : {
              url: args.url,
              method: args.method as HttpMethod,
              billerId: args.billerId,
            };
      return apiPut(API_ENDPOINTS.admin.endpoints.update(id), {
        method: data.method,
        url: data.url,
        biller_id: data.billerId,
      });
    },
    onSuccess: (_, args) => {
      const id = "id" in args ? args.id : args.endpointId;
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.detail(id) });
    },
  });
}

export type DeleteEndpointArgs = string | { endpointId: string };

export function useDeleteEndpoint() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, DeleteEndpointArgs>({
    mutationFn: (args) => {
      const id = typeof args === "string" ? args : args.endpointId;
      return apiDelete(API_ENDPOINTS.admin.endpoints.delete(id));
    },
    onSuccess: (_, args) => {
      const id = typeof args === "string" ? args : args.endpointId;
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      queryClient.removeQueries({ queryKey: endpointQueryKeys.detail(id) });
    },
  });
}

export function usePrefetchEndpoint() {
  const queryClient = useQueryClient();
  const prefetchEndpoint = (id: string | number) => {
    if (!id) {
      return;
    }
    const stringId = String(id);
    queryClient.prefetchQuery({
      queryKey: endpointQueryKeys.detail(stringId),
      queryFn: () => fetchEndpoint(stringId),
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    });
  };
  return Object.assign(prefetchEndpoint, { prefetchEndpoint });
}

export function usePrefetchEndpoints() {
  const queryClient = useQueryClient();
  const prefetchEndpoints = () => {
    queryClient.prefetchQuery({
      queryKey: endpointQueryKeys.all,
      queryFn: fetchEndpoints,
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    });
  };
  return Object.assign(prefetchEndpoints, { prefetchEndpoints });
}

export function useGetEndpointTrafficLogs(
  endpointId: string,
  filters: EndpointTrafficLogsFilters,
  enabled = true
) {
  return useQuery<EndpointTrafficLogsResult, ApiError>({
    queryKey: endpointQueryKeys.trafficLogs(
      endpointId,
      filters as Record<string, unknown>
    ),
    queryFn: () => fetchTrafficLogs(endpointId, filters),
    enabled: enabled && Boolean(endpointId),
    staleTime: 10_000,
  });
}

export function useGetEndpointTrafficLogDetail(
  endpointId: string,
  logId: string | null,
  enabled = true
) {
  return useQuery<EndpointTrafficLogDetail, ApiError>({
    queryKey: endpointQueryKeys.trafficLogDetail(endpointId, logId ?? ""),
    queryFn: () => fetchTrafficLogDetail(endpointId, logId ?? ""),
    enabled: enabled && Boolean(endpointId) && Boolean(logId),
  });
}

export type ClearTrafficLogsArgs = string | { endpointId: string };

export function useClearEndpointTrafficLogs() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, ClearTrafficLogsArgs>({
    mutationFn: (args) => {
      const endpointId = typeof args === "string" ? args : args.endpointId;
      return apiDelete(
        API_ENDPOINTS.admin.endpoints.trafficLogs.clear(endpointId)
      );
    },
    onSuccess: (_, args) => {
      const endpointId = typeof args === "string" ? args : args.endpointId;
      queryClient.invalidateQueries({
        queryKey: ["endpoints", endpointId, "traffic-logs"],
      });
    },
  });
}

export function useGetEndpointMetricsSummary(
  endpointId: string,
  enabled: boolean
) {
  return useQuery<EndpointMetric, ApiError>({
    queryKey: endpointQueryKeys.metricsSummary(endpointId),
    queryFn: () => fetchMetricsSummary(endpointId),
    enabled: enabled && Boolean(endpointId),
    staleTime: 15_000,
  });
}

export function useGetEndpointHourlyMetrics(
  endpointId: string,
  from: string,
  to: string,
  enabled: boolean
) {
  return useQuery<EndpointHourlyMetric[], ApiError>({
    queryKey: endpointQueryKeys.metricsHourly(endpointId, from, to),
    queryFn: () => fetchHourlyMetrics(endpointId, from, to),
    enabled: enabled && Boolean(endpointId),
    staleTime: 15_000,
  });
}

export type CreateResponseArgs =
  | { endpointId: string; data: CreateResponseInput }
  | {
      endpointId: string;
      name: string;
      json: string;
      statusCode: number;
      activated?: boolean;
    };

export function useCreateResponse() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, CreateResponseArgs>({
    mutationFn: (args) => {
      const endpointId = args.endpointId;
      const name = "data" in args ? args.data.name : args.name;
      const json = "data" in args ? args.data.json : args.json;
      const statusCode =
        "data" in args ? args.data.statusCode : args.statusCode;
      return apiPost(API_ENDPOINTS.admin.responses.create, {
        endpoint_id: Number(endpointId),
        name,
        json,
        status_code: statusCode,
      });
    },
    onSuccess: (_, args) => {
      queryClient.invalidateQueries({
        queryKey: endpointQueryKeys.detail(args.endpointId),
      });
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
    },
  });
}

export type UpdateResponseArgs =
  | { endpointId: string; responseId: string; data: UpdateResponseInput }
  | {
      responseId: string;
      endpointId?: string;
      name?: string;
      json?: string;
      statusCode?: number;
    };

export function useUpdateResponse() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, UpdateResponseArgs>({
    mutationFn: (args) => {
      const responseId = args.responseId;
      const name = "data" in args ? args.data.name : args.name;
      const json = "data" in args ? args.data.json : args.json;
      const statusCode =
        "data" in args ? args.data.statusCode : args.statusCode;
      return apiPut(API_ENDPOINTS.admin.responses.detail(responseId), {
        name,
        json,
        status_code: statusCode,
      });
    },
    onSuccess: (_, args) => {
      if (args.endpointId) {
        queryClient.invalidateQueries({
          queryKey: endpointQueryKeys.detail(args.endpointId),
        });
      }
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
    },
  });
}

export type DeleteResponseArgs =
  | { endpointId: string; responseId: string }
  | { responseId: string; endpointId?: string };

export function useDeleteResponse() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, DeleteResponseArgs>({
    mutationFn: (args) =>
      apiDelete(API_ENDPOINTS.admin.responses.detail(args.responseId)),
    onSuccess: (_, args) => {
      if (args.endpointId) {
        queryClient.invalidateQueries({
          queryKey: endpointQueryKeys.detail(args.endpointId),
        });
      }
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
    },
  });
}

export function useActivateResponse() {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    ApiError,
    { endpointId: string; responseId: string }
  >({
    mutationFn: ({ endpointId, responseId }) =>
      apiPut(
        API_ENDPOINTS.admin.responses.activate(endpointId, responseId),
        {}
      ),
    onSuccess: (_, { endpointId }) => {
      queryClient.invalidateQueries({
        queryKey: endpointQueryKeys.detail(endpointId),
      });
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
    },
  });
}

export function useDeactivateResponse() {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    ApiError,
    { endpointId: string; responseId: string }
  >({
    mutationFn: ({ endpointId, responseId }) =>
      apiPut(
        API_ENDPOINTS.admin.responses.deactivate(endpointId, responseId),
        {}
      ),
    onSuccess: (_, { endpointId }) => {
      queryClient.invalidateQueries({
        queryKey: endpointQueryKeys.detail(endpointId),
      });
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
    },
  });
}

export type UpdateResponseSimulationArgs = {
  responseId: string;
  endpointId?: string;
  delayMs?: number;
  simulateTimeout?: boolean;
};

export function useUpdateResponseSimulation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, UpdateResponseSimulationArgs>({
    mutationFn: ({ responseId, delayMs, simulateTimeout }) =>
      apiPatch(API_ENDPOINTS.admin.responses.updateSimulation(responseId), {
        delayMs,
        simulateTimeout,
      }),
    onSuccess: (_, { endpointId }) => {
      if (endpointId) {
        queryClient.invalidateQueries({
          queryKey: endpointQueryKeys.detail(endpointId),
        });
      }
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
    },
  });
}

/**
 * Cohesive Endpoint Query Manager Hook
 * Provides single-seam access to all endpoint queries, prefetchers, and mutations.
 */
export function useEndpointQueries() {
  const prefetchEndpoint = usePrefetchEndpoint();
  const prefetchEndpoints = usePrefetchEndpoints();

  return {
    useGetEndpoints,
    useGetEndpoint,
    useGetEndpointTrafficLogs,
    useGetEndpointTrafficLogDetail,
    useGetEndpointMetricsSummary,
    useGetEndpointHourlyMetrics,
    useCreateEndpoint,
    useUpdateEndpoint,
    useDeleteEndpoint,
    useClearEndpointTrafficLogs,
    useCreateResponse,
    useUpdateResponse,
    useDeleteResponse,
    useActivateResponse,
    useDeactivateResponse,
    useUpdateResponseSimulation,
    prefetchEndpoint,
    prefetchEndpoints,
  };
}
