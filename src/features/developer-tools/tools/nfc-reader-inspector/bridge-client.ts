import {
  initialNfcBridgeState,
  NFC_BRIDGE_PROTOCOL_VERSION,
  type NfcBridgeCommand,
  type NfcBridgeEvent,
  type NfcBridgeState,
} from "@/features/developer-tools/tools/nfc-reader-inspector/types";

export type NfcWebSocket = {
  onclose: (() => void) | null;
  onerror: (() => void) | null;
  onmessage: ((event: { readonly data: string }) => void) | null;
  onopen: (() => void) | null;
  readonly readyState: number;
  close: () => void;
  send: (data: string) => void;
};

export type NfcWebSocketFactory = (url: string) => NfcWebSocket;

export const NFC_WEBSOCKET_OPEN = 1;
export const NFC_RECONNECT_DELAYS_MS = [
  1000, 2000, 4000, 8000, 15_000,
] as const;

export function parseNfcBridgeEvent(
  raw: string
): { readonly event: NfcBridgeEvent } | { readonly error: string } {
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== "object" ||
      value === null ||
      !("protocolVersion" in value) ||
      value.protocolVersion !== NFC_BRIDGE_PROTOCOL_VERSION
    ) {
      return { error: "The bridge protocol version is not supported." };
    }

    if (!("type" in value)) {
      return { error: "The bridge sent an event without a type." };
    }

    if (
      value.type !== "bridge-status" &&
      value.type !== "reader-status" &&
      value.type !== "scan-status" &&
      value.type !== "scan" &&
      value.type !== "error"
    ) {
      return {
        error: `The bridge sent an unknown event: ${String(value.type)}.`,
      };
    }

    return { event: value as NfcBridgeEvent };
  } catch {
    return { error: "The bridge sent malformed JSON." };
  }
}

export function createNfcBridgeUrl(
  configuredUrl: string,
  token: string
): string {
  const url = new URL(configuredUrl);
  if (token) {
    url.searchParams.set("token", token);
  }
  return url.toString();
}

export class NfcBridgeClient {
  private readonly url: string;
  private readonly createSocket: NfcWebSocketFactory;
  private socket: NfcWebSocket | null = null;
  private state: NfcBridgeState = initialNfcBridgeState;
  private readonly listeners = new Set<() => void>();
  private shouldReconnect = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private desiredScanning = false;

  constructor(url: string, createSocket?: NfcWebSocketFactory) {
    this.url = url;
    this.createSocket =
      createSocket ??
      ((nextUrl) => new WebSocket(nextUrl) as unknown as NfcWebSocket);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): NfcBridgeState {
    return this.state;
  }

  connect(): void {
    if (
      this.state.connectionStatus === "connecting" ||
      this.state.connectionStatus === "connected"
    ) {
      return;
    }
    this.shouldReconnect = true;
    this.clearReconnectTimer();
    this.updateState({ connectionStatus: "connecting", error: null });
    let socket: NfcWebSocket;
    try {
      socket = this.createSocket(this.url);
    } catch {
      this.updateState({
        connectionStatus: "error",
        error:
          "The local bridge could not be reached. Start the bridge and retry.",
      });
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;
    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.updateState({ connectionStatus: "connected", error: null });
      this.send({
        protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
        type: "status",
      });
      if (this.desiredScanning) {
        this.send({
          protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
          type: "start-scan",
        });
      }
    };
    socket.onmessage = (message) => this.handleMessage(message.data);
    socket.onerror = () => {
      this.updateState({
        connectionStatus: "error",
        error:
          "The local bridge could not be reached. Start the bridge and retry.",
      });
      socket.close();
    };
    socket.onclose = () => {
      if (this.socket !== socket) {
        return;
      }
      this.socket = null;
      if (this.shouldReconnect) {
        this.updateState({
          connectionStatus: "reconnecting",
          error: "The local bridge connection was interrupted. Reconnecting…",
        });
        this.scheduleReconnect();
        return;
      }
      this.updateState({
        connectionStatus: "disconnected",
        scanStatus: "stopped",
      });
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.desiredScanning = false;
    this.reconnectAttempt = 0;
    this.clearReconnectTimer();
    this.socket?.close();
    this.socket = null;
    this.updateState({
      connectionStatus: "disconnected",
      scanStatus: "stopped",
    });
  }

  startScan(): boolean {
    this.desiredScanning = true;
    const sent = this.send({
      protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
      type: "start-scan",
    });
    if (sent) {
      this.updateState({ error: null, scanStatus: "scanning" });
    }
    return sent;
  }

  stopScan(): boolean {
    this.desiredScanning = false;
    const sent = this.send({
      protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
      type: "stop-scan",
    });
    this.updateState({ scanStatus: "stopped" });
    return sent;
  }

  clearScan(): void {
    this.updateState({ latestScan: null });
  }

  send(command: NfcBridgeCommand): boolean {
    if (!this.socket || this.socket.readyState !== NFC_WEBSOCKET_OPEN) {
      return false;
    }
    try {
      this.socket.send(JSON.stringify(command));
      return true;
    } catch {
      return false;
    }
  }

  private handleMessage(raw: string): void {
    const result = parseNfcBridgeEvent(raw);
    if ("error" in result) {
      this.updateState({ connectionStatus: "error", error: result.error });
      return;
    }

    const event = result.event;
    if (event.type === "bridge-status") {
      this.updateState({
        bridgeVersion: event.bridgeVersion,
        capabilities: event.capabilities,
        error: null,
      });
      return;
    }
    if (event.type === "reader-status") {
      this.updateState({
        action: event.action ?? null,
        error: null,
        readerName: event.readerName ?? null,
        readerState: event.readerState,
        reason: event.reason ?? null,
      });
      return;
    }
    if (event.type === "scan-status") {
      this.updateState({
        action: event.action ?? null,
        error: null,
        reason: event.reason ?? null,
        scanStatus: event.scanning ? "scanning" : "stopped",
      });
      return;
    }
    if (event.type === "scan") {
      this.updateState({
        action: null,
        error: null,
        latestScan: {
          decodedText: event.decodedText,
          decodingStatus: event.decodingStatus,
          rawNdef: event.rawNdef,
          records: event.records,
          timestamp: event.timestamp,
          uid: event.uid,
          warning: event.warning,
        },
        readerState: "tag-detected",
      });
      return;
    }
    this.updateState({
      action: event.action ?? null,
      connectionStatus: "error",
      error: event.message,
      reason: event.action ?? null,
    });
  }

  private updateState(nextState: Partial<NfcBridgeState>): void {
    this.state = { ...this.state, ...nextState };
    for (const listener of this.listeners) {
      listener();
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (
      !this.shouldReconnect ||
      this.reconnectTimer ||
      this.reconnectAttempt >= NFC_RECONNECT_DELAYS_MS.length
    ) {
      if (this.reconnectAttempt >= NFC_RECONNECT_DELAYS_MS.length) {
        this.shouldReconnect = false;
        this.updateState({
          connectionStatus: "error",
          error:
            "The local bridge did not return. Check the bridge and retry manually.",
        });
      }
      return;
    }
    const delay = NFC_RECONNECT_DELAYS_MS[this.reconnectAttempt];
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}
