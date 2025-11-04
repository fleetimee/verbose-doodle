import { getAuthToken } from "@/features/auth/utils";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import type {
  ApiOverviewResponse,
  OverviewData,
} from "@/features/overview/types";
import { getOverviewUrl } from "@/lib/api-endpoints";
import { createQueryHook } from "@/lib/query-hooks";

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_TO_MS = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
const STALE_TIME_MINUTES = 5;
const FIVE_MINUTES_IN_MS = STALE_TIME_MINUTES * MINUTES_TO_MS;

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
      staleTime: FIVE_MINUTES_IN_MS,
    },
  });

  return useQuery();
}
