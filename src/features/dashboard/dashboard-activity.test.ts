import { describe, expect, test } from "bun:test";
import {
  DASHBOARD_VISIT_EVENT_TYPE,
  parseDashboardVisitEvent,
} from "@/features/dashboard/dashboard-activity";

describe("dashboard activity events", () => {
  test("parses the dashboard visit event contract", () => {
    const event = parseDashboardVisitEvent(
      JSON.stringify({
        payload: {
          ip_address: "203.0.113.15",
          role: "USER",
          user_id: "user-42",
          username: "alice",
          visit_id: "visit-1",
          visited_at: "2026-09-10T12:30:00Z",
        },
        type: DASHBOARD_VISIT_EVENT_TYPE,
      })
    );

    expect(event).toEqual({
      payload: {
        ipAddress: "203.0.113.15",
        role: "USER",
        userId: "user-42",
        username: "alice",
        visitId: "visit-1",
        visitedAt: "2026-09-10T12:30:00Z",
      },
      type: DASHBOARD_VISIT_EVENT_TYPE,
    });
  });

  test("ignores malformed or unrelated frames", () => {
    expect(parseDashboardVisitEvent("not-json")).toBeNull();
    expect(
      parseDashboardVisitEvent({ type: "relay_started", payload: {} })
    ).toBeNull();
    expect(
      parseDashboardVisitEvent({
        payload: { userId: "user-42" },
        type: DASHBOARD_VISIT_EVENT_TYPE,
      })
    ).toBeNull();
  });
});
