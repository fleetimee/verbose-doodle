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
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
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
    id: generateUUID(),
    timestamp: nowTimestamp(),
    direction,
    protocol,
    scope,
    data,
    format,
    metadata,
  };
}

export function parseBridgeEvent(raw: string): BridgeEvent {
  try {
    return JSON.parse(raw) as BridgeEvent;
  } catch {
    return {
      type: "message",
      payload: {
        data: raw,
      },
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
    connectionId: createId("tcp-client"),
    connected: false,
    host: "127.0.0.1",
    port: DEFAULT_TCP_CLIENT_PORT,
  };
  private tcpServer: TcpServerState = {
    serverId: createId("tcp-server"),
    listening: false,
    port: DEFAULT_TCP_SERVER_PORT,
    clients: [],
  };
  private udpServer: UdpServerState = {
    serverId: createId("udp-server"),
    listening: false,
    port: DEFAULT_UDP_SERVER_PORT,
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
      tcpClient: this.tcpClient,
      tcpServer: this.tcpServer,
      udpServer: this.udpServer,
      metrics: this.getMetrics(),
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
        type: "error",
        title: messages.socketTester.tcpConnectionFailed,
        description: formatMessage(
          messages.socketTester.tcpConnectionRefusedDescription,
          { host, message: errorMessage, port }
        ),
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
          type: "success",
          title: messages.socketTester.tcpConnected,
          description: formatMessage(
            messages.socketTester.tcpConnectedDescription,
            {
              host: connectedTarget.host,
              port: connectedTarget.port,
            }
          ),
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
          type: "error",
          title: messages.socketTester.tcpConnectionFailed,
          description: formatMessage(
            messages.socketTester.tcpConnectionUnableDescription,
            {
              host: failedTarget.host,
              port: failedTarget.port,
            }
          ),
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
        id,
        address: readString(payload, ["address"], id),
        connectedAt: nowTimestamp(),
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
    this.tcpClient = { connectionId, connected: false, host, port };
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
      type: "tcp_client_connect",
      payload: { connectionId, host, port },
    };
  }

  prepareDisconnectTcpClient(): SocketCommand {
    this.tcpClient = { ...this.tcpClient, connected: false };
    this.notifyStateChange();
    return {
      type: "tcp_client_disconnect",
      payload: { connectionId: this.tcpClient.connectionId },
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
      type: "tcp_client_send",
      payload: {
        connectionId: this.tcpClient.connectionId,
        data,
        delimiter,
        format,
      },
    };
  }

  prepareStartTcpServer(port: number): SocketCommand {
    const serverId = createId("tcp-server");
    this.tcpServer = { serverId, listening: false, port, clients: [] };
    this.appendLog(
      toLogEntry("sys", "tcp-server", `:${port}`, "Starting TCP server", "text")
    );
    return {
      type: "tcp_server_start",
      payload: { serverId, port },
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
      type: "tcp_server_stop",
      payload: { serverId: this.tcpServer.serverId },
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
      type: "tcp_server_send",
      payload: {
        serverId: this.tcpServer.serverId,
        clientId,
        data,
        delimiter,
        format,
      },
    };
  }

  prepareStartUdpServer(port: number): SocketCommand {
    const serverId = createId("udp-server");
    this.udpServer = { serverId, listening: false, port };
    this.appendLog(
      toLogEntry("sys", "udp", `:${port}`, "Starting UDP listener", "text")
    );
    return {
      type: "udp_server_start",
      payload: { serverId, port },
    };
  }

  prepareStopUdpServer(): SocketCommand {
    this.udpServer = { ...this.udpServer, listening: false };
    this.notifyStateChange();
    return {
      type: "udp_server_stop",
      payload: { serverId: this.udpServer.serverId },
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
      type: "udp_send",
      payload: { host, port, data, format },
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
