/**
 * Centralized API endpoint definitions
 * Single source of truth for all API routes
 *
 * Architecture:
 * - Administrative/Management APIs: /api/** prefix
 *   - /api/login, /api/refresh (public auth)
 *   - /api/users/** (ADMIN only)
 *   - /api/overview (authenticated)
 *   - /api/endpoint/** (GET: authenticated, POST/PUT/DELETE: ADMIN)
 *   - /api/response/** (ADMIN only)
 *   - /api/biller/** (ADMIN only)
 * - Dynamic Simulator Endpoints: Root level (/**)
 *   - Examples: /inquiry, /payment, /check-status
 *   - Public access (no authentication required)
 */

/**
 * Endpoint configuration
 * All administrative and auth endpoints use /api prefix
 */
export const API_ENDPOINTS = {
  /**
   * Admin endpoints - require authentication
   */
  admin: {
    endpoints: {
      list: "/api/endpoint",
      detail: (id: string | number) => `/api/endpoint/${id}`,
      create: "/api/endpoint",
      update: (id: string | number) => `/api/endpoint/${id}`,
      delete: (id: string | number) => `/api/endpoint/${id}`,
    },
    responses: {
      list: "/api/response",
      detail: (id: string | number) => `/api/response/${id}`,
      create: "/api/response",
      update: (id: string | number) => `/api/response/${id}`,
      delete: (id: string | number) => `/api/response/${id}`,
      activate: (endpointId: string | number, responseId: string | number) =>
        `/api/response/${endpointId}/${responseId}/activate`,
      deactivate: (endpointId: string | number, responseId: string | number) =>
        `/api/response/${endpointId}/${responseId}/deactivate`,
      updateSimulation: (id: string | number) =>
        `/api/response/${id}/simulation`,
    },
    billers: {
      list: "/api/biller",
      create: "/api/biller",
      update: (id: string | number) => `/api/biller/${id}`,
      delete: (id: string | number) => `/api/biller/${id}`,
    },
    users: {
      list: "/api/users",
      detail: (id: string | number) => `/api/users/${id}`,
      create: "/api/users/add",
      update: (id: string | number) => `/api/users/${id}`,
      delete: (id: string | number) => `/api/users/${id}`,
    },
    overview: "/api/overview",
  },

  /**
   * Public endpoints - no authentication required
   * These are for viewing public data via the /api prefix
   */
  public: {
    endpoints: {
      view: "/api/endpoint/public",
    },
    billers: {
      view: "/api/biller/public",
    },
  },

  /**
   * Authentication endpoints - all use /api prefix
   */
  auth: {
    login: "/api/login",
    refresh: "/api/refresh",
    logout: "/api/logout",
    register: "/api/register",
  },
} as const;

/**
 * Helper function to get admin endpoint list URL
 */
export function getAdminEndpointList(): string {
  return API_ENDPOINTS.admin.endpoints.list;
}

/**
 * Helper function to get public endpoint view URL
 */
export function getPublicEndpointView(): string {
  return API_ENDPOINTS.public.endpoints.view;
}

/**
 * Helper function to get admin biller list URL
 */
export function getAdminBillerList(): string {
  return API_ENDPOINTS.admin.billers.list;
}

/**
 * Helper function to get endpoint detail URL
 */
export function getEndpointDetailUrl(id: string | number): string {
  return API_ENDPOINTS.admin.endpoints.detail(id);
}

/**
 * Helper function to get endpoint update URL
 */
export function getEndpointUpdateUrl(id: string | number): string {
  return API_ENDPOINTS.admin.endpoints.update(id);
}

/**
 * Helper function to get endpoint delete URL
 */
export function getEndpointDeleteUrl(id: string | number): string {
  return API_ENDPOINTS.admin.endpoints.delete(id);
}

/**
 * Helper function to get login URL
 */
export function getLoginUrl(): string {
  return API_ENDPOINTS.auth.login;
}

/**
 * Helper function to get overview URL
 */
export function getOverviewUrl(): string {
  return API_ENDPOINTS.admin.overview;
}

/**
 * Helper function to get response create URL
 */
export function getResponseCreateUrl(): string {
  return API_ENDPOINTS.admin.responses.create;
}

/**
 * Helper function to get response activate URL
 */
export function getResponseActivateUrl(
  endpointId: string | number,
  responseId: string | number
): string {
  return API_ENDPOINTS.admin.responses.activate(endpointId, responseId);
}

/**
 * Helper function to get response deactivate URL
 */
export function getResponseDeactivateUrl(
  endpointId: string | number,
  responseId: string | number
): string {
  return API_ENDPOINTS.admin.responses.deactivate(endpointId, responseId);
}

/**
 * Helper function to get admin user list URL
 */
export function getAdminUserList(): string {
  return API_ENDPOINTS.admin.users.list;
}

/**
 * Helper function to get user create URL
 */
export function getUserCreateUrl(): string {
  return API_ENDPOINTS.admin.users.create;
}

/**
 * Helper function to get user detail URL
 */
export function getUserDetailUrl(id: string | number): string {
  return API_ENDPOINTS.admin.users.detail(id);
}

/**
 * Helper function to get user update URL
 */
export function getUserUpdateUrl(id: string | number): string {
  return API_ENDPOINTS.admin.users.update(id);
}

/**
 * Helper function to get user delete URL
 */
export function getUserDeleteUrl(id: string | number): string {
  return API_ENDPOINTS.admin.users.delete(id);
}

/**
 * Helper function to get response simulation update URL
 */
export function getResponseSimulationUrl(id: string | number): string {
  return API_ENDPOINTS.admin.responses.updateSimulation(id);
}
