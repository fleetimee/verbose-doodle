import { apiPost } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export const DASHBOARD_VISIT_EVENT_TYPE = "dashboard_visited";

export type DashboardVisitPayload = {
  readonly ipAddress?: string;
  readonly role?: "ADMIN" | "USER";
  readonly userId: string;
  readonly username: string;
  readonly visitId: string;
  readonly visitedAt: string;
};

export type DashboardVisitEvent = {
  readonly payload: DashboardVisitPayload;
  readonly type: typeof DASHBOARD_VISIT_EVENT_TYPE;
};

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null;
}

function readString(
  record: RecordValue,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

export function parseDashboardVisitEvent(
  raw: unknown
): DashboardVisitEvent | null {
  let parsed: unknown = raw;

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  if (!isRecord(parsed) || parsed.type !== DASHBOARD_VISIT_EVENT_TYPE) {
    return null;
  }

  if (!isRecord(parsed.payload)) {
    return null;
  }

  const userId = readString(parsed.payload, "userId", "user_id");
  const username = readString(parsed.payload, "username");
  const visitId = readString(parsed.payload, "visitId", "visit_id");
  const visitedAt = readString(parsed.payload, "visitedAt", "visited_at");
  const ipAddress = readString(parsed.payload, "ipAddress", "ip_address");
  const role = readString(parsed.payload, "role");

  if (!userId) {
    return null;
  }
  if (!username) {
    return null;
  }
  if (!visitId) {
    return null;
  }
  if (!visitedAt) {
    return null;
  }

  return {
    payload: {
      ...(ipAddress ? { ipAddress } : {}),
      ...(role === "ADMIN" || role === "USER" ? { role } : {}),
      userId,
      username,
      visitId,
      visitedAt,
    },
    type: DASHBOARD_VISIT_EVENT_TYPE,
  };
}

type RecordDashboardVisitResponse = {
  readonly data?: unknown;
};

export async function recordDashboardVisit(): Promise<DashboardVisitEvent | null> {
  const response = await apiPost<RecordDashboardVisitResponse | undefined>(
    API_ENDPOINTS.admin.dashboard.visits,
    {}
  );
  return response?.data ? parseDashboardVisitEvent(response.data) : null;
}
