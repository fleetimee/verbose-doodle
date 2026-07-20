import {
  Activity,
  AlertCircle,
  BarChart3,
  Clock,
  Gauge,
  RefreshCw,
  ServerCrash,
  ShieldCheck,
  Signal,
  TrendingUp,
} from "lucide-react";
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
import {
  useGetEndpointHourlyMetrics,
  useGetEndpointMetricsSummary,
} from "@/features/endpoints/hooks/use-get-endpoint-metrics";
import {
  type EndpointMetrics,
  getPersistedEndpointMetrics,
  PERSISTED_METRICS_TIME_WINDOWS,
  type PersistedMetricsTimeWindow,
} from "@/features/endpoints/utils/endpoint-metrics";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TIME_WINDOW_LABELS: Record<PersistedMetricsTimeWindow, string> = {
  "24h": messages.endpoints.metrics.timeWindows["24h"],
  "7d": messages.endpoints.metrics.timeWindows["7d"],
  "30d": messages.endpoints.metrics.timeWindows["30d"],
};

const latencyChartConfig = {
  avgMs: {
    label: messages.endpoints.metrics.charts.avgLabel,
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const volumeChartConfig = {
  requests: {
    label: messages.endpoints.metrics.charts.requestsLabel,
    color: "var(--chart-1)",
  },
  successes: {
    label: messages.endpoints.metrics.charts.successesLabel,
    color: "var(--chart-2)",
  },
  errors: {
    label: messages.endpoints.metrics.charts.errorsLabel,
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const emptyMetric = {
  requestCount: 0,
  hitStatusCounts: {},
  httpStatusCounts: {},
  totalDurationMs: 0,
  minDurationMs: null,
  maxDurationMs: null,
  averageDurationMs: 0,
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
  const range = useMemo(() => getMetricRange(timeWindow), [timeWindow]);
  const summaryQuery = useGetEndpointMetricsSummary(endpointId, open);
  const hourlyQuery = useGetEndpointHourlyMetrics(
    endpointId,
    range.from,
    range.to,
    open
  );

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
      setTimeWindow(nextValue as PersistedMetricsTimeWindow);
    }
  };

  let metricsContent: ReactNode;
  if (summaryQuery.isPending || hourlyQuery.isPending) {
    metricsContent = <MetricsLoadingState />;
  } else if (summaryQuery.error || hourlyQuery.error) {
    metricsContent = (
      <Alert variant="destructive">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>{messages.endpoints.metrics.loadErrorTitle}</AlertTitle>
        <AlertDescription>
          {(summaryQuery.error ?? hourlyQuery.error)?.message}
        </AlertDescription>
      </Alert>
    );
  } else if (metrics.summary.requests === 0) {
    metricsContent = (
      <Empty className="min-h-[460px] border">
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
        className="w-[98vw] gap-0 overflow-hidden bg-background p-0 sm:max-w-none md:w-[min(1240px,92vw)]"
        side="right"
      >
        <SheetHeader className="border-b bg-background/95 px-5 py-4 pr-12 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.45)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <SheetTitle className="flex items-center gap-2">
                <BarChart3 aria-hidden="true" />
                {messages.endpoints.metrics.title}
              </SheetTitle>
              <SheetDescription className="truncate">
                {formatMessage(messages.endpoints.metrics.description, {
                  endpointLabel,
                })}
              </SheetDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                aria-label={messages.endpoints.metrics.timeWindowAriaLabel}
                className="rounded-lg border bg-muted/40 p-1"
                onValueChange={handleTimeWindowChange}
                spacing={1}
                value={[timeWindow]}
              >
                {Object.entries(TIME_WINDOW_LABELS).map(([value, label]) => (
                  <ToggleGroupItem
                    aria-label={formatMessage(
                      messages.endpoints.metrics.timeWindowItemAriaLabel,
                      { label }
                    )}
                    className="data-pressed:bg-background data-pressed:shadow-xs"
                    key={value}
                    size="sm"
                    value={value}
                  >
                    {label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Button
                className="transition-transform active:scale-[0.98]"
                disabled={summaryQuery.isFetching || hourlyQuery.isFetching}
                onClick={async () => {
                  await Promise.all([
                    summaryQuery.refetch(),
                    hourlyQuery.refetch(),
                  ]);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                {summaryQuery.isFetching || hourlyQuery.isFetching ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCw data-icon="inline-start" />
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

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden border-border/60 bg-background shadow-[0_24px_50px_-34px_rgba(15,23,42,0.55)]">
          <CardContent className="p-0">
            <div className="grid gap-0 md:grid-cols-[1fr_220px]">
              <div className="flex min-h-[220px] flex-col justify-between gap-8 p-6 md:p-8">
                <div className="flex flex-col gap-3">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 font-medium text-muted-foreground text-xs">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 rounded-full",
                        summary.errorRate > 20 ? "bg-destructive" : "bg-primary"
                      )}
                    />
                    {messages.endpoints.metrics.liveWindowLabel}
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground text-sm">
                      {messages.endpoints.metrics.requestHealthLabel}
                    </p>
                    <h3 className="mt-2 font-mono font-semibold text-5xl tracking-tight md:text-6xl">
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
                  value={`${summary.requestsPerMinute}/min`}
                />
                <MiniStat
                  label={messages.endpoints.metrics.miniStats.slowestRequest}
                  value={formatDuration(summary.slowestRequestMs)}
                />
                <MiniStat
                  label={messages.endpoints.metrics.miniStats.lastSeen}
                  value={formatRelativeTime(summary.lastSeenAt)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background shadow-[0_24px_50px_-34px_rgba(15,23,42,0.55)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Signal aria-hidden="true" />
              {messages.endpoints.metrics.statusMix.title}
            </CardTitle>
            <CardDescription>
              {messages.endpoints.metrics.statusMix.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock aria-hidden="true" />
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
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
                  dataKey="requests"
                  fill="var(--color-requests)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="successes"
                  fill="var(--color-successes)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="errors"
                  fill="var(--color-errors)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
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
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-[0.14em]">
        {label}
      </span>
      <span className="break-words font-mono font-semibold text-xl tracking-tight">
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
  const errorWidth = Math.max(
    getPercentage(summary.errors, summary.requests),
    summary.errors > 0 ? 2 : 0
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        <div
          aria-hidden="true"
          className="bg-primary"
          style={{ width: `${successWidth}%` }}
        />
        <div
          aria-hidden="true"
          className="bg-primary/45"
          style={{ width: `${delayedWidth}%` }}
        />
        <div
          aria-hidden="true"
          className="bg-destructive"
          style={{ width: `${errorWidth}%` }}
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
        <span className="text-sm">{label}</span>
        <span className="font-mono text-muted-foreground text-sm">
          {formatInteger(value)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          aria-hidden="true"
          className="h-full rounded-full bg-primary/70 transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
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
  const toneClassName = {
    danger: "border-destructive/30 bg-destructive/5",
    default: "border-border/60 bg-background",
    success: "border-primary/25 bg-primary/5",
    warning: "border-primary/20 bg-primary/5",
  }[tone ?? "default"];

  return (
    <Card
      className={cn(
        "overflow-hidden shadow-[0_20px_40px_-34px_rgba(15,23,42,0.45)] transition-transform duration-300 active:scale-[0.99]",
        toneClassName
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="min-w-0">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-2 break-words font-mono text-xl leading-tight md:text-2xl">
            {value}
          </CardTitle>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background/75 text-muted-foreground">
          <Icon aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

function MetricsLoadingState() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
  return `${value}%`;
}

function formatRelativeTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return "-";
  }

  const seconds = Math.max(Math.round((Date.now() - timestamp) / 1000), 0);
  if (seconds < 60) {
    return formatMessage(messages.endpoints.metrics.relative.secondsAgo, {
      count: seconds,
    });
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return formatMessage(messages.endpoints.metrics.relative.minutesAgo, {
      count: minutes,
    });
  }

  const hours = Math.round(minutes / 60);
  return formatMessage(messages.endpoints.metrics.relative.hoursAgo, {
    count: hours,
  });
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
