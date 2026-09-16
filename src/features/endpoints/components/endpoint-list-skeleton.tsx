import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function EndpointListSkeleton() {
  return (
    <Item className="w-full" size="none" variant="elevated-subtle-static">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 pr-4 pl-5">
        <ItemContent className="min-w-0" size="list">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <Skeleton className="h-6 w-14" variant="xl" />
            <Skeleton className="h-5 w-[200px]" variant="lg" />
          </div>
          <ItemDescription className="text-left">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28" variant="xl" />
              <Skeleton className="h-5 w-20" variant="xl" />
            </div>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Skeleton className="size-9" variant="xl" />
        </ItemActions>
      </div>
    </Item>
  );
}
