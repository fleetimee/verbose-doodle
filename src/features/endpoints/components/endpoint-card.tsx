import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { EndpointMetaStrip } from "@/features/endpoints/components/endpoint-meta-strip";
import { usePrefetchEndpoint } from "@/features/endpoints/hooks/use-prefetch-endpoint";
import type { Endpoint } from "@/features/endpoints/types";
import {
  abbreviateMethod,
  getMethodBadgeColor,
} from "@/features/endpoints/utils/http-method-colors";
import { encodeId } from "@/lib/id-encoder";

type EndpointCardProps = {
  endpoint: Endpoint;
  onClick?: () => void;
  tourId?: string;
};

export function EndpointCard({ endpoint, onClick, tourId }: EndpointCardProps) {
  const navigate = useNavigate();
  const { prefetchEndpoint } = usePrefetchEndpoint();

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
      asChild
      className="min-h-28 w-full cursor-pointer items-start gap-4 rounded-lg border border-border/60 bg-card/95 p-4 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
      size="default"
      variant="default"
    >
      <button
        id={tourId}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        type="button"
      >
        <ItemMedia className="pt-0.5" variant="default">
          <span
            className={`rounded-md px-2 py-1 font-mono font-semibold text-xs ${getMethodBadgeColor(
              endpoint.method
            )}`}
          >
            {abbreviateMethod(endpoint.method)}
          </span>
        </ItemMedia>
        <ItemContent className="min-w-0 gap-1.5 text-left">
          <ItemTitle className="w-full">
            <span className="line-clamp-2 break-all font-mono text-base leading-snug">
              {endpoint.url}
            </span>
          </ItemTitle>
          <ItemDescription className="text-left">
            <EndpointMetaStrip
              billerId={endpoint.billerId}
              responseCount={endpoint.responses.length}
            />
          </ItemDescription>
        </ItemContent>
        <ItemActions className="ml-auto self-center">
          <ChevronRight className="text-muted-foreground transition-transform group-hover/item:translate-x-0.5" />
        </ItemActions>
      </button>
    </Item>
  );
}
