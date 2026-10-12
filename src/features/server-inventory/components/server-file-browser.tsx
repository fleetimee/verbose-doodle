import {
  ComputerTerminal01Icon,
  Download01Icon,
  Folder01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServerFilePane } from "@/features/server-inventory/components/server-file-pane";
import { ServerTerminalFiles } from "@/features/server-inventory/components/server-terminal-files";
import { useRemoteFileBrowser } from "@/features/server-inventory/hooks/use-remote-file-browser";
import type { ServerEntry } from "@/features/server-inventory/types";
import {
  type BrowserFileEntry,
  joinRemotePath,
  localFileEntries,
  type RemoteFileListing,
} from "@/features/server-inventory/utils/terminal-file-browser";
import type { TerminalFileTransfer } from "@/features/server-inventory/utils/terminal-file-transfers";

interface ServerFileBrowserProps {
  connected: boolean;
  connectionError?: string;
  entry: ServerEntry;
  filesOnly?: boolean;
  listFiles: (path: string) => Promise<RemoteFileListing>;
  onCancel: () => void;
  onDownload: (path: string) => boolean;
  onOpenChange: (open: boolean) => void;
  onReconnect: () => void;
  onUpload: (directory: string, file: File) => boolean;
  open: boolean;
  transfer: TerminalFileTransfer | null;
}

const NO_FILE_ACTION = () => undefined;

export function ServerFileBrowser({
  connected,
  connectionError,
  entry,
  filesOnly = false,
  listFiles,
  onCancel,
  onDownload,
  onOpenChange,
  onReconnect,
  onUpload,
  open,
  transfer,
}: ServerFileBrowserProps) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const remote = useRemoteFileBrowser(open, connected, !!transfer, listFiles);
  const filesInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [localRoot, setLocalRoot] = useState(copy.sftpSelectedFiles);
  const [localHistory, setLocalHistory] = useState({ paths: ["/"], index: 0 });
  const [localSelection, setLocalSelection] = useState("");
  const [remoteSelection, setRemoteSelection] = useState("");
  const localPath = localHistory.paths[localHistory.index];
  const localEntries = useMemo(
    () => localFileEntries(files, localPath),
    [files, localPath]
  );
  const selectedLocal = localEntries.find(
    (item) => item.name === localSelection
  );
  const selectedRemote = remote.listing?.entries.find(
    (item) => item.name === remoteSelection
  );
  const busy = !!transfer || remote.loading;
  const remotePath = remote.listing?.path ?? "/";
  useEffect(() => {
    setRemoteSelection("");
  }, [remotePath]);

  function chooseFiles(chosen: FileList | null, folder: boolean) {
    if (!chosen) {
      return;
    }
    const next = [...chosen];
    setFiles(next);
    const rootName = next[0]?.webkitRelativePath.split("/")[0];
    setLocalRoot(folder && rootName ? rootName : copy.sftpSelectedFiles);
    setLocalHistory({ paths: ["/"], index: 0 });
    setLocalSelection("");
  }

  function navigateLocal(path: string) {
    const absolutePath = path.startsWith("/") ? path : `/${path}`;
    setLocalHistory((current) => {
      if (current.paths[current.index] === absolutePath) {
        return current;
      }
      const paths = [
        ...current.paths.slice(0, current.index + 1),
        absolutePath,
      ];
      return { paths, index: paths.length - 1 };
    });
    setLocalSelection("");
  }

  function uploadFile(item: BrowserFileEntry | undefined) {
    if (item?.file && connected && !busy && remote.listing && !remote.error) {
      onUpload(remote.listing.path, item.file);
    }
  }

  function openLocal(item: BrowserFileEntry) {
    if (item.kind === "directory") {
      navigateLocal(joinRemotePath(localPath, item.name));
    } else {
      uploadFile(item);
    }
  }

  function downloadFile(item: BrowserFileEntry | undefined) {
    if (item && connected && !busy && remote.listing && !remote.error) {
      onDownload(joinRemotePath(remote.listing.path, item.name));
    }
  }

  function openRemote(item: BrowserFileEntry) {
    if (item.kind === "directory" || item.kind === "symlink") {
      remote.navigate(joinRemotePath(remotePath, item.name));
      setRemoteSelection("");
    } else if (item.kind === "file") {
      downloadFile(item);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent showCloseButton={false} variant="fullscreen">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <HugeiconsIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-primary"
              icon={Folder01Icon}
            />
            <div className="min-w-0">
              <DialogTitle size="sm">{copy.sftpBrowserTitle}</DialogTitle>
              <DialogDescription size="mono-xs">
                {entry.username}@{entry.host}:{entry.port ?? 22}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs" role="status">
              {connected ? copy.sshConnected : copy.sshDisconnected}
            </span>
            {!connected && (
              <Button onClick={onReconnect} size="sm" variant="outline">
                {copy.sshReconnect}
              </Button>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              size="sm"
              variant="outline"
            >
              <HugeiconsIcon
                data-icon="inline-start"
                icon={ComputerTerminal01Icon}
              />
              {filesOnly ? copy.sshBackToInventory : copy.sftpBackToTerminal}
            </Button>
          </div>
        </header>
        <p className="shrink-0 border-b px-4 py-2 text-muted-foreground text-xs">
          {copy.sftpLocalHint}
        </p>
        <div className="flex min-h-0 flex-1 flex-col divide-y md:flex-row md:divide-x md:divide-y-0">
          <ServerFilePane
            actions={
              <>
                <Button
                  disabled={!!transfer}
                  onClick={() => filesInput.current?.click()}
                  size="sm"
                  variant="ghost"
                >
                  {copy.sftpChooseFiles}
                </Button>
                <Button
                  disabled={!!transfer}
                  onClick={() => folderInput.current?.click()}
                  size="sm"
                  variant="ghost"
                >
                  {copy.sftpChooseFolder}
                </Button>
                <Button
                  disabled={
                    !(selectedLocal?.file && connected) ||
                    busy ||
                    !remote.listing ||
                    !!remote.error
                  }
                  onClick={() => uploadFile(selectedLocal)}
                  size="sm"
                  variant="outline"
                >
                  <HugeiconsIcon data-icon="inline-start" icon={Upload01Icon} />
                  {copy.sshUploadAction}
                </Button>
              </>
            }
            canBack={localHistory.index > 0}
            canForward={localHistory.index < localHistory.paths.length - 1}
            disabled={!!transfer}
            emptyMessage={
              files.length ? copy.sftpEmptyDirectory : copy.sftpLocalEmpty
            }
            entries={localEntries}
            loading={false}
            onBack={() => {
              setLocalHistory((current) => ({
                ...current,
                index: current.index - 1,
              }));
              setLocalSelection("");
            }}
            onForward={() => {
              setLocalHistory((current) => ({
                ...current,
                index: current.index + 1,
              }));
              setLocalSelection("");
            }}
            onNavigate={navigateLocal}
            onOpen={openLocal}
            onSelect={setLocalSelection}
            path={localPath}
            rootLabel={localRoot}
            selected={localSelection}
            title={copy.sftpLocal}
          />
          <ServerFilePane
            actions={
              <>
                <Button
                  disabled={
                    selectedRemote?.kind !== "directory" || busy || !connected
                  }
                  onClick={() => selectedRemote && openRemote(selectedRemote)}
                  size="sm"
                  variant="ghost"
                >
                  {copy.sftpOpenFolder}
                </Button>
                <Button
                  disabled={
                    !(
                      selectedRemote &&
                      ["file", "symlink"].includes(selectedRemote.kind)
                    ) ||
                    busy ||
                    !connected ||
                    !!remote.error
                  }
                  onClick={() => downloadFile(selectedRemote)}
                  size="sm"
                  variant="outline"
                >
                  <HugeiconsIcon
                    data-icon="inline-start"
                    icon={Download01Icon}
                  />
                  {copy.sshDownloadAction}
                </Button>
              </>
            }
            canBack={remote.canBack}
            canForward={remote.canForward}
            disabled={!connected || busy}
            emptyMessage={
              connected ? copy.sftpEmptyDirectory : copy.sshTransferInterrupted
            }
            entries={remote.listing?.entries ?? []}
            error={connectionError || remote.error}
            loading={remote.loading}
            onBack={() => {
              remote.back();
              setRemoteSelection("");
            }}
            onForward={() => {
              remote.forward();
              setRemoteSelection("");
            }}
            onNavigate={(path) => {
              remote.navigate(path);
              setRemoteSelection("");
            }}
            onOpen={openRemote}
            onRefresh={remote.refresh}
            onSelect={setRemoteSelection}
            path={remotePath}
            rootLabel="/"
            selected={remoteSelection}
            title={entry.name}
            truncated={remote.listing?.truncated}
          />
        </div>
        <ServerTerminalFiles
          action={null}
          connected={connected}
          onActionChange={NO_FILE_ACTION}
          onCancel={onCancel}
          onDownload={onDownload}
          onUpload={onUpload}
          transfer={transfer}
        />
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-muted/20 px-4 py-2 text-muted-foreground text-xs">
          <span>{copy.sftpInteractionHint}</span>
          <span>{copy.sftpLimitHint}</span>
        </footer>
        <input
          aria-label={copy.sftpChooseFiles}
          className="sr-only"
          multiple
          onChange={(event) => {
            chooseFiles(event.target.files, false);
            event.target.value = "";
          }}
          ref={filesInput}
          tabIndex={-1}
          type="file"
        />
        <input
          aria-label={copy.sftpChooseFolder}
          className="sr-only"
          multiple
          onChange={(event) => {
            chooseFiles(event.target.files, true);
            event.target.value = "";
          }}
          ref={(element) => {
            folderInput.current = element;
            element?.setAttribute("webkitdirectory", "");
          }}
          tabIndex={-1}
          type="file"
        />
      </DialogContent>
    </Dialog>
  );
}
