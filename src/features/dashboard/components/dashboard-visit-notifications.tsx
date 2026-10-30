import {
  Cancel01Icon,
  MessageSquareCodeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { useIsScreenLocked } from "@/features/auth/components/screen-lock";
import { useAuth } from "@/features/auth/context";
import {
  type DashboardIpChatMessage,
  type DashboardIpChatReadPayload,
  type DashboardIpChatThread,
  type DashboardPresenceEvent,
  type DashboardPresenceSnapshot,
  type DashboardVisitEvent,
  dispatchOpenVisitorChat,
  fetchDashboardPresence,
  getActiveVisitorChatTargetIp,
  parseDashboardChatEvent,
  parseDashboardChatReadEvent,
  parseDashboardPresenceEvent,
  parseDashboardVisitEvent,
  playVisitorChatNotificationSound,
  recordDashboardVisit,
  tryShowNativeVisitorChatNotification,
} from "@/features/dashboard/dashboard-activity";
import { createRealtimeTicket } from "@/features/realtime/ticket-client";
import {
  createTicketedRealtimeConnection,
  type TicketedRealtimeConnection,
} from "@/features/realtime/ticketed-realtime-connection";
import { formatMessage, messages } from "@/lib/i18n";
import { queryClient } from "@/lib/query-client";

const DASHBOARD_EVENTS_PATH = "/api/dashboard/events";
const DASHBOARD_VISIT_BUBBLE_DURATION_MS = 6000;
const DASHBOARD_VISIT_BUBBLE_EXIT_DURATION_MS = 260;
const MAX_ACTIVE_VISIT_NOTICES = 4;
const MAX_SEEN_VISIT_IDS = 1000;

export const DASHBOARD_PRESENCE_QUERY_KEY = ["dashboard", "presence"] as const;
export const dashboardChatThreadQueryKey = (targetIp: string) =>
  ["dashboard", "chat", targetIp] as const;

type DashboardVisitNotice = {
  readonly chatTargetIp?: string;
  readonly copy: string;
  readonly visitId: string;
};

function rememberSeenVisitId(seenVisitIds: Set<string>, visitId: string): void {
  seenVisitIds.add(visitId);
  if (seenVisitIds.size > MAX_SEEN_VISIT_IDS) {
    const oldestVisitId = seenVisitIds.values().next().value;
    if (oldestVisitId) {
      seenVisitIds.delete(oldestVisitId);
    }
  }
}

function pickVisitMessage(
  lastIndexRef: { current: number | null },
  visitMessages: readonly string[]
): string | undefined {
  let messageIndex = Math.floor(Math.random() * visitMessages.length);
  if (visitMessages.length > 1 && messageIndex === lastIndexRef.current) {
    messageIndex = (messageIndex + 1) % visitMessages.length;
  }
  lastIndexRef.current = messageIndex;
  return visitMessages[messageIndex] ?? visitMessages[0];
}

function applyPresenceEventToCache(
  presenceEvent: DashboardPresenceEvent,
  fallbackCurrentIp: string | null
): void {
  queryClient.setQueryData<DashboardPresenceSnapshot | null>(
    DASHBOARD_PRESENCE_QUERY_KEY,
    (previous) => {
      const previousByIp = new Map(
        (previous?.visitors ?? []).map((v) => [v.ipAddress, v])
      );
      const mergedVisitors = presenceEvent.payload.visitors.map((visitor) => {
        const prev = previousByIp.get(visitor.ipAddress);
        return {
          ...visitor,
          lastChatAt: visitor.lastChatAt ?? prev?.lastChatAt,
          lastChatMessage: visitor.lastChatMessage ?? prev?.lastChatMessage,
          lastChatSenderIp: visitor.lastChatSenderIp ?? prev?.lastChatSenderIp,
          unreadCount: Math.max(visitor.unreadCount, prev?.unreadCount ?? 0),
        };
      });
      return {
        currentIp: previous?.currentIp ?? fallbackCurrentIp ?? "unknown",
        history: presenceEvent.payload.history,
        onlineCount: presenceEvent.payload.onlineCount,
        peakOnlineCount: presenceEvent.payload.peakOnlineCount,
        visitors: mergedVisitors,
      };
    }
  );
}

function updatePresenceVisitorForChat(
  msg: DashboardIpChatMessage,
  peerIp: string,
  incrementUnread: boolean
): void {
  queryClient.setQueryData<DashboardPresenceSnapshot | null>(
    DASHBOARD_PRESENCE_QUERY_KEY,
    (previous) => {
      if (!previous) {
        return previous;
      }
      const exists = previous.visitors.some((v) => v.ipAddress === peerIp);
      const nextVisitors = exists
        ? previous.visitors.map((visitor) =>
            visitor.ipAddress === peerIp
              ? {
                  ...visitor,
                  lastChatAt: msg.createdAt,
                  lastChatMessage: msg.message,
                  lastChatSenderIp: msg.senderIp,
                  unreadCount: incrementUnread
                    ? visitor.unreadCount + 1
                    : visitor.unreadCount,
                }
              : visitor
          )
        : [
            {
              activeConnections: 1,
              currentPath: "/dashboard/overview",
              ipAddress: peerIp,
              lastChatAt: msg.createdAt,
              lastChatMessage: msg.message,
              lastChatSenderIp: msg.senderIp,
              lastSeenAt: msg.createdAt,
              online: true,
              sleeping: false,
              unreadCount: incrementUnread ? 1 : 0,
            },
            ...previous.visitors,
          ];
      return {
        ...previous,
        visitors: nextVisitors,
      };
    }
  );
}

function formatChatToastPreview(
  rawMessage: string | undefined
): string | undefined {
  if (!rawMessage) {
    return undefined;
  }
  return rawMessage.length > 96 ? `${rawMessage.slice(0, 96)}…` : rawMessage;
}

function applyChatReadEventToCache(
  readPayload: DashboardIpChatReadPayload,
  myIp: string | null
): void {
  const peerIp =
    readPayload.senderIp === myIp
      ? readPayload.recipientIp
      : readPayload.senderIp;
  queryClient.setQueryData<DashboardIpChatThread | null>(
    dashboardChatThreadQueryKey(peerIp),
    (previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        messages: previous.messages.map((message) =>
          message.senderIp === readPayload.senderIp &&
          message.recipientIp === readPayload.recipientIp &&
          !message.readAt
            ? { ...message, readAt: readPayload.readAt }
            : message
        ),
      };
    }
  );
}

function showVisitorChatToast({
  senderIp,
  subtitle,
  preview,
  unreadCount,
  toastId,
}: {
  senderIp: string;
  subtitle: string;
  preview: string | undefined;
  unreadCount?: number;
  toastId: string;
}): void {
  const copy = messages.dashboardActivity.presence;
  playVisitorChatNotificationSound();
  tryShowNativeVisitorChatNotification({
    body: preview,
    senderIp,
    title: subtitle,
  });
  toast.custom(
    (id) => (
      <div className="flex w-80 flex-col gap-2.5 rounded-xl border bg-popover p-3.5 text-popover-foreground shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
              <HugeiconsIcon
                className="size-4"
                icon={MessageSquareCodeIcon}
                strokeWidth={2}
              />
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-success ring-2 ring-popover"
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-mono font-semibold text-xs">
                  {senderIp}
                </span>
                {unreadCount && unreadCount > 1 ? (
                  <Badge mono size="xs" variant="primary-subtle">
                    {unreadCount}
                  </Badge>
                ) : null}
              </div>
              <span className="truncate text-muted-foreground text-xs">
                {subtitle}
              </span>
            </div>
          </div>
          <Button
            aria-label={messages.dashboardActivity.visitDismissLabel}
            onClick={() => toast.dismiss(id)}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        </div>

        {preview ? (
          <Bubble className="w-full max-w-full" variant="muted">
            <BubbleContent className="w-full">{preview}</BubbleContent>
          </Bubble>
        ) : null}

        <div className="flex items-center justify-end gap-1.5">
          <Button
            onClick={() => {
              dispatchOpenVisitorChat(senderIp);
              toast.dismiss(id);
            }}
            size="xs"
            type="button"
          >
            <span>{copy.chatOpenReplyLabel}</span>
          </Button>
        </div>
      </div>
    ),
    {
      duration: 7000,
      id: toastId,
    }
  );
}

function applyIncomingChatToCache(
  msg: DashboardIpChatMessage,
  myIp: string | null
): void {
  const peerIp = msg.senderIp === myIp ? msg.recipientIp : msg.senderIp;
  queryClient.setQueryData<DashboardIpChatThread | null>(
    dashboardChatThreadQueryKey(peerIp),
    (previous) => {
      if (!previous) {
        return previous;
      }
      if (previous.messages.some((existing) => existing.id === msg.id)) {
        return previous;
      }
      const pendingIndex = previous.messages.findIndex(
        (existing) =>
          existing.pending &&
          existing.senderIp === msg.senderIp &&
          existing.message === msg.message
      );
      if (pendingIndex !== -1) {
        const nextMessages = [...previous.messages];
        nextMessages[pendingIndex] = msg;
        return {
          ...previous,
          messages: nextMessages,
        };
      }
      return {
        ...previous,
        messages: [...previous.messages, msg],
      };
    }
  );

  const isIncomingForMe = Boolean(
    myIp && msg.recipientIp === myIp && msg.senderIp !== myIp
  );
  const isChatOpenWithSender =
    isIncomingForMe && getActiveVisitorChatTargetIp() === msg.senderIp;

  updatePresenceVisitorForChat(
    msg,
    peerIp,
    isIncomingForMe && !isChatOpenWithSender
  );

  if (!isIncomingForMe || isChatOpenWithSender) {
    return;
  }

  const copy = messages.dashboardActivity.presence;
  showVisitorChatToast({
    preview: formatChatToastPreview(msg.message),
    senderIp: msg.senderIp,
    subtitle: formatMessage(copy.chatToastIncomingTitle, { ip: msg.senderIp }),
    toastId: `visitor-chat-${msg.senderIp}-${msg.id}`,
  });
}

function announceOfflineUnreadChats(
  presenceSnapshot: DashboardPresenceSnapshot,
  announcedUnreadIps: Set<string>
): void {
  const activeChatIp = getActiveVisitorChatTargetIp();
  const unreadSenders = presenceSnapshot.visitors.filter(
    (visitor) =>
      visitor.unreadCount > 0 &&
      visitor.ipAddress !== presenceSnapshot.currentIp &&
      visitor.ipAddress !== activeChatIp &&
      !announcedUnreadIps.has(visitor.ipAddress)
  );
  if (unreadSenders.length === 0) {
    return;
  }

  const copy = messages.dashboardActivity.presence;
  for (const sender of unreadSenders) {
    announcedUnreadIps.add(sender.ipAddress);
    const titleTemplate =
      sender.unreadCount === 1
        ? copy.chatUnreadVisitBubbleSingle
        : copy.chatUnreadVisitBubblePlural;
    showVisitorChatToast({
      preview: formatChatToastPreview(sender.lastChatMessage),
      senderIp: sender.ipAddress,
      subtitle: formatMessage(titleTemplate, {
        count: sender.unreadCount,
        ip: sender.ipAddress,
      }),
      toastId: `visitor-unread-${sender.ipAddress}`,
      unreadCount: sender.unreadCount,
    });
  }
}

export function DashboardVisitNotifications() {
  const { snapshot } = useAuth();
  const isScreenLocked = useIsScreenLocked();
  const location = useLocation();
  const [notices, setNotices] = useState<DashboardVisitNotice[]>([]);
  const seenVisitIdsRef = useRef(new Set<string>());
  const visitMessageIndexRef = useRef<number | null>(null);
  const recordedVisitUserIdRef = useRef<string | null>(null);
  const recordedVisitPromiseRef =
    useRef<Promise<DashboardVisitEvent | null> | null>(null);
  const currentVisitIdRef = useRef<string | null>(null);
  const currentIpAddressRef = useRef<string | null>(null);
  const announcedUnreadIpsRef = useRef(new Set<string>());
  const currentPathnameRef = useRef<string>(location.pathname);
  currentPathnameRef.current = location.pathname;
  const isScreenLockedRef = useRef<boolean>(isScreenLocked);
  isScreenLockedRef.current = isScreenLocked;
  const visitRequestGenerationRef = useRef(0);
  const connectionRef = useRef<TicketedRealtimeConnection | null>(null);

  if (!connectionRef.current) {
    connectionRef.current = createTicketedRealtimeConnection({
      acquireTicket: () => createRealtimeTicket("dashboard-visits"),
      configuredUrl: import.meta.env.VITE_DASHBOARD_EVENTS_WS_URL,
      onMessage: (data) => {
        const chatReadEvent = parseDashboardChatReadEvent(data);
        if (chatReadEvent) {
          applyChatReadEventToCache(
            chatReadEvent.payload,
            currentIpAddressRef.current
          );
          return;
        }

        const chatEvent = parseDashboardChatEvent(data);
        if (chatEvent) {
          applyIncomingChatToCache(
            chatEvent.payload,
            currentIpAddressRef.current
          );
          return;
        }

        const presenceEvent = parseDashboardPresenceEvent(data);
        if (presenceEvent) {
          applyPresenceEventToCache(presenceEvent, currentIpAddressRef.current);
          return;
        }

        const event = parseDashboardVisitEvent(data);
        if (
          !event ||
          event.payload.visitId === currentVisitIdRef.current ||
          seenVisitIdsRef.current.has(event.payload.visitId)
        ) {
          return;
        }

        rememberSeenVisitId(seenVisitIdsRef.current, event.payload.visitId);
        const message = pickVisitMessage(
          visitMessageIndexRef,
          messages.dashboardActivity.visitMessages
        );
        if (!message) {
          return;
        }

        const nextNotice = {
          copy: formatMessage(message, {
            ip:
              event.payload.ipAddress ??
              messages.dashboardActivity.visitIpFallback,
          }),
          visitId: event.payload.visitId,
        };
        setNotices((currentNotices) =>
          [...currentNotices, nextNotice].slice(-MAX_ACTIVE_VISIT_NOTICES)
        );
      },
      path: DASHBOARD_EVENTS_PATH,
    });
  }

  const connection = connectionRef.current;
  const isDashboardRoute =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/dashboard/");
  const userId = snapshot.user?.user_id;
  const removeNotice = useCallback((visitId: string) => {
    setNotices((currentNotices) =>
      currentNotices.filter((notice) => notice.visitId !== visitId)
    );
  }, []);

  useEffect(() => {
    const hasDashboardSession = snapshot.isAuthenticated && isDashboardRoute;

    if (!(hasDashboardSession && userId)) {
      recordedVisitUserIdRef.current = null;
      recordedVisitPromiseRef.current = null;
      currentVisitIdRef.current = null;
      currentIpAddressRef.current = null;
      visitRequestGenerationRef.current += 1;
      connection.disconnect();
      return;
    }

    if (recordedVisitUserIdRef.current !== userId) {
      recordedVisitUserIdRef.current = userId;
      currentVisitIdRef.current = null;
      const generation = ++visitRequestGenerationRef.current;
      recordedVisitPromiseRef.current = recordDashboardVisit(
        currentPathnameRef.current
      )
        .then((visit) => {
          if (visitRequestGenerationRef.current === generation) {
            currentVisitIdRef.current = visit?.payload.visitId ?? null;
            currentIpAddressRef.current = visit?.payload.ipAddress ?? null;
          }
          return visit;
        })
        .catch(() => null);
    }

    let active = true;
    const unsubscribe = connection.subscribe((state) => {
      if (state.status === "connected" && active) {
        connection.send(
          JSON.stringify({
            path: currentPathnameRef.current,
            sleeping: isScreenLockedRef.current,
            type: "page_change",
          })
        );
      }
    });
    const connectAfterVisit = async () => {
      await (recordedVisitPromiseRef.current ?? Promise.resolve(null));
      if (!active) {
        return;
      }
      await connection.connect();
      if (!active) {
        return;
      }
      const presenceSnapshot = await fetchDashboardPresence().catch(() => null);
      if (active && presenceSnapshot) {
        currentIpAddressRef.current = presenceSnapshot.currentIp;
        queryClient.setQueryData(
          DASHBOARD_PRESENCE_QUERY_KEY,
          presenceSnapshot
        );
        announceOfflineUnreadChats(
          presenceSnapshot,
          announcedUnreadIpsRef.current
        );
      }
    };
    connectAfterVisit().catch(() => undefined);

    return () => {
      active = false;
      unsubscribe();
      connection.disconnect();
    };
  }, [connection, isDashboardRoute, snapshot.isAuthenticated, userId]);

  useEffect(() => {
    if (!(snapshot.isAuthenticated && isDashboardRoute)) {
      return;
    }
    connection.send(
      JSON.stringify({
        path: location.pathname,
        sleeping: isScreenLockedRef.current,
        type: "page_change",
      })
    );
  }, [
    connection,
    isDashboardRoute,
    location.pathname,
    snapshot.isAuthenticated,
  ]);

  useEffect(() => {
    if (!(snapshot.isAuthenticated && isDashboardRoute)) {
      return;
    }
    connection.send(
      JSON.stringify({
        sleeping: isScreenLocked,
        type: "presence_status",
      })
    );
  }, [connection, isDashboardRoute, isScreenLocked, snapshot.isAuthenticated]);

  if (notices.length === 0) {
    return null;
  }

  return (
    <div
      className="dashboard-visit-bubble-stack"
      data-slot="dashboard-visit-bubble-stack"
    >
      {notices.map((notice) => (
        <DashboardVisitBubble
          key={notice.visitId}
          notice={notice}
          onRemove={removeNotice}
        />
      ))}
    </div>
  );
}

type DashboardVisitBubbleProps = {
  readonly notice: DashboardVisitNotice;
  readonly onRemove: (visitId: string) => void;
};

function DashboardVisitBubble({ notice, onRemove }: DashboardVisitBubbleProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    if (isDismissing) {
      return;
    }

    const timeoutId = globalThis.setTimeout(
      () => setIsDismissing(true),
      DASHBOARD_VISIT_BUBBLE_DURATION_MS
    );
    return () => globalThis.clearTimeout(timeoutId);
  }, [isDismissing]);

  useEffect(() => {
    if (!isDismissing) {
      return;
    }

    const timeoutId = globalThis.setTimeout(
      () => onRemove(notice.visitId),
      DASHBOARD_VISIT_BUBBLE_EXIT_DURATION_MS
    );
    return () => globalThis.clearTimeout(timeoutId);
  }, [isDismissing, notice.visitId, onRemove]);

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="dashboard-visit-bubble"
      data-slot="dashboard-visit-bubble"
      data-state={isDismissing ? "exiting" : "visible"}
      role="status"
    >
      <span aria-hidden="true" className="dashboard-visit-bubble-slash" />
      <span aria-hidden="true" className="dashboard-visit-bubble-burst" />
      {notice.chatTargetIp ? (
        <button
          className="dashboard-visit-bubble-copy cursor-pointer text-left underline-offset-2 hover:underline"
          onClick={() => {
            if (notice.chatTargetIp) {
              dispatchOpenVisitorChat(notice.chatTargetIp);
            }
            setIsDismissing(true);
          }}
          title={messages.dashboardActivity.presence.chatOpenReplyLabel}
          type="button"
        >
          {notice.copy}
        </button>
      ) : (
        <p className="dashboard-visit-bubble-copy">{notice.copy}</p>
      )}
      <button
        aria-label={messages.dashboardActivity.visitDismissLabel}
        className="dashboard-visit-bubble-dismiss"
        onClick={() => setIsDismissing(true)}
        type="button"
      >
        <HugeiconsIcon
          aria-hidden="true"
          className="size-4"
          icon={Cancel01Icon}
          strokeWidth={2}
        />
      </button>
    </div>
  );
}
