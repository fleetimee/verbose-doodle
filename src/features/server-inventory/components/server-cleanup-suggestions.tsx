import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  ChevronRight,
  ClipboardCopy,
  Database,
  Eraser,
  FileClock,
  FileTerminal,
  FileText,
  Gauge,
  type HugeIcon,
  Layers3,
  RefreshCw,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  fetchServerCleanup,
  fetchServerDirectories,
} from "@/features/server-inventory/api";
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
  cleanupCommand,
  cleanupHint,
}: {
  icon: HugeIcon;
  title: string;
  value: string;
  detail?: string;
  command: string;
  cleanupCommand?: string;
  cleanupHint?: string;
}) {
  const { messages } = useI18n();
  const copyCommand = async (value: string) => {
    try {
      if (await copyToClipboard(value)) {
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
        {cleanupHint && (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {cleanupHint}
          </p>
        )}
        {cleanupCommand && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={`${messages.servers.cleanup.copyCleanupCommand}: ${title}`}
                className="mt-1 self-start"
                onClick={() => copyCommand(cleanupCommand)}
                size="sm"
                variant="outline"
              >
                <ClipboardCopy aria-hidden="true" />
                {messages.servers.cleanup.copyCleanupCommand}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <code className="block max-w-sm whitespace-pre-wrap break-all font-mono text-xs">
                {cleanupCommand}
              </code>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={`${messages.servers.cleanup.copyCommand}: ${title}`}
            onClick={() => copyCommand(command)}
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

function FolderBranch({
  directory,
  entryId,
}: {
  directory: { path: string; sizeBytes: number | null };
  entryId: string;
}) {
  const { messages } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger variant="folder">
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-data-[panel-open]:rotate-90 motion-reduce:transition-none"
        />
        <span className="min-w-0 flex-1 break-all font-mono text-xs">
          {directory.path}
        </span>
        <span className="shrink-0 text-sm tabular-nums">
          {directory.sizeBytes === null
            ? messages.servers.cleanup.folderSizeUnknown
            : metricBytes(directory.sizeBytes)}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {open && <FolderChildren entryId={entryId} path={directory.path} />}
      </CollapsibleContent>
    </Collapsible>
  );
}

function FolderChildren({ entryId, path }: { entryId: string; path: string }) {
  const { messages } = useI18n();
  const copy = messages.servers.cleanup;
  const query = useInfiniteQuery({
    queryKey: ["server-inventory", "cleanup-directories", entryId, path],
    queryFn: async ({ signal, pageParam }) => {
      const page = await fetchServerDirectories(
        entryId,
        path,
        signal,
        pageParam
      );
      if (page.status !== "OK") {
        throw new Error(page.status);
      }
      return page;
    },
    initialPageParam: 0,
    getNextPageParam: (page) => page.nextFileOffset ?? undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
    gcTime: 60_000,
  });
  const firstPage = query.data?.pages[0];
  const unavailable =
    (!firstPage && query.isError) || (firstPage && firstPage.status !== "OK");
  const [folderLimit, setFolderLimit] = useState(100);
  const folders = firstPage?.directories ?? [];
  const files = [
    ...new Map(
      query.data?.pages
        .flatMap((page) => page.files ?? [])
        .map((file) => [file.path, file])
    ).values(),
  ];
  return (
    <div className="ml-3 flex min-w-0 flex-col gap-1 border-l pl-3">
      {query.isPending ? (
        <p
          className="flex items-center gap-2 py-2 text-muted-foreground text-xs"
          role="status"
        >
          <Spinner />
          {copy.foldersLoading}
        </p>
      ) : null}
      {!query.isPending && unavailable && (
        <div className="flex flex-col items-start gap-1 py-2">
          <p className="text-muted-foreground text-xs" role="status">
            {copy.foldersUnavailable}
          </p>
          <Button onClick={() => query.refetch()} size="sm" variant="ghost">
            {copy.refresh}
          </Button>
        </div>
      )}
      {!(query.isPending || unavailable) && (
        <>
          {firstPage?.directoryStatus !== "OK" && (
            <p className="py-2 text-muted-foreground text-xs" role="status">
              {copy.foldersPartial}
            </p>
          )}
          {folders.length === 0 && files.length === 0 && (
            <p className="py-2 text-muted-foreground text-xs">
              {copy.foldersEmpty}
            </p>
          )}
          {folders.slice(0, folderLimit).map((directory) => (
            <FolderBranch
              directory={directory}
              entryId={entryId}
              key={directory.path}
            />
          ))}
          {folders.length > folderLimit && (
            <Button
              onClick={() => setFolderLimit((limit) => limit + 100)}
              size="sm"
              variant="ghost"
            >
              {copy.loadMoreFolders}
            </Button>
          )}
          {files.map((file) => (
            <div
              className="flex items-center gap-2 px-1 py-1.5"
              key={file.path}
            >
              <FileText
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
              <span className="min-w-0 flex-1 break-all font-mono text-xs">
                {file.path.slice(path === "/" ? 1 : path.length + 1)}
              </span>
              <span className="shrink-0 text-sm tabular-nums">
                {metricBytes(file.sizeBytes)}
              </span>
            </div>
          ))}
          {query.data?.pages.some((page) => page.fileStatus === "PARTIAL") && (
            <p className="py-1 text-muted-foreground text-xs">
              {copy.filesPartial}
            </p>
          )}
          {query.isFetchNextPageError && (
            <p className="text-muted-foreground text-xs" role="status">
              {copy.foldersUnavailable}
            </p>
          )}
          {query.hasNextPage && (
            <Button
              disabled={query.isFetchingNextPage}
              onClick={() => query.fetchNextPage()}
              size="sm"
              variant="ghost"
            >
              {query.isFetchingNextPage
                ? copy.foldersLoading
                : copy.loadMoreFiles}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

function StorageReport({
  data,
  copy,
  entryId,
}: {
  data: ServerCleanupInspection;
  copy: CleanupCopy;
  entryId: string;
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
  const dockerCleanup = new Map([
    ["Images", { command: "image prune --all", hint: copy.imagesCleanup }],
    [
      "Containers",
      { command: "container prune", hint: copy.containersCleanup },
    ],
    ["Local Volumes", { command: "volume prune", hint: copy.volumesCleanup }],
    [
      "Build Cache",
      { command: "builder prune --all", hint: copy.buildCacheCleanup },
    ],
  ]);
  return (
    <div className="divide-y divide-border/50">
      <ReportRow
        cleanupHint={copy.diskCleanup}
        command="printf 'Scanning root filesystem; large directories may take several minutes...\n'; du -xh --max-depth=1 /"
        detail={hasDisk && used / total >= 0.75 ? copy.pressure : undefined}
        icon={Gauge}
        title={messages.servers.metrics.disk}
        value={diskValue}
      />
      <section aria-label={copy.largestFolders} className="space-y-2 py-3">
        <h3 className="font-medium text-sm">{copy.largestFolders}</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {copy.foldersScope}
        </p>
        {data.directoryStatus !== "OK" && (
          <p
            className="text-muted-foreground text-xs leading-relaxed"
            role="status"
          >
            {data.directoryStatus === "PARTIAL"
              ? copy.foldersPartial
              : copy.foldersUnavailable}
          </p>
        )}
        {(data.directories?.length ?? 0) > 0 ? (
          <div className="flex flex-col gap-1">
            {data.directories?.map((directory) => (
              <FolderBranch
                directory={directory}
                entryId={entryId}
                key={directory.path}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-xs">{copy.foldersEmpty}</p>
        )}
      </section>
      <ReportRow
        cleanupCommand="journalctl --rotate --vacuum-time=14d"
        cleanupHint={copy.journalCleanup}
        command="journalctl --disk-usage"
        detail={copy.journalHint}
        icon={FileClock}
        title={copy.journal}
        value={data.journalUsage ?? copy.missing}
      />
      {data.storage.map((item) => (
        <ReportRow
          cleanupCommand={
            dockerCleanup.has(item.type)
              ? `docker --host unix:///var/run/docker.sock ${dockerCleanup.get(item.type)?.command}`
              : undefined
          }
          cleanupHint={dockerCleanup.get(item.type)?.hint}
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

function CleanupRowSkeleton({ cleanup = false }: { cleanup?: boolean }) {
  return (
    <div className="flex min-w-0 items-start gap-3 py-3">
      <Skeleton className="size-8 shrink-0" variant="table" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-4 w-28" variant="table" />
          <Skeleton className="h-4 w-48 max-w-full" variant="table" />
        </div>
        <Skeleton className="h-3 w-3/4" variant="table" />
        {cleanup && <Skeleton className="mt-1 h-8 w-44" variant="table" />}
      </div>
      <Skeleton className="size-7 shrink-0" variant="table" />
    </div>
  );
}

function CleanupReportSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" role="status">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="divide-y divide-border/50">
        <CleanupRowSkeleton />
        <div className="flex flex-col gap-3 py-3">
          <Skeleton className="h-5 w-40" variant="table" />
          <Skeleton className="h-3 w-3/4" variant="table" />
          <div className="flex flex-col gap-1">
            {["var", "home", "usr", "opt", "data", "etc"].map((key) => (
              <div className="flex items-center gap-2 px-1 py-1.5" key={key}>
                <Skeleton className="size-4 shrink-0" variant="table" />
                <Skeleton className="h-4 w-32" variant="table" />
                <Skeleton className="ml-auto h-4 w-20" variant="table" />
              </div>
            ))}
          </div>
        </div>
        {["journal", "images", "containers", "volumes", "cache"].map((key) => (
          <CleanupRowSkeleton cleanup key={key} />
        ))}
      </div>
    </div>
  );
}

function CleanupReport({ entry }: { entry: ServerEntry }) {
  const queryClient = useQueryClient();
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
      <ScrollArea className="min-h-0 flex-1" viewportClassName="h-full">
        <div className="px-5 py-3">
          {query.isPending && <CleanupReportSkeleton label={copy.loading} />}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {ready && (
            <StorageReport
              copy={copy}
              data={data}
              entryId={entry.id}
              key={query.dataUpdatedAt}
            />
          )}
        </div>
      </ScrollArea>
      <SheetFooter className="shrink-0" variant="bordered">
        <div className="flex flex-col gap-1 text-muted-foreground text-xs leading-relaxed">
          <p>{copy.scope}</p>
          {query.data?.collectedAt && (
            <p>
              {formatMessage(messages.servers.metrics.updated, {
                time: new Date(query.data.collectedAt).toLocaleTimeString(
                  locale
                ),
              })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            disabled={query.isFetching}
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: ["server-inventory", "cleanup-directories", entry.id],
                refetchType: "none",
              });
              query.refetch();
            }}
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
        </div>
        <p className="text-muted-foreground text-xs">{copy.sshHint}</p>
      </SheetFooter>
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
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          disabled={!(entry.hasPassword && entry.username)}
          size="sm"
          variant="outline"
        >
          <Eraser data-icon="inline-start" />
          {copy.button}
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-full sm:max-w-none lg:w-[70vw]"
        side="right"
        size="flush"
      >
        <SheetHeader variant="muted-lg">
          <SheetTitle>
            {copy.title} · {entry.name}
          </SheetTitle>
          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>
        {open && <CleanupReport entry={entry} />}
      </SheetContent>
    </Sheet>
  );
}
