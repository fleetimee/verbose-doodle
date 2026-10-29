import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ArrowUpDown, BarChart3, Cpu } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { metricBytes } from "@/features/server-inventory/components/server-metric-values";
import type {
  ServerContainer,
  ServerContainerProcess,
} from "@/features/server-inventory/types";

const HISTORY_LIMIT = 24;
const BYTE_UNIT_PATTERN = /^([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)$/;

const UNIT_MULTIPLIERS: Record<string, number> = {
  b: 1,
  kb: 1000,
  kib: 1024,
  mb: 1_000_000,
  mib: 1_048_576,
  gb: 1_000_000_000,
  gib: 1_073_741_824,
  tb: 1_000_000_000_000,
  tib: 1_099_511_627_776,
};

function parseDockerBytes(raw: string | undefined): number {
  if (!raw) {
    return 0;
  }
  const match = raw.trim().match(BYTE_UNIT_PATTERN);
  if (!match) {
    return 0;
  }
  const amount = Number.parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = UNIT_MULTIPLIERS[unit] ?? 1;
  return Number.isFinite(amount) ? Math.round(amount * multiplier) : 0;
}

function parsePairBytes(pair: string | null | undefined): [number, number] {
  if (!pair) {
    return [0, 0];
  }
  const parts = pair.split(" / ");
  return [parseDockerBytes(parts[0]), parseDockerBytes(parts[1])];
}

interface ContainerStatPoint {
  cpuPercent: number;
  memoryBytes: number;
  readBytes: number;
  rxBytes: number;
  time: string;
  txBytes: number;
  writeBytes: number;
}

function SingleSeriesChartCard({
  title,
  seriesLabel,
  dataKey,
  color,
  data,
  formatValue,
}: {
  title: string;
  seriesLabel: string;
  dataKey: "memoryBytes" | "cpuPercent";
  color: string;
  data: ContainerStatPoint[];
  formatValue: (value: number) => string;
}) {
  const gradientId = useId();
  const config = {
    [dataKey]: {
      label: seriesLabel,
      color,
    },
  } satisfies ChartConfig;

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/15 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground"
          />
          <h3 className="font-medium text-xs tracking-[-0.01em]">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span
            aria-hidden="true"
            className="h-2 w-4 rounded-xs border"
            style={{
              backgroundColor: `color-mix(in oklab, ${color} 35%, transparent)`,
              borderColor: color,
            }}
          />
          <span>{seriesLabel}</span>
        </div>
      </div>
      <ChartContainer className="aspect-auto h-44 w-full" config={config}>
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ bottom: 0, left: 4, right: 8, top: 6 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.32} />
              <stop offset="95%" stopColor={color} stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="time"
            interval="preserveStartEnd"
            minTickGap={48}
            tickLine={false}
            tickMargin={6}
          />
          <YAxis
            axisLine={false}
            domain={[0, (max: number) => (max <= 0 ? 1 : max * 1.15)]}
            tickFormatter={(value) => formatValue(Number(value))}
            tickLine={false}
            tickMargin={6}
            width={58}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-mono tabular-nums">
                    {formatValue(Number(value))}
                  </span>
                )}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey={dataKey}
            dot={{ r: 2, fill: color }}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            stroke={color}
            strokeWidth={1.75}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

function DualSeriesChartCard({
  title,
  firstKey,
  firstLabel,
  firstColor,
  secondKey,
  secondLabel,
  secondColor,
  data,
  formatValue,
}: {
  title: string;
  firstKey: "rxBytes" | "readBytes";
  firstLabel: string;
  firstColor: string;
  secondKey: "txBytes" | "writeBytes";
  secondLabel: string;
  secondColor: string;
  data: ContainerStatPoint[];
  formatValue: (value: number) => string;
}) {
  const firstGradientId = useId();
  const secondGradientId = useId();
  const config = {
    [firstKey]: {
      label: firstLabel,
      color: firstColor,
    },
    [secondKey]: {
      label: secondLabel,
      color: secondColor,
    },
  } satisfies ChartConfig;

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/15 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground"
          />
          <h3 className="font-medium text-xs tracking-[-0.01em]">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2 w-4 rounded-xs border"
              style={{
                backgroundColor: `color-mix(in oklab, ${firstColor} 35%, transparent)`,
                borderColor: firstColor,
              }}
            />
            {firstLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2 w-4 rounded-xs border"
              style={{
                backgroundColor: `color-mix(in oklab, ${secondColor} 35%, transparent)`,
                borderColor: secondColor,
              }}
            />
            {secondLabel}
          </span>
        </div>
      </div>
      <ChartContainer className="aspect-auto h-44 w-full" config={config}>
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ bottom: 0, left: 4, right: 8, top: 6 }}
        >
          <defs>
            <linearGradient id={firstGradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={firstColor} stopOpacity={0.28} />
              <stop offset="95%" stopColor={firstColor} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id={secondGradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={secondColor} stopOpacity={0.28} />
              <stop offset="95%" stopColor={secondColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="time"
            interval="preserveStartEnd"
            minTickGap={48}
            tickLine={false}
            tickMargin={6}
          />
          <YAxis
            axisLine={false}
            domain={[0, (max: number) => (max <= 0 ? 1 : max * 1.15)]}
            tickFormatter={(value) => formatValue(Number(value))}
            tickLine={false}
            tickMargin={6}
            width={58}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-mono tabular-nums">
                    {formatValue(Number(value))}
                  </span>
                )}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey={firstKey}
            dot={{ r: 2, fill: firstColor }}
            fill={`url(#${firstGradientId})`}
            isAnimationActive={false}
            stroke={firstColor}
            strokeWidth={1.75}
            type="monotone"
          />
          <Area
            dataKey={secondKey}
            dot={{ r: 2, fill: secondColor }}
            fill={`url(#${secondGradientId})`}
            isAnimationActive={false}
            stroke={secondColor}
            strokeWidth={1.75}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

export function ServerContainerStatisticsChartsSkeleton() {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const metricsCopy = messages.servers.metrics;
  const cards = [
    { title: copy.memoryUsageChart, legends: [metricsCopy.memory] },
    { title: copy.cpuUsageChart, legends: [metricsCopy.cpu] },
    {
      title: copy.networkUsageChart,
      legends: [metricsCopy.receive, metricsCopy.transmit],
    },
    {
      title: copy.ioUsageChart,
      legends: [metricsCopy.read, metricsCopy.write],
    },
  ];

  return (
    <div aria-hidden="true" className="grid min-w-0 gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <div
          className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/15 p-4"
          key={card.title}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
              <span className="font-medium text-xs tracking-[-0.01em]">
                {card.title}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              {card.legends.map((legend) => (
                <span className="inline-flex items-center gap-1.5" key={legend}>
                  <Skeleton className="h-2 w-4 rounded-xs" variant="table" />
                  <span>{legend}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex h-44 w-full flex-col justify-between pt-2">
            {["r1", "r2", "r3", "r4"].map((rowKey) => (
              <div className="flex items-center gap-3" key={rowKey}>
                <Skeleton className="h-3 w-10 shrink-0" variant="table" />
                <div className="h-px flex-1 border-border/40 border-b border-dashed" />
              </div>
            ))}
            <div className="flex items-center justify-between pl-12">
              <Skeleton className="h-3 w-14" variant="table" />
              <Skeleton className="h-3 w-14" variant="table" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ServerContainerStatisticsCharts({
  item,
  collectedAt,
}: {
  item?: ServerContainer;
  collectedAt?: string | null;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.containers;
  const metricsCopy = messages.servers.metrics;
  const [history, setHistory] = useState<ContainerStatPoint[]>([]);
  const lastSampleRef = useRef<string | null>(null);

  useEffect(() => {
    if (item?.state !== "running") {
      return;
    }
    const sampleKey =
      collectedAt ??
      `${item.cpuPercent}-${item.memoryUsage}-${item.networkIo}-${item.blockIo}`;
    if (lastSampleRef.current === sampleKey) {
      return;
    }
    lastSampleRef.current = sampleKey;

    const timestamp = collectedAt ? new Date(collectedAt) : new Date();
    const timeLabel = timestamp.toLocaleTimeString(locale, {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const [memoryUsedBytes] = parsePairBytes(item.memoryUsage);
    const [rxBytes, txBytes] = parsePairBytes(item.networkIo);
    const [readBytes, writeBytes] = parsePairBytes(item.blockIo);

    const point: ContainerStatPoint = {
      time: timeLabel,
      memoryBytes: memoryUsedBytes,
      cpuPercent: item.cpuPercent ?? 0,
      rxBytes,
      txBytes,
      readBytes,
      writeBytes,
    };

    setHistory((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), point]);
  }, [item, collectedAt, locale]);

  if (item?.state !== "running" || history.length === 0) {
    return null;
  }

  const chartData =
    history.length === 1 ? [{ ...history[0], time: "" }, history[0]] : history;

  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      <SingleSeriesChartCard
        color="var(--chart-1)"
        data={chartData}
        dataKey="memoryBytes"
        formatValue={(val) => metricBytes(val, true)}
        seriesLabel={metricsCopy.memory}
        title={copy.memoryUsageChart}
      />
      <SingleSeriesChartCard
        color="var(--chart-2)"
        data={chartData}
        dataKey="cpuPercent"
        formatValue={(val) => `${val.toFixed(1)}%`}
        seriesLabel={metricsCopy.cpu}
        title={copy.cpuUsageChart}
      />
      <DualSeriesChartCard
        data={chartData}
        firstColor="var(--chart-1)"
        firstKey="rxBytes"
        firstLabel={metricsCopy.receive}
        formatValue={(val) => metricBytes(val, true)}
        secondColor="var(--chart-4)"
        secondKey="txBytes"
        secondLabel={metricsCopy.transmit}
        title={copy.networkUsageChart}
      />
      <DualSeriesChartCard
        data={chartData}
        firstColor="var(--chart-1)"
        firstKey="readBytes"
        firstLabel={metricsCopy.read}
        formatValue={(val) => metricBytes(val, true)}
        secondColor="var(--chart-4)"
        secondKey="writeBytes"
        secondLabel={metricsCopy.write}
        title={copy.ioUsageChart}
      />
    </div>
  );
}

type ProcessSortKey = keyof ServerContainerProcess;

const PROCESS_COLUMNS: {
  key: ProcessSortKey;
  label: string;
  numeric?: boolean;
}[] = [
  { key: "uid", label: "UID", numeric: true },
  { key: "pid", label: "PID", numeric: true },
  { key: "ppid", label: "PPID", numeric: true },
  { key: "c", label: "C", numeric: true },
  { key: "stime", label: "STIME" },
  { key: "tty", label: "TTY" },
  { key: "time", label: "TIME" },
  { key: "cmd", label: "CMD" },
];

function compareProcessValues(
  a: ServerContainerProcess,
  b: ServerContainerProcess,
  key: ProcessSortKey,
  numeric?: boolean
) {
  if (numeric) {
    const numA = Number.parseFloat(a[key]);
    const numB = Number.parseFloat(b[key]);
    if (Number.isFinite(numA) && Number.isFinite(numB)) {
      return numA - numB;
    }
  }
  return a[key].localeCompare(b[key]);
}

export function ServerContainerProcessesCard({
  processes,
  loading,
}: {
  processes?: ServerContainerProcess[] | null;
  loading: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<ProcessSortKey>("pid");
  const [sortAsc, setSortAsc] = useState(true);

  const filteredProcesses = useMemo(() => {
    const list = processes ?? [];
    const query = search.trim().toLowerCase();
    const matched = query
      ? list.filter((proc) =>
          Object.values(proc).some((val) =>
            String(val).toLowerCase().includes(query)
          )
        )
      : list;
    const col = PROCESS_COLUMNS.find((c) => c.key === sortKey);
    return [...matched].sort((a, b) => {
      const cmp = compareProcessValues(a, b, sortKey, col?.numeric);
      return sortAsc ? cmp : -cmp;
    });
  }, [processes, search, sortKey, sortAsc]);

  const handleSort = (key: ProcessSortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
      return;
    }
    setSortKey(key);
    setSortAsc(true);
  };

  return (
    <Card size="monitor" variant="monitor">
      <CardHeader size="none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle
            className="text-sm tracking-[-0.01em]"
            size="sm"
            variant="inline"
          >
            <Cpu
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            {copy.processesTitle}
          </CardTitle>
          <div className="relative flex items-center">
            <HugeiconsIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground"
              icon={Search01Icon}
              strokeWidth={2}
            />
            <input
              aria-label={copy.processesSearch}
              className="h-7 w-44 rounded-lg border border-border/60 bg-muted/30 pr-7 pl-8 text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring focus:bg-background sm:w-56"
              disabled={loading || !processes?.length}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.processesSearch}
              type="text"
              value={search}
            />
            {search && (
              <button
                aria-label={messages.common.clear}
                className="absolute right-1.5 flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                onClick={() => setSearch("")}
                type="button"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-3"
                  icon={Cancel01Icon}
                  strokeWidth={2}
                />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent size="none">
        {!loading && filteredProcesses.length === 0 && (
          <p className="rounded-xl border border-border/50 bg-muted/15 px-4 py-3 text-muted-foreground text-xs">
            {copy.processesEmpty}
          </p>
        )}
        {(loading || filteredProcesses.length > 0) && (
          <ScrollArea
            className="max-h-64 w-full min-w-0 max-w-full rounded-xl border border-border/50 bg-muted/15"
            variant="fit"
            viewportClassName="max-h-64"
          >
            <table className="w-full min-w-max border-collapse text-left text-xs">
              <thead>
                <tr className="border-border/50 border-b bg-muted/20 text-muted-foreground">
                  {PROCESS_COLUMNS.map((col) => (
                    <th
                      className="px-3.5 py-2.5 font-medium"
                      key={col.key}
                      scope="col"
                    >
                      <button
                        className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                        disabled={loading}
                        onClick={() => handleSort(col.key)}
                        type="button"
                      >
                        <span>{col.label}</span>
                        <ArrowUpDown
                          aria-hidden="true"
                          className="size-3 opacity-60"
                        />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {loading
                  ? ["s1", "s2"].map((rowKey) => (
                      <tr key={rowKey}>
                        <td className="px-3.5 py-2.5">
                          <Skeleton className="h-4 w-8" variant="table" />
                        </td>
                        <td className="px-3.5 py-2.5">
                          <Skeleton className="h-4 w-14" variant="table" />
                        </td>
                        <td className="px-3.5 py-2.5">
                          <Skeleton className="h-4 w-14" variant="table" />
                        </td>
                        <td className="px-3.5 py-2.5">
                          <Skeleton className="h-4 w-6" variant="table" />
                        </td>
                        <td className="px-3.5 py-2.5">
                          <Skeleton className="h-4 w-12" variant="table" />
                        </td>
                        <td className="px-3.5 py-2.5">
                          <Skeleton className="h-4 w-6" variant="table" />
                        </td>
                        <td className="px-3.5 py-2.5">
                          <Skeleton className="h-4 w-16" variant="table" />
                        </td>
                        <td className="px-3.5 py-2.5">
                          <Skeleton className="h-4 w-64" variant="table" />
                        </td>
                      </tr>
                    ))
                  : filteredProcesses.map((proc) => (
                      <tr
                        className="transition-colors hover:bg-muted/30"
                        key={`${proc.pid}-${proc.stime}`}
                      >
                        <td className="whitespace-nowrap px-3.5 py-2.5 tabular-nums">
                          {proc.uid}
                        </td>
                        <td className="whitespace-nowrap px-3.5 py-2.5 font-medium text-foreground tabular-nums">
                          {proc.pid}
                        </td>
                        <td className="whitespace-nowrap px-3.5 py-2.5 text-muted-foreground tabular-nums">
                          {proc.ppid}
                        </td>
                        <td className="whitespace-nowrap px-3.5 py-2.5 text-muted-foreground tabular-nums">
                          {proc.c}
                        </td>
                        <td className="whitespace-nowrap px-3.5 py-2.5 text-muted-foreground tabular-nums">
                          {proc.stime}
                        </td>
                        <td className="whitespace-nowrap px-3.5 py-2.5 text-muted-foreground">
                          {proc.tty}
                        </td>
                        <td className="whitespace-nowrap px-3.5 py-2.5 text-muted-foreground tabular-nums">
                          {proc.time}
                        </td>
                        <td className="px-3.5 py-2.5 text-foreground">
                          {proc.cmd}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
