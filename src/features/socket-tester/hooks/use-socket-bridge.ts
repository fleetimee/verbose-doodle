import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  BridgeEvent,
  BridgeStatus,
  PayloadFormat,
  SocketCommand,
  SocketMetrics,
  SocketProtocol,
  TcpClientState,
  TcpServerClient,
  TcpServerState,
  TrafficDirection,
  TrafficLogEntry,
  UdpServerState,
} from "@/features/socket-tester/types";
import { useLocalStorage } from "@/hooks/use-local-storage";

const DEFAULT_TCP_CLIENT_PORT = 8080;
const DEFAULT_TCP_SERVER_PORT = 9000;
const DEFAULT_UDP_SERVER_PORT = 9002;
const MAX_LOG_ENTRIES = 600;

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function getBridgeUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_TEST_WS_URL as
    | string
    | undefined;

  if (configuredUrl) {
    return configuredUrl;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/socket-test`;
}

function readString(
  payload: Record<string, unknown> | undefined,
  keys: readonly string[],
  fallback = ""
) {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === "string") {
      return value;
    }
  }

  return fallback;
}

function readNumber(
  payload: Record<string, unknown> | undefined,
  keys: readonly string[],
  fallback = 0
) {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function nowTimestamp() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function toLogEntry(
  direction: TrafficDirection,
  protocol: SocketProtocol,
  scope: string,
  data: string,
  format: TrafficLogEntry["format"],
  metadata?: Record<string, unknown>
): TrafficLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: nowTimestamp(),
    direction,
    protocol,
    scope,
    data,
    format,
    metadata,
  };
}

function parseBridgeEvent(raw: string): BridgeEvent {
  try {
    const parsed = JSON.parse(raw) as BridgeEvent;
    return parsed;
  } catch {
    return {
      type: "message",
      payload: {
        data: raw,
      },
    };
  }
}

function formatClientAddress(payload: Record<string, unknown>) {
  const host = readString(
    payload,
    ["host", "address", "remoteAddress"],
    "client"
  );
  const port = readNumber(payload, ["port", "remotePort"], 0);
  return port > 0 ? `${host}:${port}` : host;
}

export function useSocketBridge() {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const manualDisconnectRef = useRef(false);
  const autoConnectRef = useRef(true);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [bridgeAutoConnect, setBridgeAutoConnect] = useLocalStorage(
    "socket-tester-bridge-auto-connect",
    true
  );
  const [bridgeStatus, setBridgeStatus] =
    useState<BridgeStatus>("disconnected");
  const [logs, setLogs] = useState<TrafficLogEntry[]>([]);
  const [tcpClient, setTcpClient] = useState<TcpClientState>(() => ({
    connectionId: createId("tcp-client"),
    connected: false,
    host: "127.0.0.1",
    port: DEFAULT_TCP_CLIENT_PORT,
  }));
  const [tcpServer, setTcpServer] = useState<TcpServerState>(() => ({
    serverId: createId("tcp-server"),
    listening: false,
    port: DEFAULT_TCP_SERVER_PORT,
    clients: [],
  }));
  const [udpServer, setUdpServer] = useState<UdpServerState>(() => ({
    serverId: createId("udp-server"),
    listening: false,
    port: DEFAULT_UDP_SERVER_PORT,
  }));

  const appendLog = useCallback((entry: TrafficLogEntry) => {
    setLogs((current) => [...current, entry].slice(-MAX_LOG_ENTRIES));
  }, []);

  const appendSystemLog = useCallback(
    (data: string, metadata?: Record<string, unknown>) => {
      appendLog(
        toLogEntry("sys", "tcp-client", "bridge", data, "text", metadata)
      );
    },
    [appendLog]
  );

  const handleBridgeEvent = useCallback(
    // The backend bridge emits several lifecycle/data variants while the
    // protocol settles, so this router intentionally normalizes them here.
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: protocol event routing is clearer in one table-like path.
    (event: BridgeEvent) => {
      const payload = event.payload ?? {};
      const type = typeof event.type === "string" ? event.type : "message";
      const normalizedType = type.replaceAll("-", "_");

      if (normalizedType.includes("error")) {
        appendLog(
          toLogEntry(
            "err",
            "tcp-client",
            readString(
              payload,
              ["scope", "connectionId", "serverId"],
              "bridge"
            ),
            readString(
              payload,
              ["message", "error", "data"],
              JSON.stringify(event)
            ),
            "text",
            payload
          )
        );
        return;
      }

      if (normalizedType.includes("tcp_client_connected")) {
        setTcpClient((current) => ({ ...current, connected: true }));
        appendLog(
          toLogEntry(
            "sys",
            "tcp-client",
            "client",
            "TCP client connected",
            "text",
            payload
          )
        );
        return;
      }

      if (
        normalizedType.includes("tcp_client_disconnected") ||
        normalizedType.includes("tcp_client_closed")
      ) {
        setTcpClient((current) => ({ ...current, connected: false }));
        appendLog(
          toLogEntry(
            "sys",
            "tcp-client",
            "client",
            "TCP client disconnected",
            "text",
            payload
          )
        );
        return;
      }

      if (normalizedType.includes("tcp_server_started")) {
        setTcpServer((current) => ({ ...current, listening: true }));
        appendLog(
          toLogEntry(
            "sys",
            "tcp-server",
            "server",
            "TCP server listening",
            "text",
            payload
          )
        );
        return;
      }

      if (
        normalizedType.includes("tcp_server_stopped") ||
        normalizedType.includes("tcp_server_closed")
      ) {
        setTcpServer((current) => ({
          ...current,
          clients: [],
          listening: false,
        }));
        appendLog(
          toLogEntry(
            "sys",
            "tcp-server",
            "server",
            "TCP server stopped",
            "text",
            payload
          )
        );
        return;
      }

      if (normalizedType.includes("tcp_server_client_connected")) {
        const id = readString(
          payload,
          ["clientId", "id"],
          formatClientAddress(payload)
        );
        const client: TcpServerClient = {
          id,
          address: readString(payload, ["address"], id),
          connectedAt: nowTimestamp(),
        };
        setTcpServer((current) => ({
          ...current,
          clients: current.clients.some((item) => item.id === id)
            ? current.clients
            : [...current.clients, client],
        }));
        appendLog(
          toLogEntry(
            "sys",
            "tcp-server",
            id,
            "Client connected",
            "text",
            payload
          )
        );
        return;
      }

      if (normalizedType.includes("tcp_server_client_disconnected")) {
        const id = readString(
          payload,
          ["clientId", "id"],
          formatClientAddress(payload)
        );
        setTcpServer((current) => ({
          ...current,
          clients: current.clients.filter((client) => client.id !== id),
        }));
        appendLog(
          toLogEntry(
            "sys",
            "tcp-server",
            id,
            "Client disconnected",
            "text",
            payload
          )
        );
        return;
      }

      if (normalizedType.includes("udp_server_started")) {
        setUdpServer((current) => ({ ...current, listening: true }));
        appendLog(
          toLogEntry(
            "sys",
            "udp",
            "listener",
            "UDP listener started",
            "text",
            payload
          )
        );
        return;
      }

      if (
        normalizedType.includes("udp_server_stopped") ||
        normalizedType.includes("udp_server_closed")
      ) {
        setUdpServer((current) => ({ ...current, listening: false }));
        appendLog(
          toLogEntry(
            "sys",
            "udp",
            "listener",
            "UDP listener stopped",
            "text",
            payload
          )
        );
        return;
      }

      let protocol: SocketProtocol = "tcp-client";
      if (normalizedType.includes("udp")) {
        protocol = "udp";
      } else if (normalizedType.includes("tcp_server")) {
        protocol = "tcp-server";
      }
      const direction: TrafficDirection =
        normalizedType.includes("sent") || normalizedType.includes("out")
          ? "out"
          : "in";
      const data = readString(
        payload,
        ["data", "message", "body"],
        JSON.stringify(event)
      );
      const scope = readString(
        payload,
        ["clientId", "connectionId", "serverId", "remoteAddress", "scope"],
        protocol
      );
      appendLog(toLogEntry(direction, protocol, scope, data, "text", payload));
    },
    [appendLog]
  );

  const connectBridge = useCallback(() => {
    manualDisconnectRef.current = false;
    setBridgeAutoConnect(true);

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    setBridgeStatus("connecting");
    const socket = new WebSocket(getBridgeUrl());
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setBridgeStatus("connected");
      appendSystemLog("Bridge connected", { url: getBridgeUrl() });
    });

    socket.addEventListener("message", (message) => {
      handleBridgeEvent(parseBridgeEvent(String(message.data)));
    });

    socket.addEventListener("error", () => {
      appendLog(
        toLogEntry(
          "err",
          "tcp-client",
          "bridge",
          "WebSocket bridge error",
          "text"
        )
      );
      if (!autoConnectRef.current) {
        toast.error("Socket bridge connection failed");
      }
    });

    socket.addEventListener("close", () => {
      setBridgeStatus("disconnected");
      setTcpClient((current) => ({ ...current, connected: false }));
      setTcpServer((current) => ({
        ...current,
        clients: [],
        listening: false,
      }));
      setUdpServer((current) => ({ ...current, listening: false }));
      appendSystemLog("Bridge disconnected");
      if (autoConnectRef.current && !manualDisconnectRef.current) {
        setReconnectAttempt((current) => current + 1);
      }
    });
  }, [appendLog, appendSystemLog, handleBridgeEvent, setBridgeAutoConnect]);

  const disconnectBridge = useCallback(() => {
    manualDisconnectRef.current = true;
    setBridgeAutoConnect(false);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    socketRef.current?.close();
    socketRef.current = null;
  }, [setBridgeAutoConnect]);

  const sendCommand = useCallback(
    (command: SocketCommand) => {
      if (socketRef.current?.readyState !== WebSocket.OPEN) {
        toast.error("Connect the WebSocket bridge first");
        appendLog(
          toLogEntry(
            "err",
            "tcp-client",
            "bridge",
            "Command rejected: bridge is offline",
            "text",
            { command }
          )
        );
        return false;
      }

      socketRef.current.send(JSON.stringify(command));
      return true;
    },
    [appendLog]
  );

  const connectTcpClient = useCallback(
    (host: string, port: number) => {
      const connectionId = createId("tcp-client");
      setTcpClient({ connectionId, connected: false, host, port });
      if (
        sendCommand({
          type: "tcp_client_connect",
          payload: { connectionId, host, port },
        })
      ) {
        appendLog(
          toLogEntry(
            "sys",
            "tcp-client",
            `${host}:${port}`,
            "Connecting TCP client",
            "text"
          )
        );
      }
    },
    [appendLog, sendCommand]
  );

  const disconnectTcpClient = useCallback(() => {
    if (
      sendCommand({
        type: "tcp_client_disconnect",
        payload: { connectionId: tcpClient.connectionId },
      })
    ) {
      setTcpClient((current) => ({ ...current, connected: false }));
    }
  }, [sendCommand, tcpClient.connectionId]);

  const sendTcpClient = useCallback(
    (data: string, format: PayloadFormat, delimiter: "\r\n" | "\n" | "") => {
      if (
        sendCommand({
          type: "tcp_client_send",
          payload: {
            connectionId: tcpClient.connectionId,
            data,
            delimiter,
            format,
          },
        })
      ) {
        appendLog(
          toLogEntry(
            "out",
            "tcp-client",
            `${tcpClient.host}:${tcpClient.port}`,
            data,
            format
          )
        );
      }
    },
    [
      appendLog,
      sendCommand,
      tcpClient.connectionId,
      tcpClient.host,
      tcpClient.port,
    ]
  );

  const startTcpServer = useCallback(
    (port: number) => {
      const serverId = createId("tcp-server");
      setTcpServer({ serverId, listening: false, port, clients: [] });
      if (
        sendCommand({
          type: "tcp_server_start",
          payload: { serverId, port },
        })
      ) {
        appendLog(
          toLogEntry(
            "sys",
            "tcp-server",
            `:${port}`,
            "Starting TCP server",
            "text"
          )
        );
      }
    },
    [appendLog, sendCommand]
  );

  const stopTcpServer = useCallback(() => {
    if (
      sendCommand({
        type: "tcp_server_stop",
        payload: { serverId: tcpServer.serverId },
      })
    ) {
      setTcpServer((current) => ({
        ...current,
        clients: [],
        listening: false,
      }));
    }
  }, [sendCommand, tcpServer.serverId]);

  const sendTcpServer = useCallback(
    (
      clientId: string,
      data: string,
      format: PayloadFormat,
      delimiter: "\r\n" | "\n" | ""
    ) => {
      if (
        sendCommand({
          type: "tcp_server_send",
          payload: {
            serverId: tcpServer.serverId,
            clientId,
            data,
            delimiter,
            format,
          },
        })
      ) {
        appendLog(toLogEntry("out", "tcp-server", clientId, data, format));
      }
    },
    [appendLog, sendCommand, tcpServer.serverId]
  );

  const startUdpServer = useCallback(
    (port: number) => {
      const serverId = createId("udp-server");
      setUdpServer({ serverId, listening: false, port });
      if (
        sendCommand({
          type: "udp_server_start",
          payload: { serverId, port },
        })
      ) {
        appendLog(
          toLogEntry("sys", "udp", `:${port}`, "Starting UDP listener", "text")
        );
      }
    },
    [appendLog, sendCommand]
  );

  const stopUdpServer = useCallback(() => {
    if (
      sendCommand({
        type: "udp_server_stop",
        payload: { serverId: udpServer.serverId },
      })
    ) {
      setUdpServer((current) => ({ ...current, listening: false }));
    }
  }, [sendCommand, udpServer.serverId]);

  const sendUdp = useCallback(
    (host: string, port: number, data: string, format: PayloadFormat) => {
      if (
        sendCommand({
          type: "udp_send",
          payload: { host, port, data, format },
        })
      ) {
        appendLog(toLogEntry("out", "udp", `${host}:${port}`, data, format));
      }
    },
    [appendLog, sendCommand]
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  const metrics = useMemo<SocketMetrics>(() => {
    const packetsIn = logs.filter((entry) => entry.direction === "in").length;
    const packetsOut = logs.filter((entry) => entry.direction === "out").length;
    const errors = logs.filter((entry) => entry.direction === "err").length;
    const activeConnections =
      (tcpClient.connected ? 1 : 0) +
      (tcpServer.listening ? tcpServer.clients.length : 0) +
      (udpServer.listening ? 1 : 0);

    return { activeConnections, errors, packetsIn, packetsOut };
  }, [
    logs,
    tcpClient.connected,
    tcpServer.clients.length,
    tcpServer.listening,
    udpServer.listening,
  ]);

  useEffect(
    () => () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socketRef.current?.close();
    },
    []
  );

  useEffect(() => {
    autoConnectRef.current = bridgeAutoConnect;
  }, [bridgeAutoConnect]);

  useEffect(() => {
    if (bridgeAutoConnect && bridgeStatus === "disconnected") {
      reconnectTimeoutRef.current = setTimeout(
        () => {
          connectBridge();
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
  }, [bridgeAutoConnect, bridgeStatus, connectBridge, reconnectAttempt]);

  return {
    bridgeAutoConnect,
    bridgeStatus,
    clearLogs,
    connectBridge,
    connectTcpClient,
    disconnectBridge,
    disconnectTcpClient,
    logs,
    metrics,
    sendTcpClient,
    sendTcpServer,
    sendUdp,
    startTcpServer,
    startUdpServer,
    stopTcpServer,
    stopUdpServer,
    tcpClient,
    tcpServer,
    udpServer,
  };
}
