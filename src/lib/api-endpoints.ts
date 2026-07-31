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
    billers: {
      create: "/api/biller",
      delete: (slug: string) => `/api/biller/${slug}`,
      list: "/api/biller",
      update: (slug: string) => `/api/biller/${slug}`,
    },
    endpoints: {
      create: "/api/endpoint",
      delete: (slug: string) => `/api/endpoint/${slug}`,
      detail: (slug: string) => `/api/endpoint/${slug}`,
      list: "/api/endpoint",
      metrics: {
        hourly: (id: string | number) => `/api/endpoint/${id}/metrics/hourly`,
        summary: (id: string | number) => `/api/endpoint/${id}/metrics`,
      },
      trafficLogs: {
        clear: (id: string | number) => `/api/endpoint/${id}/traffic-logs`,
        detail: (id: string | number, logId: string | number) =>
          `/api/endpoint/${id}/traffic-logs/${logId}`,
        download: (id: string | number) =>
          `/api/endpoint/${id}/traffic-logs/download`,
        list: (id: string | number) => `/api/endpoint/${id}/traffic-logs`,
      },
      update: (slug: string) => `/api/endpoint/${slug}`,
    },
    overview: "/api/overview",
    responses: {
      activate: (endpointId: string | number, responseId: string | number) =>
        `/api/response/${endpointId}/${responseId}/activate`,
      clone: (id: string | number) => `/api/response/${id}/clone`,
      create: "/api/response",
      deactivate: (endpointId: string | number, responseId: string | number) =>
        `/api/response/${endpointId}/${responseId}/deactivate`,
      delete: (id: string | number) => `/api/response/${id}`,
      detail: (id: string | number) => `/api/response/${id}`,
      list: "/api/response",
      update: (id: string | number) => `/api/response/${id}`,
      updateSimulation: (id: string | number) =>
        `/api/response/${id}/simulation`,
    },
    users: {
      create: "/api/users/add",
      delete: (id: string | number) => `/api/users/${id}`,
      detail: (id: string | number) => `/api/users/${id}`,
      list: "/api/users",
      update: (id: string | number) => `/api/users/${id}`,
    },
  },

  /**
   * Authentication endpoints - all use /api prefix
   */
  auth: {
    login: "/api/login",
    logout: "/api/logout",
    refresh: "/api/refresh",
    register: "/api/register",
  },

  /**
   * Public endpoints - no authentication required
   * These are for viewing public data via the /api prefix
   */
  public: {
    billers: {
      view: "/api/biller/public",
    },
    endpoints: {
      view: "/api/endpoint/public",
    },
  },
} as const;

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

export function getAdminBillerCreateUrl(): string {
  return API_ENDPOINTS.admin.billers.create;
}

export function getAdminBillerUpdateUrl(slug: string): string {
  return API_ENDPOINTS.admin.billers.update(slug);
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
