import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useAuth } from "@/features/auth/context";
import {
  type DashboardPresenceSnapshot,
  type DashboardVisitEvent,
  fetchDashboardPresence,
  parseDashboardPresenceEvent,
  parseDashboardVisitEvent,
  recordDashboardVisit,
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

type DashboardVisitNotice = {
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

export function DashboardVisitNotifications() {
  const { snapshot } = useAuth();
  const location = useLocation();
  const [notices, setNotices] = useState<DashboardVisitNotice[]>([]);
  const seenVisitIdsRef = useRef(new Set<string>());
  const visitMessageIndexRef = useRef<number | null>(null);
  const recordedVisitUserIdRef = useRef<string | null>(null);
  const recordedVisitPromiseRef =
    useRef<Promise<DashboardVisitEvent | null> | null>(null);
  const currentVisitIdRef = useRef<string | null>(null);
  const currentIpAddressRef = useRef<string | null>(null);
  const currentPathnameRef = useRef<string>(location.pathname);
  currentPathnameRef.current = location.pathname;
  const visitRequestGenerationRef = useRef(0);
  const connectionRef = useRef<TicketedRealtimeConnection | null>(null);

  if (!connectionRef.current) {
    connectionRef.current = createTicketedRealtimeConnection({
      acquireTicket: () => createRealtimeTicket("dashboard-visits"),
      configuredUrl: import.meta.env.VITE_DASHBOARD_EVENTS_WS_URL,
      onMessage: (data) => {
        const presenceEvent = parseDashboardPresenceEvent(data);
        if (presenceEvent) {
          queryClient.setQueryData<DashboardPresenceSnapshot | null>(
            DASHBOARD_PRESENCE_QUERY_KEY,
            (previous) => ({
              currentIp:
                previous?.currentIp ?? currentIpAddressRef.current ?? "unknown",
              history: presenceEvent.payload.history,
              onlineCount: presenceEvent.payload.onlineCount,
              peakOnlineCount: presenceEvent.payload.peakOnlineCount,
              visitors: presenceEvent.payload.visitors,
            })
          );
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
        type: "page_change",
      })
    );
  }, [
    connection,
    isDashboardRoute,
    location.pathname,
    snapshot.isAuthenticated,
  ]);

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
      <p className="dashboard-visit-bubble-copy">{notice.copy}</p>
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
