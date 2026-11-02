import {
  ArrowLeftRightIcon,
  ArrowUpRight01Icon,
  FolderOpenIcon,
  HardDriveIcon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { type ReactNode, useId, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ChevronRight,
  type HugeIcon,
  Info,
  Network,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ServerContainerInspect } from "@/features/server-inventory/components/server-container-inspect";
import {
  inspectHealthStatus,
  resolveContainerStatus,
} from "@/features/server-inventory/components/server-container-status";
import { ServerContainerVolumeDrawer } from "@/features/server-inventory/components/server-container-volume-drawer";
import {
  notableSoftware,
  ServerSoftwareIcon,
} from "@/features/server-inventory/components/server-software-icon";
import { inspectImageId } from "@/features/server-inventory/container-inspect-values";
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
  maxHeightClassName?: "max-h-48" | "max-h-60";
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
              "min-w-0 break-all font-medium text-foreground text-sm leading-relaxed sm:text-right",
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
      className={maxHeightClassName === "max-h-48" ? "max-h-48" : "max-h-60"}
      variant="panel"
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
  locale: string,
  serverId?: string
): DetailRow[] {
  const resolvedState = data?.state
    ? resolveContainerStatus(data.state, inspectHealthStatus(data), copy).label
    : "—";
  const imageTargetId = inspectImageId(data?.inspect);
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
      value:
        imageTargetId && serverId && data?.image ? (
          <Link
            className="group inline-flex items-center gap-1 break-all underline-offset-4 transition-colors hover:text-foreground hover:underline"
            title={data.image}
            to={`/dashboard/server-metrics/${serverId}/images/${encodeURIComponent(imageTargetId)}`}
          >
            <span>{data.image}</span>
            <ChevronRight
              aria-hidden="true"
              className="size-3 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
            />
          </Link>
        ) : (
          data?.image || "—"
        ),
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
  copy: ContainerCopy,
  serverHost?: string
): DetailRow[] {
  return (
    data?.ports.map((port, index) => {
      const address = port.hostIp || "*";
      const host = address.includes(":") ? `[${address}]` : address;
      const publishedHost = ["*", "0.0.0.0", "::"].includes(address)
        ? serverHost
        : address;
      const linkHost =
        publishedHost?.includes(":") && !publishedHost.startsWith("[")
          ? `[${publishedHost}]`
          : publishedHost;
      const protocol = ["443/tcp", "8443/tcp"].includes(port.containerPort)
        ? "https"
        : "http";
      const href =
        linkHost && port.hostPort && port.containerPort.endsWith("/tcp")
          ? `${protocol}://${linkHost}:${port.hostPort}`
          : undefined;
      const mapping = (
        <span>
          {host}:{port.hostPort}{" "}
          <span className="text-muted-foreground">→</span> {port.containerPort}
        </span>
      );
      let value: ReactNode = (
        <span className="text-muted-foreground">{copy.notPublished}</span>
      );
      if (port.hostPort) {
        value = mapping;
      }
      if (href) {
        value = (
          <a
            className="inline-flex items-center gap-1 break-all underline underline-offset-4 transition-colors hover:text-foreground"
            href={href}
            rel="noopener noreferrer"
            target="_blank"
            title={href}
          >
            {mapping}
            <HugeiconsIcon
              aria-hidden="true"
              className="size-3 shrink-0"
              icon={ArrowUpRight01Icon}
              strokeWidth={2}
            />
          </a>
        );
      }
      return {
        id: `${port.containerPort}-${String(index)}`,
        label: (
          <span className="font-medium font-mono text-foreground text-xs">
            {port.containerPort}
          </span>
        ),
        value,
        mono: true,
      };
    }) ?? []
  );
}

function buildMountRows(
  data: ServerContainerDetail | undefined,
  copy: ContainerCopy,
  onBrowse: (mount: string) => void,
  serverId?: string
): DetailRow[] {
  const mounts = data?.mounts
    ? [...data.mounts].sort(
        (a, b) =>
          a.destination.localeCompare(b.destination) ||
          a.source.localeCompare(b.source)
      )
    : [];

  return (
    mounts.map((mount, index) => ({
      id: `${mount.destination}-${String(index)}`,
      label: (
        <span className="inline-flex items-baseline gap-2">
          <span className="font-medium font-mono text-foreground text-xs">
            {mount.destination}
          </span>
          <span className="text-muted-foreground text-xs">
            {mount.type} · {mount.writable ? copy.readWrite : copy.readOnly}
          </span>
        </span>
      ),
      value: (
        <span className="flex flex-wrap items-center justify-end gap-2">
          <span className="break-all text-muted-foreground">
            {mount.source} <span className="text-foreground/60">→</span>{" "}
            <span className="text-foreground">{mount.destination}</span>
          </span>
          {serverId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={copy.volumeBrowse}
                  disabled={data?.state !== "running"}
                  onClick={() => onBrowse(mount.destination)}
                  size="icon-xs"
                  variant="ghost"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={FolderOpenIcon}
                    strokeWidth={2}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copy.volumeBrowse}</TooltipContent>
            </Tooltip>
          )}
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
  serverId,
  serverHost,
}: {
  containerId?: string;
  data?: ServerContainerDetail;
  loading: boolean;
  serverId?: string;
  serverHost?: string;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.containers;
  const basicRows = buildBasicRows(
    data,
    copy,
    messages.servers.metrics.specOs,
    locale,
    serverId
  );
  const networkRows = buildNetworkRows(data, copy);
  const portRows = buildPortRows(data, copy, serverHost);
  const [browsingMount, setBrowsingMount] = useState<string | null>(null);
  const mountRows = buildMountRows(data, copy, setBrowsingMount, serverId);
  const [softwareSearch, setSoftwareSearch] = useState("");
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const softwareFilterId = useId();
  const softwareViewportRef = useRef<HTMLDivElement>(null);
  const softwareResultsRef = useRef<HTMLDivElement>(null);
  const softwareAnimationRef = useRef<Animation | null>(null);

  function resetSoftwareScroll() {
    softwareViewportRef.current?.scrollTo({ top: 0 });
  }

  function fadeSoftwareResults() {
    const results = softwareResultsRef.current;
    if (!results) {
      return;
    }
    const opacity =
      softwareAnimationRef.current?.playState === "running"
        ? Number(getComputedStyle(results).opacity)
        : 0.7;
    softwareAnimationRef.current?.cancel();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const easing = getComputedStyle(results)
      .getPropertyValue("--ease-out")
      .trim();
    softwareAnimationRef.current = results.animate(
      [{ opacity }, { opacity: 1 }],
      {
        duration: reducedMotion ? 100 : 150,
        easing: easing || "cubic-bezier(0.23, 1, 0.32, 1)",
      }
    );
  }
  const softwareList = data?.installedSoftware;
  const availableSoftware = notableSoftware.filter(({ pattern }) =>
    softwareList?.some((software) => pattern.test(software))
  );
  const activeSoftware = availableSoftware.filter(({ label }) =>
    selectedSoftware.includes(label)
  );
  const softwareQuery = softwareSearch.trim().toLowerCase();
  const filteredSoftware = softwareList?.filter(
    (software) =>
      software.toLowerCase().includes(softwareQuery) &&
      (activeSoftware.length === 0 ||
        activeSoftware.some(({ pattern }) => pattern.test(software)))
  );
  const hasSoftware = Boolean(filteredSoftware && filteredSoftware.length > 0);
  const softwareEmptyMessage = softwareList?.length
    ? copy.softwareNoMatches
    : copy.softwareEmpty;
  const updatedTime = data?.collectedAt
    ? new Date(data.collectedAt).toLocaleTimeString(locale)
    : "—";

  return (
    <div aria-busy={loading} className="flex min-w-0 flex-col gap-4">
      <Card size="monitor" variant="monitor">
        <CardHeader size="none">
          <CardTitle size="sm" variant="inline">
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
            <CardTitle size="sm" variant="inline">
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
            <CardTitle size="sm" variant="inline">
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
            <CardTitle size="sm" variant="inline">
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
            <CardTitle size="sm" variant="inline">
              <SectionIcon svg={PackageIcon} />
              {copy.installedSoftware}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              {copy.softwareDescription}
            </p>
            <Input
              aria-label={copy.softwareSearch}
              className="mt-2 sm:max-w-xs"
              disabled={loading || !softwareList?.length}
              onChange={(event) => {
                setSoftwareSearch(event.target.value);
                resetSoftwareScroll();
              }}
              placeholder={copy.softwareSearch}
              size="sm"
              type="search"
              value={softwareSearch}
              variant="search-field"
            />
            {!loading && availableSoftware.length > 0 && (
              <FieldSet className="mt-3">
                <FieldLegend variant="label">{copy.softwareFilter}</FieldLegend>
                <FieldGroup className="flex-row flex-wrap" size="sm">
                  {availableSoftware.map(({ label, Icon }) => (
                    <Field
                      className="w-auto"
                      key={label}
                      orientation="horizontal"
                    >
                      <Checkbox
                        checked={selectedSoftware.includes(label)}
                        id={`${softwareFilterId}-${label.replaceAll(" ", "-")}`}
                        onCheckedChange={(checked) => {
                          setSelectedSoftware((selected) =>
                            checked
                              ? [...selected, label]
                              : selected.filter((value) => value !== label)
                          );
                          resetSoftwareScroll();
                        }}
                        onClick={(event) => {
                          if (event.detail > 0) {
                            fadeSoftwareResults();
                          }
                        }}
                      />
                      <FieldLabel
                        htmlFor={`${softwareFilterId}-${label.replaceAll(" ", "-")}`}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                        {label}
                      </FieldLabel>
                    </Field>
                  ))}
                </FieldGroup>
              </FieldSet>
            )}
          </div>
        </CardHeader>
        <CardContent size="none">
          <ScrollArea
            className="h-40"
            variant="panel"
            viewportClassName="h-full [overflow-anchor:none]"
            viewportRef={softwareViewportRef}
          >
            <div className="p-3.5" ref={softwareResultsRef}>
              {loading && (
                <div aria-hidden="true" className="flex h-6 items-center">
                  <Skeleton className="h-4 w-64 max-w-full" variant="table" />
                </div>
              )}
              {!loading &&
                (hasSoftware && filteredSoftware ? (
                  <ul className="grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSoftware.map((software) => (
                      <li
                        className="flex min-w-0 items-center gap-2"
                        key={software}
                      >
                        <ServerSoftwareIcon name={software} />
                        <span className="break-all font-mono text-foreground text-xs">
                          {software}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    {softwareList
                      ? softwareEmptyMessage
                      : copy.softwareUnavailable}
                  </p>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <ServerContainerVolumeDrawer
        containerId={data?.id ?? containerId}
        mount={browsingMount}
        onClose={() => setBrowsingMount(null)}
        serverId={serverId}
      />

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
