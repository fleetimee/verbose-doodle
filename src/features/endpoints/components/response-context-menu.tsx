import {
  CheckmarkCircle02Icon,
  Clock03Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactElement } from "react";
import {
  CircleOff,
  CopyIcon,
  FileJson,
  Hash,
  TextCursor,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { EndpointResponse } from "@/features/endpoints/types";

type ResponseEditType = "name" | "statusCode" | "json";

type ResponseContextMenuProps = {
  readonly children: ReactElement;
  readonly canCloneResponse: boolean;
  readonly enabled: boolean;
  readonly isActive: boolean;
  readonly isCloning: boolean;
  readonly isLoading: boolean;
  readonly isSelected: boolean;
  readonly onActivate: () => void;
  readonly onClone: () => void;
  readonly onDeactivate: () => void;
  readonly onDelete: () => void;
  readonly onEdit: (type: ResponseEditType) => void;
  readonly onSimulate: () => void;
  readonly response: EndpointResponse;
};

export function ResponseContextMenu({
  canCloneResponse,
  children,
  enabled,
  isActive,
  isCloning,
  isLoading,
  isSelected,
  onActivate,
  onClone,
  onDeactivate,
  onDelete,
  onEdit,
  onSimulate,
  response,
}: ResponseContextMenuProps) {
  const { messages } = useI18n();

  if (!enabled) {
    return children;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-60" variant="subtle">
        <ContextMenuGroup>
          <ContextMenuLabel size="card">
            <span className="block truncate font-semibold text-foreground text-sm">
              {response.name}
            </span>
            <span className="mt-1 flex items-center gap-2 font-mono text-muted-foreground text-xs">
              <span>{response.statusCode}</span>
              <span aria-hidden="true" className="text-border">
                /
              </span>
              <span>{messages.endpoints.responseConfiguration}</span>
              {isActive && (
                <Badge className="ml-auto" size="xs" variant="success">
                  {messages.common.active}
                </Badge>
              )}
            </span>
          </ContextMenuLabel>
        </ContextMenuGroup>
        <ContextMenuSeparator className="my-1.5" />
        <ContextMenuItem
          disabled={!canCloneResponse || isCloning}
          onClick={onClone}
        >
          <CopyIcon className="size-4" />
          {isCloning
            ? messages.endpoints.responseCloneLoading
            : messages.endpoints.responseCloneAction}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!isSelected} onClick={() => onEdit("name")}>
          <TextCursor className="size-4" />
          {messages.endpoints.editName}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!isSelected}
          onClick={() => onEdit("statusCode")}
        >
          <Hash className="size-4" />
          {messages.endpoints.editStatusCode}
        </ContextMenuItem>
        <ContextMenuItem disabled={!isSelected} onClick={() => onEdit("json")}>
          <FileJson className="size-4" />
          {messages.endpoints.editJsonResponse}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!isSelected} onClick={onSimulate}>
          <HugeiconsIcon icon={Clock03Icon} strokeWidth={2} />
          {messages.endpoints.simulateTimeout}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={isLoading}
          onClick={isActive ? onDeactivate : onActivate}
        >
          {isActive ? (
            <CircleOff className="size-4" />
          ) : (
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
          )}
          {isActive
            ? messages.endpoints.deactivateResponse
            : messages.endpoints.setActive}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={!isSelected}
          onClick={onDelete}
          variant="destructive"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          {messages.endpoints.deleteResponse}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
