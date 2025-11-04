import { getAuthToken } from "@/features/auth/utils";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import type {
  ApiOverviewResponse,
  OverviewData,
} from "@/features/overview/types";
import { getOverviewUrl } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";
import { createQueryHook } from "@/lib/query-hooks";

/**
 * Fetch overview data from API
 */
async function fetchOverview(): Promise<OverviewData> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found. Please login first.");
  }

  const response = await fetch(getOverviewUrl(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch overview data: ${response.statusText}`);
  }

  const apiResponse = (await response.json()) as ApiOverviewResponse;

  return apiResponse.data;
}

/**
 * Custom hook for fetching overview data
 * Returns all dashboard statistics and charts data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGetOverview();
 *
 * if (isLoading) return <LoadingSkeleton />;
 * if (error) return <Error message={error.message} />;
 *
 * return <StatsCards stats={data.stats} />;
 * ```
 */
export function useGetOverview() {
  const useQuery = createQueryHook<OverviewData>({
    queryKey: overviewQueryKeys.all,
    queryFn: fetchOverview,
    options: {
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    },
  });

  return useQuery();
}
