import Guacamole from "guacamole-common-js";
import { toast } from "sonner";

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_BATCH_BYTES = 300 * 1024 * 1024;
const MAX_BATCH_FILES = 10;
const CHUNK_BYTES = Guacamole.ArrayBufferWriter.DEFAULT_BLOB_LENGTH;

interface UploadCopy {
  rdpUploadAction: string;
  rdpUploadCancel: string;
  rdpUploadCancelled: string;
  rdpUploadFailed: string;
  rdpUploadInterrupted: string;
  rdpUploadLimit: string;
  rdpUploadReady: string;
  rdpUploadSending: string;
}

export function createDesktopUploads(
  client: Guacamole.Client,
  copy: UploadCopy,
  onBusyChange: (busy: boolean) => void
) {
  let disposed = false;
  let busy = false;
  let queue: File[] = [];
  let picker: HTMLInputElement | null = null;
  let stopCurrent: ((message: string) => void) | null = null;

  const stop = (message: string) => {
    queue = [];
    if (stopCurrent) {
      stopCurrent(message);
    } else {
      busy = false;
      onBusyChange(false);
    }
  };

  const next = () => {
    const file = queue.shift();
    if (!file || disposed) {
      busy = false;
      onBusyChange(false);
      return;
    }
    const id = toast.loading(copy.rdpUploadSending, {
      description: file.name,
      action: {
        label: copy.rdpUploadCancel,
        onClick: () => stop(copy.rdpUploadCancelled),
      },
    });
    const stream = client.createFileStream(
      "application/octet-stream",
      file.name
    );
    const writer = new Guacamole.ArrayBufferWriter(stream);
    let offset = 0;
    let pendingBytes = 0;
    let ended = false;
    let waitingAck = true;
    let cancellation: string | null = null;
    let lastProgress = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const finish = (message: string, success = false) => {
      if (ended) {
        return;
      }
      ended = true;
      clearTimeout(timeout);
      writer.onack = null;
      stopCurrent = null;
      writer.sendEnd();
      if (success) {
        toast.success(message, { id, description: file.name, action: null });
      } else {
        queue = [];
        toast.error(message, { id, description: file.name, action: null });
      }
      next();
    };
    stopCurrent = (message) => {
      if (waitingAck && !disposed) {
        cancellation = message;
      } else {
        finish(message);
      }
    };
    const armTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(
        () => finish(cancellation ?? copy.rdpUploadFailed),
        30_000
      );
    };
    const sendChunk = async () => {
      try {
        const data = await file
          .slice(offset, offset + CHUNK_BYTES)
          .arrayBuffer();
        if (ended || disposed) {
          return;
        }
        pendingBytes = data.byteLength;
        waitingAck = true;
        armTimeout();
        writer.sendData(data);
      } catch {
        finish(copy.rdpUploadFailed);
      }
    };
    writer.onack = (status) => {
      if (ended) {
        return;
      }
      waitingAck = false;
      if (cancellation) {
        finish(cancellation);
        return;
      }
      if (status.isError()) {
        finish(
          status.code === Guacamole.Status.Code.CLIENT_TOO_MANY
            ? copy.rdpUploadLimit
            : copy.rdpUploadFailed
        );
        return;
      }
      clearTimeout(timeout);
      offset += pendingBytes;
      if (offset === file.size) {
        finish(copy.rdpUploadReady, true);
        return;
      }
      if (performance.now() - lastProgress > 500) {
        toast.loading(copy.rdpUploadSending, {
          id,
          description: `${file.name} · ${Math.round((offset / file.size) * 100)}%`,
          action: {
            label: copy.rdpUploadCancel,
            onClick: () => stop(copy.rdpUploadCancelled),
          },
        });
        lastProgress = performance.now();
      }
      sendChunk();
    };
    armTimeout();
  };

  return {
    chooseFiles: () => {
      if (busy || disposed || picker) {
        return;
      }
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.setAttribute("aria-label", copy.rdpUploadAction);
      picker = input;
      const removePicker = () => {
        input.remove();
        picker = null;
      };
      input.oncancel = removePicker;
      input.onchange = () => {
        const files = Array.from(input.files ?? []);
        removePicker();
        if (disposed || files.length === 0) {
          return;
        }
        if (
          files.length > MAX_BATCH_FILES ||
          files.some((file) => file.size > MAX_FILE_BYTES) ||
          files.reduce((total, file) => total + file.size, 0) > MAX_BATCH_BYTES
        ) {
          toast.error(copy.rdpUploadLimit);
          return;
        }
        queue = files;
        busy = true;
        onBusyChange(true);
        next();
      };
      input.click();
    },
    cancel: () => stop(copy.rdpUploadCancelled),
    interrupt: () => {
      disposed = true;
      picker?.remove();
      picker = null;
      stop(copy.rdpUploadInterrupted);
    },
  };
}
