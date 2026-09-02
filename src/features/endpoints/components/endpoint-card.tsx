import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import type { Endpoint } from "@/features/endpoints/types";
import { getMethodColor } from "@/features/endpoints/utils/http-method-colors";
import { cn } from "@/lib/utils";

type EndpointCardProps = {
  endpoint: Endpoint;
  onClick?: () => void;
  tourId?: string;
};

export function EndpointCard({ endpoint, onClick, tourId }: EndpointCardProps) {
  const navigate = useNavigate();
  const { prefetchEndpoint } = useEndpointCatalog();
  const methodColors = getMethodColor(endpoint.method);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/dashboard/endpoints/${endpoint.slug}`);
    }
  };

  const handleMouseEnter = () => {
    // Prefetch immediately on hover for instant navigation (100ms rule)
    prefetchEndpoint(endpoint.slug);
  };

  return (
    <Item
      className={cn(
        "group/item relative min-h-24 w-full cursor-pointer items-stretch overflow-hidden rounded-2xl border-2 border-border/80 border-b-4 bg-card/95 p-0 shadow-xs transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-border/90 hover:border-b-primary/60 hover:bg-card hover:shadow-md active:translate-y-1 active:border-b-2",
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
          "absolute inset-y-0 left-0 w-1.5 rounded-l-2xl",
          methodColors.bg,
          methodColors.border
        )}
      />
      <ItemContent className="min-w-0 gap-3 py-4 pr-3 pl-5">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <HttpMethodBadge
            className="min-w-14 justify-center font-mono"
            method={endpoint.method}
            variant="badge"
          />
          <ItemTitle className="w-full min-w-0 flex-1 font-bold text-foreground">
            <EndpointPathTitle path={endpoint.url} />
          </ItemTitle>
        </div>
        <ItemDescription className="text-left">
          <EndpointMetaStrip
            billerSlug={endpoint.billerSlug}
            responseCount={endpoint.responses.length}
          />
        </ItemDescription>
      </ItemContent>
      <ItemActions className="self-center pr-4">
        <span className="flex size-9 items-center justify-center rounded-xl border-2 border-border/70 border-b-4 bg-muted/40 text-muted-foreground transition-all duration-150 ease-out group-hover/item:translate-x-0.5 group-hover/item:border-primary/40 group-hover/item:border-b-primary/70 group-hover/item:bg-primary group-hover/item:text-primary-foreground group-active/item:translate-y-0.5 group-active/item:border-b-2">
          <HugeiconsIcon
            className="size-4"
            icon={ArrowRight01Icon}
            strokeWidth={2.5}
          />
        </span>
      </ItemActions>
    </Item>
  );
}
