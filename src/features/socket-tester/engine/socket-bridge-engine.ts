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
import { formatMessage, messages } from "@/lib/i18n";
import { generateUUID } from "@/lib/utils";

export const DEFAULT_TCP_CLIENT_PORT = 8080;
export const DEFAULT_TCP_SERVER_PORT = 9000;
export const DEFAULT_UDP_SERVER_PORT = 9002;
export const MAX_LOG_ENTRIES = 600;

export type ToastEvent = {
  type: "success" | "error";
  title: string;
  description?: string;
};

export type EngineState = {
  bridgeStatus: BridgeStatus;
  logs: readonly TrafficLogEntry[];
  tcpClient: TcpClientState;
  tcpServer: TcpServerState;
  udpServer: UdpServerState;
  metrics: SocketMetrics;
};

export function createId(prefix: string): string {
  return `${prefix}-${generateUUID()}`;
}

export function readString(
  payload: Record<string, unknown> | undefined,
  keys: readonly string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return fallback;
}

export function readNumber(
  payload: Record<string, unknown> | undefined,
  keys: readonly string[],
  fallback = 0
): number {
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

export function nowTimestamp(): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

export function toLogEntry(
  direction: TrafficDirection,
  protocol: SocketProtocol,
  scope: string,
  data: string,
  format: TrafficLogEntry["format"],
  metadata?: Record<string, unknown>
): TrafficLogEntry {
  return {
    data,
    direction,
    format,
    id: generateUUID(),
    metadata,
    protocol,
    scope,
    timestamp: nowTimestamp(),
  };
}

export function parseBridgeEvent(raw: string): BridgeEvent {
  try {
    return JSON.parse(raw) as BridgeEvent;
  } catch {
    return {
      payload: {
        data: raw,
      },
      type: "message",
    };
  }
}

export function formatClientAddress(payload: Record<string, unknown>): string {
  const host = readString(
    payload,
    ["host", "address", "remoteAddress"],
    "client"
  );
  const port = readNumber(payload, ["port", "remotePort"], 0);
  return port > 0 ? `${host}:${port}` : host;
}

/**
 * SocketBridgeEngine
 * Pure state machine managing socket-tester protocol state transitions, log ring buffers,
 * connection state, and metrics without React hooks or DOM dependencies.
 */
export class SocketBridgeEngine {
  private bridgeStatus: BridgeStatus = "disconnected";
  private logs: TrafficLogEntry[] = [];
  private tcpClient: TcpClientState = {
    connected: false,
    connectionId: createId("tcp-client"),
    host: "127.0.0.1",
    port: DEFAULT_TCP_CLIENT_PORT,
  };
  private tcpServer: TcpServerState = {
    clients: [],
    listening: false,
    port: DEFAULT_TCP_SERVER_PORT,
    serverId: createId("tcp-server"),
  };
  private udpServer: UdpServerState = {
    listening: false,
    port: DEFAULT_UDP_SERVER_PORT,
    serverId: createId("udp-server"),
  };

  private pendingTcpClient: {
    readonly connectionId: string;
    readonly host: string;
    readonly port: number;
  } | null = null;

  private readonly stateChangeListeners: Set<() => void> = new Set();
  private readonly toastListeners: Set<(event: ToastEvent) => void> = new Set();

  subscribe(listener: () => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  onToast(listener: (event: ToastEvent) => void): () => void {
    this.toastListeners.add(listener);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  private notifyStateChange(): void {
    for (const listener of this.stateChangeListeners) {
      listener();
    }
  }

  private notifyToast(event: ToastEvent): void {
    for (const listener of this.toastListeners) {
      listener(event);
    }
  }

  getState(): EngineState {
    return {
      bridgeStatus: this.bridgeStatus,
      logs: this.logs,
      metrics: this.getMetrics(),
      tcpClient: this.tcpClient,
      tcpServer: this.tcpServer,
      udpServer: this.udpServer,
    };
  }

  getBridgeStatus(): BridgeStatus {
    return this.bridgeStatus;
  }

  setBridgeStatus(status: BridgeStatus): void {
    if (this.bridgeStatus !== status) {
      this.bridgeStatus = status;
      this.notifyStateChange();
    }
  }

  getLogs(): readonly TrafficLogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
    this.notifyStateChange();
  }

  appendLog(entry: TrafficLogEntry): void {
    this.logs = [...this.logs, entry].slice(-MAX_LOG_ENTRIES);
    this.notifyStateChange();
  }

  appendSystemLog(data: string, metadata?: Record<string, unknown>): void {
    this.appendLog(
      toLogEntry("sys", "tcp-client", "bridge", data, "text", metadata)
    );
  }

  getMetrics(): SocketMetrics {
    const packetsIn = this.logs.filter(
      (entry) => entry.direction === "in"
    ).length;
    const packetsOut = this.logs.filter(
      (entry) => entry.direction === "out"
    ).length;
    const errors = this.logs.filter(
      (entry) => entry.direction === "err"
    ).length;
    const activeConnections =
      (this.tcpClient.connected ? 1 : 0) +
      (this.tcpServer.listening ? this.tcpServer.clients.length : 0) +
      (this.udpServer.listening ? 1 : 0);

    return { activeConnections, errors, packetsIn, packetsOut };
  }

  handleBridgeEvent(event: BridgeEvent): void {
    const payload = event.payload ?? {};
    const type = typeof event.type === "string" ? event.type : "message";
    const normalizedType = type.replaceAll("-", "_");

    if (normalizedType.includes("error")) {
      this.handleBridgeError(event, payload, normalizedType);
      return;
    }

    if (this.handleTcpClientEvent(normalizedType, payload)) {
      return;
    }

    if (this.handleTcpServerEvent(normalizedType, payload)) {
      return;
    }

    if (this.handleUdpServerEvent(normalizedType, payload)) {
      return;
    }

    this.appendGenericBridgeEvent(event, payload, normalizedType);
  }

  private handleBridgeError(
    event: BridgeEvent,
    payload: Record<string, unknown>,
    normalizedType: string
  ): void {
    const errorScope = readString(
      payload,
      ["scope", "connectionId", "serverId"],
      "bridge"
    );
    const errorMessage = readString(
      payload,
      ["message", "error", "data"],
      JSON.stringify(event)
    );

    if (
      this.pendingTcpClient &&
      (errorScope === this.pendingTcpClient.connectionId ||
        normalizedType.includes("tcp_client"))
    ) {
      const { host, port } = this.pendingTcpClient;
      this.pendingTcpClient = null;
      this.tcpClient = { ...this.tcpClient, connected: false };
      this.notifyToast({
        description: formatMessage(
          messages.socketTester.tcpConnectionRefusedDescription,
          { host, message: errorMessage, port }
        ),
        title: messages.socketTester.tcpConnectionFailed,
        type: "error",
      });
    }

    this.appendLog(
      toLogEntry("err", "tcp-client", errorScope, errorMessage, "text", payload)
    );
  }

  private handleTcpClientEvent(
    normalizedType: string,
    payload: Record<string, unknown>
  ): boolean {
    if (normalizedType.includes("tcp_client_connected")) {
      const connectedTarget = this.pendingTcpClient;
      if (connectedTarget) {
        this.notifyToast({
          description: formatMessage(
            messages.socketTester.tcpConnectedDescription,
            {
              host: connectedTarget.host,
              port: connectedTarget.port,
            }
          ),
          title: messages.socketTester.tcpConnected,
          type: "success",
        });
        this.pendingTcpClient = null;
      }
      this.tcpClient = { ...this.tcpClient, connected: true };
      this.appendLog(
        toLogEntry(
          "sys",
          "tcp-client",
          "client",
          "TCP client connected",
          "text",
          payload
        )
      );
      return true;
    }

    if (
      normalizedType.includes("tcp_client_disconnected") ||
      normalizedType.includes("tcp_client_closed")
    ) {
      const wasPending = Boolean(this.pendingTcpClient);
      const failedTarget = this.pendingTcpClient;
      this.pendingTcpClient = null;
      this.tcpClient = { ...this.tcpClient, connected: false };
      if (wasPending && failedTarget) {
        this.notifyToast({
          description: formatMessage(
            messages.socketTester.tcpConnectionUnableDescription,
            {
              host: failedTarget.host,
              port: failedTarget.port,
            }
          ),
          title: messages.socketTester.tcpConnectionFailed,
          type: "error",
        });
      }
      this.appendLog(
        toLogEntry(
          "sys",
          "tcp-client",
          "client",
          "TCP client disconnected",
          "text",
          payload
        )
      );
      return true;
    }

    return false;
  }

  private handleTcpServerEvent(
    normalizedType: string,
    payload: Record<string, unknown>
  ): boolean {
    if (normalizedType.includes("tcp_server_started")) {
      this.tcpServer = { ...this.tcpServer, listening: true };
      this.appendLog(
        toLogEntry(
          "sys",
          "tcp-server",
          "server",
          "TCP server listening",
          "text",
          payload
        )
      );
      return true;
    }

    if (
      normalizedType.includes("tcp_server_stopped") ||
      normalizedType.includes("tcp_server_closed")
    ) {
      this.tcpServer = {
        ...this.tcpServer,
        clients: [],
        listening: false,
      };
      this.appendLog(
        toLogEntry(
          "sys",
          "tcp-server",
          "server",
          "TCP server stopped",
          "text",
          payload
        )
      );
      return true;
    }

    if (normalizedType.includes("tcp_server_client_connected")) {
      const id = readString(
        payload,
        ["clientId", "id"],
        formatClientAddress(payload)
      );
      const client: TcpServerClient = {
        address: readString(payload, ["address"], id),
        connectedAt: nowTimestamp(),
        id,
      };
      this.tcpServer = {
        ...this.tcpServer,
        clients: this.tcpServer.clients.some((item) => item.id === id)
          ? this.tcpServer.clients
          : [...this.tcpServer.clients, client],
      };
      this.appendLog(
        toLogEntry("sys", "tcp-server", id, "Client connected", "text", payload)
      );
      return true;
    }

    if (normalizedType.includes("tcp_server_client_disconnected")) {
      const id = readString(
        payload,
        ["clientId", "id"],
        formatClientAddress(payload)
      );
      this.tcpServer = {
        ...this.tcpServer,
        clients: this.tcpServer.clients.filter((client) => client.id !== id),
      };
      this.appendLog(
        toLogEntry(
          "sys",
          "tcp-server",
          id,
          "Client disconnected",
          "text",
          payload
        )
      );
      return true;
    }

    return false;
  }

  private handleUdpServerEvent(
    normalizedType: string,
    payload: Record<string, unknown>
  ): boolean {
    if (normalizedType.includes("udp_server_started")) {
      this.udpServer = { ...this.udpServer, listening: true };
      this.appendLog(
        toLogEntry(
          "sys",
          "udp",
          "listener",
          "UDP listener started",
          "text",
          payload
        )
      );
      return true;
    }

    if (
      normalizedType.includes("udp_server_stopped") ||
      normalizedType.includes("udp_server_closed")
    ) {
      this.udpServer = { ...this.udpServer, listening: false };
      this.appendLog(
        toLogEntry(
          "sys",
          "udp",
          "listener",
          "UDP listener stopped",
          "text",
          payload
        )
      );
      return true;
    }

    return false;
  }

  private appendGenericBridgeEvent(
    event: BridgeEvent,
    payload: Record<string, unknown>,
    normalizedType: string
  ): void {
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
    this.appendLog(
      toLogEntry(direction, protocol, scope, data, "text", payload)
    );
  }

  // Socket Command Creators & State Updaters
  prepareConnectTcpClient(host: string, port: number): SocketCommand {
    const connectionId = createId("tcp-client");
    this.pendingTcpClient = { connectionId, host, port };
    this.tcpClient = { connected: false, connectionId, host, port };
    this.appendLog(
      toLogEntry(
        "sys",
        "tcp-client",
        `${host}:${port}`,
        "Connecting TCP client",
        "text"
      )
    );
    return {
      payload: { connectionId, host, port },
      type: "tcp_client_connect",
    };
  }

  prepareDisconnectTcpClient(): SocketCommand {
    this.tcpClient = { ...this.tcpClient, connected: false };
    this.notifyStateChange();
    return {
      payload: { connectionId: this.tcpClient.connectionId },
      type: "tcp_client_disconnect",
    };
  }

  prepareSendTcpClient(
    data: string,
    format: PayloadFormat,
    delimiter: "\r\n" | "\n" | ""
  ): SocketCommand {
    this.appendLog(
      toLogEntry(
        "out",
        "tcp-client",
        `${this.tcpClient.host}:${this.tcpClient.port}`,
        data,
        format
      )
    );
    return {
      payload: {
        connectionId: this.tcpClient.connectionId,
        data,
        delimiter,
        format,
      },
      type: "tcp_client_send",
    };
  }

  prepareStartTcpServer(port: number): SocketCommand {
    const serverId = createId("tcp-server");
    this.tcpServer = { clients: [], listening: false, port, serverId };
    this.appendLog(
      toLogEntry("sys", "tcp-server", `:${port}`, "Starting TCP server", "text")
    );
    return {
      payload: { port, serverId },
      type: "tcp_server_start",
    };
  }

  prepareStopTcpServer(): SocketCommand {
    this.tcpServer = {
      ...this.tcpServer,
      clients: [],
      listening: false,
    };
    this.notifyStateChange();
    return {
      payload: { serverId: this.tcpServer.serverId },
      type: "tcp_server_stop",
    };
  }

  prepareSendTcpServer(
    clientId: string,
    data: string,
    format: PayloadFormat,
    delimiter: "\r\n" | "\n" | ""
  ): SocketCommand {
    this.appendLog(toLogEntry("out", "tcp-server", clientId, data, format));
    return {
      payload: {
        clientId,
        data,
        delimiter,
        format,
        serverId: this.tcpServer.serverId,
      },
      type: "tcp_server_send",
    };
  }

  prepareStartUdpServer(port: number): SocketCommand {
    const serverId = createId("udp-server");
    this.udpServer = { listening: false, port, serverId };
    this.appendLog(
      toLogEntry("sys", "udp", `:${port}`, "Starting UDP listener", "text")
    );
    return {
      payload: { port, serverId },
      type: "udp_server_start",
    };
  }

  prepareStopUdpServer(): SocketCommand {
    this.udpServer = { ...this.udpServer, listening: false };
    this.notifyStateChange();
    return {
      payload: { serverId: this.udpServer.serverId },
      type: "udp_server_stop",
    };
  }

  prepareSendUdp(
    host: string,
    port: number,
    data: string,
    format: PayloadFormat
  ): SocketCommand {
    this.appendLog(toLogEntry("out", "udp", `${host}:${port}`, data, format));
    return {
      payload: { data, format, host, port },
      type: "udp_send",
    };
  }

  resetOnClose(): void {
    this.bridgeStatus = "disconnected";
    this.tcpClient = { ...this.tcpClient, connected: false };
    this.tcpServer = {
      ...this.tcpServer,
      clients: [],
      listening: false,
    };
    this.udpServer = { ...this.udpServer, listening: false };
    this.appendSystemLog("Bridge disconnected");
    this.notifyStateChange();
  }
}
