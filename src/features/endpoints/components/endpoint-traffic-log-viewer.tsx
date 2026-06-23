import {
  Clipboard,
  Copy,
  Download,
  FileClock,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { getAuthToken } from "@/features/auth/utils";
import { useClearEndpointTrafficLogs } from "@/features/endpoints/hooks/use-clear-endpoint-traffic-logs";
import { useGetEndpointTrafficLogDetail } from "@/features/endpoints/hooks/use-get-endpoint-traffic-log-detail";
import { useGetEndpointTrafficLogs } from "@/features/endpoints/hooks/use-get-endpoint-traffic-logs";
import type {
  EndpointTrafficLog,
  EndpointTrafficLogStatus,
  EndpointTrafficLogStatusFilter,
  EndpointTrafficLogsFilters,
} from "@/features/endpoints/types";
import { getEndpointTrafficLogsDownloadUrl } from "@/lib/api-endpoints";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

const LOG_LINE_LIMITS = [50, 100, 250, 500, 1000] as const;

type EndpointTrafficLogViewerProps = {
  readonly endpointId: string;
};

type LogDownloadFormat = "text" | "csv" | "json";

const STATUS_LABELS: Record<EndpointTrafficLogStatus, string> = {
  matched_success: "Success",
  matched_empty: "Empty",
  matched_timeout: "Timeout",
  matched_delayed: "Delayed",
  unmatched_endpoint: "Unmatched",
  backend_error: "Error",
};

const STATUS_FILTER_LABELS: Record<EndpointTrafficLogStatusFilter, string> = {
  all: "All logs",
  ...STATUS_LABELS,
};

function formatLogLine(log: EndpointTrafficLog, showTimestamp: boolean) {
  const parts = [
    showTimestamp ? log.occurredAt : null,
    `request_id:${log.requestId || "-"}`,
    `source_ip:${formatIp(log.sourceIp, log.sourcePort)}`,
    `destination_ip:${formatIp(log.destinationIp, log.destinationPort)}`,
    `method:${log.method}`,
    `path:${log.path}`,
    `hit_status:${log.hitStatus}`,
    `http_status:${log.httpStatusCode ?? "-"}`,
    `response:${log.responseName ?? "-"}`,
    `duration_ms:${log.durationMs ?? "-"}`,
    log.delayMs ? `delay_ms:${log.delayMs}` : null,
    log.simulateTimeout ? "simulate_timeout:true" : null,
    log.requestBodyPreview ? `request:${log.requestBodyPreview}` : null,
    log.responseBodyPreview ? `response_body:${log.responseBodyPreview}` : null,
  ];

  return parts.filter(Boolean).join("  ");
}

function formatIp(ip: string | null, port: number | null) {
  if (!ip) {
    return "-";
  }
  return port ? `${ip}:${port}` : ip;
}

function formatJson(value: unknown) {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

async function copyText(text: string, successMessage: string) {
  if (!text.trim()) {
    toast.info("No log lines to copy");
    return;
  }

  try {
    const copied = await copyToClipboard(text);
    if (!copied) {
      toast.error("Unable to copy logs");
      return;
    }
    toast.success(successMessage);
  } catch {
    toast.error("Unable to copy logs");
  }
}

export function EndpointTrafficLogViewer({
  endpointId,
}: EndpointTrafficLogViewerProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [wrapLines, setWrapLines] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [status, setStatus] = useState<EndpointTrafficLogStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [lineLimit, setLineLimit] =
    useState<(typeof LOG_LINE_LIMITS)[number]>(100);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [showClearLogsDialog, setShowClearLogsDialog] = useState(false);

  const filters = useMemo<EndpointTrafficLogsFilters>(
    () => ({
      limit: lineLimit,
      status,
      search,
      includeBody: true,
    }),
    [lineLimit, search, status]
  );

  const {
    data,
    error,
    isFetching,
    isPending,
    refetch: refetchLogs,
  } = useGetEndpointTrafficLogs(endpointId, filters, autoRefresh);
  const { data: selectedLogDetail, isPending: isLoadingDetail } =
    useGetEndpointTrafficLogDetail(endpointId, selectedLogId);
  const { mutate: clearTrafficLogs, isPending: isClearingTrafficLogs } =
    useClearEndpointTrafficLogs();

  const logs = data?.items ?? [];
  const visibleLines = useMemo(
    () => logs.map((log) => formatLogLine(log, showTimestamps)),
    [logs, showTimestamps]
  );
  const selectedLines = useMemo(
    () =>
      logs
        .filter((log) => selectedIds.has(log.id))
        .map((log) => formatLogLine(log, showTimestamps)),
    [logs, selectedIds, showTimestamps]
  );

  const handleToggleSelected = (logId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleClearTrafficLogs = () => {
    clearTrafficLogs(
      { endpointId },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
          setSelectedLogId(null);
          setShowClearLogsDialog(false);
        },
      }
    );
  };

  const handleDownload = async (format: LogDownloadFormat) => {
    const params = new URLSearchParams();
    params.set("limit", lineLimit.toString());
    params.set("format", format);
    if (status !== "all") {
      params.set("status", status);
    }
    if (search.trim()) {
      params.set("search", search.trim());
    }

    const token = getAuthToken();
    const response = await fetch(
      `${getEndpointTrafficLogsDownloadUrl(endpointId)}?${params.toString()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      toast.error("Failed to download logs");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `endpoint-${endpointId}-traffic-logs.${format === "text" ? "log" : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  let logContent: ReactNode = null;
  if (isPending) {
    logContent = (
      <div className="flex h-[560px] flex-col gap-2 bg-[#151515] p-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton
            className="h-5 w-full bg-white/10"
            key={`traffic-log-${index}`}
          />
        ))}
      </div>
    );
  } else if (error) {
    logContent = (
      <TerminalState
        message={error.message}
        title="Failed to load traffic logs"
        tone="error"
      />
    );
  } else if (logs.length === 0) {
    logContent = (
      <TerminalState
        message="Send a request to this simulator endpoint to see it here."
        title="No traffic logs yet"
      />
    );
  } else {
    logContent = (
      <ScrollArea className="h-[560px] bg-[#151515]">
        <div
          className={cn(
            "p-4 font-mono text-[#e7e7e7] text-[13px] leading-5",
            wrapLines ? "w-full" : "min-w-max"
          )}
        >
          {logs.map((log) => (
            <div
              className="group grid min-w-0 grid-cols-[24px_88px_minmax(0,1fr)] items-start gap-2 px-2 py-0.5 transition-colors hover:bg-white/7"
              key={log.id}
            >
              <Checkbox
                aria-label={`Select traffic log ${log.requestId}`}
                checked={selectedIds.has(log.id)}
                className="mt-0.5 border-[#5b5b5b] bg-[#1f1f1f] data-[state=checked]:border-[#60a5fa] data-[state=checked]:bg-[#2563eb]"
                onCheckedChange={() => handleToggleSelected(log.id)}
              />
              <button
                className="text-left"
                onClick={() => setSelectedLogId(log.id)}
                type="button"
              >
                <TerminalStatus status={log.hitStatus} />
              </button>
              <button
                className={cn(
                  "min-w-0 text-left tabular-nums",
                  wrapLines ? "whitespace-pre-wrap break-all" : "whitespace-pre"
                )}
                onClick={() => setSelectedLogId(log.id)}
                type="button"
              >
                {formatLogLine(log, showTimestamps)}
              </button>
            </div>
          ))}
        </div>
        {!wrapLines && <ScrollBar orientation="horizontal" />}
      </ScrollArea>
    );
  }

  let detailContent: ReactNode = null;
  if (isLoadingDetail) {
    detailContent = (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton className="h-6 w-full" key={`log-detail-${index}`} />
        ))}
      </div>
    );
  } else if (selectedLogDetail) {
    detailContent = (
      <div className="grid gap-4">
        <div className="grid gap-2 rounded-md border p-3 md:grid-cols-2">
          <DetailItem label="Request ID" value={selectedLogDetail.requestId} />
          <DetailItem
            label="Occurred at"
            value={selectedLogDetail.occurredAt}
          />
          <DetailItem
            label="Source"
            value={formatIp(
              selectedLogDetail.sourceIp,
              selectedLogDetail.sourcePort
            )}
          />
          <DetailItem
            label="Destination"
            value={formatIp(
              selectedLogDetail.destinationIp,
              selectedLogDetail.destinationPort
            )}
          />
          <DetailItem label="Method" value={selectedLogDetail.method} />
          <DetailItem label="Path" value={selectedLogDetail.path} />
          <DetailItem label="Status" value={selectedLogDetail.hitStatus} />
          <DetailItem
            label="HTTP status"
            value={selectedLogDetail.httpStatusCode ?? "-"}
          />
          <DetailItem
            label="Response"
            value={selectedLogDetail.responseName ?? "-"}
          />
          <DetailItem
            label="Duration"
            value={`${selectedLogDetail.durationMs ?? "-"} ms`}
          />
          <DetailItem
            label="Forwarded for"
            value={selectedLogDetail.forwardedFor ?? "-"}
          />
          <DetailItem
            label="User agent"
            value={selectedLogDetail.userAgent ?? "-"}
          />
        </div>

        <LogDetailCode
          title="Request headers"
          value={selectedLogDetail.requestHeaders}
        />
        <LogDetailCode
          title="Request body"
          value={selectedLogDetail.requestBody}
        />
        <LogDetailCode
          title="Response headers"
          value={selectedLogDetail.responseHeaders}
        />
        <LogDetailCode
          title="Response body"
          value={selectedLogDetail.responseBody}
        />
        {selectedLogDetail.errorMessage && (
          <LogDetailCode title="Error" value={selectedLogDetail.errorMessage} />
        )}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-semibold text-lg">Traffic logs</h2>
            <p className="text-muted-foreground text-sm">
              Inspect requests that hit this simulator endpoint.
            </p>
          </div>
          <Button
            disabled={isFetching}
            onClick={() => refetchLogs()}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCw data-icon="inline-start" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-3">
            <label
              className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm"
              htmlFor="traffic-log-auto-refresh"
            >
              <span className="font-medium">Auto-refresh logs</span>
              <Switch
                checked={autoRefresh}
                id="traffic-log-auto-refresh"
                onCheckedChange={setAutoRefresh}
              />
            </label>
            <label
              className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm"
              htmlFor="traffic-log-wrap-lines"
            >
              <span className="font-medium">Wrap lines</span>
              <Switch
                checked={wrapLines}
                id="traffic-log-wrap-lines"
                onCheckedChange={setWrapLines}
              />
            </label>
            <label
              className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm"
              htmlFor="traffic-log-timestamps"
            >
              <span className="font-medium">Display timestamps</span>
              <Switch
                checked={showTimestamps}
                id="traffic-log-timestamps"
                onCheckedChange={setShowTimestamps}
              />
            </label>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[280px_1fr]">
              <Select
                onValueChange={(value) =>
                  setStatus(value as EndpointTrafficLogStatusFilter)
                }
                value={status}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(STATUS_FILTER_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search IP, method, URL, request ID, status, body..."
                  value={search}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
              <Select
                onValueChange={(value) =>
                  setLineLimit(
                    Number(value) as (typeof LOG_LINE_LIMITS)[number]
                  )
                }
                value={lineLimit.toString()}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {LOG_LINE_LIMITS.map((limit) => (
                      <SelectItem key={limit} value={limit.toString()}>
                        {limit} lines
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    copyText(visibleLines.join("\n"), "Visible logs copied")
                  }
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <Copy data-icon="inline-start" />
                  Copy
                </Button>
                <Button
                  disabled={selectedIds.size === 0}
                  onClick={() =>
                    copyText(selectedLines.join("\n"), "Selected logs copied")
                  }
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <Clipboard data-icon="inline-start" />
                  Copy selected
                </Button>
                <Button
                  disabled={selectedIds.size === 0}
                  onClick={handleClearSelection}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <X data-icon="inline-start" />
                  Unselect
                </Button>
                <Button
                  onClick={() => handleDownload("text")}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Download data-icon="inline-start" />
                  Download
                </Button>
                <Button
                  onClick={() => handleDownload("csv")}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  CSV
                </Button>
                <Button
                  disabled={logs.length === 0 || isClearingTrafficLogs}
                  onClick={() => setShowClearLogsDialog(true)}
                  size="sm"
                  type="button"
                  variant="destructive"
                >
                  <Trash2 data-icon="inline-start" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[420px] overflow-hidden rounded-lg border border-[#2f2f2f] bg-[#151515] shadow-inner">
        {logContent}
      </div>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLogId(null);
          }
        }}
        open={!!selectedLogId}
      >
        <DialogContent className="flex h-[88vh] flex-col overflow-hidden sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Traffic log detail</DialogTitle>
            <DialogDescription>
              Request, response, and network metadata for one simulator hit.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="min-h-0 flex-1 pr-4">
            {detailContent}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={setShowClearLogsDialog}
        open={showClearLogsDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear traffic logs?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all stored traffic logs for this endpoint. Download a
              copy first if you need to keep them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearingTrafficLogs}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isClearingTrafficLogs}
              onClick={handleClearTrafficLogs}
            >
              Clear logs
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function TerminalStatus({
  status,
}: {
  readonly status: EndpointTrafficLogStatus;
}) {
  let className = "text-[#d4d4d4]";
  if (status === "backend_error") {
    className = "text-[#fca5a5]";
  }
  if (status === "matched_timeout") {
    className = "text-[#fbbf24]";
  }

  return (
    <span className={cn("font-semibold text-xs", className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function TerminalState({
  message,
  title,
  tone = "empty",
}: {
  readonly message: string;
  readonly title: string;
  readonly tone?: "empty" | "error";
}) {
  const promptColor = tone === "error" ? "text-[#fca5a5]" : "text-[#60a5fa]";

  return (
    <div className="flex h-[560px] items-center justify-center bg-[#151515] px-6">
      <div className="w-full max-w-xl rounded-md border border-white/10 bg-black/20 p-5 font-mono text-sm shadow-inner">
        <div className="mb-3 flex items-center gap-2 text-[#d4d4d4]">
          <FileClock />
          <span className="font-semibold">{title}</span>
        </div>
        <div className="grid gap-1 text-[#a3a3a3]">
          <p>
            <span className={promptColor}>simulator@traffic</span>
            <span className="text-[#737373]">:~$</span> tail -f endpoint.log
          </p>
          <p className="pl-0 text-[#b8b8b8]">{message}</p>
          {tone === "empty" && (
            <p className="text-[#737373]">waiting for incoming requests...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string | number;
}) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="truncate font-mono text-sm">{value}</p>
    </div>
  );
}

function LogDetailCode({
  title,
  value,
}: {
  readonly title: string;
  readonly value: unknown;
}) {
  return (
    <div className="rounded-md border">
      <div className="border-b px-3 py-2 font-medium text-sm">{title}</div>
      <ScrollArea className="h-72">
        <pre className="p-3 text-sm">
          <code>{formatJson(value)}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
