import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchServerEntries,
  fetchServerMetrics,
} from "@/features/server-inventory/api";
import type { ServerEntry } from "@/features/server-inventory/types";

let activeChecks = 0;
const waitingChecks: (() => void)[] = [];

async function checkWindowsMetrics(entry: ServerEntry, signal: AbortSignal) {
  if (activeChecks >= 4) {
    await new Promise<void>((resolve) => waitingChecks.push(resolve));
  } else {
    activeChecks += 1;
  }
  try {
    signal.throwIfAborted();
    return await fetchServerMetrics(entry.id, signal);
  } finally {
    const next = waitingChecks.shift();
    if (next) {
      next();
    } else {
      activeChecks -= 1;
    }
  }
}

function preferredHosts(entries: ServerEntry[]) {
  const hosts = new Map<string, ServerEntry>();
  const usable = (entry: ServerEntry) =>
    Boolean(entry.hasPassword && entry.username);
  for (const entry of entries) {
    const current = hosts.get(entry.host);
    if (
      !current ||
      (!usable(current) && usable(entry)) ||
      (usable(current) === usable(entry) &&
        current.accessType === "RDP" &&
        entry.accessType === "SSH")
    ) {
      hosts.set(entry.host, entry);
    }
  }
  return [...hosts.values()];
}

export function useMetricHosts(search: string, paused: boolean) {
  const entries = useQuery({
    queryKey: ["server-inventory", "metrics-entries", search],
    queryFn: async ({ signal }) => {
      const hosts: ServerEntry[] = [];
      let page = 0;
      let pages = 1;
      while (page < pages) {
        signal.throwIfAborted();
        const result = await fetchServerEntries(
          {
            accessType: "METRICS",
            databaseEngine: "",
            direction: "asc",
            page,
            search,
            size: 100,
            sortBy: "name",
          },
          signal
        );
        hosts.push(...result.servers);
        pages = result.totalPages;
        page += 1;
      }
      return preferredHosts(hosts);
    },
  });
  const hosts = entries.data ?? [];
  const windows = hosts.filter((entry) => entry.accessType === "RDP");
  const checks = useQueries({
    queries: windows.map((entry) => ({
      queryKey: ["server-inventory", "metrics", entry.id, entry.updatedAt],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        checkWindowsMetrics(entry, signal),
      enabled: Boolean(entry.hasPassword && entry.username) && !paused,
      refetchInterval: paused ? (false as const) : 30_000,
      refetchIntervalInBackground: false,
      staleTime: 5000,
      retry: false,
      gcTime: 0,
    })),
  });
  const available = new Set(
    windows
      .filter((entry, index) => {
        const check = checks[index];
        return (
          entry.hasPassword &&
          entry.username &&
          check.data?.status === "OK" &&
          !check.isError
        );
      })
      .map((entry) => entry.id)
  );
  return {
    ...entries,
    hosts: hosts.filter(
      (entry) => entry.accessType !== "RDP" || available.has(entry.id)
    ),
    isPending:
      entries.isPending ||
      checks.some(
        (check, index) =>
          !paused &&
          windows[index].hasPassword &&
          windows[index].username &&
          check.isPending
      ),
  };
}
