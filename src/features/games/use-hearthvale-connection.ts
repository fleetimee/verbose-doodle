import { type RefObject, useEffect } from "react";
import { z } from "zod";
import {
  buildTicketWebSocketUrl,
  createRealtimeTicket,
} from "@/features/realtime/ticket-client";

const connectionRequest = z.object({
  type: z.literal("hearthvale:connect"),
  id: z.string().uuid(),
});

export function useHearthvaleConnection(
  frameRef: RefObject<HTMLIFrameElement | null>
) {
  useEffect(() => {
    let disposed = false;
    let pending = false;
    const onMessage = (event: MessageEvent<unknown>) => {
      const frame = frameRef.current;
      if (
        event.origin !== window.location.origin ||
        !frame?.contentWindow ||
        event.source !== frame.contentWindow
      ) {
        return;
      }
      const request = connectionRequest.safeParse(event.data);
      if (!request.success || pending) {
        return;
      }
      const { id } = request.data;
      const target = frame.contentWindow;
      pending = true;
      const reply = (result: { url: string } | { error: string }) => {
        if (!disposed && frameRef.current?.contentWindow === target) {
          target.postMessage(
            { type: "hearthvale:connection", id, ...result },
            window.location.origin
          );
        }
      };
      createRealtimeTicket("hearthvale")
        .then(({ ticket }) => {
          reply({
            url: buildTicketWebSocketUrl(
              "/api/games/hearthvale/ws",
              ticket,
              import.meta.env.VITE_HEARTHVALE_WS_URL
            ),
          });
        })
        .catch(() => {
          reply({
            error:
              "Could not connect to co-op. Check your connection and sign in again if needed.",
          });
        })
        .finally(() => {
          pending = false;
        });
    };
    window.addEventListener("message", onMessage);
    return () => {
      disposed = true;
      window.removeEventListener("message", onMessage);
    };
  }, [frameRef]);
}
