import { Cable, CheckCircle2, CircleOff, Unplug } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
  const trimmedHost = host.trim();
  const parsedPort = Number(port);
  const portIsValid =
    Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65_535;
  const hostIsValid = trimmedHost.length > 0;
  const canConnect =
    bridgeConnected && hostIsValid && portIsValid && !state.connected;
  const endpoint = `${state.host}:${state.port}`;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4 border-border/70 border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/30 px-3 py-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium text-muted-foreground text-xs">
              TCP client status
            </span>
            <span className="truncate font-mono text-sm">
              {state.connected ? endpoint : "No active connection"}
            </span>
          </div>
          <Badge
            className="gap-1.5"
            variant={state.connected ? "default" : "secondary"}
          >
            {state.connected ? (
              <CheckCircle2 data-icon="inline-start" />
            ) : (
              <CircleOff data-icon="inline-start" />
            )}
            {state.connected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        <FieldGroup className="gap-3 md:grid md:grid-cols-[1fr_140px_auto] md:items-start">
          <Field data-disabled={state.connected} data-invalid={!hostIsValid}>
            <FieldLabel htmlFor="tcp-client-host">Host</FieldLabel>
            <Input
              aria-invalid={!hostIsValid}
              disabled={state.connected}
              id="tcp-client-host"
              onChange={(event) => setHost(event.target.value)}
              placeholder="127.0.0.1"
              value={host}
            />
            {hostIsValid ? null : (
              <FieldDescription>
                Enter a hostname or IP address.
              </FieldDescription>
            )}
          </Field>
          <Field data-disabled={state.connected} data-invalid={!portIsValid}>
            <FieldLabel htmlFor="tcp-client-port">Port</FieldLabel>
            <Input
              aria-invalid={!portIsValid}
              disabled={state.connected}
              id="tcp-client-port"
              inputMode="numeric"
              onChange={(event) => setPort(event.target.value)}
              placeholder="8080"
              value={port}
            />
            {portIsValid ? null : (
              <FieldDescription>Use port 1-65535.</FieldDescription>
            )}
          </Field>
          <div className="flex items-end md:pt-6">
            {state.connected ? (
              <Button
                className="w-full md:w-auto"
                onClick={onDisconnect}
                type="button"
                variant="destructive"
              >
                <Unplug data-icon="inline-start" />
                Disconnect
              </Button>
            ) : (
              <Button
                className="w-full md:w-auto"
                disabled={!canConnect}
                onClick={() => onConnect(trimmedHost, parsedPort)}
                type="button"
              >
                <Cable data-icon="inline-start" />
                Connect
              </Button>
            )}
          </div>
        </FieldGroup>
      </section>
      <SendPanel
        disabled={!(bridgeConnected && state.connected)}
        onSend={onSend}
      />
    </div>
  );
}
