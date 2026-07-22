import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createRealtimeTicket } from "@/features/realtime/ticket-client";
import {
  createTicketedRealtimeConnection,
  type TicketedRealtimeConnection,
  type TicketedRealtimeConnectionSnapshot,
} from "@/features/realtime/ticketed-realtime-connection";
import {
  parseBridgeEvent,
  SocketBridgeEngine,
} from "@/features/socket-tester/engine/socket-bridge-engine";
import type {
  BridgeStatus,
  PayloadFormat,
  SocketCommand,
  TrafficLogEntry,
} from "@/features/socket-tester/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { messages } from "@/lib/i18n";

function appendBridgeError(
  engine: SocketBridgeEngine,
  message: string,
  error?: unknown
) {
  engine.appendLog({
    id: crypto.randomUUID(),
    timestamp: new Date().toLocaleTimeString(),
    direction: "err",
    protocol: "tcp-client",
    scope: "bridge",
    data: message,
    format: "text",
    ...(error === undefined ? {} : { metadata: { error: String(error) } }),
  });
}

function mapConnectionStatus(
  snapshot: TicketedRealtimeConnectionSnapshot
): BridgeStatus {
  if (snapshot.status === "connected") {
    return "connected";
  }
  if (snapshot.status === "connecting" || snapshot.status === "reconnecting") {
    return "connecting";
  }
  return "disconnected";
}

export function useSocketBridge() {
  const engineRef = useRef<SocketBridgeEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SocketBridgeEngine();
  }
  const engine = engineRef.current;

  const autoConnectRef = useRef(true);
  const connectionRef = useRef<TicketedRealtimeConnection | null>(null);
  if (!connectionRef.current) {
    connectionRef.current = createTicketedRealtimeConnection({
      acquireTicket: () => createRealtimeTicket("socket-test"),
      configuredUrl: import.meta.env.VITE_SOCKET_TEST_WS_URL,
      onError: (error) => {
        appendBridgeError(engine, "WebSocket bridge error", error);
        if (!autoConnectRef.current) {
          toast.error(messages.socketTester.bridgeConnectionFailed);
        }
      },
      onMessage: (data) => {
        engine.handleBridgeEvent(parseBridgeEvent(String(data)));
      },
      onTicketError: (error) => {
        appendBridgeError(
          engine,
          "Could not authorize WebSocket bridge",
          error
        );
      },
      path: "/api/socket-test",
    });
  }
  const connection = connectionRef.current;

  const [bridgeAutoConnect, setBridgeAutoConnect] = useLocalStorage(
    "socket-tester-bridge-auto-connect",
    true
  );

  // Sync engine state to React state
  const [engineState, setEngineState] = useState(() => engine.getState());

  useEffect(() => {
    const unsubscribe = engine.subscribe(() => {
      setEngineState(engine.getState());
    });

    const unsubscribeToast = engine.onToast((event) => {
      if (event.type === "success") {
        toast.success(event.title, { description: event.description });
      } else {
        toast.error(event.title, { description: event.description });
      }
    });

    return () => {
      unsubscribe();
      unsubscribeToast();
    };
  }, [engine]);

  useEffect(() => {
    let previousStatus = connection.getSnapshot().status;
    const unsubscribe = connection.subscribe((snapshot) => {
      const connectionLost =
        previousStatus === "connected" && snapshot.status !== "connected";
      if (connectionLost || snapshot.status === "disconnected") {
        engine.resetOnClose();
      }
      engine.setBridgeStatus(mapConnectionStatus(snapshot));
      if (snapshot.status === "connected") {
        engine.appendSystemLog("Bridge connected", { url: snapshot.url });
      }
      previousStatus = snapshot.status;
    });

    return () => {
      unsubscribe();
      connection.disconnect();
    };
  }, [connection, engine]);

  const sendCommand = useCallback(
    (command: SocketCommand) => {
      if (!connection.send(JSON.stringify(command))) {
        toast.error(messages.socketTester.bridgeConnectFirstError);
        engine.appendLog({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          direction: "err",
          protocol: "tcp-client",
          scope: "bridge",
          data: "Command rejected: bridge is offline",
          format: "text",
          metadata: { command },
        });
        return false;
      }

      return true;
    },
    [connection, engine]
  );

  const connectBridge = useCallback(async () => {
    autoConnectRef.current = true;
    setBridgeAutoConnect(true);
    await connection.connect();
  }, [connection, setBridgeAutoConnect]);

  const disconnectBridge = useCallback(() => {
    autoConnectRef.current = false;
    setBridgeAutoConnect(false);
    connection.disconnect();
  }, [connection, setBridgeAutoConnect]);

  const connectTcpClient = useCallback(
    (host: string, port: number) => {
      const command = engine.prepareConnectTcpClient(host, port);
      if (!sendCommand(command)) {
        // Discard pending state if send failed
        engine.prepareDisconnectTcpClient();
      }
    },
    [engine, sendCommand]
  );

  const disconnectTcpClient = useCallback(() => {
    const command = engine.prepareDisconnectTcpClient();
    sendCommand(command);
  }, [engine, sendCommand]);

  const sendTcpClient = useCallback(
    (data: string, format: PayloadFormat, delimiter: "\r\n" | "\n" | "") => {
      const command = engine.prepareSendTcpClient(data, format, delimiter);
      sendCommand(command);
    },
    [engine, sendCommand]
  );

  const startTcpServer = useCallback(
    (port: number) => {
      const command = engine.prepareStartTcpServer(port);
      sendCommand(command);
    },
    [engine, sendCommand]
  );

  const stopTcpServer = useCallback(() => {
    const command = engine.prepareStopTcpServer();
    sendCommand(command);
  }, [engine, sendCommand]);

  const sendTcpServer = useCallback(
    (
      clientId: string,
      data: string,
      format: PayloadFormat,
      delimiter: "\r\n" | "\n" | ""
    ) => {
      const command = engine.prepareSendTcpServer(
        clientId,
        data,
        format,
        delimiter
      );
      sendCommand(command);
    },
    [engine, sendCommand]
  );

  const startUdpServer = useCallback(
    (port: number) => {
      const command = engine.prepareStartUdpServer(port);
      sendCommand(command);
    },
    [engine, sendCommand]
  );

  const stopUdpServer = useCallback(() => {
    const command = engine.prepareStopUdpServer();
    sendCommand(command);
  }, [engine, sendCommand]);

  const sendUdp = useCallback(
    (host: string, port: number, data: string, format: PayloadFormat) => {
      const command = engine.prepareSendUdp(host, port, data, format);
      sendCommand(command);
    },
    [engine, sendCommand]
  );

  const clearLogs = useCallback(() => {
    engine.clearLogs();
  }, [engine]);

  useEffect(() => {
    autoConnectRef.current = bridgeAutoConnect;
  }, [bridgeAutoConnect]);

  useEffect(() => {
    const connectionStatus = connection.getSnapshot().status;
    if (
      bridgeAutoConnect &&
      autoConnectRef.current &&
      (connectionStatus === "idle" || connectionStatus === "disconnected")
    ) {
      connection.connect().catch((error: unknown) => {
        appendBridgeError(engine, "WebSocket bridge error", error);
      });
    }
  }, [bridgeAutoConnect, connection, engine]);

  return {
    bridgeAutoConnect,
    bridgeStatus: engineState.bridgeStatus,
    clearLogs,
    connectBridge,
    connectTcpClient,
    disconnectBridge,
    disconnectTcpClient,
    logs: engineState.logs as TrafficLogEntry[],
    metrics: engineState.metrics,
    sendTcpClient,
    sendTcpServer,
    sendUdp,
    startTcpServer,
    startUdpServer,
    stopTcpServer,
    stopUdpServer,
    tcpClient: engineState.tcpClient,
    tcpServer: engineState.tcpServer,
    udpServer: engineState.udpServer,
  };
}
