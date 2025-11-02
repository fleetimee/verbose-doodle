export const HTTP_STATUS_CODES = [
  // 2xx Success
  { value: 200, label: "200 - OK", description: "Successful request" },
  { value: 201, label: "201 - Created", description: "Resource created" },
  {
    value: 202,
    label: "202 - Accepted",
    description: "Request accepted for processing",
  },
  {
    value: 204,
    label: "204 - No Content",
    description: "Success with no response body",
  },

  // 3xx Redirection
  {
    value: 301,
    label: "301 - Moved Permanently",
    description: "Resource permanently moved",
  },
  { value: 302, label: "302 - Found", description: "Temporary redirect" },
  {
    value: 304,
    label: "304 - Not Modified",
    description: "Use cached version",
  },

  // 4xx Client Errors
  { value: 400, label: "400 - Bad Request", description: "Invalid request" },
  {
    value: 401,
    label: "401 - Unauthorized",
    description: "Authentication required",
  },
  { value: 403, label: "403 - Forbidden", description: "Access denied" },
  { value: 404, label: "404 - Not Found", description: "Resource not found" },
  {
    value: 405,
    label: "405 - Method Not Allowed",
    description: "HTTP method not supported",
  },
  {
    value: 409,
    label: "409 - Conflict",
    description: "Request conflicts with current state",
  },
  {
    value: 422,
    label: "422 - Unprocessable Entity",
    description: "Validation failed",
  },
  {
    value: 429,
    label: "429 - Too Many Requests",
    description: "Rate limit exceeded",
  },

  // 5xx Server Errors
  {
    value: 500,
    label: "500 - Internal Server Error",
    description: "Server error",
  },
  {
    value: 501,
    label: "501 - Not Implemented",
    description: "Feature not supported",
  },
  {
    value: 502,
    label: "502 - Bad Gateway",
    description: "Invalid response from upstream",
  },
  {
    value: 503,
    label: "503 - Service Unavailable",
    description: "Server temporarily unavailable",
  },
  {
    value: 504,
    label: "504 - Gateway Timeout",
    description: "Upstream server timeout",
  },
] as const;

// HTTP status code range constants
export const STATUS_SUCCESS_MIN = 200;
export const STATUS_SUCCESS_MAX = 300;
export const STATUS_REDIRECT_MIN = 300;
export const STATUS_REDIRECT_MAX = 400;
export const STATUS_CLIENT_ERROR_MIN = 400;
export const STATUS_CLIENT_ERROR_MAX = 500;
export const STATUS_SERVER_ERROR_MIN = 500;
