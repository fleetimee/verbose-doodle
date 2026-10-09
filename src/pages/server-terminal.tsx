import {
  Cancel01Icon,
  Key01Icon,
  ServerStack02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  fetchServerEntries,
  fetchServerEntry,
  revealServerPassword,
} from "@/features/server-inventory/api";
import { ServerTerminalToolbar } from "@/features/server-inventory/components/server-terminal-toolbar";
import { serverInventoryKeys } from "@/features/server-inventory/hooks/use-server-inventory";
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
  const [sendingPassword, setSendingPassword] = useState(false);
  const otherServersQuery = useQuery({
    queryKey: [...serverInventoryKeys.entries, "terminal-toolbar-picker"],
    queryFn: () =>
      fetchServerEntries({
        page: 0,
        size: 100,
        search: "",
        accessType: "",
        databaseEngine: "",
        sortBy: "name",
        direction: "asc",
      }),
    staleTime: 5 * 60 * 1000,
  });

  const {
    containerRef,
    keyboardInputRef,
    fontSize,
    hasSelection,
    changeFontSize,
    clear,
    selectAll,
    getSelection,
    sendInput,
    focus,
    status,
    error,
    disconnect,
    hostKey,
    trustPending,
    trustHostKey,
    passwordPrompt,
    dismissPasswordPrompt,
  } = useServerTerminal(entry.id, attempt);

  async function handleSendPassword(targetServerId: string) {
    if (status !== "connected" || sendingPassword) {
      return;
    }
    setSendingPassword(true);
    try {
      const password = await revealServerPassword(targetServerId);
      if (!password) {
        toast.error(copy.sshNoSavedPassword);
        return;
      }
      sendInput(`${password}\r`);
      toast.success(copy.sshPasswordSent);
      focus();
    } catch {
      toast.error(copy.sshPastePasswordFailed);
    } finally {
      setSendingPassword(false);
    }
  }

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
    <main className="flex h-dvh min-w-0 flex-col overflow-hidden bg-background">
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
        onSendPassword={handleSendPassword}
        onToggleFullscreen={toggleFullscreen}
        otherServers={otherServersQuery.data?.servers}
        sendingPassword={sendingPassword}
        statusLabel={statusLabel}
      />
      {hostKey && (
        <Alert className="shrink-0">
          <AlertTitle>{copy.sshHostKeyTitle}</AlertTitle>
          <AlertDescription>
            <p>{copy.sshHostKeyDescription}</p>
            <dl className="grid min-w-0 gap-2 sm:grid-cols-[auto_1fr]">
              <dt>{copy.host}</dt>
              <dd className="break-all font-mono">
                {hostKey.host}:{hostKey.port}
              </dd>
              <dt>{copy.sshHostKeyAlgorithm}</dt>
              <dd className="break-all font-mono">{hostKey.algorithm}</dd>
              <dt>{copy.sshHostKeyFingerprint}</dt>
              <dd className="break-all font-mono">{hostKey.fingerprint}</dd>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button disabled={trustPending} onClick={trustHostKey} size="sm">
                {trustPending ? copy.sshHostKeySaving : copy.sshHostKeyTrust}
              </Button>
              <Button onClick={disconnect} size="sm" variant="outline">
                {copy.sshHostKeyCancel}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <p
          className="shrink-0 border-b bg-destructive/10 px-4 py-3 text-destructive text-sm"
          role="alert"
        >
          {error}
        </p>
      )}
      {status === "disconnected" && !error && (
        <p className="shrink-0 border-b px-4 py-3 text-muted-foreground text-sm">
          {copy.sshSessionEnded}
        </p>
      )}
      <div className="server-ssh-frame relative min-h-0 min-w-0 flex-1 overflow-hidden p-3">
        <div
          className="server-ssh-terminal h-full w-full min-w-0"
          ref={containerRef}
        />
        {passwordPrompt && (
          <div
            className="fade-in-0 zoom-in-95 pointer-events-auto absolute top-[var(--prompt-y)] left-[var(--prompt-x)] z-50 flex max-w-[calc(100vw-3rem)] animate-in items-center gap-1.5 rounded-full border bg-popover/95 py-1 pr-1.5 pl-2.5 text-popover-foreground shadow-xl backdrop-blur-md"
            style={
              // SAFETY: CSS custom properties for dynamic coordinates are valid inline styles.
              {
                "--prompt-x": `${Math.min(passwordPrompt.x + 12, window.innerWidth - 480)}px`,
                "--prompt-y": `${Math.min(passwordPrompt.y + 26, window.innerHeight - 80)}px`,
              } as React.CSSProperties
            }
          >
            <span
              className="flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs"
              title={copy.sshSudoPromptDetected}
            >
              <HugeiconsIcon
                aria-hidden="true"
                className="size-3.5 text-primary"
                icon={Key01Icon}
                strokeWidth={2}
              />
            </span>
            <div className="flex max-h-9 max-w-sm shrink items-center gap-1 overflow-x-auto overflow-y-hidden py-0.5 sm:max-w-md">
              {entry.hasPassword && (
                <button
                  className="flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 font-medium text-success text-xs transition-colors hover:bg-success/20 active:scale-95"
                  disabled={sendingPassword}
                  onClick={() => handleSendPassword(entry.id)}
                  title={`${entry.name} (${entry.username ?? "user"})`}
                  type="button"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="size-3.5 shrink-0"
                    icon={UserIcon}
                    strokeWidth={2}
                  />
                  <span className="max-w-28 truncate">{entry.name}</span>
                </button>
              )}
              {otherServersQuery.data?.servers
                ?.filter(
                  (server) => server.id !== entry.id && server.hasPassword
                )
                .map((server) => (
                  <button
                    className="flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 font-medium text-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
                    disabled={sendingPassword}
                    key={server.id}
                    onClick={() => handleSendPassword(server.id)}
                    title={`${server.name} (${server.username ?? server.host})`}
                    type="button"
                  >
                    <HugeiconsIcon
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-muted-foreground"
                      icon={ServerStack02Icon}
                      strokeWidth={2}
                    />
                    <span className="max-w-28 truncate">{server.name}</span>
                  </button>
                ))}
            </div>
            <button
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={dismissPasswordPrompt}
              title={copy.sshDismissPopup}
              type="button"
            >
              <HugeiconsIcon
                aria-hidden="true"
                className="size-3.5"
                icon={Cancel01Icon}
                strokeWidth={2}
              />
            </button>
          </div>
        )}
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-muted-foreground text-xs">
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
