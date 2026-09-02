import {
  ActivityIcon,
  AlertCircleIcon,
  DashedLineCircleIcon,
  DownloadIcon,
  RecordIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Eraser, MousePointerClick, TimerReset } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import type {
  TrafficDirection,
  TrafficLogEntry,
} from "@/features/socket-tester/types";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type TrafficConsoleProps = {
  readonly logs: readonly TrafficLogEntry[];
  readonly onClear: () => void;
  readonly onInspect: (entry: TrafficLogEntry) => void;
  readonly tourId?: string;
};

const directionStyles: Record<TrafficDirection, string> = {
  err: "text-red-300",
  in: "text-emerald-300",
  out: "text-sky-300",
  sys: "text-slate-300",
};

const directionDotStyles: Record<TrafficDirection, string> = {
  err: "bg-red-400",
  in: "bg-emerald-400",
  out: "bg-sky-400",
  sys: "bg-slate-400",
};

const directionLabels: Record<TrafficDirection, string> = {
  err: "ERR",
  in: "IN",
  out: "OUT",
  sys: "SYS",
};

function exportLogs(logs: readonly TrafficLogEntry[]) {
  const body = logs
    .map(
      (entry) =>
        `[${entry.timestamp}] [${directionLabels[entry.direction]}] ${entry.protocol} ${entry.scope} ${entry.data}`
    )
    .join("\n");
  const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `socket-test-${new Date().toISOString()}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getLatestLabel(logs: readonly TrafficLogEntry[]) {
  return logs.at(-1)?.timestamp ?? "-";
}

function getDirectionCount(
  logs: readonly TrafficLogEntry[],
  direction: TrafficDirection
) {
  return logs.filter((entry) => entry.direction === direction).length;
}

function ConsoleMetric({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string | number;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-3 py-2 shadow-xs">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase">{label}</p>
        <p className="truncate font-mono font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}

function DirectionBadge({
  direction,
}: {
  readonly direction: TrafficDirection;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold text-xs",
        directionStyles[direction]
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", directionDotStyles[direction])}
      />
      {directionLabels[direction]}
    </span>
  );
}

export function TrafficConsole({
  logs,
  onClear,
  onInspect,
  tourId,
}: TrafficConsoleProps) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const inboundCount = getDirectionCount(logs, "in");
  const outboundCount = getDirectionCount(logs, "out");
  const errorCount = getDirectionCount(logs, "err");
  const socketMessages = messages.socketTester;

  useEffect(() => {
    if (!autoScroll) {
      return;
    }

    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );

    viewport?.scrollTo({
      behavior: "smooth",
      top: viewport.scrollHeight,
    });
  }, [autoScroll, logs.length]);

  return (
    <section className="flex min-w-0 flex-col gap-3" id={tourId}>
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
              <HugeiconsIcon
                aria-hidden="true"
                className="size-5"
                icon={RecordIcon}
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="font-semibold text-lg">
                {socketMessages.trafficConsoleTitle}
              </h2>
              <p className="text-muted-foreground text-sm">
                {socketMessages.trafficConsoleDescription}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label
              className="inline-flex h-8 items-center gap-2 rounded-md border bg-muted/20 px-3 font-medium text-sm"
              htmlFor="socket-traffic-auto-scroll"
            >
              <HugeiconsIcon
                className="size-4 text-muted-foreground"
                icon={ActivityIcon}
                strokeWidth={2}
              />
              <span>{socketMessages.autoScrollLabel}</span>
              <Switch
                checked={autoScroll}
                id="socket-traffic-auto-scroll"
                onCheckedChange={setAutoScroll}
              />
            </label>
            <Button
              className="h-8 gap-2 transition-transform duration-150 ease-out active:scale-[0.97]"
              onClick={() => exportLogs(logs)}
              size="sm"
              type="button"
              variant="outline"
            >
              <HugeiconsIcon
                className="size-3.5"
                icon={DownloadIcon}
                strokeWidth={2}
              />
              {socketMessages.saveButton}
            </Button>
            <Button
              className="h-8 gap-2 transition-transform duration-150 ease-out active:scale-[0.97]"
              onClick={onClear}
              size="sm"
              type="button"
              variant="outline"
            >
              <Eraser className="size-3.5" />
              {socketMessages.clearButton}
            </Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          <ConsoleMetric
            icon={
              <HugeiconsIcon
                className="size-3.5"
                icon={DashedLineCircleIcon}
                strokeWidth={2}
              />
            }
            label={socketMessages.framesMetric}
            value={logs.length}
          />
          <ConsoleMetric
            icon={
              <HugeiconsIcon
                className="size-3.5"
                icon={DownloadIcon}
                strokeWidth={2}
              />
            }
            label={socketMessages.inboundMetric}
            value={inboundCount}
          />
          <ConsoleMetric
            icon={
              <HugeiconsIcon
                className="size-3.5"
                icon={ActivityIcon}
                strokeWidth={2}
              />
            }
            label={socketMessages.outboundMetric}
            value={outboundCount}
          />
          <ConsoleMetric
            icon={
              errorCount > 0 ? (
                <HugeiconsIcon
                  className="size-3.5"
                  icon={AlertCircleIcon}
                  strokeWidth={2}
                />
              ) : (
                <TimerReset className="size-3.5" />
              )
            }
            label={
              errorCount > 0
                ? socketMessages.errorsMetric
                : socketMessages.latestMetric
            }
            value={errorCount > 0 ? errorCount : getLatestLabel(logs)}
          />
        </div>
      </div>

      {logs.length === 0 ? (
        <div
          className="flex h-[560px] min-w-0 items-center justify-center rounded-lg border border-[#2f2f2f] bg-[#151515] px-6 shadow-inner"
          data-testid="socket-console-empty"
        >
          <div className="w-full max-w-xl rounded-md border border-white/10 bg-black/20 p-5 font-mono text-sm shadow-inner">
            <div className="mb-3 flex items-center gap-2 text-[#d4d4d4]">
              <MousePointerClick className="size-5" />
              <span className="font-semibold">
                {socketMessages.noFramesCapturedTitle}
              </span>
            </div>
            <div className="grid gap-1 text-[#a3a3a3]">
              <p>
                <span className="text-[#60a5fa]">simulator@socket</span>
                <span className="text-[#737373]">:~$</span>{" "}
                <span className="text-[#d4d4d4]">tail -f socket.log</span>
              </p>
              <p className="text-[#b8b8b8]">
                {socketMessages.noFramesCapturedDescription}
              </p>
              <p className="flex items-center gap-1.5 text-[#737373]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-emerald-400/60 opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span>Waiting for frames...</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea
          className="h-[560px] min-w-0 rounded-lg border border-[#2f2f2f] bg-[#151515] shadow-inner"
          ref={scrollAreaRef}
        >
          <div className="w-full min-w-0 p-4 font-mono text-[#e7e7e7] text-[13px] leading-5">
            {logs.map((entry) => (
              <button
                className="group grid w-full min-w-0 grid-cols-[76px_64px_92px_minmax(140px,1fr)] items-start gap-2 rounded px-2 py-1 text-left tabular-nums transition-[background-color,transform] duration-150 ease-out hover:bg-white/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 active:scale-[0.997]"
                key={entry.id}
                onClick={() => onInspect(entry)}
                type="button"
              >
                <span className="text-[#858585]">{entry.timestamp}</span>
                <DirectionBadge direction={entry.direction} />
                <span className="truncate text-[#a3a3a3]">{entry.scope}</span>
                <span className="whitespace-pre-wrap break-all text-[#f5f5f5]">
                  <span className="text-[#6b7280]">{entry.protocol}</span>
                  <span className="px-2 text-[#525252]">/</span>
                  {entry.data}
                </span>
              </button>
            ))}
          </div>
          <ScrollBar className="hidden" orientation="horizontal" />
        </ScrollArea>
      )}
    </section>
  );
}
