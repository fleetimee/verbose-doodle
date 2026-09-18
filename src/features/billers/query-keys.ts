/**
 * Query keys for biller-related queries
 * Centralized to ensure consistent cache management
 */

export const billerQueryKeys = {
  all: ["billers"] as const,
  detail: (slug: string) => [...billerQueryKeys.details(), slug] as const,
  details: () => [...billerQueryKeys.all, "detail"] as const,
  list: (
    filters?: Readonly<
      Record<string, string | number | boolean | null | undefined>
    >
  ) => [...billerQueryKeys.lists(), filters] as const,
  lists: () => [...billerQueryKeys.all, "list"] as const,
};
