import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function EndpointListSkeleton() {
  return (
    <Item
      className="w-full rounded-lg border border-border/40"
      size="default"
      variant="default"
    >
      <ItemMedia variant="default">
        <Skeleton className="h-8 w-16 rounded-md" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <Skeleton className="h-6 w-full max-w-[60%]" />
        </ItemTitle>
        <ItemDescription>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </ItemDescription>
      </ItemContent>
      <ItemActions className="ml-auto">
        <Skeleton className="h-6 w-6 rounded-full" />
      </ItemActions>
    </Item>
  );
}
