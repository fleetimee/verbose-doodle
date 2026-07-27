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
  onEdit: (endpoint: Endpoint) => void;
};

export function EndpointContextMenu({
  canEdit,
  children,
  endpoint,
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
      </ContextMenuContent>
    </ContextMenu>
  );
}
