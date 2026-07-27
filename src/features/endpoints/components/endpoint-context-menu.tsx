import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactElement } from "react";
import { Pen } from "@/components/hugeicons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEdit(endpoint)}>
          <Pen />
          {messages.endpoints.editEndpointMenuItem}
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(endpoint)}
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          {messages.endpoints.deleteEndpointMenuItem}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
