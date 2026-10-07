import { zodResolver } from "@hookform/resolvers/zod";
import {
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
  CircleDashed,
  CircleOff,
  Eraser,
  FileTerminal,
  ListFilter,
  Network,
  Play,
  Radio,
  ShieldAlert,
  SlidersHorizontal,
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
}[] = [
  {
    key: "holdClient",
    get label() {
      return messages.socksRelay.holdClientLabel;
    },
  },
  {
    key: "holdHost",
    get label() {
      return messages.socksRelay.holdHostLabel;
    },
  },
  {
    key: "dropClient",
    get label() {
      return messages.socksRelay.dropClientLabel;
    },
  },
  {
    key: "dropHost",
    get label() {
      return messages.socksRelay.dropHostLabel;
    },
  },
];

const RELAY_FLOW_LEGEND = [
  {
    code: "RC",
    get meaning() {
      return messages.socksRelay.flowLegend.rcMeaning;
    },
    get note() {
      return messages.socksRelay.flowLegend.rcNote;
    },
  },
  {
    code: "SH",
    get meaning() {
      return messages.socksRelay.flowLegend.shMeaning;
    },
    get note() {
      return messages.socksRelay.flowLegend.shNote;
    },
  },
  {
    code: "RH",
    get meaning() {
      return messages.socksRelay.flowLegend.rhMeaning;
    },
    get note() {
      return messages.socksRelay.flowLegend.rhNote;
    },
  },
  {
    code: "SC",
    get meaning() {
      return messages.socksRelay.flowLegend.scMeaning;
    },
    get note() {
      return messages.socksRelay.flowLegend.scNote;
    },
  },
  {
    code: "HC",
    get meaning() {
      return messages.socksRelay.flowLegend.hcMeaning;
    },
    get note() {
      return messages.socksRelay.flowLegend.hcNote;
    },
  },
  {
    code: "HH",
    get meaning() {
      return messages.socksRelay.flowLegend.hhMeaning;
    },
    get note() {
      return messages.socksRelay.flowLegend.hhNote;
    },
  },
  {
    code: "DC",
    get meaning() {
      return messages.socksRelay.flowLegend.dcMeaning;
    },
    get note() {
      return messages.socksRelay.flowLegend.dcNote;
    },
  },
  {
    code: "DH",
    get meaning() {
      return messages.socksRelay.flowLegend.dhMeaning;
    },
    get note() {
      return messages.socksRelay.flowLegend.dhNote;
    },
  },
] as const;

function getRelayBehaviorNotes() {
  return [
    messages.socksRelay.behaviorNotes.hold,
    messages.socksRelay.behaviorNotes.holdAndDrop,
    messages.socksRelay.behaviorNotes.onClient,
    messages.socksRelay.behaviorNotes.onHost,
  ] as const;
}

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
  const { events } = useSocksRelayContext();
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
      className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col gap-3 will-change-transform"
      initial={pageInitial}
      key={mode}
      transition={pageTransition}
    >
      <motion.header
        animate={sectionAnimate}
        className="relative grid shrink-0 gap-2 border-border/70 border-b pb-3 will-change-transform"
        id={tourConfig.targets.header}
        initial={sectionInitial}
        transition={{
          ...sectionTransition,
          delay: shouldReduceMotion ? 0 : 0.05,
        }}
      >
        <motion.div
          animate={traceAnimate}
          aria-hidden="true"
          className="absolute -bottom-px left-0 h-px w-full origin-left bg-gradient-to-r from-transparent via-primary to-transparent will-change-transform"
          initial={traceInitial}
          transition={
            shouldReduceMotion
              ? { duration: 0.01 }
              : { delay: 0.18, duration: 0.72, ease: "easeOut" }
          }
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-semibold text-xl tracking-tight">
              {modeLabel}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              aria-label={tourCopy.startButton}
              onClick={handleStartTour}
              size="icon-sm"
              title={tourCopy.startButton}
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon
                data-icon="inline-start"
                icon={HelpCircleIcon}
                strokeWidth={2}
              />
            </Button>
            <RelayConnectionBadge tourId={tourConfig.targets.connection} />
          </div>
        </div>
        <section
          className="flex flex-wrap gap-x-4 gap-y-1"
          id={tourConfig.targets.metrics}
        >
          {[
            {
              icon: Network,
              label: messages.socksRelay.metrics.activeRelays,
              value: relays.length,
            },
            {
              icon: Activity,
              label: messages.socksRelay.metrics.running,
              value: runningRelayCount,
            },
            {
              icon: Radio,
              label: messages.socksRelay.metrics.messages,
              value: messageEventCount,
            },
            {
              icon: CircleDashed,
              label: messages.socksRelay.metrics.lifecycle,
              value: lifecycleEventCount,
            },
          ].map((metric, index) => (
            <motion.div
              animate={metricAnimate}
              className="will-change-transform"
              initial={metricInitial}
              key={metric.label}
              transition={{
                damping: 32,
                delay: shouldReduceMotion ? 0 : 0.12 + index * 0.045,
                stiffness: 420,
                type: "spring",
              }}
            >
              <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
                <metric.icon className="size-3.5" />
                {metric.label}
                <span className="font-mono font-semibold text-foreground">
                  {metric.value}
                </span>
              </span>
            </motion.div>
          ))}
        </section>
      </motion.header>

      <motion.div
        animate={sectionAnimate}
        className="grid min-h-0 flex-1 gap-3 will-change-transform lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-[minmax(130px,0.3fr)_minmax(0,0.7fr)]"
        initial={sectionInitial}
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
  const { connectionStatus } = useSocksRelayContext();
  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex items-center" id={tourId}>
      <div className="inline-flex items-center gap-2 text-muted-foreground text-xs">
        <span
          className={cn(
            "size-2 rounded-full",
            isConnected ? "bg-success" : "bg-warning"
          )}
        />

        <span className="text-muted-foreground capitalize">
          {connectionStatus}
        </span>
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
  const validationMessages = Object.values(form.formState.errors)
    .map((error) => error.message)
    .filter((message): message is string => Boolean(message));

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
      className="flex min-h-0 flex-col overflow-hidden lg:row-span-2"
      id={tourId}
      size="panel"
      variant="subtle"
    >
      <CardHeader className="shrink-0" size="sm" variant="subtle">
        <CardTitle size="sm" variant="inline">
          <span className="grid size-5 place-items-center text-primary">
            <Play className="size-4" />
          </span>
          {messages.socksRelay.startRelayTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 overflow-y-auto" size="sm">
        <form className="grid gap-2" onSubmit={form.handleSubmit(submit)}>
          <div className="grid grid-cols-[minmax(0,1fr)_100px] gap-3">
            <div className="grid content-start gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="relay-id">
                  {messages.socksRelay.relayIdLabel}
                </Label>
              </div>
              <Controller
                control={form.control}
                name="relayId"
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    id="relay-id"
                    placeholder={messages.socksRelay.relayIdPlaceholder}
                    variant="muted-mono"
                  />
                )}
              />
            </div>
            <div className="grid content-start gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="timer-ms">
                  {messages.socksRelay.timerMsLabel}
                </Label>
              </div>
              <Controller
                control={form.control}
                name="timerMs"
                render={({ field, fieldState }) => (
                  <Input
                    aria-invalid={fieldState.invalid}
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
                    variant="muted-mono"
                  />
                )}
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-border/70">
            <div className="grid grid-cols-2 gap-0">
              <div className="grid content-start gap-2 p-2">
                <Label htmlFor="listening-port">
                  {messages.socksRelay.listeningPortLabel}
                </Label>
                <Controller
                  control={form.control}
                  name="listeningPort"
                  render={({ field, fieldState }) => (
                    <Input
                      aria-invalid={fieldState.invalid}
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
                      variant="muted-mono"
                    />
                  )}
                />
              </div>
              <div className="order-3 col-span-2 grid content-start gap-2 border-border/70 border-t p-2">
                <Label htmlFor="host-address">
                  {messages.socksRelay.hostAddressLabel}
                </Label>
                <Controller
                  control={form.control}
                  name="hostAddress"
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="host-address"
                      placeholder="127.0.0.1"
                      variant="muted-mono"
                    />
                  )}
                />
              </div>
              <div className="grid content-start gap-2 border-border/70 border-l p-2">
                <Label htmlFor="host-port">
                  {messages.socksRelay.hostPortLabel}
                </Label>
                <Controller
                  control={form.control}
                  name="hostPort"
                  render={({ field, fieldState }) => (
                    <Input
                      aria-invalid={fieldState.invalid}
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
                      variant="muted-mono"
                    />
                  )}
                />
              </div>
            </div>
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
          <div
            aria-atomic="true"
            aria-live="polite"
            className="h-12 overflow-y-auto"
          >
            {validationMessages.map((message) => (
              <p
                className="flex items-start gap-1 text-destructive text-xs"
                key={message}
              >
                <ShieldAlert
                  aria-hidden="true"
                  className="mt-0.5 size-3 shrink-0"
                />
                <span>{message}</span>
              </p>
            ))}
          </div>
          <Button
            className="w-full"
            disabled={startRelay.isPending}
            size="sm"
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
      className="overflow-hidden rounded-md border border-border/70"
      id={tourId}
    >
      <div className="flex items-start justify-between gap-3 border-border/70 border-b bg-muted/20 px-3 py-2">
        <div>
          <p
            className="font-medium text-sm"
            title={messages.socksRelay.relayOptionsDescription}
          >
            {messages.socksRelay.optionsHeader}
          </p>
        </div>
        <SlidersHorizontal className="mt-0.5 size-4 shrink-0 text-primary" />
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-2">
        {HOLD_DROP_CONTROLS.map((control) => (
          <SwitchRow
            checked={options[control.key]}
            disabled={disabled}
            key={control.key}
            label={control.label}
            onCheckedChange={(checked) =>
              onHoldDropChange(control.key, checked)
            }
          />
        ))}
      </div>
      <div className="border-border/70 border-t p-2">
        <SwitchRow
          checked={options.removeHeaders}
          disabled={disabled}
          label={messages.socksRelay.removeHeadersLabel}
          onCheckedChange={onRemoveHeadersChange}
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
}: {
  readonly checked: boolean;
  readonly disabled?: boolean;
  readonly label: string;
  readonly onCheckedChange: (checked: boolean) => void;
}) {
  const switchId = useId();

  return (
    <div
      className={cn(
        "flex min-h-8 items-center justify-between gap-2 rounded-md border px-2 py-1 text-xs transition-colors",
        checked
          ? "border-primary/45 bg-primary/10 text-foreground"
          : "border-border/60 bg-muted/15 text-foreground"
      )}
    >
      <Label
        className="inline-flex min-w-0 flex-1 items-center"
        htmlFor={switchId}
        title={label}
      >
        <span className="inline-flex min-w-0 flex-1 items-center gap-2 pr-2 leading-snug">
          <span className="min-w-0 text-xs leading-tight">{label}</span>
        </span>
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
        description: messages.socksRelay.focusedLogScopeDescription,
      }
    );
  };
  let relayTableContent = (
    <div className="min-h-24 flex-1 animate-pulse rounded-lg border border-border/70 bg-muted/20" />
  );

  if (!isLoading && relays.length === 0) {
    relayTableContent = (
      <div className="grid min-h-24 flex-1 content-center gap-2 rounded-md border border-dashed p-3 text-center">
        <CircleOff className="mx-auto size-5 text-muted-foreground" />
        <p className="font-medium text-sm">
          {formatMessage(messages.socksRelay.noRelaysTitle, { modeLabel })}
        </p>
        <p className="text-muted-foreground text-xs">
          {messages.socksRelay.noRelaysDescription}
        </p>
      </div>
    );
  }

  if (!isLoading && relays.length > 0) {
    relayTableContent = (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-auto">
          <div className="flex min-h-0 min-w-[640px] flex-1 flex-col">
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
                <TableRow variant="subtle">
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
            <ScrollArea className="min-h-0 flex-1" variant="subtle">
              <div>
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
                          relay.relayId === selectedRelayId
                            ? "selected"
                            : undefined
                        }
                        key={relay.relayId}
                      >
                        <TableCell className="min-w-0">
                          <button
                            aria-label={formatMessage(
                              messages.socksRelay.selectRelayAria,
                              {
                                relayId: relay.relayId,
                              }
                            )}
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
                        <TableCell variant="truncate">
                          {relay.hostAddress}:{relay.hostPort}
                        </TableCell>
                        <TableCell className="max-w-[320px]" variant="truncate">
                          {summarizeRelayOptions(relay.options)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={relay.running ? "default" : "secondary"}
                          >
                            {relay.running
                              ? messages.socksRelay.runningStatus
                              : messages.socksRelay.stoppedStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              aria-label={formatMessage(
                                messages.socksRelay.stopRelayAria,
                                {
                                  relayId: relay.relayId,
                                }
                              )}
                              disabled={stopRelay.isPending}
                              onClick={() => stopRelay.mutate(relay.relayId)}
                              size="icon-sm"
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
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className="flex min-h-0 min-w-0 flex-col overflow-hidden"
      id={tourId}
      size="panel"
      variant="subtle"
    >
      <CardHeader
        className="flex shrink-0 flex-wrap items-center justify-between"
        size="sm"
      >
        <div>
          <CardTitle size="sm" variant="inline">
            <span className="grid size-5 place-items-center text-muted-foreground">
              <Cable className="size-4" />
            </span>
            {messages.socksRelay.relayInstancesTitle}
          </CardTitle>
        </div>
        <div className="flex items-center" id={liveControlsTourId}>
          <RelayLiveControls relay={selectedRelay} />
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col" size="sm">
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
          <SheetTitle>
            <span className="flex items-center gap-2">
              <Activity className="size-4" />
              {messages.socksRelay.liveControlsTitle}
            </span>
          </SheetTitle>
          <SheetDescription>
            {formatMessage(messages.socksRelay.liveControlsDescription, {
              relayId: relay.relayId,
            })}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap items-center gap-2 px-4">
          <span className="text-muted-foreground text-xs">
            {relay.running
              ? messages.socksRelay.runningStatus
              : messages.socksRelay.stoppedStatus}
          </span>
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
  const [search, setSearch] = useState("");
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
  const filteredEvents = scopedEvents.filter((event) =>
    JSON.stringify(event.payload)
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );
  const messageEvents = filteredEvents.filter(isRelayMessageEvent);
  const lifecycleEvents = filteredEvents.filter(
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
      className="flex min-h-80 min-w-0 flex-col overflow-hidden lg:min-h-0"
      id={tourId}
      size="panel"
      variant="subtle"
    >
      <CardHeader
        className="flex shrink-0 flex-wrap items-center justify-between"
        size="sm"
        variant="subtle"
      >
        <div>
          <CardTitle size="sm" variant="inline">
            <span className="grid size-5 place-items-center text-muted-foreground">
              <FileTerminal className="size-4" />
            </span>
            {messages.socksRelay.relayLogsTitle}
          </CardTitle>
          <CardDescription>{logScopeDescription}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 text-sm">
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
          <Button onClick={clearLogs} size="sm" type="button" variant="outline">
            <Eraser className="size-4" />
            {messages.socksRelay.clearLiveButton}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col" size="sm">
        <Tabs className="min-h-0 flex-1" defaultValue="message">
          <div className="flex flex-wrap items-center gap-2">
            <TabsList className="shrink-0" size="sm">
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
            <div className="min-w-36 flex-1">
              <Input
                aria-label={messages.socksRelay.searchLogs}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={messages.socksRelay.searchLogs}
                value={search}
              />
            </div>
            <span className="text-muted-foreground text-xs">
              {filteredEvents.length}
            </span>
          </div>
          <TabsContent className="min-h-0 flex-1 overflow-auto" value="message">
            <RelayEventList
              emptyLabel={
                search.trim()
                  ? messages.socksRelay.noMatchingLogs
                  : messages.socksRelay.noRelayMessages
              }
              events={messageEvents}
            />
          </TabsContent>
          <TabsContent className="min-h-0 flex-1 overflow-auto" value="event">
            <RelayEventList
              emptyLabel={
                search.trim()
                  ? messages.socksRelay.noMatchingLogs
                  : messages.socksRelay.noLifecycleEvents
              }
              events={lifecycleEvents}
            />
          </TabsContent>
          <TabsContent className="min-h-0 flex-1 overflow-auto" value="about">
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
              <TableRow variant="subtle">
                <TableHead>{messages.socksRelay.codeHeader}</TableHead>
                <TableHead>{messages.socksRelay.meaningHeader}</TableHead>
                <TableHead>{messages.socksRelay.noteHeader}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RELAY_FLOW_LEGEND.map((item) => (
                <TableRow key={item.code}>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-0.5 font-medium font-mono text-xs",
                        RELAY_FLOW_TONES[item.code]
                      )}
                    >
                      {item.code}
                    </span>
                  </TableCell>
                  <TableCell variant="medium">{item.meaning}</TableCell>
                  <TableCell variant="muted">{item.note}</TableCell>
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
          {getRelayBehaviorNotes().map((note) => (
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
      <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-border/70 bg-muted/20 p-4 text-center">
        <FileTerminal className="size-5 text-muted-foreground" />
        <p className="font-medium text-sm">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full min-h-0 min-w-0" variant="traffic">
      <div className="min-w-max p-3 font-mono text-foreground text-xs leading-5">
        <div className="grid gap-2">
          {events
            .slice()
            .reverse()
            .map((event) => (
              <RelayEventLine event={event} key={event.id} />
            ))}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function RelayEventLine({ event }: { readonly event: RelayEvent }) {
  const displayLine = event.payload.displayLine ?? null;
  const timestamp = event.payload.timestamp
    ? new Date(event.payload.timestamp).toLocaleTimeString()
    : new Date(event.receivedAt).toLocaleTimeString();
  const flow = event.payload.flow;
  const isMessage = isRelayMessageEvent(event);

  return (
    <div className="grid gap-1 rounded-md border border-border/70 bg-background/70 p-2">
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        <span className="text-muted-foreground">{timestamp}</span>
        <span className="font-semibold text-foreground">
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
          <span className="rounded bg-warning/15 px-1.5 py-0.5 font-semibold text-warning">
            {event.type}
          </span>
        )}
        {event.payload.jobId ? <span>job {event.payload.jobId}</span> : null}
      </div>
      {isMessage ? (
        <pre className="whitespace-pre-wrap break-words text-foreground">
          {displayLine ||
            event.payload.data ||
            event.payload.hex ||
            event.payload.base64 ||
            ""}
        </pre>
      ) : (
        <pre className="whitespace-pre-wrap break-words text-foreground">
          {displayLine ??
            event.payload.message ??
            JSON.stringify(event.payload, null, 2)}
        </pre>
      )}
    </div>
  );
}
