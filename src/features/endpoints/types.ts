/**
 * Endpoint Group entity
 */
export type EndpointGroup = {
  id: string;
  name: string;
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
 * API error for endpoint group operations
 */
export type EndpointGroupError = {
  message: string;
  code?: string;
  field?: string;
};
