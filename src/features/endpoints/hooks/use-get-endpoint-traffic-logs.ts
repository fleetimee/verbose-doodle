import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type {
  EndpointTrafficLog,
  EndpointTrafficLogStatus,
  EndpointTrafficLogsFilters,
  EndpointTrafficLogsResult,
} from "@/features/endpoints/types";
import { apiGet } from "@/lib/api";
import { getEndpointTrafficLogsUrl } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";
import { createQueryHook } from "@/lib/query-hooks";

type ApiTrafficLog = Record<string, unknown>;

type ApiResponse = {
  code?: string;
  message?: string;
  responseCode?: string;
  responseDesc?: string;
  data?: {
    items?: ApiTrafficLog[];
    logs?: ApiTrafficLog[];
    nextCursor?: string | null;
    next_cursor?: string | null;
    hasMore?: boolean;
    has_more?: boolean;
  };
};

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

function buildQuery(filters: EndpointTrafficLogsFilters): string {
  const params = new URLSearchParams();
  params.set("limit", filters.limit.toString());
  params.set("includeBody", filters.includeBody.toString());

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  return params.toString();
}

async function fetchEndpointTrafficLogs(
  endpointId: string,
  filters: EndpointTrafficLogsFilters
): Promise<EndpointTrafficLogsResult> {
  const query = buildQuery(filters);
  const data = await apiGet<ApiResponse>(
    `${getEndpointTrafficLogsUrl(endpointId)}?${query}`
  );
  const payload = data.data;
  const items = payload?.items ?? payload?.logs ?? [];

  return {
    items: items.map(mapTrafficLog),
    nextCursor: payload?.nextCursor ?? payload?.next_cursor ?? null,
    hasMore: payload?.hasMore ?? payload?.has_more ?? false,
  };
}

export function useGetEndpointTrafficLogs(
  endpointId: string,
  filters: EndpointTrafficLogsFilters,
  autoRefresh: boolean
) {
  const useQuery = createQueryHook<EndpointTrafficLogsResult>({
    queryKey: endpointQueryKeys.trafficLogs(endpointId, filters),
    queryFn: () => fetchEndpointTrafficLogs(endpointId, filters),
    options: {
      enabled: !!endpointId,
      refetchInterval: autoRefresh ? TIME_DURATIONS.ONE_MINUTE / 30 : false,
    },
  });

  return useQuery();
}
