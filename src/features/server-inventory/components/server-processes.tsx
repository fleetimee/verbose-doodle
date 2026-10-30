import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useEffect, useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Activity,
  ArrowUpDown,
  Cpu,
  Gauge,
  Signal,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fetchServerProcesses } from "@/features/server-inventory/api";
import { metricBytes } from "@/features/server-inventory/components/server-metric-values";
import { metricErrors } from "@/features/server-inventory/components/server-metrics";
import type {
  ServerEntry,
  ServerProcess,
  ServerProcesses as ServerProcessesData,
} from "@/features/server-inventory/types";
import { getErrorMessage } from "@/lib/error-handler";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SortKey =
  | "cpuPercent"
  | "memoryBytes"
  | "pid"
  | "name"
  | "command"
  | "threads"
  | "user";

type SortDirection = "asc" | "desc";

interface SamplePoint {
  cpu: number;
  rx: number;
  time: string;
  tx: number;
}

const HISTORY_LIMIT = 30;

function clampPercent(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}

function ratioPercent(part: number | null, total: number | null) {
  if (part === null || total === null || total <= 0) {
    return 0;
  }
  return clampPercent((part / total) * 100);
}

function meterTone(percent: number) {
  if (percent >= 90) {
    return "destructive";
  }
  if (percent >= 75) {
    return "warning";
  }
  return "default";
}

function defaultDirection(key: SortKey): SortDirection {
  if (key === "name" || key === "command" || key === "user" || key === "pid") {
    return "asc";
  }
  return "desc";
}

function CpuPanel({
  data,
  history,
}: {
  data: ServerProcessesData;
  history: SamplePoint[];
}) {
  const { messages } = useI18n();
  const copy = messages.servers.metrics;
  const gradientId = useId();
  const cpuPercent = clampPercent(data.cpuPercent);
  const perCore = data.perCore ?? [];
  const chartConfig = {
    cpu: {
      color: "var(--chart-1)",
      label: copy.cpu,
    },
  } satisfies ChartConfig;

  return (
    <Card className="lg:col-span-12" size="compact" variant="monitor">
      <CardHeader size="none">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cpu aria-hidden="true" className="size-4" />
          </div>
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <CardTitle size="sm">{copy.cpu}</CardTitle>
            {data.uptimeSeconds !== null && (
              <span className="text-muted-foreground text-xs">
                {formatMessage(copy.uptime, {
                  days: Math.floor(data.uptimeSeconds / 86_400),
                  hours: Math.floor((data.uptimeSeconds % 86_400) / 3600),
                })}
              </span>
            )}
          </div>
        </div>
        <CardAction>
          <div className="flex flex-wrap items-center gap-1.5">
            {data.loadAverage && (
              <Badge mono radius="rounded" size="sm" variant="outline-muted">
                {formatMessage(copy.processLoad, { load: data.loadAverage })}
              </Badge>
            )}
            <Badge
              mono
              radius="rounded"
              size="sm"
              variant={cpuPercent >= 90 ? "destructive" : "primary-subtle"}
            >
              {cpuPercent.toFixed(1)}%
            </Badge>
          </div>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent size="none">
        <div className="grid items-center gap-4 lg:grid-cols-[1fr_20rem]">
          <ChartContainer
            className="aspect-auto h-32 w-full"
            config={chartConfig}
          >
            <AreaChart
              accessibilityLayer
              data={history}
              margin={{ bottom: 0, left: 4, right: 4, top: 6 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-cpu)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-cpu)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tickLine={false}
                tickMargin={6}
                width={44}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-mono tabular-nums">
                        {Number(value).toFixed(1)}%
                      </span>
                    )}
                    indicator="line"
                  />
                }
              />
              <Area
                dataKey="cpu"
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
                stroke="var(--color-cpu)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>

          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/10 p-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-medium text-muted-foreground">
                {data.cores
                  ? formatMessage(copy.cores, { count: data.cores })
                  : copy.cpu}
              </span>
              <span className="font-mono font-semibold tabular-nums">
                {cpuPercent.toFixed(0)}%
              </span>
            </div>
            <Progress
              className="h-1.5"
              tone={meterTone(cpuPercent)}
              value={cpuPercent}
            />
            {perCore.length > 0 && (
              <div
                className={cn(
                  "mt-0.5 grid gap-x-3 gap-y-1.5",
                  perCore.length > 4 ? "grid-cols-2" : "grid-cols-1"
                )}
              >
                {perCore.map((coreValue, index) => {
                  const pct = clampPercent(coreValue);
                  return (
                    <div
                      className="grid grid-cols-[1.5rem_1fr_2rem] items-center gap-1.5 font-mono text-xs"
                      key={`c${index}`}
                    >
                      <span className="text-muted-foreground">C{index}</span>
                      <Progress
                        className="h-1.5"
                        tone={meterTone(pct)}
                        value={pct}
                      />
                      <span className="text-right tabular-nums">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MemoryRow({
  bytes,
  tone,
  label,
  percent,
}: {
  bytes: number | null;
  tone?: "default" | "warning" | "destructive";
  label: string;
  percent: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums">
          {metricBytes(bytes, true)}{" "}
          <span className="text-muted-foreground">({percent.toFixed(0)}%)</span>
        </span>
      </div>
      <Progress className="h-1.5" tone={tone} value={clampPercent(percent)} />
    </div>
  );
}

function MemoryAndNetColumn({
  data,
  history,
  peakRx,
  peakTx,
}: {
  data: ServerProcessesData;
  history: SamplePoint[];
  peakRx: number;
  peakTx: number;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.metrics;
  const rxGradientId = useId();
  const txGradientId = useId();
  const total = data.memoryTotalBytes;
  const usedPct = ratioPercent(data.memoryUsedBytes, total);
  const availPct = ratioPercent(data.memoryAvailableBytes, total);
  const cachedPct = ratioPercent(data.memoryCachedBytes, total);
  const freePct = ratioPercent(data.memoryFreeBytes, total);

  const netConfig = {
    rx: {
      color: "var(--chart-2)",
      label: copy.networkDownload,
    },
    tx: {
      color: "var(--chart-1)",
      label: copy.networkUpload,
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-3 lg:col-span-4">
      <Card size="compact" variant="monitor">
        <CardHeader size="none">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gauge aria-hidden="true" className="size-4" />
            </div>
            <CardTitle size="sm">{copy.memory}</CardTitle>
          </div>
          <CardAction>
            <Badge mono radius="rounded" size="sm" variant="outline-muted">
              {copy.memoryTotal}: {metricBytes(total, true)}
            </Badge>
          </CardAction>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col" size="none">
          <MemoryRow
            bytes={data.memoryUsedBytes}
            label={copy.memoryUsed}
            percent={usedPct}
            tone={meterTone(usedPct)}
          />
          <MemoryRow
            bytes={data.memoryAvailableBytes}
            label={copy.memoryAvailable}
            percent={availPct}
          />
          <MemoryRow
            bytes={data.memoryCachedBytes}
            label={copy.memoryCached}
            percent={cachedPct}
          />
          <MemoryRow
            bytes={data.memoryFreeBytes}
            label={copy.memoryFree}
            percent={freePct}
          />
        </CardContent>
      </Card>

      <Card className="flex-1" size="compact" variant="monitor">
        <CardHeader size="none">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Signal aria-hidden="true" className="size-4" />
            </div>
            <CardTitle size="sm">{copy.network}</CardTitle>
          </div>
          <CardAction>
            <Badge mono radius="rounded" size="sm" variant="outline-muted">
              {copy.io}: {metricBytes(data.diskReadBytesPerSecond, true)}/s ·{" "}
              {metricBytes(data.diskWriteBytesPerSecond, true)}/s
            </Badge>
          </CardAction>
        </CardHeader>
        <Separator />
        <CardContent
          className="flex flex-1 flex-col justify-between"
          size="none"
        >
          <ChartContainer
            className="aspect-auto h-28 w-full"
            config={netConfig}
          >
            <AreaChart
              accessibilityLayer
              data={history}
              margin={{ bottom: 0, left: 4, right: 4, top: 6 }}
            >
              <defs>
                <linearGradient id={rxGradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-rx)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-rx)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
                <linearGradient id={txGradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-tx)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-tx)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis
                axisLine={false}
                tickFormatter={(value) => metricBytes(Number(value), true)}
                tickLine={false}
                tickMargin={6}
                width={58}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-mono tabular-nums">
                        {metricBytes(Number(value), true)}/s
                      </span>
                    )}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="rx"
                fill={`url(#${rxGradientId})`}
                isAnimationActive={false}
                stroke="var(--color-rx)"
                strokeWidth={1.75}
                type="monotone"
              />
              <Area
                dataKey="tx"
                fill={`url(#${txGradientId})`}
                isAnimationActive={false}
                stroke="var(--color-tx)"
                strokeWidth={1.75}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>

          <div className="grid grid-cols-2 divide-x divide-border/60 rounded-xl border border-border/60 bg-muted/10">
            <div className="flex flex-col gap-0.5 px-3 py-2">
              <span className="text-muted-foreground text-xs">
                {copy.networkDownload}
              </span>
              <span className="font-mono font-semibold text-sm tabular-nums">
                {metricBytes(data.networkReceiveBytesPerSecond, true)}/s
              </span>
              <span className="font-mono text-muted-foreground text-xs tabular-nums">
                {copy.networkPeak}: {metricBytes(peakRx, true)}/s
              </span>
            </div>
            <div className="flex flex-col gap-0.5 px-3 py-2">
              <span className="text-muted-foreground text-xs">
                {copy.networkUpload}
              </span>
              <span className="font-mono font-semibold text-sm tabular-nums">
                {metricBytes(data.networkTransmitBytesPerSecond, true)}/s
              </span>
              <span className="font-mono text-muted-foreground text-xs tabular-nums">
                {copy.networkPeak}: {metricBytes(peakTx, true)}/s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function compareProcess(a: ServerProcess, b: ServerProcess, key: SortKey) {
  if (key === "name" || key === "command" || key === "user") {
    return a[key].localeCompare(b[key]);
  }
  return a[key] - b[key];
}

function sortProcesses(
  rows: ServerProcess[],
  key: SortKey,
  direction: SortDirection
) {
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => compareProcess(a, b, key) * factor);
}

function SortableColumnHead({
  active,
  align = "left",
  className,
  direction,
  label,
  onSort,
}: {
  active: boolean;
  align?: "left" | "right";
  className?: string;
  direction: SortDirection;
  label: string;
  onSort: () => void;
}) {
  const { messages } = useI18n();
  let ariaSort: "ascending" | "descending" | "none" = "none";
  if (active) {
    ariaSort = direction === "asc" ? "ascending" : "descending";
  }
  return (
    <TableHead
      aria-sort={ariaSort}
      className={cn("h-8", align === "right" && "text-right", className)}
    >
      <Button
        aria-label={formatMessage(messages.servers.sortBy, { column: label })}
        className={cn("h-6", align === "left" ? "-ml-1.5" : "-mr-1.5 ml-auto")}
        onClick={onSort}
        size="sm"
        type="button"
        variant={active ? "ghost" : "ghost-muted"}
      >
        {label}
        <ArrowUpDown
          className={cn("size-3", active ? "opacity-100" : "opacity-50")}
          data-icon="inline-end"
        />
      </Button>
    </TableHead>
  );
}

function ProcessesPanel({
  cores,
  data,
  direction,
  filter,
  onColumnSort,
  onFilterChange,
  onQuickSortChange,
  rows,
  sort,
}: {
  cores: number;
  data: ServerProcessesData;
  direction: SortDirection;
  filter: string;
  onColumnSort: (key: SortKey) => void;
  onFilterChange: (value: string) => void;
  onQuickSortChange: (key: SortKey) => void;
  rows: ServerProcess[];
  sort: SortKey;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.metrics;
  const totalTasks = data.taskCount ?? rows.length;

  return (
    <Card
      className="flex flex-col lg:col-span-8"
      size="compact"
      variant="monitor"
    >
      <CardHeader size="none">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Activity aria-hidden="true" className="size-4" />
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <CardTitle size="sm">{copy.processesTitle}</CardTitle>
            <Badge mono radius="rounded" size="sm" variant="outline-muted">
              {formatMessage(copy.processTasks, { count: totalTasks })}
            </Badge>
          </div>
        </div>
        <CardAction>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              aria-label={copy.processFilter}
              className="w-36 sm:w-44"
              onChange={(event) => onFilterChange(event.target.value)}
              placeholder={copy.processFilter}
              size="sm"
              type="search"
              value={filter}
            />
            <ToggleGroup
              onValueChange={(values) => {
                const next = values[0];
                if (
                  next === "name" ||
                  next === "cpuPercent" ||
                  next === "memoryBytes"
                ) {
                  onQuickSortChange(next);
                }
              }}
              size="sm"
              spacing={1}
              value={[sort]}
              variant="subtle"
            >
              <ToggleGroupItem value="cpuPercent">
                {copy.processCpu}
              </ToggleGroupItem>
              <ToggleGroupItem value="memoryBytes">
                {copy.processMemory}
              </ToggleGroupItem>
              <ToggleGroupItem value="pid">{copy.processPid}</ToggleGroupItem>
              <ToggleGroupItem value="name">{copy.processName}</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="min-h-0 flex-1" size="none">
        <ScrollArea className="h-96 overflow-hidden" variant="panel">
          <table className="w-full caption-bottom text-xs" data-slot="table">
            <TableHeader className="sticky top-0 z-10" variant="sticky">
              <TableRow>
                <SortableColumnHead
                  active={sort === "pid"}
                  className="w-20"
                  direction={direction}
                  label={copy.processPid}
                  onSort={() => onColumnSort("pid")}
                />
                <SortableColumnHead
                  active={sort === "name"}
                  direction={direction}
                  label={copy.processName}
                  onSort={() => onColumnSort("name")}
                />
                <SortableColumnHead
                  active={sort === "command"}
                  className="hidden xl:table-cell"
                  direction={direction}
                  label={copy.processCommand}
                  onSort={() => onColumnSort("command")}
                />
                <SortableColumnHead
                  active={sort === "threads"}
                  align="right"
                  className="hidden sm:table-cell"
                  direction={direction}
                  label={copy.processThreads}
                  onSort={() => onColumnSort("threads")}
                />
                <SortableColumnHead
                  active={sort === "user"}
                  className="hidden md:table-cell"
                  direction={direction}
                  label={copy.processUser}
                  onSort={() => onColumnSort("user")}
                />
                <SortableColumnHead
                  active={sort === "memoryBytes"}
                  align="right"
                  direction={direction}
                  label={copy.processMemory}
                  onSort={() => onColumnSort("memoryBytes")}
                />
                <SortableColumnHead
                  active={sort === "cpuPercent"}
                  align="right"
                  className="w-28"
                  direction={direction}
                  label={copy.processCpu}
                  onSort={() => onColumnSort("cpuPercent")}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    {copy.processesEmpty}
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => {
                const cpuShare = clampPercent(row.cpuPercent / cores);
                return (
                  <TableRow key={row.pid}>
                    <TableCell size="compact" variant="mono">
                      {row.pid}
                    </TableCell>
                    <TableCell
                      className="max-w-40"
                      size="compact"
                      variant="truncate"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell
                      className="hidden max-w-64 xl:table-cell"
                      size="compact"
                      title={row.command}
                      variant="mono"
                    >
                      {row.command}
                    </TableCell>
                    <TableCell
                      className="hidden text-right sm:table-cell"
                      size="compact"
                      variant="mono"
                    >
                      {row.threads}
                    </TableCell>
                    <TableCell
                      className="hidden max-w-24 md:table-cell"
                      size="compact"
                      variant="muted"
                    >
                      {row.user}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      size="compact"
                      variant="mono"
                    >
                      {metricBytes(row.memoryBytes, true)}
                    </TableCell>
                    <TableCell size="compact">
                      <div className="flex items-center justify-end gap-2">
                        <Progress
                          className="hidden h-1.5 w-12 sm:block"
                          tone={meterTone(cpuShare)}
                          value={cpuShare}
                        />
                        <span className="w-12 text-right font-mono tabular-nums">
                          {row.cpuPercent.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ServerProcessesSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid items-stretch gap-3 lg:grid-cols-12"
    >
      <Card className="lg:col-span-12" size="compact" variant="monitor">
        <CardHeader size="none">
          <div className="flex min-w-0 items-center gap-2.5">
            <Skeleton className="size-8 shrink-0" variant="lg" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-4 w-12" variant="table" />
              <Skeleton className="h-3.5 w-24" variant="table" />
            </div>
          </div>
          <CardAction>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-5 w-32" variant="table" />
              <Skeleton className="h-5 w-12" variant="table" />
            </div>
          </CardAction>
        </CardHeader>
        <Separator />
        <CardContent size="none">
          <div className="grid items-center gap-4 lg:grid-cols-[1fr_20rem]">
            <Skeleton className="h-32 w-full" variant="xl" />
            <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3.5 w-14" variant="table" />
                <Skeleton className="h-3.5 w-8" variant="table" />
              </div>
              <Skeleton className="h-1.5 w-full" variant="full" />
              <div className="mt-0.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {["c0", "c1", "c2", "c3", "c4", "c5"].map((core) => (
                  <div
                    className="grid grid-cols-[1.5rem_1fr_2rem] items-center gap-1.5"
                    key={core}
                  >
                    <Skeleton className="h-3 w-5" variant="table" />
                    <Skeleton className="h-1.5 w-full" variant="full" />
                    <Skeleton className="ml-auto h-3 w-6" variant="table" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 lg:col-span-4">
        <Card size="compact" variant="monitor">
          <CardHeader size="none">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 shrink-0" variant="lg" />
              <Skeleton className="h-4 w-16" variant="table" />
            </div>
            <CardAction>
              <Skeleton className="h-5 w-20" variant="table" />
            </CardAction>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col" size="none">
            {["used", "available", "cached", "free"].map((item) => (
              <div className="flex flex-col gap-1" key={item}>
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3.5 w-16" variant="table" />
                  <Skeleton className="h-3.5 w-20" variant="table" />
                </div>
                <Skeleton className="h-1.5 w-full" variant="full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex-1" size="compact" variant="monitor">
          <CardHeader size="none">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 shrink-0" variant="lg" />
              <Skeleton className="h-4 w-16" variant="table" />
            </div>
            <CardAction>
              <Skeleton className="h-5 w-28" variant="table" />
            </CardAction>
          </CardHeader>
          <Separator />
          <CardContent
            className="flex flex-1 flex-col justify-between"
            size="none"
          >
            <Skeleton className="h-28 w-full" variant="xl" />
            <div className="grid grid-cols-2 divide-x divide-border/60 rounded-xl border border-border/60 bg-muted/10">
              {["rx", "tx"].map((dir) => (
                <div className="flex flex-col gap-1 px-3 py-2" key={dir}>
                  <Skeleton className="h-3 w-14" variant="table" />
                  <Skeleton className="h-4 w-16" variant="table" />
                  <Skeleton className="h-3 w-20" variant="table" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card
        className="flex flex-col lg:col-span-8"
        size="compact"
        variant="monitor"
      >
        <CardHeader size="none">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-8 shrink-0" variant="lg" />
            <Skeleton className="h-4 w-28" variant="table" />
            <Skeleton className="h-5 w-16" variant="table" />
          </div>
          <CardAction>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-36 sm:w-44" variant="table" />
              <Skeleton className="h-8 w-52" variant="xl" />
            </div>
          </CardAction>
        </CardHeader>
        <Separator />
        <CardContent className="min-h-0 flex-1" size="none">
          <div className="h-96 overflow-hidden rounded-xl border border-border/60">
            <div className="grid grid-cols-5 gap-3 border-border/60 border-b bg-card/95 px-3 py-2">
              <Skeleton className="h-3.5 w-10" variant="table" />
              <Skeleton className="h-3.5 w-20" variant="table" />
              <Skeleton className="h-3.5 w-28" variant="table" />
              <Skeleton className="ml-auto h-3.5 w-12" variant="table" />
              <Skeleton className="ml-auto h-3.5 w-12" variant="table" />
            </div>
            <div className="divide-y divide-border/40">
              {[
                "r1",
                "r2",
                "r3",
                "r4",
                "r5",
                "r6",
                "r7",
                "r8",
                "r9",
                "r10",
              ].map((row) => (
                <div
                  className="grid grid-cols-5 items-center gap-3 px-3 py-2"
                  key={row}
                >
                  <Skeleton className="h-3.5 w-12" variant="table" />
                  <Skeleton className="h-3.5 w-24" variant="table" />
                  <Skeleton className="h-3.5 w-36" variant="table" />
                  <Skeleton className="ml-auto h-3.5 w-12" variant="table" />
                  <Skeleton className="ml-auto h-3.5 w-16" variant="table" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ServerProcesses({
  entry,
  paused,
}: {
  entry: ServerEntry;
  paused: boolean;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.metrics;
  const [sort, setSort] = useState<SortKey>("cpuPercent");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [filter, setFilter] = useState("");
  const [history, setHistory] = useState<SamplePoint[]>([]);
  const [peaks, setPeaks] = useState({ rx: 0, tx: 0 });
  const deferred = useDeferredValue(filter.trim().toLowerCase());

  const handleColumnSort = (key: SortKey) => {
    if (sort === key) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDirection(defaultDirection(key));
    }
  };

  const handleQuickSortChange = (key: SortKey) => {
    if (sort === key) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDirection(defaultDirection(key));
    }
  };

  const query = useQuery({
    queryKey: ["server-inventory", "processes", entry.id, entry.updatedAt],
    queryFn: ({ signal }) => fetchServerProcesses(entry.id, signal),
    enabled: Boolean(entry.hasPassword && entry.username) && !paused,
    refetchInterval: (current) => {
      if (paused) {
        return false;
      }
      const currentStatus = current.state.data?.status;
      if (
        currentStatus === "UNSUPPORTED_OS" ||
        currentStatus === "HOST_KEY_REQUIRED" ||
        currentStatus === "HOST_KEY_REJECTED" ||
        currentStatus === "AUTH_FAILED"
      ) {
        return false;
      }
      if (
        currentStatus === "CONNECTION_FAILED" ||
        currentStatus === "COLLECTION_FAILED"
      ) {
        return 15_000;
      }
      return 3000;
    },
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 30_000,
  });

  const data = query.data?.status === "OK" ? query.data : undefined;

  useEffect(() => {
    setHistory([]);
    setPeaks({ rx: 0, tx: 0 });
  }, [entry.id]);

  useEffect(() => {
    if (!data?.collectedAt) {
      return;
    }
    const time = new Date(data.collectedAt).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const rx = data.networkReceiveBytesPerSecond ?? 0;
    const tx = data.networkTransmitBytesPerSecond ?? 0;
    const point: SamplePoint = {
      cpu: clampPercent(data.cpuPercent),
      rx,
      time,
      tx,
    };
    setHistory((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), point]);
    setPeaks((prev) => ({
      rx: Math.max(prev.rx, rx),
      tx: Math.max(prev.tx, tx),
    }));
  }, [
    data?.collectedAt,
    data?.cpuPercent,
    data?.networkReceiveBytesPerSecond,
    data?.networkTransmitBytesPerSecond,
    locale,
  ]);

  const rows = useMemo(() => {
    const all = sortProcesses(data?.processes ?? [], sort, direction);
    if (!deferred) {
      return all;
    }
    return all.filter((row) =>
      `${row.pid} ${row.user} ${row.name} ${row.command}`
        .toLowerCase()
        .includes(deferred)
    );
  }, [data?.processes, sort, direction, deferred]);

  const status = query.data?.status;
  let error: string | undefined;
  if (query.isError) {
    error = getErrorMessage(query.error);
  } else if (status && status !== "OK") {
    error = metricErrors(messages, false).get(status);
  }
  const cores = Math.max(1, data?.cores ?? 1);
  const loading = query.isPending && !paused;

  return (
    <section
      aria-busy={loading}
      aria-label={copy.processesTitle}
      className="flex min-w-0 flex-col gap-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-xl tracking-tight">
            {copy.processesTitle}
          </h2>
          <p className="text-muted-foreground text-sm">
            {copy.processesDescription}
          </p>
        </div>
        {loading && (
          <p className="text-muted-foreground text-xs" role="status">
            {copy.collecting}
          </p>
        )}
        {paused && (
          <p className="text-muted-foreground text-xs">{copy.paused}</p>
        )}
        {data && !paused && (
          <span className="text-success text-xs">{copy.live}</span>
        )}
      </div>

      {loading && <ServerProcessesSkeleton />}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {data && (
        <div className="grid items-stretch gap-3 lg:grid-cols-12">
          <CpuPanel data={data} history={history} />
          <MemoryAndNetColumn
            data={data}
            history={history}
            peakRx={peaks.rx}
            peakTx={peaks.tx}
          />
          <ProcessesPanel
            cores={cores}
            data={data}
            direction={direction}
            filter={filter}
            onColumnSort={handleColumnSort}
            onFilterChange={setFilter}
            onQuickSortChange={handleQuickSortChange}
            rows={rows}
            sort={sort}
          />
        </div>
      )}
    </section>
  );
}
