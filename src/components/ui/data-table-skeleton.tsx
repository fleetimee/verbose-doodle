import { Skeleton } from "@/components/ui/skeleton";

type DataTableSkeletonProps = {
  rows?: number;
  columns?: number;
  showFilter?: boolean;
  showPagination?: boolean;
};

export function DataTableSkeleton({
  rows = 10,
  columns = 5,
  showFilter = true,
  showPagination = true,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Filter/Search Bar */}
      {showFilter && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        {/* Table Header */}
        <div className="border-b bg-muted/50 p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={`header-${index}`} className="h-5 flex-1" />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="p-4">
              <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={`cell-${colIndex}`} className="h-5 flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-[200px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[70px]" />
            <Skeleton className="h-9 w-[70px]" />
          </div>
        </div>
      )}
    </div>
  );
}
