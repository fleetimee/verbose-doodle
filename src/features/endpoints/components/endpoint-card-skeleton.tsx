import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function EndpointCardSkeleton() {
  return (
    <Item
      className="rounded-lg border bg-card shadow-sm"
      size="default"
      variant="default"
    >
      <ItemMedia variant="default">
        <Skeleton className="h-7 w-[52px] rounded-md" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <Skeleton className="h-5 w-[180px]" />
        </ItemTitle>
        <ItemDescription className="text-left">
          <div className="flex flex-col gap-0.5">
            <Skeleton className="h-3.5 w-[85px]" />
            <Skeleton className="h-4 w-[75px]" />
          </div>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Skeleton className="h-5 w-5" />
      </ItemActions>
    </Item>
  );
}
