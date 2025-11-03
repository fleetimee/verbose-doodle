import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SKELETON_ITEMS = Array.from({ length: 5 }, (_, i) => i);

type RecentEndpointsSkeletonProps = {
  className?: string;
};

export function RecentEndpointsSkeleton({
  className,
}: RecentEndpointsSkeletonProps) {
  return (
    <Card className={cn("md:col-span-3 lg:col-span-3", className)}>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-36" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {SKELETON_ITEMS.map((index) => (
            <div
              className="flex items-center justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
              key={`skeleton-endpoint-${index + 1}`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-4 w-full max-w-xs" />
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
