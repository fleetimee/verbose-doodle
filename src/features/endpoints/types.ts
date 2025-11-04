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
 * API response for creating an endpoint
 */
export type CreateEndpointResponse = {
  response_code: string;
  response_desc: string;
  endpoint: Endpoint;
};

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
