import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getAuthToken } from "@/features/auth/utils";
import { createRealtimeTicket } from "@/features/realtime/ticket-client";
import {
  createTicketedRealtimeConnection,
  type TicketedRealtimeConnection,
} from "@/features/realtime/ticketed-realtime-connection";
import { socksRelayQueryKeys } from "@/features/socks-relay/query-keys";
import type {
  RelayConnectionStatus,
  RelayEvent,
} from "@/features/socks-relay/types";
import { parseRelayEvent } from "@/features/socks-relay/utils";

const MAX_RELAY_EVENTS = 1000;
const RELAY_LIST_EVENTS = new Set(["relay_started", "relay_stopped"]);

type SocksRelayContextValue = {
  readonly clearLogs: () => void;
  readonly connectionStatus: RelayConnectionStatus;
  readonly events: RelayEvent[];
  readonly malformedEventCount: number;
};

const SocksRelayContext = createContext<SocksRelayContextValue | undefined>(
  undefined
);

export function SocksRelayProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [events, setEvents] = useState<RelayEvent[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<RelayConnectionStatus>("idle");
  const [malformedEventCount, setMalformedEventCount] = useState(0);
  const queryClient = useQueryClient();
  const eventCounterRef = useRef(0);
  const connectionRef = useRef<TicketedRealtimeConnection | null>(null);
  if (!connectionRef.current) {
    connectionRef.current = createTicketedRealtimeConnection({
      acquireTicket: () => createRealtimeTicket("relay-events"),
      configuredUrl: import.meta.env.VITE_RELAY_EVENTS_WS_URL,
      onMessage: (data) => {
        eventCounterRef.current += 1;
        const relayEvent = parseRelayEvent(
          String(data),
          `relay-event-${eventCounterRef.current}`
        );

        if (!relayEvent) {
          setMalformedEventCount((count) => count + 1);
          return;
        }

        setEvents((currentEvents) =>
          [...currentEvents, relayEvent].slice(-MAX_RELAY_EVENTS)
        );

        if (RELAY_LIST_EVENTS.has(relayEvent.type)) {
          queryClient.invalidateQueries({ queryKey: socksRelayQueryKeys.all });
        }
      },
      path: "/api/relay/events",
    });
  }
  const connection = connectionRef.current;

  const clearLogs = useCallback(() => {
    setEvents([]);
    setMalformedEventCount(0);
  }, []);

  useEffect(() => {
    const unsubscribe = connection.subscribe((snapshot) => {
      setConnectionStatus(snapshot.status);
    });

    if (getAuthToken()) {
      connection.connect().catch(() => undefined);
    } else {
      setConnectionStatus("disconnected");
    }

    return () => {
      unsubscribe();
      connection.disconnect();
    };
  }, [connection]);

  return (
    <SocksRelayContext.Provider
      value={{
        clearLogs,
        connectionStatus,
        events,
        malformedEventCount,
      }}
    >
      {children}
    </SocksRelayContext.Provider>
  );
}

export function useSocksRelayContext() {
  const context = useContext(SocksRelayContext);
  if (!context) {
    throw new Error(
      "useSocksRelayContext must be used within a SocksRelayProvider"
    );
  }

  return context;
}
