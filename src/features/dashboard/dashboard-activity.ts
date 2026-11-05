import { z } from "zod";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

export const DASHBOARD_VISIT_EVENT_TYPE = "dashboard_visited";
export const DASHBOARD_PRESENCE_EVENT_TYPE = "dashboard_presence";
export const DASHBOARD_CHAT_EVENT_TYPE = "dashboard_chat_message";
export const DASHBOARD_CHAT_READ_EVENT_TYPE = "dashboard_chat_read";

export type DashboardIpChatMessage = {
  readonly createdAt: string;
  readonly id: number;
  readonly message: string;
  readonly pending?: boolean;
  readonly readAt?: string;
  readonly recipientIp: string;
  readonly senderIp: string;
  readonly senderUsername: string;
};

export type DashboardIpChatReadPayload = {
  readonly readAt: string;
  readonly recipientIp: string;
  readonly senderIp: string;
};

export type DashboardIpChatReadEvent = {
  readonly payload: DashboardIpChatReadPayload;
  readonly type: typeof DASHBOARD_CHAT_READ_EVENT_TYPE;
};

export type DashboardIpChatThread = {
  readonly currentIp: string;
  readonly messages: readonly DashboardIpChatMessage[];
  readonly targetIp: string;
};

export type DashboardIpChatEvent = {
  readonly payload: DashboardIpChatMessage;
  readonly type: typeof DASHBOARD_CHAT_EVENT_TYPE;
};

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
  readonly lastChatAt?: string;
  readonly lastChatMessage?: string;
  readonly lastChatSenderIp?: string;
  readonly lastSeenAt: string;
  readonly online: boolean;
  readonly sleeping: boolean;
  readonly unreadCount: number;
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

function nonEmptyTrimmed(
  primary: string | null | undefined,
  secondary: string | null | undefined
): string | undefined {
  const raw = primary ?? secondary;
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const rawVisitorPresenceSchema = z
  .object({
    activeConnections: z.number().optional(),
    active_connections: z.number().optional(),
    currentPath: z.string().optional().nullable(),
    current_path: z.string().optional().nullable(),
    ipAddress: z.string().min(1).optional(),
    ip_address: z.string().min(1).optional(),
    lastChatAt: z.string().optional().nullable(),
    lastChatMessage: z.string().optional().nullable(),
    lastChatSenderIp: z.string().optional().nullable(),
    lastSeenAt: z.string().min(1).optional(),
    last_chat_at: z.string().optional().nullable(),
    last_chat_message: z.string().optional().nullable(),
    last_chat_sender_ip: z.string().optional().nullable(),
    last_seen_at: z.string().min(1).optional(),
    online: z.boolean(),
    sleeping: z.boolean().optional(),
    unreadCount: z.number().optional(),
    unread_count: z.number().optional(),
    userAgent: z.string().optional().nullable(),
    user_agent: z.string().optional().nullable(),
  })
  .transform((value): DashboardVisitorPresence | null => {
    const ipAddress = value.ipAddress ?? value.ip_address;
    const lastSeenAt = value.lastSeenAt ?? value.last_seen_at;
    if (!(ipAddress && lastSeenAt)) {
      return null;
    }
    const currentPath =
      nonEmptyTrimmed(value.currentPath, value.current_path) ??
      "/dashboard/overview";
    const userAgent = nonEmptyTrimmed(value.userAgent, value.user_agent);
    const lastChatMessage = nonEmptyTrimmed(
      value.lastChatMessage,
      value.last_chat_message
    );
    const lastChatSenderIp = nonEmptyTrimmed(
      value.lastChatSenderIp,
      value.last_chat_sender_ip
    );
    const lastChatAt = nonEmptyTrimmed(value.lastChatAt, value.last_chat_at);
    const activeConnections =
      value.activeConnections ??
      value.active_connections ??
      (value.online ? 1 : 0);
    const sleeping = value.online && Boolean(value.sleeping);
    const unreadCount = Math.max(
      0,
      value.unreadCount ?? value.unread_count ?? 0
    );
    return {
      activeConnections,
      currentPath,
      ipAddress,
      lastChatAt,
      lastChatMessage,
      lastChatSenderIp,
      lastSeenAt,
      online: value.online,
      sleeping,
      unreadCount,
      userAgent,
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

const rawChatMessageSchema = z
  .object({
    createdAt: z.string().optional(),
    created_at: z.string().optional(),
    id: z.number(),
    message: z.string(),
    readAt: z.string().optional().nullable(),
    read_at: z.string().optional().nullable(),
    recipientIp: z.string().optional(),
    recipient_ip: z.string().optional(),
    senderIp: z.string().optional(),
    sender_ip: z.string().optional(),
    senderUsername: z.string().optional(),
    sender_username: z.string().optional(),
  })
  .transform((value): DashboardIpChatMessage | null => {
    const senderIp = value.senderIp ?? value.sender_ip;
    const recipientIp = value.recipientIp ?? value.recipient_ip;
    const createdAt = value.createdAt ?? value.created_at;
    if (!(senderIp && recipientIp && createdAt)) {
      return null;
    }
    const readAt = value.readAt ?? value.read_at ?? undefined;
    const senderUsername =
      value.senderUsername ?? value.sender_username ?? "visitor";
    if (readAt) {
      return {
        createdAt,
        id: value.id,
        message: value.message,
        readAt,
        recipientIp,
        senderIp,
        senderUsername,
      };
    }
    return {
      createdAt,
      id: value.id,
      message: value.message,
      recipientIp,
      senderIp,
      senderUsername,
    };
  });

const rawChatThreadSchema = z.object({
  currentIp: z.string().optional(),
  current_ip: z.string().optional(),
  messages: z.array(rawChatMessageSchema).optional(),
  targetIp: z.string().optional(),
  target_ip: z.string().optional(),
});

const rawChatEventSchema = z.object({
  payload: rawChatMessageSchema,
  type: z.literal(DASHBOARD_CHAT_EVENT_TYPE),
});

const rawChatReadPayloadSchema = z
  .object({
    readAt: z.string().optional(),
    read_at: z.string().optional(),
    recipientIp: z.string().optional(),
    recipient_ip: z.string().optional(),
    senderIp: z.string().optional(),
    sender_ip: z.string().optional(),
  })
  .transform((value): DashboardIpChatReadPayload | null => {
    const senderIp = value.senderIp ?? value.sender_ip;
    const recipientIp = value.recipientIp ?? value.recipient_ip;
    const readAt = value.readAt ?? value.read_at;
    if (!(senderIp && recipientIp && readAt)) {
      return null;
    }
    return {
      readAt,
      recipientIp,
      senderIp,
    };
  });

const rawChatReadEventSchema = z.object({
  payload: rawChatReadPayloadSchema,
  type: z.literal(DASHBOARD_CHAT_READ_EVENT_TYPE),
});

export function parseDashboardChatEvent(
  raw: DashboardVisitEventRaw
): DashboardIpChatEvent | null {
  let parsed: unknown = raw;
  if (isRawString(raw)) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const result = rawChatEventSchema.safeParse(parsed);
  if (!(result.success && result.data.payload)) {
    return null;
  }
  return {
    payload: result.data.payload,
    type: DASHBOARD_CHAT_EVENT_TYPE,
  };
}

export function parseDashboardChatReadEvent(
  raw: DashboardVisitEventRaw
): DashboardIpChatReadEvent | null {
  let parsed: unknown = raw;
  if (isRawString(raw)) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const result = rawChatReadEventSchema.safeParse(parsed);
  if (!(result.success && result.data.payload)) {
    return null;
  }
  return {
    payload: result.data.payload,
    type: DASHBOARD_CHAT_READ_EVENT_TYPE,
  };
}

type FetchDashboardChatThreadResponse = {
  readonly data?: DashboardVisitEventRecord;
};

export async function fetchDashboardChatThread(
  targetIp: string
): Promise<DashboardIpChatThread | null> {
  const params = new URLSearchParams({ targetIp });
  const response = await apiGet<FetchDashboardChatThreadResponse | undefined>(
    `${API_ENDPOINTS.admin.dashboard.chats}?${params}`
  );
  const result = rawChatThreadSchema.safeParse(response?.data);
  if (!result.success) {
    return null;
  }
  const currentIp =
    result.data.currentIp ?? result.data.current_ip ?? "unknown";
  const resolvedTargetIp =
    result.data.targetIp ?? result.data.target_ip ?? targetIp;
  const messages = (result.data.messages ?? []).filter(
    (item): item is DashboardIpChatMessage => item !== null
  );
  return {
    currentIp,
    messages,
    targetIp: resolvedTargetIp,
  };
}

type SendDashboardChatResponse = {
  readonly data?: DashboardVisitEventRecord;
};

export async function sendDashboardChatMessage(
  targetIp: string,
  message: string
): Promise<DashboardIpChatMessage | null> {
  const response = await apiPost<
    SendDashboardChatResponse | undefined,
    { readonly target_ip: string; readonly message: string }
  >(API_ENDPOINTS.admin.dashboard.chats, {
    message,
    target_ip: targetIp,
  });
  const result = rawChatMessageSchema.safeParse(response?.data);
  return result.success ? result.data : null;
}

export async function markDashboardChatRead(targetIp: string): Promise<void> {
  await apiPost<unknown, { readonly target_ip: string }>(
    API_ENDPOINTS.admin.dashboard.chatRead,
    { target_ip: targetIp }
  ).catch(() => undefined);
}

const openVisitorChatListeners = new Set<(targetIp: string) => void>();
let activeVisitorChatTargetIp: string | null = null;

export function setActiveVisitorChatTargetIp(targetIp: string | null): void {
  activeVisitorChatTargetIp = targetIp;
}

export function getActiveVisitorChatTargetIp(): string | null {
  return activeVisitorChatTargetIp;
}

export function subscribeOpenVisitorChat(
  listener: (targetIp: string) => void
): () => void {
  openVisitorChatListeners.add(listener);
  return () => {
    openVisitorChatListeners.delete(listener);
  };
}

export function dispatchOpenVisitorChat(targetIp: string): void {
  for (const listener of openVisitorChatListeners) {
    listener(targetIp);
  }
}

let sharedAudioContext: AudioContext | null = null;

export function playVisitorChatNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) {
      return;
    }
    if (!sharedAudioContext) {
      sharedAudioContext = new AudioContextClass();
    }
    const ctx = sharedAudioContext;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => undefined);
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // Ignore audio context autoplay restrictions before first user gesture
  }
}

export function tryShowNativeVisitorChatNotification({
  title,
  body,
  senderIp,
}: {
  title: string;
  body: string | undefined;
  senderIp: string;
}): void {
  try {
    if (!(document.hidden && "Notification" in window)) {
      return;
    }
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/brand/biller-app-icon.png",
        tag: `visitor-chat-${senderIp}`,
      });
      notification.onclick = () => {
        window.focus();
        dispatchOpenVisitorChat(senderIp);
        notification.close();
      };
    }
  } catch {
    // Ignore on non-secure HTTP contexts
  }
}

const deletedChatEventSchema = z.object({
  type: z.literal("dashboard_chat_deleted"),
  payload: z.object({
    sender_ip: z.string(),
    recipient_ip: z.string(),
    deleted_ids: z.array(z.number().int().positive()),
  }),
});

export function parseDashboardChatDeletedEvent(raw: DashboardVisitEventRaw) {
  let parsed: unknown = raw;
  if (isRawString(raw)) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  const result = deletedChatEventSchema.safeParse(parsed);
  return result.success ? result.data.payload : null;
}

export async function deleteDashboardChatMessages(
  targetIp: string,
  messageId?: number
) {
  const path =
    messageId === undefined
      ? API_ENDPOINTS.admin.dashboard.chats
      : `${API_ENDPOINTS.admin.dashboard.chats}/${messageId}`;
  const response = await apiDelete<{ data: { deleted_ids: number[] } }>(
    `${path}?targetIp=${encodeURIComponent(targetIp)}`
  );
  return z.array(z.number().int().positive()).parse(response.data.deleted_ids);
}
