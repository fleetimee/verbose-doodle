import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchServerEntry } from "@/features/server-inventory/api";
import { ServerContainerDetailPanel } from "@/features/server-inventory/components/server-container-detail";
import { ServerContainerGrid } from "@/features/server-inventory/components/server-container-grid";
import { ServerHostCard } from "@/features/server-inventory/components/server-metrics";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";

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
          <div className="flex flex-wrap items-center gap-2">
            {entry?.hasPassword && entry.username && (
              <Button
                render={
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    to={`/servers/${entry.id}/terminal`}
                  />
                }
                variant="outline"
              >
                {messages.servers.sshOpenTerminal}
              </Button>
            )}
            <Button
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
              variant="outline"
            >
              {paused
                ? messages.servers.metrics.resume
                : messages.servers.metrics.pause}
            </Button>
            <Button disabled={refreshing} onClick={refresh} variant="outline">
              {messages.servers.refresh}
            </Button>
          </div>
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
          <>
            <section aria-label={copy.overview}>
              <ServerHostCard detail entry={entry} paused={paused} />
            </section>
            <section className="flex min-w-0 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="font-semibold text-xl tracking-tight">
                  {copy.title}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {copy.description}
                </p>
              </div>
              <ServerContainerGrid entry={entry} paused={paused} />
            </section>
          </>
        ))}
    </div>
  );
}
