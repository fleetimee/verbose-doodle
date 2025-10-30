import { QueryClient } from "@tanstack/react-query";

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const ONE_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
const MINUTES_FOR_STALE_TIME = 5;
const MINUTES_FOR_CACHE_TIME = 10;
const FIVE_MINUTES = ONE_MINUTE * MINUTES_FOR_STALE_TIME;
const TEN_MINUTES = ONE_MINUTE * MINUTES_FOR_CACHE_TIME;
const DEFAULT_RETRY_COUNT = 1;

/**
 * Default configuration for React Query
 * Optimized for the Biller Simulator application
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
      gcTime: TEN_MINUTES,
      retry: DEFAULT_RETRY_COUNT,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: DEFAULT_RETRY_COUNT,
    },
  },
});
