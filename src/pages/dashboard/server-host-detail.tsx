import { ComputerTerminal01Icon, PauseIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ChevronLeft, Play, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchServerEntry } from "@/features/server-inventory/api";
import { ServerContainerDetailPanel } from "@/features/server-inventory/components/server-container-detail";
import { ServerContainerGrid } from "@/features/server-inventory/components/server-container-grid";
import { ServerHostCard } from "@/features/server-inventory/components/server-metrics";
import {
  ServerSpec,
  useDockerMissing,
} from "@/features/server-inventory/components/server-spec";
import type { ServerEntry } from "@/features/server-inventory/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";

function HostSections({
  entry,
  paused,
}: {
  entry: ServerEntry;
  paused: boolean;
}) {
  const copy = useI18n().messages.servers.containers;
  const noDocker = useDockerMissing(entry, paused);
  return (
    <>
      <section aria-label={copy.overview}>
        <ServerHostCard detail entry={entry} paused={paused} />
      </section>
      <ServerSpec entry={entry} paused={paused} />
      {!noDocker && (
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-xl tracking-tight">
              {copy.title}
            </h2>
            <p className="text-muted-foreground text-sm">{copy.description}</p>
          </div>
          <ServerContainerGrid entry={entry} paused={paused} />
        </section>
      )}
    </>
  );
}

export function ServerHostDetailPage() {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const { serverId = "", containerId } = useParams();
  const [params, setParams] = useSearchParams();
  const paused = params.get("paused") === "1";
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const query = useQuery({
    queryKey: ["server-inventory", "detail", serverId],
    queryFn: ({ signal }) => fetchServerEntry(serverId, signal),
    retry: false,
    gcTime: 0,
  });
  const entry = query.data;
  const title = containerId
    ? copy.detailTitle
    : (entry?.name ?? copy.hostDetails);
  const hostParams = new URLSearchParams(params);
  hostParams.delete("containerSearch");
  hostParams.delete("includeStopped");
  const back = containerId
    ? `/dashboard/server-metrics/${serverId}${params.size ? `?${params}` : ""}`
    : `/dashboard/server-metrics${hostParams.size ? `?${hostParams}` : ""}`;
  useDocumentMeta({
    title: `${title} | Fleetime Labs`,
    description: copy.hostDetailDescription,
  });
  useEffect(() => {
    titleRef.current?.focus();
  }, [title]);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["server-inventory"] });
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <div className="server-monitor-workspace mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 pb-8">
      <div className="flex flex-col gap-5">
        <div>
          <Button render={<Link to={back} />} size="sm" variant="ghost">
            <ChevronLeft data-icon="inline-start" />
            {containerId ? copy.backToHost : copy.backToHosts}
          </Button>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <h1
              className="break-words font-semibold text-3xl tracking-tight outline-none"
              ref={titleRef}
              tabIndex={-1}
            >
              {title}
            </h1>
            <p className="text-muted-foreground text-sm">
              {entry ? (
                <span className="break-all font-mono">
                  {entry.host}:{entry.port ?? 22}
                </span>
              ) : (
                copy.hostDetailDescription
              )}
            </p>
          </div>
          <ButtonGroup aria-label={messages.servers.actions}>
            {entry?.hasPassword && entry.username && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label={copy.hostTerminal}
                    render={
                      <Link
                        rel="noopener noreferrer"
                        target="_blank"
                        to={`/servers/${entry.id}/terminal`}
                      />
                    }
                    size="sm"
                    variant="outline"
                  >
                    <HugeiconsIcon
                      aria-hidden="true"
                      data-icon="inline-start"
                      icon={ComputerTerminal01Icon}
                    />
                    {copy.hostTerminal}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copy.hostTerminal}</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={
                    paused
                      ? messages.servers.metrics.resume
                      : messages.servers.metrics.pause
                  }
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
                  size="icon-sm"
                  variant="outline"
                >
                  {paused ? (
                    <Play data-icon="inline-start" />
                  ) : (
                    <HugeiconsIcon
                      aria-hidden="true"
                      data-icon="inline-start"
                      icon={PauseIcon}
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {paused
                  ? messages.servers.metrics.resume
                  : messages.servers.metrics.pause}
              </TooltipContent>
            </Tooltip>
            {!containerId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label={messages.servers.refresh}
                    disabled={refreshing}
                    onClick={refresh}
                    size="icon-sm"
                    variant="outline"
                  >
                    {refreshing ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <RefreshCw data-icon="inline-start" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{messages.servers.refresh}</TooltipContent>
              </Tooltip>
            )}
          </ButtonGroup>
        </div>
      </div>
      {query.isPending && <Skeleton className="h-64 w-full" />}
      {query.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {getErrorMessage(query.error)}
            <Button onClick={() => query.refetch()} size="sm" variant="outline">
              {messages.servers.retry}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {entry &&
        (containerId ? (
          <ServerContainerDetailPanel
            containerId={containerId}
            entry={entry}
            key={containerId}
            paused={paused}
          />
        ) : (
          <HostSections entry={entry} paused={paused} />
        ))}
    </div>
  );
}
