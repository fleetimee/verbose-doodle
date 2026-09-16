import { Hash, MessageSquareText } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type EndpointMetaStripProps = {
  readonly billerSlug: string;
  readonly className?: string;
  readonly responseCount: number;
};

function getResponseLabel(responseCount: number) {
  if (responseCount === 0) {
    return messages.endpoints.noResponses;
  }

  return formatMessage(messages.endpoints.responseCount, {
    count: responseCount,
  });
}

export function EndpointMetaStrip({
  billerSlug,
  className,
  responseCount,
}: EndpointMetaStripProps) {
  useI18n();

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 overflow-hidden",
        className
      )}
    >
      <span
        className="inline-flex min-w-0 max-w-[160px] shrink items-center gap-1.5 rounded-xl border-2 border-border/80 border-b-2 bg-muted/50 px-2.5 py-0.5 font-bold text-muted-foreground text-xs transition-colors"
        title={billerSlug}
      >
        <Hash className="size-3 shrink-0 text-muted-foreground/75" />
        <span className="shrink-0 text-muted-foreground/80 text-xs">
          {messages.endpoints.billerLabel}
        </span>
        <span className="truncate font-bold font-mono text-foreground">
          {billerSlug}
        </span>
      </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-2 px-2.5 py-0.5 font-black text-xs transition-colors",
          responseCount > 0
            ? "border-success/40 border-b-success/70 bg-success/15 text-success dark:border-success/50 dark:border-b-success/80 dark:bg-success/20"
            : "border-border/80 border-b-border/90 bg-muted/40 text-muted-foreground"
        )}
      >
        <MessageSquareText className="size-3 shrink-0" />
        <span>{getResponseLabel(responseCount)}</span>
      </span>
    </div>
  );
}
