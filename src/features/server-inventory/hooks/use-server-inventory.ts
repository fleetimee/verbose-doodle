import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteServerEntry,
  fetchAccessTypes,
  fetchServerEntries,
  fetchServerHosts,
  saveServerEntry,
} from "@/features/server-inventory/api";
import type {
  ServerEntry,
  ServerEntryRequest,
  ServerInventoryQuery,
} from "@/features/server-inventory/types";
import type { ApiError } from "@/lib/api";
import { createMutationHook, createQueryHook } from "@/lib/query-hooks";

export const serverInventoryKeys = {
  all: ["server-inventory"] as const,
  entries: ["server-inventory", "entries"] as const,
  hosts: ["server-inventory", "hosts"] as const,
  accessTypes: ["server-inventory", "access-types"] as const,
};

const useHosts = createQueryHook<string[]>({
  queryFn: fetchServerHosts,
  queryKey: serverInventoryKeys.hosts,
});

const useAccessTypes = createQueryHook<string[]>({
  queryFn: fetchAccessTypes,
  queryKey: serverInventoryKeys.accessTypes,
});

export function useServerInventory(query: ServerInventoryQuery) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: serverInventoryKeys.all });
  const useSave = createMutationHook<
    ServerEntry,
    { id?: string; request: ServerEntryRequest },
    ApiError
  >(saveServerEntry, {
    gcTime: 0,
    onSuccess: invalidate,
    retry: false,
  });
  const useDelete = createMutationHook<unknown, string, ApiError>(
    deleteServerEntry,
    {
      onSuccess: invalidate,
      retry: false,
    }
  );
  return {
    accessTypes: useAccessTypes(),
    hosts: useHosts(),
    entries: useQuery({
      queryKey: [...serverInventoryKeys.entries, query],
      queryFn: () => fetchServerEntries(query),
      placeholderData: keepPreviousData,
    }),
    save: useSave(),
    remove: useDelete(),
  };
}
