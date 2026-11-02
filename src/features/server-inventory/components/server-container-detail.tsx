import { FavouriteIcon, ShutDownIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { SiDocker } from "react-icons/si";
import { Link } from "react-router";
import { Activity, ChevronRight } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchServerContainerDetail,
  fetchServerContainerStats,
} from "@/features/server-inventory/api";
import { ServerContainerActions } from "@/features/server-inventory/components/server-container-actions";
import { ServerContainerDetailValues } from "@/features/server-inventory/components/server-container-detail-values";
import { ServerContainerLogs } from "@/features/server-inventory/components/server-container-logs";
import { ServerContainerReadings } from "@/features/server-inventory/components/server-container-readings";
import {
  ServerContainerProcessesCard,
  ServerContainerStatisticsCharts,
  ServerContainerStatisticsChartsSkeleton,
} from "@/features/server-inventory/components/server-container-statistics";
import {
  inspectHealthStatus,
  resolveContainerStatus,
  useContainerError,
} from "@/features/server-inventory/components/server-container-status";
import { inspectImageId } from "@/features/server-inventory/container-inspect-values";
import type {
  ServerContainerDetail,
  ServerContainers,
  ServerEntry,
} from "@/features/server-inventory/types";
import { cn } from "@/lib/utils";

function ContainerLiveMetrics({
  query,
  containerId,
  paused,
  eligible,
}: {
  query: UseQueryResult<ServerContainers, Error>;
  containerId: string;
  paused: boolean;
  eligible: boolean;
}) {
  const copy = useI18n().messages.servers.containers;
  const data = query.data;
  const error = useContainerError(data?.status, query.error);
  const ready = data?.status === "OK" && !query.isError;
  const item = ready
    ? data.containers.find((value) => value.id === containerId)
    : undefined;
  return (
    <Card size="monitor" variant="monitor">
      <CardHeader size="none">
        <CardTitle size="sm" variant="inline">
          <Activity
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          {copy.liveMetrics}
        </CardTitle>
      </CardHeader>
      <CardContent size="none">
        <div className="flex flex-col gap-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {query.isPending && !paused && eligible && (
            <>
              <ServerContainerReadings detailed loading />
              <ServerContainerStatisticsChartsSkeleton />
            </>
          )}
          {item && <ServerContainerReadings detailed item={item} />}
          {item && (
            <ServerContainerStatisticsCharts
              collectedAt={data?.collectedAt}
              item={item}
            />
          )}
          {item && item.state !== "running" && (
            <p className="text-muted-foreground text-xs">
              {copy.stoppedMetrics}
            </p>
          )}
          {ready && !data.statsAvailable && (
            <p className="text-muted-foreground text-xs">
              {copy.statsUnavailable}
            </p>
          )}
          {ready && !item && (
            <p className="text-muted-foreground text-xs">
              {copy.statsUnavailable}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ContainerIdentity({
  data,
  loading,
  serverId,
}: {
  data?: ServerContainerDetail;
  loading: boolean;
  serverId?: string;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const imageCopy = messages.servers.images;
  const resolved = data?.state
    ? resolveContainerStatus(data.state, inspectHealthStatus(data), copy)
    : null;
  const isPositive =
    resolved?.kind === "healthy" || resolved?.kind === "running";
  const statusIcon =
    resolved?.kind === "healthy" || resolved?.kind === "unhealthy"
      ? FavouriteIcon
      : ShutDownIcon;
  const imageTargetId = inspectImageId(data?.inspect);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3.5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-linear-to-b from-primary/15 to-primary/5 text-primary shadow-2xs">
        <SiDocker aria-hidden="true" className="size-7" />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="min-w-0 break-words font-semibold text-xl tracking-tight sm:text-2xl">
            {loading ? (
              <Skeleton
                aria-hidden="true"
                className="h-7 w-48"
                variant="table"
              />
            ) : (
              (data?.name ?? copy.detailTitle)
            )}
          </h2>
          {loading && (
            <Skeleton aria-hidden="true" className="h-4 w-16" variant="table" />
          )}
          {resolved && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-medium text-xs",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              <HugeiconsIcon
                aria-hidden="true"
                className="size-3.5 shrink-0"
                icon={statusIcon}
                strokeWidth={2}
              />
              {resolved.label}
            </span>
          )}
        </div>
        {loading && (
          <Skeleton
            aria-hidden="true"
            className="h-4 w-64 max-w-full"
            variant="table"
          />
        )}
        {data?.image && (
          <div className="flex min-w-0 items-center gap-1.5">
            {imageTargetId && serverId ? (
              <Link
                className="group inline-flex min-w-0 max-w-full items-center gap-1.5 break-all font-mono text-muted-foreground text-xs leading-relaxed transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                title={`${imageCopy.inspect}: ${data.image}`}
                to={`/dashboard/server-metrics/${serverId}/images/${encodeURIComponent(imageTargetId)}`}
              >
                <span className="underline decoration-border/80 underline-offset-4 transition-colors group-hover:decoration-foreground">
                  {data.image}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-3 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </Link>
            ) : (
              <p className="break-all font-mono text-muted-foreground text-xs leading-relaxed">
                {data.image}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ServerContainerDetailPanel({
  entry,
  containerId,
  paused,
}: {
  entry: ServerEntry;
  containerId: string;
  paused: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const query = useQuery({
    queryKey: [
      "server-inventory",
      "container-detail",
      entry.id,
      entry.updatedAt,
      containerId,
    ],
    queryFn: ({ signal }) =>
      fetchServerContainerDetail(entry.id, containerId, signal),
    enabled: !paused,
    refetchInterval: paused ? false : 5000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 0,
  });
  const eligible = Boolean(entry.hasPassword && entry.username);
  const stats = useQuery({
    queryKey: [
      "server-inventory",
      "container-stats",
      entry.id,
      entry.updatedAt,
      containerId,
    ],
    queryFn: ({ signal }) =>
      fetchServerContainerStats(entry.id, containerId, signal),
    enabled: eligible && !paused,
    refetchInterval: paused ? false : 5000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 0,
  });
  const data = query.data;
  const error = useContainerError(data?.status, query.error);
  const ready = data?.status === "OK" && !query.isError;
  const loading = query.isPending && !paused;
  const showDetails = ready || loading;
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ContainerIdentity
          data={ready ? data : undefined}
          loading={loading}
          serverId={entry.id}
        />
        <ServerContainerActions
          containerId={containerId}
          entry={entry}
          name={data?.name ?? containerId.slice(0, 12)}
          onRefresh={async () => {
            await Promise.all([query.refetch(), stats.refetch()]);
          }}
          refreshing={query.isFetching || stats.isFetching}
          state={ready ? data.state : null}
        />
      </div>
      {paused && (
        <p className="text-muted-foreground text-sm">
          {messages.servers.metrics.paused}
        </p>
      )}
      {loading && (
        <p className="sr-only" role="status">
          {copy.loading}
        </p>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <ContainerLiveMetrics
        containerId={containerId}
        eligible={eligible}
        paused={paused}
        query={stats}
      />
      {showDetails && (
        <ServerContainerProcessesCard
          loading={!ready}
          processes={ready ? data.processes : undefined}
        />
      )}
      {showDetails && (
        <ServerContainerLogs
          containerId={containerId}
          loading={!ready}
          paused={paused}
          serverId={entry.id}
        />
      )}
      {showDetails && (
        <ServerContainerDetailValues
          containerId={containerId}
          data={ready ? data : undefined}
          loading={!ready}
          serverId={entry.id}
        />
      )}
      <p className="text-muted-foreground text-xs">{copy.managementHint}</p>
    </div>
  );
}
