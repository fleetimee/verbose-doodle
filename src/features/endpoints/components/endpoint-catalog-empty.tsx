import { Plug } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { EndpointListQuery } from "@/features/endpoints/types";

export function EndpointCatalogEmpty({
  query,
  onReset,
  onCreate,
}: {
  query: EndpointListQuery;
  onReset: () => void;
  onCreate?: () => void;
}) {
  const { messages } = useI18n();
  const copy = messages.endpoints;
  const narrowed = Boolean(
    query.search || query.method || query.enabled || query.responseStatus
  );
  const filtered = narrowed || Boolean(query.billerSlug);
  let title = copy.emptyTitle;
  let description = copy.emptyDescription;
  if (query.billerSlug) {
    title = copy.scopedEmptyTitle;
    description = copy.scopedEmptyDescription;
  }
  if (narrowed) {
    title = copy.noSearchResultsTitle;
    description = copy.noSearchResultsDescription;
  }
  return (
    <Empty className="min-h-72" role="status" variant="plain">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Plug />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          {!narrowed && onCreate && (
            <Button onClick={onCreate} size="sm">
              {copy.addEndpoint}
            </Button>
          )}
          {filtered && (
            <Button onClick={onReset} size="sm" variant="outline">
              {copy.table.reset}
            </Button>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );
}
