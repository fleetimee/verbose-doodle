import { useEffect, useState } from "react";
import { z } from "zod";
import {
  buildTicketWebSocketUrl,
  createRealtimeTicket,
} from "@/features/realtime/ticket-client";

const BUFFER_LIMIT = 200_000;
const TERMINAL_PATH = /\/(?:container-terminal|terminal)$/;

const logEventSchema = z.object({
  type: z.string(),
  code: z.string().optional(),
});

function logEventStatus(payload: string): string | null {
  const message = logEventSchema.parse(JSON.parse(payload));
  if (message.type === "connected") {
    return "live";
  }
  if (message.type === "error") {
    return message.code ?? "CONNECTION_FAILED";
  }
  return null;
}

function logsSocketUrl(ticket: string) {
  const configured =
    import.meta.env.VITE_SERVER_CONTAINER_WS_URL ||
    import.meta.env.VITE_SERVER_SSH_WS_URL;
  const url = new URL(
    buildTicketWebSocketUrl("/api/servers/container-logs", ticket, configured)
  );
  url.pathname = url.pathname.replace(TERMINAL_PATH, "/container-logs");
  if (!url.pathname.endsWith("/container-logs")) {
    throw new Error(
      "Container logs WebSocket URL must end with /container-logs"
    );
  }
  return url.toString();
}

export function useContainerLogs(
  serverId: string,
  containerId: string,
  active: boolean
) {
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("idle");
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const changed = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", changed);
    return () => document.removeEventListener("visibilitychange", changed);
  }, []);
  useEffect(() => {
    if (!(active && visible)) {
      return;
    }
    let disposed = false;
    let socket: WebSocket | undefined;
    let pending = "";
    const decoder = new TextDecoder();
    setOutput("");
    setStatus("connecting");
    const flush = () => {
      if (!pending) {
        return;
      }
      const chunk = pending;
      pending = "";
      setOutput((previous) => (previous + chunk).slice(-BUFFER_LIMIT));
    };
    const timer = window.setInterval(flush, 150);
    const heartbeat = window.setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 20_000);
    const connect = async () => {
      try {
        const { ticket } = await createRealtimeTicket("server-ssh");
        if (disposed) {
          return;
        }
        socket = new WebSocket(logsSocketUrl(ticket));
        socket.binaryType = "arraybuffer";
        socket.onopen = () =>
          socket?.send(
            JSON.stringify({
              type: "connect",
              mode: "logs",
              serverId,
              containerId,
            })
          );
        socket.onmessage = (event: MessageEvent) => {
          if (disposed) {
            return;
          }
          if (event.data instanceof ArrayBuffer) {
            pending = (
              pending + decoder.decode(event.data, { stream: true })
            ).slice(-BUFFER_LIMIT);
            return;
          }
          try {
            const nextStatus = logEventStatus(event.data);
            if (nextStatus !== null) {
              setStatus(nextStatus);
            }
          } catch {
            setStatus("CONNECTION_FAILED");
            socket?.close();
          }
        };
        socket.onerror = () => {
          if (!disposed) {
            setStatus("CONNECTION_FAILED");
          }
        };
        socket.onclose = () => {
          if (!disposed) {
            pending = (pending + decoder.decode()).slice(-BUFFER_LIMIT);
            flush();
            setStatus((current) =>
              current === "live" || current === "connecting" ? "ended" : current
            );
          }
        };
      } catch {
        if (!disposed) {
          setStatus("CONNECTION_FAILED");
        }
      }
    };
    connect();
    return () => {
      disposed = true;
      window.clearInterval(timer);
      window.clearInterval(heartbeat);
      flush();
      socket?.close();
    };
  }, [active, visible, serverId, containerId]);
  return { output, status, visible, clear: () => setOutput("") };
}
