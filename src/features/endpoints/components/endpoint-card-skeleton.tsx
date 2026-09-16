import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function EndpointCardSkeleton() {
  return (
    <Item size="card-skeleton" variant="elevated-static">
      <ItemContent className="min-w-0" size="card">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <Skeleton className="h-6 w-14" variant="xl" />
          <Skeleton className="h-5 w-[160px]" variant="lg" />
        </div>
        <ItemDescription className="text-left">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28" variant="xl" />
            <Skeleton className="h-5 w-20" variant="xl" />
          </div>
        </ItemDescription>
      </ItemContent>
      <ItemActions className="self-center" size="card">
        <Skeleton className="size-9" variant="xl" />
      </ItemActions>
    </Item>
  );
}
