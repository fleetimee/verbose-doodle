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
    billerId: overrides.billerId ?? "1",
    delayMs: overrides.delayMs ?? null,
    destinationIp: overrides.destinationIp ?? null,
    destinationPort: overrides.destinationPort ?? null,
    durationMs:
      "durationMs" in overrides ? (overrides.durationMs ?? null) : 100,
    endpointId: overrides.endpointId ?? "endpoint-1",
    forwardedFor: overrides.forwardedFor ?? null,
    hitStatus: overrides.hitStatus ?? "matched_success",
    httpStatusCode: overrides.httpStatusCode ?? 200,
    id: overrides.id ?? "log-1",
    matched: overrides.matched ?? true,
    method: overrides.method ?? "GET",
    occurredAt: overrides.occurredAt ?? new Date(NOW).toISOString(),
    path: overrides.path ?? "/rest",
    queryString: overrides.queryString ?? null,
    requestBodyPreview: overrides.requestBodyPreview ?? null,
    requestId: overrides.requestId ?? "request-1",
    responseBodyPreview: overrides.responseBodyPreview ?? null,
    responseId: overrides.responseId ?? "response-1",
    responseName: overrides.responseName ?? "Success",
    simulateTimeout: overrides.simulateTimeout ?? false,
    sourceIp: overrides.sourceIp ?? "127.0.0.1",
    sourcePort: overrides.sourcePort ?? null,
    userAgent: overrides.userAgent ?? null,
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
      createLog({ durationMs, id: `log-${index}` })
    );

    expect(calculatePercentile(logs, 50)).toBe(300);
    expect(calculatePercentile(logs, 95)).toBe(480);
    expect(calculatePercentile(logs, 99)).toBe(496);
  });

  test("calculates percentiles for unsorted logs", () => {
    const logs = [500, 100, 400, 200, 300].map((durationMs, index) =>
      createLog({ durationMs, id: `log-${index}` })
    );

    expect(calculatePercentile(logs, 50)).toBe(300);
    expect(calculatePercentile(logs, 95)).toBe(480);
    expect(calculatePercentile(logs, 99)).toBe(496);
  });

  test("ignores null duration logs in percentile calculation", () => {
    const logs = [
      createLog({ durationMs: null, id: "log-1" }),
      createLog({ durationMs: 100, id: "log-2" }),
      createLog({ durationMs: 300, id: "log-3" }),
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
        hitStatus: "matched_success",
        id: "success",
        occurredAt: new Date(windowStart + 500).toISOString(),
      }),
      createLog({
        hitStatus: "backend_error",
        id: "error",
        occurredAt: new Date(windowStart + 1500).toISOString(),
      }),
      createLog({
        hitStatus: "matched_delayed",
        id: "delayed",
        occurredAt: new Date(windowStart + 11_500).toISOString(),
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
        durationMs: 90,
        hitStatus: "matched_success",
        id: "success",
        occurredAt: new Date(NOW - 60_000).toISOString(),
      }),
      createLog({
        durationMs: 240,
        hitStatus: "matched_delayed",
        id: "delayed",
        occurredAt: new Date(NOW - 45_000).toISOString(),
      }),
      createLog({
        durationMs: null,
        hitStatus: "matched_timeout",
        id: "timeout",
        occurredAt: new Date(NOW - 30_000).toISOString(),
        simulateTimeout: true,
      }),
      createLog({
        durationMs: 40,
        hitStatus: "unmatched_endpoint",
        id: "unmatched",
        occurredAt: new Date(NOW - 15_000).toISOString(),
      }),
      createLog({
        durationMs: 320,
        hitStatus: "backend_error",
        id: "backend",
        occurredAt: new Date(NOW).toISOString(),
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
