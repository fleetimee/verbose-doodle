export type RelayMode = "REST_API" | "ISO_8583";

export type RelayOptions = {
  readonly holdClient: boolean;
  readonly holdHost: boolean;
  readonly dropClient: boolean;
  readonly dropHost: boolean;
  readonly removeHeaders: boolean;
  readonly timerMs: number;
};

export type RelayInstance = {
  readonly relayId: string;
  readonly mode: RelayMode;
  readonly listeningPort: number;
  readonly hostAddress: string;
  readonly hostPort: number;
  readonly options: RelayOptions;
  readonly running: boolean;
};

export type RelayStartInput = {
  readonly relayId: string;
  readonly mode: RelayMode;
  readonly listeningPort: number;
  readonly hostAddress: string;
  readonly hostPort: number;
} & RelayOptions;

export type RelayUpdateOptionsInput = RelayOptions;

export type RelayFlow = "RC" | "SH" | "RH" | "SC" | "HC" | "HH" | "DC" | "DH";

export type RelayEventPayload = {
  readonly relayId?: string;
  readonly mode?: RelayMode;
  readonly timestamp?: string;
  readonly jobId?: string;
  readonly flow?: RelayFlow | string;
  readonly data?: string;
  readonly hex?: string;
  readonly base64?: string;
  readonly message?: string;
  readonly listeningPort?: number;
  readonly hostAddress?: string;
  readonly hostPort?: number;
  readonly [key: string]: unknown;
};

export type RelayEvent = {
  readonly id: string;
  readonly receivedAt: number;
  readonly type: string;
  readonly payload: RelayEventPayload;
};

export type RelayConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";
