import { useI18n } from "@/components/i18n-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LogFileHeader } from "@/features/log-viewer/log-file-header";
import { cn } from "@/lib/utils";

const LINE_WIDTHS = [
  "w-5/6",
  "w-full",
  "w-3/4",
  "w-11/12",
  "w-2/3",
  "w-full",
  "w-4/5",
  "w-11/12",
];
const LINES = Array.from({ length: 40 }, (_, id) => ({
  id,
  width: LINE_WIDTHS[id % LINE_WIDTHS.length],
}));

export function LogContentSkeleton({
  announce = true,
  fontClassName = "text-[10px]",
}: {
  announce?: boolean;
  fontClassName?: string;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  return (
    <div className="min-h-0" role={announce ? "status" : undefined}>
      <LogFileHeader />
      <div
        aria-hidden="true"
        className={cn("font-mono leading-relaxed", fontClassName)}
      >
        {LINES.map((line) => (
          <div className="flex h-lh items-center" key={line.id}>
            <div className={line.width}>
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        ))}
      </div>
      {announce && <span className="sr-only">{copy.loading}</span>}
    </div>
  );
}

export function LogViewerSkeleton() {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  return (
    <div
      aria-label={copy.loading}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      role="status"
    >
      <div
        aria-hidden="true"
        className="flex shrink-0 items-center justify-between gap-3 px-3 py-2"
      >
        <div className="flex min-w-0 gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <Separator />
      <div
        aria-hidden="true"
        className="flex shrink-0 flex-wrap items-center gap-2 px-3 py-1.5"
      >
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 min-w-32 flex-1" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-14" />
      </div>
      <Separator />
      <div className="min-h-0 flex-1 overflow-hidden bg-muted/15 px-4 pb-5 md:px-5">
        <LogContentSkeleton announce={false} />
      </div>
      <span className="sr-only">{copy.loading}</span>
    </div>
  );
}

export function LogSourcesSkeleton() {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  return (
    <div aria-busy="true" className="flex min-h-0 flex-1 flex-col gap-3">
      <Card className="shrink-0" size="none" variant="outline">
        <CardHeader className="sr-only" size="none">
          <CardTitle>{copy.connectionTitle}</CardTitle>
          <CardDescription>{copy.sourceHint}</CardDescription>
        </CardHeader>
        <CardContent size="compact">
          <FieldGroup
            aria-hidden="true"
            className="grid items-start md:grid-cols-12"
            size="compact"
          >
            <Field className="col-span-2 min-w-0 md:col-span-6">
              <FieldLabel>{copy.source}</FieldLabel>
              <div className="flex gap-2">
                <Skeleton className="h-9 min-w-0 flex-1" />
                <Skeleton className="h-9 w-36" />
              </div>
            </Field>
            <Field className="min-w-0 md:col-span-3">
              <FieldLabel>{copy.from}</FieldLabel>
              <Skeleton className="h-9 w-full" />
            </Field>
            <Field className="min-w-0 md:col-span-3">
              <FieldLabel>{copy.to}</FieldLabel>
              <Skeleton className="h-9 w-full" />
            </Field>
          </FieldGroup>
          <div aria-hidden="true" className="mt-2 flex items-center gap-3">
            <Skeleton className="h-4 min-w-0 flex-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
      <Card
        className="min-h-0 min-w-0 flex-1 overflow-hidden"
        size="none"
        variant="outline"
      >
        <CardHeader className="sr-only" size="none">
          <CardTitle>{copy.streams}</CardTitle>
        </CardHeader>
        <CardContent
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          size="none"
        >
          <LogViewerSkeleton />
        </CardContent>
      </Card>
    </div>
  );
}
