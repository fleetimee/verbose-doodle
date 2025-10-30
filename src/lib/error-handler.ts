import { toast } from "sonner";
import type { ApiError } from "@/lib/api";

/**
 * Error message mapping for common error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  TIMEOUT: "Request timed out. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Invalid email or password.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "Resource not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

/**
 * HTTP status codes
 */
const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * HTTP status code to error code mapping
 */
const STATUS_TO_ERROR_CODE: Record<number, string> = {
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
  // Handle ApiError
  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError;

    // Use error code if available
    if (apiError.code && ERROR_MESSAGES[apiError.code]) {
      return ERROR_MESSAGES[apiError.code];
    }

    // Use status code if available
    if (apiError.status && STATUS_TO_ERROR_CODE[apiError.status]) {
      const errorCode = STATUS_TO_ERROR_CODE[apiError.status];
      return ERROR_MESSAGES[errorCode];
    }

    // Use the error message directly
    if (typeof apiError.message === "string") {
      return apiError.message;
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Default error message
  return "An unexpected error occurred. Please try again.";
}

/**
 * Show error toast notification
 */
export function showErrorToast(error: unknown, customMessage?: string) {
  const message = customMessage || getErrorMessage(error);

  toast.error("Error", {
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
    showErrorToast(error, "Invalid email or password. Please try again.");
    return;
  }

  if (apiError.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
    showErrorToast(error, "Too many login attempts. Please try again later.");
    return;
  }

  // Fallback to generic error handler
  showErrorToast(error);
}
