import { Inbox, Play, RotateCcw } from "lucide-react";
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

const getContentTypeLabel = (headers: Record<string, string>): string =>
  headers["content-type"]?.split(";")[0] ?? "unknown";

const getStatusTone = (result: SimulatorResult): string =>
  result.ok ? "Matched" : "Attention";

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
    throw new Error("Headers must be a JSON object.");
  }

  const headers: Record<string, string> = {};

  for (const [key, headerValue] of Object.entries(parsed)) {
    if (typeof headerValue !== "string") {
      throw new Error("Header values must be strings.");
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
  const description = `${status} ${statusText || (ok ? "OK" : "HTTP error")} in ${durationMs} ms`;

  if (ok) {
    toast.success("Request succeeded", { description });
    return;
  }

  toast.error("Request returned an error", { description });
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
    : "unknown";
  const responseHeaderCount = result ? Object.keys(result.headers).length : 0;
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
        error instanceof Error ? error.message : "Request must be valid JSON.";
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
            error: "Request timed out.",
            statusText: "Timeout",
          })
        );
        toast.error("Request timed out");
      } else {
        const message =
          error instanceof Error ? error.message : "Browser request failed.";

        setResult(
          createFailureResult({
            durationMs,
            error: `${message}. If this keeps happening, check that the dev server/proxy is running and that the backend is reachable.`,
            statusText: "Fetch failed",
          })
        );
        toast.error("Request failed");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <SheetHeader className="border-b">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <Badge className="font-mono" variant="outline">
              {method}
            </Badge>
            <SheetTitle>Request Simulator</SheetTitle>
          </div>
          <SheetDescription className="break-all font-mono">
            {fullUrl}
          </SheetDescription>
        </SheetHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto border-b p-4 lg:border-r lg:border-b-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="font-medium text-sm">Request</h3>
                <p className="text-muted-foreground text-xs">
                  Configure headers and JSON payload.
                </p>
              </div>
              <Badge variant="secondary">{simulatorUrl}</Badge>
            </div>

            <FieldGroup className="gap-5">
              <Field data-invalid={headerError ? true : undefined}>
                <FieldLabel htmlFor="request-headers">Headers</FieldLabel>
                <JsonEditor
                  aria-invalid={headerError ? true : undefined}
                  className="min-h-0"
                  height="180px"
                  id="request-headers"
                  onChange={setHeadersJson}
                  placeholder='{
  "Content-Type": "application/json"
}'
                  value={headersJson}
                />
                <FieldDescription>
                  Environment token is applied automatically when available.
                </FieldDescription>
                <FieldError>{headerError}</FieldError>
              </Field>

              {canSendBody && (
                <Field
                  className="min-h-0 flex-1"
                  data-invalid={bodyError ? true : undefined}
                >
                  <FieldLabel htmlFor="request-body">Body</FieldLabel>
                  <JsonEditor
                    aria-invalid={bodyError ? true : undefined}
                    className="min-h-0 flex-1"
                    height="320px"
                    id="request-body"
                    onChange={setBodyJson}
                    placeholder='{
  "customerId": "12345",
  "amount": 10000
}'
                    value={bodyJson}
                  />
                  <FieldDescription>
                    Sent as JSON for {method} requests.
                  </FieldDescription>
                  <FieldError>{bodyError}</FieldError>
                </Field>
              )}
            </FieldGroup>
          </div>

          <div className="flex min-h-0 flex-col gap-4 overflow-hidden p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="font-medium text-sm">Response</h3>
                <p className="text-muted-foreground text-xs">
                  Result appears here after execution.
                </p>
              </div>
            </div>

            {result ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
                <div className="flex flex-wrap gap-2 rounded-md border bg-muted/30 p-2">
                  <Badge
                    className="gap-1 rounded-sm px-2.5 py-1 font-mono"
                    variant={
                      result.status < SUCCESS_STATUS_THRESHOLD
                        ? "default"
                        : "destructive"
                    }
                  >
                    <span className="text-[10px] uppercase opacity-70">
                      {getStatusTone(result)}
                    </span>
                    {result.status} {result.statusText}
                  </Badge>
                  <Badge
                    className="rounded-sm px-2.5 py-1 font-mono"
                    variant="secondary"
                  >
                    {result.durationMs} ms
                  </Badge>
                  <Badge
                    className="rounded-sm px-2.5 py-1 font-mono"
                    variant="outline"
                  >
                    {responseSize}
                  </Badge>
                  <Badge
                    className="rounded-sm px-2.5 py-1 font-mono"
                    variant="outline"
                  >
                    {responseContentType}
                  </Badge>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge
                        className="cursor-default rounded-sm px-2.5 py-1 font-mono"
                        variant="outline"
                      >
                        {responseHeaderCount} headers
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent align="end" className="w-96 p-0">
                      <div className="border-b px-3 py-2">
                        <p className="font-medium text-sm">Response Headers</p>
                        <p className="text-muted-foreground text-xs">
                          {responseHeaderCount} headers returned
                        </p>
                      </div>
                      <pre className="max-h-72 overflow-auto p-3 font-mono text-xs leading-relaxed">
                        {responseHeadersJson}
                      </pre>
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border bg-muted/30">
                  <CodeBlock
                    className="flex min-h-0 flex-1 flex-col"
                    data={[
                      {
                        code: responseBody,
                        filename: "response-body.json",
                        language: "json",
                      },
                    ]}
                    defaultValue="json"
                  >
                    <CodeBlockHeader>
                      <span className="px-3 py-1 text-muted-foreground text-xs">
                        response-body.json
                      </span>
                    </CodeBlockHeader>
                    <CodeBlockBody className="min-h-0 flex-1 overflow-auto">
                      {(item) => (
                        <CodeBlockItem
                          className="min-h-full"
                          key={item.filename}
                          value={item.language}
                        >
                          <CodeBlockContent
                            className="[&_.line]:max-w-full [&_.line]:break-all [&_code]:max-w-full [&_code]:whitespace-pre-wrap [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap"
                            language="json"
                          >
                            {item.code}
                          </CodeBlockContent>
                        </CodeBlockItem>
                      )}
                    </CodeBlockBody>
                  </CodeBlock>
                </div>
              </div>
            ) : (
              <div className="flex min-h-72 flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 p-6 text-center">
                <div className="rounded-md border bg-background p-3 text-muted-foreground">
                  <Inbox data-icon="inline-start" />
                </div>
                <div className="flex max-w-sm flex-col gap-1">
                  <p className="font-medium text-sm">No response yet</p>
                  <p className="text-muted-foreground text-sm">
                    Send the request to inspect the status, duration, headers,
                    and body here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <SheetFooter className="border-t">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={resetRequest} type="button" variant="outline">
              <RotateCcw data-icon="inline-start" />
              Reset
            </Button>
            <Button disabled={isSending} onClick={sendRequest} type="button">
              <Play data-icon="inline-start" />
              {isSending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
