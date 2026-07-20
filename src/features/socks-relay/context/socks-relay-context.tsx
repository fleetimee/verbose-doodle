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
import { socksRelayQueryKeys } from "@/features/socks-relay/query-keys";
import type {
  RelayConnectionStatus,
  RelayEvent,
} from "@/features/socks-relay/types";
import {
  buildRelayWebSocketUrl,
  parseRelayEvent,
} from "@/features/socks-relay/utils";

const MAX_RELAY_EVENTS = 1000;
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15_000;
const RECONNECT_MULTIPLIER = 2;
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
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const eventCounterRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const connectionGenerationRef = useRef(0);

  const clearLogs = useCallback(() => {
    setEvents([]);
    setMalformedEventCount(0);
  }, []);

  useEffect(() => {
    const generation = connectionGenerationRef.current + 1;
    connectionGenerationRef.current = generation;
    shouldReconnectRef.current = true;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (
        !shouldReconnectRef.current ||
        connectionGenerationRef.current !== generation
      ) {
        return;
      }
      setConnectionStatus("reconnecting");
      const delay = Math.min(
        RECONNECT_BASE_DELAY_MS *
          RECONNECT_MULTIPLIER ** reconnectAttemptRef.current,
        RECONNECT_MAX_DELAY_MS
      );
      reconnectAttemptRef.current += 1;
      reconnectTimerRef.current = setTimeout(async () => {
        await connect();
      }, delay);
    };

    const connect = async () => {
      clearReconnectTimer();
      if (connectionGenerationRef.current !== generation) {
        return;
      }
      if (!getAuthToken()) {
        setConnectionStatus("disconnected");
        return;
      }
      setConnectionStatus(
        reconnectAttemptRef.current === 0 ? "connecting" : "reconnecting"
      );

      let ticket: string;
      try {
        ticket = (await createRealtimeTicket("relay-events")).ticket;
      } catch {
        scheduleReconnect();
        return;
      }
      if (
        !shouldReconnectRef.current ||
        connectionGenerationRef.current !== generation
      ) {
        return;
      }

      const socket = new WebSocket(buildRelayWebSocketUrl(ticket));
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnectionStatus("connected");
      };

      socket.onmessage = (message) => {
        eventCounterRef.current += 1;
        const relayEvent = parseRelayEvent(
          String(message.data),
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
      };

      socket.onclose = () => {
        if (connectionGenerationRef.current !== generation) {
          return;
        }
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        scheduleReconnect();
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    const initialConnection = connect();
    initialConnection.catch(scheduleReconnect);

    return () => {
      shouldReconnectRef.current = false;
      if (connectionGenerationRef.current === generation) {
        connectionGenerationRef.current += 1;
      }
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
      setConnectionStatus("disconnected");
    };
  }, [queryClient]);

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
