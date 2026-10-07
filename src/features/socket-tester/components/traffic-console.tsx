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
  err: "text-destructive",
  in: "text-success",
  out: "text-info",
  sys: "text-muted-foreground",
};

const directionDotStyles: Record<TrafficDirection, string> = {
  err: "bg-destructive",
  in: "bg-success",
  out: "bg-info",
  sys: "bg-muted-foreground",
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
    <span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
      {icon}
      {label}
      <span className="font-mono text-foreground">{value}</span>
    </span>
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
  const [wrapLines, setWrapLines] = useState(false);
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
    <section
      className="flex h-[480px] min-h-0 min-w-0 flex-col gap-4 rounded-lg border border-border/70 bg-card p-4 sm:p-5 lg:h-full"
      id={tourId}
    >
      <div className="flex shrink-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-5 items-center justify-center text-muted-foreground">
              <HugeiconsIcon
                aria-hidden="true"
                className="size-5"
                icon={RecordIcon}
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="font-semibold text-base">
                {socketMessages.trafficConsoleTitle}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label
              className="inline-flex items-center gap-2 text-muted-foreground text-xs"
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
            <label
              className="inline-flex items-center gap-2 text-muted-foreground text-xs"
              htmlFor="socket-traffic-wrap"
            >
              <span>{socketMessages.wrapLabel}</span>
              <Switch
                checked={wrapLines}
                id="socket-traffic-wrap"
                onCheckedChange={setWrapLines}
              />
            </label>
            <Button
              disabled={logs.length === 0}
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
              disabled={logs.length === 0}
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

        <div className="flex flex-wrap gap-3">
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
          className="flex min-h-0 min-w-0 flex-1 items-center justify-center rounded-lg border border-border/80 bg-muted/30 px-4"
          data-testid="socket-console-empty"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <MousePointerClick className="size-5 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              {socketMessages.noFramesCapturedTitle}
            </p>
            <p className="max-w-64 text-muted-foreground text-xs leading-relaxed">
              {socketMessages.noFramesCapturedDescription}
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea
          className="min-h-0 min-w-0 flex-1"
          ref={scrollAreaRef}
          variant="traffic"
        >
          <div
            className={cn(
              "w-full p-4 font-mono text-foreground text-xs leading-5",
              wrapLines ? "min-w-0" : "min-w-max"
            )}
          >
            {logs.map((entry) => (
              <button
                className={cn(
                  "group grid w-full grid-cols-[76px_64px_92px_minmax(140px,1fr)] items-start gap-2 rounded px-2 py-1 text-left tabular-nums transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 active:scale-[0.997]",
                  wrapLines ? "min-w-0" : "min-w-max"
                )}
                key={entry.id}
                onClick={() => onInspect(entry)}
                type="button"
              >
                <span className="text-muted-foreground">{entry.timestamp}</span>
                <DirectionBadge direction={entry.direction} />
                <span className="truncate text-muted-foreground">
                  {entry.scope}
                </span>
                <span
                  className={cn(
                    "text-foreground",
                    wrapLines
                      ? "whitespace-pre-wrap break-all"
                      : "whitespace-pre"
                  )}
                >
                  <span className="text-muted-foreground">
                    {entry.protocol}
                  </span>
                  <span className="px-2 text-muted-foreground">/</span>
                  {entry.data}
                </span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </section>
  );
}
