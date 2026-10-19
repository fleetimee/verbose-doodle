import { useI18n } from "@/components/i18n-provider";
import {
  type EndpointBillerGroupActions,
  EndpointBillerGroupHeader,
} from "@/features/endpoints/components/endpoint-biller-group-header";
import { EndpointCard } from "@/features/endpoints/components/endpoint-card";
import { EndpointCardSkeleton } from "@/features/endpoints/components/endpoint-card-skeleton";
import { EndpointContextMenu } from "@/features/endpoints/components/endpoint-context-menu";
import { EndpointListItem as EndpointListCard } from "@/features/endpoints/components/endpoint-list-item";
import { EndpointListSkeleton } from "@/features/endpoints/components/endpoint-list-skeleton";
import type {
  EndpointListItem,
  EndpointViewMode,
} from "@/features/endpoints/types";
import { cn } from "@/lib/utils";

const skeletonKeys = ["one", "two", "three", "four", "five"];

export function EndpointCardViews({
  onAddEndpoint,
  onEditBiller,
  viewMode,
  endpoints,
  loading,
  error,
  collapsedBillers,
  onToggleBiller,
  canEdit,
  onEdit,
  onDelete,
}: {
  viewMode: Exclude<EndpointViewMode, "table">;
  endpoints: EndpointListItem[];
  loading: boolean;
  error: boolean;
  collapsedBillers: ReadonlySet<string>;
  onToggleBiller: (slug: string) => void;
  canEdit: boolean;
  onEdit: (endpoint: EndpointListItem) => void;
  onDelete: (endpoint: EndpointListItem) => void;
} & EndpointBillerGroupActions) {
  const { messages } = useI18n();
  const layout =
    viewMode === "grid"
      ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      : "space-y-3";
  if (loading) {
    return (
      <div className={cn("p-4", layout)}>
        {skeletonKeys.map((key) =>
          viewMode === "grid" ? (
            <EndpointCardSkeleton key={key} />
          ) : (
            <EndpointListSkeleton key={key} />
          )
        )}
      </div>
    );
  }
  const groups = new Map<string, EndpointListItem[]>();
  for (const endpoint of endpoints) {
    const group = groups.get(endpoint.billerSlug) ?? [];
    group.push(endpoint);
    groups.set(endpoint.billerSlug, group);
  }
  const Card = viewMode === "grid" ? EndpointCard : EndpointListCard;
  return (
    <div className="space-y-6 p-4">
      {[...groups].map(([slug, items]) => (
        <section className="space-y-3" key={slug}>
          <EndpointBillerGroupHeader
            count={items.length}
            expanded={!collapsedBillers.has(slug)}
            name={items[0].billerName || slug}
            onAddEndpoint={onAddEndpoint}
            onEditBiller={onEditBiller}
            onToggle={() => onToggleBiller(slug)}
            slug={slug}
          />
          {!collapsedBillers.has(slug) && (
            <div className={layout}>
              {items.map((endpoint) => (
                <EndpointContextMenu
                  canEdit={canEdit}
                  endpoint={endpoint}
                  key={endpoint.id}
                  onDelete={onDelete}
                  onEdit={onEdit}
                >
                  <div>
                    <Card
                      endpoint={endpoint}
                      tourId={
                        endpoint.id === endpoints[0]?.id
                          ? "endpoints-tour-first-endpoint"
                          : undefined
                      }
                    />
                  </div>
                </EndpointContextMenu>
              ))}
            </div>
          )}
        </section>
      ))}
      {!(error || endpoints.length) && (
        <p className="py-12 text-center text-muted-foreground">
          {messages.endpoints.noSearchResultsTitle}
        </p>
      )}
    </div>
  );
}
