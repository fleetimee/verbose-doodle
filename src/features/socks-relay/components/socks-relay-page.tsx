import { zodResolver } from "@hookform/resolvers/zod";
import {
  Database01Icon,
  HelpCircleIcon,
  RepeatIcon,
  StopCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Transition } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Activity,
  Cable,
  CircleAlert,
  CircleDashed,
  CircleOff,
  Eraser,
  FileTerminal,
  ListFilter,
  Network,
  Play,
  Radio,
  Route,
  ShieldAlert,
  SlidersHorizontal,
  TimerReset,
} from "@/components/hugeicons";
import { type TourStep, useTour } from "@/components/tour";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocketStatusCard } from "@/features/socket-tester/components/socket-status-card";
import { useSocksRelayContext } from "@/features/socks-relay/context/socks-relay-context";
import {
  useGetRelayLogs,
  useGetRelays,
  useStartRelay,
  useStopRelay,
  useUpdateRelayOptions,
} from "@/features/socks-relay/hooks/use-relays";
import type {
  RelayEvent,
  RelayEventLog,
  RelayFlow,
  RelayInstance,
  RelayMode,
  RelayOptions,
  RelayStartInput,
} from "@/features/socks-relay/types";
import {
  DEFAULT_RELAY_OPTIONS,
  getModeLabel,
  isKnownRelayFlow,
  isRelayMessageEvent,
  RELAY_LISTENING_PORT_MAX,
  RELAY_LISTENING_PORT_MIN,
  type RelayStartFormValues,
  relayStartFormSchema,
  summarizeRelayOptions,
  truncateMiddle,
} from "@/features/socks-relay/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SocksRelayPageProps = {
  readonly mode: RelayMode;
};

type HoldDropKey = "holdClient" | "holdHost" | "dropClient" | "dropHost";

const pageStyle = { willChange: "opacity, transform" };
const sectionStyle = { willChange: "opacity, transform" };
const traceStyle = { originX: 0, willChange: "opacity, transform" };
const SOCKS_RELAY_TOUR_DELAY_MS = 350;

const SOCKS_RELAY_TOUR_CONFIG = {
  ISO_8583: {
    storageKey: "socks-relay-iso-8583-tour-seen",
    targets: {
      connection: "socks-relay-iso-8583-tour-connection",
      header: "socks-relay-iso-8583-tour-header",
      liveControls: "socks-relay-iso-8583-tour-live-controls",
      logs: "socks-relay-iso-8583-tour-logs",
      metrics: "socks-relay-iso-8583-tour-metrics",
      options: "socks-relay-iso-8583-tour-options",
      relays: "socks-relay-iso-8583-tour-relays",
      startForm: "socks-relay-iso-8583-tour-start-form",
    },
    tourId: "socks-relay-iso-8583-intro",
  },
  REST_API: {
    storageKey: "socks-relay-rest-api-tour-seen",
    targets: {
      connection: "socks-relay-rest-api-tour-connection",
      header: "socks-relay-rest-api-tour-header",
      liveControls: "socks-relay-rest-api-tour-live-controls",
      logs: "socks-relay-rest-api-tour-logs",
      metrics: "socks-relay-rest-api-tour-metrics",
      options: "socks-relay-rest-api-tour-options",
      relays: "socks-relay-rest-api-tour-relays",
      startForm: "socks-relay-rest-api-tour-start-form",
    },
    tourId: "socks-relay-rest-api-intro",
  },
} as const;

const HOLD_DROP_CONTROLS: {
  readonly key: HoldDropKey;
  readonly label: string;
  readonly shortLabel: string;
}[] = [
  {
    key: "holdClient",
    label: messages.socksRelay.holdClientLabel,
    shortLabel: "HC",
  },
  {
    key: "holdHost",
    label: messages.socksRelay.holdHostLabel,
    shortLabel: "HH",
  },
  {
    key: "dropClient",
    label: messages.socksRelay.dropClientLabel,
    shortLabel: "DC",
  },
  {
    key: "dropHost",
    label: messages.socksRelay.dropHostLabel,
    shortLabel: "DH",
  },
];

const RELAY_FLOW_LEGEND = [
  {
    code: "RC",
    meaning: "Diterima dari Client",
    note: "Relay menerima request/message dari pemanggil.",
  },
  {
    code: "SH",
    meaning: "Dikirim ke Host",
    note: "Relay meneruskan message client ke host tujuan.",
  },
  {
    code: "RH",
    meaning: "Diterima dari Host",
    note: "Relay menerima response/message dari host tujuan.",
  },
  {
    code: "SC",
    meaning: "Dikirim ke Client",
    note: "Relay mengirim response dari host kembali ke pemanggil.",
  },
  {
    code: "HC",
    meaning: "Hold di Client",
    note: "Message ditahan saat diterima relay dari sisi client.",
  },
  {
    code: "HH",
    meaning: "Hold di Host",
    note: "Message ditahan setelah response dari sisi host diterima.",
  },
  {
    code: "DC",
    meaning: "Drop di Client",
    note: "Message dari sisi client didrop dan tidak diteruskan.",
  },
  {
    code: "DH",
    meaning: "Drop di Host",
    note: "Message dari sisi host didrop dan tidak dikirim kembali.",
  },
] as const;

const RELAY_BEHAVIOR_NOTES = [
  "Hold: message akan dihold sesuai waktu yang ditentukan",
  "Hold and Drop: message akan didrop",
  "On Client: message dihold/drop saat diterima oleh aplikasi sock relay",
  "On Host: message akan dihold/drop setelah diterima oleh host",
] as const;

const RELAY_FLOW_TONES: Record<RelayFlow, string> = {
  DC: "border-rose-600/50 bg-rose-100 text-rose-800 dark:border-rose-400/45 dark:bg-rose-400/15 dark:text-rose-200",
  DH: "border-red-600/50 bg-red-100 text-red-800 dark:border-red-400/45 dark:bg-red-400/15 dark:text-red-200",
  HC: "border-amber-600/50 bg-amber-100 text-amber-900 dark:border-amber-400/45 dark:bg-amber-400/15 dark:text-amber-200",
  HH: "border-orange-600/50 bg-orange-100 text-orange-900 dark:border-orange-400/45 dark:bg-orange-400/15 dark:text-orange-200",
  RC: "border-sky-600/45 bg-sky-100 text-sky-800 dark:border-sky-400/40 dark:bg-sky-400/15 dark:text-sky-200",
  RH: "border-emerald-600/45 bg-emerald-100 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-200",
  SC: "border-teal-600/45 bg-teal-100 text-teal-800 dark:border-teal-400/40 dark:bg-teal-400/15 dark:text-teal-200",
  SH: "border-indigo-600/45 bg-indigo-100 text-indigo-800 dark:border-indigo-400/40 dark:bg-indigo-400/15 dark:text-indigo-200",
};

const EMPTY_FORM: Omit<RelayStartInput, "mode"> = {
  hostAddress: "127.0.0.1",
  hostPort: 8085,
  listeningPort: RELAY_LISTENING_PORT_MIN,
  relayId: "",
  ...DEFAULT_RELAY_OPTIONS,
};

function TourStepContent({
  description,
  title,
}: {
  readonly description: string;
  readonly title: string;
}) {
  return (
    <div className="flex flex-col gap-2 pr-10">
      <h2 className="font-semibold text-base">{title}</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function SocksRelayPage({ mode }: SocksRelayPageProps) {
  const modeLabel = getModeLabel(mode);
  const relaysQuery = useGetRelays();
  const { events, malformedEventCount } = useSocksRelayContext();
  const shouldReduceMotion = useReducedMotion();
  const [selectedRelayId, setSelectedRelayId] = useState<string | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const tourConfig = SOCKS_RELAY_TOUR_CONFIG[mode];
  const tourCopy = messages.socksRelay.tour;
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(
    tourConfig.storageKey,
    false
  );
  const hasAutoStartedTour = useRef(false);
  const shouldMarkTourSeenOnEnd = useRef(false);
  const { activeTourId, isActive, setSteps, startTour } = useTour();

  const relays = useMemo(
    () => (relaysQuery.data ?? []).filter((relay) => relay.mode === mode),
    [mode, relaysQuery.data]
  );
  const selectedRelay =
    relays.find((relay) => relay.relayId === selectedRelayId) ?? relays[0];
  const focusedRelayId = selectedRelay?.relayId ?? null;
  const modeEvents = useMemo(
    () => events.filter((event) => event.payload.mode === mode),
    [events, mode]
  );
  const messageEventCount = modeEvents.filter(isRelayMessageEvent).length;
  const runningRelayCount = relays.filter((relay) => relay.running).length;
  const lifecycleEventCount = modeEvents.length - messageEventCount;
  const pageInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.985, y: 18 };
  const pageAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, y: 0 };
  const sectionInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 14 };
  const sectionAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0 };
  const pageTransition: Transition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.42, ease: "easeOut" };
  const sectionTransition: Transition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.34, ease: "easeOut" };
  const traceInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scaleX: 0 };
  const traceAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: [0, 1, 0.68], scaleX: 1 };
  const metricInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.96, y: 10 };
  const metricAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, scale: 1, y: 0 };
  const tourSteps = useMemo<TourStep[]>(
    () => [
      {
        content: (
          <TourStepContent
            description={tourCopy.headerDescription}
            title={tourCopy.headerTitle}
          />
        ),
        position: "bottom",
        selectorId: tourConfig.targets.header,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.connectionDescription}
            title={tourCopy.connectionTitle}
          />
        ),
        position: "bottom",
        selectorId: tourConfig.targets.connection,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.metricsDescription}
            title={tourCopy.metricsTitle}
          />
        ),
        position: "bottom",
        selectorId: tourConfig.targets.metrics,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.startFormDescription}
            title={tourCopy.startFormTitle}
          />
        ),
        position: "right",
        selectorId: tourConfig.targets.startForm,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.optionsDescription}
            title={tourCopy.optionsTitle}
          />
        ),
        position: "right",
        selectorId: tourConfig.targets.options,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.relaysDescription}
            title={tourCopy.relaysTitle}
          />
        ),
        position: "left",
        selectorId: tourConfig.targets.relays,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.liveControlsDescription}
            title={tourCopy.liveControlsTitle}
          />
        ),
        position: "left",
        selectorId: tourConfig.targets.liveControls,
      },
      {
        content: (
          <TourStepContent
            description={tourCopy.logsDescription}
            title={tourCopy.logsTitle}
          />
        ),
        position: "top",
        selectorId: tourConfig.targets.logs,
      },
    ],
    [tourConfig.targets, tourCopy]
  );

  const handleStartTour = useCallback(() => {
    setSteps(tourSteps);
    startTour(tourConfig.tourId);
  }, [setSteps, startTour, tourConfig.tourId, tourSteps]);

  useEffect(() => {
    if (hasSeenTour || hasAutoStartedTour.current || tourSteps.length === 0) {
      return;
    }

    hasAutoStartedTour.current = true;

    const timeoutId = window.setTimeout(() => {
      shouldMarkTourSeenOnEnd.current = true;
      handleStartTour();
    }, SOCKS_RELAY_TOUR_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [handleStartTour, hasSeenTour, tourSteps.length]);

  useEffect(() => {
    if (
      shouldMarkTourSeenOnEnd.current &&
      activeTourId === tourConfig.tourId &&
      !isActive
    ) {
      shouldMarkTourSeenOnEnd.current = false;
      setHasSeenTour(true);
    }
  }, [activeTourId, isActive, setHasSeenTour, tourConfig.tourId]);

  return (
    <motion.div
      animate={pageAnimate}
      className="mx-auto grid w-full max-w-[1500px] gap-4 md:gap-6"
      initial={pageInitial}
      key={mode}
      style={pageStyle}
      transition={pageTransition}
    >
      <motion.header
        animate={sectionAnimate}
        className="relative grid gap-4 border-border/70 border-b pb-5"
        id={tourConfig.targets.header}
        initial={sectionInitial}
        style={sectionStyle}
        transition={{
          ...sectionTransition,
          delay: shouldReduceMotion ? 0 : 0.05,
        }}
      >
        <motion.div
          animate={traceAnimate}
          aria-hidden="true"
          className="absolute -bottom-px left-0 h-px w-full bg-[linear-gradient(90deg,transparent,hsl(var(--primary)),hsl(var(--foreground)/0.7),transparent)]"
          initial={traceInitial}
          style={traceStyle}
          transition={
            shouldReduceMotion
              ? { duration: 0.01 }
              : { delay: 0.18, duration: 0.72, ease: "easeOut" }
          }
        />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
              Socks Relay
            </p>
            <h1 className="font-bold text-3xl tracking-tight">{modeLabel}</h1>
            <p className="mt-3 max-w-[72ch] text-muted-foreground text-sm leading-relaxed md:text-base">
              Start relay listeners, tune hold/drop behavior, and watch live
              message flow without leaving the dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2 lg:justify-end">
            <Button
              className="gap-2"
              onClick={handleStartTour}
              type="button"
              variant="outline"
            >
              <HugeiconsIcon
                data-icon="inline-start"
                icon={HelpCircleIcon}
                strokeWidth={2}
              />
              {tourCopy.startButton}
            </Button>
            <RelayConnectionBadge tourId={tourConfig.targets.connection} />
          </div>
        </div>
        <section
          className="flex flex-wrap gap-2"
          id={tourConfig.targets.metrics}
        >
          {[
            {
              icon: Network,
              label: "Active relays",
              value: relays.length,
            },
            {
              icon: Activity,
              label: "Running",
              value: runningRelayCount,
            },
            {
              icon: Radio,
              label: "Messages",
              value: messageEventCount,
            },
            {
              icon: CircleDashed,
              label: "Lifecycle",
              value: lifecycleEventCount,
            },
            {
              icon: CircleAlert,
              label: "Malformed",
              value: malformedEventCount,
            },
          ].map((metric, index) => (
            <motion.div
              animate={metricAnimate}
              initial={metricInitial}
              key={metric.label}
              style={sectionStyle}
              transition={{
                damping: 32,
                delay: shouldReduceMotion ? 0 : 0.12 + index * 0.045,
                stiffness: 420,
                type: "spring",
              }}
            >
              <SocketStatusCard
                icon={metric.icon}
                label={metric.label}
                value={metric.value}
              />
            </motion.div>
          ))}
        </section>
      </motion.header>

      <motion.div
        animate={sectionAnimate}
        className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]"
        initial={sectionInitial}
        style={sectionStyle}
        transition={{
          ...sectionTransition,
          delay: shouldReduceMotion ? 0 : 0.12,
        }}
      >
        <RelayStartForm
          mode={mode}
          optionsTourId={tourConfig.targets.options}
          tourId={tourConfig.targets.startForm}
        />
        <RelayTable
          isLoading={relaysQuery.isLoading}
          liveControlsTourId={tourConfig.targets.liveControls}
          modeLabel={modeLabel}
          onSelect={setSelectedRelayId}
          relays={relays}
          selectedRelay={selectedRelay}
          selectedRelayId={focusedRelayId}
          tourId={tourConfig.targets.relays}
        />
      </motion.div>

      <motion.div
        animate={sectionAnimate}
        initial={sectionInitial}
        style={sectionStyle}
        transition={{
          ...sectionTransition,
          delay: shouldReduceMotion ? 0 : 0.18,
        }}
      >
        <RelayLogConsole
          focusedRelayId={focusedRelayId}
          mode={mode}
          onShowAllLogsChange={setShowAllLogs}
          showAllLogs={showAllLogs}
          tourId={tourConfig.targets.logs}
        />
      </motion.div>
    </motion.div>
  );
}

function RelayConnectionBadge({ tourId }: { readonly tourId?: string }) {
  const { connectionStatus, malformedEventCount } = useSocksRelayContext();
  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex items-end lg:justify-end" id={tourId}>
      <div className="inline-flex h-9 items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 font-medium text-muted-foreground text-sm shadow-xs">
        <span
          className={cn(
            "size-2 rounded-full",
            isConnected ? "bg-emerald-500" : "bg-amber-500"
          )}
        />
        <span className="text-foreground">
          {messages.socksRelay.relayEventsLabel}
        </span>
        <span className="text-muted-foreground capitalize">
          {connectionStatus}
        </span>
        {malformedEventCount > 0 ? (
          <span className="text-muted-foreground text-xs">
            {malformedEventCount} malformed
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RelayStartForm({
  mode,
  optionsTourId,
  tourId,
}: {
  readonly mode: RelayMode;
  readonly optionsTourId?: string;
  readonly tourId?: string;
}) {
  const startRelay = useStartRelay();
  const form = useForm<RelayStartFormValues>({
    defaultValues: EMPTY_FORM,
    resolver: zodResolver(relayStartFormSchema),
  });
  const optionError = form.formState.errors.holdClient?.message;

  const updateHoldDrop = (key: HoldDropKey, checked: boolean) => {
    for (const { key: optionKey } of HOLD_DROP_CONTROLS) {
      form.setValue(optionKey, optionKey === key ? checked : false, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const submit = (values: RelayStartFormValues) => {
    const input: RelayStartInput = {
      ...values,
      hostAddress: values.hostAddress.trim(),
      mode,
      relayId: values.relayId.trim(),
    };

    startRelay.mutate(input, {
      onSuccess: () => {
        form.reset(EMPTY_FORM);
      },
    });
  };

  return (
    <Card
      className="flex h-full flex-col overflow-hidden rounded-lg border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--muted)/0.16))] py-0 shadow-sm"
      id={tourId}
    >
      <CardHeader className="border-border/70 border-b bg-background/55 px-4 py-3.5 md:px-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid size-8 place-items-center rounded-md border border-primary/25 bg-primary/10 text-primary shadow-xs">
            <Play className="size-4" />
          </span>
          {messages.socksRelay.startRelayTitle}
        </CardTitle>
        <CardDescription className="text-sm">
          {formatMessage(messages.socksRelay.startRelayDescription, {
            modeLabel: getModeLabel(mode),
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-4 md:px-5">
        <form className="grid gap-3" onSubmit={form.handleSubmit(submit)}>
          <FieldError message={optionError} />
          <div className="grid gap-2 rounded-lg border border-border/70 bg-background/75 p-2.5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="relay-id">
                {messages.socksRelay.relayIdLabel}
              </Label>
              <Badge className="font-mono" variant="outline">
                ID
              </Badge>
            </div>
            <Controller
              control={form.control}
              name="relayId"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  className="h-9 border-border/80 bg-muted/20 font-mono text-sm shadow-none"
                  id="relay-id"
                  placeholder={messages.socksRelay.relayIdPlaceholder}
                />
              )}
            />
            <p className="text-muted-foreground text-xs">
              {messages.socksRelay.relayIdDescription}
            </p>
            <FieldError message={form.formState.errors.relayId?.message} />
          </div>
          <div className="overflow-hidden rounded-lg border border-border/70 bg-background/75 shadow-xs">
            <div className="flex items-center gap-2 border-border/70 border-b bg-muted/25 px-3 py-2.5">
              <Route className="size-4 text-primary" />
              <p className="font-medium text-sm">Relay path</p>
            </div>
            <div className="grid gap-0 sm:grid-cols-[135px_minmax(0,1fr)_96px]">
              <div className="grid gap-2 p-2.5">
                <Label className="text-sm" htmlFor="listening-port">
                  {messages.socksRelay.listeningPortLabel}
                </Label>
                <Controller
                  control={form.control}
                  name="listeningPort"
                  render={({ field, fieldState }) => (
                    <Input
                      aria-invalid={fieldState.invalid}
                      className="h-9 border-border/80 bg-muted/20 font-mono text-sm shadow-none"
                      id="listening-port"
                      inputMode="numeric"
                      max={RELAY_LISTENING_PORT_MAX}
                      min={RELAY_LISTENING_PORT_MIN}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(Number.parseInt(event.target.value, 10))
                      }
                      type="number"
                      value={field.value}
                    />
                  )}
                />
                <FieldError
                  message={form.formState.errors.listeningPort?.message}
                />
              </div>
              <div className="grid gap-2 border-border/70 border-t p-2.5 sm:border-t-0 sm:border-l">
                <Label className="text-sm" htmlFor="host-address">
                  {messages.socksRelay.hostAddressLabel}
                </Label>
                <Controller
                  control={form.control}
                  name="hostAddress"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="h-9 border-border/80 bg-muted/20 font-mono text-sm shadow-none"
                      id="host-address"
                      placeholder="127.0.0.1"
                    />
                  )}
                />
                <FieldError
                  message={form.formState.errors.hostAddress?.message}
                />
              </div>
              <div className="grid gap-2 border-border/70 border-t p-2.5 sm:border-t-0 sm:border-l">
                <Label className="text-sm" htmlFor="host-port">
                  {messages.socksRelay.hostPortLabel}
                </Label>
                <Controller
                  control={form.control}
                  name="hostPort"
                  render={({ field, fieldState }) => (
                    <Input
                      aria-invalid={fieldState.invalid}
                      className="h-9 border-border/80 bg-muted/20 font-mono text-sm shadow-none"
                      id="host-port"
                      inputMode="numeric"
                      max={65_535}
                      min={1}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(Number.parseInt(event.target.value, 10))
                      }
                      type="number"
                      value={field.value}
                    />
                  )}
                />
                <FieldError message={form.formState.errors.hostPort?.message} />
              </div>
            </div>
            <div className="border-border/70 border-t px-3 py-2 text-muted-foreground text-xs leading-snug">
              {messages.socksRelay.listeningPortDescription}{" "}
              {messages.socksRelay.hostAddressDescription}
            </div>
          </div>
          <div className="grid gap-2 rounded-lg border border-border/70 bg-background/75 p-2.5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="timer-ms">
                {messages.socksRelay.timerMsLabel}
              </Label>
              <TimerReset className="size-4 text-primary" />
            </div>
            <Controller
              control={form.control}
              name="timerMs"
              render={({ field, fieldState }) => (
                <Input
                  aria-invalid={fieldState.invalid}
                  className="h-9 border-border/80 bg-muted/20 font-mono text-sm shadow-none"
                  id="timer-ms"
                  inputMode="numeric"
                  min={1000}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(Number.parseInt(event.target.value, 10))
                  }
                  step={100}
                  type="number"
                  value={field.value}
                />
              )}
            />
            <p className="text-muted-foreground text-xs">
              {messages.socksRelay.liveTimerHint}
            </p>
            <FieldError message={form.formState.errors.timerMs?.message} />
          </div>
          <RelayOptionsControls
            onHoldDropChange={updateHoldDrop}
            onRemoveHeadersChange={(checked) =>
              form.setValue("removeHeaders", checked, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            options={form.watch()}
            tourId={optionsTourId}
          />
          <Button
            className="h-10 w-full gap-2 shadow-sm transition-transform duration-150 ease-out active:scale-[0.99]"
            disabled={startRelay.isPending}
            type="submit"
          >
            <Play className="size-4" />
            {startRelay.isPending
              ? messages.socksRelay.startingRelayButton
              : messages.socksRelay.startRelayButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RelayOptionsControls({
  disabled = false,
  onHoldDropChange,
  onRemoveHeadersChange,
  options,
  tourId,
}: {
  readonly disabled?: boolean;
  readonly onHoldDropChange: (key: HoldDropKey, checked: boolean) => void;
  readonly onRemoveHeadersChange: (checked: boolean) => void;
  readonly options: RelayOptions;
  readonly tourId?: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border/70 bg-background/75 shadow-xs"
      id={tourId}
    >
      <div className="flex items-start justify-between gap-3 border-border/70 border-b bg-muted/25 px-3 py-2.5">
        <div>
          <p className="font-medium text-sm">
            {messages.socksRelay.optionsHeader}
          </p>
          <p className="mt-0.5 text-muted-foreground text-xs leading-snug">
            {messages.socksRelay.relayOptionsDescription}
          </p>
        </div>
        <SlidersHorizontal className="mt-0.5 size-4 shrink-0 text-primary" />
      </div>
      <div className="grid gap-2 p-3 sm:grid-cols-2">
        {HOLD_DROP_CONTROLS.map((control) => (
          <SwitchRow
            checked={options[control.key]}
            disabled={disabled}
            key={control.key}
            label={control.label}
            onCheckedChange={(checked) =>
              onHoldDropChange(control.key, checked)
            }
            shortLabel={control.shortLabel}
          />
        ))}
      </div>
      <div className="border-border/70 border-t p-3">
        <SwitchRow
          checked={options.removeHeaders}
          disabled={disabled}
          label={messages.socksRelay.removeHeadersLabel}
          onCheckedChange={onRemoveHeadersChange}
          shortLabel="REST"
        />
      </div>
    </div>
  );
}

function SwitchRow({
  checked,
  disabled = false,
  label,
  onCheckedChange,
  shortLabel,
}: {
  readonly checked: boolean;
  readonly disabled?: boolean;
  readonly label: string;
  readonly onCheckedChange: (checked: boolean) => void;
  readonly shortLabel: string;
}) {
  const switchId = useId();

  return (
    <div
      className={cn(
        "flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm shadow-xs transition-colors",
        checked
          ? "border-primary/45 bg-primary/10 text-foreground"
          : "border-border/60 bg-muted/15 text-foreground"
      )}
    >
      <Label
        className="inline-flex min-w-0 flex-1 items-center gap-2 pr-2 leading-snug"
        htmlFor={switchId}
        title={label}
      >
        <Badge
          className={cn(
            "font-mono",
            checked ? "border-primary/40 bg-background/80 text-primary" : null
          )}
          variant="outline"
        >
          {shortLabel}
        </Badge>
        <span className="min-w-0 text-wrap">{label}</span>
      </Label>
      <Switch
        checked={checked}
        className="shrink-0"
        disabled={disabled}
        id={switchId}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function RelayTable({
  isLoading,
  liveControlsTourId,
  modeLabel,
  onSelect,
  relays,
  selectedRelay,
  selectedRelayId,
  tourId,
}: {
  readonly isLoading: boolean;
  readonly liveControlsTourId?: string;
  readonly modeLabel: string;
  readonly onSelect: (relayId: string) => void;
  readonly relays: RelayInstance[];
  readonly selectedRelay?: RelayInstance;
  readonly selectedRelayId: string | null;
  readonly tourId?: string;
}) {
  const stopRelay = useStopRelay();
  const handleSelectRelay = (relay: RelayInstance) => {
    if (relay.relayId === selectedRelayId) {
      return;
    }

    onSelect(relay.relayId);
    toast.info(
      formatMessage(messages.socksRelay.focusedLogScope, {
        relayId: truncateMiddle(relay.relayId, 10, 10),
      }),
      {
        description: "Live controls and logs now follow this relay.",
      }
    );
  };
  let relayTableContent = (
    <div className="min-h-56 flex-1 animate-pulse rounded-lg border border-border/70 bg-muted/20" />
  );

  if (!isLoading && relays.length === 0) {
    relayTableContent = (
      <div className="relative grid min-h-[440px] flex-1 place-items-center overflow-hidden rounded-lg border border-border/70 bg-[radial-gradient(circle_at_50%_42%,hsl(var(--primary)/0.12),transparent_34%),linear-gradient(135deg,hsl(var(--muted)/0.42),hsl(var(--background))_62%)] p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.42)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.32)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35"
        />
        <div className="relative grid w-full max-w-3xl gap-5">
          <div className="mx-auto grid size-14 place-items-center rounded-md border border-primary/25 bg-primary/10 text-primary shadow-xs">
            <CircleOff className="size-7" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-xl">
              {formatMessage(messages.socksRelay.noRelaysTitle, {
                modeLabel,
              })}
            </p>
            <p className="mx-auto mt-2 max-w-[46ch] text-muted-foreground text-sm leading-relaxed">
              {messages.socksRelay.noRelaysDescription}
            </p>
          </div>
          <div className="mx-auto grid w-full max-w-md grid-cols-3 overflow-hidden rounded-md border border-border/70 bg-background/85 text-center shadow-xs">
            <div className="grid gap-1 border-border/70 border-r px-3 py-3">
              <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
                {messages.socksRelay.noRelayDefaultListenLabel}
              </span>
              <span className="font-mono font-semibold text-sm">
                {RELAY_LISTENING_PORT_MIN}
              </span>
            </div>
            <div className="grid gap-1 border-border/70 border-r px-3 py-3">
              <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
                {messages.socksRelay.noRelayDefaultHostLabel}
              </span>
              <span className="truncate font-mono font-semibold text-sm">
                127.0.0.1
              </span>
            </div>
            <div className="grid gap-1 px-3 py-3">
              <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
                {messages.socksRelay.noRelayDefaultPortLabel}
              </span>
              <span className="font-mono font-semibold text-sm">8085</span>
            </div>
          </div>
          <div className="mx-auto inline-flex items-center justify-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2 text-muted-foreground text-xs shadow-xs">
            <Play className="size-3.5 text-primary" />
            <span>
              {formatMessage(messages.socksRelay.noRelaysReadyHint, {
                modeLabel,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && relays.length > 0) {
    relayTableContent = (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70">
        <Table className="w-full table-fixed">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[72px]" />
            <col className="w-[20%]" />
            <col className="w-[16%]" />
            <col className="w-[112px]" />
            <col className="w-[92px]" />
          </colgroup>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>{messages.socksRelay.relayHeader}</TableHead>
              <TableHead>{messages.socksRelay.listenHeader}</TableHead>
              <TableHead>{messages.socksRelay.targetHeader}</TableHead>
              <TableHead>{messages.socksRelay.optionsHeader}</TableHead>
              <TableHead>{messages.socksRelay.statusHeader}</TableHead>
              <TableHead className="text-right">
                {messages.socksRelay.actionsHeader}
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <ScrollArea className="min-h-0 flex-1 border-border/70 border-t pr-3">
          <Table className="w-full table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[72px]" />
              <col className="w-[20%]" />
              <col className="w-[16%]" />
              <col className="w-[112px]" />
              <col className="w-[92px]" />
            </colgroup>
            <TableBody>
              {relays.map((relay) => (
                <TableRow
                  data-state={
                    relay.relayId === selectedRelayId ? "selected" : undefined
                  }
                  key={relay.relayId}
                >
                  <TableCell className="min-w-0">
                    <button
                      aria-label={`Select relay ${relay.relayId}`}
                      className="block max-w-full whitespace-nowrap font-mono text-foreground text-sm underline-offset-4 hover:underline"
                      onClick={() => handleSelectRelay(relay)}
                      title={relay.relayId}
                      type="button"
                    >
                      {truncateMiddle(relay.relayId)}
                    </button>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {relay.listeningPort}
                  </TableCell>
                  <TableCell className="truncate font-mono text-xs">
                    {relay.hostAddress}:{relay.hostPort}
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate text-muted-foreground text-xs">
                    {summarizeRelayOptions(relay.options)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={relay.running ? "default" : "secondary"}>
                      {relay.running ? "Running" : "Stopped"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        aria-label={`Stop ${relay.relayId}`}
                        className="size-8"
                        disabled={stopRelay.isPending}
                        onClick={() => stopRelay.mutate(relay.relayId)}
                        size="icon"
                        type="button"
                        variant="destructive"
                      >
                        <HugeiconsIcon
                          className="size-4"
                          icon={StopCircleIcon}
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    );
  }

  return (
    <Card
      className="flex h-full min-w-0 flex-col rounded-lg border-border/70 py-5 shadow-sm"
      id={tourId}
    >
      <CardHeader className="gap-3 px-4 md:grid-cols-[minmax(0,1fr)_auto] md:px-5">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="grid size-8 place-items-center rounded-md border border-border/70 bg-background text-primary shadow-xs">
              <Cable className="size-4" />
            </span>
            {messages.socksRelay.relayInstancesTitle}
          </CardTitle>
          <CardDescription>
            {formatMessage(messages.socksRelay.relayInstancesDescription, {
              modeLabel,
            })}
          </CardDescription>
        </div>
        <div
          className="flex items-start md:justify-end"
          id={liveControlsTourId}
        >
          <RelayLiveControls relay={selectedRelay} />
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-4 md:px-5">
        {relayTableContent}
      </CardContent>
    </Card>
  );
}

function RelayLiveControls({ relay }: { readonly relay?: RelayInstance }) {
  const updateOptions = useUpdateRelayOptions();
  const [options, setOptions] = useState<RelayOptions>(
    relay?.options ?? DEFAULT_RELAY_OPTIONS
  );

  useEffect(() => {
    if (relay) {
      setOptions(relay.options);
    }
  }, [relay]);

  const applyOptions = (nextOptions: RelayOptions) => {
    if (!relay) {
      return;
    }

    const safeNextOptions = {
      ...nextOptions,
      timerMs:
        Number.isInteger(nextOptions.timerMs) && nextOptions.timerMs >= 1000
          ? nextOptions.timerMs
          : relay.options.timerMs,
    };
    const previousOptions = options;
    setOptions(safeNextOptions);
    updateOptions.mutate(
      { options: safeNextOptions, relayId: relay.relayId },
      {
        onError: () => setOptions(previousOptions),
      }
    );
  };

  const updateHoldDrop = (key: HoldDropKey, checked: boolean) => {
    applyOptions({
      ...options,
      dropClient: false,
      dropHost: false,
      holdClient: false,
      holdHost: false,
      [key]: checked,
    });
  };

  const updateTimer = () => {
    if (
      !relay ||
      options.timerMs < 1000 ||
      options.timerMs === relay.options.timerMs
    ) {
      return;
    }

    applyOptions(options);
  };

  if (!relay) {
    return (
      <Button disabled size="sm" type="button" variant="outline">
        <SlidersHorizontal data-icon="inline-start" />
        {messages.socksRelay.liveControlsTitle}
      </Button>
    );
  }

  const isDisabled = !relay.running || updateOptions.isPending;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <SlidersHorizontal data-icon="inline-start" />
          {messages.socksRelay.liveControlsTitle}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Activity className="size-4" />
            {messages.socksRelay.liveControlsTitle}
          </SheetTitle>
          <SheetDescription>
            {formatMessage(messages.socksRelay.liveControlsDescription, {
              relayId: relay.relayId,
            })}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap items-center gap-2 px-4">
          <Badge variant={relay.running ? "default" : "secondary"}>
            {relay.running ? "Running" : "Stopped"}
          </Badge>
          <Badge variant="outline">
            {messages.socksRelay.appliesToNewTrafficLabel}
          </Badge>
        </div>
        <div className="grid gap-4 px-4">
          <RelayOptionsControls
            disabled={isDisabled}
            onHoldDropChange={updateHoldDrop}
            onRemoveHeadersChange={(checked) =>
              applyOptions({ ...options, removeHeaders: checked })
            }
            options={options}
          />
          <div className="grid content-start gap-2 rounded-lg border border-border/70 bg-muted/20 p-3 shadow-inner">
            <Label htmlFor="edit-timer-ms">
              {messages.socksRelay.timerMsLabel}
            </Label>
            <Input
              aria-invalid={options.timerMs < 1000}
              disabled={isDisabled}
              id="edit-timer-ms"
              inputMode="numeric"
              min={1000}
              onBlur={updateTimer}
              onChange={(event) =>
                setOptions((current) => ({
                  ...current,
                  timerMs: Number.parseInt(event.target.value, 10) || 0,
                }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
              }}
              step={100}
              type="number"
              value={options.timerMs}
            />
            <p className="text-muted-foreground text-xs">
              {messages.socksRelay.liveTimerHint}
            </p>
          </div>
          <p className="text-muted-foreground text-xs">
            {messages.socksRelay.liveControlsEmptyDescription}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RelayLogConsole({
  focusedRelayId,
  mode,
  onShowAllLogsChange,
  showAllLogs,
  tourId,
}: {
  readonly focusedRelayId: string | null;
  readonly mode: RelayMode;
  readonly onShowAllLogsChange: (showAll: boolean) => void;
  readonly showAllLogs: boolean;
  readonly tourId?: string;
}) {
  const showAllLogsSwitchId = useId();
  const { clearLogs, events } = useSocksRelayContext();
  const savedLogsQuery = useGetRelayLogs();
  const savedEvents = useMemo(
    () => (savedLogsQuery.data ?? []).map(toRelayEvent),
    [savedLogsQuery.data]
  );
  const allEvents = useMemo(
    () => mergeRelayEvents(savedEvents, events),
    [events, savedEvents]
  );
  const scopedEvents = useMemo(
    () =>
      allEvents.filter((event) => {
        if (event.payload.mode !== mode) {
          return false;
        }
        if (showAllLogs || !focusedRelayId) {
          return true;
        }
        return event.payload.relayId === focusedRelayId;
      }),
    [allEvents, focusedRelayId, mode, showAllLogs]
  );
  const messageEvents = scopedEvents.filter(isRelayMessageEvent);
  const lifecycleEvents = scopedEvents.filter(
    (event) => !isRelayMessageEvent(event)
  );
  let logScopeDescription: string = messages.socksRelay.selectedLogScope;
  if (showAllLogs) {
    logScopeDescription = formatMessage(
      messages.socksRelay.showingAllLogScope,
      {
        modeLabel: getModeLabel(mode),
      }
    );
  } else if (focusedRelayId) {
    logScopeDescription = formatMessage(messages.socksRelay.focusedLogScope, {
      relayId: focusedRelayId,
    });
  }

  return (
    <Card
      className="min-w-0 overflow-hidden rounded-lg border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--muted)/0.12))] py-0 shadow-sm"
      id={tourId}
    >
      <CardHeader className="gap-4 border-border/70 border-b bg-background/45 px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:px-5">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="grid size-8 place-items-center rounded-md border border-border/70 bg-background text-primary shadow-xs">
              <FileTerminal className="size-4" />
            </span>
            {messages.socksRelay.relayLogsTitle}
          </CardTitle>
          <CardDescription>{logScopeDescription}</CardDescription>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 font-medium text-[11px] text-sky-700 uppercase tracking-[0.12em] dark:text-sky-300">
            <HugeiconsIcon
              className="size-3.5"
              icon={Database01Icon}
              strokeWidth={2}
            />
            {messages.socksRelay.savedHistoryLabel}
            <span className="h-3 border-sky-500/25 border-l" />
            <span className="normal-case tracking-normal">
              {savedEvents.length} events
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-8 items-center gap-2 rounded-md border border-border/70 bg-background px-3 font-medium text-sm shadow-xs">
            <ListFilter className="size-4" />
            <Label htmlFor={showAllLogsSwitchId}>
              {messages.socksRelay.allRelaysLabel}
            </Label>
            <Switch
              checked={showAllLogs}
              id={showAllLogsSwitchId}
              onCheckedChange={onShowAllLogsChange}
            />
          </div>
          <Button
            className="h-8 gap-2 transition-transform duration-150 ease-out active:scale-[0.97]"
            disabled={savedLogsQuery.isFetching}
            onClick={() => savedLogsQuery.refetch()}
            size="sm"
            type="button"
            variant="ghost"
          >
            <HugeiconsIcon
              className={cn(
                "size-4",
                savedLogsQuery.isFetching && "animate-spin"
              )}
              icon={RepeatIcon}
              strokeWidth={2}
            />
            {messages.socksRelay.refreshLogsButton}
          </Button>
          <Button
            className="h-8 gap-2 transition-transform duration-150 ease-out active:scale-[0.97]"
            onClick={clearLogs}
            size="sm"
            type="button"
            variant="outline"
          >
            <Eraser className="size-4" />
            {messages.socksRelay.clearLiveButton}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-4 md:px-5">
        <Tabs defaultValue="message">
          <TabsList className="mb-3">
            <TabsTrigger value="message">
              {messages.socksRelay.messageTab}
            </TabsTrigger>
            <TabsTrigger value="event">
              {messages.socksRelay.eventTab}
            </TabsTrigger>
            <TabsTrigger value="about">
              {messages.socksRelay.aboutTab}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="message">
            <RelayEventList
              emptyLabel={messages.socksRelay.noRelayMessages}
              events={messageEvents}
            />
          </TabsContent>
          <TabsContent value="event">
            <RelayEventList
              emptyLabel={messages.socksRelay.noLifecycleEvents}
              events={lifecycleEvents}
            />
          </TabsContent>
          <TabsContent value="about">
            <RelayLegend />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function toRelayEvent(log: RelayEventLog): RelayEvent {
  return {
    id: `saved-${log.id}`,
    payload: log.payload,
    receivedAt: Date.parse(log.occurredAt),
    type: log.type,
  };
}

function mergeRelayEvents(
  savedEvents: RelayEvent[],
  liveEvents: RelayEvent[]
): RelayEvent[] {
  const byIdentity = new Map<string, RelayEvent>();

  for (const event of savedEvents) {
    byIdentity.set(relayEventIdentity(event), event);
  }
  for (const event of liveEvents) {
    byIdentity.set(relayEventIdentity(event), event);
  }

  return [...byIdentity.values()].sort(
    (first, second) => first.receivedAt - second.receivedAt
  );
}

function relayEventIdentity(event: RelayEvent): string {
  const { data, flow, jobId, relayId, timestamp } = event.payload;
  return [event.type, relayId, timestamp, flow, jobId, data].join("|");
}

function RelayLegend() {
  return (
    <div className="grid gap-4 rounded-lg border border-border/70 bg-muted/10 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <div className="overflow-hidden rounded-lg border border-border/70">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>{messages.socksRelay.codeHeader}</TableHead>
                <TableHead>{messages.socksRelay.meaningHeader}</TableHead>
                <TableHead>{messages.socksRelay.noteHeader}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RELAY_FLOW_LEGEND.map((item) => (
                <TableRow key={item.code}>
                  <TableCell>
                    <Badge
                      className={cn("font-mono", RELAY_FLOW_TONES[item.code])}
                      variant="outline"
                    >
                      {item.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.meaning}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.note}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="rounded-lg border border-border/70 bg-background/70 p-4">
        <h3 className="font-semibold text-sm">
          {messages.socksRelay.behaviorNotesTitle}
        </h3>
        <ul className="mt-3 grid gap-2 text-muted-foreground text-sm">
          {RELAY_BEHAVIOR_NOTES.map((note) => (
            <li className="flex gap-2" key={note}>
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RelayEventList({
  emptyLabel,
  events,
}: {
  readonly emptyLabel: string;
  readonly events: RelayEvent[];
}) {
  if (events.length === 0) {
    return (
      <div className="grid min-h-80 place-items-center rounded-lg border border-[#2f2f2f] bg-[#151515] px-6 text-center">
        <div className="w-full max-w-xl rounded-md border border-white/10 bg-black/20 p-5 font-mono text-sm shadow-inner">
          <div className="mb-3 flex items-center justify-center gap-2 text-[#d4d4d4]">
            <TimerReset className="size-5" />
            <span className="font-semibold">{emptyLabel}</span>
          </div>
          <p className="text-[#60a5fa]">relay-console --waiting-for-events</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[520px] min-h-[420px] min-w-0 rounded-lg border border-[#2f2f2f] bg-[#151515] shadow-inner">
      <div className="min-w-max p-3 font-mono text-[#e7e7e7] text-[12px] leading-5">
        <div className="grid gap-2">
          {events
            .slice()
            .reverse()
            .map((event) => (
              <RelayEventLine event={event} key={event.id} />
            ))}
        </div>
      </div>
      <ScrollBar className="hidden" orientation="horizontal" />
    </ScrollArea>
  );
}

function RelayEventLine({ event }: { readonly event: RelayEvent }) {
  const displayLine =
    typeof event.payload.displayLine === "string"
      ? event.payload.displayLine
      : null;
  const timestamp = event.payload.timestamp
    ? new Date(event.payload.timestamp).toLocaleTimeString()
    : new Date(event.receivedAt).toLocaleTimeString();
  const flow = event.payload.flow;
  const isMessage = isRelayMessageEvent(event);

  return (
    <div className="grid gap-1 rounded-md border border-white/10 bg-white/[0.035] p-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-[#a3a3a3]">
        <span className="text-[#858585]">{timestamp}</span>
        <span className="font-semibold text-[#d4d4d4]">
          {event.payload.relayId ?? "unknown-relay"}
        </span>
        {isMessage && isKnownRelayFlow(flow) ? (
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 font-semibold",
              RELAY_FLOW_TONES[flow]
            )}
          >
            {flow}
          </span>
        ) : (
          <span className="rounded bg-amber-400/15 px-1.5 py-0.5 font-semibold text-amber-200">
            {event.type}
          </span>
        )}
        {event.payload.jobId ? <span>job {event.payload.jobId}</span> : null}
      </div>
      {isMessage ? (
        <pre className="whitespace-pre-wrap break-words text-[#f5f5f5]">
          {displayLine ||
            event.payload.data ||
            event.payload.hex ||
            event.payload.base64 ||
            ""}
        </pre>
      ) : (
        <pre className="whitespace-pre-wrap break-words text-[#f5f5f5]">
          {displayLine ??
            event.payload.message ??
            JSON.stringify(event.payload, null, 2)}
        </pre>
      )}
    </div>
  );
}

function FieldError({ message }: { readonly message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="inline-flex items-center gap-1 text-destructive text-xs">
      <ShieldAlert className="size-3" />
      {message}
    </p>
  );
}
