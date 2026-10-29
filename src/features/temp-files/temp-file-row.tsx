import { useState } from "react";
import { toast } from "sonner";
import { CopyIcon, Download, Trash2 } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatFileBytes,
  type TempFile,
  tempFileDownloadUrl,
} from "@/features/temp-files/api";
import { FileTypeIcon } from "@/features/temp-files/file-type-icon";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";

type Props = {
  file: TempFile;
  locale: string;
  now: number;
  deleting: boolean;
  onDelete: (id: string) => Promise<boolean>;
};
export function TempFileRow({ file, locale, now, deleting, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const text = messages.tempFiles;
  const expired = new Date(file.expiresAt).getTime() <= now;
  const link = tempFileDownloadUrl(file);
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  const copy = async () => {
    try {
      if (!(await copyToClipboard(link))) {
        throw new Error("Copy failed");
      }
      toast.success(text.copied);
    } catch {
      toast.error(text.copyError);
    }
  };
  return (
    <li className="flex min-w-0 flex-col gap-3 border-border/60 border-b py-4 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="flex min-w-0 items-start gap-2 break-all font-medium text-sm">
            <FileTypeIcon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              filename={file.originalName}
            />
            <span className="min-w-0 break-all">{file.originalName}</span>
          </p>
          <ButtonGroup aria-label={file.originalName} className="shrink-0">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label={text.copy}
                    disabled={expired}
                    onClick={copy}
                    size="icon-sm"
                    variant="outline"
                  />
                }
              >
                <CopyIcon />
              </TooltipTrigger>
              <TooltipContent>{text.copy}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label={text.download}
                    disabled={expired}
                    nativeButton={false}
                    render={<a href={link} rel="noreferrer" />}
                    size="icon-sm"
                    variant="outline"
                  />
                }
              >
                <Download />
              </TooltipTrigger>
              <TooltipContent>{text.download}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    aria-label={`${text.delete} ${file.originalName}`}
                    disabled={deleting}
                    onClick={() => setConfirming(true)}
                    size="icon-sm"
                    variant="outline"
                  />
                }
              >
                <Trash2 />
              </TooltipTrigger>
              <TooltipContent>{text.delete}</TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
          <span>{formatFileBytes(file.size, locale)}</span>
          <span>
            {formatMessage(text.uploadedAt, { date: date(file.createdAt) })}
          </span>
          <span>
            {expired
              ? text.expired
              : formatMessage(text.expires, { date: date(file.expiresAt) })}
          </span>
        </div>
        <Input
          aria-label={formatMessage(text.shareLink, {
            name: file.originalName,
          })}
          onFocus={(event) => event.target.select()}
          readOnly
          value={link}
        />
      </div>
      <Dialog onOpenChange={setConfirming} open={confirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{text.deleteTitle}</DialogTitle>
            <DialogDescription>{text.deleteDescription}</DialogDescription>
          </DialogHeader>
          <p className="break-all text-sm">{file.originalName}</p>
          <DialogFooter>
            <Button
              disabled={deleting}
              onClick={() => setConfirming(false)}
              variant="outline"
            >
              {text.cancel}
            </Button>
            <Button
              disabled={deleting}
              onClick={async () => {
                if (await onDelete(file.id)) {
                  setConfirming(false);
                }
              }}
              variant="destructive"
            >
              {text.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}
