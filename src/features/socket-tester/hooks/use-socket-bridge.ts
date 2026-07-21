import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  buildTicketWebSocketUrl,
  createRealtimeTicket,
} from "@/features/realtime/ticket-client";
import {
  SocketBridgeEngine,
  parseBridgeEvent,
} from "@/features/socket-tester/engine/socket-bridge-engine";
import type {
  PayloadFormat,
  SocketCommand,
  TrafficLogEntry,
} from "@/features/socket-tester/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { messages } from "@/lib/i18n";

function getBridgeUrl(ticket: string) {
  const host =
    typeof window !== "undefined" && window.location.host
      ? window.location.host
      : "localhost:8080";
  const protocol =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss:"
      : "ws:";
  const configuredUrl =
    (import.meta.env.VITE_SOCKET_TEST_WS_URL as string | undefined) ||
    `${protocol}//${host}/api/socket-test`;
  return buildTicketWebSocketUrl("/api/socket-test", ticket, configuredUrl);
}

export function useSocketBridge() {
  const engineRef = useRef<SocketBridgeEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new SocketBridgeEngine();
  }
  const engine = engineRef.current;

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const manualDisconnectRef = useRef(false);
  const connectionAttemptRef = useRef(0);
  const autoConnectRef = useRef(true);

  const [reconnectAttempt, setReconnectAttempt] = useState(0);
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

  const sendCommand = useCallback(
    (command: SocketCommand) => {
      if (socketRef.current?.readyState !== WebSocket.OPEN) {
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

      socketRef.current.send(JSON.stringify(command));
      return true;
    },
    [engine]
  );

  const connectBridge = useCallback(async () => {
    manualDisconnectRef.current = false;
    setBridgeAutoConnect(true);

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    engine.setBridgeStatus("connecting");
    const attempt = connectionAttemptRef.current + 1;
    connectionAttemptRef.current = attempt;
    let ticket: string;

    try {
      ticket = (await createRealtimeTicket("socket-test")).ticket;
    } catch (error) {
      if (connectionAttemptRef.current === attempt) {
        engine.setBridgeStatus("disconnected");
        engine.appendLog({
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString(),
          direction: "err",
          protocol: "tcp-client",
          scope: "bridge",
          data: "Could not authorize WebSocket bridge",
          format: "text",
          metadata: { error: String(error) },
        });
        if (autoConnectRef.current && !manualDisconnectRef.current) {
          setReconnectAttempt((current) => current + 1);
        }
      }
      return;
    }

    if (
      connectionAttemptRef.current !== attempt ||
      manualDisconnectRef.current
    ) {
      return;
    }

    const url = getBridgeUrl(ticket);
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      engine.setBridgeStatus("connected");
      engine.appendSystemLog("Bridge connected", { url });
    });

    socket.addEventListener("message", (message) => {
      const event = parseBridgeEvent(String(message.data));
      engine.handleBridgeEvent(event);
    });

    socket.addEventListener("error", () => {
      engine.appendLog({
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString(),
        direction: "err",
        protocol: "tcp-client",
        scope: "bridge",
        data: "WebSocket bridge error",
        format: "text",
      });
      if (!autoConnectRef.current) {
        toast.error(messages.socketTester.bridgeConnectionFailed);
      }
    });

    socket.addEventListener("close", () => {
      engine.resetOnClose();
      if (autoConnectRef.current && !manualDisconnectRef.current) {
        setReconnectAttempt((current) => current + 1);
      }
    });
  }, [engine, setBridgeAutoConnect]);

  const disconnectBridge = useCallback(() => {
    manualDisconnectRef.current = true;
    connectionAttemptRef.current += 1;
    setBridgeAutoConnect(false);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    socketRef.current?.close();
    socketRef.current = null;
  }, [setBridgeAutoConnect]);

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

  useEffect(
    () => () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      connectionAttemptRef.current += 1;
      socketRef.current?.close();
    },
    []
  );

  useEffect(() => {
    autoConnectRef.current = bridgeAutoConnect;
  }, [bridgeAutoConnect]);

  useEffect(() => {
    if (bridgeAutoConnect && engineState.bridgeStatus === "disconnected") {
      reconnectTimeoutRef.current = setTimeout(
        async () => {
          await connectBridge();
        },
        reconnectAttempt === 0 ? 0 : 2000
      );
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [bridgeAutoConnect, engineState.bridgeStatus, connectBridge, reconnectAttempt]);

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
