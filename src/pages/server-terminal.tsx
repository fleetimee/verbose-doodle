import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { fetchServerEntry } from "@/features/server-inventory/api";
import { ServerTerminalToolbar } from "@/features/server-inventory/components/server-terminal-toolbar";
import { useServerTerminal } from "@/features/server-inventory/hooks/use-server-terminal";
import type { ServerEntry } from "@/features/server-inventory/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { copyToClipboard } from "@/lib/clipboard";
import "@xterm/xterm/css/xterm.css";

function TerminalSession({ entry }: { entry: ServerEntry }) {
  const { messages } = useI18n();
  const copy = messages.servers;
  useDocumentMeta({ title: `${entry.name} | SSH` });
  const [attempt, setAttempt] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const {
    containerRef,
    keyboardInputRef,
    fontSize,
    hasSelection,
    changeFontSize,
    clear,
    selectAll,
    getSelection,
    status,
    error,
    disconnect,
  } = useServerTerminal(entry.id, attempt);

  useEffect(() => {
    const update = () =>
      setFullscreen(document.fullscreenElement === document.documentElement);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      toast.error(copy.sshFullscreenFailed);
    }
  }

  async function copySelection() {
    const selected = getSelection();
    if (!selected) {
      return;
    }
    try {
      if (await copyToClipboard(selected)) {
        toast.success(copy.sshSelectionCopied);
      } else {
        toast.error(copy.sshSelectionCopyFailed);
      }
    } catch {
      toast.error(copy.sshSelectionCopyFailed);
    }
  }
  const statusLabel = {
    connecting: copy.sshConnecting,
    connected: copy.sshConnected,
    disconnected: copy.sshDisconnected,
  }[status];

  return (
    <main className="flex h-dvh flex-col bg-background">
      <ServerTerminalToolbar
        connected={status === "connected"}
        disconnected={status === "disconnected"}
        entry={entry}
        fontSize={fontSize}
        fullscreen={fullscreen}
        hasSelection={hasSelection}
        keyboardInputRef={keyboardInputRef}
        onClear={clear}
        onCopy={copySelection}
        onDisconnect={disconnect}
        onFontSizeChange={changeFontSize}
        onReconnect={() => setAttempt((value) => value + 1)}
        onSelectAll={selectAll}
        onToggleFullscreen={toggleFullscreen}
        statusLabel={statusLabel}
      />
      {error && (
        <p
          className="border-b bg-destructive/10 px-4 py-3 text-destructive text-sm"
          role="alert"
        >
          {error}
        </p>
      )}
      {status === "disconnected" && !error && (
        <p className="border-b px-4 py-3 text-muted-foreground text-sm">
          {copy.sshSessionEnded}
        </p>
      )}
      <div
        className="server-ssh-terminal min-h-0 flex-1 p-3"
        ref={containerRef}
      />
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-muted-foreground text-xs">
        <p>{copy.sshTerminalHelp}</p>
        <Link
          className="text-primary underline underline-offset-4"
          to="/dashboard/servers"
        >
          {copy.sshBackToInventory}
        </Link>
      </footer>
    </main>
  );
}

export function ServerTerminalPage() {
  const { serverId = "" } = useParams();
  const { messages } = useI18n();
  const copy = messages.servers;
  const query = useQuery({
    queryKey: ["server-terminal", serverId],
    queryFn: () => fetchServerEntry(serverId),
    retry: false,
  });
  if (query.isPending) {
    return (
      <p className="p-6 text-muted-foreground" role="status">
        {copy.sshLoading}
      </p>
    );
  }
  if (
    query.isError ||
    query.data.accessType.toUpperCase() !== "SSH" ||
    !query.data.username ||
    !query.data.hasPassword
  ) {
    return (
      <main className="flex flex-col gap-4 p-6">
        <p role="alert">
          {query.isError ? copy.sshLoadFailed : copy.sshCredentialsRequired}
        </p>
        <Button render={<Link to="/dashboard/servers" />} variant="outline">
          {copy.sshBackToInventory}
        </Button>
      </main>
    );
  }
  return <TerminalSession entry={query.data} key={query.data.id} />;
}
