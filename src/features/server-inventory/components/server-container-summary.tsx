import { useQuery } from "@tanstack/react-query";
import { SiDocker } from "react-icons/si";
import { useI18n } from "@/components/i18n-provider";
import { fetchServerContainerSummary } from "@/features/server-inventory/api";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
import { DockerSummarySkeleton } from "@/features/server-inventory/components/server-metrics-skeleton";
import type {
  ServerContainerSummary,
  ServerEntry,
} from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function SummaryValues({ data }: { data: ServerContainerSummary }) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const values = [
    { label: copy.states.running, value: data.running, color: "text-success" },
    { label: copy.stopped, value: data.stopped, color: "text-destructive" },
    { label: copy.total, value: data.total, color: "text-foreground" },
    { label: copy.images, value: data.images, color: "text-primary" },
  ];
  return (
    <dl className="grid grid-cols-4 gap-x-2 gap-y-4">
      {values.map((item) => (
        <div className="flex min-w-0 flex-col gap-1" key={item.label}>
          <dt className="text-muted-foreground text-xs">{item.label}</dt>
          <dd
            className={cn(
              "font-mono font-semibold text-sm tabular-nums",
              item.color
            )}
          >
            {item.value ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SummaryFooter({
  data,
  paused,
}: {
  data: ServerContainerSummary;
  paused: boolean;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.containers;
  return (
    <>
      <div className="mt-4 flex flex-wrap justify-between gap-1 text-muted-foreground text-xs">
        <span className="truncate" title={data.operatingSystem ?? undefined}>
          {data.operatingSystem || "—"}
        </span>
        <span>
          {paused
            ? messages.servers.metrics.paused
            : formatMessage(messages.servers.metrics.updated, {
                time: data.collectedAt
                  ? new Date(data.collectedAt).toLocaleTimeString(locale)
                  : "—",
              })}
        </span>
      </div>
      {data.paused !== null && data.paused > 0 && (
        <p className="mt-1 text-muted-foreground text-xs">
          {formatMessage(copy.pausedCount, { count: data.paused })}
        </p>
      )}
    </>
  );
}

export function ServerDockerSummary({
  entry,
  paused,
}: {
  entry: ServerEntry;
  paused: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const eligible = Boolean(entry.hasPassword && entry.username);
  const query = useQuery({
    queryKey: [
      "server-inventory",
      "container-summary",
      entry.id,
      entry.updatedAt,
    ],
    queryFn: ({ signal }) => fetchServerContainerSummary(entry.id, signal),
    enabled: eligible && !paused,
    refetchInterval: paused ? false : 5000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 0,
  });
  const data = query.data;
  const ready = data?.status === "OK" && !query.isError;
  const error = useContainerError(data?.status, query.error);
  const dockerMissing =
    data?.status === "DOCKER_NOT_INSTALLED" && !query.isError;
  let statusLabel = messages.servers.metrics.unavailable;
  if (ready) {
    statusLabel = `Docker ${data.version || "—"}`;
  } else if (paused) {
    statusLabel = messages.servers.metrics.paused;
  } else if (query.isPending && eligible) {
    statusLabel = copy.loading;
  }
  return (
    <section aria-label={copy.title} className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium text-sm">{copy.title}</h3>
        <span className="text-muted-foreground text-xs">{statusLabel}</span>
      </div>
      {ready && <SummaryValues data={data} />}
      {!eligible && (
        <p className="text-muted-foreground text-xs">
          {copy.credentialsRequired}
        </p>
      )}
      {eligible && !data && !query.isError && !paused && (
        <DockerSummarySkeleton />
      )}
      {dockerMissing && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-2 py-5 text-center">
          <SiDocker
            aria-hidden="true"
            className="h-12 w-16 shrink-0 text-primary"
          />
          <p className="max-w-xs text-muted-foreground text-xs leading-relaxed">
            {error}
          </p>
        </div>
      )}
      {error && !dockerMissing && (
        <p className="text-muted-foreground text-xs leading-relaxed">{error}</p>
      )}
      {ready && <SummaryFooter data={data} paused={paused} />}
    </section>
  );
}
