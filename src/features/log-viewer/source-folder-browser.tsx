import { ArrowUp01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { browseLogFolder } from "@/features/log-viewer/api";
import { getLogErrorMessage as getErrorMessage } from "@/features/log-viewer/error-message";
import type {
  DetectedLogLayout,
  LogBrowseResult,
  LogSource,
  LogSourceRequest,
} from "@/features/log-viewer/types";

function canUseSavedPassword(
  request: LogSourceRequest,
  source: LogSource | null
) {
  return (
    !!source?.hasPassword &&
    source.host.toLowerCase() === request.host.trim().toLowerCase() &&
    source.port === request.port &&
    source.shareName.toLowerCase() === request.shareName.trim().toLowerCase() &&
    source.username === request.username.trim() &&
    source.domain === request.domain.trim()
  );
}

export function SourceFolderBrowser({
  request,
  source,
  disabled,
  onApply,
}: {
  request: LogSourceRequest;
  source: LogSource | null;
  disabled: boolean;
  onApply: (layout: DetectedLogLayout) => void;
}) {
  const {
    locale,
    messages: { logViewer: copy },
  } = useI18n();
  const pathId = useId();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("");
  const [result, setResult] = useState<LogBrowseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const sourceId = source?.id;
  const { host, port, shareName, username, domain, password, serverEntryId } =
    request;
  const ready =
    !!host.trim() &&
    !!shareName.trim() &&
    !!username.trim() &&
    Number.isInteger(port) &&
    port >= 1 &&
    port <= 65_535 &&
    (!!password || !!serverEntryId || canUseSavedPassword(request, source));

  const load = useCallback(
    async (folder: string) => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const found = await browseLogFolder(
          {
            sourceId,
            serverEntryId,
            host,
            port,
            shareName,
            username,
            domain,
            password: password || undefined,
            path: folder,
          },
          current.signal
        );
        if (!current.signal.aborted) {
          setResult(found);
          setPath(found.path);
        }
      } catch (cause) {
        if (!current.signal.aborted) {
          setError(getErrorMessage(cause));
        }
      } finally {
        if (controller.current === current) {
          controller.current = null;
          setLoading(false);
        }
      }
    },
    [sourceId, serverEntryId, host, port, shareName, username, domain, password]
  );

  useEffect(() => {
    setOpen(false);
    setResult(null);
    setError(null);
    setLoading(false);
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, [load]);

  let browseHint = ready ? copy.browseNote : copy.browsePrerequisite;
  if (!shareName.trim()) {
    browseHint = copy.browseShareRequired;
  }

  function close() {
    controller.current?.abort();
    controller.current = null;
    setLoading(false);
    setOpen(false);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Button
          disabled={disabled || !ready}
          onClick={() => {
            if (open) {
              close();
              return;
            }
            setOpen(true);
            setPath(request.basePath);
            load(request.basePath);
          }}
          type="button"
          variant="outline"
        >
          <HugeiconsIcon data-icon="inline-start" icon={Folder01Icon} />
          {open ? copy.closeBrowser : copy.browse}
        </Button>
        <p className="text-muted-foreground text-xs">{browseHint}</p>
      </div>
      {open && (
        <section
          aria-label={copy.browse}
          className="flex min-w-0 flex-col gap-3 rounded-lg border p-3"
        >
          <Field>
            <FieldLabel htmlFor={pathId}>{copy.browsePath}</FieldLabel>
            <div className="flex gap-2">
              <Input
                disabled={disabled || loading}
                id={pathId}
                onChange={(event) => setPath(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    load(path);
                  }
                }}
                placeholder={copy.browseRoot}
                value={path}
                variant="mono"
              />
              <Button
                disabled={disabled || loading}
                onClick={() => load(path)}
                size="sm"
                type="button"
                variant="outline"
              >
                {copy.browseGo}
              </Button>
            </div>
          </Field>
          <div className="flex items-center gap-2">
            <Button
              disabled={disabled || loading}
              onClick={() => {
                setPath("");
                load("");
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              {copy.browseRoot}
            </Button>
            <Button
              aria-label={copy.browseParent}
              disabled={disabled || loading || !result?.path}
              onClick={() => {
                const parts = (result?.path ?? "").split("/");
                parts.pop();
                load(parts.join("/"));
              }}
              size="icon-sm"
              title={copy.browseParent}
              type="button"
              variant="outline"
            >
              <HugeiconsIcon icon={ArrowUp01Icon} />
            </Button>
            <Button
              aria-label={copy.browseRefresh}
              disabled={disabled || loading}
              onClick={() => load(result?.path ?? path)}
              size="icon-sm"
              title={copy.browseRefresh}
              type="button"
              variant="outline"
            >
              <RefreshCw />
            </Button>
          </div>
          {loading && (
            <div
              aria-live="polite"
              className="flex items-center gap-2 text-muted-foreground text-xs"
            >
              <Spinner />
              {copy.browseLoading}
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>{copy.browseError}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <>
              <p className="text-muted-foreground text-xs">
                {copy.browseFiles}
              </p>
              <ScrollArea className="h-52" variant="bordered">
                <div className="flex flex-col gap-1 p-2">
                  {result.entries.length === 0 && (
                    <p className="p-2 text-muted-foreground text-sm">
                      {copy.browseEmpty}
                    </p>
                  )}
                  {result.entries.map((entry) =>
                    entry.directory ? (
                      <Button
                        className="w-full justify-start"
                        disabled={disabled || loading}
                        key={entry.path}
                        onClick={() => load(entry.path)}
                        size="sm"
                        title={entry.name}
                        type="button"
                        variant="ghost"
                      >
                        <HugeiconsIcon
                          data-icon="inline-start"
                          icon={Folder01Icon}
                        />
                        <span className="truncate">{entry.name}</span>
                      </Button>
                    ) : (
                      <div
                        className="flex min-w-0 items-center gap-2 px-2 py-1.5"
                        key={entry.path}
                      >
                        <FileText
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                        <span
                          className="min-w-0 flex-1 truncate font-mono text-xs"
                          title={entry.name}
                        >
                          {entry.name}
                        </span>
                        <span className="shrink-0 text-muted-foreground text-xs">
                          {new Intl.NumberFormat(locale, {
                            maximumFractionDigits: 1,
                          }).format(entry.size / 1024)}{" "}
                          KB
                        </span>
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
              {result.limited && (
                <Alert>
                  <AlertDescription>{copy.browseLimited}</AlertDescription>
                </Alert>
              )}
              <Separator />
              <div className="flex flex-col gap-1">
                <h3 className="font-medium text-sm">{copy.browseDetected}</h3>
                <p className="text-muted-foreground text-xs">
                  {copy.browseDetectionHint}
                </p>
              </div>
              {result.layouts.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  {copy.browseNoDetection}
                </p>
              )}
              {result.layouts.map((layout) => (
                <div
                  className="flex flex-col gap-2 rounded-md border p-3"
                  key={`${layout.basePath}:${layout.folderPattern}:${layout.filenamePattern}`}
                >
                  <dl className="flex flex-col gap-2 text-xs">
                    <div>
                      <dt className="text-muted-foreground">{copy.basePath}</dt>
                      <dd className="break-all font-mono">
                        {layout.basePath || copy.browseRoot}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {copy.folderPattern}
                      </dt>
                      <dd>{layout.folderPattern || copy.flat}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {copy.filenamePattern}
                      </dt>
                      <dd className="break-all font-mono">
                        {layout.filenamePattern}
                      </dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-1">
                    {layout.streams.map((stream) => (
                      <Badge key={stream} mono size="sm" variant="secondary">
                        {stream}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {layout.matchedFiles} {copy.browseMatched}
                  </p>
                  <details>
                    <summary className="cursor-pointer text-muted-foreground text-xs">
                      {copy.browseSamples}
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1">
                      {layout.sampleFiles.map((file) => (
                        <li className="break-all font-mono text-xs" key={file}>
                          {file}
                        </li>
                      ))}
                    </ul>
                  </details>
                  <Button
                    disabled={disabled}
                    onClick={() => {
                      onApply(layout);
                      close();
                      toast.success(copy.browseApplied);
                    }}
                    size="sm"
                    type="button"
                  >
                    {copy.browseApply}
                  </Button>
                </div>
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
}
