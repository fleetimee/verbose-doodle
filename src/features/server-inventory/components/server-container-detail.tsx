import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { Fragment, type ReactNode } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchServerContainerDetail,
  fetchServerContainerStats,
} from "@/features/server-inventory/api";
import { ServerContainerActions } from "@/features/server-inventory/components/server-container-actions";
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
import { formatMessage } from "@/lib/i18n";

function DetailFields({
  rows,
}: {
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <Fragment key={row.label}>
          {index > 0 && <Separator />}
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="min-w-0 whitespace-pre-wrap break-all font-mono text-xs leading-relaxed sm:col-span-2 sm:text-right">
              {row.value}
            </dd>
          </div>
        </Fragment>
      ))}
    </dl>
  );
}

function DetailValues({ data }: { data: ServerContainerDetail }) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.containers;
  const states: Record<string, string> = copy.states;
  const rows = [
    { label: copy.containerName, value: data.name || "—" },
    {
      label: copy.state,
      value: (
        <Badge variant={containerVariant(data.state ?? "", "")}>
          {states[data.state ?? ""] ?? data.state ?? "—"}
        </Badge>
      ),
    },
    { label: copy.containerId, value: data.id || "—" },
    { label: copy.path, value: data.path || "—" },
    { label: copy.image, value: data.image || "—" },
    {
      label: copy.created,
      value: data.created ? new Date(data.created).toLocaleString(locale) : "—",
    },
  ];
  const networkRows = data.networks.map((network) => ({
    label: network.name,
    value:
      [network.ipv4, network.ipv6].filter(Boolean).join("\n") || copy.noAddress,
  }));
  const portRows = data.ports.map((port, index) => {
    const address = port.hostIp || "*";
    const host = address.includes(":") ? `[${address}]` : address;
    return {
      label: `${port.containerPort} · ${index + 1}`,
      value: port.hostPort
        ? `${host}:${port.hostPort} → ${port.containerPort}`
        : `${port.containerPort} (${copy.notPublished})`,
    };
  });
  const mountRows = data.mounts.map((mount, index) => ({
    label: `${mount.type} · ${index + 1}`,
    value: `${mount.source} → ${mount.destination}\n${mount.writable ? copy.readWrite : copy.readOnly}`,
  }));
  const sections = [
    { title: copy.basicInfo, rows, empty: "" },
    { title: copy.networks, rows: networkRows, empty: copy.noNetworks },
    { title: copy.ports, rows: portRows, empty: copy.noPorts },
    { title: copy.mounts, rows: mountRows, empty: copy.noMounts },
  ];
  return (
    <>
      {sections.map((section) => (
        <Card key={section.title} size="monitor" variant="monitor">
          <CardHeader size="none">
            <CardTitle size="sm">{section.title}</CardTitle>
          </CardHeader>
          <CardContent size="none">
            {section.rows.length ? (
              <DetailFields rows={section.rows} />
            ) : (
              <p className="text-muted-foreground text-sm">{section.empty}</p>
            )}
          </CardContent>
        </Card>
      ))}
      <p className="text-muted-foreground text-xs">
        {formatMessage(messages.servers.metrics.updated, {
          time: data.collectedAt
            ? new Date(data.collectedAt).toLocaleTimeString(locale)
            : "—",
        })}
      </p>
    </>
  );
}

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
        <CardTitle size="sm">{copy.liveMetrics}</CardTitle>
      </CardHeader>
      <CardContent size="none">
        <div className="flex flex-col gap-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {query.isPending && !paused && eligible && (
            <Skeleton className="h-28 w-full" />
          )}
          {item && <ServerContainerReadings item={item} />}
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
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="min-w-0 break-all font-semibold text-xl tracking-tight">
          {data?.name ?? copy.detailTitle}
        </h2>
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
      {query.isPending && !paused && <Skeleton className="h-64 w-full" />}
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
      {ready && <DetailValues data={data} />}
      <p className="text-muted-foreground text-xs">{copy.managementHint}</p>
    </div>
  );
}
