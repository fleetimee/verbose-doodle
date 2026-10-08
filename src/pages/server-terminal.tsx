import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { fetchServerEntry } from "@/features/server-inventory/api";
import { useServerTerminal } from "@/features/server-inventory/hooks/use-server-terminal";
import type { ServerEntry } from "@/features/server-inventory/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import "@xterm/xterm/css/xterm.css";

function TerminalSession({ entry }: { entry: ServerEntry }) {
  const { messages } = useI18n();
  const copy = messages.servers;
  useDocumentMeta({ title: `${entry.name} | SSH` });
  const [attempt, setAttempt] = useState(0);
  const { containerRef, status, error, disconnect } = useServerTerminal(
    entry.id,
    attempt
  );
  const statusLabel = {
    connecting: copy.sshConnecting,
    connected: copy.sshConnected,
    disconnected: copy.sshDisconnected,
  }[status];

  return (
    <main className="flex h-dvh flex-col bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold text-base">{entry.name}</h1>
          <p className="truncate font-mono text-muted-foreground text-xs">
            {entry.username}@{entry.host}:{entry.port ?? 22}
          </p>
        </div>
        <p
          aria-live="polite"
          className="text-muted-foreground text-sm"
          role="status"
        >
          {statusLabel}
        </p>
        <Button
          onClick={
            status === "disconnected"
              ? () => setAttempt((value) => value + 1)
              : disconnect
          }
          size="sm"
          variant="outline"
        >
          {status === "disconnected" ? copy.sshReconnect : copy.sshDisconnect}
        </Button>
      </header>
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
      <main className="space-y-4 p-6">
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
