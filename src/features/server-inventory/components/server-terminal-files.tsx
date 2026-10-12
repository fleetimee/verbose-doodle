import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import type { TerminalFileTransfer } from "@/features/server-inventory/utils/terminal-file-transfers";

export type TerminalFileAction = "upload" | "download" | null;

interface TerminalFilesProps {
  action: TerminalFileAction;
  connected: boolean;
  onActionChange: (action: TerminalFileAction) => void;
  onCancel: () => void;
  onDownload: (path: string) => boolean;
  onUpload: (directory: string, file: File) => boolean;
  transfer: TerminalFileTransfer | null;
}

export function ServerTerminalFiles({
  action,
  connected,
  transfer,
  onActionChange,
  onUpload,
  onDownload,
  onCancel,
}: TerminalFilesProps) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [directory, setDirectory] = useState(".");
  const [path, setPath] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const upload = action === "upload";
  const title = upload ? copy.sshUploadAction : copy.sshDownloadAction;
  const valid = upload ? directory.trim() && file : path.trim();

  useEffect(() => {
    setFile(null);
  }, [action]);

  let progress: number | null = null;
  if (transfer?.size !== null && transfer?.size !== undefined) {
    progress =
      transfer.size === 0 ? 100 : (transfer.bytes / transfer.size) * 100;
  }

  useEffect(() => {
    if (!connected) {
      onActionChange(null);
    }
  }, [connected, onActionChange]);

  return (
    <>
      {transfer && (
        <section
          aria-label={copy.sshFilesMenu}
          className="flex shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-sm" title={transfer.name}>
              {transfer.direction === "upload"
                ? copy.sshUploading
                : copy.sshDownloading}{" "}
              <span className="font-mono">{transfer.name}</span>
            </p>
            <Progress
              aria-label={
                transfer.direction === "upload"
                  ? copy.sshUploading
                  : copy.sshDownloading
              }
              value={progress}
            />
          </div>
          <span className="font-mono text-muted-foreground text-xs">
            {(transfer.bytes / (1024 * 1024)).toFixed(1)} /{" "}
            {transfer.size === null
              ? "?"
              : (transfer.size / (1024 * 1024)).toFixed(1)}{" "}
            MiB
          </span>
          <Button
            disabled={transfer.cancelling}
            onClick={onCancel}
            size="sm"
            variant="outline"
          >
            {transfer.cancelling
              ? copy.sshCancellingTransfer
              : copy.sshCancelTransfer}
          </Button>
        </section>
      )}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            onActionChange(null);
          }
        }}
        open={action !== null}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{copy.sshTransferDescription}</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!connected || transfer || !valid) {
                return;
              }
              const started =
                upload && file
                  ? onUpload(directory.trim(), file)
                  : onDownload(path.trim());
              if (started) {
                onActionChange(null);
                setFile(null);
              }
            }}
          >
            <FieldGroup size="compact">
              <Field size="sm">
                <FieldLabel htmlFor="ssh-transfer-path">
                  {upload ? copy.sshUploadDirectory : copy.sshDownloadPath}
                </FieldLabel>
                <Input
                  autoComplete="off"
                  id="ssh-transfer-path"
                  maxLength={4096}
                  onChange={(event) =>
                    upload
                      ? setDirectory(event.target.value)
                      : setPath(event.target.value)
                  }
                  required
                  spellCheck={false}
                  value={upload ? directory : path}
                />
                <FieldDescription>
                  {upload ? copy.sshUploadHint : copy.sshDownloadHint}
                </FieldDescription>
              </Field>
              {upload && (
                <Field size="sm">
                  <FieldLabel htmlFor="ssh-transfer-file">
                    {copy.sshUploadFile}
                  </FieldLabel>
                  <Input
                    id="ssh-transfer-file"
                    key={action}
                    onChange={(event) =>
                      setFile(event.target.files?.[0] ?? null)
                    }
                    required
                    type="file"
                  />
                </Field>
              )}
            </FieldGroup>
            <DialogFooter>
              <Button
                onClick={() => onActionChange(null)}
                type="button"
                variant="outline"
              >
                {messages.common.cancel}
              </Button>
              <Button
                disabled={!connected || !!transfer || !valid}
                type="submit"
              >
                {title}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
