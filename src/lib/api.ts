/**
 * API utility functions for data fetching
 * These utilities provide a consistent interface for making HTTP requests
 */

import {
  clearAuthToken,
  emitUnauthorizedEvent,
  getAuthToken,
} from "@/features/auth/utils";

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

/**
 * Creates an ApiError from a Response object
 */
async function createApiError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`;

  try {
    const data = await response.json();
    // Check for both 'message' and 'responseDesc' fields
    // responseDesc is commonly used in the biller API responses
    if (data.responseDesc) {
      message = data.responseDesc;
    } else if (data.message) {
      message = data.message;
    }
  } catch {
    message = response.statusText || message;
  }

  return {
    message,
    status: response.status,
    code: response.status.toString(),
  };
}

/**
 * Configuration options for API requests
 */
export type FetchConfig = RequestInit & {
  baseUrl?: string;
  timeout?: number;
};

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_BASE_URL = "";
const HTTP_STATUS_UNAUTHORIZED = 401;

/**
 * Generic fetch wrapper with error handling and timeout
 */
export async function apiFetch<T>(
  endpoint: string,
  config: FetchConfig = {}
): Promise<T> {
  const {
    baseUrl = DEFAULT_BASE_URL,
    timeout = DEFAULT_TIMEOUT,
    headers = {},
    ...rest
  } = config;

  const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const token = getAuthToken();
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  };

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === HTTP_STATUS_UNAUTHORIZED) {
        clearAuthToken();
        emitUnauthorizedEvent();
      }
      throw await createApiError(response);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw {
        message: "Request timeout",
        code: "TIMEOUT",
      } as ApiError;
    }

    throw error;
  }
}

/**
 * GET request helper
 */
export function apiGet<T>(
  endpoint: string,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return apiFetch<T>(endpoint, { ...config, method: "GET" });
}

/**
 * POST request helper
 */
export function apiPost<T, D = unknown>(
  endpoint: string,
  data?: D,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...config,
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export function apiPut<T, D = unknown>(
  endpoint: string,
  data?: D,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...config,
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request helper
 */
export function apiPatch<T, D = unknown>(
  endpoint: string,
  data?: D,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return apiFetch<T>(endpoint, {
    ...config,
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(
  endpoint: string,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return apiFetch<T>(endpoint, { ...config, method: "DELETE" });
}
