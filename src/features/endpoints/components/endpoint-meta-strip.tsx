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
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/35 px-2 py-1 font-medium text-muted-foreground text-xs">
        <Hash className="h-3 w-3" />
        <span>Biller</span>
        <span className="font-mono text-foreground">{billerSlug}</span>
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium text-xs",
          responseCount > 0
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-border/70 bg-muted/35 text-muted-foreground"
        )}
      >
        <MessageSquareText className="h-3 w-3" />
        <span>{getResponseLabel(responseCount)}</span>
      </span>
    </div>
  );
}
