import type {
  CreateEndpointInput,
  EndpointAvailability,
  EndpointDataAdapter,
  EndpointDataTransport,
  ResponseCloneInput,
} from "@/features/endpoints/data/endpoint-data-adapter";
import type {
  Endpoint,
  EndpointHourlyMetric,
  EndpointHttpHeaders,
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

type JsonPrimitive = string | number | boolean | null | undefined;
type ApiRecord = {
  readonly [key: string]: JsonPrimitive | readonly unknown[] | ApiRecord;
};

type ApiTransport = EndpointDataTransport;

const defaultTransport: ApiTransport = {
  delete: apiDelete,
  get: apiGet,
  patch: apiPatch,
  post: apiPost,
  put: apiPut,
};

const HTTP_NOT_FOUND = 404;

type RawApiInput = JsonPrimitive | readonly unknown[] | ApiRecord;

function isRecord(candidate: unknown): candidate is ApiRecord {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    !Array.isArray(candidate)
  );
}

function isApiRecord(candidate: RawApiInput): candidate is ApiRecord {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    !Array.isArray(candidate)
  );
}

function isNumberInput(input: RawApiInput): input is number {
  return typeof input === "number";
}

function isStringInput(input: RawApiInput): input is string {
  return typeof input === "string";
}

function isHeaderScalar(
  val: unknown
): val is string | number | boolean | undefined {
  return (
    typeof val === "string" ||
    typeof val === "number" ||
    typeof val === "boolean" ||
    val === undefined
  );
}

function payload(candidate: RawApiInput): ApiRecord {
  if (!isApiRecord(candidate)) {
    return {};
  }
  const data = candidate.data;
  return isRecord(data) ? data : candidate;
}

function value(record: ApiRecord, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined) {
      return record[key];
    }
  }
}

function stringValue(input: RawApiInput, fallback = ""): string {
  return input === null || input === undefined ? fallback : String(input);
}

function nullableString(input: RawApiInput): string | null {
  return input === null || input === undefined ? null : String(input);
}

function numberValue(input: RawApiInput, fallback = 0): number {
  if (isNumberInput(input) && Number.isFinite(input)) {
    return input;
  }
  if (isStringInput(input) && input.trim()) {
    const parsed = Number(input);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function nullableNumber(input: RawApiInput): number | null {
  if (input === null || input === undefined || input === "") {
    return null;
  }
  const result = numberValue(input, Number.NaN);
  return Number.isNaN(result) ? null : result;
}

function booleanValue(input: RawApiInput, fallback = false): boolean {
  if (input === true || input === "true" || input === 1 || input === "1") {
    return true;
  }
  if (input === false || input === "false" || input === 0 || input === "0") {
    return false;
  }
  return fallback;
}

function objectValue(input: RawApiInput): ApiRecord {
  return isApiRecord(input) ? input : {};
}

function readHeaders(input: RawApiInput): EndpointHttpHeaders | null {
  if (!isApiRecord(input)) {
    return null;
  }
  const headers: Record<
    string,
    string | number | boolean | readonly string[] | undefined
  > = {};
  for (const [key, val] of Object.entries(input)) {
    if (isHeaderScalar(val)) {
      headers[key] = val;
    } else if (Array.isArray(val)) {
      headers[key] = val.map(String);
    }
  }
  return headers;
}

function mapResponse(input: RawApiInput): EndpointResponse {
  const response = objectValue(input);
  return {
    activated: booleanValue(value(response, "activated")),
    delayMs: numberValue(value(response, "delayMs", "delay_ms"), 0),
    id: stringValue(value(response, "id", "response_id")),
    json: stringValue(value(response, "json"), "{}"),
    name: stringValue(value(response, "name")),
    simulateTimeout: booleanValue(
      value(response, "simulateTimeout", "simulate_timeout")
    ),
    statusCode: numberValue(value(response, "statusCode", "status_code")),
  };
}

function mapEndpoint(input: RawApiInput): Endpoint {
  const endpoint = objectValue(input);
  const responses = value(endpoint, "responses");
  return {
    billerName:
      nullableString(value(endpoint, "billerName", "biller_name")) ?? undefined,
    billerSlug: stringValue(value(endpoint, "billerSlug", "biller_slug")),
    enabled: booleanValue(value(endpoint, "enabled"), true),
    id: stringValue(value(endpoint, "id", "endpoint_id")),
    // SAFETY: stringValue returns the method string defined by the backend endpoint contract.
    method: stringValue(value(endpoint, "method")) as Endpoint["method"],
    responses: Array.isArray(responses) ? responses.map(mapResponse) : [],
    slug: stringValue(value(endpoint, "slug", "endpoint_slug")),
    url: stringValue(value(endpoint, "url")),
  };
}

function listValue(record: ApiRecord, ...keys: string[]): unknown[] {
  const result = value(record, ...keys);
  return Array.isArray(result) ? result : [];
}

function endpointFromResponse(response: RawApiInput): Endpoint {
  const data = payload(response);
  return mapEndpoint(value(data, "endpoint") ?? data);
}

function endpointAvailabilityFromResponse(
  response: RawApiInput
): EndpointAvailability {
  const data = payload(response);
  const availability = objectValue(value(data, "availability") ?? data);
  return {
    available: booleanValue(value(availability, "available")),
    billerName:
      nullableString(value(availability, "billerName", "biller_name")) ??
      undefined,
    billerSlug:
      nullableString(value(availability, "billerSlug", "biller_slug")) ??
      undefined,
    endpointSlug:
      nullableString(value(availability, "endpointSlug", "endpoint_slug")) ??
      undefined,
  };
}

function responseFromResponse(response: RawApiInput): EndpointResponse {
  const data = payload(response);
  return mapResponse(value(data, "response") ?? data);
}

function mapTrafficLog(input: RawApiInput): EndpointTrafficLog {
  const log = objectValue(input);
  const rawStatus = stringValue(
    value(log, "hitStatus", "hit_status"),
    "backend_error"
  );
  // SAFETY: The membership check below narrows rawStatus to EndpointTrafficLogStatus.
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
    billerId: nullableString(value(log, "billerId", "biller_id")),
    delayMs: nullableNumber(value(log, "delayMs", "delay_ms")),
    destinationIp: nullableString(
      value(log, "destinationIp", "destination_ip")
    ),
    destinationPort: nullableNumber(
      value(log, "destinationPort", "destination_port")
    ),
    durationMs: nullableNumber(value(log, "durationMs", "duration_ms")),
    endpointId: nullableString(value(log, "endpointId", "endpoint_id")),
    forwardedFor: nullableString(value(log, "forwardedFor", "forwarded_for")),
    hitStatus: status,
    httpStatusCode: nullableNumber(
      value(log, "httpStatusCode", "http_status_code")
    ),
    id: stringValue(value(log, "id")),
    matched: booleanValue(value(log, "matched")),
    method: stringValue(value(log, "method"), "-"),
    occurredAt: stringValue(
      value(log, "occurredAt", "occurred_at"),
      new Date(0).toISOString()
    ),
    path: stringValue(value(log, "path"), "-"),
    queryString: nullableString(value(log, "queryString", "query_string")),
    requestBodyPreview: nullableString(
      value(log, "requestBodyPreview", "request_body_preview")
    ),
    requestId: stringValue(value(log, "requestId", "request_id")),
    responseBodyPreview: nullableString(
      value(log, "responseBodyPreview", "response_body_preview")
    ),
    responseId: nullableString(value(log, "responseId", "response_id")),
    responseName: nullableString(value(log, "responseName", "response_name")),
    simulateTimeout: booleanValue(
      value(log, "simulateTimeout", "simulate_timeout")
    ),
    sourceIp: stringValue(value(log, "sourceIp", "source_ip"), "-"),
    sourcePort: nullableNumber(value(log, "sourcePort", "source_port")),
    userAgent: nullableString(value(log, "userAgent", "user_agent")),
  };
}

function mapTrafficLogDetail(input: RawApiInput): EndpointTrafficLogDetail {
  const log = objectValue(input);
  const mapped = mapTrafficLog(log);
  return {
    ...mapped,
    errorMessage: nullableString(value(log, "errorMessage", "error_message")),
    requestBody: value(log, "requestBody", "request_body") ?? null,
    requestHeaders: readHeaders(
      value(log, "requestHeaders", "request_headers")
    ),
    responseBody: value(log, "responseBody", "response_body") ?? null,
    responseHeaders: readHeaders(
      value(log, "responseHeaders", "response_headers")
    ),
  };
}

function mapMetric(input: RawApiInput): EndpointMetric {
  const metric = objectValue(input);
  const hitStatusCounts = objectValue(
    value(metric, "hitStatusCounts", "hit_status_counts")
  );
  const httpStatusCounts = objectValue(
    value(metric, "httpStatusCounts", "http_status_counts")
  );
  return {
    averageDurationMs: numberValue(
      value(metric, "averageDurationMs", "average_duration_ms")
    ),
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
    maxDurationMs: nullableNumber(
      value(metric, "maxDurationMs", "max_duration_ms")
    ),
    minDurationMs: nullableNumber(
      value(metric, "minDurationMs", "min_duration_ms")
    ),
    requestCount: numberValue(value(metric, "requestCount", "request_count")),
    totalDurationMs: numberValue(
      value(metric, "totalDurationMs", "total_duration_ms")
    ),
  };
}

function mapHourlyMetric(input: RawApiInput): EndpointHourlyMetric {
  const metric = objectValue(input);
  return {
    ...mapMetric(metric),
    bucketStart: stringValue(value(metric, "bucketStart", "bucket_start")),
  };
}

function trafficPayload(response: RawApiInput): ApiRecord {
  const data = payload(response);
  const nested = value(data, "trafficLogs", "traffic_logs");
  return isRecord(nested) ? nested : data;
}

function metricsPayload(response: RawApiInput): ApiRecord {
  const data = payload(response);
  const nested = value(data, "metrics", "summary");
  return isRecord(nested) ? nested : data;
}

function isErrorWithStatus(
  cause: unknown
): cause is { readonly status: number } {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "status" in cause &&
    // SAFETY: Invariant verified by checking object shape and property existence
    typeof (cause as { readonly status: unknown }).status === "number"
  );
}

function errorStatus(cause: unknown): number | undefined {
  return isErrorWithStatus(cause) ? cause.status : undefined;
}

export function createHttpEndpointAdapter(
  transport: EndpointDataTransport = defaultTransport
): EndpointDataAdapter {
  return {
    async activateResponse(input) {
      const response = await transport.put<RawApiInput, Record<string, never>>(
        API_ENDPOINTS.admin.responses.activate(
          input.endpointId,
          input.responseId
        ),
        {}
      );
      return responseFromResponse(response);
    },
    async clearTrafficLogs(endpointId) {
      await transport.delete<RawApiInput>(
        API_ENDPOINTS.admin.endpoints.trafficLogs.clear(endpointId)
      );
    },
    async checkEndpointAvailability(input) {
      const response = await transport.get<RawApiInput>(
        API_ENDPOINTS.admin.endpoints.availability(
          input.method,
          input.url,
          input.excludeSlug
        )
      );
      return endpointAvailabilityFromResponse(response);
    },
    async createEndpoint(input) {
      const response = await transport.post<
        RawApiInput,
        {
          method: CreateEndpointInput["method"];
          url: string;
          biller_slug: string;
        }
      >(API_ENDPOINTS.admin.endpoints.create, {
        biller_slug: input.billerSlug,
        method: input.method,
        url: input.url,
      });
      return endpointFromResponse(response);
    },
    async createResponse(input) {
      const response = await transport.post<
        RawApiInput,
        {
          activated: string;
          delayMs: number;
          endpointId: number;
          json: string;
          name: string;
          simulateTimeout: boolean;
          statusCode: string;
        }
      >(API_ENDPOINTS.admin.responses.create, {
        activated: "0",
        delayMs: input.delayMs ?? 0,
        endpointId: Number(input.endpointId),
        json: input.json,
        name: input.name,
        simulateTimeout: input.simulateTimeout ?? false,
        statusCode: String(input.statusCode),
      });
      return responseFromResponse(response);
    },
    async cloneResponse(input: ResponseCloneInput) {
      const response = await transport.post<RawApiInput>(
        API_ENDPOINTS.admin.responses.clone(input.responseId)
      );
      return responseFromResponse(response);
    },
    async deactivateResponse(input) {
      const response = await transport.put<RawApiInput, Record<string, never>>(
        API_ENDPOINTS.admin.responses.deactivate(
          input.endpointId,
          input.responseId
        ),
        {}
      );
      return responseFromResponse(response);
    },
    async deleteEndpoint(endpointSlug) {
      await transport.delete<RawApiInput>(
        API_ENDPOINTS.admin.endpoints.delete(endpointSlug)
      );
    },
    async deleteResponse(input) {
      await transport.delete<RawApiInput>(
        API_ENDPOINTS.admin.responses.detail(input.responseId)
      );
    },
    async getEndpoint(endpointSlug) {
      try {
        const response = await transport.get<RawApiInput>(
          API_ENDPOINTS.admin.endpoints.detail(endpointSlug)
        );
        return endpointFromResponse(response);
      } catch (error) {
        if (errorStatus(error) === HTTP_NOT_FOUND) {
          return null;
        }
        // SAFETY: API transport re-throws ApiError or unexpected network failure
        throw error as ApiError;
      }
    },
    async getHourlyMetrics(input) {
      const query = new URLSearchParams({ from: input.from, to: input.to });
      const response = await transport.get<RawApiInput>(
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
      return items.map((item) => {
        // SAFETY: listValue returns backend records consumed by the adapter mapper.
        return mapHourlyMetric(item as RawApiInput);
      });
    },
    async getMetricsSummary(endpointId) {
      const response = await transport.get<RawApiInput>(
        API_ENDPOINTS.admin.endpoints.metrics.summary(endpointId)
      );
      return mapMetric(metricsPayload(response));
    },
    async getTrafficLogDetail(endpointId, logId) {
      const response = await transport.get<RawApiInput>(
        API_ENDPOINTS.admin.endpoints.trafficLogs.detail(endpointId, logId)
      );
      const data = payload(response);
      return mapTrafficLogDetail(
        value(data, "log", "trafficLog", "traffic_log") ?? data
      );
    },
    async listEndpoints() {
      const response = await transport.get<RawApiInput>(
        API_ENDPOINTS.admin.endpoints.list
      );
      const data = payload(response);
      return listValue(data, "endpoints").map((item) => {
        // SAFETY: The endpoint list response is decoded as backend records by this adapter.
        return mapEndpoint(item as RawApiInput);
      });
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
      const response = await transport.get<RawApiInput>(
        `${API_ENDPOINTS.admin.endpoints.trafficLogs.list(input.endpointId)}?${params.toString()}`
      );
      const data = trafficPayload(response);
      const items = listValue(data, "items", "logs").map((item) => {
        // SAFETY: The traffic-log response is decoded as backend records by this adapter.
        return mapTrafficLog(item as RawApiInput);
      });
      return {
        hasMore: booleanValue(value(data, "hasMore", "has_more")),
        items,
        nextCursor: nullableString(value(data, "nextCursor", "next_cursor")),
      } satisfies EndpointTrafficLogsResult;
    },
    async updateEndpoint(input) {
      type UpdateEndpointPayload = Partial<{
        enabled: boolean;
        method: CreateEndpointInput["method"];
        url: string;
        biller_slug: string;
      }>;
      const payload: UpdateEndpointPayload = {};
      if (input.changes.enabled !== undefined) {
        payload.enabled = input.changes.enabled;
      }
      if (input.changes.method) {
        payload.method = input.changes.method;
      }
      if (input.changes.url) {
        payload.url = input.changes.url;
      }
      if (input.changes.billerSlug) {
        payload.biller_slug = input.changes.billerSlug;
      }

      const response = await transport.patch<
        RawApiInput,
        UpdateEndpointPayload
      >(API_ENDPOINTS.admin.endpoints.update(input.endpointSlug), payload);
      return endpointFromResponse(response);
    },
    async updateResponse(input) {
      const changes = Object.fromEntries(
        Object.entries(input.changes).map(([key, item]) => [
          key === "statusCode" ? key : key,
          key === "statusCode" ? String(item) : item,
        ])
      );
      const response = await transport.patch<
        RawApiInput,
        Record<string, string | number | boolean | undefined>
      >(API_ENDPOINTS.admin.responses.detail(input.responseId), changes);
      return responseFromResponse(response);
    },
    async updateResponseSimulation(input) {
      const response = await transport.patch<
        RawApiInput,
        {
          delayMs?: number;
          simulateTimeout?: boolean;
        }
      >(API_ENDPOINTS.admin.responses.updateSimulation(input.responseId), {
        delayMs: input.delayMs,
        simulateTimeout: input.simulateTimeout,
      });
      return responseFromResponse(response);
    },
  };
}

export const httpEndpointAdapter = createHttpEndpointAdapter();
