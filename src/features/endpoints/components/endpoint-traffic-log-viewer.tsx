import {
  Activity,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clipboard,
  Copy,
  Download,
  FileClock,
  ListFilter,
  MonitorDown,
  MonitorUp,
  RefreshCw,
  Search,
  TimerReset,
  Trash2,
  X,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
import { UserAgentClientBadge } from "@/features/endpoints/components/user-agent-client-badge";
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
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LOG_LINE_LIMITS = [50, 100, 250, 500, 1000] as const;

type EndpointTrafficLogViewerProps = {
  readonly endpointId: string;
  readonly hasActiveResponse: boolean;
  readonly responseCount: number;
  readonly tourId?: string;
};

type LogDownloadFormat = "text" | "csv" | "json";
type TerminalTone = "empty" | "error" | "emergency";
type ExchangeTone = "request" | "response";

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

const STATUS_TONE_CLASS_NAMES: Record<EndpointTrafficLogStatus, string> = {
  backend_error: "text-red-300",
  matched_delayed: "text-amber-200",
  matched_empty: "text-slate-300",
  matched_success: "text-emerald-300",
  matched_timeout: "text-amber-300",
  unmatched_endpoint: "text-rose-300",
};

const STATUS_DOT_CLASS_NAMES: Record<EndpointTrafficLogStatus, string> = {
  backend_error: "bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.75)]",
  matched_delayed: "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.65)]",
  matched_empty: "bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.55)]",
  matched_success: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.75)]",
  matched_timeout: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)]",
  unmatched_endpoint: "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.7)]",
};

function getSuccessRate(logs: readonly EndpointTrafficLog[]) {
  if (logs.length === 0) {
    return "0%";
  }

  const successfulLogs = logs.filter(
    (log) =>
      log.hitStatus === "matched_success" || log.hitStatus === "matched_delayed"
  ).length;

  return `${Math.round((successfulLogs / logs.length) * 100)}%`;
}

function getLogCountLabel(count: number) {
  return `${count} ${count === 1 ? "log" : "logs"}`;
}

function getLatestDurationLabel(log: EndpointTrafficLog | undefined) {
  if (log?.durationMs === null || log?.durationMs === undefined) {
    return "-";
  }

  return `${log.durationMs} ms`;
}

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

function getLogTime(log: EndpointTrafficLog): number {
  const time = Date.parse(log.occurredAt);
  return Number.isNaN(time) ? 0 : time;
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

function getEmptyTrafficLogState(
  hasActiveResponse: boolean,
  responseCount: number
) {
  if (hasActiveResponse) {
    return {
      message: messages.endpoints.trafficLogsEmptyDescription,
      title: messages.endpoints.trafficLogsEmptyTitle,
      tone: "empty" as const,
    };
  }

  if (responseCount > 0) {
    return {
      message: messages.endpoints.trafficLogsNoActiveResponseDescription,
      title: messages.endpoints.trafficLogsNoActiveResponseTitle,
      tone: "emergency" as const,
    };
  }

  return {
    message: messages.endpoints.trafficLogsNoResponsesDescription,
    title: messages.endpoints.trafficLogsNoResponsesTitle,
    tone: "emergency" as const,
  };
}

export function EndpointTrafficLogViewer({
  endpointId,
  hasActiveResponse,
  responseCount,
  tourId,
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

  const logs = useMemo(
    () =>
      [...(data?.items ?? [])].sort((a, b) => getLogTime(a) - getLogTime(b)),
    [data?.items]
  );
  const totalLogsLabel = getLogCountLabel(logs.length);
  const selectedLogsLabel = `${selectedIds.size} selected`;
  const successRate = getSuccessRate(logs);
  const latestLog = logs.at(-1);
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
        title={messages.endpoints.trafficLogsLoadErrorTitle}
        tone="error"
      />
    );
  } else if (logs.length === 0) {
    const emptyState = getEmptyTrafficLogState(
      hasActiveResponse,
      responseCount
    );
    logContent = (
      <TerminalState
        message={emptyState.message}
        title={emptyState.title}
        tone={emptyState.tone}
      />
    );
  } else {
    logContent = (
      <ScrollArea className="h-[560px] w-full max-w-full bg-[#151515]">
        <div
          className={cn(
            "p-4 font-mono text-[#e7e7e7] text-[13px] leading-5",
            wrapLines ? "w-full" : "min-w-max"
          )}
        >
          {logs.map((log) => (
            <div
              className="group grid min-w-0 grid-cols-[24px_116px_minmax(0,1fr)] items-start gap-2 rounded px-2 py-1 transition-[background-color,transform] duration-150 ease-out hover:bg-white/7 active:scale-[0.997]"
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
    const requestMeta = [
      { label: "Method", value: selectedLogDetail.method },
      { label: "Path", value: selectedLogDetail.path },
      {
        label: "Source",
        value: formatIp(
          selectedLogDetail.sourceIp,
          selectedLogDetail.sourcePort
        ),
      },
      { label: "Forwarded", value: selectedLogDetail.forwardedFor ?? "-" },
    ];
    const responseMeta = [
      { label: "HTTP", value: selectedLogDetail.httpStatusCode ?? "-" },
      {
        label: "Duration",
        value: `${selectedLogDetail.durationMs ?? "-"} ms`,
      },
      { label: "Response", value: selectedLogDetail.responseName ?? "-" },
      {
        label: "Delay",
        value: selectedLogDetail.delayMs
          ? `${selectedLogDetail.delayMs} ms`
          : "-",
      },
    ];

    detailContent = (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="relative grid gap-3 border-b bg-slate-100 px-5 py-4 text-slate-950 md:grid-cols-[minmax(0,1fr)_auto] dark:border-[#2b2f37] dark:bg-[#10141b] dark:text-slate-100">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-sky-500/15 px-2 py-1 font-mono text-sky-700 text-xs dark:bg-sky-400/15 dark:text-sky-200">
                {selectedLogDetail.method}
              </span>
              <span className="rounded bg-slate-900/8 px-2 py-1 font-mono text-xs dark:bg-white/8">
                {selectedLogDetail.hitStatus}
              </span>
              {selectedLogDetail.simulateTimeout && (
                <span className="rounded bg-amber-500/15 px-2 py-1 font-mono text-amber-700 text-xs dark:bg-amber-400/15 dark:text-amber-200">
                  timeout simulation
                </span>
              )}
            </div>
            <h3 className="truncate font-mono font-semibold text-base">
              {selectedLogDetail.path}
            </h3>
            <p className="truncate text-slate-600 text-xs dark:text-slate-400">
              {selectedLogDetail.requestId} / {selectedLogDetail.occurredAt}
            </p>
          </div>
          <div className="grid min-w-0 gap-2 pr-12 text-right text-xs">
            <span className="font-mono text-slate-500 dark:text-slate-400">
              USER AGENT
            </span>
            <UserAgentClientBadge
              className="justify-self-end"
              userAgent={selectedLogDetail.userAgent}
            />
            <span className="max-w-[420px] truncate text-slate-800 dark:text-slate-200">
              {selectedLogDetail.userAgent ?? "-"}
            </span>
          </div>
          <DialogClose asChild>
            <button
              aria-label="Close traffic log detail"
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-md border border-slate-300 bg-white/80 text-slate-600 shadow-xs transition-colors hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-[#344156] dark:bg-[#0b1020]/80 dark:text-slate-300 dark:hover:bg-[#111827] dark:hover:text-white"
              type="button"
            >
              <X className="size-4" />
            </button>
          </DialogClose>
        </div>

        <div className="min-h-0 flex-1 px-5 pb-5">
          <ResizablePanelGroup
            className="min-h-[620px] overflow-hidden rounded-md border bg-white dark:border-[#2b2f37] dark:bg-[#0d1117]"
            direction="horizontal"
          >
            <ResizablePanel defaultSize={50} minSize={28}>
              <LogExchangePane
                body={selectedLogDetail.requestBody}
                headers={selectedLogDetail.requestHeaders}
                icon={<MonitorUp className="size-4" />}
                meta={requestMeta}
                title="Request"
                tone="request"
                wrapLines={wrapLines}
              />
            </ResizablePanel>
            <ResizableHandle
              className="w-1 bg-slate-300 transition-colors hover:bg-sky-500 dark:bg-[#2b2f37] dark:hover:bg-sky-400"
              withHandle
            />
            <ResizablePanel defaultSize={50} minSize={28}>
              <LogExchangePane
                body={selectedLogDetail.responseBody}
                headers={selectedLogDetail.responseHeaders}
                icon={<MonitorDown className="size-4" />}
                meta={responseMeta}
                title="Response"
                tone="response"
                wrapLines={wrapLines}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {selectedLogDetail.errorMessage && (
          <div className="px-5 pb-5">
            <ShikiJsonBlock
              defaultWrapLines={wrapLines}
              filename="error.txt"
              title="Error"
              value={selectedLogDetail.errorMessage}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="flex min-w-0 flex-col gap-3" id={tourId}>
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
                <Activity aria-hidden="true" className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Traffic logs</h2>
                <p className="text-muted-foreground text-sm">
                  Inspect requests that hit this simulator endpoint.
                </p>
              </div>
            </div>
          </div>
          <Button
            className="transition-transform duration-150 ease-out active:scale-[0.97]"
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

        <div className="grid gap-2 sm:grid-cols-4">
          <TrafficMetric
            icon={<CircleDashed className="size-3.5" />}
            label="Visible"
            value={totalLogsLabel}
          />
          <TrafficMetric
            icon={<CircleCheck className="size-3.5" />}
            label="Success"
            value={successRate}
          />
          <TrafficMetric
            icon={<Clipboard className="size-3.5" />}
            label="Selection"
            value={selectedLogsLabel}
          />
          <TrafficMetric
            icon={<TimerReset className="size-3.5" />}
            label="Latest"
            value={getLatestDurationLabel(latestLog)}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3">
            <label
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm"
              htmlFor="traffic-log-auto-refresh"
            >
              <RefreshCw className="size-4 text-muted-foreground" />
              <span className="font-medium">Auto-refresh logs</span>
              <Switch
                checked={autoRefresh}
                id="traffic-log-auto-refresh"
                onCheckedChange={setAutoRefresh}
              />
            </label>
            <label
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm"
              htmlFor="traffic-log-wrap-lines"
            >
              <ListFilter className="size-4 text-muted-foreground" />
              <span className="font-medium">Wrap lines</span>
              <Switch
                checked={wrapLines}
                id="traffic-log-wrap-lines"
                onCheckedChange={setWrapLines}
              />
            </label>
            <label
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm"
              htmlFor="traffic-log-timestamps"
            >
              <FileClock className="size-4 text-muted-foreground" />
              <span className="font-medium">Display timestamps</span>
              <Switch
                checked={showTimestamps}
                id="traffic-log-timestamps"
                onCheckedChange={setShowTimestamps}
              />
            </label>
          </div>

          <div className="grid gap-3">
            <div className="grid items-center gap-3 sm:grid-cols-[280px_1fr]">
              <Select
                onValueChange={(value) =>
                  setStatus(value as EndpointTrafficLogStatusFilter)
                }
                value={status}
              >
                <SelectTrigger className="w-full">
                  <ListFilter data-icon="inline-start" />
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
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search IP, method, URL, request ID, status, body..."
                  value={search}
                />
              </div>
            </div>

            <div className="grid items-center gap-3 sm:grid-cols-[180px_1fr]">
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
                  className="transition-transform duration-150 ease-out active:scale-[0.97]"
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
                  className="transition-transform duration-150 ease-out active:scale-[0.97]"
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
                  className="transition-transform duration-150 ease-out active:scale-[0.97]"
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
                  className="transition-transform duration-150 ease-out active:scale-[0.97]"
                  onClick={() => handleDownload("text")}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Download data-icon="inline-start" />
                  Download
                </Button>
                <Button
                  className="transition-transform duration-150 ease-out active:scale-[0.97]"
                  onClick={() => handleDownload("csv")}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  CSV
                </Button>
                <Button
                  className="transition-transform duration-150 ease-out active:scale-[0.97]"
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

      <div className="min-h-[420px] min-w-0 overflow-hidden rounded-lg border border-[#2f2f2f] bg-[#151515] shadow-inner">
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
        <DialogContent
          className="flex h-[90vh] flex-col overflow-hidden bg-white p-0 text-slate-950 sm:max-w-[min(1400px,96vw)] dark:border-[#2b2f37] dark:bg-[#0b0f14] dark:text-slate-100"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Traffic log detail</DialogTitle>
            <DialogDescription>
              Request, response, and network metadata for one simulator hit.
            </DialogDescription>
          </DialogHeader>
          {detailContent}
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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold text-xs",
        STATUS_TONE_CLASS_NAMES[status]
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", STATUS_DOT_CLASS_NAMES[status])}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

function TrafficMetric({
  icon,
  label,
  value,
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-3 py-2 shadow-xs">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase">{label}</p>
        <p className="truncate font-mono font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}

function TerminalState({
  message,
  title,
  tone = "empty",
}: {
  readonly message: string;
  readonly title: string;
  readonly tone?: TerminalTone;
}) {
  const promptColor = tone === "error" ? "text-[#fca5a5]" : "text-[#60a5fa]";
  const isEmergency = tone === "emergency";
  const Icon = isEmergency ? CircleAlert : FileClock;

  return (
    <div
      className={cn(
        "flex h-[560px] items-center justify-center bg-[#151515] px-6",
        isEmergency &&
          "bg-[radial-gradient(circle_at_center,#3a1c18_0%,#151515_48%)]"
      )}
    >
      <div
        className={cn(
          "w-full max-w-xl rounded-md border border-white/10 bg-black/20 p-5 font-mono text-sm shadow-inner",
          isEmergency && "border-red-400/35 bg-red-950/15"
        )}
      >
        <div
          className={cn(
            "mb-3 flex items-center gap-2 text-[#d4d4d4]",
            isEmergency && "text-red-200"
          )}
        >
          <Icon />
          <span className="font-semibold">{title}</span>
        </div>
        <div className="grid gap-1 text-[#a3a3a3]">
          <p>
            <span className={promptColor}>simulator@traffic</span>
            <span className="text-[#737373]">:~$</span> tail -f endpoint.log
          </p>
          <p className="pl-0 text-[#b8b8b8]">{message}</p>
          {tone === "empty" && (
            <p className="flex items-center gap-1.5 text-[#737373]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>waiting for incoming requests</span>
              <span className="loading-dots inline-flex gap-[1px]">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          )}
          {isEmergency && (
            <p className="text-red-300/70">
              {messages.endpoints.trafficLogsEmergencyFooter}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LogExchangePane({
  body,
  headers,
  icon,
  meta,
  title,
  tone,
  wrapLines,
}: {
  readonly body: unknown;
  readonly headers: Record<string, unknown> | null;
  readonly icon: ReactNode;
  readonly meta: readonly {
    readonly label: string;
    readonly value: string | number;
  }[];
  readonly title: string;
  readonly tone: ExchangeTone;
  readonly wrapLines: boolean;
}) {
  const accentClass =
    tone === "request"
      ? "border-sky-500/45 bg-sky-500/10 text-sky-700 dark:border-sky-400/45 dark:bg-sky-400/10 dark:text-sky-200"
      : "border-emerald-500/45 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/45 dark:bg-emerald-400/10 dark:text-emerald-200";

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-[#0d1117]">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 dark:border-[#2b2f37]">
        <div className="flex items-center gap-2">
          <span className={cn("rounded border p-1.5", accentClass)}>
            {icon}
          </span>
          <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-slate-600 text-xs dark:text-slate-400">
              Headers and JSON body
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-b bg-slate-200 md:grid-cols-4 dark:border-[#2b2f37] dark:bg-[#2b2f37]">
        {meta.map((item) => (
          <div
            className="min-w-0 bg-slate-50 px-3 py-2 dark:bg-[#111722]"
            key={item.label}
          >
            <p className="font-mono text-[10px] text-slate-500 uppercase dark:text-slate-400">
              {item.label}
            </p>
            <p className="truncate font-mono text-slate-900 text-xs dark:text-slate-100">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-4 p-4">
          <ShikiJsonBlock
            defaultWrapLines={wrapLines}
            filename={`${title.toLowerCase()}-headers.json`}
            title="Headers"
            value={headers}
          />
          <ShikiJsonBlock
            defaultWrapLines={wrapLines}
            filename={`${title.toLowerCase()}-body.json`}
            title="Body"
            value={body}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

function ShikiJsonBlock({
  defaultWrapLines,
  filename,
  title,
  value,
}: {
  readonly defaultWrapLines: boolean;
  readonly filename: string;
  readonly title: string;
  readonly value: unknown;
}) {
  const [wrapLines, setWrapLines] = useState(defaultWrapLines);
  const code = formatJson(value);

  return (
    <CodeBlock
      className="overflow-hidden rounded-md border-slate-300 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] dark:border-[#273244] dark:bg-[#0b1020] dark:shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
      data={[{ code, filename, language: "json" }]}
      defaultDarkTheme="github-dark-high-contrast"
      defaultLightTheme="github-light-high-contrast"
      defaultValue="json"
      storageKey={`traffic-log-detail-${filename}`}
    >
      <CodeBlockHeader className="border-slate-300 bg-slate-100 px-3 py-2 dark:border-[#273244] dark:bg-[#141b2a]">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span className="truncate font-medium text-slate-900 text-xs dark:text-slate-100">
            {title}
          </span>
          <span className="truncate font-mono text-[11px] text-slate-600 dark:text-slate-400">
            {filename}
          </span>
        </div>
        <CodeBlockCopyButton className="size-7 text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white" />
        <label
          className="ml-1 inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-1 font-medium text-[11px] text-slate-700 dark:border-[#344156] dark:bg-[#0b1020] dark:text-slate-200"
          htmlFor={`wrap-lines-${filename}`}
        >
          <span>Wrap</span>
          <Switch
            checked={wrapLines}
            className="scale-75"
            id={`wrap-lines-${filename}`}
            onCheckedChange={setWrapLines}
          />
        </label>
      </CodeBlockHeader>
      <div className="h-80 overflow-y-auto overflow-x-hidden">
        <div className="overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CodeBlockBody>
            {(item) => (
              <CodeBlockItem
                className={cn(
                  "bg-white text-[12px] text-slate-950 dark:bg-[#0b1020] dark:text-slate-100 [&_.line]:min-h-5 [&_.line]:text-slate-950 [&_.line]:before:text-slate-500 dark:[&_.line]:text-slate-100 dark:[&_.line]:before:text-slate-400 [&_.shiki_span]:font-medium",
                  wrapLines
                    ? "[&_code]:!overflow-visible [&_code]:!whitespace-pre-wrap [&_pre]:!whitespace-pre-wrap [&_.line]:!whitespace-pre-wrap [&_.line]:break-all"
                    : "[&_code]:!w-max [&_code]:!overflow-visible [&_code]:!whitespace-pre [&_pre]:!w-max [&_pre]:!whitespace-pre [&_.line]:!w-max [&_.line]:!whitespace-pre [&_.line]:!break-normal [&_.line]:min-w-full [&_code]:min-w-full [&_pre]:min-w-full"
                )}
                key={item.language}
                value={item.language}
              >
                <CodeBlockContent language="json">{item.code}</CodeBlockContent>
              </CodeBlockItem>
            )}
          </CodeBlockBody>
        </div>
      </div>
    </CodeBlock>
  );
}
