import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ChevronLeft, Download, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchContainerFiles } from "@/features/server-inventory/api";
import { containerStatusError } from "@/features/server-inventory/components/server-container-status";
import { ServerFilePreviewEditor } from "@/features/server-inventory/components/server-file-preview-editor";
import { saveVolumeDownload } from "@/features/server-inventory/utils/container-volume-download";
import { decodeVolumeText } from "@/features/server-inventory/utils/container-volume-preview";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";

export function ServerContainerFilePreviewPage() {
  const { serverId = "", containerId = "" } = useParams();
  const [params] = useSearchParams();
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const mount = params.get("mount") ?? "";
  const path = params.get("path") ?? "";
  const name = path.split("/").at(-1) || copy.volumePreview;
  const valid = Boolean(
    serverId && containerId && mount.startsWith("/") && path.startsWith("/")
  );
  const query = useQuery({
    queryKey: [
      "server-inventory",
      "container-file-preview",
      serverId,
      containerId,
      mount,
      path,
    ],
    queryFn: ({ signal }) =>
      fetchContainerFiles(
        serverId,
        containerId,
        mount,
        path,
        "preview",
        signal
      ),
    enabled: valid,
    retry: false,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const downloadRequest = useRef<AbortController | null>(null);
  useEffect(() => () => downloadRequest.current?.abort(), []);
  const download = useMutation({
    mutationFn: async () => {
      const request = new AbortController();
      downloadRequest.current = request;
      const result = await fetchContainerFiles(
        serverId,
        containerId,
        mount,
        path,
        "download",
        request.signal
      );
      request.signal.throwIfAborted();
      if (result.status !== "OK") {
        throw new Error(containerStatusError(result.status, messages));
      }
      const bytes = Uint8Array.from(atob(result.content ?? ""), (character) =>
        character.charCodeAt(0)
      );
      saveVolumeDownload(bytes, name);
    },
  });
  const preview = useMemo(() => {
    const bytes = Uint8Array.from(
      atob(query.data?.content ?? ""),
      (character) => character.charCodeAt(0)
    );
    return decodeVolumeText(bytes);
  }, [query.data?.content]);
  const extension = name.toLowerCase().split(".").at(-1);
  const format = !preview.raw && extension === "json" ? "json" : "text";
  const extensions = useMemo(
    () => [
      EditorState.readOnly.of(true),
      ...(!preview.raw && ["md", "markdown"].includes(extension ?? "")
        ? [markdown()]
        : []),
    ],
    [extension, preview.raw]
  );
  const requestError = query.error
    ? getErrorMessage(query.error)
    : containerStatusError(query.data?.status, messages);
  const error = valid ? requestError : copy.volumeInvalidPreview;
  useDocumentMeta({
    title: `${name} | Fleetime Labs`,
    description: copy.volumePreviewDescription,
  });

  return (
    <main className="flex h-dvh min-w-0 flex-col bg-background">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-3">
        <Button
          aria-label={copy.backToContainer}
          render={
            <Link
              to={`/dashboard/server-metrics/${serverId}/containers/${containerId}`}
            />
          }
          size="icon-sm"
          variant="ghost"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold text-sm">{name}</h1>
          <p
            className="truncate font-mono text-muted-foreground text-xs"
            title={`${mount} · ${path}`}
          >
            {mount} · {path}
          </p>
        </div>
        <span className="text-muted-foreground text-xs">{copy.readOnly}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={messages.servers.sftpRefresh}
              disabled={!valid || query.isFetching}
              onClick={() => query.refetch()}
              size="icon-sm"
              variant="ghost"
            >
              {query.isFetching ? (
                <Spinner />
              ) : (
                <RefreshCw aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{messages.servers.sftpRefresh}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={copy.volumeDownload}
              disabled={
                !valid || query.data?.status !== "OK" || download.isPending
              }
              onClick={() => download.mutate()}
              size="icon-sm"
              variant="outline"
            >
              {download.isPending ? (
                <Spinner />
              ) : (
                <Download aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copy.volumeDownload}</TooltipContent>
        </Tooltip>
      </header>
      {download.error && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(download.error)}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert
          variant={
            query.data?.status === "FILE_PREVIEW_TOO_LARGE"
              ? "default"
              : "destructive"
          }
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!error && query.isPending && (
        <p className="p-6 text-muted-foreground text-sm" role="status">
          {copy.volumePreviewLoading}
        </p>
      )}
      {!error && query.data?.status === "OK" && (
        <>
          {preview.raw && (
            <Alert>
              <AlertDescription>{copy.volumeBinary}</AlertDescription>
            </Alert>
          )}
          <div className="min-h-0 min-w-0 flex-1">
            <ServerFilePreviewEditor
              extensions={extensions}
              format={format}
              name={name}
              text={preview.text}
            />
          </div>
        </>
      )}
    </main>
  );
}
