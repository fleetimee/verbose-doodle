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
  if (!enabled) {
    return children;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-60 rounded-xl border-border/70 bg-popover/95 p-1.5 shadow-black/10 shadow-xl backdrop-blur-md">
        <ContextMenuGroup>
          <ContextMenuLabel className="px-2.5 py-2">
            <span className="block truncate font-semibold text-foreground text-sm">
              {response.name}
            </span>
            <span className="mt-1 flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span>{response.statusCode}</span>
              <span aria-hidden="true" className="text-border">
                /
              </span>
              <span>response configuration</span>
              {isActive && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-medium font-sans text-[10px] text-emerald-700 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
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
          {isCloning ? "Cloning response..." : "Clone response"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!isSelected} onClick={() => onEdit("name")}>
          <TextCursor className="size-4" />
          Edit Name
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!isSelected}
          onClick={() => onEdit("statusCode")}
        >
          <Hash className="size-4" />
          Edit Status Code
        </ContextMenuItem>
        <ContextMenuItem disabled={!isSelected} onClick={() => onEdit("json")}>
          <FileJson className="size-4" />
          Edit JSON Response
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!isSelected} onClick={onSimulate}>
          <HugeiconsIcon icon={Clock03Icon} strokeWidth={2} />
          Simulate timeout
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
          {isActive ? "Deactivate response" : "Set active"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={!isSelected}
          onClick={onDelete}
          variant="destructive"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          Delete Response
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
