import { Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { browseLogFolder } from "@/features/log-viewer/api";
import { getLogErrorMessage as getErrorMessage } from "@/features/log-viewer/error-message";
import {
  FolderBrowserNavigation,
  type FolderNavigation,
} from "@/features/log-viewer/source-folder-browser-navigation";
import {
  BrowseWarnings,
  FolderBrowserEntries,
  FolderBrowserLayouts,
} from "@/features/log-viewer/source-folder-browser-results";
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
    (source.protocol || "SMB") === request.protocol &&
    source.host.toLowerCase() === request.host.trim().toLowerCase() &&
    source.port === request.port &&
    source.shareName.toLowerCase() === request.shareName.trim().toLowerCase() &&
    source.username === request.username.trim() &&
    source.domain === request.domain.trim()
  );
}

function canBrowse(request: LogSourceRequest, source: LogSource | null) {
  return (
    !!request.host.trim() &&
    (request.protocol === "SFTP" || !!request.shareName.trim()) &&
    !!request.username.trim() &&
    Number.isInteger(request.port) &&
    request.port >= 1 &&
    request.port <= 65_535 &&
    (!!request.password ||
      !!request.serverEntryId ||
      canUseSavedPassword(request, source))
  );
}

export function SourceFolderBrowser({
  request,
  source,
  disabled,
  onApply,
  onOpenChange,
  portalContainer,
}: {
  request: LogSourceRequest;
  source: LogSource | null;
  disabled: boolean;
  onApply: (layout: DetectedLogLayout) => void;
  onOpenChange: (open: boolean) => void;
  portalContainer: HTMLDivElement | null;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("");
  const [search, setSearch] = useState("");
  const [navigation, setNavigation] = useState<FolderNavigation>({
    paths: [],
    index: -1,
  });
  const [result, setResult] = useState<LogBrowseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const sourceId = source?.id;
  const {
    protocol,
    host,
    port,
    shareName,
    username,
    domain,
    password,
    serverEntryId,
  } = request;
  const ready = canBrowse(request, source);
  const rootLabel = protocol === "SFTP" ? "/" : shareName;
  const currentPath = navigation.paths[navigation.index] ?? request.basePath;

  const load = useCallback(
    async (folder: string, historyIndex?: number) => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const found = await browseLogFolder(
          {
            protocol,
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
          setSearch("");
          setNavigation((previous) => {
            if (historyIndex !== undefined) {
              return { ...previous, index: historyIndex };
            }
            if (previous.paths[previous.index] === found.path) {
              return previous;
            }
            return {
              paths: [
                ...previous.paths.slice(0, previous.index + 1),
                found.path,
              ],
              index: previous.index + 1,
            };
          });
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
    [
      protocol,
      sourceId,
      serverEntryId,
      host,
      port,
      shareName,
      username,
      domain,
      password,
    ]
  );

  useEffect(() => {
    setOpen(false);
    onOpenChange(false);
    setResult(null);
    setError(null);
    setLoading(false);
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, [load, onOpenChange]);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange(next);
    if (next) {
      setPath(request.basePath);
      setSearch("");
      setNavigation({ paths: [], index: -1 });
      load(request.basePath);
    } else {
      controller.current?.abort();
      controller.current = null;
      setLoading(false);
    }
  };
  let browseHint = ready ? copy.browseNote : copy.browsePrerequisite;
  if (protocol === "SMB" && !shareName.trim()) {
    browseHint = copy.browseShareRequired;
  }
  const entries =
    result?.entries.filter((entry) =>
      entry.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
    ) ?? [];
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Dialog onOpenChange={changeOpen} open={open}>
        <DialogTrigger
          render={
            <Button
              disabled={disabled || !ready}
              type="button"
              variant="outline"
            />
          }
        >
          <HugeiconsIcon data-icon="inline-start" icon={Folder01Icon} />
          {copy.browse}
        </DialogTrigger>
        <DialogContent
          className="h-[min(90dvh,56rem)]"
          portalContainer={portalContainer}
          size="5xl"
          variant="pane"
        >
          <div className="shrink-0 p-4">
            <DialogHeader size="compact">
              <DialogTitle>{copy.browse}</DialogTitle>
              <DialogDescription>
                {host} · {copy.browseDialogDescription}
              </DialogDescription>
            </DialogHeader>
          </div>
          <Separator />
          <FolderBrowserNavigation
            absolute={protocol === "SFTP"}
            currentPath={currentPath}
            disabled={disabled || loading}
            navigation={navigation}
            onNavigate={load}
            onPathChange={setPath}
            onSearch={setSearch}
            path={path}
            rootLabel={rootLabel}
            search={search}
          />
          <Separator />
          <div aria-busy={loading} className="flex min-h-0 flex-1 flex-col">
            {loading && (
              <div
                aria-live="polite"
                className="flex items-center gap-2 p-4 text-muted-foreground text-sm"
              >
                <Spinner />
                {copy.browseLoading}
              </div>
            )}
            {error && (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertTitle>{copy.browseError}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            {result && (
              <div className="grid min-h-0 flex-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1">
                <div className="flex min-h-0 min-w-0 flex-col border-b lg:border-r lg:border-b-0">
                  <p className="px-4 py-2 text-muted-foreground text-xs">
                    {copy.browseFiles} · {copy.browseSearchScope}
                  </p>
                  <ScrollArea className="min-h-0 flex-1" variant="visible">
                    <FolderBrowserEntries
                      disabled={disabled || loading}
                      entries={entries}
                      onNavigate={load}
                      search={search.trim()}
                    />
                  </ScrollArea>
                </div>
                <ScrollArea className="min-h-0 min-w-0" variant="visible">
                  <div className="flex flex-col gap-3 p-4">
                    <BrowseWarnings result={result} />
                    <FolderBrowserLayouts
                      disabled={disabled || loading}
                      onApply={(layout) => {
                        onApply(layout);
                        changeOpen(false);
                        toast.success(copy.browseApplied);
                      }}
                      result={result}
                    />
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter className="shrink-0" variant="pane">
            <Button
              onClick={() => changeOpen(false)}
              type="button"
              variant="outline"
            >
              {copy.closeBrowser}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="text-muted-foreground text-xs">{browseHint}</p>
    </div>
  );
}
