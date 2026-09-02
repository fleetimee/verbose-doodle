import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router";
import {
  Activity,
  Building2,
  CircleAlert,
  Clock3,
  FileJson,
  Globe,
  Info,
  MessageSquareText,
  Plug,
  Users,
} from "@/components/hugeicons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { HttpMethod } from "@/features/endpoints/types";
import { OverviewChatComposer } from "@/features/overview/components/overview-chat-composer";
import type { OverviewData } from "@/features/overview/types";
import type { ApiError } from "@/lib/api";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ConsolePath =
  | "/dashboard/developer-tools"
  | "/dashboard/endpoints"
  | "/dashboard/socket-test/tcp-client";

type ChatActionId = "developer-tools" | "endpoints" | "socket-tester";

type ChatAction = {
  description: string;
  icon: typeof Plug;
  id: ChatActionId;
  label: string;
  to: ConsolePath;
};

type ConversationMessage = {
  actions?: ChatAction[];
  id: string;
  role: "assistant" | "user";
  showSnapshot?: boolean;
  text: string;
  tone?: "default" | "destructive";
};

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

const workspaceActions: ChatAction[] = [
  {
    description: "Browse billers, endpoints, responses, and traffic history.",
    icon: Plug,
    id: "endpoints",
    label: "Open endpoint catalog",
    to: "/dashboard/endpoints",
  },
  {
    description: "Convert, validate, parse, and inspect integration payloads.",
    icon: FileJson,
    id: "developer-tools",
    label: "Open developer tools",
    to: "/dashboard/developer-tools",
  },
  {
    description: "Exercise TCP and UDP behavior while you build a scenario.",
    icon: Activity,
    id: "socket-tester",
    label: "Open socket tester",
    to: "/dashboard/socket-test/tcp-client",
  },
];

const workspaceActionById = new Map(
  workspaceActions.map((action) => [action.id, action] as const)
);

const snapshotQueryPattern =
  /(snapshot|summary|overview|status|health|everything|all)/;
const endpointQueryPattern = /(endpoint|route|recent api|catalog)/;
const billerQueryPattern = /(biller|provider|service)/;
const responseQueryPattern = /(response|template|scenario|active|inactive)/;
const missingResponseQueryPattern =
  /(without|missing|need.*response|no response|unconfigured)/;
const userQueryPattern = /(user|account|admin|role|permission)/;
const refreshQueryPattern = /(refresh|reload|check again)/i;
const clearChatQueryPattern = /^(?:\/clear(?:\s+chat)?|clear chat)$/i;
const overviewChatReplyDelayMs = 560;
const overviewConversationStorageKey = "fleetime-labs.overview.conversation";

const overviewChatEntryMotion = {
  animate: { opacity: 1, transform: "translateY(0)" },
  "data-motion-entry": "true",
  initial: { opacity: 0, transform: "translateY(10px)" },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
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
  return (
    value === "developer-tools" ||
    value === "endpoints" ||
    value === "socket-tester"
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

  if (missingResponseQueryPattern.test(normalizedQuery)) {
    const count = stats.endpointsWithoutResponses;
    return {
      actions: count > 0 ? [workspaceActions[0]] : undefined,
      showSnapshot: true,
      text:
        count > 0
          ? `${formatCountWithVerb(count, "endpoint", "still needs", "still need")} a response template. The attention signal and endpoint catalog below can help you close the gap.`
          : "Every configured endpoint currently has a response template. The snapshot below shows the rest of the simulator coverage.",
    };
  }

  if (endpointQueryPattern.test(normalizedQuery)) {
    return {
      actions: [workspaceActions[0]],
      showSnapshot: true,
      text: `The simulator currently has ${formatCount(stats.totalEndpoints, "configured endpoint")}. I’ve included the latest endpoint list and response coverage below.`,
    };
  }

  if (billerQueryPattern.test(normalizedQuery)) {
    return {
      actions: [workspaceActions[0]],
      showSnapshot: true,
      text: `${formatThereAre(stats.totalBillers, "biller")} represented in the simulator. The snapshot groups endpoint coverage by biller so you can spot uneven setup quickly.`,
    };
  }

  if (responseQueryPattern.test(normalizedQuery)) {
    return {
      showSnapshot: true,
      text: `${formatCountWithVerb(stats.totalResponses, "response template", "is", "are")} configured, and ${formatCountWithVerb(stats.activeResponses, "active response template", "is", "are")} active (${stats.activeResponsesPercentage}). The snapshot below separates activation from endpoint coverage.`,
    };
  }

  if (userQueryPattern.test(normalizedQuery)) {
    if (!(isAdmin && data.userStats)) {
      return {
        text: "Account activity is only available to administrators. I can still show billers, endpoints, and response coverage from this overview.",
        actions: [workspaceActions[0]],
      };
    }

    return {
      showSnapshot: true,
      text: `${formatThereAre(data.userStats.totalUsers, "registered user")}, with ${formatCount(data.userStats.activeUsers, "active account")}. The administrator-only account signal is included in the snapshot below.`,
    };
  }

  if (snapshotQueryPattern.test(normalizedQuery)) {
    return {
      showSnapshot: true,
      text: "Here’s the current simulator read: billers, endpoints, response templates, activation, and the latest configured endpoints in one place.",
    };
  }

  return {
    actions: workspaceActions,
    text: "I can read the current simulator snapshot or take you to Endpoints, Developer Tools, and Socket Tester. Try asking about billers, endpoints, responses, or missing templates.",
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
    <section
      aria-label="Live simulator snapshot"
      className="overview-chat-snapshot"
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

      <div className="overview-chat-metric-grid">
        <SnapshotMetric
          icon={Globe}
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
          <div className="overview-chat-biller-list">
            {data.endpointsByBiller.length > 0 ? (
              data.endpointsByBiller.slice(0, 5).map((biller) => (
                <div
                  className="overview-chat-biller-row"
                  key={biller.billerName}
                >
                  <div className="overview-chat-biller-name">
                    <span>{biller.billerName}</span>
                    <strong>{biller.endpointCount}</strong>
                  </div>
                  <div
                    aria-hidden="true"
                    className="overview-chat-biller-meter"
                  >
                    <span
                      style={{
                        width: `${(biller.endpointCount / maxBillerEndpointCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="overview-chat-empty-copy">
                No biller coverage is available yet.
              </p>
            )}
          </div>
        </div>

        <div className="overview-chat-snapshot-section">
          <SnapshotSectionHeading icon={hasAttention ? CircleAlert : Activity}>
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
            aria-label={`${stats.activeResponsesPercentage} of response templates are active`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={activePercentage}
            className="overview-chat-progress"
            role="progressbar"
          >
            <span style={{ width: `${activePercentage}%` }} />
          </div>
          {isAdmin && data.userStats ? (
            <div className="overview-chat-account-signal">
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
                to={`/dashboard/endpoints/${endpoint.endpointId}`}
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
    </section>
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
      aria-label="Suggested simulator destinations"
      className="overview-chat-actions"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            className={cn(
              buttonVariants({ variant: "outline" }),
              "overview-chat-action"
            )}
            key={action.to}
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
        );
      })}
    </nav>
  );
}

function AssistantMessage({
  data,
  isAdmin,
  message,
}: {
  data: OverviewData | undefined;
  isAdmin: boolean;
  message: ConversationMessage;
}) {
  return (
    <div className="overview-chat-message" data-role="assistant">
      <div className="overview-chat-message-avatar">
        <AssistantAvatar />
      </div>
      <div className="overview-chat-message-body">
        <div className="overview-chat-message-label">
          {messages.overview.chat.assistantName}
        </div>
        <div
          className={cn(
            "overview-chat-bubble",
            message.tone === "destructive" && "overview-chat-bubble-error"
          )}
        >
          {message.text}
        </div>
        {message.showSnapshot && data ? (
          <OverviewSnapshotCard data={data} isAdmin={isAdmin} />
        ) : null}
        {message.actions ? <ChatActions actions={message.actions} /> : null}
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: ConversationMessage }) {
  return (
    <div className="overview-chat-message" data-role="user">
      <div className="overview-chat-message-body">
        <div className="overview-chat-bubble">{message.text}</div>
      </div>
    </div>
  );
}

function StatusCheckingMarker({ label }: { label: string }) {
  return (
    <div className="overview-chat-progress-marker" role="status">
      <Spinner aria-hidden="true" />
      <span>{label}</span>
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
  onAtLatestChange,
  onScrollToLatest,
  showScrollToLatest,
  threadRef,
}: {
  data: OverviewData | undefined;
  error: ApiError | null;
  isAdmin: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  messages: ConversationMessage[];
  onAtLatestChange: (isAtLatest: boolean) => void;
  onScrollToLatest: () => void;
  showScrollToLatest: boolean;
  threadRef: RefObject<HTMLDivElement | null>;
}) {
  const prefersReducedMotion = useReducedMotion();
  const previousMessageCount = useRef(0);

  const scrollToEnd = useCallback(
    (behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth") => {
      const thread = threadRef.current;
      if (!thread) {
        return;
      }

      thread.scrollTo({ behavior, top: thread.scrollHeight });
    },
    [prefersReducedMotion]
  );

  useEffect(() => {
    const hasNewMessage =
      conversationMessages.length > previousMessageCount.current;
    previousMessageCount.current = conversationMessages.length;

    if (!(hasNewMessage || isSubmitting || data)) {
      return;
    }

    scrollToEnd();
  }, [conversationMessages.length, data, isSubmitting, scrollToEnd]);

  return (
    <div
      aria-label="Simulator overview conversation"
      className="overview-chat-thread"
      onScroll={(event) => {
        const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
        const isNearLatest = scrollHeight - (scrollTop + clientHeight) < 72;
        onAtLatestChange(isNearLatest);
      }}
      ref={threadRef}
      role="log"
    >
      <div
        aria-busy={isSubmitting || isLoading}
        className="overview-chat-thread-content"
      >
        <AnimatePresence initial={false}>
          {isLoading && !data ? (
            <motion.div
              {...overviewChatEntryMotion}
              className="overview-chat-entry"
              key="overview-loading"
            >
              <StatusCheckingMarker
                label={messages.overview.chat.loadingSnapshot}
              />
              <OverviewSnapshotSkeleton />
            </motion.div>
          ) : null}
          {error && !data ? (
            <motion.div
              {...overviewChatEntryMotion}
              className="overview-chat-entry"
              key="overview-error"
            >
              <Alert className="overview-chat-error" variant="destructive">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>{messages.overview.chat.errorTitle}</AlertTitle>
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            </motion.div>
          ) : null}
          {conversationMessages.map((message) => (
            <motion.div
              {...overviewChatEntryMotion}
              className="overview-chat-entry"
              data-message-id={message.id}
              key={message.id}
            >
              {message.role === "assistant" ? (
                <AssistantMessage
                  data={data}
                  isAdmin={isAdmin}
                  message={message}
                />
              ) : (
                <UserMessage message={message} />
              )}
            </motion.div>
          ))}
          {isSubmitting ? (
            <motion.div
              {...overviewChatEntryMotion}
              className="overview-chat-entry"
              key="overview-search-progress"
            >
              <StatusCheckingMarker
                label={messages.overview.chat.loadingReply}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      {showScrollToLatest ? (
        <Button
          aria-label="Scroll to latest response"
          className="overview-chat-scroll-latest"
          onClick={onScrollToLatest}
          size="icon"
          type="button"
          variant="outline"
        >
          <HugeiconsIcon
            aria-hidden="true"
            className="rotate-90"
            icon={ArrowRight01Icon}
            strokeWidth={2}
          />
        </Button>
      ) : null}
    </div>
  );
}

export function OverviewChat({
  data,
  error,
  isAdmin,
  isLoading,
  refetch,
}: OverviewChatProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >(loadConversationMessages);
  const [isAtLatest, setIsAtLatest] = useState(true);
  const messageSequence = useRef(conversationMessages.length);
  const conversationRequest = useRef(0);
  const pendingReplyCancellation = useRef<(() => void) | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

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
    },
    []
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
    setIsAtLatest(true);
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
          appendMessage({
            role: "assistant",
            showSnapshot: true,
            text: "The overview is refreshed. Here’s the latest simulator read.",
          });
        } else {
          appendMessage({
            role: "assistant",
            text: `I couldn’t refresh the simulator snapshot. ${getErrorMessage(result.error)}`,
            tone: "destructive",
          });
        }
      } catch {
        await presentationDelay;
        if (conversationRequest.current !== requestId) {
          return;
        }

        appendMessage({
          role: "assistant",
          text: "I couldn’t refresh the simulator snapshot. Try again shortly.",
          tone: "destructive",
        });
      } finally {
        if (conversationRequest.current === requestId) {
          setIsSubmitting(false);
        }
      }
    },
    [appendMessage, refetch, waitForReplyPresentation]
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
      setIsAtLatest(true);
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

      appendMessage({
        role: "assistant",
        ...getAssistantReply(query, data, isAdmin),
      });
      setIsSubmitting(false);
    },
    [
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

  const scrollToLatest = useCallback(() => {
    const thread = threadRef.current;
    if (!thread) {
      return;
    }

    thread.scrollTo({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      top: thread.scrollHeight,
    });
    setIsAtLatest(true);
  }, [prefersReducedMotion]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="overview-chat-page"
        data-chat-state={hasConversation ? "active" : "empty"}
      >
        <LayoutGroup id="overview-chat">
          <section
            aria-label="Simulator overview conversation"
            className="overview-chat-panel"
          >
            <h1 className="sr-only">{messages.overview.pageTitle}</h1>
            {hasConversation ? null : (
              <div className="overview-chat-welcome">
                <div aria-hidden="true" className="overview-chat-welcome-mark">
                  <MessageSquareText />
                </div>
                <h2>{messages.overview.chat.emptyTitle}</h2>
                <p>{messages.overview.chat.emptyDescription}</p>
                <div className="overview-chat-welcome-status">
                  <span aria-hidden="true" />
                  {messages.overview.chat.readOnlyLabel}
                </div>
              </div>
            )}

            {hasConversation ? (
              <OverviewChatTranscript
                data={data}
                error={error}
                isAdmin={isAdmin}
                isLoading={isLoading}
                isSubmitting={isSubmitting}
                messages={conversationMessages}
                onAtLatestChange={setIsAtLatest}
                onScrollToLatest={scrollToLatest}
                showScrollToLatest={!isAtLatest}
                threadRef={threadRef}
              />
            ) : null}

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
