/**
 * HTTP methods supported by the API
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Response entity for an endpoint
 */
export type EndpointResponse = {
  id: string;
  name: string;
  json: string;
  statusCode: number;
  activated: boolean;
  delayMs?: number;
  simulateTimeout?: boolean;
};

/**
 * Endpoint entity
 */
export type Endpoint = {
  id: string;
  slug: string;
  method: HttpMethod;
  url: string;
  billerSlug: string;
  billerName?: string;
  responses: EndpointResponse[];
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Raw API response structure for creating an endpoint
 */
type ApiCreateEndpointResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    endpoint: {
      id: number;
      slug: string;
      method: HttpMethod;
      url: string;
      biller_slug: string;
      biller_name: string;
    };
  };
};

/**
 * Processed response for creating an endpoint
 */
export type CreateEndpointResponse = {
  responseCode: string;
  responseDesc: string;
  endpoint: Endpoint;
};

/**
 * Raw API response type (exported for use in hooks)
 */
export type { ApiCreateEndpointResponse };

/**
 * API error for endpoint operations
 */
export type EndpointError = {
  message: string;
  code?: string;
  status?: number;
  field?: string;
};

/**
 * Grouped endpoints by biller
 */
export type GroupedEndpoints = {
  billerSlug: string;
  billerName: string;
  endpoints: Endpoint[];
};

export type EndpointTrafficLogStatus =
  | "matched_success"
  | "matched_empty"
  | "matched_timeout"
  | "matched_delayed"
  | "unmatched_endpoint"
  | "backend_error";

export type EndpointTrafficLog = {
  readonly id: string;
  readonly requestId: string;
  readonly occurredAt: string;
  readonly endpointId: string | null;
  readonly responseId: string | null;
  readonly billerId: string | null;
  readonly method: string;
  readonly path: string;
  readonly queryString: string | null;
  readonly matched: boolean;
  readonly hitStatus: EndpointTrafficLogStatus;
  readonly httpStatusCode: number | null;
  readonly responseName: string | null;
  readonly sourceIp: string;
  readonly sourcePort: number | null;
  readonly destinationIp: string | null;
  readonly destinationPort: number | null;
  readonly forwardedFor: string | null;
  readonly userAgent: string | null;
  readonly durationMs: number | null;
  readonly delayMs: number | null;
  readonly simulateTimeout: boolean;
  readonly requestBodyPreview: string | null;
  readonly responseBodyPreview: string | null;
};

export type EndpointTrafficLogDetail = EndpointTrafficLog & {
  readonly requestHeaders: Record<string, unknown> | null;
  readonly requestBody: unknown;
  readonly responseHeaders: Record<string, unknown> | null;
  readonly responseBody: unknown;
  readonly errorMessage: string | null;
};

export type EndpointTrafficLogStatusFilter = "all" | EndpointTrafficLogStatus;

export type EndpointTrafficLogsFilters = {
  readonly limit: number;
  readonly status: EndpointTrafficLogStatusFilter;
  readonly search: string;
  readonly includeBody: boolean;
};

export type EndpointTrafficLogsResult = {
  readonly items: EndpointTrafficLog[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
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
