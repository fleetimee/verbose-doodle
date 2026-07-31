/**
 * API utility functions for data fetching
 * These utilities provide a consistent interface for making HTTP requests
 */

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

export type ApiSession = {
  getSnapshot: () => { readonly accessToken: string | null };
  refresh: () => Promise<unknown>;
  signOut: () => void;
};

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

export type ApiClientOptions = {
  session: ApiSession;
  fetch: ApiFetchImplementation;
};

export type ApiClient = {
  apiFetch: <T>(endpoint: string, config?: FetchConfig) => Promise<T>;
  apiGet: <T>(
    endpoint: string,
    config?: Omit<FetchConfig, "method" | "body">
  ) => Promise<T>;
  apiPost: <T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: Omit<FetchConfig, "method" | "body">
  ) => Promise<T>;
  apiPut: <T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: Omit<FetchConfig, "method" | "body">
  ) => Promise<T>;
  apiPatch: <T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: Omit<FetchConfig, "method" | "body">
  ) => Promise<T>;
  apiDelete: <T>(
    endpoint: string,
    config?: Omit<FetchConfig, "method" | "body">
  ) => Promise<T>;
};

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_BASE_URL = "";
const HTTP_STATUS_UNAUTHORIZED = 401;

type ApiFetchImplementation = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

type UnauthorizedResult<T> =
  | {
      readonly data: T;
      readonly retried: true;
    }
  | {
      readonly retried: false;
    };

async function fetchWithTimeout(
  fetchImplementation: ApiFetchImplementation,
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetchImplementation(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw {
        code: "TIMEOUT",
        message: "Request timeout",
      } as ApiError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return Promise.resolve(undefined as T);
  }

  return response.json();
}

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
    code: response.status.toString(),
    message,
    status: response.status,
  };
}

export function createApiClient({
  session,
  fetch,
}: ApiClientOptions): ApiClient {
  let refreshFailureHandled = false;
  let refreshOperation: Promise<unknown> | null = null;

  const signOutAfterRefreshFailure = () => {
    if (refreshFailureHandled) {
      return;
    }
    refreshFailureHandled = true;
    session.signOut();
  };

  const refreshSession = () => {
    if (refreshOperation) {
      return refreshOperation;
    }

    const operation = session.refresh().finally(() => {
      if (refreshOperation === operation) {
        refreshOperation = null;
      }
    });
    refreshOperation = operation;
    return operation;
  };

  const retryUnauthorized = async <T>(
    request: () => Promise<T>,
    emitUnauthorized: boolean
  ): Promise<UnauthorizedResult<T>> => {
    try {
      await refreshSession();
      const data = await request();
      refreshFailureHandled = false;
      return { data, retried: true };
    } catch {
      if (emitUnauthorized) {
        signOutAfterRefreshFailure();
      }
      return { retried: false };
    }
  };

  const apiFetch = async <T>(
    endpoint: string,
    config: FetchConfig = {}
  ): Promise<T> => {
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

    const accessToken = auth ? session.getSnapshot().accessToken : null;
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...headers,
    };
    const response = await fetchWithTimeout(
      fetch,
      url,
      { ...rest, headers: requestHeaders },
      timeout
    );

    if (
      !response.ok &&
      response.status === HTTP_STATUS_UNAUTHORIZED &&
      retryOnUnauthorized &&
      auth
    ) {
      const retryResult = await retryUnauthorized(
        () =>
          apiFetch<T>(endpoint, {
            ...config,
            emitUnauthorized: false,
            retryOnUnauthorized: false,
          }),
        emitUnauthorized
      );
      if (retryResult.retried) {
        return retryResult.data;
      }
    }

    if (
      !response.ok &&
      response.status === HTTP_STATUS_UNAUTHORIZED &&
      auth &&
      emitUnauthorized &&
      !retryOnUnauthorized
    ) {
      session.signOut();
    }

    if (!response.ok) {
      throw await createApiError(response);
    }

    return parseResponse<T>(response);
  };

  const apiGet = <T>(
    endpoint: string,
    config?: Omit<FetchConfig, "method" | "body">
  ): Promise<T> => apiFetch<T>(endpoint, { ...config, method: "GET" });

  const apiPost = <T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: Omit<FetchConfig, "method" | "body">
  ): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...config,
      body: JSON.stringify(data),
      method: "POST",
    });

  const apiPut = <T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: Omit<FetchConfig, "method" | "body">
  ): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...config,
      body: JSON.stringify(data),
      method: "PUT",
    });

  const apiPatch = <T, D = unknown>(
    endpoint: string,
    data?: D,
    config?: Omit<FetchConfig, "method" | "body">
  ): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...config,
      body: JSON.stringify(data),
      method: "PATCH",
    });

  const apiDelete = <T>(
    endpoint: string,
    config?: Omit<FetchConfig, "method" | "body">
  ): Promise<T> => apiFetch<T>(endpoint, { ...config, method: "DELETE" });

  return {
    apiDelete,
    apiFetch,
    apiGet,
    apiPatch,
    apiPost,
    apiPut,
  };
}

const defaultSession: ApiSession = {
  getSnapshot: () => ({ accessToken: null }),
  refresh: () => Promise.reject(new Error("No default session configured")),
  signOut: () => undefined,
};

const defaultFetch: ApiFetchImplementation = (input, init) =>
  globalThis.fetch(input, init);

let defaultClient = createApiClient({
  fetch: defaultFetch,
  session: defaultSession,
});

export function setDefaultApiSession(session: ApiSession): void {
  defaultClient = createApiClient({ fetch: defaultFetch, session });
}

export function apiFetch<T>(
  endpoint: string,
  config: FetchConfig = {}
): Promise<T> {
  return defaultClient.apiFetch<T>(endpoint, config);
}

export function apiGet<T>(
  endpoint: string,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return defaultClient.apiGet<T>(endpoint, config);
}

export function apiPost<T, D = unknown>(
  endpoint: string,
  data?: D,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return defaultClient.apiPost<T, D>(endpoint, data, config);
}

export function apiPut<T, D = unknown>(
  endpoint: string,
  data?: D,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return defaultClient.apiPut<T, D>(endpoint, data, config);
}

export function apiPatch<T, D = unknown>(
  endpoint: string,
  data?: D,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return defaultClient.apiPatch<T, D>(endpoint, data, config);
}

export function apiDelete<T>(
  endpoint: string,
  config?: Omit<FetchConfig, "method" | "body">
): Promise<T> {
  return defaultClient.apiDelete<T>(endpoint, config);
}
