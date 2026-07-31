export const NFC_BRIDGE_PROTOCOL_VERSION = "1" as const;

export type NfcReaderState =
  | "unavailable"
  | "detected"
  | "waiting"
  | "tag-detected";

export type NfcBridgeConnectionStatus =
  | "disconnected"
  | "connecting"
  | "reconnecting"
  | "connected"
  | "error";

export type NfcScanSessionStatus = "stopped" | "scanning";

export type NfcBridgeEvent =
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
      readonly readerState: NfcReaderState;
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
  | {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "scan";
      readonly timestamp: string;
      readonly decodedText?: string;
      readonly rawNdef: string;
      readonly uid?: string;
      readonly records: readonly NfcNdefRecord[];
      readonly decodingStatus: NfcNdefDecodingStatus;
      readonly warning?: string;
    }
  | {
      readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
      readonly type: "error";
      readonly code: string;
      readonly message: string;
      readonly action?: string;
    };

export type NfcBridgeState = {
  readonly connectionStatus: NfcBridgeConnectionStatus;
  readonly scanStatus: NfcScanSessionStatus;
  readonly readerState: NfcReaderState;
  readonly readerName: string | null;
  readonly reason: string | null;
  readonly action: string | null;
  readonly bridgeVersion: string | null;
  readonly capabilities: readonly string[];
  readonly error: string | null;
  readonly latestScan: NfcScan | null;
};

export type NfcNdefDecodingStatus =
  | "decoded"
  | "no-text"
  | "unsupported"
  | "malformed";

export type NfcNdefRecord = {
  readonly index: number;
  readonly tnf: number;
  readonly type: string;
  readonly typeHex: string;
  readonly id: string | null;
  readonly idHex: string | null;
  readonly payload: string | null;
  readonly payloadHex: string;
  readonly raw: string;
};

export type NfcScan = {
  readonly timestamp: string;
  readonly decodedText?: string;
  readonly rawNdef: string;
  readonly uid?: string;
  readonly records: readonly NfcNdefRecord[];
  readonly decodingStatus: NfcNdefDecodingStatus;
  readonly warning?: string;
};

export type NfcBridgeCommand = {
  readonly protocolVersion: typeof NFC_BRIDGE_PROTOCOL_VERSION;
  readonly type: "status" | "start-scan" | "stop-scan";
};

export const initialNfcBridgeState: NfcBridgeState = {
  action: null,
  bridgeVersion: null,
  capabilities: [],
  connectionStatus: "disconnected",
  error: null,
  latestScan: null,
  readerName: null,
  readerState: "unavailable",
  reason: null,
  scanStatus: "stopped",
};
