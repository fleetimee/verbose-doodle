import { useState } from "react";
import { Cable, Unplug } from "@/components/hugeicons";
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
import { messages } from "@/lib/i18n";

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
  readonly tourIds?: {
    readonly connection: string;
    readonly sendPanel: string;
    readonly status: string;
  };
};

export function TcpClientPanel({
  bridgeConnected,
  onConnect,
  onDisconnect,
  onSend,
  state,
  tourIds,
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
  const socketMessages = messages.socketTester;

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-5 border-border/70 border-b pb-5">
        <div
          className="flex min-h-10 flex-wrap items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/30 px-3 py-2"
          id={tourIds?.status}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-mono text-sm">
              {state.connected ? endpoint : socketMessages.noActiveConnection}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
            <span
              className={
                state.connected
                  ? "size-1.5 rounded-full bg-success"
                  : "size-1.5 rounded-full bg-muted-foreground"
              }
            />
            {state.connected
              ? socketMessages.connectedStatus
              : socketMessages.disconnectedStatus}
          </span>
        </div>

        <FieldGroup
          className="grid grid-cols-2 items-start"
          id={tourIds?.connection}
          size="compact"
        >
          <Field
            className="col-span-2"
            data-disabled={state.connected}
            data-invalid={!hostIsValid}
          >
            <FieldLabel htmlFor="tcp-client-host">
              {socketMessages.hostLabel}
            </FieldLabel>
            <Input
              aria-invalid={!hostIsValid}
              disabled={state.connected}
              id="tcp-client-host"
              onChange={(event) => setHost(event.target.value)}
              placeholder="127.0.0.1"
              value={host}
            />
          </Field>
          <Field data-disabled={state.connected} data-invalid={!portIsValid}>
            <FieldLabel htmlFor="tcp-client-port">
              {socketMessages.portLabel}
            </FieldLabel>
            <Input
              aria-invalid={!portIsValid}
              disabled={state.connected}
              id="tcp-client-port"
              inputMode="numeric"
              onChange={(event) => setPort(event.target.value)}
              placeholder="8080"
              value={port}
            />
          </Field>
          <div className="flex items-end self-end">
            {state.connected ? (
              <Button
                className="w-full"
                onClick={onDisconnect}
                type="button"
                variant="destructive"
              >
                <Unplug data-icon="inline-start" />
                {socketMessages.disconnectButton}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={!canConnect}
                onClick={() => onConnect(trimmedHost, parsedPort)}
                type="button"
              >
                <Cable data-icon="inline-start" />
                {socketMessages.connectButton}
              </Button>
            )}
          </div>
          <div aria-live="polite" className="col-span-2">
            {!hostIsValid && (
              <FieldDescription>
                {socketMessages.hostRequiredDescription}
              </FieldDescription>
            )}
            {!portIsValid && (
              <FieldDescription>
                {socketMessages.portRangeDescription}
              </FieldDescription>
            )}
          </div>
        </FieldGroup>
      </section>
      <SendPanel
        disabled={!(bridgeConnected && state.connected)}
        onSend={onSend}
        tourId={tourIds?.sendPanel}
      />
    </div>
  );
}
