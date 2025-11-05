/**
 * Centralized query keys for user-related queries
 * This ensures consistency across the app when invalidating/refetching
 */
export const userQueryKeys = {
  /**
   * Query key for all users list
   */
  all: ["users"] as const,

  /**
   * Query key for a specific user by ID
   */
  detail: (id: string | number) => ["users", id] as const,

  /**
   * Query key for users filtered by role (example)
   */
  byRole: (role: string) => ["users", "role", role] as const,
} as const;
