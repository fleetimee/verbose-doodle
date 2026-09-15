import { messages } from "@/lib/i18n";

export const HTTP_STATUS_CODES = [
  // 2xx Success
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.successfulRequest;
    },
    label: "200 - OK",
    value: 200,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.resourceCreated;
    },
    label: "201 - Created",
    value: 201,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.acceptedProcessing;
    },
    label: "202 - Accepted",
    value: 202,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.successNoResponseBody;
    },
    label: "204 - No Content",
    value: 204,
  },

  // 3xx Redirection
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.resourcePermanentlyMoved;
    },
    label: "301 - Moved Permanently",
    value: 301,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.temporaryRedirect;
    },
    label: "302 - Found",
    value: 302,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.useCachedVersion;
    },
    label: "304 - Not Modified",
    value: 304,
  },

  // 4xx Client Errors
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.invalidRequest;
    },
    label: "400 - Bad Request",
    value: 400,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.authenticationRequired;
    },
    label: "401 - Unauthorized",
    value: 401,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.accessDenied;
    },
    label: "403 - Forbidden",
    value: 403,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.resourceNotFound;
    },
    label: "404 - Not Found",
    value: 404,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.httpMethodNotSupported;
    },
    label: "405 - Method Not Allowed",
    value: 405,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.requestConflict;
    },
    label: "409 - Conflict",
    value: 409,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.validationFailed;
    },
    label: "422 - Unprocessable Entity",
    value: 422,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.rateLimitExceeded;
    },
    label: "429 - Too Many Requests",
    value: 429,
  },

  // 5xx Server Errors
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.serverError;
    },
    label: "500 - Internal Server Error",
    value: 500,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.featureNotSupported;
    },
    label: "501 - Not Implemented",
    value: 501,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.invalidUpstreamResponse;
    },
    label: "502 - Bad Gateway",
    value: 502,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions
        .serverTemporarilyUnavailable;
    },
    label: "503 - Service Unavailable",
    value: 503,
  },
  {
    get description() {
      return messages.endpoints.httpStatusDescriptions.upstreamServerTimeout;
    },
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
