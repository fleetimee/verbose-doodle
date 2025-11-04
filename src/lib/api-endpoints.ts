/**
 * Centralized API endpoint definitions
 * Single source of truth for all API routes
 */

/**
 * Endpoint configuration
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
    billers: {
      list: "/api/biller",
      create: "/api/biller",
      update: (id: string | number) => `/api/biller/${id}`,
      delete: (id: string | number) => `/api/biller/${id}`,
    },
    overview: "/api/overview",
  },

  /**
   * Public endpoints - no authentication required
   */
  public: {
    endpoints: {
      view: "/endpoint",
    },
    billers: {
      view: "/biller",
    },
  },

  /**
   * Authentication endpoints
   */
  auth: {
    login: "/login",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    register: "/api/auth/register",
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
