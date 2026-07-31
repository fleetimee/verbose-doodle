import type { NdefScanResult } from "./ndef";

export const NFC_BRIDGE_PROTOCOL_VERSION = "1" as const;

export type BridgeReaderState =
  | "unavailable"
  | "detected"
  | "waiting"
  | "tag-detected";

export type BridgeScanStatus = "stopped" | "scanning";

export type BridgeErrorCode =
  | "pcsc-unavailable"
  | "reader-unavailable"
  | "unsupported-reader"
  | "origin-rejected"
  | "unauthorized"
  | "protocol-mismatch"
  | "invalid-message"
  | "bridge-error"
  | "scan-error";

export type BridgeEvent =
  | {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "bridge-status";
      readonly bridgeVersion: string;
      readonly capabilities: readonly string[];
      readonly host: string;
      readonly port: number;
      readonly tokenRequired: boolean;
    }
  | {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "reader-status";
      readonly readerState: BridgeReaderState;
      readonly readerName?: string;
      readonly reason?: string;
      readonly action?: string;
    }
  | {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "scan-status";
      readonly scanning: boolean;
      readonly reason?: string;
      readonly action?: string;
    }
  | (NdefScanResult & {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "scan";
    })
  | {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "error";
      readonly code: BridgeErrorCode;
      readonly message: string;
      readonly action?: string;
    };

export type BridgeCommand =
  | {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "status";
    }
  | {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "start-scan";
    }
  | {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "stop-scan";
    };

export type BridgeSnapshot = {
  readonly bridge: {
    readonly bridgeVersion: string;
    readonly capabilities: readonly string[];
    readonly host: string;
    readonly port: number;
    readonly tokenRequired: boolean;
  };
  readonly reader: {
    readonly readerState: BridgeReaderState;
    readonly readerName?: string;
    readonly reason?: string;
    readonly action?: string;
  };
  readonly scanStatus: BridgeScanStatus;
  readonly latestScan?: NdefScanResult;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseBridgeCommand(
  raw: string
):
  | { readonly command: BridgeCommand }
  | { readonly error: Extract<BridgeEvent, { type: "error" }> } {
  try {
    const value: unknown = JSON.parse(raw);

    if (
      !isRecord(value) ||
      value.protocolVersion !== NFC_BRIDGE_PROTOCOL_VERSION
    ) {
      return {
        error: {
          action: "Update the bridge and reload the browser tool.",
          code: "protocol-mismatch",
          message:
            "This browser tool and bridge use different protocol versions.",
          protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
          type: "error",
        },
      };
    }

    if (
      value.type === "status" ||
      value.type === "start-scan" ||
      value.type === "stop-scan"
    ) {
      return {
        command: {
          protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
          type: value.type,
        },
      };
    }

    return {
      error: {
        action: "Use a supported bridge command.",
        code: "invalid-message",
        message: "The bridge does not recognize this command.",
        protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
        type: "error",
      },
    };
  } catch {
    return {
      error: {
        action: "Send a versioned JSON command.",
        code: "invalid-message",
        message: "The bridge received malformed JSON.",
        protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
        type: "error",
      },
    };
  }
}

export function serializeBridgeEvent(event: BridgeEvent): string {
  return JSON.stringify(event);
}

export function snapshotToEvents(
  snapshot: BridgeSnapshot
): readonly BridgeEvent[] {
  return [
    {
      protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
      type: "bridge-status",
      ...snapshot.bridge,
    },
    {
      protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
      type: "reader-status",
      ...snapshot.reader,
    },
    {
      protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
      scanning: snapshot.scanStatus === "scanning",
      type: "scan-status",
    },
    ...(snapshot.latestScan
      ? [
          {
            protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
            type: "scan" as const,
            ...snapshot.latestScan,
          },
        ]
      : []),
  ];
}
