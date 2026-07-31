export const HTTP_STATUS_CODES = [
  // 2xx Success
  { description: "Successful request", label: "200 - OK", value: 200 },
  { description: "Resource created", label: "201 - Created", value: 201 },
  {
    description: "Request accepted for processing",
    label: "202 - Accepted",
    value: 202,
  },
  {
    description: "Success with no response body",
    label: "204 - No Content",
    value: 204,
  },

  // 3xx Redirection
  {
    description: "Resource permanently moved",
    label: "301 - Moved Permanently",
    value: 301,
  },
  { description: "Temporary redirect", label: "302 - Found", value: 302 },
  {
    description: "Use cached version",
    label: "304 - Not Modified",
    value: 304,
  },

  // 4xx Client Errors
  { description: "Invalid request", label: "400 - Bad Request", value: 400 },
  {
    description: "Authentication required",
    label: "401 - Unauthorized",
    value: 401,
  },
  { description: "Access denied", label: "403 - Forbidden", value: 403 },
  { description: "Resource not found", label: "404 - Not Found", value: 404 },
  {
    description: "HTTP method not supported",
    label: "405 - Method Not Allowed",
    value: 405,
  },
  {
    description: "Request conflicts with current state",
    label: "409 - Conflict",
    value: 409,
  },
  {
    description: "Validation failed",
    label: "422 - Unprocessable Entity",
    value: 422,
  },
  {
    description: "Rate limit exceeded",
    label: "429 - Too Many Requests",
    value: 429,
  },

  // 5xx Server Errors
  {
    description: "Server error",
    label: "500 - Internal Server Error",
    value: 500,
  },
  {
    description: "Feature not supported",
    label: "501 - Not Implemented",
    value: 501,
  },
  {
    description: "Invalid response from upstream",
    label: "502 - Bad Gateway",
    value: 502,
  },
  {
    description: "Server temporarily unavailable",
    label: "503 - Service Unavailable",
    value: 503,
  },
  {
    description: "Upstream server timeout",
    label: "504 - Gateway Timeout",
    value: 504,
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
