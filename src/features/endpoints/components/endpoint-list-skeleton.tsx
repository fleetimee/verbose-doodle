import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function EndpointListSkeleton() {
  return (
    <Item
      className="w-full rounded-2xl border-2 border-border/80 border-b-4 bg-card/85 p-0"
      size="default"
      variant="default"
    >
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 pr-4 pl-5">
        <ItemContent className="min-w-0 gap-2">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <Skeleton className="h-6 w-14 rounded-xl" />
            <Skeleton className="h-5 w-[200px] rounded-lg" />
          </div>
          <ItemDescription className="text-left">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28 rounded-xl" />
              <Skeleton className="h-5 w-20 rounded-xl" />
            </div>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Skeleton className="size-9 rounded-xl" />
        </ItemActions>
      </div>
    </Item>
  );
}
