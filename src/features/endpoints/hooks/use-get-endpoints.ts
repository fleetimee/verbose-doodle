import { mockEndpoints } from "@/features/endpoints/data/mock-endpoints";
import type { Endpoint } from "@/features/endpoints/types";
import { createQueryHook } from "@/lib/query-hooks";

const SIMULATED_API_DELAY_MS = 800;

async function fetchEndpoints(): Promise<Endpoint[]> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_API_DELAY_MS));

  return mockEndpoints;
}

export function useGetEndpoints() {
  const useQuery = createQueryHook<Endpoint[]>({
    queryKey: ["endpoints"],
    queryFn: fetchEndpoints,
    options: {
      staleTime: SIMULATED_API_DELAY_MS * 10,
    },
  });

  return useQuery();
}
