import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function EndpointCardSkeleton() {
  return (
    <Item
      className="min-h-24 rounded-2xl border-2 border-border/80 border-b-4 bg-card/95 p-0 shadow-xs"
      size="default"
      variant="default"
    >
      <ItemContent className="min-w-0 gap-3 py-4 pr-3 pl-5">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <Skeleton className="h-6 w-14 rounded-xl" />
          <Skeleton className="h-5 w-[160px] rounded-lg" />
        </div>
        <ItemDescription className="text-left">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28 rounded-xl" />
            <Skeleton className="h-5 w-20 rounded-xl" />
          </div>
        </ItemDescription>
      </ItemContent>
      <ItemActions className="self-center pr-4">
        <Skeleton className="size-9 rounded-xl" />
      </ItemActions>
    </Item>
  );
}
