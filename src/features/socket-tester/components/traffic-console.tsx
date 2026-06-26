import { Download, Eraser, MousePointerClick } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type {
  TrafficDirection,
  TrafficLogEntry,
} from "@/features/socket-tester/types";
import { cn } from "@/lib/utils";

type TrafficConsoleProps = {
  readonly logs: readonly TrafficLogEntry[];
  readonly onClear: () => void;
  readonly onInspect: (entry: TrafficLogEntry) => void;
};

const directionStyles: Record<TrafficDirection, string> = {
  err: "text-red-300",
  in: "text-emerald-300",
  out: "text-amber-300",
  sys: "text-sky-300",
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

export function TrafficConsole({
  logs,
  onClear,
  onInspect,
}: TrafficConsoleProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!autoScroll) {
      return;
    }

    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [autoScroll, logs.length]);

  return (
    <section className="grid min-h-[440px] overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
      <header className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <div className="mr-auto">
          <h2 className="font-semibold text-sm">Traffic console</h2>
          <p className="text-[11px] text-muted-foreground">
            Click any frame to inspect bytes and metadata.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
          Auto
          <Switch
            aria-label="Toggle traffic console auto scroll"
            checked={autoScroll}
            onCheckedChange={setAutoScroll}
          />
        </div>
        <Button
          className="h-8 gap-2"
          onClick={() => exportLogs(logs)}
          size="sm"
          type="button"
          variant="outline"
        >
          <Download className="size-3.5" />
          Save
        </Button>
        <Button
          className="h-8 gap-2"
          onClick={onClear}
          size="sm"
          type="button"
          variant="outline"
        >
          <Eraser className="size-3.5" />
          Clear
        </Button>
      </header>
      <div
        className="min-h-0 overflow-auto bg-background/70 p-3"
        ref={viewportRef}
      >
        {logs.length === 0 ? (
          <div className="grid min-h-[320px] place-items-center text-center">
            <div>
              <MousePointerClick className="mx-auto mb-3 size-8 text-muted-foreground/50" />
              <p className="font-mono text-muted-foreground text-sm">
                No frames captured
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                Connect the bridge, start a socket, then send traffic.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-1">
            {logs.map((entry) => (
              <button
                className="grid grid-cols-[76px_54px_minmax(88px,140px)_1fr] gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs transition-[background-color,transform] duration-150 ease-out hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 active:scale-[0.997]"
                key={entry.id}
                onClick={() => onInspect(entry)}
                type="button"
              >
                <span className="text-muted-foreground">{entry.timestamp}</span>
                <span
                  className={cn(
                    "font-semibold",
                    directionStyles[entry.direction]
                  )}
                >
                  {directionLabels[entry.direction]}
                </span>
                <span className="truncate text-muted-foreground">
                  {entry.scope}
                </span>
                <span className="break-all text-foreground">{entry.data}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
