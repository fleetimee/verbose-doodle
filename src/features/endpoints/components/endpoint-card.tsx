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

type EndpointCardProps = {
  endpoint: Endpoint;
  onClick?: () => void;
  tourId?: string;
};

export function EndpointCard({ endpoint, onClick, tourId }: EndpointCardProps) {
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
        "relative min-h-24 w-full cursor-pointer items-stretch overflow-hidden rounded-lg border border-border/60 bg-card/95 p-0 shadow-sm transition-[border-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:scale-[0.99]",
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
      <ItemContent className="min-w-0 gap-3 py-4 pr-3 pl-5">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
          <HttpMethodBadge
            className="mt-0.5 min-w-14 justify-center font-mono"
            method={endpoint.method}
            variant="badge"
          />
          <ItemTitle className="min-w-0 flex-1">
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
      <ItemActions className="self-center pr-4">
        <span className="flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-[border-color,background-color,color,transform] duration-150 ease-out group-hover/item:translate-x-0.5 group-hover/item:border-border group-hover/item:bg-muted/70 group-hover/item:text-foreground">
          <ChevronRight className="size-4" />
        </span>
      </ItemActions>
    </Item>
  );
}
