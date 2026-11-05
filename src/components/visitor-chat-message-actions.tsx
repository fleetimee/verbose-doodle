import {
  Delete02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode, useCallback, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DashboardIpChatMessage } from "@/features/dashboard/dashboard-activity";
import { formatJakartaTimestamp } from "@/features/endpoints/utils/endpoint-time";

export type VisitorChatAction =
  | { type: "info" | "delete"; message: DashboardIpChatMessage }
  | { type: "clear" };

export function VisitorChatMessageActions({
  message,
  children,
  onAction,
}: {
  message: DashboardIpChatMessage;
  children: ReactNode;
  onAction: (action: VisitorChatAction) => void;
}) {
  const { messages } = useI18n();
  const copy = messages.dashboardActivity.presence;
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const ref = useCallback(
    (node: HTMLDivElement | null) =>
      setContainer(
        node?.closest<HTMLElement>('[data-slot="drawer-content"]') ?? null
      ),
    []
  );
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex w-full min-w-0 flex-col" ref={ref}>
          {children}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent portalContainer={container}>
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => onAction({ type: "info", message })}>
            <HugeiconsIcon icon={InformationCircleIcon} />
            {copy.chatMessageInfo}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={message.pending}
            onClick={() => onAction({ type: "delete", message })}
            variant="destructive"
          >
            <HugeiconsIcon icon={Delete02Icon} />
            {copy.chatDeleteMessage}
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function VisitorChatActionDialog({
  action,
  onClose,
  onDelete,
  pending,
  error,
  container,
}: {
  action: VisitorChatAction | null;
  onClose: () => void;
  onDelete: () => void;
  pending: boolean;
  error: string | null;
  container: HTMLElement | null;
}) {
  const { messages } = useI18n();
  const copy = messages.dashboardActivity.presence;
  const info = action?.type === "info" ? action.message : null;
  const warning =
    action?.type === "clear" ? copy.chatClearWarning : copy.chatDeleteWarning;
  let title = copy.chatDeleteMessage;
  if (info) {
    title = copy.chatMessageInfo;
  } else if (action?.type === "clear") {
    title = copy.chatClearAll;
  }
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!(open || pending)) {
          onClose();
        }
      }}
      open={action !== null}
    >
      <DialogContent portalContainer={container} showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {info ? copy.chatMessageInfoDescription : warning}
          </DialogDescription>
        </DialogHeader>
        {info ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt>{copy.chatSender}</dt>
            <dd className="break-all">
              {info.senderUsername} ({info.senderIp})
            </dd>
            <dt>{copy.chatRecipient}</dt>
            <dd className="break-all">{info.recipientIp}</dd>
            <dt>{copy.chatSentAt}</dt>
            <dd>
              {info.pending
                ? copy.chatReceiptPendingLabel
                : formatJakartaTimestamp(info.createdAt)}
            </dd>
            <dt>{copy.chatReadAt}</dt>
            <dd>
              {info.readAt
                ? formatJakartaTimestamp(info.readAt)
                : copy.chatNotRead}
            </dd>
          </dl>
        ) : null}
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            disabled={pending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            {info ? messages.common.close : messages.common.cancel}
          </Button>
          {info ? null : (
            <Button
              disabled={pending}
              onClick={onDelete}
              type="button"
              variant="destructive"
            >
              {pending ? copy.chatDeleting : copy.chatConfirmDelete}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
