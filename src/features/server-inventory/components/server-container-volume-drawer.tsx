import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchContainerFiles } from "@/features/server-inventory/api";
import { containerStatusError } from "@/features/server-inventory/components/server-container-status";
import { ServerFilePane } from "@/features/server-inventory/components/server-file-pane";
import { useRemoteFileBrowser } from "@/features/server-inventory/hooks/use-remote-file-browser";
import {
  prepareVolumeDownload,
  saveVolumeDownload,
} from "@/features/server-inventory/utils/container-volume-download";
import { containerVolumePreviewUrl } from "@/features/server-inventory/utils/container-volume-preview";
import {
  type BrowserFileEntry,
  joinRemotePath,
} from "@/features/server-inventory/utils/terminal-file-browser";
import { getErrorMessage } from "@/lib/error-handler";
import { formatMessage } from "@/lib/i18n";

function FileDownloadButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          size="icon-xs"
          variant="ghost"
        >
          <HugeiconsIcon
            aria-hidden="true"
            icon={Download01Icon}
            strokeWidth={2}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function VolumeBrowser({
  serverId,
  containerId,
  mount,
  onClose,
}: {
  serverId: string;
  containerId: string;
  mount: string;
  onClose: () => void;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const [selected, setSelected] = useState("");
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState("");
  const operation = useRef(false);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requests = useRef(new Set<AbortController>());
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const request of requests.current) {
        request.abort();
      }
    };
  }, []);

  const requestFiles = useCallback(
    async (path: string, mode: "list" | "preview" | "download") => {
      const request = new AbortController();
      requests.current.add(request);
      try {
        const result = await fetchContainerFiles(
          serverId,
          containerId,
          mount,
          path,
          mode,
          request.signal
        );
        if (result.status !== "OK") {
          throw new Error(containerStatusError(result.status, messages));
        }
        return result;
      } finally {
        requests.current.delete(request);
      }
    },
    [serverId, containerId, mount, messages]
  );

  const listFiles = useCallback(
    async (path: string) => {
      const result = await requestFiles(path === "." ? "/" : path, "list");
      setSelected("");
      setCheckedFiles([]);
      setError("");
      return result;
    },
    [requestFiles]
  );
  const browser = useRemoteFileBrowser(true, true, false, listFiles);
  const path = browser.listing?.path ?? "/";
  const entries = browser.listing?.entries ?? [];
  const selectedFiles = entries.filter(
    (entry) => entry.kind === "file" && checkedFiles.includes(entry.name)
  );

  async function downloadFiles(files: BrowserFileEntry[]) {
    if (operation.current || files.length === 0) {
      return;
    }
    operation.current = true;
    setBusy(true);
    setError("");
    try {
      const download = await prepareVolumeDownload(
        files.map((entry) => entry.name),
        async (name, index) => {
          setDownloadProgress(`${index + 1}/${files.length}`);
          const result = await requestFiles(
            joinRemotePath(path, name),
            "download"
          );
          if (!mounted.current) {
            throw new DOMException("Drawer closed", "AbortError");
          }
          return Uint8Array.from(atob(result.content ?? ""), (character) =>
            character.charCodeAt(0)
          );
        },
        copy.volumeBatchTooLarge
      );
      if (mounted.current) {
        saveVolumeDownload(download.bytes, download.name);
      }
    } catch (failure) {
      if (
        mounted.current &&
        !(failure instanceof DOMException && failure.name === "AbortError")
      ) {
        setError(getErrorMessage(failure));
      }
    } finally {
      operation.current = false;
      setBusy(false);
      setDownloadProgress("");
    }
  }

  return (
    <Drawer
      direction="right"
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open
      shouldScaleBackground={false}
    >
      <DrawerContent
        className="overflow-hidden data-[vaul-drawer-direction=right]:w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-4xl"
        showSwipeHandle={false}
      >
        <DrawerHeader size="lg" variant="left">
          <DrawerTitle>{copy.volumeTitle}</DrawerTitle>
          <DrawerDescription className="break-all">
            {mount} · {copy.volumeDescription}
          </DrawerDescription>
        </DrawerHeader>
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          data-vaul-no-drag
        >
          <ServerFilePane
            actions={
              <Button
                disabled={busy || browser.loading || selectedFiles.length === 0}
                onClick={() => downloadFiles(selectedFiles)}
                size="xs"
                variant="outline"
              >
                {busy ? (
                  <Spinner className="size-3" />
                ) : (
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={Download01Icon}
                    strokeWidth={2}
                  />
                )}
                {formatMessage(copy.volumeDownloadSelected, {
                  count: downloadProgress || String(selectedFiles.length),
                })}
              </Button>
            }
            canBack={browser.canBack}
            canForward={browser.canForward}
            disabled={busy || browser.loading}
            emptyMessage={messages.servers.sftpEmptyDirectory}
            entries={entries}
            error={error || browser.error}
            fileSelection={{
              names: checkedFiles,
              onChange: (names, checked) =>
                setCheckedFiles((current) =>
                  checked
                    ? [...new Set([...current, ...names])]
                    : current.filter((name) => !names.includes(name))
                ),
              selectAllLabel: copy.volumeSelectAll,
              fileLabel: (name) =>
                formatMessage(copy.volumeSelectFile, { name }),
            }}
            loading={browser.loading}
            onBack={browser.back}
            onForward={browser.forward}
            onNavigate={browser.navigate}
            onOpen={(entry) => {
              setSelected(entry.name);
              if (entry.kind === "directory") {
                browser.navigate(joinRemotePath(path, entry.name));
              } else if (entry.kind === "file") {
                window.open(
                  containerVolumePreviewUrl(
                    serverId,
                    containerId,
                    mount,
                    joinRemotePath(path, entry.name)
                  ),
                  "_blank",
                  "noopener,noreferrer"
                );
              }
            }}
            onRefresh={browser.refresh}
            onSelect={setSelected}
            path={path}
            renderEntryActions={(entry) =>
              entry.kind === "file" && (
                <FileDownloadButton
                  disabled={busy || browser.loading}
                  label={formatMessage(copy.volumeDownloadFile, {
                    name: entry.name,
                  })}
                  onClick={() => downloadFiles([entry])}
                />
              )
            }
            renderFileName={(entry) => (
              <a
                aria-disabled={busy || browser.loading}
                aria-label={formatMessage(copy.volumePreviewFile, {
                  name: entry.name,
                })}
                className="flex min-w-0 flex-1 flex-col text-left focus-visible:outline-2 focus-visible:outline-ring aria-disabled:opacity-50"
                href={
                  busy || browser.loading
                    ? undefined
                    : containerVolumePreviewUrl(
                        serverId,
                        containerId,
                        mount,
                        joinRemotePath(path, entry.name)
                      )
                }
                rel="noopener noreferrer"
                tabIndex={busy || browser.loading ? -1 : 0}
                target="_blank"
              >
                <span
                  className="truncate text-sm underline underline-offset-4"
                  title={entry.name}
                >
                  {entry.name}
                </span>
                {entry.permissions && (
                  <span className="font-mono text-muted-foreground text-xs">
                    {entry.permissions}
                  </span>
                )}
              </a>
            )}
            rootLabel={mount}
            selected={selected}
            title={copy.volumeTitle}
            truncated={browser.listing?.truncated}
          />
        </div>
        <DrawerFooter>
          <Button onClick={onClose} variant="outline">
            {messages.common.close}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function ServerContainerVolumeDrawer({
  serverId,
  containerId,
  mount,
  onClose,
}: {
  serverId?: string;
  containerId: string;
  mount: string | null;
  onClose: () => void;
}) {
  if (!(serverId && mount)) {
    return null;
  }
  return (
    <VolumeBrowser
      containerId={containerId}
      key={`${containerId}-${mount}`}
      mount={mount}
      onClose={onClose}
      serverId={serverId}
    />
  );
}
