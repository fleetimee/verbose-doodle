import { useI18n } from "@/components/i18n-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WheelDetailSkeleton() {
  const {
    messages: { wheel: copy },
  } = useI18n();
  return (
    <div
      aria-busy="true"
      aria-label={copy.loadingSession}
      className="min-h-0 flex-1"
      role="status"
    >
      <div
        aria-hidden="true"
        className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_14rem] gap-3 lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-1"
      >
        <Card className="min-h-0 overflow-hidden" size="none" variant="outline">
          <CardHeader size="panel" variant="panel">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col" size="compact">
            <div className="wheel-stage grid min-h-0 flex-1 place-items-center">
              <div className="wheel-disc-fit">
                <Skeleton className="size-full" variant="circle" />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-3 py-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-28" />
              </div>
              <Skeleton className="h-3 w-3/4" />
            </div>
          </CardContent>
        </Card>
        <Card className="min-h-0 overflow-hidden" size="none" variant="outline">
          <CardHeader size="panel" variant="panel">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-2 w-full" />
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col" size="compact">
            <Skeleton className="h-8 w-full shrink-0" />
            <div className="flex flex-1 flex-col gap-4 py-5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-8 w-full shrink-0" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
