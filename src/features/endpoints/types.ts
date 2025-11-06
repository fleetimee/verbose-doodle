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
  method: HttpMethod;
  url: string;
  billerId: number;
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
      method: HttpMethod;
      url: string;
      biller_id: number;
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
  billerId: number;
  billerName: string;
  endpoints: Endpoint[];
};
