import { z } from "zod";
import type { Messages } from "@/lib/i18n";
import { generateUUID } from "@/lib/utils";

export const remoteFileEntrySchema = z.object({
  name: z.string().min(1).max(1024),
  kind: z.enum(["directory", "file", "symlink", "other"]),
  size: z.number().int().nonnegative(),
  modified: z.number().int().nonnegative(),
  permissions: z.string(),
});

export const fileListEventSchema = z.object({
  type: z.literal("file-list"),
  id: z.string().uuid(),
  status: z.enum(["entries", "complete", "error", "cancelled"]),
  code: z.string().optional(),
  path: z.string().optional(),
  entries: z.array(remoteFileEntrySchema).max(25).optional(),
  truncated: z.boolean().optional(),
});

export type RemoteFileEntry = z.infer<typeof remoteFileEntrySchema>;
export interface RemoteFileListing {
  entries: RemoteFileEntry[];
  path: string;
  truncated: boolean;
}
export type FileListCommand =
  | { type: "file-list"; id: string; path: string }
  | { type: "file-cancel"; id: string };

export function createTerminalFileBrowser(
  send: (command: FileListCommand) => boolean,
  copy: Messages["servers"]
) {
  let pending: {
    id: string;
    listing: RemoteFileListing;
    resolve: (listing: RemoteFileListing) => void;
    reject: (error: Error) => void;
  } | null = null;
  let timeout = 0;

  function fail(message: string) {
    const current = pending;
    pending = null;
    window.clearTimeout(timeout);
    current?.reject(new Error(message));
  }

  function handle(event: z.infer<typeof fileListEventSchema>) {
    const current = pending;
    if (!current || event.id !== current.id) {
      return;
    }
    if (event.status === "entries") {
      if (
        event.path === undefined ||
        !event.entries ||
        current.listing.entries.length + event.entries.length > 1000
      ) {
        send({ type: "file-cancel", id: current.id });
        fail(copy.sftpListFailed);
        return;
      }
      current.listing.path = event.path;
      current.listing.entries.push(...event.entries);
      current.listing.truncated ||= event.truncated ?? false;
    } else if (event.status === "complete") {
      pending = null;
      window.clearTimeout(timeout);
      current.resolve(current.listing);
    } else {
      const errors = new Map([
        ["NOT_A_DIRECTORY", copy.sftpNotDirectory],
        ["BUSY", copy.sshTransferBusy],
        ["NOT_CONNECTED", copy.sshTransferInterrupted],
      ]);
      fail(errors.get(event.code ?? "") ?? copy.sftpListFailed);
    }
  }

  function list(path: string): Promise<RemoteFileListing> {
    if (pending) {
      return Promise.reject(new Error(copy.sshTransferBusy));
    }
    return new Promise((resolve, reject) => {
      const id = generateUUID();
      pending = {
        id,
        resolve,
        reject,
        listing: { entries: [], path, truncated: false },
      };
      if (!send({ type: "file-list", id, path })) {
        fail(copy.sshTransferInterrupted);
        return;
      }
      timeout = window.setTimeout(() => {
        send({ type: "file-cancel", id });
        fail(copy.sftpListFailed);
      }, 45_000);
    });
  }

  return { handle, list, interrupt: () => fail(copy.sshTransferInterrupted) };
}

export function joinRemotePath(directory: string, name: string) {
  return `${directory.endsWith("/") ? directory : `${directory}/`}${name}`;
}

export function parentFilePath(path: string) {
  const segments = path.split("/").filter(Boolean);
  segments.pop();
  return `/${segments.join("/")}`;
}

export interface BrowserFileEntry extends RemoteFileEntry {
  file?: File;
}

function localEntry(
  file: File,
  name: string,
  directory: boolean
): BrowserFileEntry {
  return {
    name,
    kind: directory ? "directory" : "file",
    size: directory ? 0 : file.size,
    modified: directory ? 0 : Math.floor(file.lastModified / 1000),
    permissions: "",
    file: directory ? undefined : file,
  };
}

export function localFileEntries(
  files: File[],
  path: string
): BrowserFileEntry[] {
  const entries = new Map<string, BrowserFileEntry>();
  const prefix = path === "/" ? "" : `${path.slice(1)}/`;
  for (const file of files) {
    const relativePath = file.webkitRelativePath;
    const relative = relativePath
      ? relativePath.split("/").slice(1).join("/")
      : file.name;
    if (!relative.startsWith(prefix)) {
      continue;
    }
    const remaining = relative.slice(prefix.length);
    const parts = remaining.split("/");
    const name = parts[0];
    if (!name) {
      continue;
    }
    const directory = parts.length > 1;
    if (!entries.has(name)) {
      entries.set(name, localEntry(file, name, directory));
    }
  }
  return [...entries.values()];
}
