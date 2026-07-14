/**
 * API utility functions for data fetching
 * These utilities provide a consistent interface for making HTTP requests
 */

import { handleRefreshFailureOnce } from "@/features/auth/refresh-coordinator";
import {
  clearAuthToken,
  emitUnauthorizedEvent,
  getAuthToken,
  saveAuthToken,
  saveRefreshToken,
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
  auth?: boolean;
  baseUrl?: string;
  emitUnauthorized?: boolean;
  retryOnUnauthorized?: boolean;
  timeout?: number;
};

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_BASE_URL = "";
const HTTP_STATUS_UNAUTHORIZED = 401;

type UnauthorizedResult<T> =
  | {
      readonly data: T;
      readonly retried: true;
    }
  | {
      readonly retried: false;
    };

async function refreshAndRetry<T>(
  endpoint: string,
  config: FetchConfig
): Promise<T> {
  const { refreshToken } = await import(
    "@/features/auth/hooks/use-refresh-token"
  );
  const refreshResult = await refreshToken();
  saveAuthToken(refreshResult.accessToken);
  saveRefreshToken(refreshResult.refreshToken);

  return await apiFetch<T>(endpoint, {
    ...config,
    retryOnUnauthorized: false,
  });
}

async function handleUnauthorized<T>({
  auth,
  config,
  emitUnauthorized,
  endpoint,
  retryOnUnauthorized,
}: {
  readonly auth: boolean;
  readonly config: FetchConfig;
  readonly emitUnauthorized: boolean;
  readonly endpoint: string;
  readonly retryOnUnauthorized: boolean;
}): Promise<UnauthorizedResult<T>> {
  if (retryOnUnauthorized && auth) {
    try {
      return {
        data: await refreshAndRetry<T>(endpoint, config),
        retried: true,
      };
    } catch (error) {
      if (emitUnauthorized) {
        handleRefreshFailureOnce(error, () => {
          clearAuthToken();
          emitUnauthorizedEvent();
        });
      }
      return { retried: false };
    }
  }

  if (emitUnauthorized) {
    clearAuthToken();
    emitUnauthorizedEvent();
  }

  return { retried: false };
}

/**
 * Generic fetch wrapper with error handling and timeout
 */
export async function apiFetch<T>(
  endpoint: string,
  config: FetchConfig = {}
): Promise<T> {
  const {
    auth = true,
    baseUrl = DEFAULT_BASE_URL,
    emitUnauthorized = true,
    retryOnUnauthorized = true,
    timeout = DEFAULT_TIMEOUT,
    headers = {},
    ...rest
  } = config;

  const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const token = auth ? getAuthToken() : null;
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
        const retryResult = await handleUnauthorized<T>({
          auth,
          config,
          emitUnauthorized,
          endpoint,
          retryOnUnauthorized,
        });
        if (retryResult.retried) {
          return retryResult.data;
        }
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
