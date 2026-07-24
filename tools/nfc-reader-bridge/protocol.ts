export const NFC_BRIDGE_PROTOCOL_VERSION = "1" as const;

export type BridgeReaderState =
  | "unavailable"
  | "detected"
  | "waiting"
  | "tag-detected";

export type BridgeErrorCode =
  | "pcsc-unavailable"
  | "reader-unavailable"
  | "unsupported-reader"
  | "origin-rejected"
  | "unauthorized"
  | "protocol-mismatch"
  | "invalid-message"
  | "bridge-error";

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
          protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
          type: "error",
          code: "protocol-mismatch",
          message:
            "This browser tool and bridge use different protocol versions.",
          action: "Update the bridge and reload the browser tool.",
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
        protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
        type: "error",
        code: "invalid-message",
        message: "The bridge does not recognize this command.",
        action: "Use a supported bridge command.",
      },
    };
  } catch {
    return {
      error: {
        protocolVersion: NFC_BRIDGE_PROTOCOL_VERSION,
        type: "error",
        code: "invalid-message",
        message: "The bridge received malformed JSON.",
        action: "Send a versioned JSON command.",
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
  ];
}
