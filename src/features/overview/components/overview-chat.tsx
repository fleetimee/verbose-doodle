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
    description: "Convert numbers across binary, octal, decimal, hex, and base64.",
    icon: Binary,
    id: "base",
    label: "Number base converter",
    to: "/dashboard/developer-tools/number-base-converter",
  },
  cron: {
    description: "Validate cron syntax and calculate next 5 trigger runs.",
    icon: Timer,
    id: "cron",
    label: "Cron parser",
    to: "/dashboard/developer-tools/cron-parser",
  },
  date: {
    description: "Convert epoch timestamps, ISO 8601 strings, and timezone offsets.",
    icon: CalendarDays,
    id: "date",
    label: "Date & timezone",
    to: "/dashboard/developer-tools/date-converter",
  },
  "developer-tools": {
    description: "Explore all 8 integration utilities and converters.",
    icon: FileJson,
    id: "developer-tools",
    label: "Developer tools catalog",
    to: "/dashboard/developer-tools",
  },
  endpoints: {
    description: "Browse billers, endpoints, responses, and traffic history.",
    icon: Plug,
    id: "endpoints",
    label: "Open endpoint catalog",
    to: "/dashboard/endpoints",
  },
  iso8583: {
    description: "Generate and inspect ISO 8583 banking message streams.",
    icon: Code2,
    id: "iso8583",
    label: "ISO 8583 generator",
    to: "/dashboard/developer-tools/iso8583-generator",
  },
  jwt: {
    description: "Decode headers, claims, and verify cryptographic signatures.",
    icon: Fingerprint,
    id: "jwt",
    label: "JWT inspector",
    to: "/dashboard/developer-tools/jwt-inspector",
  },
  nfc: {
    description: "Parse NDEF text records and raw hex payload dumps.",
    icon: RadioReceiver,
    id: "nfc",
    label: "NFC reader inspector",
    to: "/dashboard/developer-tools/nfc-reader-inspector",
  },
  schema: {
    description: "Validate JSON payloads against Draft-07 and 2020-12 schemas.",
    icon: Braces,
    id: "schema",
    label: "JSON schema validator",
    to: "/dashboard/developer-tools/json-schema-validator",
  },
  "socket-tester": {
    description: "Exercise TCP client/server and UDP packet communication.",
    icon: Network,
    id: "socket-tester",
    label: "Open socket tester",
    to: "/dashboard/socket-test/tcp-client",
  },
  "socks-relay": {
    description: "Monitor and configure SOCKS5 proxy routing for simulated protocols.",
    icon: ShieldCheck,
    id: "socks-relay",
    label: "SOCKS relay proxy",
    to: "/dashboard/socks-relay/rest-api",
  },
  yaml: {
    description: "Convert and format documents between JSON and YAML in real time.",
    icon: FileJson,
    id: "yaml",
    label: "JSON ↔ YAML converter",
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

function formatCountWithVerb(
  count: number,
  singular: string,
  singularVerb: string,
  pluralVerb: string
) {
  return `${formatCount(count, singular)} ${count === 1 ? singularVerb : pluralVerb}`;
}

function formatThereAre(count: number, singular: string, plural?: string) {
  return `There ${count === 1 ? "is" : "are"} ${formatCount(count, singular, plural)}`;
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
  return (
    error?.message || "The Overview API did not return a simulator snapshot."
  );
}

function getAssistantReply(
  query: string,
  data: OverviewData | undefined,
  isAdmin: boolean
): ChatReply {
  if (!data) {
    return {
      text: "I can’t read the simulator snapshot yet. Try /refresh once the Overview API is available.",
      tone: "destructive",
    };
  }

  const normalizedQuery = query.toLocaleLowerCase();
  const { stats } = data;

  if (helpQueryPattern.test(normalizedQuery)) {
    return {
      actions: [
        allChatActions.endpoints,
        allChatActions["developer-tools"],
        allChatActions["socket-tester"],
      ],
      text: "Here are the available slash commands and queries you can run:\n\n• /snapshot — View complete simulator coverage and metrics\n• /endpoints — Review configured endpoints and HTTP methods\n• /billers — Breakdown of endpoints grouped by biller\n• /missing — Find endpoints without active response templates\n• /tools — Open the 8 developer integration tools\n• /jwt, /iso8583, /schema, /json-yaml, /cron, /base, /date, /nfc — Jump to specific developer tools\n• /sockets & /socks-relay — Socket and proxy test workspaces\n• /users — Account activity (Admin)\n• /refresh — Fetch latest overview snapshot\n• /clear — Reset chat conversation",
    };
  }

  if (jwtQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.jwt, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "jwt-inspector",
      text: "The JWT Inspector allows you to decode JSON Web Tokens, inspect Header and Payload claims, and verify HS256/RS256 cryptographic signatures with instant validation.",
    };
  }

  if (isoQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.iso8583, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "iso8583-generator",
      text: "The ISO 8583 Generator helps you construct and simulate financial transaction messages, configure primary and secondary bitmaps, test MTIs (0100, 0200, 0800), and inspect packed byte streams.",
    };
  }

  if (yamlQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.yaml, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "json-yaml-converter",
      text: "The JSON ↔ YAML Converter provides bidirectional conversion with real-time error diagnostics, indentation settings, and format swap capabilities.",
    };
  }

  if (schemaQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.schema, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "json-schema-validator",
      text: "The JSON Schema Validator checks JSON documents against Draft-07 and Draft 2020-12 specifications, reporting exact line/path diagnostics on validation errors.",
    };
  }

  if (cronQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.cron, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "cron-parser",
      text: "The Cron Parser breaks down 5-field and 6-field (with seconds) cron expressions into plain language and calculates the next 5 scheduled execution timestamps.",
    };
  }

  if (baseQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.base, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "number-base-converter",
      text: "The Number Base Converter handles real-time conversions across binary, octal, decimal, hexadecimal, and base64 formats with signed 2's complement and unsigned integer support.",
    };
  }

  if (dateQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.date, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "date-converter",
      text: "The Date & Timestamp Converter translates between Unix epoch seconds/milliseconds, ISO 8601 strings, and custom timezone offsets.",
    };
  }

  if (nfcQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.nfc, allChatActions["developer-tools"]],
      cardType: "tool-detail",
      selectedToolId: "nfc-reader-inspector",
      text: "The NFC Reader Inspector processes contactless scan streams, decoding NDEF text records and displaying raw hex dumps for hardware simulation.",
    };
  }

  if (socketsQueryPattern.test(normalizedQuery) || socksRelayQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions["socket-tester"], allChatActions["socks-relay"]],
      cardType: "sockets",
      text: "The Socket & Relay Workspace allows you to interactively test TCP client/server endpoints, UDP datagram flows, and configure SOCKS5 proxy relay tunnels.",
    };
  }

  if (toolsQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions["developer-tools"]],
      cardType: "developer-tools",
      text: "The developer toolbox includes 8 specialized integration utilities for real-time conversion, validation, parsing, and payload inspection.",
    };
  }

  if (missingResponseQueryPattern.test(normalizedQuery)) {
    const count = stats.endpointsWithoutResponses;
    return {
      actions: count > 0 ? [allChatActions.endpoints] : undefined,
      cardType: "missing",
      showSnapshot: true,
      text:
        count > 0
          ? `${formatCountWithVerb(count, "endpoint", "still needs", "still need")} a response template. The attention signal and endpoint catalog below can help you close the gap.`
          : "Every configured endpoint currently has a response template. The snapshot below shows the rest of the simulator coverage.",
    };
  }

  if (endpointQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.endpoints],
      cardType: "endpoints",
      showSnapshot: true,
      text: `The simulator currently has ${formatCount(stats.totalEndpoints, "configured endpoint")}. I’ve included the latest endpoint list and response coverage below.`,
    };
  }

  if (billerQueryPattern.test(normalizedQuery)) {
    return {
      actions: [allChatActions.endpoints],
      cardType: "billers",
      showSnapshot: true,
      text: `${formatThereAre(stats.totalBillers, "biller")} represented in the simulator. The snapshot groups endpoint coverage by biller so you can spot uneven setup quickly.`,
    };
  }

  if (responseQueryPattern.test(normalizedQuery)) {
    return {
      cardType: "snapshot",
      showSnapshot: true,
      text: `${formatCountWithVerb(stats.totalResponses, "response template", "is", "are")} configured, and ${formatCountWithVerb(stats.activeResponses, "active response template", "is", "are")} active (${stats.activeResponsesPercentage}). The snapshot below separates activation from endpoint coverage.`,
    };
  }

  if (userQueryPattern.test(normalizedQuery)) {
    if (!(isAdmin && data.userStats)) {
      return {
        actions: [allChatActions.endpoints],
        text: "Account activity is only available to administrators. I can still show billers, endpoints, and response coverage from this overview.",
      };
    }

    return {
      cardType: "users",
      showSnapshot: true,
      text: `${formatThereAre(data.userStats.totalUsers, "registered user")}, with ${formatCount(data.userStats.activeUsers, "active account")}. The administrator-only account signal is included in the snapshot below.`,
    };
  }

  if (snapshotQueryPattern.test(normalizedQuery)) {
    return {
      cardType: "snapshot",
      showSnapshot: true,
      text: "Here’s the current simulator read: billers, endpoints, response templates, activation, and the latest configured endpoints in one place.",
    };
  }

  return {
    actions: workspaceActions,
    text: "I can read the current simulator snapshot or take you to Endpoints, Developer Tools, and Socket Tester. Try typing /help to browse all commands.",
  };
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
      aria-label="Live simulator snapshot"
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">CONFIGURED CATALOG</span>
          <h3>Live simulator snapshot</h3>
          <p>Endpoints configured in the simulator with HTTP method routing and response coverage.</p>
        </div>
        <Badge variant="secondary">
          {formatCount(stats.totalEndpoints, "endpoint")}
        </Badge>
      </header>

      <div className="overview-chat-snapshot-grid">
        <SnapshotMetric
          icon={Plug}
          label="TOTAL ENDPOINTS"
          value={stats.totalEndpoints}
        />
        <SnapshotMetric
          icon={CheckCircle}
          label="ACTIVE RESPONSES"
          value={stats.activeResponses}
        />
        <SnapshotMetric
          icon={Building2}
          label="BILLERS"
          value={stats.totalBillers}
        />
        <SnapshotMetric
          icon={CircleAlert}
          label="NEED TEMPLATES"
          value={stats.endpointsWithoutResponses}
        />
      </div>

      <div className="overview-chat-snapshot-details">
        <div className="overview-chat-snapshot-section">
          <SnapshotSectionHeading icon={ArrowUpDown}>
            HTTP METHOD BREAKDOWN
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
            RESPONSE COVERAGE
          </SnapshotSectionHeading>
          <div className="overview-chat-attention-copy">
            <strong>
              {stats.activeResponses} of {stats.totalResponses} templates active ({stats.activeResponsesPercentage})
            </strong>
            <p>
              {stats.endpointsWithoutResponses === 0
                ? "All configured endpoints have active response scenarios."
                : `${stats.endpointsWithoutResponses} endpoint(s) still need response templates.`}
            </p>
          </div>
          <div
            aria-label="Active response coverage"
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
            RECENT CONFIGURATIONS
          </SnapshotSectionHeading>
          <Link
            className="overview-chat-inline-link"
            to="/dashboard/endpoints"
          >
            <span>Open endpoint catalog</span>
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
                    {formatCount(endpoint.responseCount, "response")}
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
        <span>Configured endpoints are available for scenario generation.</span>
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
      aria-label="Live simulator snapshot"
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">PROVIDER DIRECTORY</span>
          <h3>Live simulator snapshot</h3>
          <p>Distribution of endpoints and mock response templates across simulated billers.</p>
        </div>
        <Badge variant="secondary">
          {formatCount(stats.totalBillers, "biller")}
        </Badge>
      </header>

      <div className="overview-chat-snapshot-grid">
        <SnapshotMetric
          icon={Building2}
          label="BILLERS"
          value={stats.totalBillers}
        />
        <SnapshotMetric
          icon={Plug}
          label="TOTAL ENDPOINTS"
          value={stats.totalEndpoints}
        />
        <SnapshotMetric
          icon={CheckCircle}
          label="ACTIVE TEMPLATES"
          value={stats.activeResponses}
        />
        <SnapshotMetric
          icon={CircleAlert}
          label="UNCONFIGURED"
          value={stats.endpointsWithoutResponses}
        />
      </div>

      <div className="overview-chat-snapshot-section">
        <div className="overview-chat-recent-heading">
          <SnapshotSectionHeading icon={Building2}>
            ALL BILLER PROVIDERS
          </SnapshotSectionHeading>
          <Link
            className="overview-chat-inline-link"
            to="/dashboard/endpoints"
          >
            <span>Filter in catalog</span>
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
              <div
                className="overview-chat-biller-row"
                key={biller.billerName}
              >
                <div className="overview-chat-biller-name">
                  <span>{biller.billerName}</span>
                  <strong>
                    {formatCount(biller.endpointCount, "endpoint")}
                  </strong>
                </div>
                <div
                  aria-label={`${biller.billerName} coverage`}
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
          <p className="overview-chat-empty-copy">No billers registered yet.</p>
        )}
      </div>

      <footer className="overview-chat-snapshot-footer">
        <Info aria-hidden="true" />
        <span>Endpoints are grouped by provider to identify unbalanced coverage.</span>
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
      aria-label="Live simulator snapshot"
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">GAP ANALYSIS</span>
          <h3>Live simulator snapshot</h3>
          <p>Endpoints lacking active response scenarios or requiring scenario configuration.</p>
        </div>
        <Badge variant={hasGaps ? "destructive" : "secondary"}>
          {hasGaps ? `${count} need attention` : "100% coverage"}
        </Badge>
      </header>

      <div className="overview-chat-snapshot-grid">
        <SnapshotMetric
          icon={CircleAlert}
          label="MISSING RESPONSES"
          value={count}
        />
        <SnapshotMetric
          icon={Plug}
          label="TOTAL ENDPOINTS"
          value={stats.totalEndpoints}
        />
        <SnapshotMetric
          icon={CheckCircle}
          label="CONFIGURED TEMPLATES"
          value={stats.totalResponses}
        />
        <SnapshotMetric
          icon={Activity}
          label="ACTIVATION RATE"
          value={stats.activeResponsesPercentage}
        />
      </div>

      <div className="overview-chat-snapshot-section">
        <div className="overview-chat-attention-copy">
          <strong>
            {hasGaps
              ? `${count} endpoint(s) require scenario templates`
              : "Every configured endpoint currently has an active response template"}
          </strong>
          <p>
            {hasGaps
              ? "Without a response template, incoming simulator calls to these endpoints will receive default or 404 responses. Open the endpoint catalog to create mock scenarios."
              : "All simulator endpoints are equipped with active mock responses and ready for test traffic."}
          </p>
        </div>
      </div>

      <div className="overview-chat-snapshot-section overview-chat-recent-section">
        <div className="overview-chat-recent-heading">
          <SnapshotSectionHeading icon={Clock3}>
            ENDPOINTS IN CATALOG
          </SnapshotSectionHeading>
          <Link
            className="overview-chat-inline-link"
            to="/dashboard/endpoints"
          >
            <span>Open endpoint catalog</span>
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
                    {formatCount(endpoint.responseCount, "response")}
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
        <span>Every endpoint requires at least one active response template for full simulation.</span>
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
        aria-label="Live simulator snapshot"
        className="overview-chat-snapshot"
        initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
        transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
      >
        <header className="overview-chat-snapshot-header">
          <div>
            <span className="overview-chat-snapshot-kicker">INTEGRATION UTILITY</span>
            <h3>Live simulator snapshot</h3>
            <p>{selectedTool.description}</p>
          </div>
          <Badge variant="secondary">{selectedTool.categoryId}</Badge>
        </header>

        <div className="overview-chat-snapshot-grid">
          <SnapshotMetric
            icon={Icon}
            label="UTILITY"
            value={selectedTool.name}
          />
          <SnapshotMetric
            icon={Clock3}
            label="RUNTIME"
            value={selectedTool.runtime}
          />
          <SnapshotMetric
            icon={Activity}
            label="MAX PAYLOAD"
            value={selectedTool.limit}
          />
          <SnapshotMetric
            icon={ShieldCheck}
            label="ENVIRONMENT"
            value="Client-side"
          />
        </div>

        <div className="overview-chat-snapshot-section">
          <div className="overview-chat-recent-heading">
            <SnapshotSectionHeading icon={Icon}>
              LAUNCH TOOL
            </SnapshotSectionHeading>
            <Link
              className="overview-chat-inline-link"
              to={getDeveloperToolHref(selectedTool)}
            >
              <span>Open {selectedTool.name}</span>
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
          <span>Runs locally in browser with zero network latency or data leakage.</span>
        </footer>
      </motion.section>
    );
  }

  return (
    <motion.section
      animate={{ filter: "blur(0px)", opacity: 1, transform: "scale(1)" }}
      aria-label="Live simulator snapshot"
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">INTEGRATION TOOLBOX</span>
          <h3>Live simulator snapshot</h3>
          <p>8 client-side utilities for payload conversion, validation, parsing, and inspection.</p>
        </div>
        <Badge variant="secondary">8 utilities</Badge>
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
        <span>Developer utilities run locally in your browser for instant payload manipulation.</span>
      </footer>
    </motion.section>
  );
}

function SocketsSnapshotCard() {
  const socketTools = [
    {
      description: "Interactive TCP client for sending custom payloads & streaming responses.",
      icon: Network,
      id: "tcp-client",
      name: "TCP Client",
      to: "/dashboard/socket-test/tcp-client" as const,
    },
    {
      description: "Capture incoming client TCP connections and echo or mock replies.",
      icon: Activity,
      id: "tcp-server",
      name: "TCP Server",
      to: "/dashboard/socket-test/tcp-client" as const,
    },
    {
      description: "Send connectionless UDP packets and observe receiver responses.",
      icon: RadioReceiver,
      id: "udp",
      name: "UDP Datagram",
      to: "/dashboard/socket-test/tcp-client" as const,
    },
    {
      description: "Inspect SOCKS5 proxy routing for REST API and ISO 8583 traffic.",
      icon: ShieldCheck,
      id: "socks-relay",
      name: "SOCKS Relay Proxy",
      to: "/dashboard/socks-relay/rest-api" as const,
    },
  ];

  return (
    <motion.section
      animate={{ filter: "blur(0px)", opacity: 1, transform: "scale(1)" }}
      aria-label="Live simulator snapshot"
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">NETWORK TRANSPORT</span>
          <h3>Live simulator snapshot</h3>
          <p>Low-level socket testing utilities and secure SOCKS5 proxy relay workspaces.</p>
        </div>
        <Badge variant="secondary">TCP / UDP / SOCKS5</Badge>
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
        <span>Socket and proxy utilities enable multi-protocol transport testing.</span>
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
      aria-label="Live simulator snapshot"
      className="overview-chat-snapshot"
      initial={{ filter: "blur(3px)", opacity: 0, transform: "scale(0.98)" }}
      transition={{ duration: MOTION_DURATION.smooth, ease: MOTION_EASE.apple }}
    >
      <header className="overview-chat-snapshot-header">
        <div>
          <span className="overview-chat-snapshot-kicker">ACCESS CONTROL</span>
          <h3>Live simulator snapshot</h3>
          <p>Administrator-only view of registered user accounts and system permissions.</p>
        </div>
        <Badge variant="secondary">Administrator signal</Badge>
      </header>

      <div className="overview-chat-snapshot-grid">
        <SnapshotMetric
          icon={Users}
          label="TOTAL ACCOUNTS"
          value={userStats.totalUsers}
        />
        <SnapshotMetric
          icon={CheckCircle}
          label="ACTIVE USERS"
          value={userStats.activeUsers}
        />
        <SnapshotMetric
          icon={CircleAlert}
          label="INACTIVE USERS"
          value={userStats.inactiveUsers}
        />
        <SnapshotMetric
          icon={ShieldCheck}
          label="ADMINISTRATORS"
          value={userStats.adminUsers}
        />
      </div>

      <div className="overview-chat-snapshot-section">
        <div className="overview-chat-attention-copy">
          <strong>
            {userStats.activeUsers} of {userStats.totalUsers} registered accounts are active
          </strong>
          <p>
            The simulator maintains {userStats.adminUsers} administrator role(s) with full configuration and user management privileges, and {userStats.regularUsers} standard user(s).
          </p>
        </div>
      </div>

      <footer className="overview-chat-snapshot-footer">
        <Info aria-hidden="true" />
        <span>Account metrics are restricted to administrators.</span>
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
      aria-label="Live simulator snapshot"
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
          <div className="overview-chat-message-label">Current read</div>
          <h2>{messages.overview.chat.liveSnapshotTitle}</h2>
          <p>{messages.overview.chat.liveSnapshotDescription}</p>
        </div>
        <Badge variant={hasAttention ? "destructive" : "secondary"}>
          {hasAttention
            ? `${stats.endpointsWithoutResponses} attention`
            : "Coverage ready"}
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
                    aria-label={`${biller.billerName} coverage`}
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
              No biller coverage is available yet.
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
              {stats.activeResponses} of {stats.totalResponses} response
              templates are active.
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
                {formatCount(data.userStats.activeUsers, "active account")} ·{" "}
                {formatCount(data.userStats.totalUsers, "registered user")}
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
                    {formatCount(endpoint.responseCount, "response")}
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
      aria-label="Reading simulator coverage"
      className="overview-chat-snapshot-skeleton"
      role="status"
    >
      <div className="overview-chat-snapshot-skeleton-heading">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
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
    <Message className="overview-chat-message" data-role="assistant">
      <MessageAvatar className="overview-chat-message-avatar self-start overflow-visible rounded-none bg-transparent">
        <AssistantAvatar />
      </MessageAvatar>
      <MessageContent className="overview-chat-message-body">
        <div className="overview-chat-message-label">
          {messages.overview.chat.assistantName}
        </div>
        <Bubble
          variant={message.tone === "destructive" ? "destructive" : "muted"}
        >
          <BubbleContent
            className={cn(
              "overview-chat-bubble",
              message.tone === "destructive" && "overview-chat-bubble-error"
            )}
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
    <Message align="end" className="overview-chat-message" data-role="user">
      <MessageContent className="overview-chat-message-body">
        <Bubble align="end">
          <BubbleContent className="overview-chat-bubble">
            {message.text}
          </BubbleContent>
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
  const label = compact ? undefined : "Biller operator mascot reading a tablet";
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
      (message.role === "user" ? "Your message" : "Assistant response"),
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
      <MessageScroller className="overview-chat-thread" data-follow-latest="true">
        <MessageScrollerViewport
          aria-label="Simulator overview conversation"
          className="overview-chat-viewport"
        >
          <MessageScrollerContent
            aria-busy={isSubmitting || isLoading}
            className="overview-chat-thread-content"
            role="log"
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
                <Alert className="overview-chat-error" variant="destructive">
                  <CircleAlert aria-hidden="true" />
                  <AlertTitle>{messages.overview.chat.errorTitle}</AlertTitle>
                  <AlertDescription>{getErrorMessage(error)}</AlertDescription>
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
          aria-label="Scroll to latest response"
          className="overview-chat-scroll-latest"
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
            text: "The overview is refreshed. Here’s the latest simulator read.",
          });
        } else {
          appendAssistantMessage({
            text: `I couldn’t refresh the simulator snapshot. ${getErrorMessage(result.error)}`,
            tone: "destructive",
          });
        }
      } catch {
        await presentationDelay;
        if (conversationRequest.current !== requestId) {
          return;
        }

        appendAssistantMessage({
          text: "I couldn’t refresh the simulator snapshot. Try again shortly.",
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
            aria-label="Simulator overview conversation"
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
