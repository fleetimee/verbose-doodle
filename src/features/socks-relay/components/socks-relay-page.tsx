import {
  Cable,
  CircleOff,
  Eraser,
  FileTerminal,
  ListFilter,
  Pencil,
  Play,
  ShieldAlert,
  Square,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

type SocksRelayPageProps = {
  readonly mode: RelayMode;
};

type HoldDropKey = "holdClient" | "holdHost" | "dropClient" | "dropHost";

const HOLD_DROP_CONTROLS: {
  readonly key: HoldDropKey;
  readonly label: string;
  readonly shortLabel: string;
}[] = [
  { key: "holdClient", label: "Hold client", shortLabel: "HC" },
  { key: "holdHost", label: "Hold host", shortLabel: "HH" },
  { key: "dropClient", label: "Drop client", shortLabel: "DC" },
  { key: "dropHost", label: "Drop host", shortLabel: "DH" },
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
  "Hold delays the message using the configured timer.",
  "Drop discards the message.",
  "Only one hold/drop option can be active at a time.",
  "On Client applies when the relay receives data from the caller.",
  "On Host applies after data is received from the target host.",
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
  listeningPort: 8080,
  hostAddress: "",
  hostPort: 8081,
  ...DEFAULT_RELAY_OPTIONS,
};

export function SocksRelayPage({ mode }: SocksRelayPageProps) {
  const modeLabel = getModeLabel(mode);
  const relaysQuery = useGetRelays();
  const [selectedRelayId, setSelectedRelayId] = useState<string | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const relays = useMemo(
    () => (relaysQuery.data ?? []).filter((relay) => relay.mode === mode),
    [mode, relaysQuery.data]
  );
  const selectedRelay =
    relays.find((relay) => relay.relayId === selectedRelayId) ?? relays[0];
  const focusedRelayId = selectedRelay?.relayId ?? null;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      <div className="grid gap-4 border-border/70 border-b pb-6 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
            Socks Relay
          </p>
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">
            {modeLabel}
          </h1>
          <p className="mt-3 max-w-[70ch] text-muted-foreground text-sm leading-relaxed md:text-base">
            Start relay listeners, tune hold/drop behavior, and watch live
            message flow without leaving the dashboard.
          </p>
        </div>
        <RelayConnectionBadge />
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <RelayStartForm mode={mode} />
        <RelayTable
          isLoading={relaysQuery.isLoading}
          modeLabel={modeLabel}
          onSelect={setSelectedRelayId}
          relays={relays}
          selectedRelayId={focusedRelayId}
        />
      </div>

      <RelayLogConsole
        focusedRelayId={focusedRelayId}
        mode={mode}
        onShowAllLogsChange={setShowAllLogs}
        showAllLogs={showAllLogs}
      />
    </div>
  );
}

function RelayConnectionBadge() {
  const { connectionStatus, malformedEventCount } = useSocksRelayContext();
  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex items-end md:justify-end">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm shadow-xs">
        <span
          className={cn(
            "size-2 rounded-full",
            isConnected ? "bg-emerald-500" : "bg-amber-500"
          )}
        />
        <span className="font-medium">Relay events</span>
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
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="size-4" />
          Start relay
        </CardTitle>
        <CardDescription>
          Mode is fixed to {getModeLabel(mode)} for this page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <FieldError message={errors.options} />
          <div className="grid gap-2">
            <Label htmlFor="relay-id">Relay ID</Label>
            <Input
              id="relay-id"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  relayId: event.target.value,
                }))
              }
              placeholder="rest-main-01"
              value={form.relayId}
            />
            <FieldError message={errors.relayId} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="listening-port">Listening port</Label>
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
              <Label htmlFor="timer-ms">Timer ms</Label>
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
              <Label htmlFor="host-address">Host address</Label>
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
              <Label htmlFor="host-port">Host port</Label>
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
            className="w-full"
            disabled={startRelay.isPending}
            type="submit"
          >
            <Play className="size-4" />
            {startRelay.isPending ? "Starting..." : "Start relay"}
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
    <div className="grid gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
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
        label="Remove headers"
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
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/70 px-3 py-2 text-sm">
      <Label className="inline-flex items-center gap-2" htmlFor={switchId}>
        <Badge className="font-mono" variant="outline">
          {shortLabel}
        </Badge>
        {label}
      </Label>
      <Switch
        checked={checked}
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
    <div className="h-56 rounded-lg border border-border/70 bg-muted/20" />
  );

  if (!isLoading && relays.length === 0) {
    relayTableContent = (
      <div className="grid min-h-56 place-items-center rounded-lg border border-dashed bg-muted/20 p-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-2">
          <CircleOff className="size-8 text-muted-foreground" />
          <p className="font-medium">No {modeLabel} relays</p>
          <p className="text-muted-foreground text-sm">
            Start an instance to see it here and focus its live logs.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoading && relays.length > 0) {
    relayTableContent = (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Relay</TableHead>
            <TableHead>Listen</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Options</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
              <TableCell className="max-w-[320px] truncate text-muted-foreground">
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
                    onClick={() => setEditingRelay(relay)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    aria-label={`Stop ${relay.relayId}`}
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
    );
  }

  return (
    <Card className="min-w-0 rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cable className="size-4" />
          Relay instances
        </CardTitle>
        <CardDescription>
          Running {modeLabel} listeners and their active simulation options.
        </CardDescription>
      </CardHeader>
      <CardContent>{relayTableContent}</CardContent>
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit relay options</DialogTitle>
          <DialogDescription>
            {relay?.relayId ?? "Relay"} updates apply to new relay traffic.
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
          <Label htmlFor="edit-timer-ms">Timer ms</Label>
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
            Save options
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
  let logScopeDescription = "Select a relay row to focus its logs";
  if (showAllLogs) {
    logScopeDescription = `Showing all ${getModeLabel(mode)} relays`;
  } else if (focusedRelayId) {
    logScopeDescription = `Focused on ${focusedRelayId}`;
  }

  return (
    <Card className="min-w-0 rounded-lg">
      <CardHeader className="gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileTerminal className="size-4" />
            Relay logs
          </CardTitle>
          <CardDescription>{logScopeDescription}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-sm">
            <ListFilter className="size-4" />
            <Label htmlFor={showAllLogsSwitchId}>All relays</Label>
            <Switch
              checked={showAllLogs}
              id={showAllLogsSwitchId}
              onCheckedChange={onShowAllLogsChange}
            />
          </div>
          <Button onClick={clearLogs} type="button" variant="outline">
            <Eraser className="size-4" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="message">
          <TabsList>
            <TabsTrigger value="message">Message</TabsTrigger>
            <TabsTrigger value="event">Event</TabsTrigger>
            <TabsTrigger value="legend">Legend</TabsTrigger>
          </TabsList>
          <TabsContent value="message">
            <RelayEventList
              emptyLabel="No relay messages yet."
              events={messageEvents}
            />
          </TabsContent>
          <TabsContent value="event">
            <RelayEventList
              emptyLabel="No lifecycle or error events yet."
              events={lifecycleEvents}
            />
          </TabsContent>
          <TabsContent value="legend">
            <RelayLegend />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function RelayLegend() {
  return (
    <div className="grid gap-4 rounded-lg border bg-muted/10 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Meaning</TableHead>
              <TableHead>Note</TableHead>
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
      <div className="rounded-lg border border-border/70 bg-background/70 p-4">
        <h3 className="font-semibold text-sm">Behavior notes</h3>
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
      <div className="grid min-h-64 place-items-center rounded-lg border border-dashed bg-muted/20 p-8 text-center text-muted-foreground text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="max-h-[520px] overflow-auto rounded-lg border bg-black/95 p-3 font-mono text-[12px] text-zinc-100">
      <div className="grid gap-2">
        {events
          .slice()
          .reverse()
          .map((event) => (
            <RelayEventLine event={event} key={event.id} />
          ))}
      </div>
    </div>
  );
}

function RelayEventLine({ event }: { readonly event: RelayEvent }) {
  const timestamp = event.payload.timestamp
    ? new Date(event.payload.timestamp).toLocaleTimeString()
    : new Date(event.receivedAt).toLocaleTimeString();
  const flow = event.payload.flow;
  const isMessage = isRelayMessageEvent(event);

  return (
    <div className="grid gap-1 rounded-md border border-white/10 bg-white/[0.03] p-2">
      <div className="flex flex-wrap items-center gap-2 text-zinc-400">
        <span>{timestamp}</span>
        <span>{event.payload.relayId ?? "unknown-relay"}</span>
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
        <pre className="whitespace-pre-wrap break-words text-zinc-100">
          {event.payload.data ||
            event.payload.hex ||
            event.payload.base64 ||
            ""}
        </pre>
      ) : (
        <pre className="whitespace-pre-wrap break-words text-zinc-100">
          {event.payload.message ?? JSON.stringify(event.payload, null, 2)}
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
