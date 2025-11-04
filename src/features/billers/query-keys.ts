/**
 * Query keys for biller-related queries
 * Centralized to ensure consistent cache management
 */

export const billerQueryKeys = {
  all: ["billers"] as const,
  lists: () => [...billerQueryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...billerQueryKeys.lists(), filters] as const,
  details: () => [...billerQueryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...billerQueryKeys.details(), id] as const,
};
