import {
  ArrowLeftRightIcon,
  HardDriveIcon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { ReactNode } from "react";
import { type HugeIcon, Info, Network } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ServerContainerInspect } from "@/features/server-inventory/components/server-container-inspect";
import {
  inspectHealthStatus,
  resolveContainerStatus,
} from "@/features/server-inventory/components/server-container-status";
import type { ServerContainerDetail } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type DetailRow = {
  id: string;
  label: ReactNode;
  value: ReactNode;
  mono?: boolean;
};

function SectionIcon({
  icon: Icon,
  svg,
}: {
  icon?: HugeIcon;
  svg?: IconSvgElement;
}) {
  if (svg) {
    return (
      <HugeiconsIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
        icon={svg}
        strokeWidth={2}
      />
    );
  }
  if (Icon) {
    return (
      <Icon
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
    );
  }
  return null;
}

function GroupedInsetList({
  rows,
  loading = false,
  skeletonCount = 4,
  preserveLabelsOnLoad = false,
  maxHeightClassName,
}: {
  rows: DetailRow[];
  loading?: boolean;
  skeletonCount?: number;
  preserveLabelsOnLoad?: boolean;
  maxHeightClassName?: string;
}) {
  if (loading && !preserveLabelsOnLoad) {
    return (
      <div
        aria-hidden="true"
        className="divide-y divide-border/40 rounded-xl border border-border/50 bg-muted/15 px-4"
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div
            className="flex min-w-0 flex-col justify-between gap-1 py-2.5 sm:flex-row sm:items-baseline sm:gap-6"
            key={`skeleton-${String(index)}`}
          >
            <Skeleton className="h-4 w-28" variant="table" />
            <Skeleton className="h-4 w-44 max-w-full" variant="table" />
          </div>
        ))}
      </div>
    );
  }
  const list = (
    <dl className="divide-y divide-border/40 px-4">
      {rows.map((row) => (
        <div
          className="flex min-w-0 flex-col justify-between gap-1 py-2.5 sm:flex-row sm:items-baseline sm:gap-6"
          key={row.id}
        >
          <dt className="shrink-0 text-muted-foreground text-xs">
            {row.label}
          </dt>
          <dd
            className={cn(
              "min-w-0 break-all font-medium text-[13px] text-foreground leading-relaxed sm:text-right",
              row.mono && "font-mono font-normal text-xs"
            )}
          >
            {loading ? (
              <Skeleton
                aria-hidden="true"
                className="h-4 w-44 max-w-full sm:ml-auto"
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
  if (!maxHeightClassName) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/15">
        {list}
      </div>
    );
  }
  return (
    <ScrollArea
      className={cn(
        "rounded-xl border border-border/50 bg-muted/15",
        maxHeightClassName
      )}
      variant="fit"
      viewportClassName={maxHeightClassName}
    >
      {list}
    </ScrollArea>
  );
}

type ContainerCopy = ReturnType<
  typeof useI18n
>["messages"]["servers"]["containers"];

function buildBasicRows(
  data: ServerContainerDetail | undefined,
  copy: ContainerCopy,
  specOsLabel: string,
  locale: string
): DetailRow[] {
  const resolvedState = data?.state
    ? resolveContainerStatus(data.state, inspectHealthStatus(data), copy).label
    : "—";
  return [
    {
      id: "name",
      label: copy.containerName,
      value: data?.name || "—",
    },
    {
      id: "state",
      label: copy.state,
      value: resolvedState,
    },
    {
      id: "image",
      label: copy.image,
      value: data?.image || "—",
      mono: true,
    },
    {
      id: "os",
      label: specOsLabel,
      value: data?.operatingSystem || "—",
    },
    {
      id: "path",
      label: copy.path,
      value: data?.path || "—",
      mono: true,
    },
    {
      id: "created",
      label: copy.created,
      value: data?.created
        ? new Date(data.created).toLocaleString(locale)
        : "—",
    },
    {
      id: "id",
      label: copy.containerId,
      value: data?.id || "—",
      mono: true,
    },
  ];
}

function buildNetworkRows(
  data: ServerContainerDetail | undefined,
  copy: ContainerCopy
): DetailRow[] {
  return (
    data?.networks.map((network) => ({
      id: network.name,
      label: (
        <span className="font-medium font-mono text-foreground text-xs">
          {network.name}
        </span>
      ),
      value:
        [network.ipv4, network.ipv6].filter(Boolean).join(" · ") ||
        copy.noAddress,
      mono: true,
    })) ?? []
  );
}

function buildPortRows(
  data: ServerContainerDetail | undefined,
  copy: ContainerCopy
): DetailRow[] {
  return (
    data?.ports.map((port, index) => {
      const address = port.hostIp || "*";
      const host = address.includes(":") ? `[${address}]` : address;
      return {
        id: `${port.containerPort}-${String(index)}`,
        label: (
          <span className="font-medium font-mono text-foreground text-xs">
            {port.containerPort}
          </span>
        ),
        value: port.hostPort ? (
          <span>
            {host}:{port.hostPort}{" "}
            <span className="text-muted-foreground">→</span>{" "}
            {port.containerPort}
          </span>
        ) : (
          <span className="text-muted-foreground">{copy.notPublished}</span>
        ),
        mono: true,
      };
    }) ?? []
  );
}

function buildMountRows(
  data: ServerContainerDetail | undefined,
  copy: ContainerCopy
): DetailRow[] {
  return (
    data?.mounts.map((mount, index) => ({
      id: `${mount.destination}-${String(index)}`,
      label: (
        <span className="inline-flex items-baseline gap-2">
          <span className="font-medium font-mono text-foreground text-xs">
            {mount.destination}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {mount.type} · {mount.writable ? copy.readWrite : copy.readOnly}
          </span>
        </span>
      ),
      value: (
        <span className="break-all text-muted-foreground">
          {mount.source} <span className="text-foreground/60">→</span>{" "}
          <span className="text-foreground">{mount.destination}</span>
        </span>
      ),
      mono: true,
    })) ?? []
  );
}

export function ServerContainerDetailValues({
  containerId = "",
  data,
  loading,
}: {
  containerId?: string;
  data?: ServerContainerDetail;
  loading: boolean;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.containers;
  const basicRows = buildBasicRows(
    data,
    copy,
    messages.servers.metrics.specOs,
    locale
  );
  const networkRows = buildNetworkRows(data, copy);
  const portRows = buildPortRows(data, copy);
  const mountRows = buildMountRows(data, copy);
  const softwareList = data?.installedSoftware;
  const hasSoftware = Boolean(softwareList && softwareList.length > 0);
  const updatedTime = data?.collectedAt
    ? new Date(data.collectedAt).toLocaleTimeString(locale)
    : "—";

  return (
    <div aria-busy={loading} className="flex min-w-0 flex-col gap-4">
      <Card size="monitor" variant="monitor">
        <CardHeader size="none">
          <CardTitle
            className="text-sm tracking-[-0.01em]"
            size="sm"
            variant="inline"
          >
            <SectionIcon icon={Info} />
            {copy.basicInfo}
          </CardTitle>
        </CardHeader>
        <CardContent size="none">
          <GroupedInsetList
            loading={loading}
            preserveLabelsOnLoad
            rows={basicRows}
          />
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <Card className="min-w-0" size="monitor" variant="monitor">
          <CardHeader size="none">
            <CardTitle
              className="text-sm tracking-[-0.01em]"
              size="sm"
              variant="inline"
            >
              <SectionIcon icon={Network} />
              {copy.networks}
            </CardTitle>
          </CardHeader>
          <CardContent size="none">
            {loading || networkRows.length > 0 ? (
              <GroupedInsetList
                loading={loading}
                maxHeightClassName="max-h-48"
                rows={networkRows}
                skeletonCount={2}
              />
            ) : (
              <p className="rounded-xl border border-border/50 bg-muted/15 px-4 py-3 text-muted-foreground text-xs">
                {copy.noNetworks}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0" size="monitor" variant="monitor">
          <CardHeader size="none">
            <CardTitle
              className="text-sm tracking-[-0.01em]"
              size="sm"
              variant="inline"
            >
              <SectionIcon svg={ArrowLeftRightIcon} />
              {copy.ports}
            </CardTitle>
          </CardHeader>
          <CardContent size="none">
            {loading || portRows.length > 0 ? (
              <GroupedInsetList
                loading={loading}
                maxHeightClassName="max-h-48"
                rows={portRows}
                skeletonCount={2}
              />
            ) : (
              <p className="rounded-xl border border-border/50 bg-muted/15 px-4 py-3 text-muted-foreground text-xs">
                {copy.noPorts}
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          className="min-w-0 md:col-span-2"
          size="monitor"
          variant="monitor"
        >
          <CardHeader size="none">
            <CardTitle
              className="text-sm tracking-[-0.01em]"
              size="sm"
              variant="inline"
            >
              <SectionIcon svg={HardDriveIcon} />
              {copy.mounts}
            </CardTitle>
          </CardHeader>
          <CardContent size="none">
            {loading || mountRows.length > 0 ? (
              <GroupedInsetList
                loading={loading}
                maxHeightClassName="max-h-60"
                rows={mountRows}
                skeletonCount={2}
              />
            ) : (
              <p className="rounded-xl border border-border/50 bg-muted/15 px-4 py-3 text-muted-foreground text-xs">
                {copy.noMounts}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card size="monitor" variant="monitor">
        <CardHeader size="none">
          <div className="flex flex-col gap-1">
            <CardTitle
              className="text-sm tracking-[-0.01em]"
              size="sm"
              variant="inline"
            >
              <SectionIcon svg={PackageIcon} />
              {copy.installedSoftware}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              {copy.softwareDescription}
            </p>
          </div>
        </CardHeader>
        <CardContent size="none">
          <ScrollArea
            className="max-h-40 rounded-xl border border-border/50 bg-muted/15"
            variant="fit"
            viewportClassName="max-h-40"
          >
            <div className="p-3.5">
              {loading && (
                <div aria-hidden="true" className="flex h-6 items-center">
                  <Skeleton className="h-4 w-64 max-w-full" variant="table" />
                </div>
              )}
              {!loading &&
                (hasSoftware && softwareList ? (
                  <p className="font-mono text-foreground text-xs leading-6">
                    {softwareList.join("  ·  ")}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    {softwareList
                      ? copy.softwareEmpty
                      : copy.softwareUnavailable}
                  </p>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <ServerContainerInspect
        containerId={data?.id ?? containerId}
        inspect={data?.inspect}
        loading={loading}
      />

      {data && (
        <p className="text-muted-foreground text-xs">
          {formatMessage(messages.servers.metrics.updated, {
            time: updatedTime,
          })}
        </p>
      )}
    </div>
  );
}
