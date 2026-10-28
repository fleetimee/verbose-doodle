import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { SiDocker } from "react-icons/si";
import { Gauge } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  containerVariant,
  useContainerError,
} from "@/features/server-inventory/components/server-container-status";
import type {
  ServerContainerDetail,
  ServerContainers,
  ServerEntry,
} from "@/features/server-inventory/types";

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
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Gauge aria-hidden="true" className="size-5" />
          </span>
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
            <ServerContainerReadings detailed loading />
          )}
          {item && <ServerContainerReadings detailed item={item} />}
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
}: {
  data?: ServerContainerDetail;
  loading: boolean;
}) {
  const copy = useI18n().messages.servers.containers;
  const states: Record<string, string> = copy.states;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SiDocker aria-hidden="true" className="size-10" />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="min-w-0 break-words font-semibold text-2xl tracking-tight">
            {loading ? (
              <Skeleton
                aria-hidden="true"
                className="h-8 w-48"
                variant="table"
              />
            ) : (
              (data?.name ?? copy.detailTitle)
            )}
          </h2>
          {loading && (
            <Skeleton aria-hidden="true" className="h-5 w-16" variant="table" />
          )}
          {data?.state && (
            <Badge variant={containerVariant(data.state, "")}>
              {states[data.state] ?? data.state}
            </Badge>
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
          <p className="break-all font-mono text-muted-foreground text-xs leading-relaxed">
            {data.image}
          </p>
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
        <ContainerIdentity data={ready ? data : undefined} loading={loading} />
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
        <ServerContainerLogs
          containerId={containerId}
          loading={!ready}
          paused={paused}
          serverId={entry.id}
        />
      )}
      {showDetails && (
        <ServerContainerDetailValues
          data={ready ? data : undefined}
          loading={!ready}
        />
      )}
      <p className="text-muted-foreground text-xs">{copy.managementHint}</p>
    </div>
  );
}
