import { mockEndpoints } from "@/features/endpoints/data/mock-endpoints";
import type { Endpoint } from "@/features/endpoints/types";
import { createQueryHook } from "@/lib/query-hooks";

const SIMULATED_API_DELAY_MS = 500;

async function fetchEndpoint(id: string): Promise<Endpoint | undefined> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_API_DELAY_MS));

  return mockEndpoints.find((endpoint) => endpoint.id === id);
}

export function useGetEndpoint(id: string) {
  const useQuery = createQueryHook<Endpoint | undefined>({
    queryKey: ["endpoints", id],
    queryFn: () => fetchEndpoint(id),
    options: {
      staleTime: SIMULATED_API_DELAY_MS * 10,
      enabled: !!id,
    },
  });

  return useQuery();
}
