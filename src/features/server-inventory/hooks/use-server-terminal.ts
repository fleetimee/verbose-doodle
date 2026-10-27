import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useI18n } from "@/components/i18n-provider";
import {
  buildTicketWebSocketUrl,
  createRealtimeTicket,
} from "@/features/realtime/ticket-client";

import {
  createTerminalFileBrowser,
  type FileListCommand,
  fileListEventSchema,
  type RemoteFileListing,
} from "@/features/server-inventory/utils/terminal-file-browser";
import {
  createTerminalFileTransfers,
  type FileTransferCommand,
  fileTransferEventSchema,
  type TerminalFileTransfer,
} from "@/features/server-inventory/utils/terminal-file-transfers";

type TerminalCommand =
  | FileListCommand
  | FileTransferCommand
  | {
      type: "connect";
      serverId: string;
      cols: number;
      rows: number;
      mode: "terminal" | "files" | "container";
      containerId?: string;
      shell?: "sh" | "bash";
    }
  | { type: "resize"; cols: number; rows: number }
  | { type: "input" | "binary-input"; data: string }
  | { type: "ping" }
  | { type: "trust-host-key"; challengeId: string };

const hostKeySchema = z.object({
  type: z.literal("host-key"),
  code: z.literal("HOST_KEY_UNKNOWN"),
  challengeId: z.string().uuid(),
  host: z.string(),
  port: z.number().int().min(1).max(65_535),
  algorithm: z.string(),
  fingerprint: z.string().startsWith("SHA256:"),
});

const terminalEventSchema = z.union([
  z.object({
    type: z.enum(["connected", "error", "pong"]),
    code: z.string(),
  }),
  hostKeySchema,
  fileTransferEventSchema,
  fileListEventSchema,
]);

const SUDO_PASSWORD_PROMPT_REGEX = /\[sudo\]\s+password(\s+for\s+\S+)?:\s*$/i;
const GENERIC_PASSWORD_PROMPT_REGEX = /(?:^|\s)password:\s*$/i;
const PASSPHRASE_PROMPT_REGEX = /(?:^|\s)passphrase:\s*$/i;

function isPasswordPromptText(text: string): boolean {
  return (
    SUDO_PASSWORD_PROMPT_REGEX.test(text) ||
    GENERIC_PASSWORD_PROMPT_REGEX.test(text) ||
    PASSPHRASE_PROMPT_REGEX.test(text)
  );
}

function terminalSocketUrl(ticket: string, containerMode: boolean) {
  const path = containerMode
    ? "/api/servers/container-terminal"
    : "/api/servers/terminal";
  const configured = containerMode
    ? import.meta.env.VITE_SERVER_CONTAINER_WS_URL ||
      import.meta.env.VITE_SERVER_SSH_WS_URL
    : import.meta.env.VITE_SERVER_SSH_WS_URL;
  const url = new URL(buildTicketWebSocketUrl(path, ticket, configured));
  if (containerMode && url.pathname.endsWith("/terminal")) {
    url.pathname = `${url.pathname.slice(0, -"/terminal".length)}/container-terminal`;
  }
  if (containerMode && !url.pathname.endsWith("/container-terminal")) {
    throw new Error(
      "Container WebSocket URL must end with /container-terminal"
    );
  }
  return url.toString();
}

export function useServerTerminal(
  serverId: string,
  attempt: number,
  mode: "terminal" | "files" | "container" = "terminal",
  container?: { id: string; shell: "sh" | "bash" }
) {
  const containerId = container?.id;
  const containerShell = container?.shell;
  const { messages } = useI18n();
  const copy = messages.servers;
  const browserRef = useRef<ReturnType<
    typeof createTerminalFileBrowser
  > | null>(null);
  const listFiles = useCallback(
    (path: string): Promise<RemoteFileListing> =>
      browserRef.current?.list(path) ??
      Promise.reject(new Error(copy.sshTransferInterrupted)),
    [copy.sshTransferInterrupted]
  );
  const filesRef = useRef<ReturnType<
    typeof createTerminalFileTransfers
  > | null>(null);
  const [fileTransfer, setFileTransfer] = useState<TerminalFileTransfer | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<(challengeId: string) => void>(() => undefined);
  const [hostKey, setHostKey] = useState<z.infer<typeof hostKeySchema> | null>(
    null
  );
  const [trustPending, setTrustPending] = useState(false);
  const disconnectRef = useRef<() => void>(() => undefined);
  const sendInputRef = useRef<(data: string) => void>(() => undefined);
  const terminalRef = useRef<Terminal | null>(null);
  const resizeRef = useRef<() => void>(() => undefined);
  const keyboardInputRef = useRef<HTMLTextAreaElement | null>(null);
  const fontSizeRef = useRef(14);
  const [fontSize, setFontSize] = useState(14);
  const [hasSelection, setHasSelection] = useState(false);
  const [passwordPrompt, setPasswordPrompt] = useState<{
    x: number;
    y: number;
    promptText: string;
  } | null>(null);

  function changeFontSize(value: number) {
    const next = Math.max(10, Math.min(24, value));
    fontSizeRef.current = next;
    setFontSize(next);
    if (terminalRef.current) {
      terminalRef.current.options.fontSize = next;
      resizeRef.current();
    }
  }
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
    let resizeFrame = 0;
    let lastCols = 0;
    let lastRows = 0;
    const terminal = new Terminal({
      cursorBlink: false,
      fontFamily: '"Geist Mono", monospace',
      fontSize: fontSizeRef.current,
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
    terminalRef.current = terminal;
    keyboardInputRef.current = terminal.textarea ?? null;
    setHasSelection(false);
    const selection = terminal.onSelectionChange(() => {
      if (!disposed) {
        setHasSelection(terminal.hasSelection());
      }
    });
    terminal.textarea?.setAttribute("aria-label", copy.sshTitle);
    setStatus("connecting");
    setError("");
    setHostKey(null);
    setTrustPending(false);

    function send(message: TerminalCommand) {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        return true;
      }
      return false;
    }
    const files = createTerminalFileTransfers(
      (command) => connected && send(command),
      copy,
      (transfer) => {
        if (!disposed) {
          setFileTransfer(transfer);
        }
      }
    );
    const browser = createTerminalFileBrowser(
      (command) => connected && send(command),
      copy
    );
    browserRef.current = browser;
    filesRef.current = files;
    setFileTransfer(null);
    function resize() {
      if (
        container &&
        container.clientWidth > 0 &&
        container.clientHeight > 0
      ) {
        fit.fit();
        const cols = Math.min(terminal.cols, 500);
        const rows = Math.min(terminal.rows, 200);
        if (connected && (cols !== lastCols || rows !== lastRows)) {
          send({
            type: "resize",
            cols,
            rows,
          });
          lastCols = cols;
          lastRows = rows;
        }
      }
    }
    function scheduleResize() {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (!disposed) {
          resize();
        }
      });
    }
    resizeRef.current = scheduleResize;
    const observer = new ResizeObserver(scheduleResize);
    observer.observe(container);
    resize();
    document.fonts.ready.then(() => {
      if (!disposed) {
        scheduleResize();
      }
    });
    sendInputRef.current = (data: string) => {
      if (connected) {
        send({ type: "input", data });
        setPasswordPrompt(null);
      }
    };
    const input = terminal.onData((data) => {
      if (connected) {
        send({ type: "input", data });
        if (
          data.includes("\r") ||
          data.includes("\n") ||
          data.includes("\x03")
        ) {
          setPasswordPrompt(null);
        }
      }
    });
    const binaryInput = terminal.onBinary((data) => {
      if (connected) {
        // Mouse reports from xterm use bytes rather than Unicode text.
        send({ type: "binary-input", data });
      }
    });
    const heartbeat = window.setInterval(() => send({ type: "ping" }), 20_000);
    let timeout = window.setTimeout(() => {
      if (!(disposed || cancelled || connected)) {
        setError(copy.sshConnectionFailed);
        disconnectRef.current();
      }
    }, 30_000);

    disconnectRef.current = () => {
      setHostKey(null);
      setTrustPending(false);
      browser.interrupt();
      files.interrupt();
      cancelled = true;
      connected = false;
      window.clearTimeout(timeout);
      window.clearInterval(heartbeat);
      socket?.close();
      setStatus("disconnected");
    };

    trustRef.current = (challengeId) => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        setError(copy.sshConnectionFailed);
        disconnectRef.current();
      }, 30_000);
      setTrustPending(true);
      send({ type: "trust-host-key", challengeId });
    };

    function checkForPasswordPrompt() {
      if (disposed || !connected) {
        return;
      }
      try {
        const buffer = terminal.buffer.active;
        const line = buffer.getLine(buffer.baseY + buffer.cursorY);
        const text = line?.translateToString(true).trim() ?? "";
        if (!isPasswordPromptText(text)) {
          setPasswordPrompt(null);
          return;
        }

        const cols = Math.max(1, terminal.cols);
        const rows = Math.max(1, terminal.rows);
        const charWidth = container
          ? container.clientWidth / cols
          : fontSizeRef.current * 0.6;
        const charHeight = container
          ? container.clientHeight / rows
          : fontSizeRef.current * 1.2;

        setPasswordPrompt({
          x: Math.max(12, buffer.cursorX * charWidth),
          y: Math.max(12, buffer.cursorY * charHeight),
          promptText: text,
        });
      } catch {
        setPasswordPrompt(null);
      }
    }

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
        checkForPasswordPrompt();
      });
    }

    function handleConnectionError(code: string) {
      const errors = new Map([
        ["AUTH_FAILED", copy.sshAuthFailed],
        ["HOST_KEY_REJECTED", copy.sshHostKeyRejected],
        ["INVALID_ENTRY", copy.sshCredentialsRequired],
        ["KNOWN_HOSTS_MISSING", copy.sshKnownHostsMissing],
        ["KNOWN_HOSTS_WRITE_FAILED", copy.sshKnownHostsWriteFailed],
        ["HOST_KEY_APPROVAL_EXPIRED", copy.sshHostKeyApprovalExpired],
        ["CAPACITY_EXCEEDED", copy.sshCapacityExceeded],
        ["CONTAINER_EXEC_FAILED", copy.containers.execFailed],
      ]);
      setHostKey(null);
      setTrustPending(false);
      setError(errors.get(code) ?? copy.sshConnectionFailed);
      socket?.close();
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
        switch (message.type) {
          case "file-list":
            browser.handle(message);
            break;
          case "file-transfer":
            files.handle(message);
            break;
          case "host-key":
            setHostKey(message);
            window.clearTimeout(timeout);
            timeout = window.setTimeout(() => {
              setError(copy.sshHostKeyApprovalExpired);
              disconnectRef.current();
            }, 95_000);
            break;
          case "connected":
            setHostKey(null);
            setTrustPending(false);
            connected = true;
            window.clearTimeout(timeout);
            setStatus("connected");
            resize();
            terminal.focus();
            break;
          case "error":
            handleConnectionError(message.code);
            break;
          default:
            break;
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
        socket = new WebSocket(terminalSocketUrl(ticket, mode === "container"));
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
            mode,
            containerId,
            shell: containerShell,
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
          browser.interrupt();
          files.interrupt();
          connected = false;
          window.clearTimeout(timeout);
          window.clearInterval(heartbeat);
          if (!disposed) {
            setHostKey(null);
            setTrustPending(false);
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
      browser.interrupt();
      browserRef.current = null;
      files.dispose();
      filesRef.current = null;
      disposed = true;
      connected = false;
      window.clearTimeout(timeout);
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", close);
      socket?.close();
      disconnectRef.current = () => undefined;
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
      input.dispose();
      binaryInput.dispose();
      selection.dispose();
      terminal.dispose();
      terminalRef.current = null;
      keyboardInputRef.current = null;
      sendInputRef.current = () => undefined;
      resizeRef.current = () => undefined;
      trustRef.current = () => undefined;
    };
  }, [serverId, attempt, copy, mode, containerId, containerShell]);

  return {
    containerRef,
    fileTransfer,
    listFiles,
    uploadFile: (directory: string, file: File) =>
      filesRef.current?.upload(directory, file) ?? false,
    downloadFile: (path: string) => filesRef.current?.download(path) ?? false,
    cancelFileTransfer: () => filesRef.current?.cancel(),
    keyboardInputRef,
    fontSize,
    hasSelection,
    changeFontSize,
    clear: () => terminalRef.current?.clear(),
    selectAll: () => terminalRef.current?.selectAll(),
    getSelection: () => terminalRef.current?.getSelection() ?? "",
    sendInput: (data: string) => sendInputRef.current(data),
    focus: () => terminalRef.current?.focus(),
    status,
    error,
    hostKey,
    trustPending,
    trustHostKey: () => {
      if (hostKey && !trustPending) {
        trustRef.current(hostKey.challengeId);
      }
    },
    passwordPrompt,
    dismissPasswordPrompt: () => setPasswordPrompt(null),
    disconnect: () => disconnectRef.current(),
  };
}
