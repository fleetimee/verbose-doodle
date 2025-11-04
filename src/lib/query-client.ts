import { QueryClient } from "@tanstack/react-query";
import { TIME_DURATIONS } from "@/lib/constants";

const DEFAULT_RETRY_COUNT = 1;

/**
 * Default configuration for React Query
 * Optimized for the Biller Simulator application
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
      gcTime: TIME_DURATIONS.TEN_MINUTES,
      retry: DEFAULT_RETRY_COUNT,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: DEFAULT_RETRY_COUNT,
    },
  },
});
