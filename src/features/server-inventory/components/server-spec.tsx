import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/components/i18n-provider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchServerContainers,
  fetchServerSpec,
} from "@/features/server-inventory/api";
import { metricBytes } from "@/features/server-inventory/components/server-metric-values";
import type {
  ServerEntry,
  ServerSpecInfo,
} from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";

const EMPTY = "—";

function formatUptime(seconds: number | null, template: string) {
  if (seconds === null) {
    return EMPTY;
  }
  return formatMessage(template, {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor((seconds % 86_400) / 3600),
  });
}

function formatCpu(spec: ServerSpecInfo | undefined, template: string) {
  if (!spec) {
    return EMPTY;
  }
  const cores = spec.cores
    ? formatMessage(template, { count: spec.cores })
    : "";
  const mhz = spec.cpuMhz ? `@ ${spec.cpuMhz.toFixed(0)} MHz` : "";
  return [cores, spec.cpuModel, mhz].filter(Boolean).join(" ") || EMPTY;
}

type SpecCopy = ReturnType<typeof useI18n>["messages"]["servers"]["metrics"];

function flagLabel(value: boolean | null | undefined, on: string, off: string) {
  if (value === null || value === undefined) {
    return EMPTY;
  }
  return value ? on : off;
}

function buildRows(
  data: ServerSpecInfo | undefined,
  copy: SpecCopy
): [string, string][] {
  const kind = flagLabel(data?.virtualized, copy.specVm, copy.specBare);
  const virtualization = data?.machine ? `${kind} (${data.machine})` : kind;
  const swap =
    data?.swapTotalBytes === null || data?.swapTotalBytes === undefined
      ? copy.specNone
      : metricBytes(data.swapTotalBytes, true);
  return [
    [copy.specOs, data?.operatingSystem ?? EMPTY],
    [copy.specKernel, data?.kernel ?? EMPTY],
    [copy.specArch, data?.architecture ?? EMPTY],
    [copy.specHostname, data?.hostname ?? EMPTY],
    [copy.specCpu, formatCpu(data, copy.cores)],
    [copy.specAes, flagLabel(data?.aesNi, copy.specYes, copy.specNo)],
    [copy.specVirt, virtualization],
    [copy.memory, metricBytes(data?.memoryTotalBytes ?? null, true)],
    [copy.specSwap, data ? swap : EMPTY],
    [copy.disk, metricBytes(data?.diskTotalBytes ?? null, true)],
    [copy.uptimeLabel, formatUptime(data?.uptimeSeconds ?? null, copy.uptime)],
    [copy.specLoad, data?.loadAverage ?? EMPTY],
  ];
}

export function useDockerMissing(
  entry: ServerEntry | undefined,
  paused: boolean
) {
  const query = useQuery({
    queryKey: ["server-inventory", "containers", entry?.id, entry?.updatedAt],
    queryFn: ({ signal }) => fetchServerContainers(entry?.id ?? "", signal),
    enabled: Boolean(entry?.hasPassword && entry.username) && !paused,
    refetchInterval: paused ? false : 5000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 0,
  });
  return query.data?.status === "DOCKER_NOT_INSTALLED";
}

export function ServerSpec({
  entry,
  paused,
}: {
  entry: ServerEntry;
  paused: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.metrics;
  const query = useQuery({
    queryKey: ["server-inventory", "spec", entry.id, entry.updatedAt],
    queryFn: ({ signal }) => fetchServerSpec(entry.id, signal),
    enabled: !paused,
    refetchInterval: paused ? false : 60_000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 0,
  });
  const data = query.data?.status === "OK" ? query.data : undefined;
  const rows = buildRows(data, copy);
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold text-xl tracking-tight">
          {copy.specTitle}
        </h2>
        <p className="text-muted-foreground text-sm">{copy.specDescription}</p>
      </div>
      {query.isPending && !paused ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-xl border border-border/60 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(([label, value]) => (
            <div className="flex min-w-0 flex-col gap-0.5" key={label}>
              <dt className="text-muted-foreground text-xs">{label}</dt>
              <dd className="break-words font-medium text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
