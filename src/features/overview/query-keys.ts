/**
 * Centralized query keys for overview-related queries
 * This ensures consistency across the app when invalidating/refetching
 */

export const overviewQueryKeys = {
  /**
   * Query key for all overview data
   */
  all: ["overview"] as const,

  /**
   * Query key for overview statistics only
   */
  stats: ["overview", "stats"] as const,

  /**
   * Query key for user statistics (ADMIN only)
   */
  userStats: ["overview", "userStats"] as const,
} as const;
