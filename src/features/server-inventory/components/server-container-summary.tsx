import {
  FavouriteIcon,
  Layers01Icon,
  PackageIcon,
  ShutDownIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
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

function SummaryStatItem({
  icon,
  iconClassName,
  value,
  label,
}: {
  icon: IconSvgElement;
  iconClassName: string;
  value: number | null | undefined;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <HugeiconsIcon
        aria-hidden="true"
        className={cn("size-4 shrink-0", iconClassName)}
        icon={icon}
        strokeWidth={2}
      />
      <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
        <span className="font-mono font-semibold text-foreground tabular-nums">
          {value ?? 0}
        </span>
        <span className="truncate text-muted-foreground text-xs lowercase">
          {label}
        </span>
      </div>
    </div>
  );
}

function SummaryValues({ data }: { data: ServerContainerSummary }) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  return (
    <div className="flex @min-[36rem]:flex-row flex-col @min-[36rem]:items-center justify-between @min-[36rem]:gap-6 gap-3 rounded-xl border border-border/50 bg-muted/15 px-4 py-3">
      <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
        <SummaryStatItem
          icon={ShutDownIcon}
          iconClassName="text-success"
          label={copy.states.running}
          value={data.running}
        />
        <SummaryStatItem
          icon={ShutDownIcon}
          iconClassName="text-destructive"
          label={copy.stopped}
          value={data.stopped}
        />
        <SummaryStatItem
          icon={FavouriteIcon}
          iconClassName="text-success"
          label={copy.healthy}
          value={data.healthy}
        />
        <SummaryStatItem
          icon={FavouriteIcon}
          iconClassName="text-destructive"
          label={copy.unhealthy}
          value={data.unhealthy}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-border/40 border-t @min-[36rem]:border-t-0 @min-[36rem]:border-l @min-[36rem]:pt-0 pt-2.5 @min-[36rem]:pl-6">
        <SummaryStatItem
          icon={Layers01Icon}
          iconClassName="text-muted-foreground"
          label={copy.total}
          value={data.total}
        />
        <SummaryStatItem
          icon={PackageIcon}
          iconClassName="text-primary"
          label={copy.images}
          value={data.images}
        />
      </div>
    </div>
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
      <div className="flex flex-wrap justify-between gap-1 text-muted-foreground text-xs">
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
        <p className="text-muted-foreground text-xs">
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
    refetchInterval: (current) => {
      if (paused) {
        return false;
      }
      const status = current.state.data?.status;
      if (
        status === "DOCKER_NOT_INSTALLED" ||
        status === "UNSUPPORTED_OS" ||
        status === "HOST_KEY_REQUIRED" ||
        status === "HOST_KEY_REJECTED" ||
        status === "AUTH_FAILED"
      ) {
        return false;
      }
      if (
        status === "DOCKER_UNAVAILABLE" ||
        status === "CONNECTION_FAILED" ||
        status === "COLLECTION_FAILED"
      ) {
        return 30_000;
      }
      return 10_000;
    },
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 60_000,
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
        <h3 className="flex items-center gap-2 font-medium text-sm tracking-tight">
          <SiDocker
            aria-hidden="true"
            className="size-4 shrink-0 text-primary"
          />
          {copy.title}
        </h3>
        <span className="font-mono text-muted-foreground text-xs">
          {statusLabel}
        </span>
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
