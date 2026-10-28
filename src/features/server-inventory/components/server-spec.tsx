import { useQuery } from "@tanstack/react-query";
import { Cpu, Gauge, type HugeIcon, Server } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchServerContainers,
  fetchServerSpec,
} from "@/features/server-inventory/api";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
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

type SpecGroup = {
  title: string;
  icon: HugeIcon;
  rows: [string, string][];
};

function buildGroups(
  data: ServerSpecInfo | undefined,
  copy: SpecCopy
): SpecGroup[] {
  const kind = flagLabel(data?.virtualized, copy.specVm, copy.specBare);
  const virtualization = data?.machine ? `${kind} (${data.machine})` : kind;
  const swap =
    data?.swapTotalBytes === null || data?.swapTotalBytes === undefined
      ? copy.specNone
      : metricBytes(data.swapTotalBytes, true);
  return [
    {
      title: copy.specSystem,
      icon: Server,
      rows: [
        [copy.specOs, data?.operatingSystem ?? EMPTY],
        [copy.specHostname, data?.hostname ?? EMPTY],
        [copy.specKernel, data?.kernel ?? EMPTY],
        [copy.specArch, data?.architecture ?? EMPTY],
      ],
    },
    {
      title: copy.specProcessor,
      icon: Cpu,
      rows: [
        [copy.specCpu, formatCpu(data, copy.cores)],
        [copy.specAes, flagLabel(data?.aesNi, copy.specYes, copy.specNo)],
        [copy.specVirt, virtualization],
        [copy.specLoad, data?.loadAverage ?? EMPTY],
      ],
    },
    {
      title: copy.specResources,
      icon: Gauge,
      rows: [
        [copy.memory, metricBytes(data?.memoryTotalBytes ?? null, true)],
        [copy.specSwap, data ? swap : EMPTY],
        [copy.disk, metricBytes(data?.diskTotalBytes ?? null, true)],
        [
          copy.uptimeLabel,
          formatUptime(data?.uptimeSeconds ?? null, copy.uptime),
        ],
      ],
    },
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
  const groups = buildGroups(data, copy);
  const loading = query.isPending && !paused;
  const error = useContainerError(query.data?.status, query.error);
  return (
    <section
      aria-busy={loading}
      aria-label={copy.specTitle}
      className="flex min-w-0 flex-col gap-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-xl tracking-tight">
            {copy.specTitle}
          </h2>
          <p className="text-muted-foreground text-sm">
            {copy.specDescription}
          </p>
        </div>
        {loading && (
          <p className="text-muted-foreground text-xs" role="status">
            {copy.collecting}
          </p>
        )}
        {paused && (
          <p className="text-muted-foreground text-xs">{copy.paused}</p>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid min-w-0 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {groups.map(({ title, icon: Icon, rows }) => (
          <section aria-label={title} className="min-w-0 p-5" key={title}>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <h3 className="font-semibold text-sm tracking-tight">{title}</h3>
            </div>
            <dl className="divide-y divide-border/40">
              {rows.map(([label, value]) => (
                <div
                  className="flex min-h-16 min-w-0 flex-col justify-center gap-1.5 py-3"
                  key={label}
                >
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="min-w-0 break-words font-medium text-sm leading-relaxed">
                    {loading ? (
                      <Skeleton
                        aria-hidden="true"
                        className="h-5 w-3/4"
                        variant="table"
                      />
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}
