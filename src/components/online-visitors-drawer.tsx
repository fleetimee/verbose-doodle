import {
  Activity01Icon,
  AndroidIcon,
  AppleIcon,
  BrowserIcon,
  ChromeIcon,
  Clock03Icon,
  ComputerIcon,
  ComputerTerminal01Icon,
  GlobeIcon,
  MoonIcon,
  SafariIcon,
  SmartPhone01Icon,
  UserGroupIcon,
  WindowsNewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { type CSSProperties, useEffect, useState } from "react";
import { Link } from "react-router";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/features/auth/context";
import { DASHBOARD_PRESENCE_QUERY_KEY } from "@/features/dashboard/components/dashboard-visit-notifications";
import {
  type DashboardPresencePoint,
  type DashboardVisitorPresence,
  fetchDashboardPresence,
} from "@/features/dashboard/dashboard-activity";
import { formatJakartaTimestamp } from "@/features/endpoints/utils/endpoint-time";
import { type AppLocale, formatMessage, type Messages } from "@/lib/i18n";
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
    "arkanoid-neon": messages.common.arkanoidNeonTitle,
    "build-your-town": messages.common.buildYourTownTitle,
    "chess-3d": messages.common.chess3dTitle,
    "cron-parser": messages.cronParser.title,
    "date-converter": messages.dateConverter.title,
    "developer-tools": messages.developerTools.navigationGroup,
    "dynamite-mole": messages.common.dynamiteMoleTitle,
    emberwake: messages.common.emberwakeTitle,
    employees: messages.employees.title,
    endpoints: messages.common.navEndpoints,
    "fall-line": messages.common.fallLineTitle,
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
  const segments = path
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
  const copy = messages.dashboardActivity.presence;
  const [internalOpen, setInternalOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const isOpen = controlledOpen ?? internalOpen;
  const handleOpenChange = (nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    controlledOnOpenChange?.(nextOpen);
  };

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
  const visitors = presence?.visitors ?? [];
  const onlineVisitors = visitors.filter((visitor) => visitor.online);
  const recentVisitors = visitors.filter((visitor) => !visitor.online);
  const onlineCount = Math.max(
    presence?.onlineCount ?? onlineVisitors.length,
    snapshot.isAuthenticated ? 1 : 0
  );
  const peakOnlineCount = Math.max(
    presence?.peakOnlineCount ?? onlineCount,
    onlineCount
  );
  const history = presence?.history ?? [];
  const triggerLabel = formatMessage(copy.triggerLabel, {
    count: onlineCount,
  });

  return (
    <Drawer direction="right" onOpenChange={handleOpenChange} open={isOpen}>
      {!hideTrigger && (
        <DrawerTrigger asChild>
          <Button
            aria-label={triggerLabel}
            data-testid="online-visitors-trigger"
            size="sm-compact"
            title={triggerLabel}
            variant="ghost"
          >
            <span className="relative flex size-2 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75 motion-reduce:animate-none"
              />
              <span
                aria-hidden="true"
                className="relative inline-flex size-2 rounded-full bg-success"
              />
            </span>
            <HugeiconsIcon
              className="size-4 text-muted-foreground"
              icon={UserGroupIcon}
              strokeWidth={2}
            />
            <span className="font-mono font-semibold text-xs tabular-nums">
              {onlineCount}
            </span>
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent className="overflow-hidden" showSwipeHandle={false}>
        <DrawerHeader size="compact">
          <div className="flex items-center justify-between gap-2">
            <DrawerTitle size="sm">{copy.title}</DrawerTitle>
            <Badge mono size="xs" variant="success">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-success"
              />
              {onlineCount} {copy.onlineBadge.toLowerCase()}
            </Badge>
          </div>
          <DrawerDescription size="xs">{copy.description}</DrawerDescription>
          {currentIp && currentIp !== "unknown" && (
            <div className="mt-1 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-1 text-xs">
              <span className="text-muted-foreground">
                {copy.currentIpLabel}
              </span>
              <span className="font-medium font-mono text-foreground">
                {currentIp}
              </span>
            </div>
          )}
        </DrawerHeader>
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
                      onNavigate={() => handleOpenChange(false)}
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
                      onNavigate={() => handleOpenChange(false)}
                      visitor={visitor}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
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
    <section className="min-w-0 space-y-2 rounded-lg border bg-muted/25 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          {copy.chartTitle}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <div className="space-y-0.5">
          <div className="font-mono font-semibold text-base text-foreground tabular-nums leading-none">
            {peakOnlineCount}
          </div>
          <div className="font-semibold text-success text-xs uppercase tracking-wider">
            {copy.peakOnlineLabel}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="font-mono font-semibold text-base text-foreground tabular-nums leading-none">
            {onlineCount}
          </div>
          <div className="font-semibold text-primary text-xs uppercase tracking-wider">
            {copy.onlineNowLabel}
          </div>
        </div>
      </div>

      <div className="relative mt-1.5 h-20 w-full overflow-hidden rounded border bg-background/60 px-1.5 pt-2.5 pb-1">
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

function VisitorPresenceRow({
  visitor,
  isCurrentIp,
  nowMs,
  locale,
  messages,
  copy,
  onNavigate,
}: {
  visitor: DashboardVisitorPresence;
  isCurrentIp: boolean;
  nowMs: number;
  locale: AppLocale;
  messages: Messages;
  copy: Messages["dashboardActivity"]["presence"];
  onNavigate: () => void;
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
  const pageInfo = describeVisitorPage(visitor.currentPath, messages);
  const deviceInfo = describeVisitorUserAgent(visitor.userAgent, isCurrentIp);
  const isSleeping = visitor.online && visitor.sleeping;
  let activityText: string;
  if (isSleeping) {
    activityText = formatMessage(copy.sleepingPageLabel, {
      page: pageInfo.label,
    });
  } else if (visitor.online) {
    activityText = formatMessage(
      pageInfo.isGame ? copy.playingGameLabel : copy.viewingPageLabel,
      { page: pageInfo.label }
    );
  } else {
    activityText = formatMessage(copy.lastVisitedPageLabel, {
      page: pageInfo.label,
    });
  }
  let statusBadgeText = copy.offlineBadge;
  let statusDotClass = "bg-muted-foreground/40";
  let statusTextClass = "text-muted-foreground";
  if (isSleeping) {
    statusBadgeText = copy.sleepingBadge;
    statusDotClass = "bg-warning";
    statusTextClass = "text-warning";
  } else if (visitor.online) {
    statusBadgeText = copy.onlineBadge;
    statusDotClass = "bg-success";
    statusTextClass = "text-success";
  }
  let activityIconColorClass = "text-muted-foreground";
  if (isSleeping) {
    activityIconColorClass = "text-warning";
  } else if (visitor.online) {
    activityIconColorClass = "text-primary";
  }

  return (
    <div className="min-w-0 space-y-1.5 px-3 py-2.5">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn("size-2 shrink-0 rounded-full", statusDotClass)}
          />
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
        <span className={cn("shrink-0 font-medium text-xs", statusTextClass)}>
          {statusBadgeText}
        </span>
      </div>

      <div className="min-w-0 pl-3.5">
        <Link
          className="inline-flex min-w-0 max-w-full items-center gap-1 text-foreground/90 text-xs transition-colors hover:text-primary"
          onClick={onNavigate}
          title={pageInfo.path}
          to={pageInfo.path}
        >
          <HugeiconsIcon
            className={cn("size-3 shrink-0", activityIconColorClass)}
            icon={isSleeping ? MoonIcon : Activity01Icon}
            strokeWidth={2}
          />
          <span className="truncate font-medium underline-offset-2 hover:underline">
            {activityText}
          </span>
        </Link>
      </div>

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
