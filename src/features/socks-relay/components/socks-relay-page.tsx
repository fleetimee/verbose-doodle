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
  Pencil,
  Play,
  Radio,
  ShieldAlert,
  Square,
  TimerReset,
} from "lucide-react";
import type { Transition } from "motion/react";
import { motion, useReducedMotion } from "motion/react";
import type { FormEvent } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  useGetRelays,
  useStartRelay,
  useStopRelay,
  useUpdateRelayOptions,
} from "@/features/socks-relay/hooks/use-relays";
import type {
  RelayEvent,
  RelayFlow,
  RelayInstance,
  RelayMode,
  RelayOptions,
  RelayStartInput,
} from "@/features/socks-relay/types";
import {
  DEFAULT_RELAY_OPTIONS,
  getModeLabel,
  hasRelayFormErrors,
  isKnownRelayFlow,
  isRelayMessageEvent,
  type RelayFormErrors,
  summarizeRelayOptions,
  validateRelayStartInput,
} from "@/features/socks-relay/utils";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SocksRelayPageProps = {
  readonly mode: RelayMode;
};

type HoldDropKey = "holdClient" | "holdHost" | "dropClient" | "dropHost";

const pageStyle = { willChange: "opacity, transform" };
const sectionStyle = { willChange: "opacity, transform" };
const traceStyle = { originX: 0, willChange: "opacity, transform" };

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
    meaning: "Received from Client",
    note: "Relay received request/message from your caller.",
  },
  {
    code: "SH",
    meaning: "Send to Host",
    note: "Relay forwarded the client message to the target host.",
  },
  {
    code: "RH",
    meaning: "Received from Host",
    note: "Relay received the response/message from the target host.",
  },
  {
    code: "SC",
    meaning: "Send to Client",
    note: "Relay returned the host response back to your caller.",
  },
  {
    code: "HC",
    meaning: "Hold on Client",
    note: "Message is delayed when received by the relay from client side.",
  },
  {
    code: "HH",
    meaning: "Hold on Host",
    note: "Message is delayed after the host side response is received.",
  },
  {
    code: "DC",
    meaning: "Drop on Client",
    note: "Client-side message is dropped and not forwarded.",
  },
  {
    code: "DH",
    meaning: "Drop on Host",
    note: "Host-side message is dropped and not sent back.",
  },
] as const;

const RELAY_BEHAVIOR_NOTES = [
  "Hold: message akan dihold sesuai waktu yang ditentukan",
  "Hold and Drop: message akan didrop",
  "On Client: message dihold/drop saat diterima oleh aplikasi sock relay",
  "On Host: message akan dihold/drop setelah diterima oleh host",
] as const;

const RELAY_FLOW_TONES: Record<RelayFlow, string> = {
  RC: "border-sky-400/40 bg-sky-400/15 text-sky-200",
  SH: "border-indigo-400/40 bg-indigo-400/15 text-indigo-200",
  RH: "border-emerald-400/40 bg-emerald-400/15 text-emerald-200",
  SC: "border-teal-400/40 bg-teal-400/15 text-teal-200",
  HC: "border-amber-400/45 bg-amber-400/15 text-amber-200",
  HH: "border-orange-400/45 bg-orange-400/15 text-orange-200",
  DC: "border-rose-400/45 bg-rose-400/15 text-rose-200",
  DH: "border-red-400/45 bg-red-400/15 text-red-200",
};

const EMPTY_FORM: Omit<RelayStartInput, "mode"> = {
  relayId: "",
  listeningPort: 8090,
  hostAddress: "127.0.0.1",
  hostPort: 8085,
  ...DEFAULT_RELAY_OPTIONS,
};

export function SocksRelayPage({ mode }: SocksRelayPageProps) {
  const modeLabel = getModeLabel(mode);
  const relaysQuery = useGetRelays();
  const { events, malformedEventCount } = useSocksRelayContext();
  const shouldReduceMotion = useReducedMotion();
  const [selectedRelayId, setSelectedRelayId] = useState<string | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

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
          <RelayConnectionBadge />
        </div>
        <section className="flex flex-wrap gap-2">
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
                type: "spring",
                stiffness: 420,
                damping: 32,
                delay: shouldReduceMotion ? 0 : 0.12 + index * 0.045,
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
        <RelayStartForm mode={mode} />
        <RelayTable
          isLoading={relaysQuery.isLoading}
          modeLabel={modeLabel}
          onSelect={setSelectedRelayId}
          relays={relays}
          selectedRelayId={focusedRelayId}
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
        />
      </motion.div>
    </motion.div>
  );
}

function RelayConnectionBadge() {
  const { connectionStatus, malformedEventCount } = useSocksRelayContext();
  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex items-end lg:justify-end">
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

function RelayStartForm({ mode }: { readonly mode: RelayMode }) {
  const startRelay = useStartRelay();
  const [form, setForm] = useState<Omit<RelayStartInput, "mode">>(EMPTY_FORM);
  const [errors, setErrors] = useState<RelayFormErrors>({});

  const updateNumberField = (
    key: "hostPort" | "listeningPort" | "timerMs",
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [key]: Number.parseInt(value, 10) || 0,
    }));
  };

  const updateHoldDrop = (key: HoldDropKey, checked: boolean) => {
    setForm((current) => ({
      ...current,
      holdClient: false,
      holdHost: false,
      dropClient: false,
      dropHost: false,
      [key]: checked,
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input: RelayStartInput = {
      ...form,
      relayId: form.relayId.trim(),
      hostAddress: form.hostAddress.trim(),
      mode,
    };
    const nextErrors = validateRelayStartInput(input);
    setErrors(nextErrors);

    if (hasRelayFormErrors(nextErrors)) {
      return;
    }

    startRelay.mutate(input, {
      onSuccess: () => {
        setForm(EMPTY_FORM);
        setErrors({});
      },
    });
  };

  return (
    <Card className="rounded-lg border-border/70 py-5 shadow-sm">
      <CardHeader className="px-4 md:px-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid size-8 place-items-center rounded-md border border-border/70 bg-background text-primary shadow-xs">
            <Play className="size-4" />
          </span>
          {messages.socksRelay.startRelayTitle}
        </CardTitle>
        <CardDescription>
          {formatMessage(messages.socksRelay.startRelayDescription, {
            modeLabel: getModeLabel(mode),
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 md:px-5">
        <form className="grid gap-4" onSubmit={submit}>
          <FieldError message={errors.options} />
          <div className="grid gap-2">
            <Label htmlFor="relay-id">{messages.socksRelay.relayIdLabel}</Label>
            <Input
              id="relay-id"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  relayId: event.target.value,
                }))
              }
              placeholder={messages.socksRelay.relayIdPlaceholder}
              value={form.relayId}
            />
            <p className="text-muted-foreground text-xs">
              {messages.socksRelay.relayIdDescription}
            </p>
            <FieldError message={errors.relayId} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="listening-port">
                {messages.socksRelay.listeningPortLabel}
              </Label>
              <Input
                id="listening-port"
                inputMode="numeric"
                max={65_535}
                min={1}
                onChange={(event) =>
                  updateNumberField("listeningPort", event.target.value)
                }
                type="number"
                value={form.listeningPort}
              />
              <FieldError message={errors.listeningPort} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timer-ms">
                {messages.socksRelay.timerMsLabel}
              </Label>
              <Input
                id="timer-ms"
                inputMode="numeric"
                min={1000}
                onChange={(event) =>
                  updateNumberField("timerMs", event.target.value)
                }
                step={100}
                type="number"
                value={form.timerMs}
              />
              <FieldError message={errors.timerMs} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
            <div className="grid gap-2">
              <Label htmlFor="host-address">
                {messages.socksRelay.hostAddressLabel}
              </Label>
              <Input
                id="host-address"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hostAddress: event.target.value,
                  }))
                }
                placeholder="127.0.0.1"
                value={form.hostAddress}
              />
              <FieldError message={errors.hostAddress} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="host-port">
                {messages.socksRelay.hostPortLabel}
              </Label>
              <Input
                id="host-port"
                inputMode="numeric"
                max={65_535}
                min={1}
                onChange={(event) =>
                  updateNumberField("hostPort", event.target.value)
                }
                type="number"
                value={form.hostPort}
              />
              <FieldError message={errors.hostPort} />
            </div>
          </div>
          <RelayOptionsControls
            onHoldDropChange={updateHoldDrop}
            onRemoveHeadersChange={(checked) =>
              setForm((current) => ({ ...current, removeHeaders: checked }))
            }
            options={form}
          />
          <Button
            className="h-9 w-full gap-2 transition-transform duration-150 ease-out active:scale-[0.99]"
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
  onHoldDropChange,
  onRemoveHeadersChange,
  options,
}: {
  readonly onHoldDropChange: (key: HoldDropKey, checked: boolean) => void;
  readonly onRemoveHeadersChange: (checked: boolean) => void;
  readonly options: RelayOptions;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border/70 bg-muted/20 p-3 shadow-inner">
      <div className="grid gap-2 sm:grid-cols-2">
        {HOLD_DROP_CONTROLS.map((control) => (
          <SwitchRow
            checked={options[control.key]}
            key={control.key}
            label={control.label}
            onCheckedChange={(checked) =>
              onHoldDropChange(control.key, checked)
            }
            shortLabel={control.shortLabel}
          />
        ))}
      </div>
      <SwitchRow
        checked={options.removeHeaders}
        label={messages.socksRelay.removeHeadersLabel}
        onCheckedChange={onRemoveHeadersChange}
        shortLabel="REST"
      />
    </div>
  );
}

function SwitchRow({
  checked,
  label,
  onCheckedChange,
  shortLabel,
}: {
  readonly checked: boolean;
  readonly label: string;
  readonly onCheckedChange: (checked: boolean) => void;
  readonly shortLabel: string;
}) {
  const switchId = useId();

  return (
    <div className="flex min-h-10 items-center justify-between gap-3 rounded-md border border-border/60 bg-background/70 px-3 py-2 text-sm shadow-xs">
      <Label
        className="inline-flex min-w-0 flex-1 items-center gap-2 pr-2 leading-snug"
        htmlFor={switchId}
        title={label}
      >
        <Badge className="font-mono" variant="outline">
          {shortLabel}
        </Badge>
        <span className="min-w-0 text-wrap">{label}</span>
      </Label>
      <Switch
        checked={checked}
        className="shrink-0"
        id={switchId}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function RelayTable({
  isLoading,
  modeLabel,
  onSelect,
  relays,
  selectedRelayId,
}: {
  readonly isLoading: boolean;
  readonly modeLabel: string;
  readonly onSelect: (relayId: string) => void;
  readonly relays: RelayInstance[];
  readonly selectedRelayId: string | null;
}) {
  const stopRelay = useStopRelay();
  const [editingRelay, setEditingRelay] = useState<RelayInstance | null>(null);
  let relayTableContent = (
    <div className="h-56 animate-pulse rounded-lg border border-border/70 bg-muted/20" />
  );

  if (!isLoading && relays.length === 0) {
    relayTableContent = (
      <div className="grid min-h-56 place-items-center rounded-lg border border-border/70 border-dashed bg-muted/20 p-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-2">
          <span className="grid size-10 place-items-center rounded-md border border-border/70 bg-background text-muted-foreground shadow-xs">
            <CircleOff className="size-5" />
          </span>
          <p className="font-medium">
            {formatMessage(messages.socksRelay.noRelaysTitle, { modeLabel })}
          </p>
          <p className="text-muted-foreground text-sm">
            {messages.socksRelay.noRelaysDescription}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && relays.length > 0) {
    relayTableContent = (
      <div className="overflow-hidden rounded-lg border border-border/70">
        <Table>
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
          <TableBody>
            {relays.map((relay) => (
              <TableRow
                data-state={
                  relay.relayId === selectedRelayId ? "selected" : undefined
                }
                key={relay.relayId}
              >
                <TableCell>
                  <button
                    className="font-mono text-foreground text-sm underline-offset-4 hover:underline"
                    onClick={() => onSelect(relay.relayId)}
                    type="button"
                  >
                    {relay.relayId}
                  </button>
                </TableCell>
                <TableCell>{relay.listeningPort}</TableCell>
                <TableCell className="font-mono text-xs">
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
                      aria-label={`Edit ${relay.relayId} options`}
                      className="size-8"
                      onClick={() => setEditingRelay(relay)}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      aria-label={`Stop ${relay.relayId}`}
                      className="size-8"
                      disabled={stopRelay.isPending}
                      onClick={() => stopRelay.mutate(relay.relayId)}
                      size="icon"
                      type="button"
                      variant="destructive"
                    >
                      <Square className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <Card className="min-w-0 rounded-lg border-border/70 py-5 shadow-sm">
      <CardHeader className="px-4 md:px-5">
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
      </CardHeader>
      <CardContent className="px-4 md:px-5">{relayTableContent}</CardContent>
      <RelayOptionsDialog
        onOpenChange={(open) => {
          if (!open) {
            setEditingRelay(null);
          }
        }}
        relay={editingRelay}
      />
    </Card>
  );
}

function RelayOptionsDialog({
  onOpenChange,
  relay,
}: {
  readonly onOpenChange: (open: boolean) => void;
  readonly relay: RelayInstance | null;
}) {
  const updateOptions = useUpdateRelayOptions();
  const [options, setOptions] = useState<RelayOptions>(
    relay?.options ?? DEFAULT_RELAY_OPTIONS
  );

  useEffect(() => {
    if (relay) {
      setOptions(relay.options);
    }
  }, [relay]);

  const updateHoldDrop = (key: HoldDropKey, checked: boolean) => {
    setOptions((current) => ({
      ...current,
      holdClient: false,
      holdHost: false,
      dropClient: false,
      dropHost: false,
      [key]: checked,
    }));
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
      open={relay !== null}
    >
      <DialogContent className="rounded-lg border-border/70 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{messages.socksRelay.editRelayOptionsTitle}</DialogTitle>
          <DialogDescription>
            {formatMessage(messages.socksRelay.editRelayOptionsDescription, {
              relayId:
                relay?.relayId ?? messages.socksRelay.editRelayOptionsFallback,
            })}
          </DialogDescription>
        </DialogHeader>
        <RelayOptionsControls
          onHoldDropChange={updateHoldDrop}
          onRemoveHeadersChange={(checked) =>
            setOptions((current) => ({ ...current, removeHeaders: checked }))
          }
          options={options}
        />
        <div className="grid gap-2">
          <Label htmlFor="edit-timer-ms">
            {messages.socksRelay.timerMsLabel}
          </Label>
          <Input
            id="edit-timer-ms"
            inputMode="numeric"
            min={1000}
            onChange={(event) =>
              setOptions((current) => ({
                ...current,
                timerMs: Number.parseInt(event.target.value, 10) || 0,
              }))
            }
            step={100}
            type="number"
            value={options.timerMs}
          />
        </div>
        <DialogFooter>
          <Button
            className="gap-2"
            disabled={
              !relay || updateOptions.isPending || options.timerMs < 1000
            }
            onClick={() => {
              if (!relay) {
                return;
              }
              updateOptions.mutate(
                { relayId: relay.relayId, options },
                {
                  onSuccess: () => onOpenChange(false),
                }
              );
            }}
            type="button"
          >
            {messages.socksRelay.saveOptionsButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RelayLogConsole({
  focusedRelayId,
  mode,
  onShowAllLogsChange,
  showAllLogs,
}: {
  readonly focusedRelayId: string | null;
  readonly mode: RelayMode;
  readonly onShowAllLogsChange: (showAll: boolean) => void;
  readonly showAllLogs: boolean;
}) {
  const showAllLogsSwitchId = useId();
  const { clearLogs, events } = useSocksRelayContext();
  const scopedEvents = useMemo(
    () =>
      events.filter((event) => {
        if (event.payload.mode !== mode) {
          return false;
        }
        if (showAllLogs || !focusedRelayId) {
          return true;
        }
        return event.payload.relayId === focusedRelayId;
      }),
    [events, focusedRelayId, mode, showAllLogs]
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
    <Card className="min-w-0 rounded-lg border-border/70 py-5 shadow-sm">
      <CardHeader className="gap-4 px-4 md:grid-cols-[minmax(0,1fr)_auto] md:px-5">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="grid size-8 place-items-center rounded-md border border-border/70 bg-background text-primary shadow-xs">
              <FileTerminal className="size-4" />
            </span>
            {messages.socksRelay.relayLogsTitle}
          </CardTitle>
          <CardDescription>{logScopeDescription}</CardDescription>
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
            onClick={clearLogs}
            size="sm"
            type="button"
            variant="outline"
          >
            <Eraser className="size-4" />
            {messages.socksRelay.clearButton}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 md:px-5">
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
