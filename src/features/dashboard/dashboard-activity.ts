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

interface DashboardVisitEventRecord {
  readonly [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | DashboardVisitEventRecord;
}

export type DashboardVisitEventRaw =
  | string
  | ArrayBuffer
  | Blob
  | ArrayBufferView
  | DashboardVisitEventRecord;

type RecordValue = {
  readonly [key: string]: string | null | undefined;
};

function isRecord(candidate: unknown): candidate is RecordValue {
  return typeof candidate === "object" && candidate !== null;
}

function isRawString(candidate: DashboardVisitEventRaw): candidate is string {
  return typeof candidate === "string";
}

function readString(
  record: RecordValue,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (value && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

export function parseDashboardVisitEvent(
  raw: DashboardVisitEventRaw
): DashboardVisitEvent | null {
  let parsed: unknown = raw;

  if (isRawString(raw)) {
    try {
      parsed = JSON.parse(raw);
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

  type MutableDashboardVisitPayload = {
    ipAddress?: string;
    role?: "ADMIN" | "USER";
    userId: string;
    username: string;
    visitId: string;
    visitedAt: string;
  };

  const payload: MutableDashboardVisitPayload = {
    userId,
    username,
    visitId,
    visitedAt,
  };
  if (ipAddress) {
    payload.ipAddress = ipAddress;
  }
  if (role === "ADMIN" || role === "USER") {
    payload.role = role;
  }

  return {
    payload,
    type: DASHBOARD_VISIT_EVENT_TYPE,
  };
}

type RecordDashboardVisitResponse = {
  readonly data?: DashboardVisitEventRaw;
};

export async function recordDashboardVisit(): Promise<DashboardVisitEvent | null> {
  const response = await apiPost<RecordDashboardVisitResponse | undefined>(
    API_ENDPOINTS.admin.dashboard.visits,
    {}
  );
  return response?.data ? parseDashboardVisitEvent(response.data) : null;
}
