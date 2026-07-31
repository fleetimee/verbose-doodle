import {
  type ApiBillerListResponse,
  mapBillerList,
} from "@/features/billers/data/http-biller-adapter";
import { billerQueryKeys } from "@/features/billers/query-keys";
import type { Biller } from "@/features/billers/types";
import { apiGet } from "@/lib/api";
import { getAdminBillerList } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";
import { createQueryHook } from "@/lib/query-hooks";

async function fetchBillers(): Promise<Biller[]> {
  const response = await apiGet<ApiBillerListResponse>(getAdminBillerList());
  return mapBillerList(response);
}

export function useGetBillers() {
  const useQuery = createQueryHook<Biller[]>({
    options: {
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    },
    queryFn: fetchBillers,
    queryKey: billerQueryKeys.all,
  });

  return useQuery();
}
