import { Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileText } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type {
  DetectedLogLayout,
  LogBrowseResult,
} from "@/features/log-viewer/types";

export function BrowseWarnings({ result }: { result: LogBrowseResult }) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  return (
    <>
      {result.limited && (
        <Alert>
          <AlertDescription>{copy.browseLimited}</AlertDescription>
        </Alert>
      )}
      {result.compressedFiles > 0 && (
        <Alert>
          <AlertDescription>
            {copy.browseCompressed.replace(
              "{count}",
              String(result.compressedFiles)
            )}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

export function FolderBrowserEntries({
  entries,
  search,
  disabled,
  onNavigate,
}: {
  entries: LogBrowseResult["entries"];
  search: string;
  disabled: boolean;
  onNavigate: (path: string) => void;
}) {
  const {
    locale,
    messages: { logViewer: copy },
  } = useI18n();
  return (
    <div className="flex flex-col gap-1 p-2">
      {entries.length === 0 && (
        <p className="p-2 text-muted-foreground text-sm">
          {search ? copy.browseNoMatches : copy.browseEmpty}
        </p>
      )}
      {entries.map((entry) =>
        entry.directory ? (
          <Button
            className="w-full justify-start"
            disabled={disabled}
            key={entry.path}
            onClick={() => onNavigate(entry.path)}
            size="sm"
            title={entry.name}
            type="button"
            variant="ghost"
          >
            <HugeiconsIcon data-icon="inline-start" icon={Folder01Icon} />
            <span className="truncate">{entry.name}</span>
          </Button>
        ) : (
          <div
            className="flex min-w-0 items-center gap-2 px-2 py-1.5"
            key={entry.path}
          >
            <FileText
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span
              className="min-w-0 flex-1 truncate font-mono text-xs"
              title={entry.name}
            >
              {entry.name}
            </span>
            <span className="shrink-0 text-muted-foreground text-xs">
              {new Intl.NumberFormat(locale, {
                maximumFractionDigits: 1,
              }).format(entry.size / 1024)}{" "}
              KB
            </span>
          </div>
        )
      )}
    </div>
  );
}

export function FolderBrowserLayouts({
  result,
  disabled,
  onApply,
}: {
  result: LogBrowseResult;
  disabled: boolean;
  onApply: (layout: DetectedLogLayout) => void;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  return (
    <>
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-sm">{copy.browseDetected}</h3>
        <p className="text-muted-foreground text-xs">
          {copy.browseDetectionHint}
        </p>
      </div>
      {result.layouts.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {copy.browseNoDetection}
        </p>
      )}
      {result.layouts.map((layout) => (
        <div
          className="flex flex-col gap-2 rounded-md border p-3"
          key={`${layout.basePath}:${layout.folderPattern}:${layout.filenamePattern}:${layout.dateFormat}`}
        >
          <dl className="flex flex-col gap-2 text-xs">
            <div>
              <dt className="text-muted-foreground">{copy.basePath}</dt>
              <dd className="break-all font-mono">
                {layout.basePath || copy.browseRoot}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{copy.folderPattern}</dt>
              <dd>{layout.folderPattern || copy.flat}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{copy.filenamePattern}</dt>
              <dd className="break-all font-mono">{layout.filenamePattern}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{copy.dateFormat}</dt>
              <dd className="font-mono">
                {layout.dateFormat === "modified"
                  ? copy.modifiedDate
                  : layout.dateFormat}
              </dd>
            </div>
          </dl>
          <p className="break-words font-mono text-muted-foreground text-xs">
            {layout.streams.join(" · ")}
          </p>
          <details>
            <summary className="cursor-pointer text-muted-foreground text-xs">
              {copy.browseSamples}
            </summary>
            <ul className="mt-2 flex flex-col gap-1">
              {layout.sampleFiles.map((file) => (
                <li className="break-all font-mono text-xs" key={file}>
                  {file}
                </li>
              ))}
            </ul>
          </details>
          <Button
            disabled={disabled}
            onClick={() => {
              onApply(layout);
            }}
            size="sm"
            type="button"
          >
            {copy.browseApply}
          </Button>
        </div>
      ))}
    </>
  );
}
