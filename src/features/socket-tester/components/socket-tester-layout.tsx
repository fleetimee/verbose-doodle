import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Transition } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Cable,
  CircleAlert,
  Network,
  SendHorizontal,
  Unplug,
} from "@/components/hugeicons";
import { type TourStep, useTour } from "@/components/tour";
import { Button } from "@/components/ui/button";
import { HexInspector } from "@/features/socket-tester/components/hex-inspector";
import { SocketStatusCard } from "@/features/socket-tester/components/socket-status-card";
import { TcpClientPanel } from "@/features/socket-tester/components/tcp-client-panel";
import { TcpServerPanel } from "@/features/socket-tester/components/tcp-server-panel";
import { TrafficConsole } from "@/features/socket-tester/components/traffic-console";
import { UdpPanel } from "@/features/socket-tester/components/udp-panel";
import { useSocketBridgeContext } from "@/features/socket-tester/context/socket-bridge-context";
import type { TrafficLogEntry } from "@/features/socket-tester/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { messages } from "@/lib/i18n";

type SocketTestMode = "tcp-client" | "tcp-server" | "udp";

const pageStyle = { willChange: "opacity, transform" };
const sectionStyle = { willChange: "opacity, transform" };
const traceStyle = { originX: 0, willChange: "opacity, transform" };
const SOCKET_TEST_TOUR_DELAY_MS = 350;

const socketTestCopy: Record<
  SocketTestMode,
  {
    readonly description: string;
    readonly title: string;
  }
> = {
  "tcp-client": {
    description:
      "Connect to a TCP endpoint through the backend bridge, send payloads, and inspect response bytes.",
    title: "TCP Client",
  },
  "tcp-server": {
    description:
      "Start a local TCP listener through the backend bridge, track connected clients, and send server responses.",
    title: "TCP Server",
  },
  udp: {
    description:
      "Send UDP datagrams and optionally listen for inbound packets with shared packet logs and byte inspection.",
    title: "UDP",
  },
};

const SOCKET_TEST_TOUR_CONFIG = {
  "tcp-client": {
    storageKey: "socket-test-tcp-client-tour-seen",
    targets: {
      connection: "socket-test-tcp-client-tour-connection",
      header: "socket-test-tcp-client-tour-header",
      metrics: "socket-test-tcp-client-tour-metrics",
      modePanel: "socket-test-tcp-client-tour-mode-panel",
      sendPanel: "socket-test-tcp-client-tour-send-panel",
      status: "socket-test-tcp-client-tour-status",
      trafficConsole: "socket-test-tcp-client-tour-traffic-console",
    },
    tourId: "socket-test-tcp-client-intro",
  },
  "tcp-server": {
    storageKey: "socket-test-tcp-server-tour-seen",
    targets: {
      clients: "socket-test-tcp-server-tour-clients",
      header: "socket-test-tcp-server-tour-header",
      listener: "socket-test-tcp-server-tour-listener",
      metrics: "socket-test-tcp-server-tour-metrics",
      modePanel: "socket-test-tcp-server-tour-mode-panel",
      sendPanel: "socket-test-tcp-server-tour-send-panel",
      status: "socket-test-tcp-server-tour-status",
      trafficConsole: "socket-test-tcp-server-tour-traffic-console",
    },
    tourId: "socket-test-tcp-server-intro",
  },
  udp: {
    storageKey: "socket-test-udp-tour-seen",
    targets: {
      header: "socket-test-udp-tour-header",
      listener: "socket-test-udp-tour-listener",
      metrics: "socket-test-udp-tour-metrics",
      modePanel: "socket-test-udp-tour-mode-panel",
      sendPanel: "socket-test-udp-tour-send-panel",
      status: "socket-test-udp-tour-status",
      target: "socket-test-udp-tour-target",
      trafficConsole: "socket-test-udp-tour-traffic-console",
    },
    tourId: "socket-test-udp-intro",
  },
} as const;

function TourStepContent({
  description,
  title,
}: {
  readonly description: string;
  readonly title: string;
}) {
  return (
    <div className="flex flex-col gap-2 pr-10">
      <h2 className="font-semibold text-base">{title}</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

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
  const tourConfig = SOCKET_TEST_TOUR_CONFIG[mode];
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(
    tourConfig.storageKey,
    false
  );
  const hasAutoStartedTour = useRef(false);
  const shouldMarkTourSeenOnEnd = useRef(false);
  const { activeTourId, isActive, setSteps, startTour } = useTour();
  const tourCopy = messages.socketTester.tour;
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
  const tourSteps = useMemo<TourStep[]>(() => {
    const sharedSteps: TourStep[] = [
      {
        content: (
          <TourStepContent
            description={tourCopy.shared.headerDescription}
            title={tourCopy.shared.headerTitle}
          />
        ),
        position: "bottom",
        selectorId: tourConfig.targets.header,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.shared.metricsDescription}
            title={tourCopy.shared.metricsTitle}
          />
        ),
        position: "bottom",
        selectorId: tourConfig.targets.metrics,
      },
    ];

    const trafficStep: TourStep = {
      content: (
        <TourStepContent
          description={tourCopy.shared.trafficConsoleDescription}
          title={tourCopy.shared.trafficConsoleTitle}
        />
      ),
      position: "top",
      selectorId: tourConfig.targets.trafficConsole,
    };

    if (mode === "tcp-client") {
      const tcpClientTargets = SOCKET_TEST_TOUR_CONFIG["tcp-client"].targets;

      return [
        ...sharedSteps,
        {
          content: (
            <TourStepContent
              description={tourCopy.tcpClient.statusDescription}
              title={tourCopy.tcpClient.statusTitle}
            />
          ),
          position: "bottom",
          selectorId: tcpClientTargets.status,
        },
        {
          content: (
            <TourStepContent
              description={tourCopy.tcpClient.connectionDescription}
              title={tourCopy.tcpClient.connectionTitle}
            />
          ),
          position: "top",
          selectorId: tcpClientTargets.connection,
        },
        {
          content: (
            <TourStepContent
              description={tourCopy.shared.sendPanelDescription}
              title={tourCopy.shared.sendPanelTitle}
            />
          ),
          position: "left",
          selectorId: tcpClientTargets.sendPanel,
        },
        trafficStep,
      ];
    }

    if (mode === "tcp-server") {
      const tcpServerTargets = SOCKET_TEST_TOUR_CONFIG["tcp-server"].targets;

      return [
        ...sharedSteps,
        {
          content: (
            <TourStepContent
              description={tourCopy.tcpServer.listenerDescription}
              title={tourCopy.tcpServer.listenerTitle}
            />
          ),
          position: "right",
          selectorId: tcpServerTargets.listener,
        },
        {
          content: (
            <TourStepContent
              description={tourCopy.tcpServer.statusDescription}
              title={tourCopy.tcpServer.statusTitle}
            />
          ),
          position: "right",
          selectorId: tcpServerTargets.status,
        },
        {
          content: (
            <TourStepContent
              description={tourCopy.tcpServer.clientsDescription}
              title={tourCopy.tcpServer.clientsTitle}
            />
          ),
          position: "right",
          selectorId: tcpServerTargets.clients,
        },
        {
          content: (
            <TourStepContent
              description={tourCopy.shared.sendPanelDescription}
              title={tourCopy.shared.sendPanelTitle}
            />
          ),
          position: "left",
          selectorId: tcpServerTargets.sendPanel,
        },
        trafficStep,
      ];
    }

    const udpTargets = SOCKET_TEST_TOUR_CONFIG.udp.targets;

    return [
      ...sharedSteps,
      {
        content: (
          <TourStepContent
            description={tourCopy.udp.targetDescription}
            title={tourCopy.udp.targetTitle}
          />
        ),
        position: "right",
        selectorId: udpTargets.target,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.udp.listenerDescription}
            title={tourCopy.udp.listenerTitle}
          />
        ),
        position: "right",
        selectorId: udpTargets.listener,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.udp.statusDescription}
            title={tourCopy.udp.statusTitle}
          />
        ),
        position: "right",
        selectorId: udpTargets.status,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.shared.sendPanelDescription}
            title={tourCopy.shared.sendPanelTitle}
          />
        ),
        position: "left",
        selectorId: udpTargets.sendPanel,
      },
      trafficStep,
    ];
  }, [mode, tourConfig.targets, tourCopy]);

  const handleStartTour = useCallback(() => {
    setSteps(tourSteps);
    startTour(tourConfig.tourId);
  }, [setSteps, startTour, tourConfig.tourId, tourSteps]);

  useEffect(() => {
    if (hasSeenTour || hasAutoStartedTour.current || tourSteps.length === 0) {
      return;
    }

    hasAutoStartedTour.current = true;

    const timeoutId = window.setTimeout(() => {
      shouldMarkTourSeenOnEnd.current = true;
      handleStartTour();
    }, SOCKET_TEST_TOUR_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [handleStartTour, hasSeenTour, tourSteps.length]);

  useEffect(() => {
    if (
      shouldMarkTourSeenOnEnd.current &&
      activeTourId === tourConfig.tourId &&
      !isActive
    ) {
      shouldMarkTourSeenOnEnd.current = false;
      setHasSeenTour(true);
    }
  }, [activeTourId, isActive, setHasSeenTour, tourConfig.tourId]);

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
        id={tourConfig.targets.header}
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
            <h1 className="font-bold text-3xl tracking-tight">{copy.title}</h1>
            <p className="mt-3 max-w-[72ch] text-muted-foreground text-sm leading-relaxed md:text-base">
              {copy.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button
              className="gap-2"
              onClick={handleStartTour}
              type="button"
              variant="outline"
            >
              <HugeiconsIcon
                data-icon="inline-start"
                icon={HelpCircleIcon}
                strokeWidth={2}
              />
              {tourCopy.startButton}
            </Button>
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
        <section
          className="flex flex-wrap gap-2"
          id={tourConfig.targets.metrics}
        >
          {[
            {
              icon: Network,
              label: messages.socketTester.activeMetric,
              value: bridge.metrics.activeConnections,
            },
            {
              icon: Activity,
              label: messages.socketTester.inboundMetric,
              value: bridge.metrics.packetsIn,
            },
            {
              icon: SendHorizontal,
              label: messages.socketTester.outboundMetric,
              value: bridge.metrics.packetsOut,
            },
            {
              icon: CircleAlert,
              label: messages.socketTester.errorsMetric,
              value: bridge.metrics.errors,
            },
          ].map((metric, index) => (
            <motion.div
              animate={metricAnimate}
              initial={metricInitial}
              key={metric.label}
              style={sectionStyle}
              transition={{
                damping: 32,
                delay: shouldReduceMotion ? 0 : 0.12 + index * 0.045,
                stiffness: 420,
                type: "spring",
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
        id={tourConfig.targets.modePanel}
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
            tourIds={{
              connection:
                SOCKET_TEST_TOUR_CONFIG["tcp-client"].targets.connection,
              sendPanel:
                SOCKET_TEST_TOUR_CONFIG["tcp-client"].targets.sendPanel,
              status: SOCKET_TEST_TOUR_CONFIG["tcp-client"].targets.status,
            }}
          />
        ) : null}
        {mode === "tcp-server" ? (
          <TcpServerPanel
            bridgeConnected={bridgeConnected}
            onSend={bridge.sendTcpServer}
            onStart={bridge.startTcpServer}
            onStop={bridge.stopTcpServer}
            state={bridge.tcpServer}
            tourIds={{
              clients: SOCKET_TEST_TOUR_CONFIG["tcp-server"].targets.clients,
              listener: SOCKET_TEST_TOUR_CONFIG["tcp-server"].targets.listener,
              sendPanel:
                SOCKET_TEST_TOUR_CONFIG["tcp-server"].targets.sendPanel,
              status: SOCKET_TEST_TOUR_CONFIG["tcp-server"].targets.status,
            }}
          />
        ) : null}
        {mode === "udp" ? (
          <UdpPanel
            bridgeConnected={bridgeConnected}
            onSend={bridge.sendUdp}
            onStart={bridge.startUdpServer}
            onStop={bridge.stopUdpServer}
            state={bridge.udpServer}
            tourIds={{
              listener: SOCKET_TEST_TOUR_CONFIG.udp.targets.listener,
              sendPanel: SOCKET_TEST_TOUR_CONFIG.udp.targets.sendPanel,
              status: SOCKET_TEST_TOUR_CONFIG.udp.targets.status,
              target: SOCKET_TEST_TOUR_CONFIG.udp.targets.target,
            }}
          />
        ) : null}
      </motion.section>

      <motion.div
        animate={sectionAnimate}
        className="min-w-0"
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
          tourId={tourConfig.targets.trafficConsole}
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
