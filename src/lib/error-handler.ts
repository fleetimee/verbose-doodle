import { toast } from "sonner";
import type { ApiError } from "@/lib/api";
import { messages } from "@/lib/i18n";

interface ErrorMessageRegistry {
  [code: string]: string;
}

/**
 * Error message mapping for common error codes
 */
function getErrorMessages(): ErrorMessageRegistry {
  return {
    FORBIDDEN: messages.errors.accessDenied,
    NETWORK_ERROR: messages.errors.networkError,
    NOT_FOUND: messages.errors.notFound,
    SERVER_ERROR: messages.errors.serverError,
    TIMEOUT: messages.errors.timeout,
    UNAUTHORIZED: messages.errors.invalidCredentials,
    VALIDATION_ERROR: messages.errors.validationError,
  };
}

/**
 * HTTP status codes
 */
const HTTP_STATUS = {
  BAD_GATEWAY: 502,
  FORBIDDEN: 403,
  GATEWAY_TIMEOUT: 504,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  SERVICE_UNAVAILABLE: 503,
  TOO_MANY_REQUESTS: 429,
  UNAUTHORIZED: 401,
  VALIDATION_ERROR: 422,
} as const;

interface StatusErrorCodeRegistry {
  [status: number]: string;
}

/**
 * HTTP status code to error code mapping
 */
const STATUS_TO_ERROR_CODE: StatusErrorCodeRegistry = {
  [HTTP_STATUS.UNAUTHORIZED]: "UNAUTHORIZED",
  [HTTP_STATUS.FORBIDDEN]: "FORBIDDEN",
  [HTTP_STATUS.NOT_FOUND]: "NOT_FOUND",
  [HTTP_STATUS.VALIDATION_ERROR]: "VALIDATION_ERROR",
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: "SERVER_ERROR",
  [HTTP_STATUS.BAD_GATEWAY]: "SERVER_ERROR",
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: "SERVER_ERROR",
  [HTTP_STATUS.GATEWAY_TIMEOUT]: "TIMEOUT",
};

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: unknown): string {
  const errorMessages = getErrorMessages();

  // Handle ApiError
  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError;

    if (apiError.code && errorMessages[apiError.code]) {
      return errorMessages[apiError.code];
    }

    if (apiError.status && STATUS_TO_ERROR_CODE[apiError.status]) {
      const errorCode = STATUS_TO_ERROR_CODE[apiError.status];
      return errorMessages[errorCode];
    }

    if (typeof apiError.message === "string" && apiError.message) {
      return apiError.message;
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return errorMessages.NETWORK_ERROR;
  }

  // Default error message
  return messages.errors.unexpectedError;
}

/**
 * Show error toast notification
 */
export function showErrorToast(error: unknown, customMessage?: string) {
  const message = customMessage || getErrorMessage(error);

  toast.error(messages.errors.errorTitle, {
    description: message,
    duration: 5000,
  });
}

/**
 * Show success toast notification
 */
export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
    duration: 4000,
  });
}

/**
 * Show info toast notification
 */
export function showInfoToast(message: string, description?: string) {
  toast.info(message, {
    description,
    duration: 4000,
  });
}

/**
 * Show warning toast notification
 */
export function showWarningToast(message: string, description?: string) {
  toast.warning(message, {
    description,
    duration: 4000,
  });
}

/**
 * Handle authentication errors specifically
 */
export function handleAuthError(error: unknown) {
  const apiError = error as ApiError;

  // Handle specific auth error cases
  if (apiError.status === HTTP_STATUS.UNAUTHORIZED) {
    showErrorToast(error, messages.errors.invalidCredentialsRetry);
    return;
  }

  if (apiError.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
    showErrorToast(error, messages.errors.tooManyLoginAttempts);
    return;
  }

  // Fallback to generic error handler
  showErrorToast(error);
}
