import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactElement } from "react";
import { Pen } from "@/components/hugeicons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { HttpMethodBadge } from "@/features/endpoints/components/http-method-badge";
import type { Endpoint } from "@/features/endpoints/types";
import { messages } from "@/lib/i18n";

type EndpointContextMenuProps = {
  canEdit: boolean;
  children: ReactElement;
  endpoint: Endpoint;
  onDelete: (endpoint: Endpoint) => void;
  onEdit: (endpoint: Endpoint) => void;
};

export function EndpointContextMenu({
  canEdit,
  children,
  endpoint,
  onDelete,
  onEdit,
}: EndpointContextMenuProps) {
  if (!canEdit) {
    return children;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64 rounded-xl border-border/70 bg-popover/95 p-1.5 shadow-black/10 shadow-xl backdrop-blur-md">
        <ContextMenuGroup>
          <ContextMenuLabel className="px-2.5 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.16em]">
                Endpoint
              </span>
              <HttpMethodBadge
                className="px-2 py-0.5 font-mono text-[10px]"
                method={endpoint.method}
                variant="badge"
              />
            </div>
            <span className="mt-2 block truncate font-mono text-foreground text-xs">
              {endpoint.url}
            </span>
            <span className="mt-1 block font-normal text-[11px] text-muted-foreground">
              Biller {endpoint.billerId} · {endpoint.responses.length} response
              {endpoint.responses.length === 1 ? "" : "s"}
            </span>
          </ContextMenuLabel>
        </ContextMenuGroup>
        <ContextMenuSeparator className="my-1.5" />
        <ContextMenuItem
          aria-label={messages.endpoints.editEndpointMenuItem}
          className="h-11 gap-3 rounded-lg px-2.5"
          onClick={() => onEdit(endpoint)}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/10 text-primary">
            <Pen className="size-3.5" />
          </span>
          <span aria-hidden="true" className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium text-sm">
              {messages.endpoints.editEndpointMenuItem}
            </span>
            <span className="font-normal text-[10px] text-muted-foreground">
              Update route details
            </span>
          </span>
        </ContextMenuItem>
        <ContextMenuItem
          aria-label={messages.endpoints.deleteEndpointMenuItem}
          className="h-11 gap-3 rounded-lg px-2.5"
          onClick={() => onDelete(endpoint)}
          variant="destructive"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-destructive/15 bg-destructive/10 text-destructive">
            <HugeiconsIcon
              className="size-3.5"
              icon={Delete02Icon}
              strokeWidth={2}
            />
          </span>
          <span aria-hidden="true" className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium text-sm">
              {messages.endpoints.deleteEndpointMenuItem}
            </span>
            <span className="font-normal text-[10px] text-muted-foreground">
              Remove from this catalog
            </span>
          </span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
