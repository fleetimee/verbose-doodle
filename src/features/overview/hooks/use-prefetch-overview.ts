import { useQueryClient } from "@tanstack/react-query";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import type {
  ApiOverviewResponse,
  OverviewData,
} from "@/features/overview/types";
import { apiGet } from "@/lib/api";
import { getOverviewUrl } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";

/**
 * Fetch overview data from API
 */
async function fetchOverview(): Promise<OverviewData> {
  const apiResponse = await apiGet<ApiOverviewResponse>(getOverviewUrl());
  return apiResponse.data;
}

/**
 * Hook to prefetch overview data on hover
 * Implements the 100ms rule - prefetches immediately so click feels instantaneous
 */
export function usePrefetchOverview() {
  const queryClient = useQueryClient();

  const prefetchOverview = () => {
    // Prefetch immediately on hover - no delay
    // This ensures when user clicks, data is already cached (< 100ms response)
    queryClient.prefetchQuery({
      queryKey: overviewQueryKeys.all,
      queryFn: fetchOverview,
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    });
  };

  return { prefetchOverview };
}
