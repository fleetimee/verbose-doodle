import { ChevronDown, Layers3, Pen, Plus } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type EndpointBillerGroupActions = {
  onAddEndpoint?: (slug: string) => void;
  onEditBiller?: (slug: string, name: string) => void;
};

export function EndpointBillerGroupHeader({
  slug,
  name,
  count,
  expanded,
  onToggle,
  onAddEndpoint,
  onEditBiller,
}: EndpointBillerGroupActions & {
  slug: string;
  name: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { messages } = useI18n();
  const addLabel = formatMessage(messages.endpoints.addEndpointForBiller, {
    billerName: name,
  });
  const editLabel = formatMessage(messages.endpoints.editBillerTooltip, {
    billerName: name,
  });
  return (
    <div className="endpoint-biller-group flex min-w-0 flex-wrap items-center gap-1.5">
      <Button
        aria-expanded={expanded}
        aria-label={formatMessage(
          expanded
            ? messages.endpoints.table.collapseBiller
            : messages.endpoints.table.expandBiller,
          { biller: name }
        )}
        onClick={onToggle}
        size="sm"
        variant="ghost"
      >
        <ChevronDown
          className={cn(!expanded && "-rotate-90")}
          data-icon="inline-start"
        />
        <Layers3 aria-hidden="true" className="size-4 text-muted-foreground" />
        <span className="font-medium text-sm">{name}</span>
        <Badge variant="outline-muted">{count}</Badge>
      </Button>
      <div className="endpoint-biller-actions flex items-center gap-1.5">
        {onAddEndpoint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={addLabel}
                onClick={() => onAddEndpoint(slug)}
                size="icon-7"
                variant="biller-group-action"
              >
                <Plus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{addLabel}</TooltipContent>
          </Tooltip>
        )}
        {onEditBiller && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={editLabel}
                onClick={() => onEditBiller(slug, name)}
                size="icon-7"
                variant="biller-group-action"
              >
                <Pen />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{editLabel}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
