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
};

export function EndpointCard({ endpoint, onClick }: EndpointCardProps) {
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
      className="cursor-pointer rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
      size="default"
      variant="default"
    >
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        type="button"
      >
        <ItemMedia variant="default">
          <span
            className={`rounded-md px-2 py-1 font-mono font-semibold text-xs ${getMethodBadgeColor(
              endpoint.method
            )}`}
          >
            {abbreviateMethod(endpoint.method)}
          </span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <span className="font-mono text-base">{endpoint.url}</span>
          </ItemTitle>
          <ItemDescription className="text-left">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-xs">
                Biller ID: {endpoint.billerId}
              </span>
              {endpoint.responses.length > 0 ? (
                <span>{endpoint.responses.length} respon</span>
              ) : (
                <span>Belum ada respon terkonfigurasi</span>
              )}
            </div>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </ItemActions>
      </button>
    </Item>
  );
}
