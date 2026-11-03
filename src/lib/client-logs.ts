type ClientLog = {
  kind: "react" | "error" | "rejection" | "request";
  message: string;
  stack?: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
};

const queue: object[] = [];
let getToken: () => string | null = () => null;
let sending = false;
let allowance = 20;

const URL_SUFFIX = /[?#]/;
const PRIVATE_PATH = /\/api\/(?:f|public\/temp-files)\/[^\s)]+/g;

function sanitize(value: string): string {
  return value
    .replace(/https?:\/\/[^\s)]+/g, (url) => url.split(URL_SUFFIX)[0] ?? "")
    .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(PRIVATE_PATH, "/api/[private-link]")
    .slice(0, 4000);
}

export function reportClientLog(event: ClientLog): void {
  if (allowance <= 0 || queue.length >= 50) {
    return;
  }
  allowance -= 1;
  queue.push({
    ...event,
    message: sanitize(event.message),
    path: event.path ? sanitize(event.path).slice(0, 2048) : undefined,
    stack: event.stack ? sanitize(event.stack) : undefined,
    page: sanitize(window.location.pathname).slice(0, 2048),
    timestamp: new Date().toISOString(),
  });
}

export function reportClientError(
  kind: "react" | "error" | "rejection",
  error: Error,
  componentStack?: string
): void {
  reportClientLog({
    kind,
    message: error.message,
    stack: [error.stack, componentStack].filter(Boolean).join("\n"),
  });
}

async function flush(): Promise<void> {
  const token = getToken();
  if (sending || !token || queue.length === 0) {
    return;
  }
  sending = true;
  const batch = queue.splice(0, 10);
  try {
    const response = await fetch("/api/client-logs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ events: batch }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok && (response.status >= 500 || response.status === 429)) {
      queue.unshift(...batch);
    }
  } catch {
    queue.unshift(...batch);
  } finally {
    queue.splice(50);
    sending = false;
  }
}

export function setClientLogTokenProvider(provider: () => string | null): void {
  getToken = provider;
}

export function initializeClientLogs(): void {
  window.addEventListener("error", (event) => {
    reportClientError("error", event.error ?? new Error(event.message));
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportClientError(
      "rejection",
      event.reason instanceof Error
        ? event.reason
        : new Error("Unhandled promise rejection")
    );
  });
  window.setInterval(() => {
    flush().catch(() => undefined);
  }, 5000);
  window.setInterval(() => {
    allowance = 20;
  }, 60_000);
}
