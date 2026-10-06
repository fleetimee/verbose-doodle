import type { ReactNode } from "react";
import { toast } from "sonner";
import { CopyIcon } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { ServerDatabaseGuide } from "@/features/server-inventory/components/server-database-guide";
import { ServerFileTransferGuide } from "@/features/server-inventory/components/server-file-transfer-guide";
import { ServerPasswordCell } from "@/features/server-inventory/components/server-password-cell";
import { ServerRdpGuide } from "@/features/server-inventory/components/server-rdp-guide";
import { ServerSmbGuide } from "@/features/server-inventory/components/server-smb-guide";
import { ServerSshGuide } from "@/features/server-inventory/components/server-ssh-guide";
import { isWebUrl } from "@/features/server-inventory/server-form";
import type { ServerEntry } from "@/features/server-inventory/types";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

function DetailRow({
  label,
  children,
  empty = false,
}: {
  label: string;
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-start gap-4 px-4 py-3">
      <dt className="pt-0.5 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-words text-right",
          empty && "text-muted-foreground"
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export function ServerEntryDetails({
  entry,
  isAdmin,
  open,
}: {
  entry: ServerEntry;
  isAdmin: boolean;
  open: boolean;
}) {
  const { locale, messages } = useI18n();
  const copy = messages.servers;
  const accessType = entry.accessType.toUpperCase();
  const isWebAccess = ["WEB", "HTTP", "HTTPS"].includes(accessType);
  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  async function copyValue(value: string) {
    try {
      const copied = await copyToClipboard(value);
      if (copied) {
        toast.success(copy.copied);
      } else {
        toast.error(copy.copyFailed);
      }
    } catch {
      toast.error(copy.copyFailed);
    }
  }

  return (
    <div className="space-y-6 text-sm">
      <dl className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
        <DetailRow label={copy.host}>
          <div className="flex items-start justify-end gap-1">
            <span className="min-w-0 break-all pt-0.5 font-mono">
              {entry.host}
            </span>
            <Button
              aria-label={copy.copyHost.replace("{name}", entry.name)}
              className="-my-1 shrink-0"
              onClick={() => copyValue(entry.host)}
              size="icon-sm"
              variant="ghost"
            >
              <CopyIcon />
            </Button>
          </div>
        </DetailRow>
        <DetailRow empty={entry.port === null} label={copy.port}>
          <span className={entry.port === null ? undefined : "font-mono"}>
            {entry.port ?? copy.notSet}
          </span>
        </DetailRow>
        <DetailRow empty={!entry.username} label={copy.username}>
          <span className={entry.username ? "font-mono" : undefined}>
            {entry.username || copy.notSet}
          </span>
        </DetailRow>
        {isAdmin && (
          <DetailRow label={copy.password}>
            {open && (
              <ServerPasswordCell
                entry={entry}
                isAdmin={isAdmin}
                loading={false}
                revealAll={false}
              />
            )}
          </DetailRow>
        )}
        {isWebAccess && (
          <DetailRow empty={!entry.url} label={copy.url}>
            {entry.url && isWebUrl(entry.url) ? (
              <a
                className="break-all text-primary underline-offset-4 hover:underline"
                href={entry.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {entry.url}
              </a>
            ) : (
              entry.url || copy.notSet
            )}
          </DetailRow>
        )}
        {accessType === "DATABASE" && (
          <DetailRow empty={!entry.databaseName} label={copy.databaseName}>
            <span className={entry.databaseName ? "font-mono" : undefined}>
              {entry.databaseName || copy.notSet}
            </span>
          </DetailRow>
        )}
      </dl>
      {accessType === "SMB" && <ServerSmbGuide entry={entry} />}
      {accessType === "SSH" && <ServerSshGuide entry={entry} />}
      {accessType === "RDP" && <ServerRdpGuide entry={entry} />}
      {accessType === "DATABASE" && <ServerDatabaseGuide entry={entry} />}
      {["FTP", "SFTP", "FTPS"].includes(accessType) && (
        <ServerFileTransferGuide entry={entry} />
      )}
      <section aria-labelledby="server-detail-notes" className="space-y-2">
        <h3 className="font-medium" id="server-detail-notes">
          {copy.notes}
        </h3>
        <p
          className={cn(
            "whitespace-pre-wrap break-words rounded-xl bg-muted/30 px-4 py-3 leading-relaxed",
            !entry.notes && "text-muted-foreground"
          )}
        >
          {entry.notes || copy.notSet}
        </p>
      </section>
      <dl className="space-y-2 border-border/60 border-t pt-4 text-muted-foreground text-xs">
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt>{copy.createdAt}</dt>
          <dd>
            <time dateTime={entry.createdAt}>
              {dateFormat.format(new Date(entry.createdAt))}
            </time>
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt>{copy.updatedAt}</dt>
          <dd>
            <time dateTime={entry.updatedAt}>
              {dateFormat.format(new Date(entry.updatedAt))}
            </time>
          </dd>
        </div>
      </dl>
    </div>
  );
}
