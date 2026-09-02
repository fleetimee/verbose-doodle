import { Hash, MessageSquareText } from "@/components/hugeicons";
import { cn } from "@/lib/utils";

type EndpointMetaStripProps = {
  readonly billerSlug: string;
  readonly className?: string;
  readonly responseCount: number;
};

function getResponseLabel(responseCount: number) {
  if (responseCount === 0) {
    return "No responses";
  }

  return `${responseCount} response${responseCount === 1 ? "" : "s"}`;
}

export function EndpointMetaStrip({
  billerSlug,
  className,
  responseCount,
}: EndpointMetaStripProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 overflow-hidden",
        className
      )}
    >
      <span
        className="inline-flex min-w-0 max-w-[160px] shrink items-center gap-1.5 rounded-xl border-2 border-border/80 border-b-[3px] bg-muted/50 px-2.5 py-0.5 font-bold text-muted-foreground text-xs transition-colors"
        title={billerSlug}
      >
        <Hash className="size-3 shrink-0 text-muted-foreground/75" />
        <span className="shrink-0 text-muted-foreground/80 text-xs">
          Biller
        </span>
        <span className="truncate font-bold font-mono text-foreground">
          {billerSlug}
        </span>
      </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-[3px] px-2.5 py-0.5 font-black text-xs transition-colors",
          responseCount > 0
            ? "border-emerald-500/40 border-b-emerald-600/70 bg-emerald-500/15 text-emerald-600 dark:border-emerald-500/50 dark:border-b-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300"
            : "border-border/80 border-b-border/90 bg-muted/40 text-muted-foreground"
        )}
      >
        <MessageSquareText className="size-3 shrink-0" />
        <span>{getResponseLabel(responseCount)}</span>
      </span>
    </div>
  );
}
