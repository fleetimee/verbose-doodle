import { StopCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { RadioTower, UsersRound } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SendPanel } from "@/features/socket-tester/components/send-panel";
import type {
  PayloadFormat,
  TcpServerState,
} from "@/features/socket-tester/types";
import { formatMessage, messages } from "@/lib/i18n";

type TcpServerPanelProps = {
  readonly bridgeConnected: boolean;
  readonly state: TcpServerState;
  readonly onSend: (
    clientId: string,
    data: string,
    format: PayloadFormat,
    delimiter: "\r\n" | "\n" | ""
  ) => void;
  readonly onStart: (port: number) => void;
  readonly onStop: () => void;
  readonly tourIds?: {
    readonly clients: string;
    readonly listener: string;
    readonly sendPanel: string;
    readonly status: string;
  };
};

export function TcpServerPanel({
  bridgeConnected,
  onSend,
  onStart,
  onStop,
  state,
  tourIds,
}: TcpServerPanelProps) {
  const [port, setPort] = useState(String(state.port));
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const parsedPort = Number(port);
  const socketMessages = messages.socketTester;
  const targets = useMemo(
    () =>
      selectedClients.length > 0
        ? selectedClients
        : state.clients.map((client) => client.id),
    [selectedClients, state.clients]
  );

  return (
    <div className="grid gap-5">
      <section className="grid content-start gap-4 border-border/70 border-b pb-5">
        <div
          className="grid grid-cols-2 items-end gap-3"
          id={tourIds?.listener}
        >
          <div className="grid gap-1.5">
            <label className="grid gap-1.5" htmlFor="tcp-server-port">
              <span className="font-medium text-muted-foreground text-xs">
                {socketMessages.listenPortLabel}
              </span>
              <Input
                id="tcp-server-port"
                inputMode="numeric"
                onChange={(event) => setPort(event.target.value)}
                title={socketMessages.tcpServerPortDescription}
                value={port}
              />
            </label>
          </div>
          {state.listening ? (
            <Button
              className="w-full"
              onClick={onStop}
              type="button"
              variant="destructive"
            >
              <HugeiconsIcon
                className="size-4"
                icon={StopCircleIcon}
                strokeWidth={2}
              />
              {socketMessages.stopServerButton}
            </Button>
          ) : (
            <Button
              className="w-full"
              disabled={!(bridgeConnected && Number.isInteger(parsedPort))}
              onClick={() => onStart(parsedPort)}
              type="button"
            >
              <RadioTower className="size-4" />
              {socketMessages.startServerButton}
            </Button>
          )}
        </div>
        <div
          className="flex min-h-10 items-center gap-2 rounded-md border border-border/70 bg-muted/30 px-3 py-2 font-mono text-xs"
          id={tourIds?.status}
        >
          <span
            aria-hidden="true"
            className={
              state.listening
                ? "size-1.5 shrink-0 rounded-full bg-success"
                : "size-1.5 shrink-0 rounded-full bg-muted-foreground"
            }
          />
          {state.listening
            ? formatMessage(socketMessages.tcpServerListeningStatus, {
                port: state.port,
              })
            : socketMessages.tcpServerStoppedStatus}
        </div>
        <div className="grid gap-2" id={tourIds?.clients}>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <UsersRound className="size-4" />
            {socketMessages.activeClients}
          </div>
          <div className="grid max-h-24 gap-2 overflow-auto">
            {state.clients.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-center text-muted-foreground text-xs">
                {socketMessages.noTcpClients}
              </div>
            ) : (
              state.clients.map((client) => (
                <div
                  className="flex items-center gap-3 rounded-md border border-border/70 bg-background/70 px-3 py-2 font-mono text-xs transition-colors hover:bg-accent/40"
                  key={client.id}
                >
                  <Checkbox
                    aria-label={client.address}
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={(checked) => {
                      setSelectedClients((current) =>
                        checked
                          ? [...current, client.id]
                          : current.filter((id) => id !== client.id)
                      );
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {client.address}
                  </span>
                  <span className="text-muted-foreground">
                    {client.connectedAt}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <SendPanel
        disabled={!(bridgeConnected && state.listening) || targets.length === 0}
        onSend={(data, format, delimiter) => {
          for (const clientId of targets) {
            onSend(clientId, data, format, delimiter);
          }
        }}
        tourId={tourIds?.sendPanel}
      />
    </div>
  );
}
