import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatsCardSkeletonProps = {
  className?: string;
};

export function StatsCardSkeleton({ className }: StatsCardSkeletonProps) {
  return (
    <Card className={cn("md:col-span-1", className)} variant="overview-card">
      <CardContent className="min-h-36 justify-between" size="overview">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="size-9" />
        </div>
        <Skeleton className="h-9 w-20" />
      </CardContent>
    </Card>
  );
}
