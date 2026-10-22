import { FileTerminal, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { getLogErrorMessage } from "@/features/log-viewer/error-message";

export function LogErrorState({
  error,
  scope,
  retrying,
  onRetry,
  onConfigure,
}: {
  error: unknown;
  scope: "sources" | "catalog";
  retrying: boolean;
  onRetry: () => void;
  onConfigure?: () => void;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  return (
    <Empty
      className="min-h-0 flex-1 overflow-auto"
      variant={scope === "sources" ? "bordered" : "default"}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileTerminal />
        </EmptyMedia>
        <EmptyTitle>
          {scope === "sources"
            ? copy.sourcesErrorTitle
            : copy.catalogErrorTitle}
        </EmptyTitle>
        <EmptyDescription>{getLogErrorMessage(error)}</EmptyDescription>
      </EmptyHeader>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button disabled={retrying} onClick={onRetry} size="sm">
          {retrying ? <Spinner /> : <RefreshCw data-icon="inline-start" />}
          {retrying ? copy.retrying : copy.retry}
        </Button>
        {onConfigure && (
          <Button onClick={onConfigure} size="sm" variant="outline">
            {copy.edit}
          </Button>
        )}
      </div>
      <p className="max-w-sm text-center text-muted-foreground text-xs">
        {scope === "sources" ? copy.sourcesErrorHint : copy.catalogErrorHint}
      </p>
    </Empty>
  );
}
