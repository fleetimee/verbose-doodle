import { billerQueryKeys } from "@/features/billers/query-keys";
import type { Biller } from "@/features/billers/types";
import { getAdminBillerList } from "@/lib/api-endpoints";
import { createQueryHook } from "@/lib/query-hooks";

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_TO_MS = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
const STALE_TIME_MINUTES = 5;
const FIVE_MINUTES_IN_MS = STALE_TIME_MINUTES * MINUTES_TO_MS;

type ApiBiller = {
  id: number;
  biller_name: string;
};

type ApiResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    billers: ApiBiller[];
  };
};

async function fetchBillers(): Promise<Biller[]> {
  const token = import.meta.env.VITE_API_TOKEN;

  const response = await fetch(getAdminBillerList(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch billers: ${response.statusText}`);
  }

  const data = (await response.json()) as ApiResponse;

  return data.data.billers.map((apiBiller) => ({
    id: apiBiller.id,
    name: apiBiller.biller_name,
  }));
}

export function useGetBillers() {
  const useQuery = createQueryHook<Biller[]>({
    queryKey: billerQueryKeys.all,
    queryFn: fetchBillers,
    options: {
      staleTime: FIVE_MINUTES_IN_MS,
    },
  });

  return useQuery();
}
