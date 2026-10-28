import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  ClipboardCopy,
  Database,
  Eraser,
  FileClock,
  FileTerminal,
  Gauge,
  type HugeIcon,
  Layers3,
  RefreshCw,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchServerCleanup } from "@/features/server-inventory/api";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
import { metricBytes } from "@/features/server-inventory/components/server-metric-values";
import type {
  ServerCleanupInspection,
  ServerEntry,
} from "@/features/server-inventory/types";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage } from "@/lib/i18n";

type CleanupCopy = ReturnType<typeof useI18n>["messages"]["servers"]["cleanup"];

function ReportRow({
  icon: Icon,
  title,
  value,
  detail,
  command,
}: {
  icon: HugeIcon;
  title: string;
  value: string;
  detail?: string;
  command: string;
}) {
  const { messages } = useI18n();
  const copyCommand = async () => {
    try {
      if (await copyToClipboard(command)) {
        toast.success(messages.servers.copied);
      } else {
        toast.error(messages.servers.copyFailed);
      }
    } catch {
      toast.error(messages.servers.copyFailed);
    }
  };
  return (
    <div className="flex min-w-0 items-start gap-3 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-right text-sm tabular-nums">{value}</p>
        </div>
        {detail && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {detail}
          </p>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={`${messages.servers.cleanup.copyCommand}: ${title}`}
            onClick={copyCommand}
            size="icon-sm"
            variant="ghost"
          >
            <ClipboardCopy aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex max-w-sm flex-col gap-1">
            <span>{messages.servers.cleanup.copyCommand}</span>
            <code className="whitespace-pre-wrap break-all font-mono text-xs">
              {command}
            </code>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function StorageReport({
  data,
  copy,
}: {
  data: ServerCleanupInspection;
  copy: CleanupCopy;
}) {
  const { messages } = useI18n();
  const used = data.diskUsedBytes;
  const total = data.diskTotalBytes;
  const hasDisk = used !== null && total !== null && total > 0;
  const diskValue = hasDisk
    ? formatMessage(copy.diskUsage, {
        used: metricBytes(used),
        total: metricBytes(total),
        free: metricBytes(Math.max(0, total - used)),
      })
    : copy.missing;
  const labels = new Map([
    ["Images", copy.images],
    ["Containers", copy.containers],
    ["Local Volumes", copy.volumes],
    ["Build Cache", copy.buildCache],
  ]);
  return (
    <div className="divide-y divide-border/50">
      <ReportRow
        command="du -xhd1 / 2>/dev/null | sort -h"
        detail={hasDisk && used / total >= 0.75 ? copy.pressure : undefined}
        icon={Gauge}
        title={messages.servers.metrics.disk}
        value={diskValue}
      />
      <ReportRow
        command="journalctl --disk-usage"
        detail={copy.journalHint}
        icon={FileClock}
        title={copy.journal}
        value={data.journalUsage ?? copy.missing}
      />
      {data.storage.map((item) => (
        <ReportRow
          command="docker --host unix:///var/run/docker.sock system df --verbose"
          detail={
            item.totalCount !== null && item.activeCount !== null
              ? formatMessage(copy.counts, {
                  active: item.activeCount,
                  total: item.totalCount,
                })
              : undefined
          }
          icon={item.type === "Containers" ? Layers3 : Database}
          key={item.type}
          title={labels.get(item.type) ?? item.type}
          value={
            [
              item.size && formatMessage(copy.used, { size: item.size }),
              item.reclaimable &&
                formatMessage(copy.reclaimable, { size: item.reclaimable }),
            ]
              .filter(Boolean)
              .join(" · ") || copy.missing
          }
        />
      ))}
      {data.dockerStatus !== "OK" && (
        <p className="py-3 text-muted-foreground text-xs leading-relaxed">
          {copy.dockerUnavailable}
        </p>
      )}
    </div>
  );
}

function CleanupReport({ entry }: { entry: ServerEntry }) {
  const { messages, locale } = useI18n();
  const copy = messages.servers.cleanup;
  const query = useQuery({
    queryKey: ["server-inventory", "cleanup", entry.id, entry.updatedAt],
    queryFn: ({ signal }) => fetchServerCleanup(entry.id, signal),
    refetchOnWindowFocus: false,
    retry: false,
    gcTime: 0,
  });
  const data = query.data;
  const collectionError = useContainerError(data?.status, query.error);
  const error =
    data?.status === "COLLECTION_FAILED" ? copy.unavailable : collectionError;
  const ready = data?.status === "OK" && !query.isError;
  return (
    <>
      <ScrollArea className="max-h-[55vh]" viewportClassName="max-h-[55vh]">
        <div className="pr-3">
          {query.isPending && (
            <div className="flex flex-col gap-4 py-3">
              <p className="text-muted-foreground text-xs" role="status">
                {copy.loading}
              </p>
              {["disk", "journal", "docker"].map((id) => (
                <div className="flex items-center gap-3" key={id}>
                  <Skeleton className="size-8 shrink-0" variant="table" />
                  <Skeleton className="h-4 w-3/4" variant="table" />
                </div>
              ))}
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {ready && <StorageReport copy={copy} data={data} />}
        </div>
      </ScrollArea>
      <div className="flex flex-col gap-2 text-muted-foreground text-xs leading-relaxed">
        <p>{copy.scope}</p>
        {query.data?.collectedAt && (
          <p>
            {formatMessage(messages.servers.metrics.updated, {
              time: new Date(query.data.collectedAt).toLocaleTimeString(locale),
            })}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button
          disabled={query.isFetching}
          onClick={() => query.refetch()}
          size="sm"
          variant="outline"
        >
          {query.isFetching ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <RefreshCw data-icon="inline-start" />
          )}
          {copy.refresh}
        </Button>
        <Button
          render={
            <Link
              rel="noopener noreferrer"
              target="_blank"
              to={`/servers/${entry.id}/terminal`}
            />
          }
          size="sm"
        >
          <FileTerminal data-icon="inline-start" />
          {copy.ssh}
        </Button>
      </DialogFooter>
      <p className="text-muted-foreground text-xs">{copy.sshHint}</p>
    </>
  );
}

export function ServerCleanupSuggestions({
  entry,
  hidden,
}: {
  entry?: ServerEntry;
  hidden: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.cleanup;
  const [open, setOpen] = useState(false);
  if (!entry || hidden) {
    return null;
  }
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          disabled={!(entry.hasPassword && entry.username)}
          size="sm"
          variant="outline"
        >
          <Eraser data-icon="inline-start" />
          {copy.button}
        </Button>
      </DialogTrigger>
      <DialogContent size="2xl" variant="pane">
        <div className="flex min-w-0 flex-col gap-4 p-5">
          <DialogHeader>
            <DialogTitle>
              {copy.title} · {entry.name}
            </DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          {open && <CleanupReport entry={entry} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
