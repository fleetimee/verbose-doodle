import { useI18n } from "@/components/i18n-provider";
import { isWebUrl } from "@/features/server-inventory/server-form";
import type { ServerEntry } from "@/features/server-inventory/types";

export function ServerEntryDetails({ entry }: { entry: ServerEntry }) {
  const { locale, messages } = useI18n();
  const copy = messages.servers;

  return (
    <dl className="flex flex-col gap-6 text-sm">
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">{copy.url}</dt>
        <dd className="break-words">
          {entry.url && isWebUrl(entry.url) ? (
            <a
              className="text-primary underline underline-offset-4"
              href={entry.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {entry.url}
            </a>
          ) : (
            entry.url || copy.notSet
          )}
        </dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">{copy.databaseName}</dt>
        <dd className="break-words font-mono">
          {entry.databaseName || copy.notSet}
        </dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">{copy.createdAt}</dt>
        <dd>{new Date(entry.createdAt).toLocaleString(locale)}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">{copy.updatedAt}</dt>
        <dd>{new Date(entry.updatedAt).toLocaleString(locale)}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">{copy.notes}</dt>
        <dd className="whitespace-pre-wrap break-words">
          {entry.notes || copy.notSet}
        </dd>
      </div>
    </dl>
  );
}
