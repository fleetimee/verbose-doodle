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
    this.updateState({ connectionStatus: "connecting", error: null });
    const socket = this.createSocket(this.url);
    this.socket = socket;
    socket.onopen = () => {
      this.updateState({ connectionStatus: "connected", error: null });
      this.send({
        protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
        type: "status",
      });
    };
    socket.onmessage = (message) => this.handleMessage(message.data);
    socket.onerror = () => {
      this.updateState({
        connectionStatus: "error",
        error:
          "The local bridge could not be reached. Start the bridge and retry.",
      });
    };
    socket.onclose = () => {
      this.socket = null;
      this.updateState({ connectionStatus: "disconnected" });
    };
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.updateState({ connectionStatus: "disconnected" });
  }

  send(command: NfcBridgeCommand): boolean {
    if (!this.socket || this.socket.readyState !== NFC_WEBSOCKET_OPEN) {
      return false;
    }
    this.socket.send(JSON.stringify(command));
    return true;
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
}
