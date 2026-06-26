import {
  Activity,
  Cable,
  CircleAlert,
  Network,
  PlugZap,
  SendHorizontal,
  Unplug,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HexInspector } from "@/features/socket-tester/components/hex-inspector";
import { SocketStatusCard } from "@/features/socket-tester/components/socket-status-card";
import { TcpClientPanel } from "@/features/socket-tester/components/tcp-client-panel";
import { TcpServerPanel } from "@/features/socket-tester/components/tcp-server-panel";
import { TrafficConsole } from "@/features/socket-tester/components/traffic-console";
import { UdpPanel } from "@/features/socket-tester/components/udp-panel";
import { useSocketBridgeContext } from "@/features/socket-tester/context/socket-bridge-context";
import type { TrafficLogEntry } from "@/features/socket-tester/types";

type SocketTestMode = "tcp-client" | "tcp-server" | "udp";

const socketTestCopy: Record<
  SocketTestMode,
  {
    readonly description: string;
    readonly title: string;
  }
> = {
  "tcp-client": {
    title: "TCP Client",
    description:
      "Connect to a TCP endpoint through the backend bridge, send payloads, and inspect response bytes.",
  },
  "tcp-server": {
    title: "TCP Server",
    description:
      "Start a local TCP listener through the backend bridge, track connected clients, and send server responses.",
  },
  udp: {
    title: "UDP",
    description:
      "Send UDP datagrams and optionally listen for inbound packets with shared packet logs and byte inspection.",
  },
};

export function SocketTesterLayout({
  mode,
}: {
  readonly mode: SocketTestMode;
}) {
  const bridge = useSocketBridgeContext();
  const [inspectedEntry, setInspectedEntry] = useState<TrafficLogEntry | null>(
    null
  );
  const bridgeConnected = bridge.bridgeStatus === "connected";
  const copy = socketTestCopy[mode];

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-4 md:gap-6">
      <header className="grid gap-4 border-border/70 border-b pb-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                className="gap-1.5 border-border/70 bg-muted/35 text-muted-foreground"
                variant="outline"
              >
                <PlugZap className="size-3" />
                WebSocket Bridge
              </Badge>
              <span className="rounded-md border border-border/70 bg-muted/35 px-2.5 py-0.5 font-medium text-muted-foreground text-xs">
                {bridge.bridgeStatus}
              </span>
            </div>
            <h1 className="font-bold text-3xl tracking-tight">{copy.title}</h1>
            <p className="mt-3 max-w-[72ch] text-muted-foreground text-sm leading-relaxed md:text-base">
              {copy.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {bridgeConnected ? (
              <Button
                className="gap-2"
                onClick={bridge.disconnectBridge}
                type="button"
                variant="outline"
              >
                <Unplug className="size-4" />
                Disconnect bridge
              </Button>
            ) : (
              <Button
                className="gap-2"
                disabled={bridge.bridgeStatus === "connecting"}
                onClick={bridge.connectBridge}
                type="button"
              >
                <Cable className="size-4" />
                Connect bridge
              </Button>
            )}
          </div>
        </div>
        <section className="flex flex-wrap gap-2">
          <SocketStatusCard
            icon={Network}
            label="Active"
            value={bridge.metrics.activeConnections}
          />
          <SocketStatusCard
            icon={Activity}
            label="Inbound"
            value={bridge.metrics.packetsIn}
          />
          <SocketStatusCard
            icon={SendHorizontal}
            label="Outbound"
            value={bridge.metrics.packetsOut}
          />
          <SocketStatusCard
            icon={CircleAlert}
            label="Errors"
            value={bridge.metrics.errors}
          />
        </section>
      </header>

      <section className="overflow-hidden rounded-lg border border-border/70 bg-card p-4 shadow-sm">
        {mode === "tcp-client" ? (
          <TcpClientPanel
            bridgeConnected={bridgeConnected}
            onConnect={bridge.connectTcpClient}
            onDisconnect={bridge.disconnectTcpClient}
            onSend={bridge.sendTcpClient}
            state={bridge.tcpClient}
          />
        ) : null}
        {mode === "tcp-server" ? (
          <TcpServerPanel
            bridgeConnected={bridgeConnected}
            onSend={bridge.sendTcpServer}
            onStart={bridge.startTcpServer}
            onStop={bridge.stopTcpServer}
            state={bridge.tcpServer}
          />
        ) : null}
        {mode === "udp" ? (
          <UdpPanel
            bridgeConnected={bridgeConnected}
            onSend={bridge.sendUdp}
            onStart={bridge.startUdpServer}
            onStop={bridge.stopUdpServer}
            state={bridge.udpServer}
          />
        ) : null}
      </section>

      <TrafficConsole
        logs={bridge.logs}
        onClear={bridge.clearLogs}
        onInspect={setInspectedEntry}
      />
      <HexInspector
        entry={inspectedEntry}
        onOpenChange={(open) => {
          if (!open) {
            setInspectedEntry(null);
          }
        }}
      />
    </div>
  );
}
