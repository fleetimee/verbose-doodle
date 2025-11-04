/**
 * Centralized query keys for endpoint-related queries
 * This ensures consistency across the app when invalidating/refetching
 */

export const endpointQueryKeys = {
  /**
   * Query key for all endpoints list
   */
  all: ["endpoints"] as const,

  /**
   * Query key for a specific endpoint by ID
   */
  detail: (id: string | number) => ["endpoints", id] as const,

  /**
   * Query key for endpoints filtered by biller
   */
  byBiller: (billerId: number) => ["endpoints", "biller", billerId] as const,
} as const;
