import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-border/40">
      {Array.from({ length: count }, (_, index) => (
        <div
          className="grid items-baseline gap-x-4 gap-y-1.5 py-3 sm:grid-cols-[11rem_minmax(0,1fr)]"
          key={`row-${index}`}
        >
          <Skeleton className="h-3 w-20" variant="table" />
          <Skeleton className="h-4 w-48 max-w-full" variant="table" />
        </div>
      ))}
    </div>
  );
}

export function ServerImageListSkeleton() {
  const columns = ["repository", "tag", "id", "size", "created", "action"];
  return (
    <div aria-hidden="true">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>
                <Skeleton className="h-4 w-20" variant="table" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }, (_, index) => (
            <TableRow key={`image-${index}`}>
              {columns.map((column) => (
                <TableCell key={column}>
                  <div className="flex flex-col gap-2 py-1.5">
                    <Skeleton className="h-4 w-24" variant="table" />
                    {(column === "repository" || column === "created") && (
                      <Skeleton className="h-3 w-32" variant="table" />
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ServerImageDetailSkeleton() {
  return (
    <div aria-hidden="true" className="flex min-w-0 flex-col gap-6">
      <Card size="monitor" variant="monitor">
        <CardHeader size="none">
          <div className="flex items-center gap-3.5">
            <Skeleton className="size-12 shrink-0" variant="xl" />
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-7 w-64 max-w-full" variant="table" />
              <Skeleton className="h-3 w-48 max-w-full" variant="table" />
            </div>
          </div>
        </CardHeader>
        <CardContent size="none">
          <div className="grid gap-5 sm:grid-cols-3">
            {["size", "platform", "created"].map((key) => (
              <div className="flex flex-col gap-2" key={key}>
                <Skeleton className="h-3 w-20" variant="table" />
                <Skeleton className="h-5 w-32" variant="table" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6">
        {["identity", "configuration", "labels", "environment"].map((key) => (
          <Card key={key} size="monitor" variant="monitor">
            <CardHeader size="none">
              <Skeleton className="h-5 w-36" variant="table" />
            </CardHeader>
            <CardContent size="none">
              <SkeletonRows />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card size="monitor" variant="monitor">
        <CardHeader size="none">
          <Skeleton className="h-5 w-32" variant="table" />
        </CardHeader>
        <CardContent size="none">
          <SkeletonRows count={6} />
        </CardContent>
      </Card>
    </div>
  );
}
