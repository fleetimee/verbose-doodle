import {
  AlertCircleIcon,
  Clock01Icon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  Gauge,
  ServerCrash,
  ShieldCheck,
  Signal,
  TrendingUp,
} from "@/components/hugeicons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEndpointTelemetry } from "@/features/endpoints/hooks/use-endpoint-telemetry";
import type { EndpointTrafficLogsFilters } from "@/features/endpoints/types";
import {
  type EndpointMetrics,
  getPersistedEndpointMetrics,
  PERSISTED_METRICS_TIME_WINDOWS,
  type PersistedMetricsTimeWindow,
} from "@/features/endpoints/utils/endpoint-metrics";
import { formatJakartaTimestamp } from "@/features/endpoints/utils/endpoint-time";
import { formatMessage, messages } from "@/lib/i18n";

const TIME_WINDOW_LABELS: Record<PersistedMetricsTimeWindow, string> = {
  "7d": messages.endpoints.metrics.timeWindows["7d"],
  "24h": messages.endpoints.metrics.timeWindows["24h"],
  "30d": messages.endpoints.metrics.timeWindows["30d"],
};

const latencyChartConfig = {
  avgMs: {
    color: "var(--chart-1)",
    label: messages.endpoints.metrics.charts.avgLabel,
  },
} satisfies ChartConfig;

const volumeChartConfig = {
  errors: {
    color: "var(--destructive)",
    label: messages.endpoints.metrics.charts.errorsLabel,
  },
  successes: {
    color: "var(--chart-2)",
    label: messages.endpoints.metrics.charts.successesLabel,
  },
} satisfies ChartConfig;

const emptyMetric = {
  averageDurationMs: 0,
  hitStatusCounts: {},
  httpStatusCounts: {},
  maxDurationMs: null,
  minDurationMs: null,
  requestCount: 0,
  totalDurationMs: 0,
};

type EndpointMetricsSheetProps = {
  readonly endpointId: string;
  readonly endpointLabel: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
};

type MetricCardProps = {
  readonly description: string;
  readonly icon: typeof Activity;
  readonly label: string;
  readonly tone?: "default" | "success" | "warning" | "danger";
  readonly value: string;
};

export function EndpointMetricsSheet({
  endpointId,
  endpointLabel,
  onOpenChange,
  open,
}: EndpointMetricsSheetProps) {
  const [timeWindow, setTimeWindow] =
    useState<PersistedMetricsTimeWindow>("24h");
  const [range, setRange] = useState(() => getMetricRange("24h"));
  const telemetryFilters: EndpointTrafficLogsFilters = {
    includeBody: false,
    limit: 1,
    search: "",
    status: "all",
  };
  const { metricsSummary: summaryQuery, hourlyMetrics: hourlyQuery } =
    useEndpointTelemetry(endpointId, telemetryFilters, {
      enabled: open,
      from: range.from,
      includeTrafficLogs: false,
      to: range.to,
    });

  const metrics = useMemo(
    () =>
      getPersistedEndpointMetrics(
        summaryQuery.data ?? emptyMetric,
        hourlyQuery.data ?? [],
        timeWindow
      ),
    [hourlyQuery.data, summaryQuery.data, timeWindow]
  );

  const handleTimeWindowChange = (value: string[]) => {
    const nextValue = value[0];

    if (nextValue) {
      // SAFETY: The segmented control emits one of the persisted time-window values.
      const window = nextValue as PersistedMetricsTimeWindow;
      setTimeWindow(window);
      setRange(getMetricRange(window));
    }
  };

  let metricsContent: ReactNode;
  if (summaryQuery.isPending || hourlyQuery.isPending) {
    metricsContent = <MetricsLoadingState />;
  } else if (summaryQuery.error || hourlyQuery.error) {
    metricsContent = (
      <Alert variant="destructive">
        <HugeiconsIcon
          aria-hidden="true"
          icon={AlertCircleIcon}
          strokeWidth={2}
        />
        <AlertTitle>{messages.endpoints.metrics.loadErrorTitle}</AlertTitle>
        <AlertDescription>
          {(summaryQuery.error ?? hourlyQuery.error)?.message}
        </AlertDescription>
      </Alert>
    );
  } else if (metrics.summary.requests === 0) {
    metricsContent = (
      <Empty className="min-h-[460px]" variant="bordered">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Activity aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{messages.endpoints.metrics.emptyTitle}</EmptyTitle>
          <EmptyDescription>
            {messages.endpoints.metrics.emptyDescription}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  } else {
    metricsContent = (
      <MetricsContent metrics={metrics} timeWindow={timeWindow} />
    );
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className="w-[98vw] overflow-hidden sm:max-w-none md:w-[min(1240px,92vw)]"
        side="right"
        size="flush"
      >
        <SheetHeader variant="bordered">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <SheetTitle>
                <span className="flex items-center gap-2">
                  <BarChart3 aria-hidden="true" />
                  {messages.endpoints.metrics.title}
                </span>
              </SheetTitle>
              <SheetDescription variant="truncate">
                {formatMessage(messages.endpoints.metrics.description, {
                  endpointLabel,
                })}
              </SheetDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                aria-label={messages.endpoints.metrics.timeWindowAriaLabel}
                onValueChange={handleTimeWindowChange}
                spacing={1}
                value={[timeWindow]}
                variant="subtle"
              >
                {Object.entries(TIME_WINDOW_LABELS).map(([value, label]) => (
                  <ToggleGroupItem
                    aria-label={formatMessage(
                      messages.endpoints.metrics.timeWindowItemAriaLabel,
                      { label }
                    )}
                    key={value}
                    size="sm"
                    value={value}
                    variant="tab"
                  >
                    {label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Button
                disabled={summaryQuery.isFetching || hourlyQuery.isFetching}
                onClick={async () => {
                  setRange(getMetricRange(timeWindow));
                  await summaryQuery.refetch();
                }}
                size="sm"
                type="button"
                variant="outline-elevated"
              >
                {summaryQuery.isFetching || hourlyQuery.isFetching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon
                    data-icon="inline-start"
                    icon={RepeatIcon}
                    strokeWidth={2}
                  />
                )}
                {messages.endpoints.metrics.refreshButton}
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 p-4 md:p-6">
            {metricsContent}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function MetricsContent({
  metrics,
  timeWindow,
}: {
  readonly metrics: EndpointMetrics;
  readonly timeWindow: PersistedMetricsTimeWindow;
}) {
  const summary = metrics.summary;
  const peakHour = metrics.buckets.reduce<
    (typeof metrics.buckets)[number] | null
  >(
    (peak, bucket) =>
      !peak || bucket.requests > peak.requests ? bucket : peak,
    null
  );

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden" variant="elevated">
          <CardContent size="none">
            <div className="grid gap-0 md:grid-cols-[1fr_220px]">
              <div className="flex min-h-[220px] flex-col justify-between gap-8 p-6 md:p-8">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-semibold text-muted-foreground text-sm">
                      {messages.endpoints.metrics.requestHealthLabel}
                    </p>
                    <h3 className="mt-2 font-bold font-mono text-5xl tracking-tight md:text-6xl">
                      {formatRate(summary.successRate)}
                    </h3>
                  </div>
                  <p className="max-w-[58ch] text-muted-foreground text-sm leading-relaxed">
                    {formatMessage(
                      messages.endpoints.metrics.healthDescription,
                      {
                        average: formatDuration(summary.avgMs),
                        maximum: formatDuration(summary.maxMs),
                        requests: formatInteger(summary.requests),
                        window: TIME_WINDOW_LABELS[timeWindow],
                      }
                    )}
                  </p>
                </div>
                <StatusMixBar metrics={metrics} />
              </div>

              <div className="grid border-t bg-muted/25 md:border-t-0 md:border-l">
                <MiniStat
                  label={messages.endpoints.metrics.miniStats.throughput}
                  value={`${summary.requestsPerMinute > 0 && summary.requestsPerMinute < 0.001 ? "<0.001" : new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(summary.requestsPerMinute)}/min`}
                />
                <MiniStat
                  label={messages.endpoints.metrics.miniStats.slowestRequest}
                  value={formatDuration(summary.slowestRequestMs)}
                />
                <MiniStat
                  label={messages.endpoints.metrics.miniStats.lastSeen}
                  value={
                    summary.lastSeenAt
                      ? formatJakartaTimestamp(summary.lastSeenAt)
                      : "—"
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle size="sm" variant="inline">
              <Signal aria-hidden="true" />
              {messages.endpoints.metrics.statusMix.title}
            </CardTitle>
            <CardDescription>
              {messages.endpoints.metrics.statusMix.description}
            </CardDescription>
          </CardHeader>
          <CardContent size="sm">
            <div className="flex flex-col gap-5">
              <StatusRow
                label={messages.endpoints.metrics.statusRows.delayed}
                total={summary.requests}
                value={summary.delayed}
              />
              <StatusRow
                label={messages.endpoints.metrics.statusRows.timeouts}
                total={summary.requests}
                value={summary.timeouts}
              />
              <StatusRow
                label={messages.endpoints.metrics.statusRows.unmatched}
                total={summary.requests}
                value={summary.unmatched}
              />
              <StatusRow
                label={messages.endpoints.metrics.statusRows.backendErrors}
                total={summary.requests}
                value={summary.backendErrors}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          description={messages.endpoints.metrics.cards.requests.description}
          icon={Activity}
          label={messages.endpoints.metrics.cards.requests.label}
          value={formatInteger(summary.requests)}
        />
        <MetricCard
          description={formatMessage(
            messages.endpoints.metrics.cards.successRate.description,
            { count: formatInteger(summary.successes) }
          )}
          icon={ShieldCheck}
          label={messages.endpoints.metrics.cards.successRate.label}
          tone="success"
          value={formatRate(summary.successRate)}
        />
        <MetricCard
          description={formatMessage(
            messages.endpoints.metrics.cards.errorRate.description,
            { count: formatInteger(summary.errors) }
          )}
          icon={ServerCrash}
          label={messages.endpoints.metrics.cards.errorRate.label}
          tone={summary.errorRate > 0 ? "danger" : "default"}
          value={formatRate(summary.errorRate)}
        />
        <MetricCard
          description={messages.endpoints.metrics.cards.average.description}
          icon={Gauge}
          label={messages.endpoints.metrics.cards.average.label}
          value={formatDuration(summary.avgMs)}
        />
        <MetricCard
          description={formatMessage(
            messages.endpoints.metrics.cards.minMax.description,
            {
              max: formatDuration(summary.maxMs),
              min: formatDuration(summary.minMs),
            }
          )}
          icon={TrendingUp}
          label={messages.endpoints.metrics.cards.minMax.label}
          value={`${formatDuration(summary.minMs)} / ${formatDuration(summary.maxMs)}`}
        />
        <MetricCard
          description={peakHour ? `${peakHour.label} WIB` : "—"}
          icon={TrendingUp}
          label={messages.endpoints.metrics.peakHourLabel}
          value={formatInteger(peakHour?.requests ?? 0)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle size="sm" variant="inline">
              <HugeiconsIcon
                aria-hidden="true"
                icon={Clock01Icon}
                strokeWidth={2}
              />
              {messages.endpoints.metrics.charts.latencyTitle}
            </CardTitle>
            <CardDescription>
              {messages.endpoints.metrics.charts.latencyDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[320px] w-full"
              config={latencyChartConfig}
            >
              <AreaChart accessibilityLayer data={metrics.buckets}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  minTickGap={24}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickFormatter={(value) => `${value}ms`}
                  tickLine={false}
                  tickMargin={10}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="avgMs"
                  fill="var(--color-avgMs)"
                  fillOpacity={0.12}
                  stroke="var(--color-avgMs)"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle size="sm" variant="inline">
              <TrendingUp aria-hidden="true" />
              {messages.endpoints.metrics.charts.volumeTitle}
            </CardTitle>
            <CardDescription>
              {messages.endpoints.metrics.charts.volumeDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[320px] w-full"
              config={volumeChartConfig}
            >
              <BarChart accessibilityLayer data={metrics.buckets}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  minTickGap={24}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="successes"
                  fill="var(--color-successes)"
                  radius={[4, 4, 0, 0]}
                  stackId="volume"
                />
                <Bar
                  dataKey="errors"
                  fill="var(--color-errors)"
                  radius={[4, 4, 0, 0]}
                  stackId="volume"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle size="sm">
            {messages.endpoints.metrics.httpStatuses.title}
          </CardTitle>
          <CardDescription>
            {messages.endpoints.metrics.httpStatuses.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(metrics.httpStatusCounts)
              .filter(([, count]) => count > 0)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([code, count]) => (
                <StatusRow
                  key={code}
                  label={`HTTP ${code}`}
                  total={summary.requests}
                  value={count}
                />
              ))}
            {Object.values(metrics.httpStatusCounts).every(
              (count) => count === 0
            ) && (
              <p className="text-muted-foreground text-sm">
                {messages.endpoints.metrics.httpStatuses.empty}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function MiniStat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex min-h-0 flex-col justify-center gap-1 border-b px-5 py-4 last:border-b-0">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      <span className="break-words font-medium font-mono text-sm tabular-nums">
        {value}
      </span>
    </div>
  );
}

function StatusMixBar({ metrics }: { readonly metrics: EndpointMetrics }) {
  const { summary } = metrics;
  const cleanSuccesses = Math.max(summary.successes - summary.delayed, 0);
  const successWidth = getPercentage(cleanSuccesses, summary.requests);
  const delayedWidth = getPercentage(summary.delayed, summary.requests);
  const errorWidth = getPercentage(summary.errors, summary.requests);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        <div
          aria-hidden="true"
          className="h-full w-[var(--bar-width)] bg-primary"
          // SAFETY: CSS custom property for dynamic progress width
          style={{ "--bar-width": `${successWidth}%` } as React.CSSProperties}
        />
        <div
          aria-hidden="true"
          className="h-full w-[var(--bar-width)] bg-primary/45"
          // SAFETY: CSS custom property for dynamic progress width
          style={{ "--bar-width": `${delayedWidth}%` } as React.CSSProperties}
        />
        <div
          aria-hidden="true"
          className="h-full w-[var(--bar-width)] bg-destructive"
          // SAFETY: CSS custom property for dynamic progress width
          style={{ "--bar-width": `${errorWidth}%` } as React.CSSProperties}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
        <span>
          {formatMessage(messages.endpoints.metrics.statusMix.clean, {
            count: formatInteger(cleanSuccesses),
          })}
        </span>
        <span>
          {formatMessage(messages.endpoints.metrics.statusMix.delayed, {
            count: formatInteger(summary.delayed),
          })}
        </span>
        <span>
          {formatMessage(messages.endpoints.metrics.statusMix.nonSuccess, {
            count: formatInteger(summary.errors),
          })}
        </span>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  total,
  value,
}: {
  readonly label: string;
  readonly total: number;
  readonly value: number;
}) {
  const percentage = getPercentage(value, total);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-sm">{label}</span>
        <span className="font-bold font-mono text-muted-foreground text-sm">
          {formatInteger(value)}
          <span className="ml-2 font-normal text-xs">
            {formatRate(percentage)}
          </span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          aria-hidden="true"
          className="h-full w-[var(--percentage)] rounded-full bg-primary/70 transition-all duration-300"
          // SAFETY: CSS custom property for dynamic progress width
          style={{ "--percentage": `${percentage}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

function MetricCard({
  description,
  icon: Icon,
  label,
  tone,
  value,
}: MetricCardProps) {
  const getVariant = () => {
    if (tone === "danger") {
      return "metric-danger";
    }
    if (tone === "success") {
      return "metric-success";
    }
    if (tone === "warning") {
      return "metric-warning";
    }
    return "metric-default";
  };
  const variant = getVariant();

  return (
    <Card variant={variant}>
      <CardHeader size="metric">
        <div className="min-w-0">
          <CardDescription>{label}</CardDescription>
          <CardTitle variant="kpi">{value}</CardTitle>
        </div>
        <div className="flex size-6 shrink-0 items-center justify-center text-muted-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function MetricsLoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={`metric-summary-skeleton-${index}`}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={`metric-chart-skeleton-${index}`}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[320px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function formatDuration(value: number | null) {
  return value === null ? "-" : `${formatInteger(value)} ms`;
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRate(value: number) {
  if (value > 0 && value < 0.01) {
    return "<0.01%";
  }
  if (value < 100 && value > 99.99) {
    return ">99.99%";
  }
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}%`;
}

function getPercentage(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.min(Math.max((value / total) * 100, 0), 100);
}

function getMetricRange(timeWindow: PersistedMetricsTimeWindow) {
  const to = new Date();
  const from = new Date(
    to.getTime() - PERSISTED_METRICS_TIME_WINDOWS[timeWindow]
  );
  return { from: from.toISOString(), to: to.toISOString() };
}
