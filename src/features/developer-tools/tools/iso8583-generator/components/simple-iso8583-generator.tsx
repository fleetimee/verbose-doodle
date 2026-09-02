import { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  ClipboardCopy,
  Code2,
  Info,
  RefreshCw,
  SendHorizontal,
} from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  cloneIso8583Fields,
  fieldTypeLabel,
  getIso8583Preset,
  ISO8583_PRESETS,
  type Iso8583Field,
  Iso8583PackingError,
  type Iso8583PresetId,
  incrementStan,
  nowValueForField,
  packIso8583,
} from "@/features/developer-tools/tools/iso8583-generator/pack-iso8583";
import { useSocketBridgeContext } from "@/features/socket-tester/context/socket-bridge-context";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const copy = messages.iso8583Generator;
const SIMPLE_PRESET_IDS: readonly Iso8583PresetId[] = [
  "sign-on",
  "transaction",
  "notification",
];
const MORE_PRESET_IDS: readonly Iso8583PresetId[] = [
  "authorization",
  "reversal",
  "batch",
  "network-response",
  "transaction-response",
  "notification-response",
];

const FIELD_EXPLANATIONS: Readonly<Record<number, string>> = {
  2: "The card or account number used for this test message. Use synthetic test data only.",
  3: "Identifies the transaction operation. The meaning of each code depends on the selected host profile.",
  4: "The transaction amount in minor units, without a decimal separator. For IDR, 000000010000 represents 10,000.",
  7: "The date and time the message enters the network, formatted as MMDDhhmmss.",
  11: "A six-digit trace number used to match a request with its response.",
  12: "The transaction time at the terminal or originating system, formatted as hhmmss.",
  13: "The transaction date at the terminal or originating system, formatted as MMDD.",
  14: "The card expiration date, formatted as YYMM. Use synthetic test card data only.",
  18: "Classifies the merchant or service type. Accepted values depend on the host profile.",
  22: "Describes how the card or account data was entered at the point of service.",
  25: "Describes the condition under which the transaction occurred.",
  32: "Identifies the institution that acquired or originated the transaction.",
  33: "Identifies the institution forwarding the message to the next participant.",
  37: "A reference used to identify and retrieve the transaction across systems.",
  38: "The authorization identifier returned for an approved or processed transaction.",
  39: "The result code returned by the host. Code meanings belong to the selected host profile.",
  41: "Identifies the terminal or channel that originated the transaction.",
  42: "Identifies the merchant, biller, or accepting organization.",
  43: "The accepting party name and location in the fixed-width host format.",
  49: "The three-digit numeric currency code for the transaction amount.",
  60: "Host-specific private data. Its internal format must follow the selected profile.",
  62: "Host-specific private data. Its internal format must follow the selected profile.",
  63: "Host-specific additional data. Its internal format must follow the selected profile.",
  70: "The network-management operation, such as sign-on, sign-off, or echo. Values depend on the host profile.",
  90: "Carries identifying details from the original transaction during a reversal.",
};

function fieldFormat(field: Iso8583Field) {
  if (field.kind === "llvar") {
    return `Up to ${field.length} characters. A 2-digit length prefix is added automatically.`;
  }
  if (field.kind === "lllvar") {
    return `Up to ${field.length} characters. A 3-digit length prefix is added automatically.`;
  }
  const content = field.kind === "n" ? "digits" : "ASCII characters";
  return `Exactly ${field.length} ${content}.`;
}

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

function datePart(date: Date) {
  return `${twoDigits(date.getMonth() + 1)}${twoDigits(date.getDate())}`;
}

function timePart(date: Date) {
  return `${twoDigits(date.getHours())}${twoDigits(date.getMinutes())}${twoDigits(date.getSeconds())}`;
}

function FieldDateTimePicker({
  fieldNumber,
  onChange,
}: {
  readonly fieldNumber: number;
  readonly onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const supportsDate = fieldNumber === 7 || fieldNumber === 13;
  const supportsTime = fieldNumber === 7 || fieldNumber === 12;
  const supportsMonth = fieldNumber === 14;

  const writeValue = (date: Date) => {
    if (fieldNumber === 7) {
      onChange(`${datePart(date)}${timePart(date)}`);
    } else if (fieldNumber === 12) {
      onChange(timePart(date));
    } else if (fieldNumber === 13) {
      onChange(datePart(date));
    } else if (fieldNumber === 14) {
      onChange(
        `${twoDigits(date.getFullYear() % 100)}${twoDigits(date.getMonth() + 1)}`
      );
    }
  };

  const chooseDate = (date: Date | undefined) => {
    if (!date) {
      return;
    }
    const next = new Date(selectedDate);
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDate(next);
    writeValue(next);
    if (fieldNumber === 13) {
      setOpen(false);
    }
  };

  const chooseTime = (value: string) => {
    const [hours = "0", minutes = "0", seconds = "0"] = value.split(":");
    const next = new Date(selectedDate);
    next.setHours(Number(hours), Number(minutes), Number(seconds), 0);
    setSelectedDate(next);
    writeValue(next);
  };

  const chooseMonth = (value: string) => {
    const [year, month] = value.split("-");
    if (!(year && month)) {
      return;
    }
    const next = new Date(selectedDate);
    next.setFullYear(Number(year), Number(month) - 1, 1);
    setSelectedDate(next);
    writeValue(next);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={`Pick value for bit ${fieldNumber}`}
          className="h-6 shrink-0 px-2 text-[10px]"
          type="button"
          variant="ghost"
        >
          <CalendarClock />
          Pick
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        {supportsDate ? (
          <Calendar
            captionLayout="dropdown"
            mode="single"
            onSelect={chooseDate}
            selected={selectedDate}
          />
        ) : null}
        {supportsTime ? (
          <div className="border-t p-3">
            <label
              className="font-medium text-xs"
              htmlFor={`iso-time-${fieldNumber}`}
            >
              Time
            </label>
            <Input
              className="mt-2 font-mono"
              id={`iso-time-${fieldNumber}`}
              onChange={(event) => chooseTime(event.currentTarget.value)}
              step="1"
              type="time"
              value={`${twoDigits(selectedDate.getHours())}:${twoDigits(selectedDate.getMinutes())}:${twoDigits(selectedDate.getSeconds())}`}
            />
          </div>
        ) : null}
        {supportsMonth ? (
          <div className="p-3">
            <label className="font-medium text-xs" htmlFor="iso-expiry-month">
              Expiration month
            </label>
            <Input
              className="mt-2 font-mono"
              id="iso-expiry-month"
              onChange={(event) => chooseMonth(event.currentTarget.value)}
              type="month"
              value={`${selectedDate.getFullYear()}-${twoDigits(selectedDate.getMonth() + 1)}`}
            />
          </div>
        ) : null}
        <div className="border-t p-3">
          <Button
            className="w-full"
            onClick={() => {
              const now = new Date();
              setSelectedDate(now);
              writeValue(now);
              setOpen(false);
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            Use current {supportsTime ? "date and time" : "date"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function presetFields(id: Iso8583PresetId) {
  return cloneIso8583Fields(getIso8583Preset(id).fields);
}

function FieldInput({
  field,
  invalid,
  onChange,
  onHelper,
  onToggle,
}: {
  readonly field: Iso8583Field;
  readonly invalid: boolean;
  readonly onChange: (value: string) => void;
  readonly onHelper: () => void;
  readonly onToggle: (enabled: boolean) => void;
}) {
  const label = formatMessage(copy.fieldInput, {
    label: field.label,
    number: field.number,
  });
  const hasDateTimePicker = [7, 12, 13, 14].includes(field.number);

  return (
    <div className={cn("min-w-0 space-y-2", !field.enabled && "opacity-55")}>
      <div className="flex min-w-0 items-center gap-2">
        <Checkbox
          aria-label={`Enable bit ${field.number}`}
          checked={field.enabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
        />
        <label
          className="min-w-0 truncate font-medium text-xs"
          htmlFor={`iso-field-${field.number}`}
        >
          <span className="mr-1.5 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            BIT {field.number}
          </span>
          {field.label}
        </label>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              aria-label={`Explain bit ${field.number}`}
              className="ml-auto size-6 shrink-0 text-muted-foreground"
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Info />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Bit {field.number}: {field.label}
              </DialogTitle>
              <DialogDescription>
                {FIELD_EXPLANATIONS[field.number] ??
                  "This data element is defined by the selected ISO 8583 host profile."}
              </DialogDescription>
            </DialogHeader>
            <dl className="grid gap-4 border-t pt-4 text-sm">
              <div>
                <dt className="font-medium">Accepted format</dt>
                <dd className="mt-1 text-muted-foreground">
                  {fieldFormat(field)}
                </dd>
              </div>
              {field.value ? (
                <div>
                  <dt className="font-medium">Current example</dt>
                  <dd className="mt-1 break-all font-mono text-muted-foreground">
                    {field.number === 2 ? "Synthetic test PAN" : field.value}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="font-medium">Bitmap behavior</dt>
                <dd className="mt-1 text-muted-foreground">
                  Enable this field to include bit {field.number}. Disable it to
                  remove the bit and its value from the generated message.
                </dd>
              </div>
            </dl>
          </DialogContent>
        </Dialog>
        {hasDateTimePicker ? (
          <FieldDateTimePicker fieldNumber={field.number} onChange={onChange} />
        ) : null}
        {!hasDateTimePicker && field.helper ? (
          <Button
            aria-label={`${field.helper === "stan" ? copy.autoIncrement : copy.now} Bit ${field.number}`}
            className="h-6 shrink-0 px-2 text-[10px]"
            onClick={onHelper}
            type="button"
            variant="ghost"
          >
            {field.helper === "stan" ? copy.autoIncrement : copy.now}
          </Button>
        ) : null}
      </div>
      <Input
        aria-invalid={invalid || undefined}
        aria-label={label}
        autoComplete="off"
        className="h-10 bg-background font-mono text-sm shadow-none"
        disabled={!field.enabled}
        id={`iso-field-${field.number}`}
        inputMode={field.kind === "n" ? "numeric" : "text"}
        maxLength={field.length || undefined}
        onChange={(event) => onChange(event.currentTarget.value)}
        spellCheck={false}
        value={field.value}
      />
      <p className="font-mono text-[10px] text-muted-foreground">
        {fieldTypeLabel(field)}
      </p>
    </div>
  );
}

export function Iso8583Generator() {
  const bridge = useSocketBridgeContext();
  const [presetId, setPresetId] = useState<Iso8583PresetId>("sign-on");
  const [fields, setFields] = useState(() => presetFields("sign-on"));
  const [generatedPayload, setGeneratedPayload] = useState("");
  const [copied, setCopied] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const preset = getIso8583Preset(presetId);
  const packedState = useMemo(() => {
    try {
      return {
        error: null,
        message: packIso8583({
          autoBitmap: true,
          autoLengthHeader: true,
          bitmapEncoding: "hex",
          fields,
          headerType: "ascii-4",
          mti: preset.mti,
        }),
      };
    } catch (error) {
      return {
        error:
          error instanceof Iso8583PackingError
            ? error
            : new Iso8583PackingError("field", "Could not pack this message."),
        message: null,
      };
    }
  }, [fields, preset.mti]);

  const choosePreset = (nextPresetId: Iso8583PresetId) => {
    setPresetId(nextPresetId);
    setFields(presetFields(nextPresetId));
    setGeneratedPayload("");
    setOutputOpen(false);
    setCopied(false);
    setStatus(null);
  };

  const updateField = (number: number, update: Partial<Iso8583Field>) => {
    setFields((current) =>
      current.map((field) =>
        field.number === number ? { ...field, ...update } : field
      )
    );
    setGeneratedPayload("");
    setCopied(false);
    setStatus(null);
  };

  const generate = () => {
    if (!packedState.message) {
      return;
    }
    const generatedFields = fields.map((field) => {
      if (field.number === 7 && field.helper === "now") {
        return { ...field, value: nowValueForField(7) };
      }
      if (field.number === 11 && field.helper === "stan") {
        return { ...field, value: incrementStan(field.value) };
      }
      return field;
    });
    const message = packIso8583({
      autoBitmap: true,
      autoLengthHeader: true,
      bitmapEncoding: "hex",
      fields: generatedFields,
      headerType: "ascii-4",
      mti: preset.mti,
    });
    setFields(generatedFields);
    setGeneratedPayload(message.displayPayload);
    setOutputOpen(true);
    setCopied(false);
    setStatus(null);
  };

  const copyOutput = async () => {
    if (!generatedPayload) {
      return;
    }
    const didCopy = await copyToClipboard(generatedPayload);
    setCopied(didCopy);
    setStatus(didCopy ? copy.copied : copy.copyFailed);
  };

  const sendToTcp = () => {
    if (!(generatedPayload && packedState.message)) {
      return;
    }
    const encoding = packedState.message.isPrintable ? "ascii" : "hex";
    const value = packedState.message.isPrintable
      ? packedState.message.payload
      : packedState.message.hexPayload;
    bridge.sendTcpClient(value, encoding, "");
    setStatus(copy.sentToTcp);
  };

  const visibleFields = fields
    .filter((field) => !field.hidden)
    .sort((left, right) => left.number - right.number);

  return (
    <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 pb-10 md:grid-cols-[210px_minmax(0,1fr)] md:gap-10 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-14">
      <aside className="md:sticky md:top-6 md:self-start">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
          Developer tools / wire format
        </p>
        <h1 className="mt-4 max-w-52 font-semibold text-3xl leading-[0.96] tracking-[-0.04em]">
          {copy.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-sm leading-6">
          Fill the fields, then generate a raw ISO 8583 message.
        </p>

        <dl className="mt-8 border-y text-xs">
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">Messages</dt>
            <dd className="font-mono">9 presets</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">Profile</dt>
            <dd>BPD DIY ASCII</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">Output</dt>
            <dd>Raw message sheet</dd>
          </div>
        </dl>
      </aside>

      <main className="min-w-0">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          <div
            aria-label={copy.preset}
            className="grid flex-1 grid-cols-3 gap-1 rounded-lg border bg-muted/25 p-1"
            role="tablist"
          >
            {ISO8583_PRESETS.filter((item) =>
              SIMPLE_PRESET_IDS.includes(item.id)
            ).map((item) => (
              <button
                aria-selected={item.id === presetId}
                className={cn(
                  "min-h-14 rounded-md px-3 py-2 text-center font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  item.id === presetId
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
                key={item.id}
                onClick={() => choosePreset(item.id)}
                role="tab"
                type="button"
              >
                <span className="block font-semibold">{item.mti}</span>
                <span className="mt-0.5 block truncate font-sans">
                  {item.label.split("·")[1]?.trim() ?? item.label}
                </span>
              </button>
            ))}
          </div>
          <Select
            onValueChange={(value) => choosePreset(value as Iso8583PresetId)}
            value={MORE_PRESET_IDS.includes(presetId) ? presetId : ""}
          >
            <SelectTrigger
              aria-label="More messages"
              className="h-auto min-h-14 bg-background shadow-none sm:w-48"
            >
              <SelectValue placeholder="More messages" />
            </SelectTrigger>
            <SelectContent>
              {ISO8583_PRESETS.filter((item) =>
                MORE_PRESET_IDS.includes(item.id)
              ).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <section
            aria-label={copy.fields}
            className="flex flex-col overflow-hidden rounded-xl border bg-card md:min-h-[calc(100dvh-16rem)]"
          >
            <div className="border-b px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">
                  {preset.label.split("·")[1]?.trim()}
                </h2>
                <span className="rounded-sm bg-primary/10 px-2 py-1 font-mono text-primary text-xs">
                  MTI {preset.mti}
                </span>
              </div>
            </div>

            <div className="grid gap-x-4 gap-y-5 p-5 sm:grid-cols-2">
              {visibleFields.map((field) => (
                <div
                  className={cn(field.length > 40 && "sm:col-span-2")}
                  key={field.number}
                >
                  <FieldInput
                    field={field}
                    invalid={packedState.error?.fieldNumber === field.number}
                    onChange={(value) => updateField(field.number, { value })}
                    onHelper={() =>
                      updateField(field.number, {
                        value:
                          field.helper === "stan"
                            ? incrementStan(field.value)
                            : nowValueForField(field.number),
                      })
                    }
                    onToggle={(enabled) =>
                      updateField(field.number, { enabled })
                    }
                  />
                </div>
              ))}
            </div>

            {packedState.error ? (
              <div
                className="mx-5 mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-destructive text-xs"
                role="alert"
              >
                {packedState.error.message}
              </div>
            ) : null}

            <div className="mt-auto border-t p-5">
              <Button
                className="h-11 w-full"
                disabled={!packedState.message}
                onClick={generate}
                type="button"
              >
                <RefreshCw data-icon="inline-start" />
                Generate raw message
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Sheet onOpenChange={setOutputOpen} open={outputOpen}>
        {generatedPayload ? (
          <SheetTrigger asChild>
            <Button
              className="fixed right-6 bottom-6 z-40 h-11 shadow-lg"
              type="button"
            >
              <Code2 />
              View raw message
            </Button>
          </SheetTrigger>
        ) : null}
        <SheetContent className="gap-0 p-0 sm:max-w-xl" side="right">
          <SheetHeader className="border-b pr-14">
            <SheetTitle>Raw message</SheetTitle>
            <SheetDescription>
              Generated {preset.mti} message using the current field values.
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-end gap-1 border-b bg-muted/20 px-4 py-3">
            <Button
              aria-label={copied ? copy.copied : copy.copy}
              disabled={!generatedPayload}
              onClick={copyOutput}
              size="sm"
              type="button"
              variant="outline"
            >
              {copied ? <Check /> : <ClipboardCopy />}
              {copied ? copy.copied : copy.copy}
            </Button>
            <Button
              aria-label={copy.sendToTcp}
              disabled={!generatedPayload}
              onClick={sendToTcp}
              size="sm"
              type="button"
              variant="outline"
            >
              <SendHorizontal />
              Send to TCP
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Textarea
              aria-label={copy.rawStream}
              className="min-h-72 resize-none rounded-none border-0 bg-transparent p-5 font-mono text-xs leading-6 shadow-none focus-visible:ring-0"
              readOnly
              value={generatedPayload}
            />
            {packedState.message ? (
              <section
                aria-label="Bitmap inspector"
                className="border-t px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium text-sm">Bitmap</h3>
                  <code className="break-all font-mono text-xs">
                    {packedState.message.bitmap}
                  </code>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {packedState.message.activeFields.map((number) => (
                    <span
                      className="rounded-sm bg-muted px-1.5 py-1 font-mono text-[10px] text-muted-foreground"
                      key={number}
                    >
                      Bit {number}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}
            {status ? (
              <p
                className="border-t px-5 py-3 font-mono text-primary text-xs"
                role="status"
              >
                {status}
              </p>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
