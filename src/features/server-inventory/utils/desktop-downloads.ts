import Guacamole from "guacamole-common-js";
import { toast } from "sonner";

const MAX_DOWNLOAD_BYTES = 100 * 1024 * 1024;
const MAX_ACTIVE_DOWNLOADS = 3;
const PATH_SEPARATOR = /[\\/]/;

interface DownloadCopy {
  rdpDownloadFailed: string;
  rdpDownloadInterrupted: string;
  rdpDownloadLimit: string;
  rdpDownloadReady: string;
  rdpDownloadReceiving: string;
  rdpDownloadSave: string;
}

export function createDesktopDownloads(
  client: Guacamole.Client,
  copy: DownloadCopy
) {
  const pending = new Map<Guacamole.InputStream, () => void>();
  const urls = new Map<string, string | number>();
  const timers = new Set<ReturnType<typeof setTimeout>>();

  client.onfile = (stream, _mimetype, name) => {
    if (pending.size >= MAX_ACTIVE_DOWNLOADS) {
      stream.sendAck(
        "Too many downloads",
        Guacamole.Status.Code.CLIENT_TOO_MANY
      );
      toast.error(copy.rdpDownloadLimit);
      return;
    }
    const filename = name.split(PATH_SEPARATOR).at(-1) || "download";
    const id = toast.loading(copy.rdpDownloadReceiving, {
      description: filename,
    });
    const chunks: BlobPart[] = [];
    let size = 0;
    let lastProgress = 0;
    const stop = (message: string) => {
      stream.onblob = null;
      stream.onend = null;
      chunks.length = 0;
      pending.delete(stream);
      toast.error(message, { id, description: filename });
    };
    pending.set(stream, () => stop(copy.rdpDownloadInterrupted));
    stream.onblob = (data) => {
      try {
        const binary = atob(data);
        size += binary.length;
        if (size > MAX_DOWNLOAD_BYTES) {
          stream.sendAck(
            "Download exceeds 100 MiB",
            Guacamole.Status.Code.CLIENT_TOO_MANY
          );
          stop(copy.rdpDownloadLimit);
          return;
        }
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }
        chunks.push(bytes);
        if (performance.now() - lastProgress > 500) {
          toast.loading(copy.rdpDownloadReceiving, {
            id,
            description: `${filename} · ${(size / (1024 * 1024)).toFixed(1)} MiB`,
          });
          lastProgress = performance.now();
        }
        stream.sendAck("OK", Guacamole.Status.Code.SUCCESS);
      } catch {
        stream.sendAck("Download failed", Guacamole.Status.Code.SERVER_ERROR);
        stop(copy.rdpDownloadFailed);
      }
    };
    stream.onend = () => {
      pending.delete(stream);
      stream.onblob = null;
      stream.onend = null;
      try {
        const url = URL.createObjectURL(
          new Blob(chunks, { type: "application/octet-stream" })
        );
        chunks.length = 0;
        urls.set(url, id);
        const save = () => {
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.append(link);
          link.click();
          link.remove();
        };
        toast.success(copy.rdpDownloadReady, {
          id,
          description: filename,
          duration: 60_000,
          action: { label: copy.rdpDownloadSave, onClick: save },
        });
        save();
        const timer = setTimeout(() => {
          URL.revokeObjectURL(url);
          urls.delete(url);
          timers.delete(timer);
          toast.dismiss(id);
        }, 60_000);
        timers.add(timer);
      } catch {
        chunks.length = 0;
        toast.error(copy.rdpDownloadFailed, { id, description: filename });
      }
    };
    stream.sendAck("Ready", Guacamole.Status.Code.SUCCESS);
  };

  return {
    interrupt: () => {
      for (const stop of pending.values()) {
        stop();
      }
    },
    dispose: () => {
      client.onfile = null;
      for (const stop of pending.values()) {
        stop();
      }
      for (const timer of timers) {
        clearTimeout(timer);
      }
      for (const [url, id] of urls) {
        URL.revokeObjectURL(url);
        toast.dismiss(id);
      }
      timers.clear();
      urls.clear();
    },
  };
}
