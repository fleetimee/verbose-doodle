import {
  Activity01Icon,
  AndroidIcon,
  AppleIcon,
  ArrowLeft01Icon,
  BrowserIcon,
  ChromeIcon,
  Clock03Icon,
  ComputerIcon,
  ComputerTerminal01Icon,
  Delete02Icon,
  GlobeIcon,
  LockKeyIcon,
  MailSend01Icon,
  MessageSquareCodeIcon,
  SafariIcon,
  SmartPhone01Icon,
  Tick02Icon,
  TickDouble02Icon,
  UserGroupIcon,
  ViewIcon,
  ViewOffIcon,
  WindowsNewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type CSSProperties,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Message, MessageContent } from "@/components/ui/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  type VisitorChatAction,
  VisitorChatActionDialog,
  VisitorChatMessageActions,
} from "@/components/visitor-chat-message-actions";
import { VisitorChatStickerPicker } from "@/components/visitor-chat-sticker-picker";
import { useAuth } from "@/features/auth/context";
import {
  formatChatDay,
  formatChatTime,
  getChatDay,
} from "@/features/dashboard/chat-date";
import {
  encodeChatSticker,
  getChatStickerSrc,
  parseChatSticker,
} from "@/features/dashboard/chat-stickers";
import {
  DASHBOARD_PRESENCE_QUERY_KEY,
  dashboardChatThreadQueryKey,
} from "@/features/dashboard/components/dashboard-visit-notifications";
import {
  type DashboardIpChatMessage,
  type DashboardIpChatThread,
  type DashboardPresencePoint,
  type DashboardPresenceSnapshot,
  type DashboardVisitorPresence,
  deleteDashboardChatMessages,
  fetchDashboardChatThread,
  fetchDashboardPresence,
  getStoredPresenceStatusMode,
  markDashboardChatRead,
  sendDashboardChatMessage,
  setActiveVisitorChatTargetIp,
  setStoredPresenceStatusMode,
  subscribeOpenVisitorChat,
  subscribePresenceStatusMode,
  type VisitorPresenceStatusMode,
} from "@/features/dashboard/dashboard-activity";
import { formatJakartaTimestamp } from "@/features/endpoints/utils/endpoint-time";
import { fetchLogSources } from "@/features/log-viewer/api";
import { getErrorMessage } from "@/lib/error-handler";
import { type AppLocale, formatMessage, type Messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING } from "@/lib/motion";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";

function formatRelativeLastSeen(
  isoString: string,
  nowMs: number,
  locale: AppLocale
): string {
  const timestamp = Date.parse(isoString);
  if (Number.isNaN(timestamp)) {
    return isoString;
  }

  const diffSeconds = Math.round((timestamp - nowMs) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absSeconds < 45) {
    return rtf.format(0, "second");
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffSeconds / 3600);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffSeconds / 86_400);
  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, "day");
  }

  return formatJakartaTimestamp(isoString);
}

interface RouteLabelRegistry {
  [key: string]: string;
}

type VisitorPageDescription = {
  readonly isGame: boolean;
  readonly label: string;
  readonly path: string;
};

type DetectedAgentTrait = {
  readonly icon: IconSvgElement;
  readonly label: string;
};

type VisitorDeviceDescription = {
  readonly browser: string;
  readonly browserIcon: IconSvgElement;
  readonly os: string;
  readonly osIcon: IconSvgElement;
  readonly raw: string;
  readonly summary: string;
};

const EDGE_VERSION_REGEX = /Edg(?:e|A|iOS)?\/(\d+)/;
const OPERA_VERSION_REGEX = /(?:OPR|Opera)\/(\d+)/;
const FIREFOX_VERSION_REGEX = /(?:Firefox|FxiOS)\/(\d+)/;
const CHROME_VERSION_REGEX = /(?:Chrome|CriOS)\/(\d+)/;
const SAFARI_VERSION_REGEX = /Version\/(\d+)/;

function detectVisitorOs(ua: string): DetectedAgentTrait {
  if (ua.includes("iPhone") || ua.includes("iPad") || ua.includes("iPod")) {
    return { icon: SmartPhone01Icon, label: "iOS" };
  }
  if (ua.includes("Android")) {
    return { icon: AndroidIcon, label: "Android" };
  }
  if (ua.includes("Mac OS X") || ua.includes("Macintosh")) {
    return { icon: AppleIcon, label: "macOS" };
  }
  if (ua.includes("Windows NT") || ua.includes("Windows")) {
    return { icon: WindowsNewIcon, label: "Windows" };
  }
  if (ua.includes("CrOS")) {
    return { icon: ChromeIcon, label: "ChromeOS" };
  }
  if (ua.includes("Linux")) {
    return { icon: ComputerTerminal01Icon, label: "Linux" };
  }
  return { icon: ComputerIcon, label: "Unknown OS" };
}

function detectVisitorBrowser(ua: string): DetectedAgentTrait {
  const edgeMatch = EDGE_VERSION_REGEX.exec(ua);
  if (edgeMatch?.[1]) {
    return { icon: BrowserIcon, label: `Edge ${edgeMatch[1]}` };
  }

  const operaMatch = OPERA_VERSION_REGEX.exec(ua);
  if (operaMatch?.[1]) {
    return { icon: BrowserIcon, label: `Opera ${operaMatch[1]}` };
  }

  const firefoxMatch = FIREFOX_VERSION_REGEX.exec(ua);
  if (firefoxMatch?.[1]) {
    return { icon: BrowserIcon, label: `Firefox ${firefoxMatch[1]}` };
  }

  const chromeMatch = CHROME_VERSION_REGEX.exec(ua);
  if (chromeMatch?.[1]) {
    return { icon: ChromeIcon, label: `Chrome ${chromeMatch[1]}` };
  }

  if (ua.includes("Safari/")) {
    const safariMatch = SAFARI_VERSION_REGEX.exec(ua);
    return {
      icon: SafariIcon,
      label: safariMatch?.[1] ? `Safari ${safariMatch[1]}` : "Safari",
    };
  }

  if (ua.includes("curl/")) {
    return { icon: ComputerTerminal01Icon, label: "curl" };
  }

  if (ua.includes("PostmanRuntime/")) {
    return { icon: ComputerTerminal01Icon, label: "Postman" };
  }

  return { icon: BrowserIcon, label: "Browser" };
}

function describeVisitorUserAgent(
  rawUserAgent: string | undefined,
  isCurrentIp: boolean
): VisitorDeviceDescription | null {
  const fallbackUa =
    isCurrentIp && typeof navigator !== "undefined"
      ? navigator.userAgent
      : undefined;
  const ua = (rawUserAgent ?? fallbackUa)?.trim();
  if (!ua || ua.length === 0) {
    return null;
  }

  const browser = detectVisitorBrowser(ua);
  const os = detectVisitorOs(ua);
  return {
    browser: browser.label,
    browserIcon: browser.icon,
    os: os.label,
    osIcon: os.icon,
    raw: ua,
    summary: `${browser.label} · ${os.label}`,
  };
}

function getRouteLabelRegistry(messages: Messages): RouteLabelRegistry {
  return {
    about: messages.common.navAbout,
    "arkanoid-neon": messages.common.arkanoidNeonTitle,
    "build-your-town": messages.common.buildYourTownTitle,
    "chess-3d": messages.common.chess3dTitle,
    containers: "Containers",
    "cron-parser": messages.cronParser.title,
    "date-converter": messages.dateConverter.title,
    desktop: "Remote Desktop",
    "developer-tools": messages.developerTools.navigationGroup,
    "dynamite-mole": messages.common.dynamiteMoleTitle,
    emberwake: messages.common.emberwakeTitle,
    employees: messages.employees.title,
    endpoints: messages.common.navEndpoints,
    "fall-line": messages.common.fallLineTitle,
    files: "File Manager",
    games: messages.common.navFunGames,
    gravewake: messages.common.gravewakeTitle,
    hearthvale: messages.common.hearthvaleTitle,
    "hmac-generator": messages.hmacGenerator.title,
    "iso-8583": messages.common.navIso8583,
    "json-schema-validator": messages.jsonSchemaValidator.title,
    "json-text-diff": messages.jsonTextDiff.title,
    "json-yaml-converter": messages.jsonYamlConverter.title,
    "jwt-inspector": messages.jwtInspector.title,
    logs: messages.logViewer.title,
    "nova-lancer": messages.common.novaLancerTitle,
    "number-base-converter": messages.numberBaseConverter.title,
    overview: messages.common.navOverview,
    "pokemon-claude-red": messages.common.pokemonClaudeRedTitle,
    "ponpoko-kart": messages.common.ponpokoKartTitle,
    "qris-cpm-parser": messages.developerTools.qrisCpm.title,
    "qris-creator": messages.developerTools.qrisCreator.title,
    "qris-parser": messages.developerTools.qris.title,
    "qris-tap-parser": messages.developerTools.qrisTap.title,
    "qris-tap-reader": messages.qrisTapReader.menu,
    "rest-api": messages.common.navRestApi,
    "retry-backoff-calculator": messages.retryBackoffCalculator.title,
    "schedule-overlap-checker": messages.scheduleOverlapChecker.title,
    "server-metrics": messages.servers.metrics.title,
    servers: messages.servers.title,
    settings: messages.common.navSettings,
    "simulator-db": "ISOBillerSim",
    "socket-test": messages.common.navSocketTester,
    "socket-tester": messages.common.navSocketTester,
    "socks-relay": messages.common.navSocksRelay,
    sunbreak: messages.common.sunbreakTitle,
    "tcp-client": messages.common.navTcpClient,
    "tcp-server": messages.common.navTcpServer,
    "temp-files": messages.tempFiles.title,
    terminal: "Terminal",
    terrabrowser: messages.common.terrabrowserTitle,
    udp: messages.common.navUdp,
    users: messages.common.navUsers,
    wheel: messages.wheel.title,
    "yet-another-voxelcraft": messages.common.yetAnotherVoxelcraftTitle,
  };
}

function describeVisitorPage(
  rawPath: string | undefined,
  messages: Messages
): VisitorPageDescription {
  const path = rawPath?.startsWith("/") ? rawPath : "/dashboard/overview";
  const pathname = path.split("?")[0] ?? path;
  if (pathname === "/dashboard/logs" || pathname.startsWith("/logs/")) {
    return { isGame: false, label: messages.logViewer.title, path };
  }
  const segments = pathname
    .split("/")
    .filter((segment) => segment.length > 0 && segment !== "dashboard");
  const labels = getRouteLabelRegistry(messages);
  const isGame = segments[0] === "games" && segments.length > 1;

  if (segments.length === 0) {
    return {
      isGame: false,
      label: messages.common.navOverview,
      path: "/dashboard/overview",
    };
  }

  const mappedSegments = segments.map(
    (segment) =>
      labels[segment] ??
      segment
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
  );

  const label =
    mappedSegments.length > 1
      ? `${mappedSegments[0]} · ${mappedSegments.at(-1)}`
      : (mappedSegments[0] ?? messages.common.navOverview);

  return {
    isGame,
    label,
    path,
  };
}

const UNREAD_TITLE_PREFIX_REGEX = /^\(\d+\)\s+/;
const CHAT_FLASH_TITLE_PREFIX = "💬 ";

function stripUnreadTitlePrefix(rawTitle: string): string {
  const withoutFlash = rawTitle.startsWith(CHAT_FLASH_TITLE_PREFIX)
    ? rawTitle.slice(CHAT_FLASH_TITLE_PREFIX.length)
    : rawTitle;
  return withoutFlash.replace(UNREAD_TITLE_PREFIX_REGEX, "");
}

function useUnreadChatTabTitle(
  enabled: boolean,
  visitors: readonly DashboardVisitorPresence[],
  currentIp: string | undefined,
  copy: Messages["dashboardActivity"]["presence"]
): number {
  const totalUnreadCount = visitors.reduce(
    (sum, visitor) =>
      visitor.ipAddress === currentIp ? sum : sum + (visitor.unreadCount ?? 0),
    0
  );
  const latestUnreadSenderIp = visitors.find(
    (visitor) =>
      visitor.ipAddress !== currentIp && (visitor.unreadCount ?? 0) > 0
  )?.ipAddress;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const baseTitle = stripUnreadTitlePrefix(document.title);
    if (totalUnreadCount <= 0) {
      if (document.title !== baseTitle) {
        document.title = baseTitle;
      }
      return;
    }

    const countPrefixTitle = `(${totalUnreadCount}) ${baseTitle}`;
    const flashMessageTitle = latestUnreadSenderIp
      ? `${CHAT_FLASH_TITLE_PREFIX}${formatMessage(copy.chatToastIncomingTitle, { ip: latestUnreadSenderIp })}`
      : countPrefixTitle;

    document.title = countPrefixTitle;
    let showFlash = false;
    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        document.title = `(${totalUnreadCount}) ${stripUnreadTitlePrefix(document.title)}`;
        showFlash = false;
        return;
      }
      showFlash = !showFlash;
      document.title = showFlash ? flashMessageTitle : countPrefixTitle;
    }, 1400);

    return () => {
      window.clearInterval(intervalId);
      document.title = stripUnreadTitlePrefix(document.title);
    };
  }, [
    copy.chatToastIncomingTitle,
    enabled,
    latestUnreadSenderIp,
    totalUnreadCount,
  ]);

  return totalUnreadCount;
}

function OnlineVisitorsTriggerButton({
  triggerLabel,
  onlineCount,
  statusMode,
  totalUnreadCount,
}: {
  triggerLabel: string;
  onlineCount: number;
  statusMode: VisitorPresenceStatusMode;
  totalUnreadCount: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  let indicatorColorClass = "bg-success";
  if (totalUnreadCount > 0) {
    indicatorColorClass = "bg-primary";
  } else if (statusMode === "away") {
    indicatorColorClass = "bg-warning";
  } else if (statusMode === "offline") {
    indicatorColorClass = "bg-muted-foreground/50";
  }
  return (
    <DrawerTrigger asChild>
      <Button
        aria-label={triggerLabel}
        data-testid="online-visitors-trigger"
        size="sm-compact"
        title={triggerLabel}
        variant="ghost"
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            animate={{ opacity: 1, transform: "scale(1)" }}
            className="relative flex size-2 items-center justify-center"
            exit={{ opacity: 0, transform: "scale(0.95)" }}
            initial={{ opacity: 0, transform: "scale(0.95)" }}
            key={`${statusMode}-${totalUnreadCount > 0}`}
            transition={{
              duration: shouldReduceMotion
                ? MOTION_DURATION.instant
                : MOTION_DURATION.fast,
              ease: MOTION_EASE.out,
            }}
          >
            {statusMode !== "offline" && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none",
                  indicatorColorClass
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative inline-flex size-2 rounded-full",
                indicatorColorClass
              )}
            />
          </motion.span>
        </AnimatePresence>
        <HugeiconsIcon
          className="size-4 text-muted-foreground"
          icon={UserGroupIcon}
          strokeWidth={2}
        />
        <span className="font-mono font-semibold text-xs tabular-nums">
          {onlineCount}
        </span>
        {totalUnreadCount > 0 && (
          <Badge mono size="xs" variant="primary-subtle">
            {totalUnreadCount}
          </Badge>
        )}
      </Button>
    </DrawerTrigger>
  );
}

function VisitorsOverviewScrollView({
  copy,
  currentIp,
  history,
  locale,
  messages,
  nowMs,
  onlineCount,
  onlineVisitors,
  peakOnlineCount,
  recentVisitors,
  onNavigate,
  onOpenChat,
}: {
  copy: Messages["dashboardActivity"]["presence"];
  currentIp: string | undefined;
  history: readonly DashboardPresencePoint[];
  locale: AppLocale;
  messages: Messages;
  nowMs: number;
  onlineCount: number;
  onlineVisitors: readonly DashboardVisitorPresence[];
  peakOnlineCount: number;
  recentVisitors: readonly DashboardVisitorPresence[];
  onNavigate: () => void;
  onOpenChat: (targetIp: string) => void;
}) {
  return (
    <ScrollArea
      className="min-h-0 flex-1"
      contentClassName="min-w-0 max-w-full overflow-x-hidden"
      variant="fit"
      viewportClassName="overflow-x-hidden"
    >
      <div className="min-w-0 space-y-4 px-4 pb-4">
        <VisitorsSteamChart
          copy={copy}
          history={history}
          onlineCount={onlineCount}
          peakOnlineCount={peakOnlineCount}
        />

        <section className="min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              {copy.onlineSection}
            </h3>
            <span className="font-mono text-muted-foreground text-xs tabular-nums">
              {onlineVisitors.length}
            </span>
          </div>
          {onlineVisitors.length === 0 ? (
            <p className="rounded-lg border border-dashed px-3 py-3 text-center text-muted-foreground text-xs">
              {copy.emptyOnline}
            </p>
          ) : (
            <div className="min-w-0 divide-y overflow-hidden rounded-lg border bg-card">
              {onlineVisitors.map((visitor) => (
                <VisitorPresenceRow
                  copy={copy}
                  isCurrentIp={visitor.ipAddress === currentIp}
                  key={visitor.ipAddress}
                  locale={locale}
                  messages={messages}
                  nowMs={nowMs}
                  onNavigate={onNavigate}
                  onOpenChat={() => onOpenChat(visitor.ipAddress)}
                  visitor={visitor}
                />
              ))}
            </div>
          )}
        </section>

        <section className="min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              {copy.recentSection}
            </h3>
            <span className="font-mono text-muted-foreground text-xs tabular-nums">
              {recentVisitors.length}
            </span>
          </div>
          {recentVisitors.length === 0 ? (
            <p className="rounded-lg border border-dashed px-3 py-3 text-center text-muted-foreground text-xs">
              {copy.emptyRecent}
            </p>
          ) : (
            <div className="min-w-0 divide-y overflow-hidden rounded-lg border bg-card">
              {recentVisitors.map((visitor) => (
                <VisitorPresenceRow
                  copy={copy}
                  isCurrentIp={visitor.ipAddress === currentIp}
                  key={visitor.ipAddress}
                  locale={locale}
                  messages={messages}
                  nowMs={nowMs}
                  onNavigate={onNavigate}
                  onOpenChat={() => onOpenChat(visitor.ipAddress)}
                  visitor={visitor}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </ScrollArea>
  );
}

const visitorPaneVariants = {
  center: {
    opacity: 1,
    transform: "translateX(0%)",
  },
  enter: (direction: number) => ({
    opacity: 0,
    transform:
      direction === 0
        ? "translateX(0%)"
        : `translateX(${direction > 0 ? "7%" : "-7%"})`,
  }),
  exit: (direction: number) => ({
    opacity: 0,
    transform:
      direction === 0
        ? "translateX(0%)"
        : `translateX(${direction > 0 ? "-7%" : "7%"})`,
  }),
};

export function OnlineVisitorsDrawer({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideTrigger = false,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
} = {}) {
  const { locale, messages } = useI18n();
  const { snapshot } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const copy = messages.dashboardActivity.presence;
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedChatIp, setSelectedChatIp] = useState<string | null>(null);
  const [navDirection, setNavDirection] = useState(1);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [statusMode, setStatusMode] = useState<VisitorPresenceStatusMode>(() =>
    getStoredPresenceStatusMode()
  );

  useEffect(() => subscribePresenceStatusMode(setStatusMode), []);

  const isOpen = controlledOpen ?? internalOpen;
  const openChatWithIp = (targetIp: string) => {
    setNavDirection(1);
    setSelectedChatIp(targetIp);
  };
  const closeChatToAllVisitors = () => {
    setNavDirection(-1);
    setSelectedChatIp(null);
  };
  const handleOpenChange = (nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    if (!nextOpen) {
      setSelectedChatIp(null);
    }
    controlledOnOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (hideTrigger) {
      return;
    }
    return subscribeOpenVisitorChat((targetIp) => {
      setNavDirection(1);
      setSelectedChatIp(targetIp);
      setInternalOpen(true);
      controlledOnOpenChange?.(true);
    });
  }, [controlledOnOpenChange, hideTrigger]);

  useEffect(() => {
    if (hideTrigger) {
      return;
    }
    setActiveVisitorChatTargetIp(isOpen ? selectedChatIp : null);
    return () => {
      setActiveVisitorChatTargetIp(null);
    };
  }, [hideTrigger, isOpen, selectedChatIp]);

  const presenceQuery = useQuery({
    queryKey: DASHBOARD_PRESENCE_QUERY_KEY,
    queryFn: () => fetchDashboardPresence(),
    enabled: snapshot.isAuthenticated,
    refetchInterval: isOpen ? 15_000 : 60_000,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  const presence = presenceQuery.data;
  const currentIp = presence?.currentIp;
  const rawVisitors = presence?.visitors ?? [];
  const visitors = rawVisitors.map((visitor) => {
    if (visitor.ipAddress !== currentIp) {
      return visitor;
    }
    return {
      ...visitor,
      online: statusMode !== "offline",
      sleeping: statusMode === "away",
    };
  });
  const totalUnreadCount = useUnreadChatTabTitle(
    !hideTrigger && snapshot.isAuthenticated,
    visitors,
    currentIp,
    copy
  );
  const onlineVisitors = visitors.filter((visitor) => visitor.online);
  const recentVisitors = visitors.filter((visitor) => !visitor.online);
  const minSelfOnline =
    snapshot.isAuthenticated && statusMode !== "offline" ? 1 : 0;
  const onlineCount = Math.max(onlineVisitors.length, minSelfOnline);
  const peakOnlineCount = Math.max(
    presence?.peakOnlineCount ?? onlineCount,
    onlineCount
  );
  const history = presence?.history ?? [];
  const triggerLabel = formatMessage(copy.triggerLabel, {
    count: onlineCount,
  });
  const selectedVisitor = selectedChatIp
    ? visitors.find((v) => v.ipAddress === selectedChatIp)
    : undefined;
  const effectiveDirection = shouldReduceMotion ? 0 : navDirection;
  const handleStatusModeChange = (nextMode: VisitorPresenceStatusMode) => {
    if (nextMode === statusMode) {
      return;
    }
    setStoredPresenceStatusMode(nextMode);
    let statusLabel = copy.onlineBadge;
    let description = copy.statusChangedOnlineDesc;
    let dotClass = "bg-success";
    let pingClass: string | null = "bg-success";
    if (nextMode === "away") {
      statusLabel = copy.awayBadge;
      description = copy.statusChangedAwayDesc;
      dotClass = "bg-warning";
      pingClass = null;
    } else if (nextMode === "offline") {
      statusLabel = copy.offlineBadge;
      description = copy.statusChangedOfflineDesc;
      dotClass = "bg-muted-foreground/50";
      pingClass = null;
    }
    toast(formatMessage(copy.statusChangedTitle, { status: statusLabel }), {
      description,
      duration: 3200,
      icon: (
        <span className="relative flex size-2.5 items-center justify-center">
          {pingClass && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none",
                pingClass
              )}
            />
          )}
          <span
            aria-hidden="true"
            className={cn("relative inline-flex size-2 rounded-full", dotClass)}
          />
        </span>
      ),
      id: "presence-status-mode-toast",
    });
  };

  return (
    <Drawer direction="right" onOpenChange={handleOpenChange} open={isOpen}>
      {!hideTrigger && (
        <OnlineVisitorsTriggerButton
          onlineCount={onlineCount}
          statusMode={statusMode}
          totalUnreadCount={totalUnreadCount}
          triggerLabel={triggerLabel}
        />
      )}
      <DrawerContent className="overflow-hidden" showSwipeHandle={false}>
        <DrawerHeader
          className={selectedChatIp ? "sr-only" : undefined}
          size="compact"
        >
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle size="sm">
              {selectedChatIp
                ? formatMessage(copy.chatWithTitle, { ip: selectedChatIp })
                : copy.title}
            </DrawerTitle>
            <Badge mono size="xs" variant="success">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-success"
              />
              {onlineCount} {copy.onlineBadge.toLowerCase()}
            </Badge>
          </div>
          <DrawerDescription className="sr-only" size="xs">
            {copy.description}
          </DrawerDescription>
          {currentIp && currentIp !== "unknown" && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {copy.currentIpLabel}
                </span>
                <span className="font-medium font-mono text-foreground">
                  {currentIp}
                </span>
              </div>
              <fieldset
                aria-label={copy.statusSelectorLabel}
                className="m-0 inline-flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5"
              >
                {(
                  [
                    {
                      dotClass: "bg-success",
                      label: copy.onlineBadge,
                      value: "online",
                    },
                    {
                      dotClass: "bg-warning",
                      label: copy.awayBadge,
                      value: "away",
                    },
                    {
                      dotClass: "bg-muted-foreground/50",
                      label: copy.offlineBadge,
                      value: "offline",
                    },
                  ] as const
                ).map((option) => {
                  const active = statusMode === option.value;
                  return (
                    <motion.button
                      aria-pressed={active}
                      className={cn(
                        "relative inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-medium text-xs transition-colors",
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      key={option.value}
                      onClick={() => handleStatusModeChange(option.value)}
                      transition={{
                        duration: shouldReduceMotion
                          ? MOTION_DURATION.instant
                          : MOTION_DURATION.press,
                        ease: MOTION_EASE.out,
                      }}
                      type="button"
                      whileTap={
                        shouldReduceMotion ? undefined : { scale: 0.97 }
                      }
                    >
                      {active && (
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-0 rounded-md bg-background shadow-2xs"
                          layoutId="presence-status-active-pill"
                          transition={
                            shouldReduceMotion
                              ? { duration: MOTION_DURATION.instant }
                              : MOTION_SPRING.snappy
                          }
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "relative z-10 size-1.5 rounded-full transition-transform duration-150 ease-out",
                          option.dotClass,
                          active ? "scale-110" : "scale-90 opacity-75"
                        )}
                      />
                      <span className="relative z-10">{option.label}</span>
                    </motion.button>
                  );
                })}
              </fieldset>
            </div>
          )}
        </DrawerHeader>
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <AnimatePresence
            custom={effectiveDirection}
            initial={false}
            mode="popLayout"
          >
            {selectedChatIp ? (
              <motion.div
                animate="center"
                className="flex min-h-0 flex-1 flex-col"
                custom={effectiveDirection}
                exit="exit"
                initial="enter"
                key={`chat-${selectedChatIp}`}
                transition={{
                  duration: MOTION_DURATION.standard,
                  ease: MOTION_EASE.out,
                }}
                variants={visitorPaneVariants}
              >
                <VisitorIpChatPanel
                  copy={copy}
                  currentIp={currentIp ?? "unknown"}
                  nowMs={nowMs}
                  onBack={closeChatToAllVisitors}
                  targetIp={selectedChatIp}
                  visitor={selectedVisitor}
                />
              </motion.div>
            ) : (
              <motion.div
                animate="center"
                className="flex min-h-0 flex-1 flex-col"
                custom={effectiveDirection}
                exit="exit"
                initial="enter"
                key="visitors-overview"
                transition={{
                  duration: MOTION_DURATION.standard,
                  ease: MOTION_EASE.out,
                }}
                variants={visitorPaneVariants}
              >
                <VisitorsOverviewScrollView
                  copy={copy}
                  currentIp={currentIp}
                  history={history}
                  locale={locale}
                  messages={messages}
                  nowMs={nowMs}
                  onlineCount={onlineCount}
                  onlineVisitors={onlineVisitors}
                  onNavigate={() => handleOpenChange(false)}
                  onOpenChat={openChatWithIp}
                  peakOnlineCount={peakOnlineCount}
                  recentVisitors={recentVisitors}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <DrawerFooter size="compact" variant="bordered">
          <DrawerClose asChild>
            <Button size="sm" variant="outline">
              {messages.common.close}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const steamChartDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Jakarta",
  year: "numeric",
});

function formatSteamChartTimestamp(isoString: string): string {
  const parsed = Date.parse(isoString);
  if (Number.isNaN(parsed)) {
    return isoString;
  }
  return steamChartDateTimeFormatter.format(new Date(parsed));
}

function getChartBarToneClass(value: number, isHovered: boolean): string {
  if (value > 0) {
    return isHovered ? "bg-primary" : "bg-primary/75";
  }
  return isHovered ? "bg-muted-foreground/45" : "bg-muted-foreground/20";
}

function getHoveredValue(
  hoveredPoint: DashboardPresencePoint | undefined,
  hoveredIndex: number | null,
  totalBars: number,
  onlineCount: number
): number {
  if (!hoveredPoint || hoveredIndex === null) {
    return 0;
  }
  if (hoveredIndex === totalBars - 1) {
    return Math.max(hoveredPoint.onlineCount, onlineCount);
  }
  return hoveredPoint.onlineCount;
}

function VisitorsSteamChart({
  history,
  onlineCount,
  peakOnlineCount,
  copy,
}: {
  history: readonly DashboardPresencePoint[];
  onlineCount: number;
  peakOnlineCount: number;
  copy: Messages["dashboardActivity"]["presence"];
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const barCount = 36;
  const nowBucketMs = Math.floor(Date.now() / 900_000) * 900_000;
  const recentPoints =
    history.length >= barCount
      ? history.slice(-barCount)
      : [
          ...Array.from(
            { length: barCount - history.length },
            (_, idx): DashboardPresencePoint => {
              const offsetBuckets = barCount - history.length - idx;
              const baseTimeMs =
                history.length > 0
                  ? Date.parse(history[0].timestamp)
                  : nowBucketMs;
              const bucketMs =
                (Number.isNaN(baseTimeMs) ? nowBucketMs : baseTimeMs) -
                offsetBuckets * 900_000;
              return {
                onlineCount: 0,
                timestamp: new Date(bucketMs).toISOString(),
              };
            }
          ),
          ...history,
        ];

  const maxValue = Math.max(
    peakOnlineCount,
    onlineCount,
    ...recentPoints.map((point) => point.onlineCount),
    1
  );
  const peakRatio = Math.min(
    100,
    Math.max(12, (peakOnlineCount / maxValue) * 100)
  );

  const hoveredPoint =
    hoveredIndex === null ? undefined : recentPoints[hoveredIndex];
  const hoveredValue = getHoveredValue(
    hoveredPoint,
    hoveredIndex,
    recentPoints.length,
    onlineCount
  );
  const hoveredRatio =
    hoveredIndex === null
      ? 50
      : ((hoveredIndex + 0.5) / recentPoints.length) * 100;

  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-lg border bg-muted/25 p-2">
      <div className="flex items-center justify-between gap-2 text-muted-foreground text-xs">
        <span>{copy.chartTitle}</span>
        <span className="flex items-center gap-3">
          <span>
            {copy.peakOnlineLabel}{" "}
            <strong className="font-mono text-foreground">
              {peakOnlineCount}
            </strong>
          </span>
          <span>
            {copy.onlineNowLabel}{" "}
            <strong className="font-mono text-foreground">{onlineCount}</strong>
          </span>
        </span>
      </div>
      <div className="relative h-32 w-full overflow-hidden rounded border bg-background/60 px-1.5 pt-2.5 pb-1">
        <div className="pointer-events-none absolute inset-x-1.5 top-2.5 bottom-1 flex flex-col justify-between">
          <div className="border-border/50 border-t" />
          <div className="border-border/40 border-t" />
          <div className="border-border/30 border-t" />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1.5 bottom-[var(--peak-ratio)] border-success/70 border-t border-dashed"
          // SAFETY: CSS custom property for dynamic peak line offset
          style={{ "--peak-ratio": `${peakRatio}%` } as CSSProperties}
        />

        {hoveredIndex !== null && hoveredPoint && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 bottom-0 left-[var(--cursor-x)] w-px -translate-x-1/2 bg-foreground/75"
              // SAFETY: CSS custom property for Steam-style cursor x-coordinate
              style={{ "--cursor-x": `${hoveredRatio}%` } as CSSProperties}
            />
            <div className="pointer-events-none absolute inset-x-1.5 top-1 z-10 flex justify-center">
              <div className="max-w-full truncate rounded border bg-popover/95 px-1.5 py-0.5 font-mono text-popover-foreground text-xs shadow-md backdrop-blur">
                {formatMessage(copy.chartHoverLabel, {
                  count: hoveredValue,
                  time: formatSteamChartTimestamp(hoveredPoint.timestamp),
                })}
              </div>
            </div>
          </>
        )}

        <div className="relative flex h-full w-full min-w-0 items-end justify-between gap-px">
          {recentPoints.map((point, index) => {
            const isLatest = index === recentPoints.length - 1;
            const isHovered = hoveredIndex === index;
            const value = isLatest
              ? Math.max(point.onlineCount, onlineCount)
              : point.onlineCount;
            const heightPercent =
              value > 0
                ? Math.max(14, Math.round((value / maxValue) * 100))
                : 6;
            const label = formatMessage(copy.chartHoverLabel, {
              count: value,
              time: formatSteamChartTimestamp(point.timestamp),
            });

            return (
              <button
                aria-label={label}
                className="flex h-full min-w-0 flex-1 cursor-crosshair items-end bg-transparent p-0 focus:outline-none"
                key={point.timestamp || `empty-${index}`}
                onBlur={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() =>
                  setHoveredIndex((current) =>
                    current === index ? null : current
                  )
                }
                type="button"
              >
                <span
                  className={cn(
                    "block h-[var(--bar-height)] w-full rounded-t-xs transition-all duration-150",
                    getChartBarToneClass(value, isHovered)
                  )}
                  // SAFETY: CSS custom property for dynamic bar height
                  style={
                    { "--bar-height": `${heightPercent}%` } as CSSProperties
                  }
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function resolveVisitorStatusAppearance(
  online: boolean,
  sleeping: boolean,
  copy: Messages["dashboardActivity"]["presence"]
) {
  if (online && sleeping) {
    return {
      activityIconColorClass: "text-warning",
      statusBadgeText: copy.sleepingBadge,
      statusDotClass: "bg-warning",
      statusTextClass: "text-warning",
    };
  }
  if (online) {
    return {
      activityIconColorClass: "text-primary",
      statusBadgeText: copy.onlineBadge,
      statusDotClass: "bg-success",
      statusTextClass: "text-success",
    };
  }
  return {
    activityIconColorClass: "text-muted-foreground",
    statusBadgeText: copy.offlineBadge,
    statusDotClass: "bg-muted-foreground/40",
    statusTextClass: "text-muted-foreground",
  };
}

function resolveVisitorActivityText(
  visitor: DashboardVisitorPresence,
  pageInfo: VisitorPageDescription,
  copy: Messages["dashboardActivity"]["presence"]
): string {
  if (visitor.online && visitor.sleeping) {
    return formatMessage(copy.sleepingPageLabel, { page: pageInfo.label });
  }
  if (visitor.online) {
    return formatMessage(
      pageInfo.isGame ? copy.playingGameLabel : copy.viewingPageLabel,
      { page: pageInfo.label }
    );
  }
  return formatMessage(copy.lastVisitedPageLabel, { page: pageInfo.label });
}

function VisitorPresenceRow({
  visitor,
  isCurrentIp,
  nowMs,
  locale,
  messages,
  copy,
  onNavigate,
  onOpenChat,
}: {
  visitor: DashboardVisitorPresence;
  isCurrentIp: boolean;
  nowMs: number;
  locale: AppLocale;
  messages: Messages;
  copy: Messages["dashboardActivity"]["presence"];
  onNavigate: () => void;
  onOpenChat: () => void;
}) {
  const formattedAbsolute = formatJakartaTimestamp(visitor.lastSeenAt);
  const relativeTime = formatRelativeLastSeen(
    visitor.lastSeenAt,
    nowMs,
    locale
  );
  const sessionText =
    visitor.activeConnections > 1
      ? formatMessage(copy.activeSessions, {
          count: visitor.activeConnections,
        })
      : copy.activeSessionSingle;
  const { snapshot } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const basePageInfo = describeVisitorPage(visitor.currentPath, messages);
  const visitorUrl = new URL(basePageInfo.path, "https://presence.local");
  let sourceId: string | null = null;
  if (visitorUrl.pathname === "/dashboard/logs") {
    sourceId = visitorUrl.searchParams.get("source");
  } else if (visitorUrl.pathname.startsWith("/logs/")) {
    sourceId = visitorUrl.pathname.slice("/logs/".length);
  }
  const logSources = useQuery({
    queryKey: ["log-sources"],
    queryFn: ({ signal }) => fetchLogSources(signal),
    enabled: Boolean(sourceId) && snapshot.user?.role === "ADMIN",
    staleTime: 30_000,
    retry: false,
  });
  const logSource = logSources.data?.find((source) => source.id === sourceId);
  const pageInfo = {
    ...basePageInfo,
    label: logSource
      ? `${messages.logViewer.title} · ${logSource.name}`
      : basePageInfo.label,
  };
  const deviceInfo = describeVisitorUserAgent(visitor.userAgent, isCurrentIp);
  const isSleeping = visitor.online && visitor.sleeping;
  const activityText = resolveVisitorActivityText(visitor, pageInfo, copy);
  const {
    activityIconColorClass,
    statusBadgeText,
    statusDotClass,
    statusTextClass,
  } = resolveVisitorStatusAppearance(visitor.online, visitor.sleeping, copy);
  const unreadCount = visitor.unreadCount ?? 0;

  return (
    <div className="min-w-0 space-y-1.5 px-3 py-2.5">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              animate={{ opacity: 1, transform: "scale(1)" }}
              aria-hidden="true"
              className={cn("size-2 shrink-0 rounded-full", statusDotClass)}
              exit={{ opacity: 0, transform: "scale(0.95)" }}
              initial={{ opacity: 0, transform: "scale(0.95)" }}
              key={statusBadgeText}
              transition={{
                duration: shouldReduceMotion
                  ? MOTION_DURATION.instant
                  : MOTION_DURATION.fast,
                ease: MOTION_EASE.out,
              }}
            />
          </AnimatePresence>
          <HugeiconsIcon
            className="size-3.5 shrink-0 text-muted-foreground"
            icon={GlobeIcon}
            strokeWidth={2}
          />
          <span className="truncate font-medium font-mono text-xs">
            {visitor.ipAddress}
          </span>
          {isCurrentIp && (
            <Badge size="xs" variant="primary-subtle">
              {copy.youBadge}
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              className={cn(
                "inline-block font-medium text-xs",
                statusTextClass
              )}
              exit={{ opacity: 0, transform: "translateY(-2px)" }}
              initial={{ opacity: 0, transform: "translateY(2px)" }}
              key={statusBadgeText}
              transition={{
                duration: shouldReduceMotion
                  ? MOTION_DURATION.instant
                  : MOTION_DURATION.fast,
                ease: MOTION_EASE.out,
              }}
            >
              {statusBadgeText}
            </motion.span>
          </AnimatePresence>
          {!isCurrentIp && (
            <Button
              aria-label={`${copy.chatActionLabel} ${visitor.ipAddress}`}
              onClick={onOpenChat}
              size="xs"
              type="button"
              variant={unreadCount > 0 ? "default" : "outline"}
            >
              <HugeiconsIcon
                className="size-3"
                icon={MessageSquareCodeIcon}
                strokeWidth={2}
              />
              <span>{copy.chatActionLabel}</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-background/20 px-1 font-mono text-xs tabular-nums">
                  {unreadCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {!isSleeping && (
        <div className="min-w-0 pl-3.5">
          <Link
            className="inline-flex min-w-0 max-w-full items-center gap-1 text-foreground/90 text-xs transition-colors hover:text-primary"
            onClick={onNavigate}
            title={activityText}
            to={pageInfo.path}
          >
            <HugeiconsIcon
              className={cn("size-3 shrink-0", activityIconColorClass)}
              icon={Activity01Icon}
              strokeWidth={2}
            />
            <span className="truncate font-medium underline-offset-2 hover:underline">
              {activityText}
            </span>
          </Link>
        </div>
      )}

      {deviceInfo && (
        <div
          className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 pl-3.5 text-muted-foreground text-xs"
          title={deviceInfo.raw}
        >
          <span className="inline-flex items-center gap-1">
            <HugeiconsIcon
              className="size-3 shrink-0"
              icon={deviceInfo.browserIcon}
              strokeWidth={2}
            />
            <span>{deviceInfo.browser}</span>
          </span>
          <span aria-hidden="true" className="text-border">
            ·
          </span>
          <span className="inline-flex items-center gap-1">
            <HugeiconsIcon
              className="size-3 shrink-0"
              icon={deviceInfo.osIcon}
              strokeWidth={2}
            />
            <span>{deviceInfo.os}</span>
          </span>
        </div>
      )}

      <div className="space-y-0.5 pl-3.5 text-muted-foreground text-xs">
        <div className="flex items-center gap-1.5">
          <HugeiconsIcon
            className="size-3 shrink-0"
            icon={Clock03Icon}
            strokeWidth={2}
          />
          <span>
            {visitor.online
              ? `${isSleeping ? copy.sleepingNowLabel : copy.activeNowLabel} · ${sessionText}`
              : formatMessage(copy.lastOnlineLabel, { time: relativeTime })}
          </span>
        </div>
        <p className="pl-4 font-mono text-muted-foreground/75">
          {formattedAbsolute}
        </p>
      </div>
    </div>
  );
}

function ChatMessageDeliveryReceipt({
  message,
  copy,
}: {
  message: DashboardIpChatMessage;
  copy: Messages["dashboardActivity"]["presence"];
}) {
  if (message.pending) {
    return (
      <span
        aria-label={copy.chatReceiptPendingLabel}
        className="inline-flex items-center text-muted-foreground/70"
        role="img"
        title={copy.chatReceiptPendingLabel}
      >
        <HugeiconsIcon className="size-3.5" icon={Tick02Icon} strokeWidth={2} />
      </span>
    );
  }

  if (message.readAt) {
    return (
      <span
        aria-label={copy.chatReceiptReadLabel}
        className="inline-flex items-center text-info"
        role="img"
        title={copy.chatReceiptReadLabel}
      >
        <HugeiconsIcon
          className="size-3.5"
          icon={TickDouble02Icon}
          strokeWidth={2.2}
        />
      </span>
    );
  }

  return (
    <span
      aria-label={copy.chatReceiptSentLabel}
      className="inline-flex items-center text-muted-foreground/80"
      role="img"
      title={copy.chatReceiptSentLabel}
    >
      <HugeiconsIcon
        className="size-3.5"
        icon={TickDouble02Icon}
        strokeWidth={2}
      />
    </span>
  );
}

function ChatRedactedMessageContent({
  message,
  isRedacted,
}: {
  message: string;
  isRedacted: boolean;
}) {
  const [clickedReveal, setClickedReveal] = useState(false);
  const { messages } = useI18n();
  const stickerId = parseChatSticker(message);
  const content = stickerId ? (
    <img
      alt={messages.dashboardActivity.presence.stickers.labels[stickerId]}
      className="aspect-square w-full max-w-full object-contain"
      decoding="async"
      height={224}
      src={getChatStickerSrc(stickerId)}
      width={224}
    />
  ) : (
    <span className="whitespace-pre-wrap">{message}</span>
  );

  // If redaction is disabled for this chat, display standard text
  if (!isRedacted) {
    return <BubbleContent variant="visitor">{content}</BubbleContent>;
  }

  return (
    <BubbleContent variant="visitor">
      <button
        className="chat-redacted-bubble w-full text-left"
        data-revealed={clickedReveal}
        onClick={() => setClickedReveal((prev) => !prev)}
        type="button"
      >
        <span className="chat-redacted-text block">{content}</span>
        <span aria-hidden="true" className="chat-redacted-dust">
          <span />
          <span />
        </span>
      </button>
    </BubbleContent>
  );
}

function VisitorIpChatPanel({
  nowMs,
  targetIp,
  currentIp,
  visitor,
  copy,
  onBack,
}: {
  nowMs: number;
  targetIp: string;
  currentIp: string;
  visitor: DashboardVisitorPresence | undefined;
  copy: Messages["dashboardActivity"]["presence"];
  onBack: () => void;
}) {
  const { locale } = useI18n();
  const [action, setAction] = useState<VisitorChatAction | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const setPanelRef = useCallback((node: HTMLDivElement | null) => {
    setPortalContainer(
      node?.closest<HTMLElement>('[data-slot="drawer-content"]') ?? null
    );
  }, []);
  const deleteMutation = useMutation({
    mutationFn: async (selection: VisitorChatAction) => {
      if (selection.type === "info") {
        return;
      }
      const messageId =
        selection.type === "delete" ? selection.message.id : undefined;
      await queryClient.cancelQueries({
        queryKey: dashboardChatThreadQueryKey(targetIp),
      });
      const deletedIds = await deleteDashboardChatMessages(targetIp, messageId);
      queryClient.setQueryData<DashboardIpChatThread | null>(
        dashboardChatThreadQueryKey(targetIp),
        (thread) =>
          thread
            ? {
                ...thread,
                messages: thread.messages.filter(
                  (message) => !deletedIds.includes(message.id)
                ),
              }
            : thread
      );
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_PRESENCE_QUERY_KEY,
      });
    },
    onSuccess: () => setAction(null),
  });
  const selectAction = (selection: VisitorChatAction) => {
    deleteMutation.reset();
    setAction(selection);
  };
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const optimisticIdRef = useRef(-1);

  // Per-partner privacy redaction toggle, persisted per IP in localStorage
  const [isRedacted, setIsRedacted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`chat-privacy-blur:${targetIp}`) === "true";
    } catch {
      return false;
    }
  });

  const toggleRedaction = () => {
    setIsRedacted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`chat-privacy-blur:${targetIp}`, String(next));
      } catch {
        // Ignore localStorage error
      }
      return next;
    });
  };

  const threadQuery = useQuery({
    queryKey: dashboardChatThreadQueryKey(targetIp),
    queryFn: async () => {
      const thread = await fetchDashboardChatThread(targetIp);
      queryClient.setQueryData<DashboardPresenceSnapshot | null>(
        DASHBOARD_PRESENCE_QUERY_KEY,
        (previous) => {
          if (!previous) {
            return previous;
          }
          return {
            ...previous,
            visitors: previous.visitors.map((v) =>
              v.ipAddress === targetIp ? { ...v, unreadCount: 0 } : v
            ),
          };
        }
      );
      return thread;
    },
    refetchInterval: 10_000,
    staleTime: 0,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => sendDashboardChatMessage(targetIp, text),
    onMutate: (text) => {
      const tempId = optimisticIdRef.current;
      optimisticIdRef.current -= 1;
      const optimisticMessage: DashboardIpChatMessage = {
        createdAt: new Date().toISOString(),
        id: tempId,
        message: text,
        pending: true,
        recipientIp: targetIp,
        senderIp: currentIp,
        senderUsername: "you",
      };
      queryClient.setQueryData<DashboardIpChatThread | null>(
        dashboardChatThreadQueryKey(targetIp),
        (previous) => {
          if (!previous) {
            return {
              currentIp,
              messages: [optimisticMessage],
              targetIp,
            };
          }
          return {
            ...previous,
            messages: [...previous.messages, optimisticMessage],
          };
        }
      );
      return { tempId };
    },
    onError: (_err, _text, context) => {
      if (!context) {
        return;
      }
      queryClient.setQueryData<DashboardIpChatThread | null>(
        dashboardChatThreadQueryKey(targetIp),
        (previous) => {
          if (!previous) {
            return previous;
          }
          return {
            ...previous,
            messages: previous.messages.filter((m) => m.id !== context.tempId),
          };
        }
      );
    },
    onSuccess: (sent, _text, context) => {
      if (!sent) {
        return;
      }
      queryClient.setQueryData<DashboardIpChatThread | null>(
        dashboardChatThreadQueryKey(targetIp),
        (previous) => {
          if (!previous) {
            return {
              currentIp,
              messages: [sent],
              targetIp,
            };
          }
          const withoutTemp = context
            ? previous.messages.filter((m) => m.id !== context.tempId)
            : previous.messages;
          if (withoutTemp.some((existing) => existing.id === sent.id)) {
            return {
              ...previous,
              messages: withoutTemp,
            };
          }
          return {
            ...previous,
            messages: [...withoutTemp, sent],
          };
        }
      );
      queryClient.setQueryData<DashboardPresenceSnapshot | null>(
        DASHBOARD_PRESENCE_QUERY_KEY,
        (previous) => {
          if (!previous) {
            return previous;
          }
          return {
            ...previous,
            visitors: previous.visitors.map((v) =>
              v.ipAddress === targetIp
                ? {
                    ...v,
                    lastChatAt: sent.createdAt,
                    lastChatMessage: sent.message,
                    lastChatSenderIp: sent.senderIp,
                  }
                : v
            ),
          };
        }
      );
    },
  });

  const chatMessages: readonly DashboardIpChatMessage[] =
    threadQuery.data?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    if (chatMessages.some((m) => m.senderIp === targetIp && !m.readAt)) {
      markDashboardChatRead(targetIp).catch(() => undefined);
      queryClient.setQueryData<DashboardPresenceSnapshot | null>(
        DASHBOARD_PRESENCE_QUERY_KEY,
        (previous) => {
          if (!previous) {
            return previous;
          }
          return {
            ...previous,
            visitors: previous.visitors.map((v) =>
              v.ipAddress === targetIp ? { ...v, unreadCount: 0 } : v
            ),
          };
        }
      );
    }
  }, [chatMessages, targetIp]);

  const isOnline = visitor?.online ?? false;
  const isSleeping = isOnline && Boolean(visitor?.sleeping);
  let statusLabel = copy.offlineBadge;
  let statusDotClass = "bg-muted-foreground/40";
  let statusTextClass = "text-muted-foreground";
  if (isSleeping) {
    statusLabel = copy.sleepingBadge;
    statusDotClass = "bg-warning";
    statusTextClass = "text-warning";
  } else if (isOnline) {
    statusLabel = copy.onlineBadge;
    statusDotClass = "bg-success";
    statusTextClass = "text-success";
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || sendMutation.isPending) {
      return;
    }
    setDraft("");
    sendMutation.mutate(trimmed);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" ref={setPanelRef}>
      <VisitorChatActionDialog
        action={action}
        container={portalContainer}
        error={
          deleteMutation.error ? getErrorMessage(deleteMutation.error) : null
        }
        onClose={() => setAction(null)}
        onDelete={() => {
          if (action) {
            deleteMutation.mutate(action);
          }
        }}
        pending={deleteMutation.isPending}
      />
      <div className="flex shrink-0 items-center gap-2 border-b bg-muted/20 px-3 py-2">
        <Button
          aria-label={copy.chatBackLabel}
          onClick={onBack}
          size="icon-xs"
          title={copy.chatBackLabel}
          type="button"
          variant="ghost"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
        <div
          className="flex min-w-0 flex-1 items-center gap-1.5 text-xs"
          title={statusLabel}
        >
          <span
            aria-hidden="true"
            className={cn("size-1.5 shrink-0 rounded-full", statusDotClass)}
          />
          <span className="truncate font-medium font-mono">{targetIp}</span>
          <span className={cn("shrink-0", statusTextClass)}>{statusLabel}</span>
        </div>
        <Button
          aria-label={copy.chatClearAll}
          disabled={
            chatMessages.length === 0 ||
            sendMutation.isPending ||
            deleteMutation.isPending
          }
          onClick={() => selectAction({ type: "clear" })}
          size="icon-xs"
          title={copy.chatClearAll}
          type="button"
          variant="ghost"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
        </Button>
        <Button
          aria-label={copy.chatRedactionToggleLabel}
          aria-pressed={isRedacted}
          onClick={toggleRedaction}
          size="icon-xs"
          title={copy.chatRedactionToggleLabel}
          type="button"
          variant={isRedacted ? "secondary" : "ghost"}
        >
          <HugeiconsIcon
            icon={isRedacted ? ViewOffIcon : ViewIcon}
            strokeWidth={2}
          />
        </Button>
      </div>

      <p className="flex shrink-0 items-center justify-center gap-1.5 px-3 py-1.5 text-muted-foreground text-xs">
        <HugeiconsIcon
          aria-hidden="true"
          className="size-3 shrink-0"
          icon={LockKeyIcon}
          strokeWidth={2}
        />
        <span>{copy.chatEncryptionNotice}</span>
      </p>

      {chatMessages.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-8">
          <Empty size="compact" variant="plain">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={MessageSquareCodeIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyDescription>
                {formatMessage(copy.chatEmptyState, { ip: targetIp })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <ScrollArea
          className="min-h-0 flex-1"
          contentClassName="min-w-0 max-w-full overflow-x-hidden"
          variant="fit"
          viewportClassName="overflow-x-hidden"
        >
          <div className="flex flex-col gap-4 px-4 py-5">
            {chatMessages.map((msg, index) => {
              const isMine = msg.senderIp === currentIp;
              return (
                <Fragment key={msg.id}>
                  {index === 0 ||
                  getChatDay(msg.createdAt) !==
                    getChatDay(chatMessages[index - 1].createdAt) ? (
                    <div className="flex justify-center py-2">
                      <Badge variant="secondary">
                        {formatChatDay(msg.createdAt, nowMs, locale, copy)}
                      </Badge>
                    </div>
                  ) : null}
                  <Message align={isMine ? "end" : "start"}>
                    <MessageContent>
                      <VisitorChatMessageActions
                        message={msg}
                        onAction={selectAction}
                      >
                        <Bubble
                          align={isMine ? "end" : "start"}
                          className={cn(
                            "max-w-[85%]",
                            parseChatSticker(msg.message) ? "w-60" : "w-max"
                          )}
                          variant={isMine ? "default" : "muted"}
                        >
                          <ChatRedactedMessageContent
                            isRedacted={isRedacted}
                            message={msg.message}
                          />
                          <div
                            className={cn(
                              "flex items-center gap-1 whitespace-nowrap px-1 font-mono text-muted-foreground/80 text-xs",
                              isMine && "self-end text-right"
                            )}
                          >
                            <span>{formatChatTime(msg.createdAt)}</span>
                            {isMine && (
                              <ChatMessageDeliveryReceipt
                                copy={copy}
                                message={msg}
                              />
                            )}
                          </div>
                        </Bubble>
                      </VisitorChatMessageActions>
                    </MessageContent>
                  </Message>
                </Fragment>
              );
            })}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      )}

      <form
        className="flex items-center gap-2 border-t bg-card/60 px-3 py-2"
        onSubmit={handleSubmit}
      >
        <ScrollArea className="h-9 min-w-0 flex-1" variant="chat">
          <Textarea
            aria-describedby="visitor-chat-input-hint"
            aria-label={formatMessage(copy.chatInputPlaceholder, {
              ip: targetIp,
            })}
            autoFocus
            maxLength={500}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={formatMessage(copy.chatInputPlaceholder, {
              ip: targetIp,
            })}
            rows={1}
            size="chat"
            value={draft}
            variant="ghost"
          />
        </ScrollArea>
        <VisitorChatStickerPicker
          disabled={sendMutation.isPending}
          onSelect={(id) => sendMutation.mutate(encodeChatSticker(id))}
        />
        <Button
          aria-label={copy.chatSendLabel}
          disabled={!draft.trim() || sendMutation.isPending}
          size="chat-send"
          type="submit"
        >
          <HugeiconsIcon
            className="size-3.5"
            icon={MailSend01Icon}
            strokeWidth={2}
          />
          <span>{copy.chatSendLabel}</span>
        </Button>
      </form>
      <p
        className="px-4 pb-2 text-muted-foreground text-xs"
        id="visitor-chat-input-hint"
      >
        {copy.chatInputHint}
      </p>
    </div>
  );
}
