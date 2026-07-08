import type {
  RelayEvent,
  RelayEventPayload,
  RelayFlow,
  RelayMode,
  RelayOptions,
  RelayStartInput,
} from "@/features/socks-relay/types";

const MIN_PORT = 1;
const MAX_PORT = 65_535;
export const RELAY_LISTENING_PORT_MIN = 18_090;
export const RELAY_LISTENING_PORT_MAX = 18_100;
const MIN_TIMER_MS = 1000;
const HOLD_DROP_KEYS = [
  "holdClient",
  "holdHost",
  "dropClient",
  "dropHost",
] as const;
const MESSAGE_FLOWS = ["RC", "SH", "RH", "SC", "HC", "HH", "DC", "DH"];

export const DEFAULT_RELAY_OPTIONS: RelayOptions = {
  holdClient: false,
  holdHost: false,
  dropClient: false,
  dropHost: false,
  removeHeaders: false,
  timerMs: MIN_TIMER_MS,
};

type RelayInputErrors = {
  -readonly [Key in keyof RelayStartInput]?: string;
};

export type RelayFormErrors = RelayInputErrors & {
  options?: string;
};

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= MIN_PORT && port <= MAX_PORT;
}

export function isValidRelayListeningPort(port: number): boolean {
  return (
    Number.isInteger(port) &&
    port >= RELAY_LISTENING_PORT_MIN &&
    port <= RELAY_LISTENING_PORT_MAX
  );
}

export function validateRelayStartInput(
  input: RelayStartInput
): RelayFormErrors {
  const errors: RelayFormErrors = {};

  if (!isValidRelayListeningPort(input.listeningPort)) {
    errors.listeningPort = `Listening port must be between ${RELAY_LISTENING_PORT_MIN} and ${RELAY_LISTENING_PORT_MAX}.`;
  }

  if (!input.hostAddress.trim()) {
    errors.hostAddress = "Host address is required.";
  }

  if (!isValidPort(input.hostPort)) {
    errors.hostPort = "Host port must be between 1 and 65535.";
  }

  if (!Number.isInteger(input.timerMs) || input.timerMs < MIN_TIMER_MS) {
    errors.timerMs = "Timer must be at least 1000 ms.";
  }

  const activeHoldDropCount = HOLD_DROP_KEYS.filter((key) => input[key]).length;
  if (activeHoldDropCount > 1) {
    errors.options = "Only one hold or drop option can be active.";
  }

  return errors;
}

export function hasRelayFormErrors(errors: RelayFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function summarizeRelayOptions(options: RelayOptions): string {
  const active = [
    options.holdClient ? "HC" : null,
    options.holdHost ? "HH" : null,
    options.dropClient ? "DC" : null,
    options.dropHost ? "DH" : null,
    options.removeHeaders ? "Remove headers" : null,
    `Timer ${options.timerMs} ms`,
  ].filter(Boolean);

  return active.join(" / ");
}

export function truncateMiddle(value: string, head = 8, tail = 8): string {
  if (value.length <= head + tail) {
    return value;
  }

  return `${value.slice(0, head)}....${value.slice(-tail)}`;
}

export function isRelayMessageEvent(event: RelayEvent): boolean {
  return event.type === "relay_message";
}

export function isKnownRelayFlow(flow: unknown): flow is RelayFlow {
  return typeof flow === "string" && MESSAGE_FLOWS.includes(flow);
}

export function getModeLabel(mode: RelayMode): string {
  return mode === "REST_API" ? "REST API" : "ISO 8583";
}

export function buildRelayWebSocketUrl(token: string): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = new URL(
    "/api/relay/events",
    `${protocol}//${window.location.host}`
  );
  url.searchParams.set("token", token);
  return url.toString();
}

export function parseRelayEvent(raw: string, id: string): RelayEvent | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("type" in parsed) ||
      !("payload" in parsed)
    ) {
      return null;
    }

    const candidate = parsed as {
      readonly type: unknown;
      readonly payload: unknown;
    };

    if (
      typeof candidate.type !== "string" ||
      typeof candidate.payload !== "object" ||
      candidate.payload === null
    ) {
      return null;
    }

    return {
      id,
      receivedAt: Date.now(),
      type: candidate.type,
      payload: candidate.payload as RelayEventPayload,
    };
  } catch {
    return null;
  }
}
