import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  fetchServerContainerDetail,
  fetchServerEntry,
} from "@/features/server-inventory/api";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
import { ServerSessionExitDialog } from "@/features/server-inventory/components/server-session-exit-dialog";
import { ServerSshHostKeyReview } from "@/features/server-inventory/components/server-ssh-host-key-review";
import { useServerSessionExit } from "@/features/server-inventory/hooks/use-server-session-exit";
import { useServerTerminal } from "@/features/server-inventory/hooks/use-server-terminal";
import type { ServerEntry } from "@/features/server-inventory/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import "@xterm/xterm/css/xterm.css";

function ContainerTerminalSession({
  entry,
  containerId,
  name,
}: {
  entry: ServerEntry;
  containerId: string;
  name: string;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const [shell, setShell] = useState<"sh" | "bash">("sh");
  const terminal = useServerTerminal(entry.id, attempt, "container", {
    id: containerId,
    shell,
  });
  const back = `/dashboard/server-metrics/${entry.id}/containers/${containerId}`;
  const exit = useServerSessionExit(
    terminal.status !== "disconnected",
    terminal.disconnect,
    () => navigate(back)
  );
  const status = {
    connecting: messages.servers.sshConnecting,
    connected: messages.servers.sshConnected,
    disconnected: messages.servers.sshDisconnected,
  }[terminal.status];
  useDocumentMeta({
    title: `${name} | ${copy.exec}`,
    description: copy.terminalHelp,
  });
  return (
    <main className="server-monitor-workspace flex h-dvh min-w-0 flex-col bg-background">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b p-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button onClick={exit.requestLeave} size="sm" variant="ghost">
            {copy.backToContainer}
          </Button>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate font-semibold text-sm">{name}</h1>
            <p className="font-mono text-muted-foreground text-xs">
              {entry.host} · {shell}
            </p>
          </div>
          <Badge
            variant={terminal.status === "connected" ? "success" : "secondary"}
          >
            {status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            aria-label={copy.shell}
            onValueChange={(values) => {
              if (values[0] === "sh" || values[0] === "bash") {
                setShell(values[0]);
              }
            }}
            size="sm"
            value={[shell]}
            variant="outline"
          >
            <ToggleGroupItem
              disabled={terminal.status !== "disconnected"}
              value="sh"
            >
              sh
            </ToggleGroupItem>
            <ToggleGroupItem
              disabled={terminal.status !== "disconnected"}
              value="bash"
            >
              bash
            </ToggleGroupItem>
          </ToggleGroup>
          <ButtonGroup aria-label={messages.servers.actions}>
            <Button onClick={terminal.clear} size="sm" variant="outline">
              {messages.servers.sshClearDisplay}
            </Button>
            {terminal.status === "disconnected" ? (
              <Button
                onClick={() => setAttempt((value) => value + 1)}
                size="sm"
                variant="outline"
              >
                {messages.servers.sshReconnect}
              </Button>
            ) : (
              <Button
                onClick={exit.requestDisconnect}
                size="sm"
                variant="outline"
              >
                {messages.servers.sshDisconnect}
              </Button>
            )}
          </ButtonGroup>
        </div>
      </header>
      <ServerSessionExitDialog
        action={exit.action}
        onCancel={exit.cancel}
        onConfirm={exit.confirm}
        serverName={name}
      />
      {terminal.hostKey && (
        <ServerSshHostKeyReview
          onCancel={terminal.disconnect}
          onTrust={terminal.trustHostKey}
          pending={terminal.trustPending}
          review={terminal.hostKey}
        />
      )}
      {terminal.error && (
        <Alert variant="destructive">
          <AlertDescription>{terminal.error}</AlertDescription>
        </Alert>
      )}
      {terminal.status === "disconnected" && !terminal.error && (
        <p className="border-b p-3 text-muted-foreground text-sm">
          {copy.terminalEnded}
        </p>
      )}
      <div className="server-ssh-frame min-h-0 flex-1 overflow-hidden p-3">
        <div
          className="server-ssh-terminal h-full min-w-0"
          ref={terminal.containerRef}
        />
      </div>
      <footer className="shrink-0 border-t px-4 py-2 text-muted-foreground text-xs">
        {copy.terminalHelp}
      </footer>
    </main>
  );
}

export function ServerContainerTerminalPage() {
  const { serverId = "", containerId = "" } = useParams();
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const entry = useQuery({
    queryKey: ["server-inventory", "detail", serverId],
    queryFn: ({ signal }) => fetchServerEntry(serverId, signal),
    retry: false,
    gcTime: 0,
  });
  const detail = useQuery({
    queryKey: [
      "server-inventory",
      "container-detail",
      serverId,
      entry.data?.updatedAt,
      containerId,
    ],
    queryFn: ({ signal }) =>
      fetchServerContainerDetail(serverId, containerId, signal),
    enabled: Boolean(entry.data),
    retry: false,
    gcTime: 0,
  });
  const error = useContainerError(
    detail.data?.status,
    entry.error ?? detail.error
  );
  const credentials = Boolean(entry.data?.hasPassword && entry.data.username);
  if (entry.isPending || (entry.data && detail.isPending)) {
    return (
      <p className="p-6 text-muted-foreground" role="status">
        {messages.servers.sshConnecting}
      </p>
    );
  }
  if (error || !credentials || detail.data?.state !== "running") {
    return (
      <main className="flex flex-col gap-4 p-6">
        <p role="alert">
          {error ||
            (credentials ? copy.invalidState : copy.credentialsRequired)}
        </p>
        <Button
          render={
            <Link
              to={`/dashboard/server-metrics/${serverId}/containers/${containerId}`}
            />
          }
          variant="outline"
        >
          {copy.backToContainer}
        </Button>
      </main>
    );
  }
  return (
    entry.data && (
      <ContainerTerminalSession
        containerId={containerId}
        entry={entry.data}
        key={`${serverId}-${containerId}`}
        name={detail.data.name ?? containerId.slice(0, 12)}
      />
    )
  );
}
