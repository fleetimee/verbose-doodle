import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import type { EndpointTrafficLogDetail } from "@/features/endpoints/types";
import type { ApiError } from "@/lib/api";
import { apiGet } from "@/lib/api";
import { getEndpointTrafficLogDetailUrl } from "@/lib/api-endpoints";
import { createQueryHook } from "@/lib/query-hooks";

type ApiTrafficLogDetail = Record<string, unknown>;

type ApiResponse = {
  code?: string;
  message?: string;
  responseCode?: string;
  responseDesc?: string;
  data?: ApiTrafficLogDetail | { log?: ApiTrafficLogDetail };
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

function recordOrNull(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function normalizeHitStatus(
  value: unknown
): EndpointTrafficLogDetail["hitStatus"] {
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

function getField(record: ApiTrafficLogDetail, camel: string, snake: string) {
  return record[camel] ?? record[snake];
}

function unwrapResponse(data: ApiResponse): ApiTrafficLogDetail {
  const payload = data.data;
  if (
    payload &&
    typeof payload === "object" &&
    "log" in payload &&
    payload.log
  ) {
    return payload.log as ApiTrafficLogDetail;
  }
  if (payload && typeof payload === "object") {
    return payload as ApiTrafficLogDetail;
  }
  return {} as ApiTrafficLogDetail;
}

function mapTrafficLogDetail(
  apiLog: ApiTrafficLogDetail
): EndpointTrafficLogDetail {
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
    requestHeaders: recordOrNull(
      getField(apiLog, "requestHeaders", "request_headers")
    ),
    requestBody: getField(apiLog, "requestBody", "request_body") ?? null,
    responseHeaders: recordOrNull(
      getField(apiLog, "responseHeaders", "response_headers")
    ),
    responseBody: getField(apiLog, "responseBody", "response_body") ?? null,
    errorMessage: stringOrNull(
      getField(apiLog, "errorMessage", "error_message")
    ),
  };
}

async function fetchEndpointTrafficLogDetail(
  endpointId: string,
  logId: string
): Promise<EndpointTrafficLogDetail> {
  const data = await apiGet<ApiResponse>(
    getEndpointTrafficLogDetailUrl(endpointId, logId)
  );

  return mapTrafficLogDetail(unwrapResponse(data));
}

export function useGetEndpointTrafficLogDetail(
  endpointId: string,
  logId: string | null
) {
  const useQuery = createQueryHook<EndpointTrafficLogDetail, ApiError>({
    queryKey: endpointQueryKeys.trafficLogDetail(endpointId, logId ?? ""),
    queryFn: () => fetchEndpointTrafficLogDetail(endpointId, logId ?? ""),
    options: {
      enabled: !!endpointId && !!logId,
    },
  });

  return useQuery();
}
