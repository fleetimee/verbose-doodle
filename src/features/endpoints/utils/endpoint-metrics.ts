import type {
  EndpointTrafficLog,
  EndpointTrafficLogStatus,
} from "@/features/endpoints/types";

export type EndpointMetricsTimeWindow = "5m" | "15m" | "1h";

export type EndpointMetricsBucket = {
  readonly bucketStart: number;
  readonly label: string;
  readonly requests: number;
  readonly successes: number;
  readonly errors: number;
  readonly avgMs: number | null;
  readonly p50Ms: number | null;
  readonly p95Ms: number | null;
  readonly p99Ms: number | null;
};

export type EndpointMetricsSummary = {
  readonly requests: number;
  readonly successes: number;
  readonly errors: number;
  readonly delayed: number;
  readonly timeouts: number;
  readonly unmatched: number;
  readonly backendErrors: number;
  readonly successRate: number;
  readonly errorRate: number;
  readonly requestsPerMinute: number;
  readonly avgMs: number | null;
  readonly minMs: number | null;
  readonly maxMs: number | null;
  readonly p50Ms: number | null;
  readonly p95Ms: number | null;
  readonly p99Ms: number | null;
  readonly slowestRequestMs: number | null;
  readonly lastSeenAt: string | null;
};

export type EndpointMetrics = {
  readonly summary: EndpointMetricsSummary;
  readonly buckets: EndpointMetricsBucket[];
  readonly logs: EndpointTrafficLog[];
};

export const ENDPOINT_METRICS_TIME_WINDOWS = {
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
} as const satisfies Record<EndpointMetricsTimeWindow, number>;

const BUCKET_COUNT = 12;
const SUCCESS_STATUSES = new Set<EndpointTrafficLogStatus>([
  "matched_success",
  "matched_delayed",
]);

export function getEndpointMetrics(
  logs: readonly EndpointTrafficLog[],
  timeWindow: EndpointMetricsTimeWindow,
  now = Date.now()
): EndpointMetrics {
  const windowMs = ENDPOINT_METRICS_TIME_WINDOWS[timeWindow];
  const windowStart = now - windowMs;
  const filteredLogs = filterLogsByTimeWindow(logs, timeWindow, now);
  const summary = getMetricsSummary(filteredLogs, windowMs);

  return {
    summary,
    buckets: getMetricsBuckets(filteredLogs, windowStart, now),
    logs: filteredLogs,
  };
}

export function filterLogsByTimeWindow(
  logs: readonly EndpointTrafficLog[],
  timeWindow: EndpointMetricsTimeWindow,
  now = Date.now()
): EndpointTrafficLog[] {
  const windowStart = now - ENDPOINT_METRICS_TIME_WINDOWS[timeWindow];

  return logs
    .filter((log) => {
      const timestamp = Date.parse(log.occurredAt);
      return (
        !Number.isNaN(timestamp) && timestamp >= windowStart && timestamp <= now
      );
    })
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
}

export function calculatePercentile(
  logs: readonly EndpointTrafficLog[],
  percentile: number
): number | null {
  const durations = getDurations(logs);

  if (durations.length === 0) {
    return null;
  }

  const boundedPercentile = Math.min(Math.max(percentile, 0), 100);
  const index = (boundedPercentile / 100) * (durations.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return Math.round(durations[lowerIndex]);
  }

  const lowerValue = durations[lowerIndex];
  const upperValue = durations[upperIndex];
  const weight = index - lowerIndex;

  return Math.round(lowerValue + (upperValue - lowerValue) * weight);
}

export function getMetricsSummary(
  logs: readonly EndpointTrafficLog[],
  windowMs?: number
): EndpointMetricsSummary {
  const requests = logs.length;
  const successes = logs.filter((log) => isSuccessfulLog(log)).length;
  const errors = requests - successes;
  const delayed = logs.filter(
    (log) => log.hitStatus === "matched_delayed"
  ).length;
  const timeouts = logs.filter(
    (log) => log.hitStatus === "matched_timeout" || log.simulateTimeout
  ).length;
  const unmatched = logs.filter(
    (log) => log.hitStatus === "unmatched_endpoint"
  ).length;
  const backendErrors = logs.filter(
    (log) => log.hitStatus === "backend_error"
  ).length;
  const durations = getDurations(logs);
  const windowMinutes = windowMs ? Math.max(windowMs / 60_000, 1) : null;

  return {
    requests,
    successes,
    errors,
    delayed,
    timeouts,
    unmatched,
    backendErrors,
    successRate: requests === 0 ? 0 : Math.round((successes / requests) * 100),
    errorRate: requests === 0 ? 0 : Math.round((errors / requests) * 100),
    requestsPerMinute:
      requests === 0
        ? 0
        : Number(
            (requests / (windowMinutes ?? getObservedMinutes(logs))).toFixed(1)
          ),
    avgMs:
      durations.length === 0
        ? null
        : Math.round(
            durations.reduce((total, duration) => total + duration, 0) /
              durations.length
          ),
    minMs: durations.at(0) ?? null,
    maxMs: durations.at(-1) ?? null,
    p50Ms: calculatePercentile(logs, 50),
    p95Ms: calculatePercentile(logs, 95),
    p99Ms: calculatePercentile(logs, 99),
    slowestRequestMs: durations.at(-1) ?? null,
    lastSeenAt: getLastSeenAt(logs),
  };
}

export function getMetricsBuckets(
  logs: readonly EndpointTrafficLog[],
  windowStart: number,
  now: number
): EndpointMetricsBucket[] {
  const bucketSize = Math.max(Math.ceil((now - windowStart) / BUCKET_COUNT), 1);
  const buckets = Array.from({ length: BUCKET_COUNT }, (_, index) => {
    const bucketStart = windowStart + bucketSize * index;
    return {
      bucketStart,
      label: formatBucketLabel(bucketStart),
      logs: [] as EndpointTrafficLog[],
    };
  });

  for (const log of logs) {
    const timestamp = Date.parse(log.occurredAt);
    if (Number.isNaN(timestamp)) {
      continue;
    }

    const bucketIndex = Math.min(
      Math.max(Math.floor((timestamp - windowStart) / bucketSize), 0),
      BUCKET_COUNT - 1
    );
    buckets[bucketIndex].logs.push(log);
  }

  return buckets.map((bucket) => {
    const summary = getMetricsSummary(bucket.logs);

    return {
      bucketStart: bucket.bucketStart,
      label: bucket.label,
      requests: summary.requests,
      successes: summary.successes,
      errors: summary.errors,
      avgMs: summary.avgMs,
      p50Ms: summary.p50Ms,
      p95Ms: summary.p95Ms,
      p99Ms: summary.p99Ms,
    };
  });
}

function isSuccessfulLog(log: EndpointTrafficLog) {
  return SUCCESS_STATUSES.has(log.hitStatus);
}

function getDurations(logs: readonly EndpointTrafficLog[]) {
  return logs
    .map((log) => log.durationMs)
    .filter((duration): duration is number => typeof duration === "number")
    .sort((a, b) => a - b);
}

function getLastSeenAt(logs: readonly EndpointTrafficLog[]) {
  return logs.at(-1)?.occurredAt ?? null;
}

function getObservedMinutes(logs: readonly EndpointTrafficLog[]) {
  if (logs.length < 2) {
    return 1;
  }

  const firstTimestamp = Date.parse(logs[0].occurredAt);
  const lastTimestamp = Date.parse(logs.at(-1)?.occurredAt ?? "");

  if (Number.isNaN(firstTimestamp) || Number.isNaN(lastTimestamp)) {
    return 1;
  }

  return Math.max((lastTimestamp - firstTimestamp) / 60_000, 1);
}

function formatBucketLabel(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}
