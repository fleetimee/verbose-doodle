import { z } from "zod";
import { apiGet, apiPost } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export const DASHBOARD_VISIT_EVENT_TYPE = "dashboard_visited";
export const DASHBOARD_PRESENCE_EVENT_TYPE = "dashboard_presence";

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

export type DashboardVisitorPresence = {
  readonly activeConnections: number;
  readonly currentPath?: string;
  readonly ipAddress: string;
  readonly lastSeenAt: string;
  readonly online: boolean;
  readonly sleeping: boolean;
  readonly userAgent?: string;
};

export type DashboardPresencePoint = {
  readonly onlineCount: number;
  readonly timestamp: string;
};

export type DashboardPresenceSnapshot = {
  readonly currentIp: string;
  readonly history: readonly DashboardPresencePoint[];
  readonly onlineCount: number;
  readonly peakOnlineCount: number;
  readonly visitors: readonly DashboardVisitorPresence[];
};

export type DashboardPresenceEventPayload = {
  readonly history: readonly DashboardPresencePoint[];
  readonly onlineCount: number;
  readonly peakOnlineCount: number;
  readonly visitors: readonly DashboardVisitorPresence[];
};

export type DashboardPresenceEvent = {
  readonly payload: DashboardPresenceEventPayload;
  readonly type: typeof DASHBOARD_PRESENCE_EVENT_TYPE;
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

const rawVisitorPresenceSchema = z
  .object({
    activeConnections: z.number().optional(),
    active_connections: z.number().optional(),
    currentPath: z.string().optional().nullable(),
    current_path: z.string().optional().nullable(),
    ipAddress: z.string().min(1).optional(),
    ip_address: z.string().min(1).optional(),
    lastSeenAt: z.string().min(1).optional(),
    last_seen_at: z.string().min(1).optional(),
    online: z.boolean(),
    sleeping: z.boolean().optional(),
    userAgent: z.string().optional().nullable(),
    user_agent: z.string().optional().nullable(),
  })
  .transform((value): DashboardVisitorPresence | null => {
    const ipAddress = value.ipAddress ?? value.ip_address;
    const lastSeenAt = value.lastSeenAt ?? value.last_seen_at;
    const currentPath =
      value.currentPath ?? value.current_path ?? "/dashboard/overview";
    const rawUserAgent = value.userAgent ?? value.user_agent;
    const userAgent =
      rawUserAgent && rawUserAgent.trim().length > 0
        ? rawUserAgent.trim()
        : undefined;
    if (!(ipAddress && lastSeenAt)) {
      return null;
    }
    const activeConnections =
      value.activeConnections ??
      value.active_connections ??
      (value.online ? 1 : 0);
    const sleeping = value.online && Boolean(value.sleeping);
    if (userAgent) {
      return {
        activeConnections,
        currentPath,
        ipAddress,
        lastSeenAt,
        online: value.online,
        sleeping,
        userAgent,
      };
    }
    return {
      activeConnections,
      currentPath,
      ipAddress,
      lastSeenAt,
      online: value.online,
      sleeping,
    };
  });

const rawPresencePointSchema = z
  .object({
    onlineCount: z.number().optional(),
    online_count: z.number().optional(),
    timestamp: z.string(),
  })
  .transform(
    (value): DashboardPresencePoint => ({
      onlineCount: value.onlineCount ?? value.online_count ?? 0,
      timestamp: value.timestamp,
    })
  );

const rawPresenceEventSchema = z.object({
  payload: z.object({
    history: z.array(rawPresencePointSchema).optional(),
    onlineCount: z.number().optional(),
    online_count: z.number().optional(),
    peakOnlineCount: z.number().optional(),
    peak_online_count: z.number().optional(),
    visitors: z.array(rawVisitorPresenceSchema),
  }),
  type: z.literal(DASHBOARD_PRESENCE_EVENT_TYPE),
});

const rawPresenceSnapshotSchema = z.object({
  currentIp: z.string().optional(),
  current_ip: z.string().optional(),
  history: z.array(rawPresencePointSchema).optional(),
  onlineCount: z.number().optional(),
  online_count: z.number().optional(),
  peakOnlineCount: z.number().optional(),
  peak_online_count: z.number().optional(),
  visitors: z.array(rawVisitorPresenceSchema).optional(),
});

export function parseDashboardPresenceEvent(
  raw: DashboardVisitEventRaw
): DashboardPresenceEvent | null {
  let parsed: unknown = raw;

  if (isRawString(raw)) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const result = rawPresenceEventSchema.safeParse(parsed);
  if (!result.success) {
    return null;
  }

  const visitors = result.data.payload.visitors.filter(
    (item): item is DashboardVisitorPresence => item !== null
  );
  const onlineCount =
    result.data.payload.onlineCount ??
    result.data.payload.online_count ??
    visitors.filter((v) => v.online).length;
  const history = result.data.payload.history ?? [];
  const peakOnlineCount =
    result.data.payload.peakOnlineCount ??
    result.data.payload.peak_online_count ??
    Math.max(onlineCount, ...history.map((h) => h.onlineCount), 0);

  return {
    payload: {
      history,
      onlineCount,
      peakOnlineCount,
      visitors,
    },
    type: DASHBOARD_PRESENCE_EVENT_TYPE,
  };
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

export async function recordDashboardVisit(
  path?: string
): Promise<DashboardVisitEvent | null> {
  const response = await apiPost<
    RecordDashboardVisitResponse | undefined,
    { readonly path?: string }
  >(API_ENDPOINTS.admin.dashboard.visits, path ? { path } : {});
  return response?.data ? parseDashboardVisitEvent(response.data) : null;
}

type FetchDashboardPresenceResponse = {
  readonly data?: DashboardVisitEventRecord;
};

export async function fetchDashboardPresence(): Promise<DashboardPresenceSnapshot | null> {
  const response = await apiGet<FetchDashboardPresenceResponse | undefined>(
    API_ENDPOINTS.admin.dashboard.visits
  );
  const result = rawPresenceSnapshotSchema.safeParse(response?.data);
  if (!result.success) {
    return null;
  }

  const currentIp =
    result.data.currentIp ?? result.data.current_ip ?? "unknown";
  const visitors = (result.data.visitors ?? []).filter(
    (item): item is DashboardVisitorPresence => item !== null
  );
  const onlineCount =
    result.data.onlineCount ??
    result.data.online_count ??
    visitors.filter((v) => v.online).length;
  const history = result.data.history ?? [];
  const peakOnlineCount =
    result.data.peakOnlineCount ??
    result.data.peak_online_count ??
    Math.max(onlineCount, ...history.map((h) => h.onlineCount), 0);

  return {
    currentIp,
    history,
    onlineCount,
    peakOnlineCount,
    visitors,
  };
}
