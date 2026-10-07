import { StopCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { RadioReceiver } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendPanel } from "@/features/socket-tester/components/send-panel";
import type {
  PayloadFormat,
  UdpServerState,
} from "@/features/socket-tester/types";
import { formatMessage, messages } from "@/lib/i18n";

type UdpPanelProps = {
  readonly bridgeConnected: boolean;
  readonly state: UdpServerState;
  readonly onSend: (
    host: string,
    port: number,
    data: string,
    format: PayloadFormat
  ) => void;
  readonly onStart: (port: number) => void;
  readonly onStop: () => void;
  readonly tourIds?: {
    readonly listener: string;
    readonly sendPanel: string;
    readonly status: string;
    readonly target: string;
  };
};

export function UdpPanel({
  bridgeConnected,
  onSend,
  onStart,
  onStop,
  state,
  tourIds,
}: UdpPanelProps) {
  const [host, setHost] = useState("127.0.0.1");
  const [targetPort, setTargetPort] = useState("9002");
  const [listenPort, setListenPort] = useState(String(state.port));
  const parsedTargetPort = Number(targetPort);
  const parsedListenPort = Number(listenPort);
  const socketMessages = messages.socketTester;

  return (
    <div className="grid gap-5">
      <section className="grid content-start gap-4 border-border/70 border-b pb-5">
        <div className="grid gap-3">
          <div
            className="grid grid-cols-[minmax(0,1fr)_100px] gap-3"
            id={tourIds?.target}
          >
            <label className="grid gap-1.5" htmlFor="udp-target-host">
              <span className="font-medium text-muted-foreground text-xs">
                {socketMessages.targetHostLabel}
              </span>
              <Input
                id="udp-target-host"
                onChange={(event) => setHost(event.target.value)}
                value={host}
              />
            </label>
            <label className="grid gap-1.5" htmlFor="udp-target-port">
              <span className="font-medium text-muted-foreground text-xs">
                {socketMessages.targetPortLabel}
              </span>
              <Input
                id="udp-target-port"
                inputMode="numeric"
                onChange={(event) => setTargetPort(event.target.value)}
                value={targetPort}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3" id={tourIds?.listener}>
            <label className="grid gap-1.5" htmlFor="udp-listen-port">
              <span className="font-medium text-muted-foreground text-xs">
                {socketMessages.listenPortLabel}
              </span>
              <Input
                id="udp-listen-port"
                inputMode="numeric"
                onChange={(event) => setListenPort(event.target.value)}
                value={listenPort}
              />
            </label>
            <div className="flex min-w-0 items-end">
              {state.listening ? (
                <Button
                  className="w-full"
                  onClick={onStop}
                  size="default"
                  type="button"
                  variant="destructive"
                >
                  <HugeiconsIcon
                    className="size-4"
                    icon={StopCircleIcon}
                    strokeWidth={2}
                  />
                  <span>{socketMessages.stopUdpListenerSrLabel}</span>
                </Button>
              ) : (
                <Button
                  className="w-full"
                  disabled={
                    !(bridgeConnected && Number.isInteger(parsedListenPort))
                  }
                  onClick={() => onStart(parsedListenPort)}
                  size="default"
                  type="button"
                >
                  <RadioReceiver className="size-4" />
                  <span>{socketMessages.startUdpListenerSrLabel}</span>
                </Button>
              )}
            </div>
          </div>
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
            ? formatMessage(socketMessages.udpListeningStatus, {
                port: state.port,
              })
            : socketMessages.udpListenerOffStatus}
        </div>
      </section>
      <div className="grid gap-5">
        <SendPanel
          disabled={
            !bridgeConnected ||
            host.length === 0 ||
            !Number.isInteger(parsedTargetPort)
          }
          onSend={(data, format) =>
            onSend(host, parsedTargetPort, data, format)
          }
          showDelimiter={false}
          tourId={tourIds?.sendPanel}
        />
      </div>
    </div>
  );
}
