import { toast } from "sonner";
import { z } from "zod";
import type { Messages } from "@/lib/i18n";
import { generateUUID } from "@/lib/utils";

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const CHUNK_BYTES = 24 * 1024;
const PATH_SEPARATOR = /[\\/]/;
const TRAILING_SLASH = /\/$/;
type FileTransferEvent = z.infer<typeof fileTransferEventSchema>;

export type FileTransferCommand =
  | { type: "file-upload"; id: string; path: string; size: number }
  | { type: "file-download"; id: string; path: string }
  | { type: "file-chunk"; id: string; data: string }
  | { type: "file-end" | "file-cancel"; id: string }
  | { type: "file-ack"; id: string; bytes: number };

export const fileTransferEventSchema = z.object({
  type: z.literal("file-transfer"),
  id: z.string().uuid(),
  status: z.enum([
    "ready",
    "progress",
    "chunk",
    "complete",
    "cancelled",
    "error",
  ]),
  code: z.string().optional(),
  size: z.number().int().min(0).max(MAX_FILE_BYTES).optional(),
  bytes: z.number().int().min(0).max(MAX_FILE_BYTES).optional(),
  name: z.string().optional(),
  data: z
    .string()
    .max((CHUNK_BYTES * 4) / 3)
    .optional(),
});

export interface TerminalFileTransfer {
  bytes: number;
  cancelling: boolean;
  direction: "upload" | "download";
  name: string;
  size: number | null;
}

interface ActiveTransfer extends TerminalFileTransfer {
  chunks: Uint8Array<ArrayBuffer>[];
  file?: File;
  id: string;
  ready: boolean;
}

export function createTerminalFileTransfers(
  send: (command: FileTransferCommand) => boolean,
  copy: Messages["servers"],
  onChange: (transfer: TerminalFileTransfer | null) => void
) {
  let active: ActiveTransfer | null = null;
  let timeout = 0;
  const urls = new Set<string>();

  function finish(message: string, success = false) {
    if (!active) {
      return;
    }
    const name = active.name;
    active = null;
    window.clearTimeout(timeout);
    onChange(null);
    if (success) {
      toast.success(message, { description: name });
    } else {
      toast.error(message, { description: name });
    }
  }

  function refresh() {
    onChange(active ? { ...active } : null);
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      if (active) {
        send({ type: "file-cancel", id: active.id });
        finish(copy.sshTransferTimeout);
      }
    }, 45_000);
  }

  function cancel() {
    if (active && !active.cancelling) {
      active.cancelling = true;
      send({ type: "file-cancel", id: active.id });
      refresh();
    }
  }

  async function sendNextChunk(transfer: ActiveTransfer) {
    try {
      const file = transfer.file;
      if (!file || active !== transfer || transfer.cancelling) {
        return;
      }
      if (transfer.bytes === file.size) {
        send({ type: "file-end", id: transfer.id });
        return;
      }
      const bytes = new Uint8Array(
        await file
          .slice(transfer.bytes, transfer.bytes + CHUNK_BYTES)
          .arrayBuffer()
      );
      if (active !== transfer || transfer.cancelling) {
        return;
      }
      let binary = "";
      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }
      send({ type: "file-chunk", id: transfer.id, data: btoa(binary) });
    } catch {
      if (active === transfer) {
        send({ type: "file-cancel", id: transfer.id });
        finish(copy.sshTransferFailed);
      }
    }
  }

  function saveDownload(transfer: ActiveTransfer) {
    const url = URL.createObjectURL(
      new Blob(transfer.chunks, { type: "application/octet-stream" })
    );
    urls.add(url);
    const save = () => {
      const link = document.createElement("a");
      link.href = url;
      link.download = transfer.name;
      document.body.append(link);
      link.click();
      link.remove();
    };
    save();
    toast.success(copy.sshDownloadReady, {
      description: transfer.name,
      duration: 60_000,
      action: { label: copy.rdpDownloadSave, onClick: save },
    });
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      urls.delete(url);
    }, 60_000);
  }

  function handleReady(transfer: ActiveTransfer, event: FileTransferEvent) {
    if (transfer.ready || event.size === undefined) {
      throw new Error("Invalid transfer size");
    }
    transfer.ready = true;
    transfer.size = event.size;
    if (transfer.direction === "upload") {
      if (event.size !== transfer.file?.size) {
        throw new Error("Upload size mismatch");
      }
      sendNextChunk(transfer);
    } else {
      transfer.name = event.name?.split(PATH_SEPARATOR).at(-1) || "download";
      send({ type: "file-ack", id: transfer.id, bytes: 0 });
    }
  }

  function handleProgress(transfer: ActiveTransfer, event: FileTransferEvent) {
    const expected = Math.min(transfer.bytes + CHUNK_BYTES, transfer.size ?? 0);
    if (
      !transfer.ready ||
      transfer.direction !== "upload" ||
      event.bytes !== expected
    ) {
      throw new Error("Invalid upload progress");
    }
    transfer.bytes = event.bytes;
    sendNextChunk(transfer);
  }

  function handleChunk(transfer: ActiveTransfer, event: FileTransferEvent) {
    if (!transfer.ready || transfer.direction !== "download" || !event.data) {
      throw new Error("Invalid download chunk");
    }
    const binary = atob(event.data);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0)
    );
    if (
      event.bytes !== transfer.bytes + bytes.length ||
      event.bytes > (transfer.size ?? 0)
    ) {
      throw new Error("Invalid download progress");
    }
    transfer.chunks.push(bytes);
    transfer.bytes = event.bytes;
    send({ type: "file-ack", id: transfer.id, bytes: transfer.bytes });
  }

  function handleComplete(transfer: ActiveTransfer) {
    if (!transfer.ready || transfer.bytes !== transfer.size) {
      throw new Error("Incomplete transfer");
    }
    if (transfer.direction === "download") {
      saveDownload(transfer);
      active = null;
      window.clearTimeout(timeout);
      onChange(null);
    } else {
      finish(copy.sshUploadReady, true);
    }
  }

  function handle(event: FileTransferEvent) {
    const transfer = active;
    if (!transfer || event.id !== transfer.id) {
      return;
    }
    if (event.status === "error") {
      const errors = new Map([
        ["FILE_EXISTS", copy.sshTransferExists],
        ["LIMIT_EXCEEDED", copy.sshTransferLimit],
        ["NOT_A_FILE", copy.sshTransferNotFile],
        ["FILE_CHANGED", copy.sshTransferChanged],
        ["TRANSFER_TIMEOUT", copy.sshTransferTimeout],
        ["BUSY", copy.sshTransferBusy],
      ]);
      finish(errors.get(event.code ?? "") ?? copy.sshTransferFailed);
      return;
    }
    if (event.status === "cancelled") {
      finish(copy.sshTransferCancelled);
      return;
    }
    if (transfer.cancelling && event.status !== "complete") {
      return;
    }
    try {
      switch (event.status) {
        case "ready":
          handleReady(transfer, event);
          break;
        case "progress":
          handleProgress(transfer, event);
          break;
        case "chunk":
          handleChunk(transfer, event);
          break;
        case "complete":
          handleComplete(transfer);
          return;
        default:
          break;
      }
      refresh();
    } catch {
      send({ type: "file-cancel", id: transfer.id });
      finish(copy.sshTransferFailed);
    }
  }

  function start(direction: "upload" | "download", path: string, file?: File) {
    if (active) {
      return false;
    }
    if (file && file.size > MAX_FILE_BYTES) {
      toast.error(copy.sshTransferLimit);
      return false;
    }
    const id = generateUUID();
    active = {
      id,
      direction,
      name: file?.name ?? path,
      bytes: 0,
      size: file?.size ?? null,
      cancelling: false,
      file,
      chunks: [],
      ready: false,
    };
    const command: FileTransferCommand = file
      ? { type: "file-upload", id, path, size: file.size }
      : { type: "file-download", id, path };
    if (!send(command)) {
      finish(copy.sshTransferInterrupted);
      return false;
    }
    refresh();
    return true;
  }

  return {
    handle,
    cancel,
    upload: (directory: string, file: File) =>
      start(
        "upload",
        `${directory.replace(TRAILING_SLASH, "")}/${file.name}`,
        file
      ),
    download: (path: string) => start("download", path),
    interrupt: () => finish(copy.sshTransferInterrupted),
    dispose: () => {
      finish(copy.sshTransferInterrupted);
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    },
  };
}
