import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  FileTerminal,
  Info,
  Pause,
  Play,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  fetchServerEntries,
  fetchServerMetrics,
} from "@/features/server-inventory/api";
import { ServerDockerSummary } from "@/features/server-inventory/components/server-container-summary";
import {
  MetricGauge,
  MetricRates,
  metricBytes,
} from "@/features/server-inventory/components/server-metric-values";
import type {
  ServerEntry,
  ServerMetrics,
} from "@/features/server-inventory/types";
import { getErrorMessage } from "@/lib/error-handler";
import { formatMessage } from "@/lib/i18n";

function usagePercent(used: number | null, total: number | null) {
  if (used === null || total === null || total <= 0) {
    return null;
  }
  return (100 * used) / total;
}

function Measurements({
  metrics,
  large,
}: {
  metrics: ServerMetrics;
  large: boolean;
}) {
  const copy = useI18n().messages.servers.metrics;
  return (
    <div className="grid @min-[22rem]:grid-cols-5 grid-cols-3 gap-x-3 gap-y-4">
      <MetricGauge
        detail={
          metrics.cores === null
            ? "—"
            : formatMessage(copy.cores, { count: metrics.cores })
        }
        label={copy.cpu}
        large={large}
        percent={metrics.cpuPercent}
      />
      <MetricGauge
        detail={
          <>
            <span className="whitespace-nowrap">
              {metricBytes(metrics.memoryUsedBytes, true)}
            </span>
            <span className="whitespace-nowrap text-muted-foreground">
              {formatMessage(copy.totalCapacity, {
                total: metricBytes(metrics.memoryTotalBytes, true),
              })}
            </span>
          </>
        }
        label={copy.memory}
        large={large}
        percent={usagePercent(
          metrics.memoryUsedBytes,
          metrics.memoryTotalBytes
        )}
      />
      <MetricGauge
        detail={
          <>
            <span className="whitespace-nowrap">
              {metricBytes(metrics.diskUsedBytes, true)}
            </span>
            <span className="whitespace-nowrap text-muted-foreground">
              {formatMessage(copy.totalCapacity, {
                total: metricBytes(metrics.diskTotalBytes, true),
              })}
            </span>
          </>
        }
        label={copy.disk}
        large={large}
        percent={usagePercent(metrics.diskUsedBytes, metrics.diskTotalBytes)}
      />
      <MetricRates
        first={metrics.networkReceiveBytesPerSecond}
        firstLabel={copy.receive}
        label={copy.network}
        second={metrics.networkTransmitBytesPerSecond}
        secondLabel={copy.transmit}
      />
      <MetricRates
        first={metrics.diskReadBytesPerSecond}
        firstLabel={copy.read}
        label={copy.io}
        second={metrics.diskWriteBytesPerSecond}
        secondLabel={copy.write}
      />
    </div>
  );
}

function MetricsFooter({ metrics }: { metrics: ServerMetrics }) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.metrics;
  const uptime =
    metrics.uptimeSeconds === null
      ? copy.uptimeUnavailable
      : formatMessage(copy.uptime, {
          days: Math.floor(metrics.uptimeSeconds / 86_400),
          hours: Math.floor((metrics.uptimeSeconds % 86_400) / 3600),
        });
  return (
    <div className="flex flex-wrap justify-between gap-2 text-muted-foreground text-xs">
      <span>{uptime}</span>
      <span>
        {formatMessage(copy.updated, {
          time: metrics.collectedAt
            ? new Date(metrics.collectedAt).toLocaleTimeString(locale)
            : "—",
        })}
      </span>
    </div>
  );
}

function HostCardHeader({
  entry,
  detail,
  eligible,
  paused,
  ready,
  statusLabel,
}: {
  entry: ServerEntry;
  detail: boolean;
  eligible: boolean;
  paused: boolean;
  ready: boolean;
  statusLabel: string;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.metrics;
  return (
    <CardHeader size="none">
      <div className="flex min-w-0 flex-col gap-1.5">
        <CardTitle className="break-words" size="sm">
          {detail ? messages.servers.containers.overview : entry.name}
        </CardTitle>
        {!detail && (
          <CardDescription className="break-all" size="xs">
            <span className="font-mono">
              {entry.host}:{entry.port ?? 22}
            </span>
          </CardDescription>
        )}
      </div>
      <CardAction className="relative z-10">
        <div className="flex items-center gap-2">
          <span
            className={
              ready && !paused
                ? "text-success text-xs"
                : "text-muted-foreground text-xs"
            }
          >
            {statusLabel}
          </span>
          {eligible && !detail && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={formatMessage(copy.terminalFor, {
                    name: entry.name,
                  })}
                  render={
                    <Link
                      rel="noopener noreferrer"
                      target="_blank"
                      to={`/servers/${entry.id}/terminal`}
                    />
                  }
                  size="icon-sm"
                  variant="ghost"
                >
                  <FileTerminal />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {messages.servers.sshOpenTerminal}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardAction>
    </CardHeader>
  );
}

export function ServerHostCard({
  entry,
  paused,
  detail = false,
  search = "",
}: {
  entry: ServerEntry;
  paused: boolean;
  detail?: boolean;
  search?: string;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.metrics;
  const eligible = Boolean(entry.hasPassword && entry.username);
  const query = useQuery({
    queryKey: ["server-inventory", "metrics", entry.id, entry.updatedAt],
    queryFn: ({ signal }) => fetchServerMetrics(entry.id, signal),
    enabled: eligible && !paused,
    refetchInterval: paused ? false : 5000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 0,
  });
  const data = query.data;
  const status = data?.status ?? "";
  const errors = new Map([
    ["HOST_KEY_REQUIRED", copy.hostKeyRequired],
    ["HOST_KEY_REJECTED", messages.servers.sshHostKeyRejected],
    ["AUTH_FAILED", messages.servers.sshAuthFailed],
    ["CONNECTION_FAILED", messages.servers.sshConnectionFailed],
    ["COLLECTION_FAILED", copy.collectionFailed],
    ["UNSUPPORTED_OS", copy.unsupported],
    ["BUSY", copy.busy],
  ]);
  const error = query.isError
    ? getErrorMessage(query.error)
    : errors.get(status);
  const ready = data?.status === "OK" && !query.isError;
  let statusLabel = ready ? copy.live : copy.unavailable;
  if (paused) {
    statusLabel = copy.paused;
  } else if (query.isPending && eligible) {
    statusLabel = copy.collecting;
  }
  const overview = (
    <div className="flex flex-col gap-3">
      {!eligible && (
        <p className="text-muted-foreground text-sm">
          {messages.servers.sshCredentialsRequired}
        </p>
      )}
      {eligible && error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {eligible &&
        !data &&
        !query.isError &&
        (paused ? (
          <p className="text-muted-foreground text-sm">{copy.paused}</p>
        ) : (
          <>
            <Skeleton className="h-28 w-full" />
            <p className="text-muted-foreground text-xs" role="status">
              {copy.collecting}
            </p>
          </>
        ))}
      {ready && (
        <>
          <Measurements large={detail} metrics={data} />
          <MetricsFooter metrics={data} />
        </>
      )}
    </div>
  );
  return (
    <Card
      className="@container relative isolate"
      size="monitor"
      variant="monitor"
    >
      {!detail && (
        <Link
          aria-label={formatMessage(messages.servers.containers.openDetails, {
            name: entry.name,
          })}
          className="absolute inset-0 rounded-2xl outline-none transition-colors hover:bg-muted/10 focus-visible:ring-2 focus-visible:ring-ring active:bg-muted/20 motion-reduce:transition-none"
          to={`/dashboard/server-metrics/${entry.id}${search}`}
        />
      )}
      <HostCardHeader
        detail={detail}
        eligible={eligible}
        entry={entry}
        paused={paused}
        ready={ready}
        statusLabel={statusLabel}
      />
      <CardContent size="none">
        <div className="flex flex-col gap-5">
          {overview}
          <Separator />
          <ServerDockerSummary entry={entry} paused={paused} />
        </div>
      </CardContent>
    </Card>
  );
}

function subscribePageSize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function getPageSize() {
  if (window.innerWidth < 1024) {
    return 6;
  }
  const columns = window.innerWidth >= 1536 ? 3 : 2;
  return columns * (window.innerHeight >= 850 ? 2 : 1);
}

export function ServerMetricsPanel() {
  const { messages } = useI18n();
  const copy = messages.servers.metrics;
  const [params, setParams] = useSearchParams();
  const paused = params.get("paused") === "1";
  const search = params.get("search") ?? "";
  const size = useSyncExternalStore(subscribePageSize, getPageSize, () => 6);
  const requestedPage =
    params.get("size") === String(size) ? Number(params.get("page") ?? 0) : 0;
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 0;
  const setPage = (nextPage: number) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set("page", String(nextPage));
      next.set("size", String(size));
      return next;
    });
  const entries = useQuery({
    queryKey: ["server-inventory", "metrics-entries", search, page, size],
    queryFn: () =>
      fetchServerEntries({
        accessType: "SSH",
        databaseEngine: "",
        direction: "asc",
        page,
        search,
        size,
        sortBy: "name",
      }),
  });
  const hosts = new Map<string, ServerEntry>();
  for (const entry of entries.data?.servers ?? []) {
    const current = hosts.get(entry.host);
    if (
      !current ||
      (!(current.hasPassword && current.username) &&
        entry.hasPassword &&
        entry.username)
    ) {
      hosts.set(entry.host, entry);
    }
  }
  return (
    <div className="flex min-w-0 flex-col gap-3 lg:min-h-0 lg:flex-1">
      <div className="server-monitor-toolbar sticky top-16 z-10 flex shrink-0 flex-col gap-3 rounded-xl border border-border/60 bg-background/90 p-2 backdrop-blur-xl sm:flex-row sm:items-center">
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon aria-hidden="true" icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={copy.search}
            onChange={(event) => {
              setParams(
                (current) => {
                  const next = new URLSearchParams(current);
                  next.set("search", event.target.value);
                  next.delete("page");
                  return next;
                },
                { replace: true }
              );
            }}
            placeholder={copy.search}
            value={search}
          />
        </InputGroup>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            aria-pressed={paused}
            onClick={() =>
              setParams(
                (current) => {
                  const next = new URLSearchParams(current);
                  if (paused) {
                    next.delete("paused");
                  } else {
                    next.set("paused", "1");
                  }
                  return next;
                },
                { replace: true }
              )
            }
            size="sm"
            variant="outline"
          >
            {paused ? (
              <Play data-icon="inline-start" />
            ) : (
              <Pause data-icon="inline-start" />
            )}
            {paused ? copy.resume : copy.pause}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                aria-label={copy.details}
                size="icon-sm"
                variant="outline"
              >
                <Info />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <p className="text-sm leading-relaxed">{copy.scope}</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {entries.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {getErrorMessage(entries.error)}
            <Button
              onClick={() => entries.refetch()}
              size="sm"
              variant="outline"
            >
              {messages.servers.retry}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {entries.isPending && <Skeleton className="h-48 w-full" />}
      {entries.data && hosts.size === 0 && (
        <Empty variant="bordered">
          <EmptyHeader>
            <EmptyTitle>{copy.empty}</EmptyTitle>
            <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <div className="grid items-stretch gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-2 lg:content-start lg:overflow-y-auto 2xl:grid-cols-3">
        {[...hosts.values()].map((entry) => (
          <ServerHostCard
            entry={entry}
            key={entry.id}
            paused={paused}
            search={params.size ? `?${params}` : ""}
          />
        ))}
      </div>
      {entries.data && entries.data.totalPages > 1 && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            {formatMessage(messages.servers.pageCount, {
              page: page + 1,
              pages: entries.data.totalPages,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              size="sm"
              variant="outline"
            >
              <ChevronLeft data-icon="inline-start" />
              {copy.previous}
            </Button>
            <Button
              disabled={page + 1 >= entries.data.totalPages}
              onClick={() => setPage(page + 1)}
              size="sm"
              variant="outline"
            >
              {copy.next}
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
