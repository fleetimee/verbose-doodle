import { RadioTower, Square, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SendPanel } from "@/features/socket-tester/components/send-panel";
import type {
  PayloadFormat,
  TcpServerState,
} from "@/features/socket-tester/types";

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
  const targets = useMemo(
    () =>
      selectedClients.length > 0
        ? selectedClients
        : state.clients.map((client) => client.id),
    [selectedClients, state.clients]
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <section className="grid content-start gap-4 border-border/70 border-b pb-4 xl:border-r xl:border-b-0 xl:pr-4 xl:pb-0">
        <div className="grid gap-3" id={tourIds?.listener}>
          <label className="grid gap-1.5" htmlFor="tcp-server-port">
            <span className="font-medium text-muted-foreground text-xs">
              Listen port
            </span>
            <Input
              id="tcp-server-port"
              inputMode="numeric"
              onChange={(event) => setPort(event.target.value)}
              value={port}
            />
          </label>
          {state.listening ? (
            <Button
              className="gap-2"
              onClick={onStop}
              type="button"
              variant="destructive"
            >
              <Square className="size-4" />
              Stop server
            </Button>
          ) : (
            <Button
              className="gap-2"
              disabled={!(bridgeConnected && Number.isInteger(parsedPort))}
              onClick={() => onStart(parsedPort)}
              type="button"
            >
              <RadioTower className="size-4" />
              Start server
            </Button>
          )}
        </div>
        <div
          className="rounded-md border border-border/70 bg-muted/35 px-3 py-2 font-mono text-xs"
          id={tourIds?.status}
        >
          <span
            className={
              state.listening ? "text-emerald-400" : "text-muted-foreground"
            }
          >
            ●
          </span>{" "}
          {state.listening ? `LISTENING :${state.port}` : "SERVER STOPPED"}
        </div>
        <div className="grid gap-2" id={tourIds?.clients}>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <UsersRound className="size-4" />
            Active clients
          </div>
          <div className="grid max-h-64 gap-2 overflow-auto">
            {state.clients.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-center text-muted-foreground text-xs">
                No TCP clients connected.
              </div>
            ) : (
              state.clients.map((client) => (
                <div
                  className="flex items-center gap-3 rounded-md border border-border/70 bg-background/70 p-3 font-mono text-xs transition-[border-color,background-color,transform] duration-150 ease-out hover:border-primary/25 hover:bg-accent/40 active:scale-[0.997]"
                  key={client.id}
                >
                  <Checkbox
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
