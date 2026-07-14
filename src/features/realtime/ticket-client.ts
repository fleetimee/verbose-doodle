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
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = new URL(
    configuredUrl?.trim() || path,
    `${protocol}//${window.location.host}`
  );
  url.searchParams.set("ticket", ticket);
  return url.toString();
}
