import {
  buildTicketWebSocketUrl,
  type RealtimeTicket,
} from "@/features/realtime/ticket-client";

export const TICKETED_REALTIME_RECONNECT_DELAYS_MS = [
  1000, 2000, 4000, 8000, 15_000,
] as const;

const SOCKET_OPEN = 1;
const SOCKET_CLOSED = 3;

export type TicketedRealtimeConnectionStatus =
  | "idle"
  | "connecting"
  | "reconnecting"
  | "connected"
  | "disconnected";

export type TicketedRealtimeConnectionSnapshot = {
  readonly status: TicketedRealtimeConnectionStatus;
  readonly reconnectAttempt: number;
  readonly url?: string;
};

export type RealtimeSocketEventHandlers = {
  readonly onClose: () => void;
  readonly onError: (error: unknown) => void;
  readonly onMessage: (data: unknown) => void;
  readonly onOpen: () => void;
};

export type RealtimeSocket = {
  readyState: number;
  close: () => void;
  send: (data: string) => void;
};

export type RealtimeSocketAdapter = {
  readonly connect: (
    url: string,
    handlers: RealtimeSocketEventHandlers
  ) => RealtimeSocket;
};

export type TicketedRealtimeConnectionOptions = {
  readonly acquireTicket: () => Promise<Pick<RealtimeTicket, "ticket">>;
  readonly configuredUrl?: string;
  readonly onError?: (error: unknown) => void;
  readonly onMessage?: (data: unknown) => void;
  readonly onTicketError?: (error: unknown) => void;
  readonly path: string;
  readonly socketAdapter?: RealtimeSocketAdapter;
};

export type TicketedRealtimeConnection = {
  readonly connect: () => Promise<void>;
  readonly disconnect: () => void;
  readonly dispose: () => void;
  readonly getSnapshot: () => TicketedRealtimeConnectionSnapshot;
  readonly send: (data: string) => boolean;
  readonly subscribe: (
    listener: (snapshot: TicketedRealtimeConnectionSnapshot) => void
  ) => () => void;
};

export function createBrowserRealtimeSocketAdapter(): RealtimeSocketAdapter {
  return {
    connect: (url, handlers) => {
      const socket = new WebSocket(url);
      socket.addEventListener("open", handlers.onOpen);
      socket.addEventListener("message", (event) => {
        handlers.onMessage(event.data);
      });
      socket.addEventListener("error", (event) => {
        handlers.onError(event instanceof ErrorEvent ? event.error : event);
      });
      socket.addEventListener("close", handlers.onClose);
      return socket;
    },
  };
}

export function createFakeRealtimeSocketAdapter(): RealtimeSocketAdapter & {
  readonly sockets: FakeRealtimeSocket[];
} {
  const sockets: FakeRealtimeSocket[] = [];

  return {
    connect: (url, handlers) => {
      let closed = false;
      const socket: FakeRealtimeSocket = {
        readyState: 0,
        sent: [],
        url,
        close: () => {
          if (closed) {
            return;
          }
          closed = true;
          socket.readyState = SOCKET_CLOSED;
          handlers.onClose();
        },
        fail: (error = new Error("fake socket failure")) => {
          handlers.onError(error);
        },
        open: () => {
          if (closed) {
            return;
          }
          socket.readyState = SOCKET_OPEN;
          handlers.onOpen();
        },
        receive: (data) => {
          if (!closed) {
            handlers.onMessage(data);
          }
        },
        send: (data) => {
          if (closed) {
            throw new Error("fake socket is closed");
          }
          socket.sent.push(data);
        },
      };
      sockets.push(socket);
      return socket;
    },
    sockets,
  };
}

export type FakeRealtimeSocket = RealtimeSocket & {
  readonly fail: (error?: unknown) => void;
  readonly open: () => void;
  readonly receive: (data: unknown) => void;
  readonly sent: string[];
  readonly url: string;
};

export function createTicketedRealtimeConnection({
  acquireTicket,
  configuredUrl,
  onError,
  onMessage,
  onTicketError,
  path,
  socketAdapter = createBrowserRealtimeSocketAdapter(),
}: TicketedRealtimeConnectionOptions): TicketedRealtimeConnection {
  const listeners = new Set<
    (snapshot: TicketedRealtimeConnectionSnapshot) => void
  >();
  let activeSocket: RealtimeSocket | null = null;
  let activeAttempt = 0;
  let attemptPromise: Promise<void> | null = null;
  let disposed = false;
  let generation = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempt = 0;
  let reconnectDelayIndex = 0;
  let shouldReconnect = false;
  let snapshot: TicketedRealtimeConnectionSnapshot = {
    reconnectAttempt: 0,
    status: "idle",
  };

  const notify = () => {
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  const setSnapshot = (nextSnapshot: TicketedRealtimeConnectionSnapshot) => {
    snapshot = nextSnapshot;
    notify();
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const isCurrentAttempt = (
    currentGeneration: number,
    currentAttempt: number
  ) =>
    !disposed &&
    shouldReconnect &&
    generation === currentGeneration &&
    activeAttempt === currentAttempt;

  const scheduleReconnect = (currentGeneration: number) => {
    if (
      disposed ||
      !shouldReconnect ||
      generation !== currentGeneration ||
      reconnectTimer
    ) {
      return;
    }

    const delay =
      TICKETED_REALTIME_RECONNECT_DELAYS_MS[
        Math.min(
          reconnectDelayIndex,
          TICKETED_REALTIME_RECONNECT_DELAYS_MS.length - 1
        )
      ];
    reconnectDelayIndex = Math.min(
      reconnectDelayIndex + 1,
      TICKETED_REALTIME_RECONNECT_DELAYS_MS.length - 1
    );
    reconnectAttempt = Math.min(
      reconnectAttempt + 1,
      TICKETED_REALTIME_RECONNECT_DELAYS_MS.length
    );
    setSnapshot({
      reconnectAttempt,
      status: "reconnecting",
    });
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      startAttempt(currentGeneration).catch((error: unknown) => {
        onError?.(error);
      });
    }, delay);
  };

  const startAttempt = (currentGeneration: number): Promise<void> => {
    const currentAttempt = activeAttempt + 1;
    activeAttempt = currentAttempt;
    setSnapshot({
      reconnectAttempt,
      status: reconnectAttempt === 0 ? "connecting" : "reconnecting",
    });

    const currentPromise = (async () => {
      let ticket: Pick<RealtimeTicket, "ticket">;
      try {
        ticket = await acquireTicket();
      } catch (error) {
        if (isCurrentAttempt(currentGeneration, currentAttempt)) {
          (onTicketError ?? onError)?.(error);
          scheduleReconnect(currentGeneration);
        }
        return;
      }

      if (!isCurrentAttempt(currentGeneration, currentAttempt)) {
        return;
      }

      let url: string;
      try {
        url = buildTicketWebSocketUrl(path, ticket.ticket, configuredUrl);
      } catch (error) {
        onError?.(error);
        scheduleReconnect(currentGeneration);
        return;
      }

      try {
        const socket = socketAdapter.connect(url, {
          onClose: () => {
            if (!isCurrentAttempt(currentGeneration, currentAttempt)) {
              return;
            }
            if (activeSocket === socket) {
              activeSocket = null;
            }
            scheduleReconnect(currentGeneration);
          },
          onError: (error) => {
            if (!isCurrentAttempt(currentGeneration, currentAttempt)) {
              return;
            }
            onError?.(error);
            if (activeSocket === socket) {
              activeSocket = null;
            }
            socket.close();
            scheduleReconnect(currentGeneration);
          },
          onMessage: (data) => {
            if (isCurrentAttempt(currentGeneration, currentAttempt)) {
              onMessage?.(data);
            }
          },
          onOpen: () => {
            if (!isCurrentAttempt(currentGeneration, currentAttempt)) {
              socket.close();
              return;
            }
            reconnectAttempt = 0;
            reconnectDelayIndex = 0;
            setSnapshot({
              reconnectAttempt: 0,
              status: "connected",
              url,
            });
          },
        });

        if (!isCurrentAttempt(currentGeneration, currentAttempt)) {
          socket.close();
          return;
        }
        activeSocket = socket;
      } catch (error) {
        onError?.(error);
        scheduleReconnect(currentGeneration);
      }
    })();

    attemptPromise = currentPromise;
    currentPromise.then(
      () => {
        if (attemptPromise === currentPromise) {
          attemptPromise = null;
        }
      },
      () => {
        if (attemptPromise === currentPromise) {
          attemptPromise = null;
        }
      }
    );
    return currentPromise;
  };

  const connect = () => {
    if (disposed) {
      return Promise.resolve();
    }

    shouldReconnect = true;
    if (activeSocket?.readyState === 0 || activeSocket?.readyState === 1) {
      return attemptPromise ?? Promise.resolve();
    }
    if (attemptPromise) {
      return attemptPromise;
    }

    clearReconnectTimer();
    return startAttempt(generation);
  };

  const disconnect = () => {
    if (disposed) {
      return;
    }

    shouldReconnect = false;
    generation += 1;
    activeAttempt += 1;
    clearReconnectTimer();
    attemptPromise = null;
    const socket = activeSocket;
    activeSocket = null;
    socket?.close();
    reconnectAttempt = 0;
    reconnectDelayIndex = 0;
    setSnapshot({
      reconnectAttempt: 0,
      status: "disconnected",
    });
  };

  const dispose = () => {
    if (disposed) {
      return;
    }
    disconnect();
    disposed = true;
    listeners.clear();
  };

  return {
    connect,
    disconnect,
    dispose,
    getSnapshot: () => snapshot,
    send: (data) => {
      if (!activeSocket || activeSocket.readyState !== SOCKET_OPEN) {
        return false;
      }
      try {
        activeSocket.send(data);
        return true;
      } catch {
        return false;
      }
    },
    subscribe: (listener) => {
      if (disposed) {
        return () => undefined;
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
