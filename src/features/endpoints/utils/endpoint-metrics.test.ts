import { describe, expect, test } from "bun:test";
import type { EndpointTrafficLog } from "@/features/endpoints/types";
import {
  calculatePercentile,
  filterLogsByTimeWindow,
  getEndpointMetrics,
  getMetricsBuckets,
} from "@/features/endpoints/utils/endpoint-metrics";

const NOW = Date.parse("2026-07-07T10:00:00.000Z");

function createLog(
  overrides: Partial<EndpointTrafficLog> = {}
): EndpointTrafficLog {
  return {
    id: overrides.id ?? "log-1",
    requestId: overrides.requestId ?? "request-1",
    occurredAt: overrides.occurredAt ?? new Date(NOW).toISOString(),
    endpointId: overrides.endpointId ?? "endpoint-1",
    responseId: overrides.responseId ?? "response-1",
    billerId: overrides.billerId ?? "1",
    method: overrides.method ?? "GET",
    path: overrides.path ?? "/rest",
    queryString: overrides.queryString ?? null,
    matched: overrides.matched ?? true,
    hitStatus: overrides.hitStatus ?? "matched_success",
    httpStatusCode: overrides.httpStatusCode ?? 200,
    responseName: overrides.responseName ?? "Success",
    sourceIp: overrides.sourceIp ?? "127.0.0.1",
    sourcePort: overrides.sourcePort ?? null,
    destinationIp: overrides.destinationIp ?? null,
    destinationPort: overrides.destinationPort ?? null,
    forwardedFor: overrides.forwardedFor ?? null,
    userAgent: overrides.userAgent ?? null,
    durationMs:
      "durationMs" in overrides ? (overrides.durationMs ?? null) : 100,
    delayMs: overrides.delayMs ?? null,
    simulateTimeout: overrides.simulateTimeout ?? false,
    requestBodyPreview: overrides.requestBodyPreview ?? null,
    responseBodyPreview: overrides.responseBodyPreview ?? null,
  };
}

describe("endpoint metrics utilities", () => {
  test("returns null percentiles for empty logs", () => {
    expect(calculatePercentile([], 50)).toBeNull();
    expect(calculatePercentile([], 95)).toBeNull();
    expect(calculatePercentile([], 99)).toBeNull();
  });

  test("calculates p50, p95, and p99 for sorted logs", () => {
    const logs = [100, 200, 300, 400, 500].map((durationMs, index) =>
      createLog({ id: `log-${index}`, durationMs })
    );

    expect(calculatePercentile(logs, 50)).toBe(300);
    expect(calculatePercentile(logs, 95)).toBe(480);
    expect(calculatePercentile(logs, 99)).toBe(496);
  });

  test("calculates percentiles for unsorted logs", () => {
    const logs = [500, 100, 400, 200, 300].map((durationMs, index) =>
      createLog({ id: `log-${index}`, durationMs })
    );

    expect(calculatePercentile(logs, 50)).toBe(300);
    expect(calculatePercentile(logs, 95)).toBe(480);
    expect(calculatePercentile(logs, 99)).toBe(496);
  });

  test("ignores null duration logs in percentile calculation", () => {
    const logs = [
      createLog({ id: "log-1", durationMs: null }),
      createLog({ id: "log-2", durationMs: 100 }),
      createLog({ id: "log-3", durationMs: 300 }),
    ];

    expect(calculatePercentile(logs, 50)).toBe(200);
    expect(calculatePercentile(logs, 95)).toBe(290);
    expect(calculatePercentile(logs, 99)).toBe(298);
  });

  test("filters logs to the selected time window", () => {
    const logs = [
      createLog({
        id: "old",
        occurredAt: new Date(NOW - 16 * 60 * 1000).toISOString(),
      }),
      createLog({
        id: "inside",
        occurredAt: new Date(NOW - 14 * 60 * 1000).toISOString(),
      }),
      createLog({
        id: "future",
        occurredAt: new Date(NOW + 1000).toISOString(),
      }),
    ];

    expect(
      filterLogsByTimeWindow(logs, "15m", NOW).map((log) => log.id)
    ).toEqual(["inside"]);
  });

  test("aggregates request, success, and error counts into buckets", () => {
    const windowStart = NOW - 12_000;
    const logs = [
      createLog({
        id: "success",
        occurredAt: new Date(windowStart + 500).toISOString(),
        hitStatus: "matched_success",
      }),
      createLog({
        id: "error",
        occurredAt: new Date(windowStart + 1500).toISOString(),
        hitStatus: "backend_error",
      }),
      createLog({
        id: "delayed",
        occurredAt: new Date(windowStart + 11_500).toISOString(),
        hitStatus: "matched_delayed",
      }),
    ];

    const buckets = getMetricsBuckets(logs, windowStart, NOW);

    expect(buckets).toHaveLength(12);
    expect(buckets[0].requests).toBe(1);
    expect(buckets[0].successes).toBe(1);
    expect(buckets[1].requests).toBe(1);
    expect(buckets[1].errors).toBe(1);
    expect(buckets[11].requests).toBe(1);
    expect(buckets[11].successes).toBe(1);
  });

  test("summarizes throughput and status categories", () => {
    const logs = [
      createLog({
        id: "success",
        occurredAt: new Date(NOW - 60_000).toISOString(),
        durationMs: 90,
        hitStatus: "matched_success",
      }),
      createLog({
        id: "delayed",
        occurredAt: new Date(NOW - 45_000).toISOString(),
        durationMs: 240,
        hitStatus: "matched_delayed",
      }),
      createLog({
        id: "timeout",
        occurredAt: new Date(NOW - 30_000).toISOString(),
        durationMs: null,
        hitStatus: "matched_timeout",
        simulateTimeout: true,
      }),
      createLog({
        id: "unmatched",
        occurredAt: new Date(NOW - 15_000).toISOString(),
        durationMs: 40,
        hitStatus: "unmatched_endpoint",
      }),
      createLog({
        id: "backend",
        occurredAt: new Date(NOW).toISOString(),
        durationMs: 320,
        hitStatus: "backend_error",
      }),
    ];

    const { summary } = getEndpointMetrics(logs, "5m", NOW);

    expect(summary.requests).toBe(5);
    expect(summary.successes).toBe(2);
    expect(summary.errors).toBe(3);
    expect(summary.delayed).toBe(1);
    expect(summary.timeouts).toBe(1);
    expect(summary.unmatched).toBe(1);
    expect(summary.backendErrors).toBe(1);
    expect(summary.requestsPerMinute).toBe(1);
    expect(summary.minMs).toBe(40);
    expect(summary.maxMs).toBe(320);
    expect(summary.lastSeenAt).toBe(new Date(NOW).toISOString());
  });
});
