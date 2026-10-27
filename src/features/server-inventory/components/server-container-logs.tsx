import {
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
import { useContainerLogs } from "@/features/server-inventory/hooks/use-container-logs";

export function ServerContainerLogs({
  serverId,
  containerId,
  paused,
}: {
  serverId: string;
  containerId: string;
  paused: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const [streaming, setStreaming] = useState(true);
  const [follow, setFollow] = useState(true);
  const logs = useContainerLogs(serverId, containerId, streaming && !paused);
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (follow && viewport.current && logs.output) {
      viewport.current.scrollTop = viewport.current.scrollHeight;
    }
  }, [follow, logs.output]);
  const errors = new Map([
    ["HOST_KEY_REQUIRED", messages.servers.metrics.hostKeyRequired],
    ["HOST_KEY_REJECTED", messages.servers.sshHostKeyRejected],
    ["AUTH_FAILED", messages.servers.sshAuthFailed],
    ["CONNECTION_FAILED", messages.servers.sshConnectionFailed],
    ["CONTAINER_LOGS_FAILED", copy.logsFailed],
    ["CAPACITY_EXCEEDED", messages.servers.metrics.busy],
    ["INVALID_ENTRY", copy.logsFailed],
  ]);
  let status = copy.logsIdle;
  if (streaming) {
    status = errors.get(logs.status) ?? copy.logsEnded;
    if (paused || !logs.visible) {
      status = messages.servers.metrics.paused;
    } else if (logs.status === "connecting") {
      status = copy.logsConnecting;
    } else if (logs.status === "live") {
      status = copy.logsLive;
    }
  }
  return (
    <Card size="monitor" variant="monitor">
      <CardHeader size="none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle size="sm">{copy.logsTitle}</CardTitle>
          <div className="max-w-full overflow-x-auto">
            <ButtonGroup aria-label={messages.servers.actions}>
              <Button
                aria-pressed={follow}
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
              <Button onClick={logs.clear} size="sm" variant="outline">
                <HugeiconsIcon
                  aria-hidden="true"
                  data-icon="inline-start"
                  icon={Delete02Icon}
                  strokeWidth={2}
                />
                {copy.logsClear}
              </Button>
              <Button
                disabled={paused}
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
        <div className="flex flex-col gap-3">
          <p aria-live="polite" className="text-muted-foreground text-xs">
            {status}
          </p>
          <ScrollArea
            className="h-80 w-full min-w-0 max-w-full"
            variant="traffic"
            viewportRef={viewport}
          >
            <pre className="min-w-max whitespace-pre break-normal p-4 font-mono text-foreground text-xs leading-4">
              {logs.output || (streaming ? status : copy.logsIdle)}
            </pre>
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
