import { QueryClient } from "@tanstack/react-query";
import { TIME_DURATIONS } from "@/lib/constants";

const DEFAULT_RETRY_COUNT = 1;

/**
 * Default configuration for React Query
 * Optimized for the Fleetime Labs application
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: DEFAULT_RETRY_COUNT,
    },
    queries: {
      gcTime: TIME_DURATIONS.TEN_MINUTES,
      refetchOnWindowFocus: false,
      retry: DEFAULT_RETRY_COUNT,
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    },
  },
});
