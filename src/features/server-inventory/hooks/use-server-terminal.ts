import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useI18n } from "@/components/i18n-provider";
import {
  buildTicketWebSocketUrl,
  createRealtimeTicket,
} from "@/features/realtime/ticket-client";

type TerminalCommand =
  | { type: "connect"; serverId: string; cols: number; rows: number }
  | { type: "resize"; cols: number; rows: number }
  | { type: "input" | "binary-input"; data: string }
  | { type: "ping" };

const terminalEventSchema = z.object({
  type: z.enum(["connected", "error", "pong"]),
  code: z.string(),
});

export function useServerTerminal(serverId: string, attempt: number) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const containerRef = useRef<HTMLDivElement>(null);
  const disconnectRef = useRef<() => void>(() => undefined);
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    let disposed = false;
    let cancelled = false;
    let connected = false;
    let socket: WebSocket | null = null;
    let outputBytes = 0;
    const terminal = new Terminal({
      cursorBlink: false,
      fontFamily: '"Geist Mono", monospace',
      fontSize: 14,
      scrollback: 5000,
      screenReaderMode: true,
      theme: {
        background: "#182027",
        foreground: "#dfe7e9",
        cursor: "#dfe7e9",
      },
    });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(container);
    terminal.textarea?.setAttribute("aria-label", copy.sshTitle);
    setStatus("connecting");
    setError("");

    function send(message: TerminalCommand) {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    }
    function resize() {
      if (
        container &&
        container.clientWidth > 0 &&
        container.clientHeight > 0
      ) {
        fit.fit();
        if (connected) {
          send({
            type: "resize",
            cols: Math.min(terminal.cols, 500),
            rows: Math.min(terminal.rows, 200),
          });
        }
      }
    }
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    document.fonts.ready.then(() => {
      if (!disposed) {
        resize();
      }
    });
    const input = terminal.onData((data) => {
      if (connected) {
        send({ type: "input", data });
      }
    });
    const binaryInput = terminal.onBinary((data) => {
      if (connected) {
        // Mouse reports from xterm use bytes rather than Unicode text.
        send({ type: "binary-input", data });
      }
    });
    const heartbeat = window.setInterval(() => send({ type: "ping" }), 20_000);
    const timeout = window.setTimeout(() => {
      if (!(disposed || cancelled || connected)) {
        setError(copy.sshConnectionFailed);
        disconnectRef.current();
      }
    }, 30_000);

    disconnectRef.current = () => {
      cancelled = true;
      connected = false;
      window.clearTimeout(timeout);
      window.clearInterval(heartbeat);
      socket?.close();
      setStatus("disconnected");
    };

    function writeOutput(data: ArrayBuffer) {
      const bytes = new Uint8Array(data);
      outputBytes += bytes.length;
      if (outputBytes > 1_048_576) {
        setError(copy.sshOutputOverflow);
        socket?.close();
        return;
      }
      terminal.write(bytes, () => {
        outputBytes -= bytes.length;
      });
    }

    function handleControl(data: string) {
      try {
        const result = terminalEventSchema.safeParse(JSON.parse(data));
        if (!result.success) {
          setError(copy.sshConnectionFailed);
          disconnectRef.current();
          return;
        }
        const message = result.data;
        if (message.type === "connected") {
          connected = true;
          window.clearTimeout(timeout);
          setStatus("connected");
          resize();
          terminal.focus();
        } else if (message.type === "error") {
          const errors = new Map([
            ["AUTH_FAILED", copy.sshAuthFailed],
            ["HOST_KEY_REJECTED", copy.sshHostKeyRejected],
            ["INVALID_ENTRY", copy.sshCredentialsRequired],
            ["KNOWN_HOSTS_MISSING", copy.sshKnownHostsMissing],
            ["CAPACITY_EXCEEDED", copy.sshCapacityExceeded],
          ]);
          setError(errors.get(message.code) ?? copy.sshConnectionFailed);
          socket?.close();
        }
      } catch {
        setError(copy.sshConnectionFailed);
        disconnectRef.current();
      }
    }

    async function connect() {
      try {
        const { ticket } = await createRealtimeTicket("server-ssh");
        if (disposed || cancelled) {
          return;
        }
        socket = new WebSocket(
          buildTicketWebSocketUrl(
            "/api/servers/terminal",
            ticket,
            import.meta.env.VITE_SERVER_SSH_WS_URL
          )
        );
        socket.binaryType = "arraybuffer";

        socket.onopen = () => {
          if (disposed || cancelled) {
            socket?.close();
            return;
          }
          resize();
          send({
            type: "connect",
            serverId,
            cols: Math.min(terminal.cols, 500),
            rows: Math.min(terminal.rows, 200),
          });
        };
        socket.onmessage = (event: MessageEvent<string | ArrayBuffer>) => {
          if (disposed || cancelled) {
            return;
          }
          if (event.data instanceof ArrayBuffer) {
            writeOutput(event.data);
            return;
          }
          handleControl(event.data);
        };
        socket.onerror = () => {
          if (!(disposed || cancelled)) {
            setError(copy.sshConnectionFailed);
            disconnectRef.current();
          }
        };
        socket.onclose = (event) => {
          if (!(disposed || cancelled || connected)) {
            setError(
              (current) =>
                current ||
                (event.code === 1013
                  ? copy.sshCapacityExceeded
                  : copy.sshConnectionFailed)
            );
          }
          connected = false;
          window.clearTimeout(timeout);
          window.clearInterval(heartbeat);
          if (!disposed) {
            setStatus("disconnected");
          }
        };
      } catch {
        if (!(disposed || cancelled)) {
          setError(copy.sshConnectionFailed);
          disconnectRef.current();
        }
      }
    }
    connect();
    const close = () => disconnectRef.current();
    window.addEventListener("pagehide", close);
    return () => {
      disposed = true;
      connected = false;
      window.clearTimeout(timeout);
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", close);
      socket?.close();
      disconnectRef.current = () => undefined;
      observer.disconnect();
      input.dispose();
      binaryInput.dispose();
      terminal.dispose();
    };
  }, [serverId, attempt, copy]);

  return {
    containerRef,
    status,
    error,
    disconnect: () => disconnectRef.current(),
  };
}
