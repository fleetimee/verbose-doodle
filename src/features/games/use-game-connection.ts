import { type RefObject, useEffect } from "react";
import { z } from "zod";
import { useI18n } from "@/components/i18n-provider";
import {
  buildTicketWebSocketUrl,
  createRealtimeTicket,
} from "@/features/realtime/ticket-client";

const connectionRequest = z.object({
  type: z.enum(["hearthvale:connect", "chess:connect", "chess:copy"]),
  id: z.string().uuid(),
});

export function useGameConnection(
  frameRef: RefObject<HTMLIFrameElement | null>,
  game: "hearthvale" | "chess"
) {
  const { messages } = useI18n();
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
      if (
        request.success &&
        game === "chess" &&
        request.data.type === "chess:copy"
      ) {
        frame.contentWindow.postMessage(
          { type: "chess:copy", copy: messages.common.chessOnline },
          window.location.origin
        );
        return;
      }
      if (
        !request.success ||
        request.data.type !== `${game}:connect` ||
        pending
      ) {
        return;
      }
      const { id } = request.data;
      const target = frame.contentWindow;
      pending = true;
      const reply = (result: { url: string } | { error: string }) => {
        if (!disposed && frameRef.current?.contentWindow === target) {
          target.postMessage(
            { type: `${game}:connection`, id, ...result },
            window.location.origin
          );
        }
      };
      createRealtimeTicket(game)
        .then(({ ticket }) => {
          reply({
            url: buildTicketWebSocketUrl(
              `/api/games/${game}/ws`,
              ticket,
              game === "hearthvale"
                ? import.meta.env.VITE_HEARTHVALE_WS_URL
                : import.meta.env.VITE_CHESS_WS_URL
            ),
          });
        })
        .catch(() => {
          reply({
            error:
              "Could not connect to online play. Check your connection and sign in again if needed.",
          });
        })
        .finally(() => {
          pending = false;
        });
    };
    window.addEventListener("message", onMessage);
    if (game === "chess") {
      frameRef.current?.contentWindow?.postMessage(
        { type: "chess:copy", copy: messages.common.chessOnline },
        window.location.origin
      );
    }
    return () => {
      disposed = true;
      window.removeEventListener("message", onMessage);
    };
  }, [frameRef, game, messages.common.chessOnline]);
}
