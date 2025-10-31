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
        <Skeleton className="h-8 w-16 rounded-md" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <Skeleton className="h-6 w-full max-w-[85%]" />
        </ItemTitle>
        <ItemDescription>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Skeleton className="h-6 w-6 rounded-full" />
      </ItemActions>
    </Item>
  );
}
