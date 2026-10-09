import Guacamole from "guacamole-common-js";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import {
  buildTicketWebSocketUrl,
  createRealtimeTicket,
} from "@/features/realtime/ticket-client";
import {
  inspectRdpCertificate,
  type RdpCertificateReview,
  reviewRdpSession,
  trustRdpCertificate,
} from "@/features/server-inventory/api";
import { createDesktopInput } from "@/features/server-inventory/utils/desktop-input";

type DesktopControls = {
  disconnect: () => void;
  sendCtrlAltDelete: () => void;
};

export function useServerDesktop(serverId: string, attempt: number) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const containerRef = useRef<HTMLElement>(null);
  const disconnectButtonRef = useRef<HTMLButtonElement>(null);
  const controlsRef = useRef<DesktopControls>({
    disconnect: () => undefined,
    sendCtrlAltDelete: () => undefined,
  });
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [error, setError] = useState("");
  const [unstable, setUnstable] = useState(false);
  const [certificate, setCertificate] = useState<RdpCertificateReview | null>(
    null
  );
  const [trustBusy, setTrustBusy] = useState(false);
  const [trustError, setTrustError] = useState("");
  const certificateDecision = useRef<(accepted: boolean) => void>(
    () => undefined
  );
  const trustGeneration = useRef(0);
  const [sessionWarning, setSessionWarning] = useState(false);
  const sessionDecision = useRef<(accepted: boolean) => void>(() => undefined);

  async function continueCertificate() {
    if (!certificate || trustBusy) {
      return;
    }
    const generation = trustGeneration.current;
    setTrustBusy(true);
    setTrustError("");
    try {
      await trustRdpCertificate(serverId, certificate.certificate.fingerprint);
      if (generation === trustGeneration.current) {
        certificateDecision.current(true);
      }
    } catch {
      if (generation === trustGeneration.current) {
        setTrustError(copy.rdpCertificateTrustFailed);
      }
    } finally {
      if (generation === trustGeneration.current) {
        setTrustBusy(false);
      }
    }
  }

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const container = element;
    const surface = document.createElement("div");
    surface.className = "server-rdp-surface";
    container.append(surface);
    trustGeneration.current += 1;
    setSessionWarning(false);
    setCertificate(null);
    setTrustBusy(false);
    setTrustError("");
    let timeout = 0;
    let disposed = false;
    let cancelled = false;
    let connected = false;
    let client: Guacamole.Client | null = null;
    let input: ReturnType<typeof createDesktopInput> | null = null;
    let lastWidth = 0;
    let lastHeight = 0;
    let resizeFrame = 0;
    setStatus("connecting");
    setError("");
    setUnstable(false);

    function size() {
      return {
        width: Math.max(64, Math.min(8192, container.clientWidth)),
        height: Math.max(64, Math.min(8192, container.clientHeight)),
      };
    }
    function resize() {
      if (!client || disposed) {
        return;
      }
      const { width, height } = size();
      const display = client.getDisplay();
      if (display.getWidth() > 0 && display.getHeight() > 0) {
        display.scale(
          Math.min(1, width / display.getWidth(), height / display.getHeight())
        );
      }
      if (connected && (width !== lastWidth || height !== lastHeight)) {
        lastWidth = width;
        lastHeight = height;
        client.sendSize(width, height);
      }
    }
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(resize);
    });
    observer.observe(container);

    function disconnect() {
      cancelled = true;
      certificateDecision.current(false);
      sessionDecision.current(false);
      if (!disposed) {
        setSessionWarning(false);
      }
      if (!disposed) {
        setCertificate(null);
      }
      window.clearTimeout(timeout);
      input?.disable();
      connected = false;
      client?.disconnect();
      if (!disposed) {
        setStatus("disconnected");
        setUnstable(false);
      }
    }
    function fail(code: number) {
      if (disposed || cancelled) {
        return;
      }
      const codes = Guacamole.Status.Code;
      const errors = new Map<number, string>([
        [codes.SERVER_BUSY, copy.rdpCapacityExceeded],
        [codes.RESOURCE_CONFLICT, copy.rdpSessionChanged],
        [codes.CLIENT_TOO_MANY, copy.rdpCapacityExceeded],
        [codes.CLIENT_UNAUTHORIZED, copy.rdpAuthFailed],
        [codes.CLIENT_FORBIDDEN, copy.rdpAuthFailed],
        [codes.CLIENT_BAD_REQUEST, copy.rdpInvalidEntry],
        [codes.RESOURCE_NOT_FOUND, copy.sshLoadFailed],
        [codes.SESSION_TIMEOUT, copy.rdpSessionExpired],
      ]);
      setError(errors.get(code) ?? copy.rdpConnectionFailed);
      disconnect();
    }
    controlsRef.current = {
      disconnect,
      sendCtrlAltDelete: () => input?.sendCtrlAltDelete(),
    };

    async function reviewCertificate() {
      const review = await inspectRdpCertificate(serverId);
      if (disposed || cancelled) {
        return null;
      }
      if (!review.trusted) {
        setCertificate(review);
        const accepted = await new Promise<boolean>((resolve) => {
          certificateDecision.current = resolve;
        });
        if (disposed || cancelled || !accepted) {
          disconnect();
          return null;
        }
        setCertificate(null);
      }
      return true;
    }

    async function reviewConnection() {
      if (!(await reviewCertificate())) {
        return null;
      }
      const session = await reviewRdpSession(serverId);
      if (disposed || cancelled) {
        return null;
      }
      if (session.busy) {
        setSessionWarning(true);
        const accepted = await new Promise<boolean>((resolve) => {
          sessionDecision.current = resolve;
        });
        if (disposed || cancelled || !accepted) {
          disconnect();
          return null;
        }
        setSessionWarning(false);
      }
      return session;
    }

    async function connect() {
      try {
        const session = await reviewConnection();
        if (!session) {
          return;
        }
        timeout = window.setTimeout(
          () => fail(Guacamole.Status.Code.UPSTREAM_TIMEOUT),
          35_000
        );
        const { ticket } = await createRealtimeTicket("server-rdp");
        if (disposed || cancelled) {
          return;
        }
        const url = new URL(
          buildTicketWebSocketUrl(
            "/api/servers/desktop",
            ticket,
            import.meta.env.VITE_SERVER_RDP_WS_URL
          )
        );
        const dimensions = size();
        url.searchParams.set("serverId", serverId);
        url.searchParams.set("sessionRevision", session.revision);
        url.searchParams.set("width", String(dimensions.width));
        url.searchParams.set("height", String(dimensions.height));
        url.searchParams.set("dpi", "96");
        const parameters = url.searchParams.toString();
        url.search = "";
        const tunnel = new Guacamole.WebSocketTunnel(url.toString());
        tunnel.receiveTimeout = 35_000;
        tunnel.unstableThreshold = 5000;
        client = new Guacamole.Client(tunnel);
        const display = client.getDisplay();
        surface.append(display.getElement());
        input = createDesktopInput(client, surface, copy.rdpKeyboardLabel, () =>
          disconnectButtonRef.current?.focus()
        );
        display.onresize = resize;
        client.onerror = (failure) => fail(failure.code);
        tunnel.onerror = (failure) => fail(failure.code);
        tunnel.onstatechange = (state) => {
          if (disposed || cancelled) {
            return;
          }
          if (state === Guacamole.Tunnel.State.CLOSED) {
            if (connected) {
              disconnect();
            } else {
              fail(Guacamole.Status.Code.UPSTREAM_ERROR);
            }
            return;
          }
          setUnstable(state === Guacamole.Tunnel.State.UNSTABLE);
        };
        client.onstatechange = (state) => {
          if (disposed || cancelled) {
            return;
          }
          if (state === Guacamole.Client.State.CONNECTED) {
            connected = true;
            window.clearTimeout(timeout);
            setStatus("connected");
            input?.enable();
            resize();
            input?.focus();
          } else if (state === Guacamole.Client.State.DISCONNECTED) {
            if (!connected) {
              fail(Guacamole.Status.Code.UPSTREAM_ERROR);
              return;
            }
            disconnect();
          }
        };
        client.connect(parameters);
      } catch {
        fail(Guacamole.Status.Code.SERVER_ERROR);
      }
    }
    connect();
    window.addEventListener("pagehide", disconnect);
    return () => {
      disposed = true;
      trustGeneration.current += 1;
      disconnect();
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      window.removeEventListener("pagehide", disconnect);
      input?.dispose();
      container.replaceChildren();
      controlsRef.current = {
        disconnect: () => undefined,
        sendCtrlAltDelete: () => undefined,
      };
    };
  }, [serverId, attempt, copy]);

  return {
    sessionWarning,
    continueSession: () => sessionDecision.current(true),
    certificate,
    trustBusy,
    trustError,
    continueCertificate,
    cancelCertificate: () => controlsRef.current.disconnect(),
    containerRef,
    disconnectButtonRef,
    status,
    error,
    unstable,
    disconnect: () => controlsRef.current.disconnect(),
    sendCtrlAltDelete: () => controlsRef.current.sendCtrlAltDelete(),
  };
}
