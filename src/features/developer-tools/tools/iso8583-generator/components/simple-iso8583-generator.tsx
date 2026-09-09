import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  ClipboardCopy,
  Code2,
  Info,
  RefreshCw,
} from "@/components/hugeicons";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockThemeSelector,
} from "@/components/kibo-ui/code-block";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          className="shrink-0"
          size="sm"
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
    <Field
      className="min-w-0 gap-2.5"
      data-disabled={!field.enabled || undefined}
      data-invalid={invalid || undefined}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Checkbox
          aria-label={`Enable bit ${field.number}`}
          checked={field.enabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
        />
        <label
          className="min-w-0 flex-1 font-medium text-sm leading-5"
          htmlFor={`iso-field-${field.number}`}
        >
          <span className="mr-2 inline-block font-mono text-muted-foreground text-xs tabular-nums">
            {String(field.number).padStart(2, "0")}
          </span>
          {field.label}
        </label>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              aria-label={`Explain bit ${field.number}`}
              className="shrink-0"
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
            className="shrink-0"
            onClick={onHelper}
            size="sm"
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
        className="h-11 font-mono"
        disabled={!field.enabled}
        id={`iso-field-${field.number}`}
        inputMode={field.kind === "n" ? "numeric" : "text"}
        maxLength={field.length || undefined}
        onChange={(event) => onChange(event.currentTarget.value)}
        spellCheck={false}
        value={field.value}
      />
      <p className="font-mono text-muted-foreground text-xs">
        {fieldTypeLabel(field)}
      </p>
    </Field>
  );
}

export function Iso8583Generator() {
  const [presetId, setPresetId] = useState<Iso8583PresetId>("sign-on");
  const [fields, setFields] = useState(() => presetFields("sign-on"));
  const [generatedPayload, setGeneratedPayload] = useState("");
  const [copied, setCopied] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [payloadView, setPayloadView] = useState<"json" | "text">("json");
  const { resolvedTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const preset = getIso8583Preset(presetId);
  const morePreset = MORE_PRESET_IDS.includes(presetId) ? preset : null;
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

  const visibleFields = fields
    .filter((field) => !field.hidden)
    .sort((left, right) => left.number - right.number);

  const formattedJson = useMemo(() => {
    if (!packedState.message) {
      return "";
    }
    const fieldMap: Record<string, { definition?: string; value: string }> = {};
    for (const f of fields.filter((f) => f.enabled)) {
      fieldMap[`bit_${f.number}`] = {
        definition: f.label,
        value: f.value,
      };
    }
    return JSON.stringify(
      {
        active_bits: packedState.message.activeFields,
        bitmap: packedState.message.bitmap,
        fields: fieldMap,
        mti: preset.mti,
        preset: preset.label,
        raw_stream: generatedPayload || packedState.message.displayPayload,
      },
      null,
      2
    );
  }, [packedState.message, fields, preset, generatedPayload]);

  const codeBlockData = useMemo(
    () => [
      {
        code: formattedJson,
        filename: "iso8583-message.json",
        language: "json",
      },
      {
        code: generatedPayload || packedState.message?.displayPayload || "",
        filename: "raw-stream.txt",
        language: "text",
      },
    ],
    [formattedJson, generatedPayload, packedState.message?.displayPayload]
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-7 pb-10 sm:gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
            {copy.title}
          </h1>
          <p className="text-muted-foreground text-sm leading-6">
            Fill the fields, then generate a raw ISO 8583 message.
          </p>
        </div>
        <Badge className="shrink-0 self-start sm:self-center" variant="outline">
          BPD DIY ASCII
        </Badge>
      </header>

      <main className="min-w-0">
        <div className="mb-6 flex flex-col gap-2">
          <p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
            Message preset
          </p>
          <div className="flex flex-col rounded-lg border bg-muted p-1 shadow-xs sm:flex-row">
            <Tabs
              className="min-w-0 flex-1 gap-0"
              onValueChange={(value) => choosePreset(value as Iso8583PresetId)}
              value={presetId}
            >
              <TabsList
                aria-label={copy.preset}
                className="grid h-14 w-full grid-cols-3 rounded-md bg-transparent p-0"
              >
                {ISO8583_PRESETS.filter((item) =>
                  SIMPLE_PRESET_IDS.includes(item.id)
                ).map((item) => (
                  <TabsTrigger
                    className="relative flex-col gap-0 overflow-hidden rounded-md px-3 data-active:bg-background data-active:shadow-xs"
                    key={item.id}
                    value={item.id}
                  >
                    <span
                      className={cn(
                        "font-mono text-muted-foreground text-xs",
                        presetId === item.id && "text-primary"
                      )}
                    >
                      {item.mti}
                    </span>
                    <span className="text-xs sm:text-sm">
                      {item.label.split("·")[1]?.trim() ?? item.label}
                    </span>
                    {presetId === item.id ? (
                      <motion.span
                        className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
                        layoutId={
                          shouldReduceMotion
                            ? undefined
                            : "iso8583-active-preset"
                        }
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.25,
                          ease: [0.77, 0, 0.175, 1],
                        }}
                      />
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="mx-1 hidden w-px bg-border sm:block" />

            <Select
              onValueChange={(value) => choosePreset(value as Iso8583PresetId)}
              value={morePreset ? presetId : ""}
            >
              <SelectTrigger
                aria-label="More messages"
                className={cn(
                  "w-full border-transparent shadow-none data-[size=default]:h-11 sm:w-52 sm:data-[size=default]:h-14",
                  morePreset && "bg-background shadow-xs"
                )}
              >
                <SelectValue placeholder="More messages">
                  {morePreset ? morePreset.label : "More messages"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:data-ending-style:transform-none motion-reduce:data-starting-style:transform-none">
                <SelectGroup>
                  {ISO8583_PRESETS.filter((item) =>
                    MORE_PRESET_IDS.includes(item.id)
                  ).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.section
          animate={{ opacity: 1, transform: "translateY(0)" }}
          aria-label={copy.fields}
          className="flex flex-col overflow-hidden rounded-xl border bg-card"
          initial={{
            opacity: shouldReduceMotion ? 0.7 : 0.45,
            transform: shouldReduceMotion
              ? "translateY(0)"
              : "translateY(14px)",
          }}
          key={presetId}
          transition={{
            duration: shouldReduceMotion ? 0.12 : 0.22,
            ease: [0.23, 1, 0.32, 1],
          }}
        >
          <div className="border-b bg-muted/20 px-5 py-5 sm:px-7">
            <h2 className="font-semibold">
              {preset.label.split("·")[1]?.trim()} message
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              {preset.description}
            </p>
          </div>

          <FieldGroup className="grid gap-x-8 gap-y-7 p-5 sm:grid-cols-2 sm:p-7">
            {visibleFields.map((field, index) => (
              <motion.div
                animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
                className={cn(field.length > 40 && "sm:col-span-2")}
                initial={{
                  opacity: shouldReduceMotion ? 0.7 : 0,
                  transform: shouldReduceMotion
                    ? "translateY(0) scale(1)"
                    : "translateY(14px) scale(0.985)",
                }}
                key={field.number}
                transition={{
                  delay: shouldReduceMotion ? 0 : Math.min(index, 4) * 0.04,
                  duration: shouldReduceMotion ? 0.12 : 0.22,
                  ease: [0.23, 1, 0.32, 1],
                }}
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
                  onToggle={(enabled) => updateField(field.number, { enabled })}
                />
              </motion.div>
            ))}
          </FieldGroup>

          {packedState.error ? (
            <div
              className="mx-5 mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-destructive text-xs"
              role="alert"
            >
              {packedState.error.message}
            </div>
          ) : null}

          <div className="flex justify-end border-t bg-muted/20 p-5 sm:px-7">
            <Button
              className="h-11 w-full sm:w-auto sm:min-w-56"
              disabled={!packedState.message}
              onClick={generate}
              type="button"
            >
              <RefreshCw data-icon="inline-start" />
              Generate raw message
            </Button>
          </div>
        </motion.section>
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
        <SheetContent
          className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
          side="right"
        >
          <SheetHeader className="shrink-0 gap-1.5 border-b bg-muted/10 p-6 pr-14">
            <SheetTitle className="text-xl">Raw message</SheetTitle>
            <SheetDescription className="text-sm">
              Generated {preset.mti} message using the current field values.
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-6 sm:p-8">
            <CodeBlock
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border shadow-xs"
              data={codeBlockData}
              defaultValue="json"
              onValueChange={(val) => setPayloadView(val as "json" | "text")}
              storageKey="response-preview-themes"
              value={payloadView}
            >
              <CodeBlockHeader className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Tabs
                    onValueChange={(val) =>
                      setPayloadView(val as "json" | "text")
                    }
                    value={payloadView}
                  >
                    <TabsList className="h-8 bg-muted/80 p-1">
                      <TabsTrigger
                        className="h-6 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-xs"
                        value="json"
                      >
                        Formatted (JSON)
                      </TabsTrigger>
                      <TabsTrigger
                        className="h-6 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-xs"
                        value="text"
                      >
                        Raw Stream
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-xs">
                      Theme:
                    </span>
                    <CodeBlockThemeSelector
                      mode={resolvedTheme === "dark" ? "dark" : "light"}
                    />
                  </div>
                  <CodeBlockCopyButton
                    aria-label={copied ? copy.copied : copy.copy}
                    onCopy={() => {
                      setCopied(true);
                      setStatus(copy.copied);
                    }}
                    text={
                      payloadView === "json" ? formattedJson : generatedPayload
                    }
                  />
                </div>
              </CodeBlockHeader>

              <CodeBlockBody className="min-h-0 flex-1 overflow-hidden">
                {(item) => (
                  <CodeBlockItem
                    className="h-full min-h-0 overflow-hidden"
                    key={item.language}
                    lineNumbers={item.language === "json"}
                    value={item.language}
                  >
                    <ScrollArea className="h-full min-h-0">
                      <CodeBlockContent
                        className="font-mono text-xs [&_.line]:max-w-full [&_.line]:break-all [&_code]:max-w-full [&_code]:whitespace-pre-wrap [&_pre]:max-w-full [&_pre]:whitespace-pre-wrap"
                        language={item.language as never}
                      >
                        {item.code}
                      </CodeBlockContent>
                    </ScrollArea>
                  </CodeBlockItem>
                )}
              </CodeBlockBody>
            </CodeBlock>

            <textarea
              aria-label={copy.rawStream}
              className="sr-only"
              readOnly
              tabIndex={-1}
              value={generatedPayload}
            />

            {packedState.message ? (
              <section
                aria-label="Bitmap inspector"
                className="shrink-0 space-y-3 rounded-lg border bg-muted/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Bitmap Inspector
                    </h3>
                    <Badge
                      className="h-5 font-mono text-[10px]"
                      variant="secondary"
                    >
                      {packedState.message.activeFields.some((b) => b > 64)
                        ? "128-bit (Extended)"
                        : "64-bit (Primary)"}
                    </Badge>
                  </div>
                  <Button
                    className="h-7 gap-1.5 px-2.5 text-xs"
                    onClick={copyOutput}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <ClipboardCopy className="size-3" />
                    Copy raw string
                  </Button>
                </div>

                <div className="space-y-1">
                  <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                    Hex Bitmap
                  </span>
                  <div className="select-all break-all rounded border bg-background/80 px-2.5 py-1.5 font-mono text-foreground text-xs shadow-xs">
                    {packedState.message.bitmap}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                    Active Fields ({packedState.message.activeFields.length})
                  </span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {packedState.message.activeFields.map((number) => {
                      const field = fields.find((f) => f.number === number);
                      return (
                        <span
                          className="inline-flex items-center rounded border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                          key={number}
                          title={
                            field?.label
                              ? `Bit ${number}: ${field.label}`
                              : `Bit ${number}`
                          }
                        >
                          Bit {number}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </section>
            ) : null}

            {status ? (
              <p
                className="shrink-0 rounded-md border border-primary/20 bg-primary/5 px-4 py-2 font-mono text-primary text-xs"
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
