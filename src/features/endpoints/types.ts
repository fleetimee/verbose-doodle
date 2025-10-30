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
  groupId: string;
  responses: EndpointResponse[];
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Endpoint Group entity
 */
export type EndpointGroup = {
  id: string;
  name: string;
  endpoints?: Endpoint[];
  createdAt?: string;
  updatedAt?: string;
};

/**
 * API response for creating an endpoint group
 */
export type CreateEndpointGroupResponse = {
  success: boolean;
  data: EndpointGroup;
  message: string;
};

/**
 * API response for creating an endpoint
 */
export type CreateEndpointResponse = {
  success: boolean;
  data: Endpoint;
  message: string;
};

/**
 * API error for endpoint group operations
 */
export type EndpointGroupError = {
  message: string;
  code?: string;
  field?: string;
};
