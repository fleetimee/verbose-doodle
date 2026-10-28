import type { ReactNode } from "react";
import { Code2, Info, Layers3, Network, Plug } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { containerVariant } from "@/features/server-inventory/components/server-container-status";
import type { ServerContainerDetail } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type DetailRow = {
  label: string;
  value: ReactNode;
  wide?: boolean;
  mono?: boolean;
};

function DetailFields({
  rows,
  loading = false,
  columns = false,
}: {
  rows: DetailRow[];
  loading?: boolean;
  columns?: boolean;
}) {
  return (
    <dl className={cn("grid min-w-0 gap-x-8", columns && "md:grid-cols-2")}>
      {rows.map((row) => (
        <div
          className={cn(
            "flex min-h-20 min-w-0 flex-col justify-center gap-2 border-border/40 border-b py-4 last:border-b-0",
            row.wide && "md:col-span-2"
          )}
          key={row.label}
        >
          <dt className="text-muted-foreground text-xs">{row.label}</dt>
          <dd
            className={cn(
              "min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed",
              row.mono && "font-mono text-xs"
            )}
          >
            {loading ? (
              <Skeleton
                aria-hidden="true"
                className="h-5 w-3/4 max-w-64"
                variant="table"
              />
            ) : (
              row.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ServerContainerDetailValues({
  data,
  loading,
}: {
  data?: ServerContainerDetail;
  loading: boolean;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.containers;
  const states: Record<string, string> = copy.states;
  const rows: DetailRow[] = [
    { label: copy.containerName, value: data?.name || "—" },
    {
      label: copy.state,
      value: data?.state ? (
        <Badge variant={containerVariant(data.state, "")}>
          {states[data.state] ?? data.state}
        </Badge>
      ) : (
        "—"
      ),
    },
    { label: copy.image, value: data?.image || "—", mono: true },
    {
      label: messages.servers.metrics.specOs,
      value: data?.operatingSystem || "—",
    },
    { label: copy.path, value: data?.path || "—", mono: true },
    {
      label: copy.created,
      value: data?.created
        ? new Date(data.created).toLocaleString(locale)
        : "—",
    },
    { label: copy.containerId, value: data?.id || "—", wide: true, mono: true },
  ];
  const sections = [
    {
      title: copy.networks,
      icon: Network,
      rows:
        data?.networks.map((network) => ({
          label: network.name,
          value:
            [network.ipv4, network.ipv6].filter(Boolean).join("\n") ||
            copy.noAddress,
          mono: true,
        })) ?? [],
      empty: copy.noNetworks,
    },
    {
      title: copy.ports,
      icon: Plug,
      rows:
        data?.ports.map((port, index) => {
          const address = port.hostIp || "*";
          const host = address.includes(":") ? `[${address}]` : address;
          return {
            label: `${port.containerPort} · ${index + 1}`,
            value: port.hostPort
              ? `${host}:${port.hostPort} → ${port.containerPort}`
              : `${port.containerPort} (${copy.notPublished})`,
            mono: true,
          };
        }) ?? [],
      empty: copy.noPorts,
    },
    {
      title: copy.mounts,
      icon: Layers3,
      rows:
        data?.mounts.map((mount, index) => ({
          label: `${mount.type} · ${index + 1}`,
          value: `${mount.source} → ${mount.destination}\n${mount.writable ? copy.readWrite : copy.readOnly}`,
          mono: true,
        })) ?? [],
      empty: copy.noMounts,
    },
  ];
  return (
    <div aria-busy={loading} className="flex min-w-0 flex-col gap-5">
      <Card size="monitor" variant="monitor">
        <CardHeader size="none">
          <CardTitle size="sm" variant="inline">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Info aria-hidden="true" className="size-5" />
            </span>
            {copy.basicInfo}
          </CardTitle>
        </CardHeader>
        <CardContent size="none">
          <DetailFields columns loading={loading} rows={rows} />
        </CardContent>
      </Card>
      <div className="grid min-w-0 gap-5 md:grid-cols-2">
        {sections.map(({ title, icon: Icon, rows: sectionRows, empty }) => (
          <Card
            className={
              title === copy.mounts ? "min-w-0 md:col-span-2" : "min-w-0"
            }
            key={title}
            size="monitor"
            variant="monitor"
          >
            <CardHeader size="none">
              <CardTitle size="sm" variant="inline">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent size="none">
              {loading && (
                <div
                  aria-hidden="true"
                  className="flex min-h-20 flex-col justify-center gap-3 py-4"
                >
                  <Skeleton className="h-4 w-24" variant="table" />
                  <Skeleton className="h-5 w-3/4 max-w-80" variant="table" />
                </div>
              )}
              {!loading &&
                (sectionRows.length ? (
                  <DetailFields rows={sectionRows} />
                ) : (
                  <p className="py-4 text-muted-foreground text-sm">{empty}</p>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card size="monitor" variant="monitor">
        <CardHeader size="none">
          <CardTitle size="sm" variant="inline">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Code2 aria-hidden="true" className="size-5" />
            </span>
            {copy.installedSoftware}
          </CardTitle>
        </CardHeader>
        <CardContent size="none">
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">
              {copy.softwareDescription}
            </p>
            {loading && (
              <div aria-hidden="true" className="flex gap-2">
                {["first", "second", "third"].map((id) => (
                  <Skeleton className="h-6 w-16" key={id} variant="table" />
                ))}
              </div>
            )}
            {!loading &&
              (data?.installedSoftware && data.installedSoftware.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {data.installedSoftware.map((software) => (
                    <li key={software}>
                      <Badge variant="secondary">{software}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {data?.installedSoftware
                    ? copy.softwareEmpty
                    : copy.softwareUnavailable}
                </p>
              ))}
          </div>
        </CardContent>
      </Card>
      {data && (
        <p className="text-muted-foreground text-xs">
          {formatMessage(messages.servers.metrics.updated, {
            time: data.collectedAt
              ? new Date(data.collectedAt).toLocaleTimeString(locale)
              : "—",
          })}
        </p>
      )}
    </div>
  );
}
