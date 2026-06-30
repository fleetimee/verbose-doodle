import {
  Activity,
  Cable,
  CircleAlert,
  Network,
  PlugZap,
  SendHorizontal,
  Unplug,
} from "lucide-react";
import type { Transition } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
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

const pageStyle = { willChange: "opacity, transform" };
const sectionStyle = { willChange: "opacity, transform" };
const traceStyle = { originX: 0, willChange: "opacity, transform" };

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
  const shouldReduceMotion = useReducedMotion();
  const [inspectedEntry, setInspectedEntry] = useState<TrafficLogEntry | null>(
    null
  );
  const bridgeConnected = bridge.bridgeStatus === "connected";
  const copy = socketTestCopy[mode];
  const pageInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.985, y: 18 };
  const pageAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, y: 0 };
  const sectionInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 14 };
  const sectionAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };
  const pageTransition: Transition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.42, ease: "easeOut" };
  const sectionTransition: Transition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.34, ease: "easeOut" };
  const traceInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scaleX: 0 };
  const traceAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: [0, 1, 0.68], scaleX: 1 };
  const metricInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.96, y: 10 };
  const metricAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, y: 0 };

  return (
    <motion.div
      animate={pageAnimate}
      className="mx-auto grid w-full max-w-[1500px] gap-4 md:gap-6"
      initial={pageInitial}
      key={mode}
      style={pageStyle}
      transition={pageTransition}
    >
      <motion.header
        animate={sectionAnimate}
        className="relative grid gap-4 border-border/70 border-b pb-5"
        initial={sectionInitial}
        style={sectionStyle}
        transition={{
          ...sectionTransition,
          delay: shouldReduceMotion ? 0 : 0.05,
        }}
      >
        <motion.div
          animate={traceAnimate}
          aria-hidden="true"
          className="absolute -bottom-px left-0 h-px w-full bg-[linear-gradient(90deg,transparent,hsl(var(--primary)),hsl(var(--foreground)/0.7),transparent)]"
          initial={traceInitial}
          style={traceStyle}
          transition={
            shouldReduceMotion
              ? { duration: 0.01 }
              : { delay: 0.18, duration: 0.72, ease: "easeOut" }
          }
        />
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
          {[
            {
              icon: Network,
              label: "Active",
              value: bridge.metrics.activeConnections,
            },
            {
              icon: Activity,
              label: "Inbound",
              value: bridge.metrics.packetsIn,
            },
            {
              icon: SendHorizontal,
              label: "Outbound",
              value: bridge.metrics.packetsOut,
            },
            {
              icon: CircleAlert,
              label: "Errors",
              value: bridge.metrics.errors,
            },
          ].map((metric, index) => (
            <motion.div
              animate={metricAnimate}
              initial={metricInitial}
              key={metric.label}
              style={sectionStyle}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 32,
                delay: shouldReduceMotion ? 0 : 0.12 + index * 0.045,
              }}
            >
              <SocketStatusCard
                icon={metric.icon}
                label={metric.label}
                value={metric.value}
              />
            </motion.div>
          ))}
        </section>
      </motion.header>

      <motion.section
        animate={sectionAnimate}
        className="overflow-hidden rounded-lg border border-border/70 bg-card p-4 shadow-sm"
        initial={sectionInitial}
        style={sectionStyle}
        transition={{
          ...sectionTransition,
          delay: shouldReduceMotion ? 0 : 0.12,
        }}
      >
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
      </motion.section>

      <motion.div
        animate={sectionAnimate}
        initial={sectionInitial}
        style={sectionStyle}
        transition={{
          ...sectionTransition,
          delay: shouldReduceMotion ? 0 : 0.18,
        }}
      >
        <TrafficConsole
          logs={bridge.logs}
          onClear={bridge.clearLogs}
          onInspect={setInspectedEntry}
        />
      </motion.div>
      <HexInspector
        entry={inspectedEntry}
        onOpenChange={(open) => {
          if (!open) {
            setInspectedEntry(null);
          }
        }}
      />
    </motion.div>
  );
}
