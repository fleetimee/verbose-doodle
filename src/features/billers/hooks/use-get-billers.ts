import { billerQueryKeys } from "@/features/billers/query-keys";
import type { Biller } from "@/features/billers/types";
import { apiGet } from "@/lib/api";
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
  const data = await apiGet<ApiResponse>(getAdminBillerList());

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
