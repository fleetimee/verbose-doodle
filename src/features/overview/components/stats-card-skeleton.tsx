import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatsCardSkeletonProps = {
  className?: string;
};

export function StatsCardSkeleton({ className }: StatsCardSkeletonProps) {
  return (
    <Card
      className={cn("border-border/70 bg-card/90 md:col-span-1", className)}
    >
      <CardContent className="flex min-h-36 flex-col justify-between gap-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="size-9 rounded-md" />
        </div>
        <Skeleton className="h-9 w-20" />
      </CardContent>
    </Card>
  );
}
