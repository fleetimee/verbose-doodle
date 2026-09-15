import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "react-router";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
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
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type EndpointCardProps = {
  endpoint: Endpoint;
  onClick?: () => void;
  tourId?: string;
};

export function EndpointCard({ endpoint, onClick, tourId }: EndpointCardProps) {
  useI18n();
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
      className="relative min-h-24 w-full cursor-pointer items-stretch overflow-hidden"
      render={
        <button
          className="w-full text-left"
          id={tourId}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          type="button"
        />
      }
      size="none"
      variant={endpoint.enabled === false ? "dashed" : "elevated"}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1.5 rounded-l-2xl",
          methodColors.bg,
          methodColors.border
        )}
      />
      <ItemContent className="min-w-0" size="card">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <HttpMethodBadge
            className="min-w-14 justify-center font-mono"
            method={endpoint.method}
            variant="badge"
          />
          <ItemTitle className="w-full min-w-0 flex-1" variant="bold">
            <EndpointPathTitle path={endpoint.url} />
          </ItemTitle>
        </div>
        {endpoint.enabled === false && (
          <Badge className="w-fit" variant="secondary">
            {messages.common.disabled}
          </Badge>
        )}
        <ItemDescription className="text-left">
          <EndpointMetaStrip
            billerSlug={endpoint.billerSlug}
            responseCount={endpoint.responses.length}
          />
        </ItemDescription>
      </ItemContent>
      <ItemActions className="self-center" size="card">
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
