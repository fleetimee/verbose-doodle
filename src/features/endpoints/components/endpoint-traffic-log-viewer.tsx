import {
  ActivityIcon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  DashedLineCircleIcon,
  Delete02Icon,
  DownloadIcon,
  RepeatIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  CircleAlert,
  Clipboard,
  FileClock,
  ListFilter,
  TimerReset,
} from "@/components/hugeicons";
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
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { useAuth } from "@/features/auth/context";
import {
  GlobalTrafficScopeFilters,
  TrafficFilterCombobox,
} from "@/features/endpoints/components/global-traffic-scope-filters";
import { TrafficConsoleMenubar } from "@/features/endpoints/components/traffic-console-menubar";
import { TrafficJsonPreview } from "@/features/endpoints/components/traffic-json-preview";
import { TrafficLogSpreadsheetExport } from "@/features/endpoints/components/traffic-log-spreadsheet-export";
import { TrafficSincePicker } from "@/features/endpoints/components/traffic-since-picker";
import { UserAgentClientBadge } from "@/features/endpoints/components/user-agent-client-badge";
import {
  globalTrafficAdapter,
  httpEndpointAdapter,
} from "@/features/endpoints/data/http-endpoint-adapter";
import { useEndpointTelemetry } from "@/features/endpoints/hooks/use-endpoint-telemetry";
import { useTrafficLogScroll } from "@/features/endpoints/hooks/use-traffic-log-scroll";
import type {
  EndpointHttpHeaders,
  EndpointTrafficLog,
  EndpointTrafficLogDetail,
  EndpointTrafficLogStatus,
  EndpointTrafficLogStatusFilter,
  EndpointTrafficLogsFilters,
  EndpointTrafficPayload,
} from "@/features/endpoints/types";
import { formatJakartaTimestamp } from "@/features/endpoints/utils/endpoint-time";
import { getMethodColor } from "@/features/endpoints/utils/http-method-colors";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, formatPluralMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const CSV_FORMULA_PREFIX = /^[=+@\-\t\r\n]/;
const LOG_LINE_LIMITS = [50, 100, 250, 500, 1000] as const;
const TRAFFIC_LOG_POLL_INTERVAL_MS = 2000;

type EndpointTrafficLogViewerProps = {
  readonly endpointId: string;
  readonly global?: boolean;
  readonly enabled?: boolean;
  readonly hasActiveResponse: boolean;
  readonly responseCount: number;
  readonly tourId?: string;
};

type LogDownloadFormat = "text" | "csv" | "json";
type TerminalTone = "empty" | "error" | "emergency";
type ExchangeTone = "request" | "response";

const STATUS_LABELS: Record<EndpointTrafficLogStatus, string> = {
  backend_error: messages.endpoints.trafficLogStatusLabels.backendError,
  matched_delayed: messages.endpoints.trafficLogStatusLabels.matchedDelayed,
  matched_empty: messages.endpoints.trafficLogStatusLabels.matchedEmpty,
  matched_success: messages.endpoints.trafficLogStatusLabels.matchedSuccess,
  matched_timeout: messages.endpoints.trafficLogStatusLabels.matchedTimeout,
  unmatched_endpoint:
    messages.endpoints.trafficLogStatusLabels.unmatchedEndpoint,
};

const STATUS_CODES: Record<EndpointTrafficLogStatus, string> = {
  matched_success: "SUC",
  backend_error: "ERR",
  matched_delayed: "DLY",
  matched_empty: "EMP",
  matched_timeout: "TMO",
  unmatched_endpoint: "MIS",
};

const STATUS_FILTER_LABELS: Record<EndpointTrafficLogStatusFilter, string> = {
  all: messages.endpoints.trafficLogStatusLabels.all,
  ...STATUS_LABELS,
};

const STATUS_TONE_CLASS_NAMES: Record<EndpointTrafficLogStatus, string> = {
  backend_error: "text-red-700 dark:text-red-300",
  matched_delayed: "text-amber-800 dark:text-amber-200",
  matched_empty: "text-slate-600 dark:text-slate-300",
  matched_success: "text-emerald-700 dark:text-emerald-300",
  matched_timeout: "text-amber-700 dark:text-amber-300",
  unmatched_endpoint: "text-rose-700 dark:text-rose-300",
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
  return formatPluralMessage(messages.endpoints.trafficLogsCount, count);
}

function getLatestDurationLabel(log: EndpointTrafficLog | undefined) {
  if (log?.durationMs === null || log?.durationMs === undefined) {
    return "-";
  }

  return `${log.durationMs} ms`;
}

function formatRequestMetadata(
  log: EndpointTrafficLog,
  showTimestamp: boolean
) {
  return [
    showTimestamp ? formatJakartaTimestamp(log.occurredAt) : null,
    `request_id:${log.requestId || "-"}`,
    `endpoint_id:${log.endpointId ?? "-"}`,
    `biller_id:${log.billerId ?? "-"}`,
    `source_ip:${formatIp(log.sourceIp, log.sourcePort)}`,
    `destination_ip:${formatIp(log.destinationIp, log.destinationPort)}`,
    `path:${log.path}`,
  ]
    .filter(Boolean)
    .join("  ");
}

function formatResponseMetadata(log: EndpointTrafficLog) {
  return [
    `request_id:${log.requestId || "-"}`,
    `hit_status:${log.hitStatus}`,
    `http_status:${log.httpStatusCode ?? "-"}`,
    `response:${log.responseName ?? "-"}`,
    `duration_ms:${log.durationMs ?? "-"}`,
    log.delayMs ? `delay_ms:${log.delayMs}` : null,
    log.simulateTimeout ? "simulate_timeout:true" : null,
  ]
    .filter(Boolean)
    .join("  ");
}

function formatLogLine(log: EndpointTrafficLog, showTimestamp: boolean) {
  const request = `R method:${log.method}  ${formatRequestMetadata(log, showTimestamp)}  request:${log.requestBodyPreview ?? "-"}`;
  const response = `S ${formatResponseMetadata(log)}  response_body:${log.responseBodyPreview ?? "-"}`;
  return `${request}\n${response}`;
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

function isPayloadString(
  value: EndpointTrafficPayload | EndpointHttpHeaders
): value is string {
  return typeof value === "string";
}

function formatJson(
  value: EndpointTrafficPayload | EndpointHttpHeaders | null | undefined
) {
  if (value === null || value === undefined) {
    return "-";
  }
  if (isPayloadString(value)) {
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
    toast.info(messages.endpoints.trafficLogsNoLinesToCopy);
    return;
  }

  try {
    const copied = await copyToClipboard(text);
    if (!copied) {
      toast.error(messages.endpoints.trafficLogsUnableToCopy);
      return;
    }
    toast.success(successMessage);
  } catch {
    toast.error(messages.endpoints.trafficLogsUnableToCopy);
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
  global = false,
  enabled = true,
  hasActiveResponse,
  responseCount,
  tourId,
}: EndpointTrafficLogViewerProps) {
  const { snapshot } = useAuth();
  const controlId = useId();
  const [endpointFilter, setEndpointFilter] = useState("");
  const [billerFilter, setBillerFilter] = useState("");
  const [method, setMethod] = useState("");
  const [since, setSince] = useState("");
  const [cursor, setCursor] = useState<string | undefined>();
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
  const trafficLogViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIds(new Set());
    setSelectedLogId(null);
    setShowClearLogsDialog(false);
  }, [endpointId]);

  useEffect(() => {
    setCursor(undefined);
    setSelectedIds(new Set());
    setSelectedLogId(null);
  }, [endpointFilter, billerFilter, method, since, lineLimit, search, status]);

  const sinceIso = toSinceIso(since);
  const filters = useMemo<EndpointTrafficLogsFilters>(
    () => ({
      endpointId: global ? endpointFilter : undefined,
      billerSlug: global ? billerFilter : undefined,
      method,
      since: sinceIso,
      cursor,
      includeBody: true,
      limit: lineLimit,
      search,
      status,
    }),
    [
      global,
      endpointFilter,
      billerFilter,
      method,
      sinceIso,
      cursor,
      lineLimit,
      search,
      status,
    ]
  );

  const {
    trafficLogs,
    trafficLogDetail,
    clearTrafficLogs: clearTrafficLogsMutation,
  } = useEndpointTelemetry(
    endpointId,
    filters,
    {
      enabled,
      includeMetrics: false,
      refetchInterval: trafficPollInterval(enabled, autoRefresh, cursor),
      selectedLogId,
    },
    global ? globalTrafficAdapter : httpEndpointAdapter
  );
  const {
    data,
    error,
    isFetching,
    isPending,
    refetch: refetchLogs,
  } = trafficLogs;
  const { data: selectedLogDetail, isPending: isLoadingDetail } =
    trafficLogDetail;
  const { mutate: clearTrafficLogs, isPending: isClearingTrafficLogs } =
    clearTrafficLogsMutation;

  const logs = useMemo(
    () =>
      [...(data?.items ?? [])].sort((a, b) => getLogTime(a) - getLogTime(b)),
    [data?.items]
  );
  useTrafficLogScroll(trafficLogViewportRef, logs, autoRefresh);
  const totalLogsLabel = getLogCountLabel(logs.length);
  const selectedLogsLabel = formatMessage(
    messages.endpoints.trafficLogsSelectedCount,
    { count: selectedIds.size }
  );
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
    clearTrafficLogs(endpointId, {
      onSuccess: () => {
        setSelectedIds(new Set());
        setSelectedLogId(null);
        setShowClearLogsDialog(false);
      },
    });
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

    if (global) {
      downloadVisibleTraffic(format, logs, visibleLines);
      return;
    }
    const token = snapshot.accessToken;
    const response = await fetch(
      `${API_ENDPOINTS.admin.endpoints.trafficLogs.download(endpointId)}?${params.toString()}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (!response.ok) {
      toast.error(messages.endpoints.trafficLogsDownloadFailed);
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
      <div className="flex h-[560px] flex-col gap-2 bg-muted/30 p-4 group-data-[global=true]/traffic:h-full">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton
            className="h-5 w-full"
            key={`traffic-log-${index}`}
            variant="terminal"
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
        message={
          global ? messages.endpoints.globalConsole.empty : emptyState.message
        }
        title={emptyState.title}
        tone={emptyState.tone}
      />
    );
  } else {
    logContent = (
      <ScrollArea
        className="h-[560px] w-full max-w-full group-data-[global=true]/traffic:h-full"
        variant="traffic"
        viewportRef={trafficLogViewportRef}
      >
        <div
          className={cn(
            "flex flex-col gap-1 p-4 font-mono text-foreground text-xs leading-4",
            wrapLines ? "w-full" : "min-w-max"
          )}
        >
          {logs.map((log) => (
            <div
              className="group grid min-w-0 grid-cols-[20px_56px_minmax(0,1fr)] items-start gap-2 rounded px-1 py-1 transition-colors duration-150 ease-out hover:bg-muted active:scale-[0.997] dark:hover:bg-white/7"
              key={log.id}
            >
              <Checkbox
                aria-label={formatMessage(
                  messages.endpoints.trafficLogSelectAriaLabel,
                  { requestId: log.requestId }
                )}
                checked={selectedIds.has(log.id)}
                className="mt-0.5"
                onCheckedChange={() => handleToggleSelected(log.id)}
                variant="traffic"
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
                <TrafficLogLine log={log} showTimestamps={showTimestamps} />
              </button>
            </div>
          ))}
        </div>
        {!wrapLines && <ScrollBar orientation="horizontal" />}
      </ScrollArea>
    );
  }

  return (
    <section
      className="group/traffic flex min-w-0 flex-col gap-3 data-[global=true]:min-h-0 data-[global=true]:flex-1 data-[global=true]:overflow-hidden"
      data-global={global}
      id={tourId}
    >
      <div className="flex flex-col gap-4 rounded-2xl border-2 border-border/80 border-b-4 bg-card p-4 shadow-sm group-data-[global=true]/traffic:shrink-0 group-data-[global=true]/traffic:gap-2 group-data-[global=true]/traffic:rounded-none group-data-[global=true]/traffic:border-0 group-data-[global=true]/traffic:bg-transparent group-data-[global=true]/traffic:p-0 group-data-[global=true]/traffic:shadow-none">
        <div className="flex flex-col gap-3 group-data-[global=true]/traffic:flex-row group-data-[global=true]/traffic:items-center lg:flex-row lg:items-start lg:justify-between">
          <div className="group-data-[global=true]/traffic:hidden">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border-2 border-border/80 border-b-2 bg-background text-primary shadow-xs">
                <HugeiconsIcon
                  aria-hidden="true"
                  className="size-5"
                  icon={ActivityIcon}
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h2 className="font-bold text-lg">
                  {global
                    ? messages.endpoints.globalConsole.title
                    : messages.endpoints.trafficLogsTitle}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {global
                    ? messages.endpoints.globalConsole.description
                    : messages.endpoints.trafficLogsDescription}
                </p>
              </div>
            </div>
          </div>
          <div className="hidden flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs group-data-[global=true]/traffic:flex">
            <span className="text-info">
              R · {messages.endpoints.trafficLogRequestTitle}
            </span>
            <span className="text-success">
              S · {messages.endpoints.trafficLogResponseTitle}
            </span>
            <span className="font-mono text-foreground">{totalLogsLabel}</span>
            <span>
              {messages.endpoints.trafficLogsSuccessMetric}: {successRate}
            </span>
            <span>{selectedLogsLabel}</span>
            <span>
              {messages.endpoints.trafficLogsLatestMetric}:{" "}
              {getLatestDurationLabel(latestLog)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden group-data-[global=true]/traffic:block">
              <TrafficConsoleMenubar
                autoRefresh={autoRefresh}
                isPending={isPending}
                logs={logs}
                onAutoRefreshChange={setAutoRefresh}
                onCsvExport={() => handleDownload("csv")}
                onTextExport={() => handleDownload("text")}
                onTimestampsChange={setShowTimestamps}
                onWrapLinesChange={setWrapLines}
                showTimestamps={showTimestamps}
                wrapLines={wrapLines}
              />
            </div>
            <Button
              disabled={isFetching}
              onClick={() => refetchLogs()}
              size="sm"
              type="button"
              variant="panel"
            >
              <HugeiconsIcon
                data-icon="inline-start"
                icon={RepeatIcon}
                strokeWidth={2.5}
              />
              {messages.endpoints.trafficLogsRefreshButton}
            </Button>
          </div>
        </div>

        <div className="grid gap-2 group-data-[global=true]/traffic:hidden sm:grid-cols-4">
          <TrafficMetric
            icon={
              <HugeiconsIcon
                className="size-3.5"
                icon={DashedLineCircleIcon}
                strokeWidth={2}
              />
            }
            label={messages.endpoints.trafficLogsVisibleMetric}
            value={totalLogsLabel}
          />
          <TrafficMetric
            icon={
              <HugeiconsIcon
                className="size-3.5"
                icon={CheckmarkCircle01Icon}
                strokeWidth={2}
              />
            }
            label={messages.endpoints.trafficLogsSuccessMetric}
            value={successRate}
          />
          <TrafficMetric
            icon={<Clipboard className="size-3.5" />}
            label={messages.endpoints.trafficLogsSelectionMetric}
            value={selectedLogsLabel}
          />
          <TrafficMetric
            icon={<TimerReset className="size-3.5" />}
            label={messages.endpoints.trafficLogsLatestMetric}
            value={getLatestDurationLabel(latestLog)}
          />
        </div>

        {global && (
          <div className="grid items-end gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_160px_minmax(0,1.3fr)_210px_auto]">
            <GlobalTrafficScopeFilters
              billerSlug={billerFilter}
              endpointId={endpointFilter}
              method={method}
              onBillerChange={setBillerFilter}
              onEndpointChange={setEndpointFilter}
              onMethodChange={setMethod}
            />
            <TrafficSincePicker onChange={setSince} value={since} />
            <div className="flex items-end gap-2">
              <Button
                onClick={() => {
                  setEndpointFilter("");
                  setBillerFilter("");
                  setMethod("");
                  setSince("");
                  setSearch("");
                  setStatus("all");
                  setLineLimit(100);
                  setCursor(undefined);
                }}
                variant="outline"
              >
                {messages.endpoints.globalConsole.reset}
              </Button>
            </div>
          </div>
        )}
        <div className="grid gap-4 group-data-[global=true]/traffic:gap-2 lg:grid-cols-[280px_1fr] group-data-[global=true]/traffic:lg:grid-cols-1">
          <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3 group-data-[global=true]/traffic:hidden group-data-[global=true]/traffic:rounded-none group-data-[global=true]/traffic:border-0 group-data-[global=true]/traffic:bg-transparent group-data-[global=true]/traffic:p-0">
            <label
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm group-data-[global=true]/traffic:gap-2 group-data-[global=true]/traffic:text-xs"
              htmlFor={`${controlId}-auto-refresh`}
            >
              <HugeiconsIcon
                className="size-4 text-muted-foreground"
                icon={RepeatIcon}
                strokeWidth={2}
              />
              <span className="font-medium">
                {messages.endpoints.trafficLogsAutoRefreshLabel}
              </span>
              <Switch
                checked={autoRefresh}
                id={`${controlId}-auto-refresh`}
                onCheckedChange={setAutoRefresh}
              />
            </label>
            <label
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm group-data-[global=true]/traffic:gap-2 group-data-[global=true]/traffic:text-xs"
              htmlFor={`${controlId}-wrap-lines`}
            >
              <ListFilter className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {messages.endpoints.trafficLogsWrapLinesLabel}
              </span>
              <Switch
                checked={wrapLines}
                id={`${controlId}-wrap-lines`}
                onCheckedChange={setWrapLines}
              />
            </label>
            <label
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm group-data-[global=true]/traffic:gap-2 group-data-[global=true]/traffic:text-xs"
              htmlFor={`${controlId}-timestamps`}
            >
              <FileClock className="size-4 text-muted-foreground" />
              <span className="font-medium">
                {messages.endpoints.trafficLogsDisplayTimestampsLabel}
              </span>
              <Switch
                checked={showTimestamps}
                id={`${controlId}-timestamps`}
                onCheckedChange={setShowTimestamps}
              />
            </label>
          </div>

          <div className="grid gap-3 group-data-[global=true]/traffic:gap-2">
            <div className="grid items-center gap-3 group-data-[global=true]/traffic:gap-2 sm:grid-cols-[280px_1fr] group-data-[global=true]/traffic:sm:grid-cols-[130px_minmax(0,1fr)]">
              <TrafficFilterCombobox
                disabled={false}
                id={`${controlId}-status`}
                label={messages.common.status}
                onChange={(value) => {
                  // SAFETY: Options contain only the supported traffic status keys.
                  setStatus((value || "all") as EndpointTrafficLogStatusFilter);
                }}
                options={Object.entries(STATUS_FILTER_LABELS).map(
                  ([id, label]) => ({ id, label })
                )}
                placeholder={STATUS_FILTER_LABELS.all}
                value={status}
              />

              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon
                    className="text-muted-foreground"
                    icon={SearchIcon}
                    strokeWidth={2}
                  />
                </InputGroupAddon>
                <InputGroupInput
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={messages.endpoints.trafficLogsSearchPlaceholder}
                  value={search}
                />
              </InputGroup>
            </div>

            <div className="grid items-center gap-3 group-data-[global=true]/traffic:gap-2 sm:grid-cols-[180px_1fr] group-data-[global=true]/traffic:sm:grid-cols-[130px_minmax(0,1fr)]">
              <Select
                onValueChange={(value) =>
                  setLineLimit(
                    // SAFETY: The select options are the supported log-line limits.
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
                        {formatMessage(
                          messages.endpoints.trafficLogsLineCount,
                          { count: limit }
                        )}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex flex-wrap gap-2">
                <ButtonGroup
                  aria-label={messages.endpoints.trafficLogsCopyButton}
                >
                  <Button
                    onClick={() =>
                      copyText(
                        visibleLines.join("\n"),
                        messages.endpoints.trafficLogsVisibleCopied
                      )
                    }
                    size="sm"
                    type="button"
                    variant="subtle"
                  >
                    <HugeiconsIcon
                      data-icon="inline-start"
                      icon={Copy01Icon}
                      strokeWidth={2}
                    />
                    {messages.endpoints.trafficLogsCopyButton}
                  </Button>
                  <Button
                    disabled={selectedIds.size === 0}
                    onClick={() =>
                      copyText(
                        selectedLines.join("\n"),
                        messages.endpoints.trafficLogsSelectedCopied
                      )
                    }
                    size="sm"
                    type="button"
                    variant="subtle"
                  >
                    <Clipboard data-icon="inline-start" />
                    {messages.endpoints.trafficLogsCopySelectedButton}
                  </Button>
                  <Button
                    disabled={selectedIds.size === 0}
                    onClick={handleClearSelection}
                    size="sm"
                    type="button"
                    variant="subtle"
                  >
                    <HugeiconsIcon
                      data-icon="inline-start"
                      icon={Cancel01Icon}
                      strokeWidth={2}
                    />
                    {messages.endpoints.trafficLogsUnselectButton}
                  </Button>
                </ButtonGroup>
                <div className="group-data-[global=true]/traffic:hidden">
                  <ButtonGroup
                    aria-label={messages.endpoints.trafficLogsDownloadButton}
                  >
                    <Button
                      onClick={() => handleDownload("text")}
                      size="sm"
                      type="button"
                      variant="subtle"
                    >
                      <HugeiconsIcon
                        data-icon="inline-start"
                        icon={DownloadIcon}
                        strokeWidth={2}
                      />
                      {messages.endpoints.trafficLogsDownloadButton}
                    </Button>
                    <Button
                      onClick={() => handleDownload("csv")}
                      size="sm"
                      type="button"
                      variant="subtle"
                    >
                      {messages.endpoints.trafficLogsCsvButton}
                    </Button>
                    <TrafficLogSpreadsheetExport
                      endpointId={endpointId}
                      isPending={isPending}
                      logs={logs}
                    />
                  </ButtonGroup>
                </div>
                {!global && (
                  <Button
                    disabled={logs.length === 0 || isClearingTrafficLogs}
                    onClick={() => setShowClearLogsDialog(true)}
                    size="sm"
                    type="button"
                    variant="destructive-subtle"
                  >
                    <HugeiconsIcon
                      data-icon="inline-start"
                      icon={Delete02Icon}
                      strokeWidth={2}
                    />
                    {messages.endpoints.trafficLogsClearButton}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-[420px] min-w-0 overflow-hidden rounded-2xl border-2 border-border/80 border-b-4 bg-muted/30 shadow-inner group-data-[global=true]/traffic:min-h-0 group-data-[global=true]/traffic:flex-1 group-data-[global=true]/traffic:rounded-md group-data-[global=true]/traffic:border group-data-[global=true]/traffic:shadow-none">
        {logContent}
      </div>

      {global && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-2">
          <Button
            disabled={!cursor || isFetching}
            onClick={() => setCursor(undefined)}
            variant="outline"
          >
            {messages.endpoints.globalConsole.latest}
          </Button>
          <Button
            disabled={!(data?.hasMore && data.nextCursor) || isFetching}
            onClick={() => {
              setCursor(data?.nextCursor ?? undefined);
              setSelectedIds(new Set());
            }}
            variant="outline"
          >
            {messages.endpoints.globalConsole.older}
          </Button>
        </div>
      )}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLogId(null);
          }
        }}
        open={!!selectedLogId}
      >
        <DialogContent
          className="flex h-[90vh] sm:max-w-[min(1400px,96vw)]"
          showCloseButton={false}
          variant="dark-pane"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {messages.endpoints.trafficLogDetailTitle}
            </DialogTitle>
            <DialogDescription>
              {messages.endpoints.trafficLogDetailDescription}
            </DialogDescription>
          </DialogHeader>
          <TrafficLogDetailContent
            detailError={trafficLogDetail.error}
            isLoadingDetail={isLoadingDetail}
            selectedLogDetail={selectedLogDetail}
            wrapLines={wrapLines}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={setShowClearLogsDialog}
        open={showClearLogsDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {messages.endpoints.trafficLogClearTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {messages.endpoints.trafficLogClearDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearingTrafficLogs}>
              {messages.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isClearingTrafficLogs}
              onClick={handleClearTrafficLogs}
            >
              {messages.endpoints.trafficLogClearConfirmButton}
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
        "inline-flex items-center gap-1.5 font-mono font-semibold text-xs",
        STATUS_TONE_CLASS_NAMES[status]
      )}
      title={STATUS_LABELS[status]}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full motion-safe:animate-pulse",
          STATUS_DOT_CLASS_NAMES[status]
        )}
      />
      <span aria-hidden="true">{STATUS_CODES[status]}</span>
      <span className="sr-only">{STATUS_LABELS[status]}</span>
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
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border-2 border-border/80 border-b-2 bg-card/90 px-3 py-2 shadow-xs">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border-2 border-border/70 border-b-2 bg-muted/60 text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="truncate font-bold font-mono text-sm">{value}</p>
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
  const promptColor = tone === "error" ? "text-destructive" : "text-primary";
  const isEmergency = tone === "emergency";
  const Icon = isEmergency ? CircleAlert : FileClock;

  return (
    <div
      className={cn(
        "flex h-[560px] items-center justify-center bg-muted/30 px-6 group-data-[global=true]/traffic:h-full",
        isEmergency && "bg-destructive/10"
      )}
    >
      <div
        className={cn(
          "w-full max-w-xl rounded-md border border-border bg-background p-5 font-mono text-sm shadow-inner dark:border-white/10 dark:bg-black/20",
          isEmergency && "border-destructive/40 bg-destructive/15"
        )}
      >
        <div
          className={cn(
            "mb-3 flex items-center gap-2 text-foreground",
            isEmergency && "text-destructive"
          )}
        >
          <Icon />
          <span className="font-semibold">{title}</span>
        </div>
        <div className="grid gap-1 text-muted-foreground">
          <p>
            <span className={promptColor}>simulator@traffic</span>
            <span className="text-muted-foreground">:~$</span> tail -f
            endpoint.log
          </p>
          <p className="pl-0 text-muted-foreground">{message}</p>
          {tone === "empty" && (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success/60 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span>{messages.endpoints.trafficLogsWaiting}</span>
              <span className="loading-dots inline-flex gap-0.25">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          )}
          {isEmergency && (
            <p className="text-destructive/80">
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
  meta,
  title,
  tone,
  wrapLines,
}: {
  readonly body: EndpointTrafficPayload;
  readonly headers: EndpointHttpHeaders | null;
  readonly meta: readonly {
    readonly label: string;
    readonly value: string | number;
  }[];
  readonly title: string;
  readonly tone: ExchangeTone;
  readonly wrapLines: boolean;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="border-b px-4 py-3">
        <h4
          className={cn(
            "font-semibold text-sm",
            tone === "request" ? "text-info" : "text-success"
          )}
        >
          {title}
        </h4>
        <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {meta.map((item) => (
            <div className="min-w-0" key={item.label}>
              <dt className="text-muted-foreground text-xs">{item.label}</dt>
              <dd
                className="max-w-64 truncate font-mono text-xs"
                title={String(item.value)}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="divide-y">
          <ShikiJsonBlock
            defaultWrapLines={wrapLines}
            filename={`${title.toLowerCase()}-headers.json`}
            title={messages.endpoints.trafficLogHeadersTitle}
            value={headers}
          />
          <ShikiJsonBlock
            defaultWrapLines={wrapLines}
            filename={`${title.toLowerCase()}-body.json`}
            title={messages.endpoints.trafficLogBodyTitle}
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
  readonly value:
    | EndpointTrafficPayload
    | EndpointHttpHeaders
    | null
    | undefined;
}) {
  const [wrapLines, setWrapLines] = useState(defaultWrapLines);
  const code = formatJson(value);

  return (
    <CodeBlock
      className="h-auto overflow-hidden rounded-none border-0 bg-card"
      data={[{ code, filename, language: "json" }]}
      defaultDarkTheme="github-dark-high-contrast"
      defaultLightTheme="github-light-high-contrast"
      defaultValue="json"
      storageKey={`traffic-log-detail-${filename}`}
    >
      <CodeBlockHeader className="border-border bg-muted/60 px-3 py-2">
        <div className="min-w-0 flex-1">
          <span className="font-medium text-xs">{title}</span>
        </div>
        <CodeBlockCopyButton
          aria-label={`${messages.endpoints.trafficLogsCopyButton} ${title}`}
          size="icon-7"
          variant="ghost-slate"
        />
        <label
          className="ml-2 inline-flex items-center gap-2 text-muted-foreground text-xs"
          htmlFor={`wrap-lines-${filename}`}
        >
          <span>{messages.endpoints.trafficLogWrapLabel}</span>
          <Switch
            checked={wrapLines}
            id={`wrap-lines-${filename}`}
            onCheckedChange={setWrapLines}
          />
        </label>
      </CodeBlockHeader>
      <ScrollArea
        className="max-h-72"
        variant="fit"
        viewportClassName="max-h-72"
      >
        <div className="min-w-0">
          <CodeBlockBody>
            {(item) => (
              <CodeBlockItem
                className={cn(
                  "bg-card text-foreground text-xs [&_.line]:min-h-5 [&_.line]:text-foreground [&_.line]:before:text-muted-foreground [&_.shiki_span]:font-medium",
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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </CodeBlock>
  );
}

function TrafficLogDetailContent({
  selectedLogDetail,
  isLoadingDetail,
  detailError,
  wrapLines,
}: {
  readonly selectedLogDetail?: EndpointTrafficLogDetail;
  readonly isLoadingDetail: boolean;
  readonly detailError: { message: string } | null;
  readonly wrapLines: boolean;
}) {
  let detailContent: ReactNode = null;
  if (isLoadingDetail) {
    detailContent = (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton className="h-6 w-full" key={`log-detail-${index}`} />
        ))}
      </div>
    );
  } else if (detailError) {
    detailContent = (
      <TerminalState
        message={detailError.message}
        title={messages.endpoints.globalConsole.detailError}
        tone="error"
      />
    );
  } else if (selectedLogDetail) {
    const requestMeta = [
      {
        label: messages.endpoints.trafficLogMeta.source,
        value: formatIp(
          selectedLogDetail.sourceIp,
          selectedLogDetail.sourcePort
        ),
      },
      ...(selectedLogDetail.forwardedFor
        ? [
            {
              label: messages.endpoints.trafficLogMeta.forwarded,
              value: selectedLogDetail.forwardedFor,
            },
          ]
        : []),
    ];
    const responseMeta = [
      {
        label: messages.endpoints.trafficLogMeta.response,
        value: selectedLogDetail.responseName ?? "-",
      },
      ...(selectedLogDetail.delayMs
        ? [
            {
              label: messages.endpoints.trafficLogMeta.delay,
              value: `${selectedLogDetail.delayMs} ms`,
            },
          ]
        : []),
    ];

    detailContent = (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="relative flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 pr-16">
          <div className="min-w-0 space-y-1.5">
            <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-semibold text-base">
              <span className={getMethodColor(selectedLogDetail.method).text}>
                {selectedLogDetail.method}
              </span>
              <span className="break-all font-mono">
                {selectedLogDetail.path}
              </span>
              <span
                className={STATUS_TONE_CLASS_NAMES[selectedLogDetail.hitStatus]}
                title={STATUS_LABELS[selectedLogDetail.hitStatus]}
              >
                {selectedLogDetail.httpStatusCode ?? "—"}
              </span>
              <span className="font-normal text-muted-foreground text-sm tabular-nums">
                {selectedLogDetail.durationMs ?? "—"} ms
              </span>
            </h3>
            <p className="break-all text-muted-foreground text-xs">
              {selectedLogDetail.requestId} ·{" "}
              {formatJakartaTimestamp(selectedLogDetail.occurredAt)}
            </p>
            {selectedLogDetail.simulateTimeout && (
              <p className="text-warning text-xs">
                {messages.endpoints.trafficLogTimeoutSimulationLabel}
              </p>
            )}
          </div>
          <div className="flex min-w-0 flex-col items-end gap-1.5">
            <UserAgentClientBadge userAgent={selectedLogDetail.userAgent} />
            <p className="max-w-80 break-all text-right text-muted-foreground text-xs">
              {selectedLogDetail.userAgent ?? "—"}
            </p>
          </div>
          <DialogClose asChild>
            <button
              aria-label={messages.endpoints.trafficLogDetailCloseAriaLabel}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-xs transition-colors hover:bg-accent"
              type="button"
            >
              <HugeiconsIcon
                className="size-4"
                icon={Cancel01Icon}
                strokeWidth={2}
              />
            </button>
          </DialogClose>
        </div>

        <div className="min-h-0 flex-1 px-5 pb-5">
          <ResizablePanelGroup
            className="h-full min-h-0 overflow-hidden"
            direction="horizontal"
          >
            <ResizablePanel defaultSize={50} minSize={28}>
              <LogExchangePane
                body={selectedLogDetail.requestBody}
                headers={selectedLogDetail.requestHeaders}
                meta={requestMeta}
                title={messages.endpoints.trafficLogRequestTitle}
                tone="request"
                wrapLines={wrapLines}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={28}>
              <LogExchangePane
                body={selectedLogDetail.responseBody}
                headers={selectedLogDetail.responseHeaders}
                meta={responseMeta}
                title={messages.endpoints.trafficLogResponseTitle}
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
              title={messages.endpoints.trafficLogErrorTitle}
              value={selectedLogDetail.errorMessage}
            />
          </div>
        )}
      </div>
    );
  }

  return detailContent;
}

function downloadVisibleTraffic(
  format: LogDownloadFormat,
  logs: EndpointTrafficLog[],
  visibleLines: string[]
) {
  const content =
    format === "csv"
      ? [
          [
            "id",
            "requestId",
            "occurredAt",
            "endpointId",
            "billerId",
            "method",
            "path",
            "httpStatusCode",
            "hitStatus",
            "durationMs",
          ],
          ...logs.map((log) => [
            log.id,
            log.requestId,
            log.occurredAt,
            log.endpointId,
            log.billerId,
            log.method,
            log.path,
            log.httpStatusCode,
            log.hitStatus,
            log.durationMs,
          ]),
        ]
          .map((row) => row.map((cell) => `"${csvValue(cell)}"`).join(","))
          .join("\n")
      : visibleLines.join("\n");
  const url = URL.createObjectURL(
    new Blob([content], {
      type:
        format === "csv"
          ? "text/csv;charset=utf-8"
          : "text/plain;charset=utf-8",
    })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `traffic-logs.${format === "csv" ? "csv" : "log"}`;
  link.click();
  URL.revokeObjectURL(url);
}

function toSinceIso(since: string) {
  if (!since) {
    return;
  }
  const date = new Date(since);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function trafficPollInterval(
  enabled: boolean,
  autoRefresh: boolean,
  cursor?: string
) {
  return enabled && autoRefresh && !cursor
    ? TRAFFIC_LOG_POLL_INTERVAL_MS
    : false;
}

function csvValue(cell: string | number | null | undefined) {
  const text = String(cell ?? "");
  const safe = CSV_FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return safe.replaceAll('"', '""');
}

function TrafficLogLine({
  log,
  showTimestamps,
}: {
  readonly log: EndpointTrafficLog;
  readonly showTimestamps: boolean;
}) {
  return (
    <span className="flex flex-col gap-0.5">
      <span>
        <span
          className="font-semibold text-info"
          title={messages.endpoints.trafficLogRequestTitle}
        >
          R
        </span>
        {"  "}
        <span className={getMethodColor(log.method).text}>
          method:{log.method}
        </span>
        {"  "}
        {formatRequestMetadata(log, showTimestamps)}
        <span className="text-info">
          {"  "}request:{log.requestBodyPreview ?? "-"}
        </span>
      </span>
      <span>
        <span
          className="font-semibold text-success"
          title={messages.endpoints.trafficLogResponseTitle}
        >
          S
        </span>
        {"  "}
        {formatResponseMetadata(log)}
        <span className="text-success">
          {"  "}response_body:
          <TrafficJsonPreview value={log.responseBodyPreview} />
        </span>
      </span>
    </span>
  );
}
