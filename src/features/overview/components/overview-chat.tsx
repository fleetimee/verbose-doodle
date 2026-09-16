import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMessageScroller } from "@shadcn/react/message-scroller";
import type { QueryObserverResult } from "@tanstack/react-query";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router";
import {
  Activity,
  ArrowUpDown,
  Binary,
  Braces,
  Building2,
  CalendarDays,
  CheckCircle,
  CircleAlert,
  Clock3,
  Code2,
  FileJson,
  Fingerprint,
  Info,
  MessageSquareText,
  Network,
  Plug,
  RadioReceiver,
  ShieldCheck,
  Timer,
  Users,
} from "@/components/hugeicons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { buttonVariants } from "@/components/ui/button";
import {
  ChatMinimap,
  ChatMinimapContainer,
} from "@/components/ui/chat-minimap";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Skeleton } from "@/components/ui/skeleton";
import { Streaming } from "@/components/ui/streaming";
import {
  DEVELOPER_TOOLS,
  getDeveloperToolHref,
} from "@/features/developer-tools/catalog";
import type { HttpMethod } from "@/features/endpoints/types";
import { OverviewChatComposer } from "@/features/overview/components/overview-chat-composer";
import type { OverviewData } from "@/features/overview/types";
import type { ApiError } from "@/lib/api";
import { formatMessage, messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ConsolePath =
  | "/dashboard/developer-tools"
  | "/dashboard/developer-tools/cron-parser"
  | "/dashboard/developer-tools/date-converter"
  | "/dashboard/developer-tools/iso8583-generator"
  | "/dashboard/developer-tools/json-schema-validator"
  | "/dashboard/developer-tools/json-yaml-converter"
  | "/dashboard/developer-tools/jwt-inspector"
  | "/dashboard/developer-tools/nfc-reader-inspector"
  | "/dashboard/developer-tools/number-base-converter"
  | "/dashboard/endpoints"
  | "/dashboard/socket-test/tcp-client"
  | "/dashboard/socks-relay/rest-api";

type ChatActionId =
  | "base"
  | "cron"
  | "date"
  | "developer-tools"
  | "endpoints"
  | "iso8583"
  | "jwt"
  | "nfc"
  | "schema"
  | "socket-tester"
  | "socks-relay"
  | "yaml";

type ChatCardType =
  | "billers"
  | "developer-tools"
  | "endpoints"
  | "missing"
  | "snapshot"
  | "sockets"
  | "tool-detail"
  | "users";

type ChatAction = {
  description: string;
  icon: typeof Plug;
  id: ChatActionId;
  label: string;
  to: ConsolePath;
};

type ConversationMessage = {
  actions?: ChatAction[];
  cardType?: ChatCardType;
  id: string;
  role: "assistant" | "user";
  selectedToolId?: string;
  showSnapshot?: boolean;
  text: string;
  tone?: "default" | "destructive";
};

const overviewWelcomeVariants = {
  exit: {
    filter: "blur(8px)",
    opacity: 0,
    transform: "translateY(-24px) scale(0.95)",
  },
  hidden: {
    filter: "blur(8px)",
    opacity: 0,
    transform: "translateY(20px) scale(0.96)",
  },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    transform: "translateY(0) scale(1)",
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.06,
    },
  },
} as const;

const overviewWelcomeItemVariants = {
  hidden: { opacity: 0, transform: "translateY(14px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      duration: MOTION_DURATION.chat,
      ease: MOTION_EASE.apple,
    },
  },
} as const;

type PersistedConversationMessage = Omit<ConversationMessage, "actions"> & {
  actionIds?: ChatActionId[];
};

type ChatReply = Omit<ConversationMessage, "id" | "role">;

type OverviewChatProps = {
  data: OverviewData | undefined;
  error: ApiError | null;
  isAdmin: boolean;
  isLoading: boolean;
  refetch: () => Promise<QueryObserverResult<OverviewData, ApiError>>;
};

const allChatActions: Record<ChatActionId, ChatAction> = {
  base: {
    get description() {
      return messages.overview.chat.commands.baseDescription;
    },
    icon: Binary,
    id: "base",
    get label() {
      return messages.overview.chat.commands.baseLabel;
    },
    to: "/dashboard/developer-tools/number-base-converter",
  },
  cron: {
    get description() {
      return messages.overview.chat.commands.cronDescription;
    },
    icon: Timer,
    id: "cron",
    get label() {
      return messages.overview.chat.commands.cronLabel;
    },
    to: "/dashboard/developer-tools/cron-parser",
  },
  date: {
    get description() {
      return messages.overview.chat.commands.dateDescription;
    },
    icon: CalendarDays,
    id: "date",
    get label() {
      return messages.overview.chat.commands.dateLabel;
    },
    to: "/dashboard/developer-tools/date-converter",
  },
  "developer-tools": {
    get description() {
      return messages.overview.chat.commands.toolsDescription;
    },
    icon: FileJson,
    id: "developer-tools",
    get label() {
      return messages.overview.chat.commands.toolsLabel;
    },
    to: "/dashboard/developer-tools",
  },
  endpoints: {
    get description() {
      return messages.overview.chat.commands.endpointsDescription;
    },
    icon: Plug,
    id: "endpoints",
    get label() {
      return messages.overview.chat.commands.endpointsLabel;
    },
    to: "/dashboard/endpoints",
  },
  iso8583: {
    get description() {
      return messages.overview.chat.commands.iso8583Description;
    },
    icon: Code2,
    id: "iso8583",
    get label() {
      return messages.overview.chat.commands.iso8583Label;
    },
    to: "/dashboard/developer-tools/iso8583-generator",
  },
  jwt: {
    get description() {
      return messages.overview.chat.commands.jwtDescription;
    },
    icon: Fingerprint,
    id: "jwt",
    get label() {
      return messages.overview.chat.commands.jwtLabel;
    },
    to: "/dashboard/developer-tools/jwt-inspector",
  },
  nfc: {
    get description() {
      return messages.overview.chat.commands.nfcDescription;
    },
    icon: RadioReceiver,
    id: "nfc",
    get label() {
      return messages.overview.chat.commands.nfcLabel;
    },
    to: "/dashboard/developer-tools/nfc-reader-inspector",
  },
  schema: {
    get description() {
      return messages.overview.chat.commands.schemaDescription;
    },
    icon: Braces,
    id: "schema",
    get label() {
      return messages.overview.chat.commands.schemaLabel;
    },
    to: "/dashboard/developer-tools/json-schema-validator",
  },
  "socket-tester": {
    get description() {
      return messages.overview.chat.commands.socketsDescription;
    },
    icon: Network,
    id: "socket-tester",
    get label() {
      return messages.overview.chat.commands.socketsLabel;
    },
    to: "/dashboard/socket-test/tcp-client",
  },
  "socks-relay": {
    get description() {
      return messages.overview.chat.commands.socksRelayDescription;
    },
    icon: ShieldCheck,
    id: "socks-relay",
    get label() {
      return messages.overview.chat.commands.socksRelayLabel;
    },
    to: "/dashboard/socks-relay/rest-api",
  },
  yaml: {
    get description() {
      return messages.overview.chat.commands.yamlDescription;
    },
    icon: FileJson,
    id: "yaml",
    get label() {
      return messages.overview.chat.commands.yamlLabel;
    },
    to: "/dashboard/developer-tools/json-yaml-converter",
  },
};

const workspaceActions: ChatAction[] = [
  allChatActions.endpoints,
  allChatActions["developer-tools"],
  allChatActions["socket-tester"],
];

const workspaceActionById = new Map<ChatActionId, ChatAction>(
  Object.entries(allChatActions) as [ChatActionId, ChatAction][]
);

const helpQueryPattern =
  /(^\/help\b|help|commands|guide|what can you do|cheat sheet)/i;
const jwtQueryPattern = /(^\/jwt\b|jwt|token|bearer|hs256|rs256)/i;
const isoQueryPattern =
  /(^\/iso8583\b|iso8583|iso 8583|mti|bitmap|financial message)/i;
const yamlQueryPattern =
  /(^\/(?:json-yaml|yaml)\b|json-yaml|json to yaml|yaml to json)/i;
const schemaQueryPattern =
  /(^\/schema\b|schema validator|json schema|draft-07|draft 2020)/i;
const cronQueryPattern =
  /(^\/cron\b|cron|schedule|cron parser|cron expression)/i;
const baseQueryPattern =
  /(^\/base\b|number base|binary|hexadecimal|hex converter|base64)/i;
const dateQueryPattern =
  /(^\/date\b|date converter|unix time|epoch|timestamp|timezone)/i;
const nfcQueryPattern = /(^\/nfc\b|nfc|ndef|contactless|smartcard)/i;
const socketsQueryPattern =
  /(^\/sockets?\b|socket|tcp|udp|socket tester|datagram)/i;
const socksRelayQueryPattern =
  /(^\/socks-relay\b|socks relay|socks5|proxy relay)/i;
const toolsQueryPattern = /(^\/tools?\b|developer tools|toolbox|utilities)/i;
const missingResponseQueryPattern =
  /(^\/missing\b|without|missing|need.*response|no response|unconfigured)/i;
const endpointQueryPattern =
  /(^\/endpoints?\b|endpoint|route|recent api|catalog)/i;
const billerQueryPattern = /(^\/billers?\b|biller|provider|service)/i;
const responseQueryPattern =
  /(^\/responses?\b|response template|scenario|activation)/i;
const userQueryPattern = /(^\/users?\b|user|account|admin|role|permission)/i;
const snapshotQueryPattern =
  /(^\/snapshot\b|snapshot|summary|overview|status|health|everything|all)/i;
const refreshQueryPattern = /(refresh|reload|check again)/i;
const clearChatQueryPattern = /^(?:\/clear(?:\s+chat)?|clear chat)$/i;
const overviewChatReplyDelayMs = 920;
const overviewConversationStorageKey = "fleetime-labs.overview.conversation";

const overviewChatUserEntryMotion = {
  animate: {
    filter: "blur(0px)",
    opacity: 1,
    transform: "translateY(0) scale(1)",
  },
  "data-motion-entry": "true",
  initial: {
    filter: "blur(3px)",
    opacity: 0,
    transform: "translateY(14px) scale(0.97)",
  },
  transition: { duration: MOTION_DURATION.chat, ease: MOTION_EASE.apple },
} as const;

const overviewChatAssistantEntryMotion = {
  animate: {
    filter: "blur(0px)",
    opacity: 1,
    transform: "translateY(0) scale(1)",
  },
  "data-motion-entry": "true",
  initial: {
    filter: "blur(3px)",
    opacity: 0,
    transform: "translateY(12px) scale(0.98)",
  },
  transition: { duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple },
} as const;

const overviewChatStatusEntryMotion = {
  animate: {
    filter: "blur(0px)",
    opacity: 1,
    transform: "translateY(0) scale(1)",
  },
  "data-motion-entry": "true",
  exit: {
    filter: "blur(2px)",
    opacity: 0,
    transform: "translateY(-6px) scale(0.96)",
  },
  initial: {
    filter: "blur(2px)",
    opacity: 0,
    transform: "translateY(8px) scale(0.96)",
  },
  transition: { duration: 0.26, ease: MOTION_EASE.apple },
} as const;

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isChatActionId(value: unknown): value is ChatActionId {
  return typeof value === "string" && value in allChatActions;
}

function isChatCardType(value: unknown): value is ChatCardType {
  return (
    value === "billers" ||
    value === "developer-tools" ||
    value === "endpoints" ||
    value === "missing" ||
    value === "snapshot" ||
    value === "sockets" ||
    value === "tool-detail" ||
    value === "users"
  );
}

function isPersistedConversationMessage(
  value: unknown
): value is PersistedConversationMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PersistedConversationMessage>;
  return (
    typeof candidate.id === "string" &&
    (candidate.role === "assistant" || candidate.role === "user") &&
    typeof candidate.text === "string" &&
    (candidate.cardType === undefined || isChatCardType(candidate.cardType)) &&
    (candidate.selectedToolId === undefined ||
      typeof candidate.selectedToolId === "string") &&
    (candidate.showSnapshot === undefined ||
      typeof candidate.showSnapshot === "boolean") &&
    (candidate.tone === undefined ||
      candidate.tone === "default" ||
      candidate.tone === "destructive") &&
    (candidate.actionIds === undefined ||
      (Array.isArray(candidate.actionIds) &&
        candidate.actionIds.every(isChatActionId)))
  );
}

function restoreConversationMessages(value: unknown): ConversationMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isPersistedConversationMessage).map((storedMessage) => {
    const { actionIds, ...message } = storedMessage;
    const actions = (actionIds ?? []).flatMap((actionId) => {
      const action = workspaceActionById.get(actionId);
      return action ? [action] : [];
    });

    return actions.length ? { ...message, actions } : message;
  });
}

function loadConversationMessages(): ConversationMessage[] {
  const storage = getSessionStorage();
  if (!storage) {
    return [];
  }

  const storedConversation = storage.getItem(overviewConversationStorageKey);
  if (!storedConversation) {
    return [];
  }

  try {
    return restoreConversationMessages(JSON.parse(storedConversation));
  } catch {
    return [];
  }
}

function persistConversationMessages(messagesToPersist: ConversationMessage[]) {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    if (messagesToPersist.length === 0) {
      storage.removeItem(overviewConversationStorageKey);
      return;
    }

    const serializableMessages: PersistedConversationMessage[] =
      messagesToPersist.map(({ actions, ...message }) => ({
        ...message,
        ...(actions?.length
          ? { actionIds: actions.map((action) => action.id) }
          : {}),
      }));

    storage.setItem(
      overviewConversationStorageKey,
      JSON.stringify(serializableMessages)
    );
  } catch {
    // Session storage can be unavailable or full; the in-memory chat still works.
  }
}

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

function formatResponseGap(count: number) {
  return formatMessage(
    count === 1
      ? messages.overview.chat.endpointWithoutResponse
      : messages.overview.chat.endpointsWithoutResponses,
    { count }
  );
}

function getErrorMessage(error: ApiError | null) {
  return error?.message || messages.overview.chat.apiSnapshotUnavailable;
}

function getToolReply(query: string): ChatReply | undefined {
  if (helpQueryPattern.test(query)) {
    return {
      actions: [
        allChatActions.endpoints,
        allChatActions["developer-tools"],
        allChatActions["socket-tester"],
      ],
      text: messages.overview.chat.replies.help,
    };
  }

  if (jwtQueryPattern.test(query)) {
    return {
      actions: [allChatActions.jwt, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "jwt-inspector",
      text: messages.overview.chat.replies.jwt,
    };
  }

  if (isoQueryPattern.test(query)) {
    return {
      actions: [allChatActions.iso8583, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "iso8583-generator",
      text: messages.overview.chat.replies.iso8583,
    };
  }

  if (yamlQueryPattern.test(query)) {
    return {
      actions: [allChatActions.yaml, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "json-yaml-converter",
      text: messages.overview.chat.replies.yaml,
    };
  }

  if (schemaQueryPattern.test(query)) {
    return {
      actions: [allChatActions.schema, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "json-schema-validator",
      text: messages.overview.chat.replies.schema,
    };
  }

  if (cronQueryPattern.test(query)) {
    return {
      actions: [allChatActions.cron, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "cron-parser",
      text: messages.overview.chat.replies.cron,
    };
  }

  if (baseQueryPattern.test(query)) {
    return {
      actions: [allChatActions.base, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "number-base-converter",
      text: messages.overview.chat.replies.base,
    };
  }

  if (dateQueryPattern.test(query)) {
    return {
      actions: [allChatActions.date, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "date-converter",
      text: messages.overview.chat.replies.date,
    };
  }

  if (nfcQueryPattern.test(query)) {
    return {
      actions: [allChatActions.nfc, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "nfc-reader-inspector",
      text: messages.overview.chat.replies.nfc,
    };
  }

  if (socketsQueryPattern.test(query) || socksRelayQueryPattern.test(query)) {
    return {
      actions: [allChatActions["socket-tester"], allChatActions["socks-relay"]],
      cardType: "sockets",
      text: messages.overview.chat.replies.sockets,
    };
  }

  if (toolsQueryPattern.test(query)) {
    return {
      actions: [allChatActions["developer-tools"]],
      cardType: "developer-tools",
      text: messages.overview.chat.replies.tools,
    };
  }

  return undefined;
}

function getDataReply(
  query: string,
  data: OverviewData,
  isAdmin: boolean
): ChatReply {
  const { stats } = data;

  if (missingResponseQueryPattern.test(query)) {
    const count = stats.endpointsWithoutResponses;
    return {
      actions: count > 0 ? [allChatActions.endpoints] : undefined,
      cardType: "missing",
      showSnapshot: true,
      text:
        count > 0
          ? formatMessage(messages.overview.chat.replies.missingWithGaps, {
              count,
            })
          : messages.overview.chat.replies.missingWithoutGaps,
    };
  }

  if (endpointQueryPattern.test(query)) {
    return {
      actions: [allChatActions.endpoints],
      cardType: "endpoints",
      showSnapshot: true,
      text: formatMessage(messages.overview.chat.replies.endpointSummary, {
        count: formatCount(
          stats.totalEndpoints,
          messages.overview.chat.count.configuredEndpoint,
          messages.overview.chat.count.configuredEndpoints
        ),
      }),
    };
  }

  if (billerQueryPattern.test(query)) {
    return {
      actions: [allChatActions.endpoints],
      cardType: "billers",
      showSnapshot: true,
      text: formatMessage(messages.overview.chat.replies.billerSummary, {
        count: formatCount(
          stats.totalBillers,
          messages.overview.chat.count.biller,
          messages.overview.chat.count.billers
        ),
      }),
    };
  }

  if (responseQueryPattern.test(query)) {
    return {
      cardType: "snapshot",
      showSnapshot: true,
      text: formatMessage(messages.overview.chat.replies.responseSummary, {
        active: formatCount(
          stats.activeResponses,
          messages.overview.chat.count.activeResponseTemplate,
          messages.overview.chat.count.activeResponseTemplates
        ),
        percentage: stats.activeResponsesPercentage,
        total: formatCount(
          stats.totalResponses,
          messages.overview.chat.count.responseTemplate,
          messages.overview.chat.count.responseTemplates
        ),
      }),
    };
  }

  if (userQueryPattern.test(query)) {
    if (!(isAdmin && data.userStats)) {
      return {
        actions: [allChatActions.endpoints],
        text: messages.overview.chat.replies.adminUnavailable,
      };
    }

    return {
      cardType: "users",
      showSnapshot: true,
      text: formatMessage(messages.overview.chat.replies.userSummary, {
        accounts: formatCount(
          data.userStats.activeUsers,
          messages.overview.chat.count.activeAccount,
          messages.overview.chat.count.activeAccounts
        ),
        users: formatCount(
          data.userStats.totalUsers,
          messages.overview.chat.count.registeredUser,
          messages.overview.chat.count.registeredUsers
        ),
      }),
    };
  }

  if (snapshotQueryPattern.test(query)) {
    return {
      cardType: "snapshot",
      showSnapshot: true,
      text: messages.overview.chat.replies.snapshotSummary,
    };
  }

  return {
    actions: workspaceActions,
    text: messages.overview.chat.replies.fallback,
  };
}

function getAssistantReply(
  query: string,
  data: OverviewData | undefined,
  isAdmin: boolean
): ChatReply {
  if (!data) {
    return {
      text: messages.overview.chat.replies.unavailable,
      tone: "destructive",
    };
  }

  const normalizedQuery = query.toLocaleLowerCase();
  return (
    getToolReply(normalizedQuery) ??
    getDataReply(normalizedQuery, data, isAdmin)
  );
}

function AssistantAvatar() {
  return (
    <span aria-hidden="true" className="overview-chat-avatar">
      <MessageSquareText />
    </span>
  );
}

function SnapshotMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: number | string;
}) {
  return (
    <div className="overview-chat-metric">
      <div className="overview-chat-metric-label">
        <Icon aria-hidden="true" />
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function SnapshotSectionHeading({
  children,
  icon: Icon,
}: {
  children: ReactNode;
  icon: typeof Activity;
}) {
  return (
    <div className="overview-chat-section-heading">
      <Icon aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function getMethodClasses(method: HttpMethod) {
  switch (method) {
    case "DELETE":
      return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300";
    case "GET":
      return "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300";
    case "PATCH":
      return "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300";
    case "POST":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    case "PUT":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function EndpointsSnapshotCard({ data }: { data: OverviewData }) {
  const { stats, methodDistribution, recentEndpoints } = data;
  const methods = methodDistribution?.length
    ? methodDistribution
    : [
        {
          count: recentEndpoints.filter((e) => e.method === "POST").length || 1,
          method: "POST" as const,
        },
        {
          count: recentEndpoints.filter((e) => e.method === "GET").length || 1,
          method: "GET" as const,
        },
      ];

  return (
    <motion.section
      animate={{ filter: "blur(0px)", opacity: 1, transform: "scale(1)" }}
      aria-label={messages.overview.chat.liveSnapshotTitle}
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">
            {messages.overview.chat.snapshot.configuredCatalog}
          </span>
          <h3>{messages.overview.chat.liveSnapshotTitle}</h3>
          <p>{messages.overview.chat.snapshot.configuredCatalogDescription}</p>
        </div>
        <Badge variant="secondary">
          {formatCount(
            stats.totalEndpoints,
            messages.overview.chat.count.endpoint,
            messages.overview.chat.count.endpoints
          )}
        </Badge>
      </header>

      <div className="overview-chat-snapshot-grid">
        <SnapshotMetric
          icon={Plug}
          label={messages.overview.chat.endpointsLabel}
          value={stats.totalEndpoints}
        />
        <SnapshotMetric
          icon={CheckCircle}
          label={messages.overview.chat.activatedLabel}
          value={stats.activeResponses}
        />
        <SnapshotMetric
          icon={Building2}
          label={messages.overview.chat.billersLabel}
          value={stats.totalBillers}
        />
        <SnapshotMetric
          icon={CircleAlert}
          label={messages.overview.chat.snapshot.missingResponses}
          value={stats.endpointsWithoutResponses}
        />
      </div>

      <div className="overview-chat-snapshot-details">
        <div className="overview-chat-snapshot-section">
          <SnapshotSectionHeading icon={ArrowUpDown}>
            {messages.overview.chat.snapshot.httpMethodBreakdown}
          </SnapshotSectionHeading>
          <div className="overview-chat-methods-wrap">
            {methods.map((item) => (
              <span
                className={cn(
                  "overview-chat-method-pill",
                  getMethodClasses(item.method)
                )}
                key={item.method}
              >
                <span>{item.method}</span>
                <strong>{item.count}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className="overview-chat-snapshot-section">
          <SnapshotSectionHeading icon={Activity}>
            {messages.overview.chat.snapshot.responseCoverage}
          </SnapshotSectionHeading>
          <div className="overview-chat-attention-copy">
            <strong>
              {formatMessage(
                messages.overview.chat.snapshot.activeTemplateSummary,
                {
                  active: stats.activeResponses,
                  percentage: stats.activeResponsesPercentage,
                  total: stats.totalResponses,
                }
              )}
            </strong>
            <p>
              {stats.endpointsWithoutResponses === 0
                ? messages.overview.chat.snapshot.allConfiguredActiveResponses
                : formatMessage(
                    messages.overview.chat.snapshot.missingTemplateSummary,
                    { count: stats.endpointsWithoutResponses }
                  )}
            </p>
          </div>
          <div
            aria-label={messages.overview.chat.snapshot.responseCoverageAria}
            aria-valuemax={stats.totalResponses || 1}
            aria-valuemin={0}
            aria-valuenow={stats.activeResponses}
            className="overview-chat-progress"
            role="progressbar"
          >
            <span
              style={{
                transform: `scaleX(${
                  stats.totalResponses
                    ? Math.min(1, stats.activeResponses / stats.totalResponses)
                    : 0
                })`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="overview-chat-snapshot-section overview-chat-recent-section">
        <div className="overview-chat-recent-heading">
          <SnapshotSectionHeading icon={Clock3}>
            {messages.overview.chat.snapshot.recentConfigurations}
          </SnapshotSectionHeading>
          <Link className="overview-chat-inline-link" to="/dashboard/endpoints">
            <span>{messages.overview.chat.openEndpoints}</span>
            <HugeiconsIcon
              aria-hidden="true"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </Link>
        </div>

        {recentEndpoints.length > 0 ? (
          <div className="overview-chat-recent-list">
            {recentEndpoints.slice(0, 5).map((endpoint) => (
              <Link
                className="overview-chat-recent-row"
                key={endpoint.endpointId}
                to={`/dashboard/endpoints/${endpoint.endpointSlug}`}
              >
                <span
                  className={cn(
                    "overview-chat-method",
                    getMethodClasses(endpoint.method)
                  )}
                >
                  {endpoint.method}
                </span>
                <span className="overview-chat-recent-copy">
                  <strong>{endpoint.url}</strong>
                  <span>
                    {endpoint.billerName} ·{" "}
                    {formatCount(
                      endpoint.responseCount,
                      messages.overview.chat.count.response,
                      messages.overview.chat.count.responses
                    )}
                  </span>
                </span>
                <HugeiconsIcon
                  aria-hidden="true"
                  className="overview-chat-recent-arrow"
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="overview-chat-empty-copy">
            {messages.overview.chat.noRecentEndpoints}
          </p>
        )}
      </div>

      <footer className="overview-chat-snapshot-footer">
        <Info aria-hidden="true" />
        <span>
          {messages.overview.chat.snapshot.configuredEndpointsAvailable}
        </span>
      </footer>
    </motion.section>
  );
}

function BillerSnapshotCard({ data }: { data: OverviewData }) {
  const { stats, endpointsByBiller } = data;
  const maxEndpoints = Math.max(
    ...endpointsByBiller.map((biller) => biller.endpointCount),
    1
  );

  return (
    <motion.section
      animate={{ filter: "blur(0px)", opacity: 1, transform: "scale(1)" }}
      aria-label={messages.overview.chat.liveSnapshotTitle}
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">
            {messages.overview.chat.snapshot.providerDirectory}
          </span>
          <h3>{messages.overview.chat.liveSnapshotTitle}</h3>
          <p>{messages.overview.chat.snapshot.providerDistribution}</p>
        </div>
        <Badge variant="secondary">
          {formatCount(
            stats.totalBillers,
            messages.overview.chat.count.biller,
            messages.overview.chat.count.billers
          )}
        </Badge>
      </header>

      <div className="overview-chat-snapshot-grid">
        <SnapshotMetric
          icon={Building2}
          label={messages.overview.chat.billersLabel}
          value={stats.totalBillers}
        />
        <SnapshotMetric
          icon={Plug}
          label={messages.overview.chat.endpointsLabel}
          value={stats.totalEndpoints}
        />
        <SnapshotMetric
          icon={CheckCircle}
          label={messages.overview.chat.responseTemplatesLabel}
          value={stats.activeResponses}
        />
        <SnapshotMetric
          icon={CircleAlert}
          label={messages.overview.chat.snapshot.missingResponses}
          value={stats.endpointsWithoutResponses}
        />
      </div>

      <div className="overview-chat-snapshot-section">
        <div className="overview-chat-recent-heading">
          <SnapshotSectionHeading icon={Building2}>
            {messages.overview.chat.snapshot.allBillerProviders}
          </SnapshotSectionHeading>
          <Link className="overview-chat-inline-link" to="/dashboard/endpoints">
            <span>{messages.overview.chat.snapshot.filterInCatalog}</span>
            <HugeiconsIcon
              aria-hidden="true"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </Link>
        </div>

        {endpointsByBiller.length > 0 ? (
          <div className="overview-chat-biller-list">
            {endpointsByBiller.map((biller) => (
              <div className="overview-chat-biller-row" key={biller.billerName}>
                <div className="overview-chat-biller-name">
                  <span>{biller.billerName}</span>
                  <strong>
                    {formatCount(
                      biller.endpointCount,
                      messages.overview.chat.count.endpoint,
                      messages.overview.chat.count.endpoints
                    )}
                  </strong>
                </div>
                <div
                  aria-label={formatMessage(
                    messages.overview.chat.snapshot.billerCoverageAria,
                    { name: biller.billerName }
                  )}
                  aria-valuemax={maxEndpoints}
                  aria-valuemin={0}
                  aria-valuenow={biller.endpointCount}
                  className="overview-chat-biller-meter"
                  role="progressbar"
                >
                  <span
                    style={{
                      transform: `scaleX(${
                        maxEndpoints ? biller.endpointCount / maxEndpoints : 0
                      })`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="overview-chat-empty-copy">
            {messages.overview.chat.snapshot.noBillersRegistered}
          </p>
        )}
      </div>

      <footer className="overview-chat-snapshot-footer">
        <Info aria-hidden="true" />
        <span>{messages.overview.chat.snapshot.groupedByProvider}</span>
      </footer>
    </motion.section>
  );
}

function MissingResponsesSnapshotCard({ data }: { data: OverviewData }) {
  const { stats, recentEndpoints } = data;
  const count = stats.endpointsWithoutResponses;
  const hasGaps = count > 0;

  return (
    <motion.section
      animate={{ filter: "blur(0px)", opacity: 1, transform: "scale(1)" }}
      aria-label={messages.overview.chat.liveSnapshotTitle}
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">
            {messages.overview.chat.snapshot.gapAnalysis}
          </span>
          <h3>{messages.overview.chat.liveSnapshotTitle}</h3>
          <p>{messages.overview.chat.snapshot.missingDescription}</p>
        </div>
        <Badge variant={hasGaps ? "destructive" : "secondary"}>
          {hasGaps
            ? formatMessage(messages.overview.chat.snapshot.needAttention, {
                count,
              })
            : messages.overview.chat.snapshot.coverageReady}
        </Badge>
      </header>

      <div className="overview-chat-snapshot-grid">
        <SnapshotMetric
          icon={CircleAlert}
          label={messages.overview.chat.snapshot.missingResponses}
          value={count}
        />
        <SnapshotMetric
          icon={Plug}
          label={messages.overview.chat.endpointsLabel}
          value={stats.totalEndpoints}
        />
        <SnapshotMetric
          icon={CheckCircle}
          label={messages.overview.chat.snapshot.configuredTemplates}
          value={stats.totalResponses}
        />
        <SnapshotMetric
          icon={Activity}
          label={messages.overview.chat.snapshot.activationRate}
          value={stats.activeResponsesPercentage}
        />
      </div>

      <div className="overview-chat-snapshot-section">
        <div className="overview-chat-attention-copy">
          <strong>
            {hasGaps
              ? formatMessage(
                  messages.overview.chat.snapshot.requireScenarioTemplates,
                  { count }
                )
              : messages.overview.chat.snapshot.allEndpointsTemplate}
          </strong>
          <p>
            {hasGaps
              ? messages.overview.chat.snapshot.requireScenarioDescription
              : messages.overview.chat.snapshot.allEndpointsDescription}
          </p>
        </div>
      </div>

      <div className="overview-chat-snapshot-section overview-chat-recent-section">
        <div className="overview-chat-recent-heading">
          <SnapshotSectionHeading icon={Clock3}>
            {messages.overview.chat.snapshot.endpointsInCatalog}
          </SnapshotSectionHeading>
          <Link className="overview-chat-inline-link" to="/dashboard/endpoints">
            <span>{messages.overview.chat.openEndpoints}</span>
            <HugeiconsIcon
              aria-hidden="true"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </Link>
        </div>

        {recentEndpoints.length > 0 ? (
          <div className="overview-chat-recent-list">
            {recentEndpoints.slice(0, 4).map((endpoint) => (
              <Link
                className="overview-chat-recent-row"
                key={endpoint.endpointId}
                to={`/dashboard/endpoints/${endpoint.endpointSlug}`}
              >
                <span
                  className={cn(
                    "overview-chat-method",
                    getMethodClasses(endpoint.method)
                  )}
                >
                  {endpoint.method}
                </span>
                <span className="overview-chat-recent-copy">
                  <strong>{endpoint.url}</strong>
                  <span>
                    {endpoint.billerName} ·{" "}
                    {formatCount(
                      endpoint.responseCount,
                      messages.overview.chat.count.response,
                      messages.overview.chat.count.responses
                    )}
                  </span>
                </span>
                <HugeiconsIcon
                  aria-hidden="true"
                  className="overview-chat-recent-arrow"
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <footer className="overview-chat-snapshot-footer">
        <Info aria-hidden="true" />
        <span>{messages.overview.chat.snapshot.requiresActiveTemplate}</span>
      </footer>
    </motion.section>
  );
}

function DeveloperToolsSnapshotCard({
  selectedToolId,
}: {
  selectedToolId?: string;
}) {
  const selectedTool = selectedToolId
    ? DEVELOPER_TOOLS.find((t) => t.id === selectedToolId)
    : null;

  if (selectedTool) {
    const Icon = selectedTool.icon;
    return (
      <motion.section
        animate={{ filter: "blur(0px)", opacity: 1, transform: "scale(1)" }}
        aria-label={messages.overview.chat.liveSnapshotTitle}
        className="overview-chat-snapshot"
        initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
        transition={{
          duration: MOTION_DURATION.smooth,
          ease: MOTION_EASE.apple,
        }}
      >
        <header className="overview-chat-snapshot-header">
          <div>
            <span className="overview-chat-snapshot-kicker">
              {messages.overview.chat.snapshot.integrationUtility}
            </span>
            <h3>{messages.overview.chat.liveSnapshotTitle}</h3>
            <p>{selectedTool.description}</p>
          </div>
          <Badge variant="secondary">{selectedTool.categoryId}</Badge>
        </header>

        <div className="overview-chat-snapshot-grid">
          <SnapshotMetric
            icon={Icon}
            label={messages.overview.chat.snapshot.utility}
            value={selectedTool.name}
          />
          <SnapshotMetric
            icon={Clock3}
            label={messages.overview.chat.snapshot.runtime}
            value={selectedTool.runtime}
          />
          <SnapshotMetric
            icon={Activity}
            label={messages.overview.chat.snapshot.maxPayload}
            value={selectedTool.limit}
          />
          <SnapshotMetric
            icon={ShieldCheck}
            label={messages.overview.chat.snapshot.environment}
            value={messages.overview.chat.snapshot.clientSide}
          />
        </div>

        <div className="overview-chat-snapshot-section">
          <div className="overview-chat-recent-heading">
            <SnapshotSectionHeading icon={Icon}>
              {messages.overview.chat.snapshot.launchTool}
            </SnapshotSectionHeading>
            <Link
              className="overview-chat-inline-link"
              to={getDeveloperToolHref(selectedTool)}
            >
              <span>
                {formatMessage(messages.overview.chat.snapshot.openTool, {
                  name: selectedTool.name,
                })}
              </span>
              <HugeiconsIcon
                aria-hidden="true"
                icon={ArrowRight01Icon}
                strokeWidth={2}
              />
            </Link>
          </div>
          <div className="overview-chat-attention-copy">
            <p>{selectedTool.document.description}</p>
          </div>
        </div>

        <footer className="overview-chat-snapshot-footer">
          <Info aria-hidden="true" />
          <span>{messages.overview.chat.snapshot.localUtilityFooter}</span>
        </footer>
      </motion.section>
    );
  }

  return (
    <motion.section
      animate={{ filter: "blur(0px)", opacity: 1, transform: "scale(1)" }}
      aria-label={messages.overview.chat.liveSnapshotTitle}
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">
            {messages.overview.chat.snapshot.integrationToolbox}
          </span>
          <h3>{messages.overview.chat.liveSnapshotTitle}</h3>
          <p>{messages.overview.chat.snapshot.toolboxDescription}</p>
        </div>
        <Badge variant="secondary">
          {formatMessage(messages.overview.chat.snapshot.utilityCount, {
            count: DEVELOPER_TOOLS.length,
          })}
        </Badge>
      </header>

      <div className="overview-chat-card-grid">
        {DEVELOPER_TOOLS.map((tool) => {
          const ToolIcon = tool.icon;
          return (
            <Link
              className="overview-chat-card-tile"
              key={tool.id}
              to={getDeveloperToolHref(tool)}
            >
              <span className="overview-chat-card-tile-icon">
                <ToolIcon aria-hidden="true" />
              </span>
              <span className="overview-chat-card-tile-copy">
                <strong>{tool.name}</strong>
                <span>{tool.description}</span>
              </span>
              <HugeiconsIcon
                aria-hidden="true"
                className="overview-chat-recent-arrow"
                icon={ArrowRight01Icon}
                strokeWidth={2}
              />
            </Link>
          );
        })}
      </div>

      <footer className="overview-chat-snapshot-footer">
        <Info aria-hidden="true" />
        <span>{messages.overview.chat.snapshot.developerUtilitiesFooter}</span>
      </footer>
    </motion.section>
  );
}

function SocketsSnapshotCard() {
  const socketTools = [
    {
      get description() {
        return messages.overview.chat.snapshot.tcpClientDescription;
      },
      icon: Network,
      id: "tcp-client",
      get name() {
        return messages.overview.chat.snapshot.tcpClient;
      },
      to: "/dashboard/socket-test/tcp-client" as const,
    },
    {
      get description() {
        return messages.overview.chat.snapshot.tcpServerDescription;
      },
      icon: Activity,
      id: "tcp-server",
      get name() {
        return messages.overview.chat.snapshot.tcpServer;
      },
      to: "/dashboard/socket-test/tcp-client" as const,
    },
    {
      get description() {
        return messages.overview.chat.snapshot.udpDatagramDescription;
      },
      icon: RadioReceiver,
      id: "udp",
      get name() {
        return messages.overview.chat.snapshot.udpDatagram;
      },
      to: "/dashboard/socket-test/tcp-client" as const,
    },
    {
      get description() {
        return messages.overview.chat.snapshot.socksRelayProxyDescription;
      },
      icon: ShieldCheck,
      id: "socks-relay",
      get name() {
        return messages.overview.chat.snapshot.socksRelayProxy;
      },
      to: "/dashboard/socks-relay/rest-api" as const,
    },
  ];

  return (
    <motion.section
      animate={{ filter: "blur(0px)", opacity: 1, transform: "scale(1)" }}
      aria-label={messages.overview.chat.liveSnapshotTitle}
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">
            {messages.overview.chat.snapshot.networkTransport}
          </span>
          <h3>{messages.overview.chat.liveSnapshotTitle}</h3>
          <p>{messages.overview.chat.snapshot.networkTransportDescription}</p>
        </div>
        <Badge variant="secondary">
          {messages.overview.chat.snapshot.networkProtocols}
        </Badge>
      </header>

      <div className="overview-chat-card-grid">
        {socketTools.map((tool) => {
          const ToolIcon = tool.icon;
          return (
            <Link
              className="overview-chat-card-tile"
              key={tool.id}
              to={tool.to}
            >
              <span className="overview-chat-card-tile-icon">
                <ToolIcon aria-hidden="true" />
              </span>
              <span className="overview-chat-card-tile-copy">
                <strong>{tool.name}</strong>
                <span>{tool.description}</span>
              </span>
              <HugeiconsIcon
                aria-hidden="true"
                className="overview-chat-recent-arrow"
                icon={ArrowRight01Icon}
                strokeWidth={2}
              />
            </Link>
          );
        })}
      </div>

      <footer className="overview-chat-snapshot-footer">
        <Info aria-hidden="true" />
        <span>{messages.overview.chat.snapshot.networkTransportFooter}</span>
      </footer>
    </motion.section>
  );
}

function UserStatsSnapshotCard({ data }: { data: OverviewData }) {
  const { userStats } = data;
  if (!userStats) {
    return null;
  }

  return (
    <motion.section
      animate={{ filter: "blur(0px)", opacity: 1, transform: "scale(1)" }}
      aria-label={messages.overview.chat.liveSnapshotTitle}
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">
            {messages.overview.chat.snapshot.accessControl}
          </span>
          <h3>{messages.overview.chat.liveSnapshotTitle}</h3>
          <p>{messages.overview.chat.snapshot.administratorOnlyDescription}</p>
        </div>
        <Badge variant="secondary">
          {messages.overview.chat.snapshot.administratorSignal}
        </Badge>
      </header>

      <div className="overview-chat-snapshot-grid">
        <SnapshotMetric
          icon={Users}
          label={messages.overview.chat.snapshot.totalAccounts}
          value={userStats.totalUsers}
        />
        <SnapshotMetric
          icon={CheckCircle}
          label={messages.overview.chartLabels.activeUsers}
          value={userStats.activeUsers}
        />
        <SnapshotMetric
          icon={CircleAlert}
          label={messages.overview.chartLabels.inactiveUsers}
          value={userStats.inactiveUsers}
        />
        <SnapshotMetric
          icon={ShieldCheck}
          label={messages.overview.chat.snapshot.administrators}
          value={userStats.adminUsers}
        />
      </div>

      <div className="overview-chat-snapshot-section">
        <div className="overview-chat-attention-copy">
          <strong>
            {formatMessage(
              messages.overview.chat.snapshot.accountActiveSummary,
              {
                active: userStats.activeUsers,
                total: userStats.totalUsers,
              }
            )}
          </strong>
          <p>
            {formatMessage(
              messages.overview.chat.snapshot.administratorSummary,
              {
                administrators: userStats.adminUsers,
                regular: userStats.regularUsers,
              }
            )}
          </p>
        </div>
      </div>

      <footer className="overview-chat-snapshot-footer">
        <Info aria-hidden="true" />
        <span>{messages.overview.chat.snapshot.administratorRestricted}</span>
      </footer>
    </motion.section>
  );
}

function OverviewSnapshotCard({
  data,
  isAdmin,
}: {
  data: OverviewData;
  isAdmin: boolean;
}) {
  const { stats } = data;
  const maxBillerEndpointCount = Math.max(
    1,
    ...data.endpointsByBiller.map((biller) => biller.endpointCount)
  );
  const activePercentage = Math.min(
    100,
    Math.max(
      0,
      Number.parseInt(stats.activeResponsesPercentage.replace("%", ""), 10) || 0
    )
  );
  const hasAttention = stats.endpointsWithoutResponses > 0;

  return (
    <motion.section
      animate={{
        filter: "blur(0px)",
        opacity: 1,
        transform: "translateY(0) scale(1)",
      }}
      aria-label={messages.overview.chat.liveSnapshotTitle}
      className="overview-chat-snapshot"
      exit={{
        filter: "blur(4px)",
        opacity: 0,
        transform: "translateY(6px) scale(0.98)",
      }}
      initial={{
        filter: "blur(4px)",
        opacity: 0,
        transform: "translateY(8px) scale(0.98)",
      }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div className="min-w-0">
          <div className="overview-chat-message-label">
            {messages.overview.chat.snapshot.currentRead}
          </div>
          <h2>{messages.overview.chat.liveSnapshotTitle}</h2>
          <p>{messages.overview.chat.liveSnapshotDescription}</p>
        </div>
        <Badge variant={hasAttention ? "destructive" : "secondary"}>
          {hasAttention
            ? formatMessage(messages.overview.chat.snapshot.needAttention, {
                count: stats.endpointsWithoutResponses,
              })
            : messages.overview.chat.snapshot.coverageReady}
        </Badge>
      </header>

      <div className="overview-chat-snapshot-grid">
        <SnapshotMetric
          icon={Plug}
          label={messages.overview.chat.endpointsLabel}
          value={stats.totalEndpoints}
        />
        <SnapshotMetric
          icon={Building2}
          label={messages.overview.chat.billersLabel}
          value={stats.totalBillers}
        />
        <SnapshotMetric
          icon={FileJson}
          label={messages.overview.chat.responseTemplatesLabel}
          value={stats.totalResponses}
        />
        <SnapshotMetric
          icon={Activity}
          label={messages.overview.chat.activatedLabel}
          value={stats.activeResponsesPercentage}
        />
      </div>

      <div
        className={cn(
          "overview-chat-snapshot-details",
          isAdmin && "overview-chat-snapshot-details-admin"
        )}
      >
        <div className="overview-chat-snapshot-section">
          <SnapshotSectionHeading icon={Building2}>
            {messages.overview.chat.billerCoverageLabel}
          </SnapshotSectionHeading>
          {data.endpointsByBiller.length > 0 ? (
            <div className="overview-chat-biller-list">
              {data.endpointsByBiller.slice(0, 5).map((biller) => (
                <div
                  className="overview-chat-biller-row"
                  key={biller.billerName}
                >
                  <div className="overview-chat-biller-name">
                    <span>{biller.billerName}</span>
                    <strong>{biller.endpointCount}</strong>
                  </div>
                  <div
                    aria-label={formatMessage(
                      messages.overview.chat.snapshot.billerCoverageAria,
                      { name: biller.billerName }
                    )}
                    aria-valuemax={maxBillerEndpointCount}
                    aria-valuemin={0}
                    aria-valuenow={biller.endpointCount}
                    className="overview-chat-biller-meter"
                    role="progressbar"
                  >
                    <span
                      style={{
                        transform: `scaleX(${
                          maxBillerEndpointCount
                            ? biller.endpointCount / maxBillerEndpointCount
                            : 0
                        })`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="overview-chat-empty-copy">
              {messages.overview.chat.snapshot.noBillerCoverage}
            </p>
          )}
        </div>

        <div className="overview-chat-snapshot-section">
          <SnapshotSectionHeading icon={Activity}>
            {messages.overview.chat.attentionLabel}
          </SnapshotSectionHeading>
          <div className="overview-chat-attention-copy">
            <strong>
              {hasAttention
                ? formatResponseGap(stats.endpointsWithoutResponses)
                : messages.overview.chat.healthyCoverage}
            </strong>
            <p>
              {formatMessage(
                messages.overview.chat.snapshot.responseTemplatesActive,
                {
                  active: stats.activeResponses,
                  total: stats.totalResponses,
                }
              )}
            </p>
          </div>
          <div
            aria-label={messages.overview.chat.attentionLabel}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={activePercentage}
            className="overview-chat-progress"
            role="progressbar"
          >
            <span style={{ transform: `scaleX(${activePercentage / 100})` }} />
          </div>
          {isAdmin && data.userStats ? (
            <div className="overview-chat-section-heading overview-chat-account-signal">
              <Users aria-hidden="true" />
              <span>
                {formatMessage(messages.overview.chat.snapshot.accountSignal, {
                  active: data.userStats.activeUsers,
                  registered: data.userStats.totalUsers,
                })}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="overview-chat-snapshot-section overview-chat-recent-section">
        <div className="overview-chat-recent-heading">
          <SnapshotSectionHeading icon={Clock3}>
            {messages.overview.chat.recentEndpointsLabel}
          </SnapshotSectionHeading>
          <Link className="overview-chat-inline-link" to="/dashboard/endpoints">
            {messages.overview.chat.openEndpoints}
            <HugeiconsIcon
              aria-hidden="true"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </Link>
        </div>
        {data.recentEndpoints.length > 0 ? (
          <div className="overview-chat-recent-list">
            {data.recentEndpoints.slice(0, 5).map((endpoint) => (
              <Link
                className="overview-chat-recent-row"
                key={endpoint.endpointId}
                to={`/dashboard/endpoints/${endpoint.endpointSlug}`}
              >
                <span
                  className={cn(
                    "overview-chat-method",
                    getMethodClasses(endpoint.method)
                  )}
                >
                  {endpoint.method}
                </span>
                <span className="overview-chat-recent-copy">
                  <strong>{endpoint.url}</strong>
                  <span>
                    {endpoint.billerName} ·{" "}
                    {formatCount(
                      endpoint.responseCount,
                      messages.overview.chat.count.response,
                      messages.overview.chat.count.responses
                    )}
                  </span>
                </span>
                <HugeiconsIcon
                  aria-hidden="true"
                  className="overview-chat-recent-arrow"
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="overview-chat-empty-copy">
            {messages.overview.chat.noRecentEndpoints}
          </p>
        )}
      </div>

      <footer className="overview-chat-snapshot-footer">
        <Info aria-hidden="true" />
        <span>{messages.overview.chat.updatedSource}</span>
      </footer>
    </motion.section>
  );
}

function OverviewSnapshotSkeleton() {
  return (
    <div
      aria-label={messages.overview.chat.loadingSnapshot}
      className="overview-chat-snapshot-skeleton"
      role="status"
    >
      <div className="overview-chat-snapshot-skeleton-heading">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        <Skeleton className="h-5 w-24" variant="full" />
      </div>
      <div className="overview-chat-snapshot-skeleton-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="grid gap-3" key={index}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatActions({ actions }: { actions: ChatAction[] }) {
  return (
    <nav
      aria-label={messages.overview.chat.workspaceShortcuts}
      className="overview-chat-actions"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.id}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
          >
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "overview-chat-action"
              )}
              to={action.to}
            >
              <span aria-hidden="true" className="overview-chat-action-icon">
                <Icon />
              </span>
              <span className="overview-chat-action-copy">
                <strong>{action.label}</strong>
                <span>{action.description}</span>
              </span>
              <HugeiconsIcon
                aria-hidden="true"
                className="overview-chat-action-arrow"
                icon={ArrowRight01Icon}
                strokeWidth={2}
              />
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

function AssistantMessage({
  data,
  isAdmin,
  isStreaming,
  message,
}: {
  data: OverviewData | undefined;
  isAdmin: boolean;
  isStreaming: boolean;
  message: ConversationMessage;
}) {
  const cardType =
    message.cardType ?? (message.showSnapshot ? "snapshot" : undefined);

  return (
    <Message data-role="assistant" variant="chat">
      <MessageAvatar variant="chat">
        <AssistantAvatar />
      </MessageAvatar>
      <MessageContent variant="chat">
        <div className="overview-chat-message-label">
          {messages.overview.chat.assistantName}
        </div>
        <Bubble
          variant={message.tone === "destructive" ? "destructive" : "muted"}
        >
          <BubbleContent
            variant={message.tone === "destructive" ? "chat-error" : "chat"}
          >
            {isStreaming ? (
              <StreamingAssistantText text={message.text} />
            ) : (
              message.text
            )}
          </BubbleContent>
        </Bubble>
        {data && cardType === "snapshot" ? (
          <OverviewSnapshotCard data={data} isAdmin={isAdmin} />
        ) : null}
        {data && cardType === "endpoints" ? (
          <EndpointsSnapshotCard data={data} />
        ) : null}
        {data && cardType === "billers" ? (
          <BillerSnapshotCard data={data} />
        ) : null}
        {data && cardType === "missing" ? (
          <MissingResponsesSnapshotCard data={data} />
        ) : null}
        {cardType === "developer-tools" || cardType === "tool-detail" ? (
          <DeveloperToolsSnapshotCard selectedToolId={message.selectedToolId} />
        ) : null}
        {cardType === "sockets" ? <SocketsSnapshotCard /> : null}
        {data && cardType === "users" ? (
          <UserStatsSnapshotCard data={data} />
        ) : null}
        {message.actions ? <ChatActions actions={message.actions} /> : null}
      </MessageContent>
    </Message>
  );
}

function StreamingAssistantText({ text }: { text: string }) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setContent(text));
    const timer = setTimeout(() => setIsStreaming(false), 400);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [text]);

  return (
    <Streaming animation="fadeIn" isStreaming={isStreaming}>
      {content}
    </Streaming>
  );
}

function UserMessage({ message }: { message: ConversationMessage }) {
  return (
    <Message align="end" data-role="user" variant="chat">
      <MessageContent variant="chat">
        <Bubble align="end">
          <BubbleContent variant="chat">{message.text}</BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

type OperatorMascotProps = {
  compact?: boolean;
  state: "idle" | "thinking";
};

function OperatorMascot({ compact = false, state }: OperatorMascotProps) {
  const isThinking = state === "thinking";
  const shouldReduceMotion = useReducedMotion();
  const label = compact ? undefined : messages.overview.chat.operatorMascotAlt;
  const mediaClass = cn(
    compact
      ? "overview-operator-mascot-compact-image"
      : "overview-chat-welcome-image"
  );
  const stillSrc = "/brand/biller-operator-mascot-still.webp?v=pointing-swipe";
  const stem = isThinking
    ? "biller-operator-mascot-thinking"
    : "biller-operator-mascot-greeting";

  return (
    <div
      className={cn(
        "overview-operator-mascot",
        compact && "overview-operator-mascot-compact"
      )}
      data-slot="overview-operator-mascot"
      data-state={state}
    >
      {shouldReduceMotion ? (
        <img
          alt={label ?? ""}
          aria-hidden={compact ? true : undefined}
          className={mediaClass}
          decoding="async"
          height={576}
          src={stillSrc}
          width={384}
        />
      ) : (
        <video
          aria-hidden={compact ? true : undefined}
          aria-label={label}
          autoPlay
          className={mediaClass}
          height={576}
          loop
          muted
          playsInline
          poster={stillSrc}
          role={compact ? undefined : "img"}
          width={384}
        >
          <source
            src={`/brand/${stem}.mp4?v=pointing-swipe`}
            type='video/mp4; codecs="hvc1"'
          />
          <source
            src={`/brand/${stem}.webm?v=pointing-swipe`}
            type="video/webm"
          />
          <img
            alt=""
            aria-hidden="true"
            className={mediaClass}
            decoding="async"
            height={576}
            src={stillSrc}
            width={384}
          />
        </video>
      )}
    </div>
  );
}

function StatusCheckingMarker({ label }: { label: string }) {
  return (
    <div className="overview-chat-progress-marker" role="status">
      <OperatorMascot compact state="thinking" />
      <span className="shimmer">{label}</span>
    </div>
  );
}

function OverviewChatTranscript({
  data,
  error,
  isAdmin,
  isLoading,
  isSubmitting,
  messages: conversationMessages,
  streamingMessageId,
}: {
  data: OverviewData | undefined;
  error: ApiError | null;
  isAdmin: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  messages: ConversationMessage[];
  streamingMessageId: string | null;
}) {
  const { scrollToEnd } = useMessageScroller();
  const previousMessageCount = useRef(0);
  const minimapItems = conversationMessages.map((message) => ({
    description: message.text,
    id: message.id,
    title:
      message.text.split("\n", 1)[0]?.trim() ||
      (message.role === "user"
        ? messages.overview.chat.yourMessage
        : messages.overview.chat.assistantResponse),
  }));

  useEffect(() => {
    const hasNewMessage =
      conversationMessages.length > previousMessageCount.current;
    previousMessageCount.current = conversationMessages.length;

    if (!(hasNewMessage || isSubmitting)) {
      return;
    }

    const latestMessage = conversationMessages.at(-1);
    const shouldSmoothScroll =
      !isSubmitting && latestMessage?.role === "assistant";

    scrollToEnd({ behavior: shouldSmoothScroll ? "smooth" : "auto" });
  }, [conversationMessages, isSubmitting, scrollToEnd]);

  return (
    <ChatMinimapContainer className="size-full">
      <MessageScroller data-follow-latest="true" variant="chat">
        <MessageScrollerViewport
          aria-label={messages.overview.chat.conversationLabel}
          variant="chat"
        >
          <MessageScrollerContent
            aria-busy={isSubmitting || isLoading}
            role="log"
            variant="chat"
          >
            <AnimatePresence initial={false}>
              {isLoading && !data ? (
                <MotionMessageScrollerItem
                  {...overviewChatStatusEntryMotion}
                  className="overview-chat-entry"
                  key="overview-loading"
                  messageId="overview-loading"
                >
                  <StatusCheckingMarker
                    label={messages.overview.chat.loadingSnapshot}
                  />
                  <OverviewSnapshotSkeleton />
                </MotionMessageScrollerItem>
              ) : null}
              {error && !data ? (
                <MotionMessageScrollerItem
                  {...overviewChatStatusEntryMotion}
                  className="overview-chat-entry"
                  key="overview-error"
                  messageId="overview-error"
                >
                  <Alert variant="chat-destructive">
                    <CircleAlert aria-hidden="true" />
                    <AlertTitle>{messages.overview.chat.errorTitle}</AlertTitle>
                    <AlertDescription>
                      {getErrorMessage(error)}
                    </AlertDescription>
                  </Alert>
                </MotionMessageScrollerItem>
              ) : null}
              {conversationMessages.map((message) => (
                <MotionMessageScrollerItem
                  {...(message.role === "assistant"
                    ? overviewChatAssistantEntryMotion
                    : overviewChatUserEntryMotion)}
                  className="overview-chat-entry"
                  data-message-id={message.id}
                  key={message.id}
                  messageId={message.id}
                  scrollAnchor={message.role === "user"}
                >
                  {message.role === "assistant" ? (
                    <AssistantMessage
                      data={data}
                      isAdmin={isAdmin}
                      isStreaming={message.id === streamingMessageId}
                      message={message}
                    />
                  ) : (
                    <UserMessage message={message} />
                  )}
                </MotionMessageScrollerItem>
              ))}
              {isSubmitting ? (
                <MotionMessageScrollerItem
                  {...overviewChatStatusEntryMotion}
                  className="overview-chat-entry"
                  key="overview-search-progress"
                  messageId="overview-search-progress"
                >
                  <StatusCheckingMarker
                    label={messages.overview.chat.loadingReply}
                  />
                </MotionMessageScrollerItem>
              ) : null}
            </AnimatePresence>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton
          aria-label={messages.overview.chat.scrollLatest}
          variant="chat"
        />
      </MessageScroller>
      <ChatMinimap className="max-sm:hidden" items={minimapItems} />
    </ChatMinimapContainer>
  );
}

const MotionMessageScrollerItem = motion.create(MessageScrollerItem);

function OverviewChatAmbient() {
  return (
    <div
      aria-hidden="true"
      className="overview-chat-ambient"
      data-slot="overview-chat-ambient"
    />
  );
}

export function OverviewChat({
  data,
  error,
  isAdmin,
  isLoading,
  refetch,
}: OverviewChatProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >(loadConversationMessages);
  const messageSequence = useRef(conversationMessages.length);
  const conversationRequest = useRef(0);
  const pendingReplyCancellation = useRef<(() => void) | null>(null);

  const hasConversation = conversationMessages.length > 0;

  useEffect(() => {
    persistConversationMessages(conversationMessages);
  }, [conversationMessages]);

  useEffect(
    () => () => {
      pendingReplyCancellation.current?.();
    },
    []
  );

  const appendMessage = useCallback(
    (message: Omit<ConversationMessage, "id">) => {
      const id = `${message.role}-${messageSequence.current}`;
      messageSequence.current += 1;
      setConversationMessages((current) => [...current, { ...message, id }]);
      return id;
    },
    []
  );

  const appendAssistantMessage = useCallback(
    (message: Omit<ConversationMessage, "id" | "role">) => {
      const id = appendMessage({ ...message, role: "assistant" });
      setStreamingMessageId(id);
    },
    [appendMessage]
  );

  const waitForReplyPresentation = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          pendingReplyCancellation.current = null;
          resolve();
        }, overviewChatReplyDelayMs);

        pendingReplyCancellation.current = () => {
          clearTimeout(timeout);
          pendingReplyCancellation.current = null;
          resolve();
        };
      }),
    []
  );

  const clearConversation = useCallback(() => {
    conversationRequest.current += 1;
    pendingReplyCancellation.current?.();
    messageSequence.current = 0;
    setIsSubmitting(false);
    setStreamingMessageId(null);
    setConversationMessages([]);
  }, []);

  const submitRefreshQuery = useCallback(
    async (requestId: number) => {
      const presentationDelay = waitForReplyPresentation();

      try {
        const result = await refetch();
        await presentationDelay;
        if (conversationRequest.current !== requestId) {
          return;
        }

        if (result.data && !result.error) {
          appendAssistantMessage({
            showSnapshot: true,
            text: messages.overview.chat.replies.refreshSuccess,
          });
        } else {
          appendAssistantMessage({
            text: formatMessage(messages.overview.chat.replies.refreshFailed, {
              error: getErrorMessage(result.error),
            }),
            tone: "destructive",
          });
        }
      } catch {
        await presentationDelay;
        if (conversationRequest.current !== requestId) {
          return;
        }

        appendAssistantMessage({
          text: messages.overview.chat.replies.refreshFailedTryAgain,
          tone: "destructive",
        });
      } finally {
        if (conversationRequest.current === requestId) {
          setIsSubmitting(false);
        }
      }
    },
    [appendAssistantMessage, refetch, waitForReplyPresentation]
  );

  const submitQuery = useCallback(
    async (value: string) => {
      const query = value.trim();
      if (!query) {
        return;
      }

      if (clearChatQueryPattern.test(query)) {
        clearConversation();
        return;
      }

      if (isSubmitting) {
        return;
      }

      const requestId = conversationRequest.current + 1;
      conversationRequest.current = requestId;
      appendMessage({ role: "user", text: query });
      setIsSubmitting(true);

      if (refreshQueryPattern.test(query)) {
        await submitRefreshQuery(requestId);
        return;
      }

      await waitForReplyPresentation();
      if (conversationRequest.current !== requestId) {
        return;
      }

      appendAssistantMessage({
        ...getAssistantReply(query, data, isAdmin),
      });
      setIsSubmitting(false);
    },
    [
      appendAssistantMessage,
      appendMessage,
      clearConversation,
      data,
      isAdmin,
      isSubmitting,
      submitRefreshQuery,
      waitForReplyPresentation,
    ]
  );

  const handleQuery = useCallback(
    (value: string) => {
      submitQuery(value).catch(() => {
        setIsSubmitting(false);
      });
    },
    [submitQuery]
  );

  return (
    <MotionConfig reducedMotion="never">
      <div
        className="overview-chat-page"
        data-chat-state={hasConversation ? "active" : "empty"}
      >
        <LayoutGroup id="overview-chat">
          <section
            aria-label={messages.overview.chat.conversationLabel}
            className="overview-chat-panel"
          >
            {hasConversation ? null : <OverviewChatAmbient />}
            <h1 className="sr-only">{messages.overview.pageTitle}</h1>
            <div className="overview-chat-viewport-shell">
              <AnimatePresence mode="sync">
                {hasConversation ? null : (
                  <motion.div
                    animate="visible"
                    className="overview-chat-welcome"
                    exit="exit"
                    initial="hidden"
                    key="overview-chat-welcome"
                    transition={{
                      duration: MOTION_DURATION.chat,
                      ease: MOTION_EASE.apple,
                    }}
                    variants={overviewWelcomeVariants}
                  >
                    <motion.div
                      className="overview-chat-welcome-art"
                      data-overview-entrance="item"
                      variants={overviewWelcomeItemVariants}
                    >
                      <OperatorMascot state="idle" />
                    </motion.div>
                    <motion.h2
                      data-overview-entrance="item"
                      variants={overviewWelcomeItemVariants}
                    >
                      {messages.overview.chat.emptyTitle}
                    </motion.h2>
                    <motion.p
                      data-overview-entrance="item"
                      variants={overviewWelcomeItemVariants}
                    >
                      {messages.overview.chat.emptyDescription}
                    </motion.p>
                  </motion.div>
                )}

                {hasConversation ? (
                  <motion.div
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      transform: "translateY(0)",
                    }}
                    className="overview-chat-transcript-shell"
                    initial={{
                      filter: "blur(6px)",
                      opacity: 0,
                      transform: "translateY(16px)",
                    }}
                    key="overview-chat-transcript"
                    transition={{
                      duration: MOTION_DURATION.chat,
                      ease: MOTION_EASE.apple,
                    }}
                  >
                    <MessageScrollerProvider
                      autoScroll
                      scrollPreviousItemPeek={64}
                    >
                      <OverviewChatTranscript
                        data={data}
                        error={error}
                        isAdmin={isAdmin}
                        isLoading={isLoading}
                        isSubmitting={isSubmitting}
                        messages={conversationMessages}
                        streamingMessageId={streamingMessageId}
                      />
                    </MessageScrollerProvider>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <OverviewChatComposer
              hasConversation={hasConversation}
              isSubmitting={isSubmitting}
              onClear={clearConversation}
              onQuery={handleQuery}
            />
          </section>
        </LayoutGroup>
      </div>
    </MotionConfig>
  );
}
