import { Cable, Unplug } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendPanel } from "@/features/socket-tester/components/send-panel";
import type {
  PayloadFormat,
  TcpClientState,
} from "@/features/socket-tester/types";

type TcpClientPanelProps = {
  readonly bridgeConnected: boolean;
  readonly state: TcpClientState;
  readonly onConnect: (host: string, port: number) => void;
  readonly onDisconnect: () => void;
  readonly onSend: (
    data: string,
    format: PayloadFormat,
    delimiter: "\r\n" | "\n" | ""
  ) => void;
};

export function TcpClientPanel({
  bridgeConnected,
  onConnect,
  onDisconnect,
  onSend,
  state,
}: TcpClientPanelProps) {
  const [host, setHost] = useState(state.host);
  const [port, setPort] = useState(String(state.port));
  const parsedPort = Number(port);
  const canConnect =
    bridgeConnected && host.length > 0 && Number.isInteger(parsedPort);

  return (
    <div className="grid gap-4">
      <section className="grid gap-4 border-border/70 border-b pb-4">
        <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
          <label className="grid gap-1.5" htmlFor="tcp-client-host">
            <span className="font-medium text-muted-foreground text-xs">
              Host
            </span>
            <Input
              id="tcp-client-host"
              onChange={(event) => setHost(event.target.value)}
              placeholder="127.0.0.1"
              value={host}
            />
          </label>
          <label className="grid gap-1.5" htmlFor="tcp-client-port">
            <span className="font-medium text-muted-foreground text-xs">
              Port
            </span>
            <Input
              id="tcp-client-port"
              inputMode="numeric"
              onChange={(event) => setPort(event.target.value)}
              placeholder="8080"
              value={port}
            />
          </label>
          <div className="flex items-end">
            {state.connected ? (
              <Button
                className="w-full gap-2 md:w-auto"
                onClick={onDisconnect}
                type="button"
                variant="destructive"
              >
                <Unplug className="size-4" />
                Disconnect
              </Button>
            ) : (
              <Button
                className="w-full gap-2 md:w-auto"
                disabled={!canConnect}
                onClick={() => onConnect(host, parsedPort)}
                type="button"
              >
                <Cable className="size-4" />
                Connect
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-md border border-border/70 bg-muted/35 px-3 py-2 font-mono text-xs">
          <span
            className={
              state.connected ? "text-emerald-400" : "text-muted-foreground"
            }
          >
            ●
          </span>{" "}
          {state.connected
            ? `CONNECTED ${state.host}:${state.port}`
            : "DISCONNECTED"}
        </div>
      </section>
      <SendPanel
        disabled={!(bridgeConnected && state.connected)}
        onSend={onSend}
      />
    </div>
  );
}
