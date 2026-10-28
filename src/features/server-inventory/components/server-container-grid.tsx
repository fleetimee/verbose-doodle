import { useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { useSearchParams } from "react-router";
import { RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchServerContainers } from "@/features/server-inventory/api";
import {
  ServerContainerCard,
  ServerContainerCardSkeleton,
} from "@/features/server-inventory/components/server-container-card";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
import type { ServerEntry } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";

export function ServerContainerGrid({
  entry,
  paused,
}: {
  entry: ServerEntry;
  paused: boolean;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.containers;
  const [params, setParams] = useSearchParams();
  const includeStopped = params.get("includeStopped") === "1";
  const search = params.get("containerSearch") ?? "";
  const switchId = useId();
  const eligible = Boolean(entry.hasPassword && entry.username);
  const query = useQuery({
    queryKey: ["server-inventory", "containers", entry.id, entry.updatedAt],
    queryFn: ({ signal }) => fetchServerContainers(entry.id, signal),
    enabled: eligible && !paused,
    refetchInterval: paused ? false : 5000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 0,
  });
  const data = query.data;
  const ready = data?.status === "OK" && !query.isError;
  const error = useContainerError(data?.status, query.error);
  const containers = data?.containers ?? [];
  const running = containers.filter((item) => item.state === "running").length;
  const term = search.trim().toLowerCase();
  const visible = containers.filter((item) =>
    `${item.name} ${item.image} ${item.id} ${item.ports}`
      .toLowerCase()
      .includes(term)
  );
  const groups = [
    {
      label: copy.states.running,
      items: visible.filter((item) => item.state === "running"),
    },
    {
      label: copy.otherStates,
      items: includeStopped
        ? visible.filter((item) => item.state !== "running")
        : [],
    },
  ];
  const hasMatches = groups.some((group) => group.items.length > 0);
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="server-monitor-toolbar sticky top-16 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-background/90 p-3 backdrop-blur-xl">
        <Input
          aria-label={copy.search}
          className="min-w-40 flex-1"
          onChange={(event) =>
            setParams(
              (current) => {
                const next = new URLSearchParams(current);
                next.set("containerSearch", event.target.value);
                return next;
              },
              { replace: true }
            )
          }
          placeholder={copy.search}
          type="search"
          value={search}
        />
        <div className="flex items-center gap-2">
          <Switch
            checked={includeStopped}
            id={switchId}
            onCheckedChange={(checked) =>
              setParams(
                (current) => {
                  const next = new URLSearchParams(current);
                  if (checked) {
                    next.set("includeStopped", "1");
                  } else {
                    next.delete("includeStopped");
                  }
                  return next;
                },
                { replace: true }
              )
            }
          />
          <Label htmlFor={switchId} size="sm">
            {copy.includeStopped}
          </Label>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={copy.refresh}
              disabled={!eligible || query.isFetching}
              onClick={() => query.refetch()}
              size="icon-sm"
              variant="outline"
            >
              {query.isFetching ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCw data-icon="inline-start" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copy.refresh}</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <div
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-xs"
        >
          <span>
            {ready
              ? formatMessage(copy.count, { running, total: containers.length })
              : copy.description}
          </span>
          <span>
            {paused ? messages.servers.metrics.paused : copy.autoRefresh}
          </span>
        </div>
        {!eligible && (
          <p className="text-muted-foreground text-sm">
            {copy.credentialsRequired}
          </p>
        )}
        {eligible && query.isPending && !paused && (
          <div className="flex flex-col gap-3">
            <p className="sr-only" role="status">
              {copy.loading}
            </p>
            <Skeleton aria-hidden="true" className="h-5 w-24" variant="table" />
            <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                "container-1",
                "container-2",
                "container-3",
                "container-4",
                "container-5",
                "container-6",
              ].map((id) => (
                <ServerContainerCardSkeleton key={id} />
              ))}
            </div>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {ready && !data.statsAvailable && (
          <Alert>
            <AlertDescription>{copy.statsUnavailable}</AlertDescription>
          </Alert>
        )}
        {ready && !hasMatches && (
          <Empty variant="bordered">
            <EmptyHeader>
              <EmptyTitle>{copy.empty}</EmptyTitle>
              <EmptyDescription>{copy.emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {ready &&
          groups.map(
            (group) =>
              group.items.length > 0 && (
                <section className="flex flex-col gap-3" key={group.label}>
                  <h2 className="font-medium text-sm">
                    {group.label}{" "}
                    <span className="font-mono text-muted-foreground">
                      {group.items.length}
                    </span>
                  </h2>
                  <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((item) => (
                      <ServerContainerCard
                        item={item}
                        key={item.id}
                        to={`/dashboard/server-metrics/${entry.id}/containers/${item.id}${params.size ? `?${params}` : ""}`}
                      />
                    ))}
                  </div>
                </section>
              )
          )}
        {ready && data.collectedAt && (
          <p className="text-muted-foreground text-xs">
            {formatMessage(messages.servers.metrics.updated, {
              time: new Date(data.collectedAt).toLocaleTimeString(locale),
            })}
          </p>
        )}
        <p className="text-muted-foreground text-xs leading-relaxed">
          {copy.scope}
        </p>
      </div>
    </div>
  );
}
