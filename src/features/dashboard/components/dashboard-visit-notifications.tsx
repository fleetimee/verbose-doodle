import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { useAuth } from "@/features/auth/context";
import {
  type DashboardVisitEvent,
  parseDashboardVisitEvent,
  recordDashboardVisit,
} from "@/features/dashboard/dashboard-activity";
import { createRealtimeTicket } from "@/features/realtime/ticket-client";
import {
  createTicketedRealtimeConnection,
  type TicketedRealtimeConnection,
} from "@/features/realtime/ticketed-realtime-connection";
import { formatMessage, messages } from "@/lib/i18n";

const DASHBOARD_EVENTS_PATH = "/api/dashboard/events";
const DASHBOARD_VISIT_BUBBLE_DURATION_MS = 6000;
const MAX_SEEN_VISIT_IDS = 1000;

type DashboardVisitNotice = {
  readonly copy: string;
  readonly visitId: string;
};

export function DashboardVisitNotifications() {
  const { snapshot } = useAuth();
  const location = useLocation();
  const [notice, setNotice] = useState<DashboardVisitNotice | null>(null);
  const seenVisitIdsRef = useRef(new Set<string>());
  const visitMessageIndexRef = useRef<number | null>(null);
  const recordedVisitUserIdRef = useRef<string | null>(null);
  const recordedVisitPromiseRef =
    useRef<Promise<DashboardVisitEvent | null> | null>(null);
  const currentVisitIdRef = useRef<string | null>(null);
  const visitRequestGenerationRef = useRef(0);
  const connectionRef = useRef<TicketedRealtimeConnection | null>(null);

  if (!connectionRef.current) {
    connectionRef.current = createTicketedRealtimeConnection({
      acquireTicket: () => createRealtimeTicket("dashboard-visits"),
      configuredUrl: import.meta.env.VITE_DASHBOARD_EVENTS_WS_URL,
      onMessage: (data) => {
        const event = parseDashboardVisitEvent(data);
        if (
          !event ||
          event.payload.visitId === currentVisitIdRef.current ||
          seenVisitIdsRef.current.has(event.payload.visitId)
        ) {
          return;
        }

        seenVisitIdsRef.current.add(event.payload.visitId);
        if (seenVisitIdsRef.current.size > MAX_SEEN_VISIT_IDS) {
          const oldestVisitId = seenVisitIdsRef.current.values().next().value;
          if (oldestVisitId) {
            seenVisitIdsRef.current.delete(oldestVisitId);
          }
        }

        const visitMessages = messages.dashboardActivity.visitMessages;
        let messageIndex = Math.floor(Math.random() * visitMessages.length);
        if (
          visitMessages.length > 1 &&
          messageIndex === visitMessageIndexRef.current
        ) {
          messageIndex = (messageIndex + 1) % visitMessages.length;
        }
        visitMessageIndexRef.current = messageIndex;
        const message = visitMessages[messageIndex] ?? visitMessages[0];
        if (!message) {
          return;
        }

        setNotice({
          copy: formatMessage(message, {
            ip:
              event.payload.ipAddress ??
              messages.dashboardActivity.visitIpFallback,
          }),
          visitId: event.payload.visitId,
        });
      },
      path: DASHBOARD_EVENTS_PATH,
    });
  }

  const connection = connectionRef.current;
  const isDashboardRoute =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/dashboard/");
  const userId = snapshot.user?.user_id;

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = globalThis.setTimeout(
      () => setNotice(null),
      DASHBOARD_VISIT_BUBBLE_DURATION_MS
    );
    return () => globalThis.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    const hasDashboardSession = snapshot.isAuthenticated && isDashboardRoute;

    if (!(hasDashboardSession && userId)) {
      recordedVisitUserIdRef.current = null;
      recordedVisitPromiseRef.current = null;
      currentVisitIdRef.current = null;
      visitRequestGenerationRef.current += 1;
      connection.disconnect();
      return;
    }

    if (recordedVisitUserIdRef.current !== userId) {
      recordedVisitUserIdRef.current = userId;
      currentVisitIdRef.current = null;
      const generation = ++visitRequestGenerationRef.current;
      recordedVisitPromiseRef.current = recordDashboardVisit()
        .then((visit) => {
          if (visitRequestGenerationRef.current === generation) {
            currentVisitIdRef.current = visit?.payload.visitId ?? null;
          }
          return visit;
        })
        .catch(() => null);
    }

    let active = true;
    const connectAfterVisit = async () => {
      await (recordedVisitPromiseRef.current ?? Promise.resolve(null));
      if (!active) {
        return;
      }
      await connection.connect();
    };
    connectAfterVisit().catch(() => undefined);

    return () => {
      active = false;
      connection.disconnect();
    };
  }, [connection, isDashboardRoute, snapshot.isAuthenticated, userId]);

  if (!notice) {
    return null;
  }

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="dashboard-visit-bubble"
      data-slot="dashboard-visit-bubble"
      key={notice.visitId}
      role="status"
    >
      <span aria-hidden="true" className="dashboard-visit-bubble-burst" />
      <p className="dashboard-visit-bubble-copy">{notice.copy}</p>
      <button
        aria-label={messages.dashboardActivity.visitDismissLabel}
        className="dashboard-visit-bubble-dismiss"
        onClick={() => setNotice(null)}
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
