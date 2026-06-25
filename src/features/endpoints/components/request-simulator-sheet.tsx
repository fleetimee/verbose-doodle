import {
  Braces,
  CheckCircle2,
  Clock3,
  FileJson,
  Gauge,
  Inbox,
  LoaderCircle,
  Play,
  RotateCcw,
  Route,
  Server,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { JsonEditor } from "@/features/endpoints/components/json-editor";
import type { EndpointResponse, HttpMethod } from "@/features/endpoints/types";
import { formatMessage, formatPluralMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type RequestSimulatorSheetProps = {
  readonly baseUrl: string;
  readonly endpointUrl: string;
  readonly method: HttpMethod;
  readonly open: boolean;
  readonly response: EndpointResponse;
  readonly token?: string;
  readonly onOpenChange: (open: boolean) => void;
};

type SimulatorResult = {
  readonly body: string;
  readonly durationMs: number;
  readonly error?: string;
  readonly headers: Record<string, string>;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
};

type PreparedRequest = {
  readonly body?: string;
  readonly headers: Record<string, string>;
};

const METHODS_WITH_BODY: readonly HttpMethod[] = ["POST", "PUT", "PATCH"];
const DEFAULT_HEADERS = JSON.stringify(
  { "Content-Type": "application/json" },
  null,
  2
);
const REQUEST_TIMEOUT_MS = 30_000;
const SUCCESS_STATUS_THRESHOLD = 300;
const FETCH_FAILURE_STATUS = 0;
const BYTES_PER_KILOBYTE = 1024;
const METHOD_TONE_CLASS_NAMES: Record<HttpMethod, string> = {
  DELETE:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300",
  GET: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300",
  PATCH:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300",
  POST: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-300",
  PUT: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/30 dark:text-violet-300",
};

const getSimulatorUrl = (endpointUrl: string): string => {
  const normalizedPath = endpointUrl.startsWith("/")
    ? endpointUrl
    : `/${endpointUrl}`;

  return `/simulate${normalizedPath}`;
};

const formatJson = (value: string): string => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const formatByteSize = (value: string): string => {
  const bytes = new TextEncoder().encode(value).length;

  if (bytes < BYTES_PER_KILOBYTE) {
    return `${bytes} B`;
  }

  return `${(bytes / BYTES_PER_KILOBYTE).toFixed(1)} KB`;
};

const SIMULATOR_MESSAGES = messages.endpoints.requestSimulator;

const getContentTypeLabel = (headers: Record<string, string>): string =>
  headers["content-type"]?.split(";")[0] ??
  SIMULATOR_MESSAGES.unknownContentType;

const getStatusTone = (result: SimulatorResult): string =>
  result.ok
    ? SIMULATOR_MESSAGES.matchedStatus
    : SIMULATOR_MESSAGES.attentionStatus;

const getStatusIcon = (result: SimulatorResult) =>
  result.ok ? (
    <CheckCircle2 data-icon="inline-start" />
  ) : (
    <TriangleAlert data-icon="inline-start" />
  );

const formatHeaders = (headers: Headers): Record<string, string> => {
  const formattedHeaders: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    formattedHeaders[key] = value;
  }

  return formattedHeaders;
};

const parseHeaders = (value: string): Record<string, string> => {
  const parsed = JSON.parse(value) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(SIMULATOR_MESSAGES.headersMustBeObjectError);
  }

  const headers: Record<string, string> = {};

  for (const [key, headerValue] of Object.entries(parsed)) {
    if (typeof headerValue !== "string") {
      throw new Error(SIMULATOR_MESSAGES.headerValuesMustBeStringsError);
    }

    headers[key] = headerValue;
  }

  return headers;
};

const prepareRequest = ({
  bodyJson,
  canSendBody,
  headersJson,
  token,
}: {
  readonly bodyJson: string;
  readonly canSendBody: boolean;
  readonly headersJson: string;
  readonly token?: string;
}): PreparedRequest => {
  const headers = parseHeaders(headersJson);
  const body = canSendBody ? JSON.stringify(JSON.parse(bodyJson)) : undefined;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return { body, headers };
};

const createFailureResult = ({
  durationMs,
  error,
  statusText,
}: {
  readonly durationMs: number;
  readonly error: string;
  readonly statusText: string;
}): SimulatorResult => ({
  body: "",
  durationMs,
  error,
  headers: {},
  ok: false,
  status: FETCH_FAILURE_STATUS,
  statusText,
});

const showRequestResultToast = ({
  durationMs,
  ok,
  status,
  statusText,
}: {
  readonly durationMs: number;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
}) => {
  const description = formatMessage(SIMULATOR_MESSAGES.toastDescription, {
    durationMs,
    status,
    statusText:
      statusText ||
      (ok
        ? SIMULATOR_MESSAGES.okFallback
        : SIMULATOR_MESSAGES.httpErrorFallback),
  });

  if (ok) {
    toast.success(SIMULATOR_MESSAGES.requestSucceededToast, { description });
    return;
  }

  toast.error(SIMULATOR_MESSAGES.requestReturnedErrorToast, { description });
};

export function RequestSimulatorSheet({
  baseUrl,
  endpointUrl,
  method,
  open,
  response,
  token,
  onOpenChange,
}: RequestSimulatorSheetProps) {
  const [headersJson, setHeadersJson] = useState(DEFAULT_HEADERS);
  const [bodyJson, setBodyJson] = useState(formatJson(response.json));
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fullUrl = `${baseUrl}${endpointUrl}`;
  const simulatorUrl = getSimulatorUrl(endpointUrl);
  const canSendBody = METHODS_WITH_BODY.includes(method);

  const responseBody = useMemo(() => {
    if (!result) {
      return "";
    }

    if (!result.body) {
      return "";
    }

    return formatJson(result.body);
  }, [result]);
  const responseSize = result ? formatByteSize(result.body) : "0 B";
  const responseContentType = result
    ? getContentTypeLabel(result.headers)
    : SIMULATOR_MESSAGES.unknownContentType;
  const responseHeaderCount = result ? Object.keys(result.headers).length : 0;
  const responseHeaderCountLabel = formatPluralMessage(
    SIMULATOR_MESSAGES.headerCount,
    responseHeaderCount
  );
  const responseHeadersReturnedLabel = formatPluralMessage(
    SIMULATOR_MESSAGES.headersReturned,
    responseHeaderCount
  );
  const responseHeadersJson = result
    ? JSON.stringify(result.headers, null, 2)
    : "{}";

  useEffect(() => {
    setBodyJson(formatJson(response.json));
    setBodyError(null);
    setResult(null);
  }, [response.id, response.json]);

  const resetRequest = () => {
    setHeadersJson(DEFAULT_HEADERS);
    setBodyJson(formatJson(response.json));
    setHeaderError(null);
    setBodyError(null);
    setResult(null);
  };

  const sendRequest = async () => {
    setHeaderError(null);
    setBodyError(null);
    setResult(null);

    let preparedRequest: PreparedRequest;
    try {
      preparedRequest = prepareRequest({
        bodyJson,
        canSendBody,
        headersJson,
        token,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : SIMULATOR_MESSAGES.requestValidJsonError;
      if (message.toLowerCase().includes("header")) {
        setHeaderError(message);
      } else {
        setBodyError(message);
      }
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );
    const startedAt = performance.now();

    setIsSending(true);

    try {
      const requestResult = await fetch(simulatorUrl, {
        body: preparedRequest.body,
        headers: preparedRequest.headers,
        method,
        signal: controller.signal,
      });
      const responseBody = await requestResult.text();
      const durationMs = Math.round(performance.now() - startedAt);

      setResult({
        body: responseBody,
        durationMs,
        headers: formatHeaders(requestResult.headers),
        ok: requestResult.ok,
        status: requestResult.status,
        statusText: requestResult.statusText,
      });

      showRequestResultToast({
        durationMs,
        ok: requestResult.ok,
        status: requestResult.status,
        statusText: requestResult.statusText,
      });
    } catch (error) {
      const durationMs = Math.round(performance.now() - startedAt);

      if (error instanceof DOMException && error.name === "AbortError") {
        setResult(
          createFailureResult({
            durationMs,
            error: SIMULATOR_MESSAGES.requestTimedOutError,
            statusText: SIMULATOR_MESSAGES.timeoutStatus,
          })
        );
        toast.error(SIMULATOR_MESSAGES.requestTimedOutToast);
      } else {
        const message =
          error instanceof Error
            ? error.message
            : SIMULATOR_MESSAGES.browserRequestFailed;

        setResult(
          createFailureResult({
            durationMs,
            error: `${message}. ${SIMULATOR_MESSAGES.networkFailureHelp}`,
            statusText: SIMULATOR_MESSAGES.fetchFailedStatus,
          })
        );
        toast.error(SIMULATOR_MESSAGES.requestFailedToast);
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full gap-0 overflow-hidden bg-background p-0 sm:max-w-6xl">
        <SheetHeader className="border-b bg-muted/20 px-5 py-4">
          <div className="flex flex-wrap items-start gap-3 pr-8">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-background text-primary shadow-xs">
              <Gauge aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    "rounded-md border px-2.5 py-1 font-mono font-semibold",
                    METHOD_TONE_CLASS_NAMES[method]
                  )}
                  variant="outline"
                >
                  {method}
                </Badge>
                <SheetTitle className="text-lg">
                  {SIMULATOR_MESSAGES.requestSimulatorTitle}
                </SheetTitle>
              </div>
              <SheetDescription className="break-all font-mono text-xs">
                {fullUrl}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <ScrollArea className="h-full min-h-0 border-b bg-muted/10 lg:border-r lg:border-b-0">
            <div className="flex min-h-0 flex-col gap-4 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                    <Route aria-hidden="true" className="size-4" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="font-medium text-sm">
                      {SIMULATOR_MESSAGES.requestLabel}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {SIMULATOR_MESSAGES.configureRequestDescription}
                    </p>
                  </div>
                </div>
                <Badge
                  className="max-w-[45%] rounded-md px-2.5 py-1 font-mono text-[11px]"
                  variant="secondary"
                >
                  <span className="truncate">{simulatorUrl}</span>
                </Badge>
              </div>

              <FieldGroup className="gap-5">
                <Field data-invalid={headerError ? true : undefined}>
                  <FieldLabel className="gap-2" htmlFor="request-headers">
                    <ShieldCheck className="size-3.5 text-muted-foreground" />
                    {SIMULATOR_MESSAGES.headersLabel}
                  </FieldLabel>
                  <JsonEditor
                    aria-invalid={headerError ? true : undefined}
                    className="min-h-0"
                    height="180px"
                    id="request-headers"
                    onChange={setHeadersJson}
                    placeholder={SIMULATOR_MESSAGES.headersPlaceholder}
                    value={headersJson}
                  />
                  <FieldDescription>
                    {SIMULATOR_MESSAGES.tokenAppliedDescription}
                  </FieldDescription>
                  <FieldError>{headerError}</FieldError>
                </Field>

                {canSendBody && (
                  <Field
                    className="min-h-0 flex-1"
                    data-invalid={bodyError ? true : undefined}
                  >
                    <FieldLabel className="gap-2" htmlFor="request-body">
                      <Braces className="size-3.5 text-muted-foreground" />
                      {SIMULATOR_MESSAGES.bodyLabel}
                    </FieldLabel>
                    <JsonEditor
                      aria-invalid={bodyError ? true : undefined}
                      className="min-h-0 flex-1"
                      height="320px"
                      id="request-body"
                      onChange={setBodyJson}
                      placeholder={SIMULATOR_MESSAGES.bodyPlaceholder}
                      value={bodyJson}
                    />
                    <FieldDescription>
                      {formatMessage(SIMULATOR_MESSAGES.sentAsJsonDescription, {
                        method,
                      })}
                    </FieldDescription>
                    <FieldError>{bodyError}</FieldError>
                  </Field>
                )}
              </FieldGroup>
            </div>
          </ScrollArea>

          <div className="flex min-h-0 flex-col gap-4 overflow-hidden p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                  <Server aria-hidden="true" className="size-4" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-sm">
                    {SIMULATOR_MESSAGES.responseLabel}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {SIMULATOR_MESSAGES.responsePlaceholderDescription}
                  </p>
                </div>
              </div>
            </div>

            {result ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
                <div className="flex flex-wrap gap-2 rounded-md border bg-muted/25 p-2">
                  <Badge
                    className="h-9 min-w-0 justify-start gap-1.5 rounded-md px-2.5 py-1 font-mono"
                    variant={
                      result.status < SUCCESS_STATUS_THRESHOLD
                        ? "default"
                        : "destructive"
                    }
                  >
                    {getStatusIcon(result)}
                    <span className="text-[10px] uppercase opacity-75">
                      {getStatusTone(result)}
                    </span>
                    <span className="truncate">
                      {result.status} {result.statusText}
                    </span>
                  </Badge>
                  <Badge
                    className="h-9 min-w-0 justify-start gap-1.5 rounded-md px-2.5 py-1 font-mono"
                    variant="secondary"
                  >
                    <Clock3 data-icon="inline-start" />
                    {result.durationMs} ms
                  </Badge>
                  <Badge
                    className="h-9 min-w-0 justify-start gap-1.5 rounded-md px-2.5 py-1 font-mono"
                    variant="outline"
                  >
                    <FileJson data-icon="inline-start" />
                    {responseSize}
                  </Badge>
                  <Badge
                    className="h-9 min-w-0 max-w-full justify-start gap-1.5 rounded-md px-2.5 py-1 font-mono sm:max-w-52"
                    variant="outline"
                  >
                    <Server data-icon="inline-start" />
                    <span className="min-w-0 truncate">
                      {responseContentType}
                    </span>
                  </Badge>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge
                        className="h-9 min-w-0 cursor-default justify-start gap-1.5 rounded-md px-2.5 py-1 font-mono"
                        variant="outline"
                      >
                        <ShieldCheck data-icon="inline-start" />
                        {responseHeaderCountLabel}
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent align="end" className="w-96 p-0">
                      <div className="border-b px-3 py-2">
                        <p className="font-medium text-sm">
                          {SIMULATOR_MESSAGES.responseHeadersTitle}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {responseHeadersReturnedLabel}
                        </p>
                      </div>
                      <ScrollArea className="max-h-72">
                        <pre className="p-3 font-mono text-xs leading-relaxed">
                          {responseHeadersJson}
                        </pre>
                      </ScrollArea>
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border bg-muted/30 shadow-xs">
                  <CodeBlock
                    className="flex min-h-0 flex-1 flex-col"
                    data={[
                      {
                        code: responseBody,
                        filename: SIMULATOR_MESSAGES.responseBodyFilename,
                        language: "json",
                      },
                    ]}
                    defaultValue="json"
                  >
                    <CodeBlockHeader>
                      <span className="flex items-center gap-2 px-3 py-1 text-muted-foreground text-xs">
                        <FileJson aria-hidden="true" className="size-3.5" />
                        {SIMULATOR_MESSAGES.responseBodyFilename}
                      </span>
                    </CodeBlockHeader>
                    <CodeBlockBody className="min-h-0 flex-1">
                      {(item) => (
                        <ScrollArea
                          className="h-full min-h-0"
                          key={item.filename}
                        >
                          <CodeBlockItem
                            className="min-h-full"
                            value={item.language}
                          >
                            <CodeBlockContent
                              className="[&_.line]:max-w-full [&_.line]:break-all [&_code]:max-w-full [&_code]:whitespace-pre-wrap [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap"
                              language="json"
                            >
                              {item.code}
                            </CodeBlockContent>
                          </CodeBlockItem>
                        </ScrollArea>
                      )}
                    </CodeBlockBody>
                  </CodeBlock>
                </div>
              </div>
            ) : (
              <div className="flex min-h-72 flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 p-6 text-center shadow-inner">
                <div className="rounded-md border bg-background p-3 text-muted-foreground shadow-xs">
                  <Inbox data-icon="inline-start" />
                </div>
                <div className="flex max-w-sm flex-col gap-1">
                  <p className="font-medium text-sm">
                    {SIMULATOR_MESSAGES.emptyResponseTitle}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {SIMULATOR_MESSAGES.emptyResponseDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="border-t bg-muted/20">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              className="transition-transform duration-150 ease-out active:scale-[0.97]"
              onClick={resetRequest}
              type="button"
              variant="outline"
            >
              <RotateCcw data-icon="inline-start" />
              {SIMULATOR_MESSAGES.resetButton}
            </Button>
            <Button
              className="transition-transform duration-150 ease-out active:scale-[0.97]"
              disabled={isSending}
              onClick={sendRequest}
              type="button"
            >
              {isSending ? (
                <LoaderCircle
                  className="animate-spin"
                  data-icon="inline-start"
                />
              ) : (
                <Play data-icon="inline-start" />
              )}
              {isSending
                ? SIMULATOR_MESSAGES.sendingButton
                : SIMULATOR_MESSAGES.sendButton}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
