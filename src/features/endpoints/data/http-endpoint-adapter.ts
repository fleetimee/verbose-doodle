import type {
  CreateEndpointInput,
  EndpointDataAdapter,
  EndpointDataTransport,
} from "@/features/endpoints/data/endpoint-data-adapter";
import type {
  Endpoint,
  EndpointHourlyMetric,
  EndpointMetric,
  EndpointResponse,
  EndpointTrafficLog,
  EndpointTrafficLogDetail,
  EndpointTrafficLogStatus,
  EndpointTrafficLogsResult,
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

type ApiRecord = Record<string, unknown>;

type ApiTransport = EndpointDataTransport;

const defaultTransport: ApiTransport = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};

const HTTP_NOT_FOUND = 404;

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function payload(response: unknown): ApiRecord {
  if (!isRecord(response)) {
    return {};
  }
  return isRecord(response.data) ? response.data : response;
}

function value(record: ApiRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined) {
      return record[key];
    }
  }
  return;
}

function stringValue(input: unknown, fallback = ""): string {
  return input === null || input === undefined ? fallback : String(input);
}

function nullableString(input: unknown): string | null {
  return input === null || input === undefined ? null : String(input);
}

function numberValue(input: unknown, fallback = 0): number {
  if (typeof input === "number" && Number.isFinite(input)) {
    return input;
  }
  if (typeof input === "string" && input.trim()) {
    const parsed = Number(input);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function nullableNumber(input: unknown): number | null {
  if (input === null || input === undefined || input === "") {
    return null;
  }
  const result = numberValue(input, Number.NaN);
  return Number.isNaN(result) ? null : result;
}

function booleanValue(input: unknown, fallback = false): boolean {
  if (input === true || input === "true" || input === 1 || input === "1") {
    return true;
  }
  if (input === false || input === "false" || input === 0 || input === "0") {
    return false;
  }
  return fallback;
}

function objectValue(input: unknown): Record<string, unknown> {
  return isRecord(input) ? input : {};
}

function mapResponse(input: unknown): EndpointResponse {
  const response = objectValue(input);
  return {
    id: stringValue(value(response, "id", "response_id")),
    name: stringValue(value(response, "name")),
    json: stringValue(value(response, "json"), "{}"),
    statusCode: numberValue(value(response, "statusCode", "status_code")),
    activated: booleanValue(value(response, "activated")),
    delayMs: numberValue(value(response, "delayMs", "delay_ms"), 0),
    simulateTimeout: booleanValue(
      value(response, "simulateTimeout", "simulate_timeout")
    ),
  };
}

function mapEndpoint(input: unknown): Endpoint {
  const endpoint = objectValue(input);
  const responses = value(endpoint, "responses");
  return {
    id: stringValue(value(endpoint, "id", "endpoint_id")),
    method: stringValue(value(endpoint, "method")) as Endpoint["method"],
    url: stringValue(value(endpoint, "url")),
    billerId: numberValue(value(endpoint, "billerId", "biller_id")),
    billerName:
      nullableString(value(endpoint, "billerName", "biller_name")) ?? undefined,
    responses: Array.isArray(responses) ? responses.map(mapResponse) : [],
  };
}

function listValue(record: ApiRecord, ...keys: string[]): unknown[] {
  const result = value(record, ...keys);
  return Array.isArray(result) ? result : [];
}

function endpointFromResponse(response: unknown): Endpoint {
  const data = payload(response);
  return mapEndpoint(value(data, "endpoint") ?? data);
}

function responseFromResponse(response: unknown): EndpointResponse {
  const data = payload(response);
  return mapResponse(value(data, "response") ?? data);
}

function mapTrafficLog(input: unknown): EndpointTrafficLog {
  const log = objectValue(input);
  const rawStatus = stringValue(
    value(log, "hitStatus", "hit_status"),
    "backend_error"
  );
  const status: EndpointTrafficLogStatus = [
    "matched_success",
    "matched_empty",
    "matched_timeout",
    "matched_delayed",
    "unmatched_endpoint",
    "backend_error",
  ].includes(rawStatus)
    ? (rawStatus as EndpointTrafficLogStatus)
    : "backend_error";
  return {
    id: stringValue(value(log, "id")),
    requestId: stringValue(value(log, "requestId", "request_id")),
    occurredAt: stringValue(
      value(log, "occurredAt", "occurred_at"),
      new Date(0).toISOString()
    ),
    endpointId: nullableString(value(log, "endpointId", "endpoint_id")),
    responseId: nullableString(value(log, "responseId", "response_id")),
    billerId: nullableString(value(log, "billerId", "biller_id")),
    method: stringValue(value(log, "method"), "-"),
    path: stringValue(value(log, "path"), "-"),
    queryString: nullableString(value(log, "queryString", "query_string")),
    matched: booleanValue(value(log, "matched")),
    hitStatus: status,
    httpStatusCode: nullableNumber(
      value(log, "httpStatusCode", "http_status_code")
    ),
    responseName: nullableString(value(log, "responseName", "response_name")),
    sourceIp: stringValue(value(log, "sourceIp", "source_ip"), "-"),
    sourcePort: nullableNumber(value(log, "sourcePort", "source_port")),
    destinationIp: nullableString(
      value(log, "destinationIp", "destination_ip")
    ),
    destinationPort: nullableNumber(
      value(log, "destinationPort", "destination_port")
    ),
    forwardedFor: nullableString(value(log, "forwardedFor", "forwarded_for")),
    userAgent: nullableString(value(log, "userAgent", "user_agent")),
    durationMs: nullableNumber(value(log, "durationMs", "duration_ms")),
    delayMs: nullableNumber(value(log, "delayMs", "delay_ms")),
    simulateTimeout: booleanValue(
      value(log, "simulateTimeout", "simulate_timeout")
    ),
    requestBodyPreview: nullableString(
      value(log, "requestBodyPreview", "request_body_preview")
    ),
    responseBodyPreview: nullableString(
      value(log, "responseBodyPreview", "response_body_preview")
    ),
  };
}

function mapTrafficLogDetail(input: unknown): EndpointTrafficLogDetail {
  const log = objectValue(input);
  const mapped = mapTrafficLog(log);
  return {
    ...mapped,
    requestHeaders: isRecord(value(log, "requestHeaders", "request_headers"))
      ? (value(log, "requestHeaders", "request_headers") as Record<
          string,
          unknown
        >)
      : null,
    requestBody: value(log, "requestBody", "request_body") ?? null,
    responseHeaders: isRecord(value(log, "responseHeaders", "response_headers"))
      ? (value(log, "responseHeaders", "response_headers") as Record<
          string,
          unknown
        >)
      : null,
    responseBody: value(log, "responseBody", "response_body") ?? null,
    errorMessage: nullableString(value(log, "errorMessage", "error_message")),
  };
}

function mapMetric(input: unknown): EndpointMetric {
  const metric = objectValue(input);
  const hitStatusCounts = objectValue(
    value(metric, "hitStatusCounts", "hit_status_counts")
  );
  const httpStatusCounts = objectValue(
    value(metric, "httpStatusCounts", "http_status_counts")
  );
  return {
    requestCount: numberValue(value(metric, "requestCount", "request_count")),
    hitStatusCounts: Object.fromEntries(
      Object.entries(hitStatusCounts).map(([key, item]) => [
        key,
        numberValue(item),
      ])
    ),
    httpStatusCounts: Object.fromEntries(
      Object.entries(httpStatusCounts).map(([key, item]) => [
        key,
        numberValue(item),
      ])
    ),
    totalDurationMs: numberValue(
      value(metric, "totalDurationMs", "total_duration_ms")
    ),
    minDurationMs: nullableNumber(
      value(metric, "minDurationMs", "min_duration_ms")
    ),
    maxDurationMs: nullableNumber(
      value(metric, "maxDurationMs", "max_duration_ms")
    ),
    averageDurationMs: numberValue(
      value(metric, "averageDurationMs", "average_duration_ms")
    ),
  };
}

function mapHourlyMetric(input: unknown): EndpointHourlyMetric {
  const metric = objectValue(input);
  return {
    ...mapMetric(metric),
    bucketStart: stringValue(value(metric, "bucketStart", "bucket_start")),
  };
}

function trafficPayload(response: unknown): ApiRecord {
  const data = payload(response);
  const nested = value(data, "trafficLogs", "traffic_logs");
  return isRecord(nested) ? nested : data;
}

function metricsPayload(response: unknown): unknown {
  const data = payload(response);
  return value(data, "metrics", "summary") ?? data;
}

function errorStatus(error: unknown): number | undefined {
  return isRecord(error) && typeof error.status === "number"
    ? error.status
    : undefined;
}

export function createHttpEndpointAdapter(
  transport: EndpointDataTransport = defaultTransport
): EndpointDataAdapter {
  return {
    async listEndpoints() {
      const response = await transport.get<unknown>(
        API_ENDPOINTS.admin.endpoints.list
      );
      const data = payload(response);
      return listValue(data, "endpoints").map(mapEndpoint);
    },
    async getEndpoint(endpointId) {
      try {
        const response = await transport.get<unknown>(
          API_ENDPOINTS.admin.endpoints.detail(endpointId)
        );
        return endpointFromResponse(response);
      } catch (error) {
        if (errorStatus(error) === HTTP_NOT_FOUND) {
          return null;
        }
        throw error as ApiError;
      }
    },
    async createEndpoint(input) {
      const response = await transport.post<unknown, CreateEndpointInput>(
        API_ENDPOINTS.admin.endpoints.create,
        input
      );
      return endpointFromResponse(response);
    },
    async updateEndpoint(input) {
      const response = await transport.patch<
        unknown,
        Partial<CreateEndpointInput>
      >(API_ENDPOINTS.admin.endpoints.update(input.endpointId), input.changes);
      return endpointFromResponse(response);
    },
    async deleteEndpoint(endpointId) {
      await transport.delete<unknown>(
        API_ENDPOINTS.admin.endpoints.delete(endpointId)
      );
    },
    async createResponse(input) {
      const response = await transport.post<unknown, Record<string, unknown>>(
        API_ENDPOINTS.admin.responses.create,
        {
          endpointId: Number(input.endpointId),
          json: input.json,
          statusCode: String(input.statusCode),
          activated: "0",
          name: input.name,
          delayMs: input.delayMs ?? 0,
          simulateTimeout: input.simulateTimeout ?? false,
        }
      );
      return responseFromResponse(response);
    },
    async updateResponse(input) {
      const changes = Object.fromEntries(
        Object.entries(input.changes).map(([key, item]) => [
          key === "statusCode" ? key : key,
          key === "statusCode" ? String(item) : item,
        ])
      );
      const response = await transport.patch<unknown, Record<string, unknown>>(
        API_ENDPOINTS.admin.responses.detail(input.responseId),
        changes
      );
      return responseFromResponse(response);
    },
    async deleteResponse(input) {
      await transport.delete<unknown>(
        API_ENDPOINTS.admin.responses.detail(input.responseId)
      );
    },
    async activateResponse(input) {
      const response = await transport.put<unknown, Record<string, never>>(
        API_ENDPOINTS.admin.responses.activate(
          input.endpointId,
          input.responseId
        ),
        {}
      );
      return responseFromResponse(response);
    },
    async deactivateResponse(input) {
      const response = await transport.put<unknown, Record<string, never>>(
        API_ENDPOINTS.admin.responses.deactivate(
          input.endpointId,
          input.responseId
        ),
        {}
      );
      return responseFromResponse(response);
    },
    async updateResponseSimulation(input) {
      const response = await transport.patch<unknown, Record<string, unknown>>(
        API_ENDPOINTS.admin.responses.updateSimulation(input.responseId),
        {
          delayMs: input.delayMs,
          simulateTimeout: input.simulateTimeout,
        }
      );
      return responseFromResponse(response);
    },
    async listTrafficLogs(input) {
      const params = new URLSearchParams();
      params.set("limit", String(input.filters.limit));
      if (input.filters.status !== "all") {
        params.set("status", input.filters.status);
      }
      if (input.filters.search) {
        params.set("search", input.filters.search);
      }
      if (input.filters.includeBody) {
        params.set("includeBody", "true");
      }
      const response = await transport.get<unknown>(
        `${API_ENDPOINTS.admin.endpoints.trafficLogs.list(input.endpointId)}?${params.toString()}`
      );
      const data = trafficPayload(response);
      const items = listValue(data, "items", "logs").map(mapTrafficLog);
      return {
        items,
        nextCursor: nullableString(value(data, "nextCursor", "next_cursor")),
        hasMore: booleanValue(value(data, "hasMore", "has_more")),
      } satisfies EndpointTrafficLogsResult;
    },
    async getTrafficLogDetail(endpointId, logId) {
      const response = await transport.get<unknown>(
        API_ENDPOINTS.admin.endpoints.trafficLogs.detail(endpointId, logId)
      );
      const data = payload(response);
      return mapTrafficLogDetail(
        value(data, "log", "trafficLog", "traffic_log") ?? data
      );
    },
    async clearTrafficLogs(endpointId) {
      await transport.delete<unknown>(
        API_ENDPOINTS.admin.endpoints.trafficLogs.clear(endpointId)
      );
    },
    async getMetricsSummary(endpointId) {
      const response = await transport.get<unknown>(
        API_ENDPOINTS.admin.endpoints.metrics.summary(endpointId)
      );
      return mapMetric(metricsPayload(response));
    },
    async getHourlyMetrics(input) {
      const query = new URLSearchParams({ from: input.from, to: input.to });
      const response = await transport.get<unknown>(
        `${API_ENDPOINTS.admin.endpoints.metrics.hourly(input.endpointId)}?${query.toString()}`
      );
      const rawData =
        isRecord(response) && response.data !== undefined
          ? response.data
          : response;
      const data = payload(rawData);
      const items = Array.isArray(rawData)
        ? rawData
        : listValue(data, "hourly", "items", "metrics");
      return items.map(mapHourlyMetric);
    },
  };
}

export const httpEndpointAdapter = createHttpEndpointAdapter();
