import { FileText } from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LogSegment } from "@/features/log-viewer/types";

export function LogFileHeader({
  file,
}: {
  file?: Pick<LogSegment, "date" | "filename">;
}) {
  return (
    <div className="sticky top-0 flex flex-wrap items-center gap-2 border-b bg-background py-3">
      {file ? (
        <Badge mono radius="rounded" variant="outline-muted">
          {file.date}
        </Badge>
      ) : (
        <Skeleton aria-hidden="true" className="h-5 w-24" />
      )}
      <FileText aria-hidden="true" className="size-3.5 text-muted-foreground" />
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
