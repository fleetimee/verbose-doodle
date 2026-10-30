import {
  ComputerTerminal01Icon,
  Delete02Icon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useContainerLogs } from "@/features/server-inventory/hooks/use-container-logs";
import { cn } from "@/lib/utils";

function resolveLogsStatus(
  streaming: boolean,
  loading: boolean,
  paused: boolean,
  visible: boolean,
  logStatus: string,
  messages: ReturnType<typeof useI18n>["messages"]
) {
  const copy = messages.servers.containers;
  if (!streaming) {
    return copy.logsIdle;
  }
  if (loading) {
    return copy.logsConnecting;
  }
  if (paused || !visible) {
    return messages.servers.metrics.paused;
  }
  if (logStatus === "connecting") {
    return copy.logsConnecting;
  }
  if (logStatus === "live") {
    return copy.logsLive;
  }
  const errors = new Map([
    ["HOST_KEY_REQUIRED", messages.servers.metrics.hostKeyRequired],
    ["HOST_KEY_REJECTED", messages.servers.sshHostKeyRejected],
    ["AUTH_FAILED", messages.servers.sshAuthFailed],
    ["CONNECTION_FAILED", messages.servers.sshConnectionFailed],
    ["CONTAINER_LOGS_FAILED", copy.logsFailed],
    ["CAPACITY_EXCEEDED", messages.servers.metrics.busy],
    ["INVALID_ENTRY", copy.logsFailed],
  ]);
  return errors.get(logStatus) ?? copy.logsEnded;
}

export function ServerContainerLogs({
  serverId,
  containerId,
  paused,
  loading = false,
}: {
  serverId: string;
  containerId: string;
  paused: boolean;
  loading?: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const [streaming, setStreaming] = useState(true);
  const [follow, setFollow] = useState(true);
  const logs = useContainerLogs(
    serverId,
    containerId,
    streaming && !paused && !loading
  );
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (follow && viewport.current && logs.output) {
      viewport.current.scrollTop = viewport.current.scrollHeight;
    }
  }, [follow, logs.output]);
  const status = resolveLogsStatus(
    streaming,
    loading,
    paused,
    logs.visible,
    logs.status,
    messages
  );
  const isLive = streaming && !loading && !paused && logs.status === "live";
  return (
    <Card size="monitor" variant="monitor">
      <CardHeader size="none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CardTitle size="sm" variant="inline">
              <HugeiconsIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
                icon={ComputerTerminal01Icon}
                strokeWidth={2}
              />
              {copy.logsTitle}
            </CardTitle>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 rounded-full",
                  isLive ? "bg-success" : "bg-muted-foreground/50"
                )}
              />
              {status}
            </span>
          </div>
          <div className="max-w-full overflow-x-auto">
            <ButtonGroup aria-label={messages.servers.actions}>
              <Button
                aria-pressed={follow}
                className="h-7"
                onClick={() => setFollow(!follow)}
                size="sm"
                variant={follow ? "secondary" : "outline"}
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  data-icon="inline-start"
                  icon={RepeatIcon}
                  strokeWidth={2}
                />
                {copy.logsFollow}
              </Button>
              <Button
                className="h-7"
                onClick={logs.clear}
                size="sm"
                variant="outline"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  data-icon="inline-start"
                  icon={Delete02Icon}
                  strokeWidth={2}
                />
                {copy.logsClear}
              </Button>
              <Button
                className="h-7"
                disabled={paused || loading}
                onClick={() => setStreaming(!streaming)}
                size="sm"
                variant="outline"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  data-icon="inline-start"
                  icon={streaming ? PauseIcon : PlayIcon}
                  strokeWidth={2}
                />
                {streaming ? copy.logsPause : copy.logsStart}
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent size="none">
        <div className="flex flex-col gap-2.5">
          <p aria-live="polite" className="sr-only">
            {status}
          </p>
          <ScrollArea
            className="h-80 w-full min-w-0 max-w-full"
            variant="panel"
            viewportRef={viewport}
          >
            {loading && !logs.output ? (
              <div aria-hidden="true" className="flex flex-col gap-2.5 p-4">
                {[
                  "w-4/5",
                  "w-2/3",
                  "w-11/12",
                  "w-3/4",
                  "w-5/6",
                  "w-1/2",
                  "w-3/5",
                ].map((width) => (
                  <div className="flex items-center gap-3" key={width}>
                    <Skeleton className="h-3.5 w-32 shrink-0" variant="table" />
                    <div className={width}>
                      <Skeleton className="h-3.5 w-full" variant="table" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="min-w-max whitespace-pre break-normal p-4 font-mono text-foreground text-xs leading-5">
                {logs.output || (streaming ? status : copy.logsIdle)}
              </pre>
            )}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {copy.logsHint}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
