import { FileText } from "@/components/hugeicons";
import { Skeleton } from "@/components/ui/skeleton";
import type { LogSegment } from "@/features/log-viewer/types";

export function LogFileHeader({
  file,
}: {
  file?: Pick<LogSegment, "date" | "filename">;
}) {
  return (
    <div className="sticky top-0 -mx-4 flex flex-wrap items-center gap-2 border-border/40 border-b bg-card px-4 py-1.5 md:-mx-5 md:px-5">
      {file ? (
        <time
          className="font-mono text-muted-foreground/80 text-xs"
          dateTime={file.date}
        >
          {file.date}
        </time>
      ) : (
        <Skeleton aria-hidden="true" className="h-4 w-20" />
      )}
      <FileText
        aria-hidden="true"
        className="size-3 text-muted-foreground/70"
      />
      {file ? (
        <span className="break-all font-mono text-muted-foreground text-xs">
          {file.filename}
        </span>
      ) : (
        <Skeleton aria-hidden="true" className="h-4 w-48 max-w-full" />
      )}
    </div>
  );
}
