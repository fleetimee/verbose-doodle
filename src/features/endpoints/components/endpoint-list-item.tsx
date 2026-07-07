import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { EndpointMetaStrip } from "@/features/endpoints/components/endpoint-meta-strip";
import { EndpointPathTitle } from "@/features/endpoints/components/endpoint-path-title";
import { HttpMethodBadge } from "@/features/endpoints/components/http-method-badge";
import { usePrefetchEndpoint } from "@/features/endpoints/hooks/use-prefetch-endpoint";
import type { Endpoint } from "@/features/endpoints/types";
import { getMethodColor } from "@/features/endpoints/utils/http-method-colors";
import { encodeId } from "@/lib/id-encoder";
import { cn } from "@/lib/utils";

type EndpointListItemProps = {
  endpoint: Endpoint;
  onClick?: () => void;
  tourId?: string;
};

export function EndpointListItem({
  endpoint,
  onClick,
  tourId,
}: EndpointListItemProps) {
  const navigate = useNavigate();
  const { prefetchEndpoint } = usePrefetchEndpoint();
  const methodColors = getMethodColor(endpoint.method);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/dashboard/endpoints/${encodeId(endpoint.id)}`);
    }
  };

  const handleMouseEnter = () => {
    // Prefetch immediately on hover for instant navigation (100ms rule)
    prefetchEndpoint(endpoint.id);
  };

  return (
    <Item
      className={cn(
        "relative w-full cursor-pointer overflow-hidden rounded-lg border border-border/40 bg-card/80 p-0 transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out hover:border-primary/25 hover:bg-accent/40 hover:shadow-sm active:scale-[0.995]",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/45"
      )}
      render={
        <button
          className="w-full text-left"
          id={tourId}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          type="button"
        />
      }
      size="default"
      variant="default"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          methodColors.bg,
          methodColors.border
        )}
      />
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 pr-4 pl-5">
        <ItemContent className="min-w-0 gap-2">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <HttpMethodBadge
              className="min-w-14 justify-center font-mono"
              method={endpoint.method}
              variant="badge"
            />
            <ItemTitle className="min-w-0">
              <EndpointPathTitle path={endpoint.url} />
            </ItemTitle>
          </div>
          <ItemDescription className="text-left">
            <EndpointMetaStrip
              billerId={endpoint.billerId}
              responseCount={endpoint.responses.length}
            />
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <span className="flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-[border-color,background-color,color,transform] duration-150 ease-out group-hover/item:translate-x-0.5 group-hover/item:border-border group-hover/item:bg-background/80 group-hover/item:text-foreground">
            <ChevronRight className="size-4" />
          </span>
        </ItemActions>
      </div>
    </Item>
  );
}
