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
   * Query key for endpoint traffic logs
   */
  trafficLogs: (id: string | number, filters: Record<string, unknown>) =>
    ["endpoints", id, "traffic-logs", filters] as const,

  /**
   * Query key for endpoint traffic log detail
   */
  trafficLogDetail: (id: string | number, logId: string | number) =>
    ["endpoints", id, "traffic-logs", logId] as const,

  /**
   * Query key for endpoints filtered by biller
   */
  byBiller: (billerId: number) => ["endpoints", "biller", billerId] as const,
} as const;
