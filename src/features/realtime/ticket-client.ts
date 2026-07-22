import { apiPost } from "@/lib/api";

export type RealtimeAudience = "socket-test" | "relay-events";

type RealtimeTicketApiResponse = {
  readonly data: {
    readonly ticket: string;
    readonly expiresAt: string;
  };
};

export type RealtimeTicket = RealtimeTicketApiResponse["data"];

export function createRealtimeTicket(
  audience: RealtimeAudience
): Promise<RealtimeTicket> {
  return apiPost<
    RealtimeTicketApiResponse,
    { readonly audience: RealtimeAudience }
  >("/api/realtime/tickets", { audience }).then((response) => response.data);
}

export function buildTicketWebSocketUrl(
  path: string,
  ticket: string,
  configuredUrl?: string
): string {
  const host =
    typeof window !== "undefined" && window.location.host
      ? window.location.host
      : "localhost:8080";
  const protocol =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss:"
      : "ws:";
  const base = `${protocol}//${host}`;
  const rawUrl = configuredUrl?.trim();
  let url: URL;
  if (!rawUrl) {
    url = new URL(path, base);
  } else if (
    rawUrl.startsWith("ws://") ||
    rawUrl.startsWith("wss://") ||
    rawUrl.startsWith("http")
  ) {
    url = new URL(rawUrl);
  } else {
    url = new URL(rawUrl, base);
  }
  if (url.protocol !== "ws:" && url.protocol !== "wss:") {
    throw new TypeError("WebSocket URL must use ws: or wss:");
  }
  url.searchParams.set("ticket", ticket);
  return url.toString();
}
