import type { NdefScanResult } from "./ndef";
import {
  type BridgeEvent,
  type BridgeScanStatus,
  type BridgeSnapshot,
  NFC_BRIDGE_PROTOCOL_VERSION,
  parseBridgeCommand,
  serializeBridgeEvent,
  snapshotToEvents,
} from "./protocol";
import {
  createSystemReaderAdapter,
  type ReaderAdapter,
  type ReaderStatus,
} from "./reader-adapter";

export const DEFAULT_NFC_BRIDGE_HOST = "127.0.0.1";
export const DEFAULT_NFC_BRIDGE_PORT = 7788;
export const DEFAULT_NFC_BRIDGE_VERSION = "0.1.0";

export type NfcBridgeConfig = {
  readonly host?: string;
  readonly port?: number;
  readonly token: string;
  readonly allowedOrigins: readonly string[];
  readonly bridgeVersion?: string;
};

type BridgeSocket = {
  readonly send: (data: string) => void;
};

type SocketData = {
  readonly origin: string;
};

export function normalizeBridgeConfig(
  config: NfcBridgeConfig
): Required<NfcBridgeConfig> {
  return {
    allowedOrigins: config.allowedOrigins,
    bridgeVersion: config.bridgeVersion ?? DEFAULT_NFC_BRIDGE_VERSION,
    host: config.host ?? DEFAULT_NFC_BRIDGE_HOST,
    port: config.port ?? DEFAULT_NFC_BRIDGE_PORT,
    token: config.token,
  };
}

export function assertLoopbackHost(host: string): void {
  if (host !== "127.0.0.1" && host !== "localhost" && host !== "::1") {
    throw new Error(
      "The NFC bridge must bind to loopback (127.0.0.1, localhost, or ::1)."
    );
  }
}

export function createBridgeSnapshot(
  config: Required<NfcBridgeConfig>,
  reader: ReaderStatus,
  scanStatus: BridgeScanStatus,
  latestScan?: NdefScanResult
): BridgeSnapshot {
  return {
    bridge: {
      bridgeVersion: config.bridgeVersion,
      capabilities: ["health", "reader-status", "scan", "scan-session"],
      host: config.host,
      port: config.port,
      tokenRequired: true,
    },
    reader,
    scanStatus,
    ...(latestScan ? { latestScan } : {}),
  };
}

export function validateBridgeHandshake(
  config: Required<NfcBridgeConfig>,
  origin: string,
  token: string | null
):
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly code: "origin-rejected" | "unauthorized";
      readonly status: 401 | 403;
    } {
  if (!config.allowedOrigins.includes(origin)) {
    return { code: "origin-rejected", ok: false, status: 403 };
  }
  if (token !== config.token) {
    return { code: "unauthorized", ok: false, status: 401 };
  }
  return { ok: true };
}

export class NfcBridge {
  private readonly config: Required<NfcBridgeConfig>;
  private readonly adapter: ReaderAdapter;
  private readonly clients = new Set<BridgeSocket>();
  private readerStatus: ReaderStatus;
  private scanStatus: BridgeScanStatus = "stopped";
  private latestScan: NdefScanResult | undefined;
  private server: ReturnType<typeof Bun.serve> | null = null;

  constructor(config: NfcBridgeConfig, adapter?: ReaderAdapter) {
    this.config = normalizeBridgeConfig(config);
    assertLoopbackHost(this.config.host);
    if (!this.config.token) {
      throw new Error(
        "NFC_BRIDGE_TOKEN must be configured before starting the bridge."
      );
    }
    this.adapter =
      adapter ??
      ({
        initialStatus: {
          readerState: "unavailable",
          reason: "Reader adapter is not initialized.",
          action: "Start the bridge again.",
        },
        start: async () => undefined,
        stop: async () => undefined,
      } satisfies ReaderAdapter);
    this.readerStatus = this.adapter.initialStatus;
  }

  getSnapshot(): BridgeSnapshot {
    return createBridgeSnapshot(
      this.config,
      this.readerStatus,
      this.scanStatus,
      this.latestScan
    );
  }

  getHealthResponse(): Response {
    return Response.json({
      ...this.getSnapshot(),
      protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
      status: "ok",
    });
  }

  getPort(): number | null {
    return this.server?.port ?? null;
  }

  startScanning(): void {
    this.setScanStatus("scanning");
  }

  stopScanning(): void {
    this.setScanStatus("stopped");
  }

  async start(): Promise<void> {
    this.server = Bun.serve<SocketData>({
      fetch: (request, server) => this.handleRequest(request, server),
      hostname: this.config.host,
      port: this.config.port,
      websocket: {
        message: (socket, raw) => this.handleMessage(socket, String(raw)),
        open: (socket) => {
          this.clients.add(socket);
          this.sendSnapshot(socket);
        },
        close: (socket) => {
          this.clients.delete(socket);
        },
      },
    });
    await this.adapter.start(
      (status) => {
        this.readerStatus = status;
        this.broadcast({
          protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
          type: "reader-status",
          ...status,
        });
      },
      (scan) => {
        if (this.scanStatus !== "scanning") {
          return;
        }
        this.latestScan = scan;
        this.readerStatus = {
          ...this.readerStatus,
          readerState: "tag-detected",
        };
        this.broadcast({
          protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
          type: "reader-status",
          ...this.readerStatus,
        });
        this.broadcast({
          protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
          type: "scan",
          ...scan,
        });
      }
    );
  }

  async stop(): Promise<void> {
    this.stopScanning();
    await this.adapter.stop();
    this.server?.stop(true);
    this.server = null;
    this.clients.clear();
  }

  private handleRequest(
    request: Request,
    server: Bun.Server<SocketData>
  ): Response | undefined {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return this.getHealthResponse();
    }
    if (url.pathname !== "/ws" || request.method !== "GET") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const origin = request.headers.get("origin") ?? "";
    const handshake = validateBridgeHandshake(
      this.config,
      origin,
      new URL(request.url).searchParams.get("token")
    );
    if (!handshake.ok && handshake.code === "origin-rejected") {
      return Response.json(
        { error: "Origin is not allowed", code: "origin-rejected" },
        { status: 403 }
      );
    }
    if (!handshake.ok) {
      return Response.json(
        { error: "Bridge token is invalid", code: "unauthorized" },
        { status: 401 }
      );
    }
    return server.upgrade(request, { data: { origin } })
      ? undefined
      : new Response("WebSocket upgrade failed", { status: 400 });
  }

  private handleMessage(socket: BridgeSocket, raw: string): void {
    const result = parseBridgeCommand(raw);
    if ("error" in result) {
      socket.send(serializeBridgeEvent(result.error));
      return;
    }
    if (result.command.type === "status") {
      this.sendSnapshot(socket);
      return;
    }
    if (result.command.type === "start-scan") {
      this.startScanning();
      return;
    }
    this.stopScanning();
  }

  private setScanStatus(scanStatus: BridgeScanStatus): void {
    if (this.scanStatus === scanStatus) {
      return;
    }
    this.scanStatus = scanStatus;
    this.broadcast({
      protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
      scanning: scanStatus === "scanning",
      type: "scan-status",
    });
  }

  private sendSnapshot(socket: BridgeSocket): void {
    for (const event of snapshotToEvents(this.getSnapshot())) {
      socket.send(serializeBridgeEvent(event));
    }
  }

  private broadcast(event: BridgeEvent): void {
    const serialized = serializeBridgeEvent(event);
    for (const client of this.clients) {
      client.send(serialized);
    }
  }
}

export async function createDefaultNfcBridge(
  config: NfcBridgeConfig
): Promise<NfcBridge> {
  return new NfcBridge(config, await createSystemReaderAdapter());
}
