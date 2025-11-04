import { getAuthToken } from "@/features/auth/utils";
import { billerQueryKeys } from "@/features/billers/query-keys";
import type { Biller } from "@/features/billers/types";
import { getAdminBillerList } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";
import { createQueryHook } from "@/lib/query-hooks";

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
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found. Please login first.");
  }

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
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    },
  });

  return useQuery();
}
