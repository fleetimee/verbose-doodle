import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MeasurementsSkeleton({ large = false }: { large?: boolean }) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div className="grid @min-[22rem]:grid-cols-5 grid-cols-3 gap-x-3 gap-y-4">
        {["cpu", "memory", "disk"].map((metric) => (
          <div
            className="flex min-w-0 flex-col items-center gap-1.5"
            key={metric}
          >
            <Skeleton className="h-4 w-10" variant="table" />
            <div className={cn("relative", large ? "size-24" : "size-10")}>
              <svg
                aria-hidden="true"
                className="size-full animate-pulse motion-reduce:animate-none"
                viewBox="0 0 64 64"
              >
                <circle
                  className="stroke-accent"
                  cx="32"
                  cy="32"
                  fill="none"
                  r="27"
                  strokeWidth="5"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton
                  className={cn("h-3 w-4", large && "h-5 w-8")}
                  variant="table"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Skeleton className="h-4 w-12" variant="table" />
              {metric !== "cpu" && (
                <Skeleton className="h-4 w-14" variant="table" />
              )}
            </div>
          </div>
        ))}
        {["network", "io"].map((metric) => (
          <div className="flex min-w-0 flex-col gap-2" key={metric}>
            <Skeleton className="h-4 w-12" variant="table" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-10" variant="table" />
              <Skeleton className="h-4 w-14" variant="table" />
              <Skeleton className="h-4 w-8" variant="table" />
              <Skeleton className="h-4 w-14" variant="table" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-between gap-2">
        <Skeleton className="h-4 w-20" variant="table" />
        <Skeleton className="h-4 w-28" variant="table" />
      </div>
    </div>
  );
}

export function DockerSummarySkeleton() {
  return (
    <>
      <div aria-hidden="true" className="grid grid-cols-4 gap-x-2 gap-y-4">
        {["running", "stopped", "total", "images"].map((metric) => (
          <div className="flex min-w-0 flex-col gap-1" key={metric}>
            <Skeleton className="h-4 w-12 max-w-full" variant="table" />
            <Skeleton className="h-5 w-7" variant="table" />
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="mt-4 flex flex-wrap justify-between gap-1"
      >
        <Skeleton className="h-4 w-28" variant="table" />
        <Skeleton className="h-4 w-24" variant="table" />
      </div>
    </>
  );
}

export function ServerHostCardSkeleton() {
  return (
    <Card
      aria-hidden="true"
      className="@container"
      size="monitor"
      variant="monitor"
    >
      <CardHeader size="none">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" variant="table" />
          <Skeleton className="h-4 w-28" variant="table" />
        </div>
      </CardHeader>
      <CardContent size="none">
        <div className="flex flex-col gap-5">
          <MeasurementsSkeleton />
          <Separator />
          <div className="flex flex-col gap-3">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-5 w-32" variant="table" />
              <Skeleton className="h-4 w-16" variant="table" />
            </div>
            <DockerSummarySkeleton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
