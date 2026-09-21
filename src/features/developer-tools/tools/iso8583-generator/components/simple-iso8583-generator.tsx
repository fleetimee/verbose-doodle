import { motion, useReducedMotion } from "motion/react";
import { type SetStateAction, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Binary,
  CalendarClock,
  ClipboardCopy,
  Code2,
  Info,
  RefreshCw,
  Trash2,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
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
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Field, FieldLegend, FieldSet } from "@/components/ui/field";
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
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import { GeneratorActionBar } from "@/features/developer-tools/tools/iso8583-generator/components/generator-action-bar";
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
import { formatIso8583FieldValue } from "../format-field-value";
import {
  getIso8583FieldEnumOptions,
  type Iso8583EnumOption,
} from "../iso8583-enums";
import { AddFieldDialog } from "./add-field-dialog";
import { Bit43Input } from "./bit43-input";
import { Iso8583FieldBrowser } from "./field-browser";
import { ImportStreamDialog } from "./import-stream-dialog";

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

function isUpdater<T>(update: SetStateAction<T>): update is (prevState: T) => T {
  return typeof update === "function";
}

interface FieldExplanationRegistry {
  readonly [fieldNumber: number]: string;
}

const FIELD_EXPLANATIONS: FieldExplanationRegistry = {
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
  43: "Fixed 40-character card acceptor name and location. For the Indonesia / Mastercard-style profile, use Merchant Name (positions 1–22), a space delimiter (23), City (24–36), a space delimiter (37), and the ISO alpha-3 Country Code (38–40, IDN). Values shorter than 40 characters are automatically right-padded with spaces on generation.",
  49: "The three-digit numeric currency code for the transaction amount.",
  60: "Host-specific private data. Its internal format must follow the selected profile.",
  62: "Host-specific private data. Its internal format must follow the selected profile.",
  63: "Host-specific additional data. Its internal format must follow the selected profile.",
  70: "The network-management operation, such as sign-on, sign-off, or echo. Values depend on the host profile.",
  90: "Carries identifying details from the original transaction during a reversal.",
};

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

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

function FieldDateTimePicker({
  fieldNumber,
  onChange,
}: {
  readonly fieldNumber: number;
  readonly onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const supportsDate = [7, 13].includes(fieldNumber);
  const supportsTime = [7, 12].includes(fieldNumber);
  const supportsMonth = fieldNumber === 14;

  const writeValue = (nextDate: Date) => {
    if (fieldNumber === 7) {
      onChange(
        `${twoDigits(nextDate.getMonth() + 1)}${twoDigits(nextDate.getDate())}${twoDigits(nextDate.getHours())}${twoDigits(nextDate.getMinutes())}${twoDigits(nextDate.getSeconds())}`
      );
    } else if (fieldNumber === 12) {
      onChange(
        `${twoDigits(nextDate.getHours())}${twoDigits(nextDate.getMinutes())}${twoDigits(nextDate.getSeconds())}`
      );
    } else if (fieldNumber === 13) {
      onChange(
        `${twoDigits(nextDate.getMonth() + 1)}${twoDigits(nextDate.getDate())}`
      );
    } else if (fieldNumber === 14) {
      onChange(
        `${String(nextDate.getFullYear()).slice(-2)}${twoDigits(nextDate.getMonth() + 1)}`
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
    if (!supportsTime) {
      setOpen(false);
    }
  };

  const chooseTime = (time: string) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const next = new Date(selectedDate);
    next.setHours(hours || 0, minutes || 0, seconds || 0, 0);
    setSelectedDate(next);
    writeValue(next);
  };

  const chooseMonth = (value: string) => {
    const [year, month] = value.split("-");
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
          aria-label={formatMessage(copy.pickValueAriaLabel, { fieldNumber })}
          className="shrink-0"
          size="sm"
          type="button"
          variant="ghost"
        >
          <CalendarClock />
          {copy.pickButton}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto" size="none">
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
              {copy.timeLabel}
            </label>
            <Input
              className="mt-2"
              id={`iso-time-${fieldNumber}`}
              onChange={(event) => chooseTime(event.currentTarget.value)}
              step="1"
              type="time"
              value={`${twoDigits(selectedDate.getHours())}:${twoDigits(selectedDate.getMinutes())}:${twoDigits(selectedDate.getSeconds())}`}
              variant="mono"
            />
          </div>
        ) : null}
        {supportsMonth ? (
          <div className="p-3">
            <label className="font-medium text-xs" htmlFor="iso-expiry-month">
              {copy.expirationMonthLabel}
            </label>
            <Input
              className="mt-2"
              id="iso-expiry-month"
              onChange={(event) => chooseMonth(event.currentTarget.value)}
              type="month"
              value={`${selectedDate.getFullYear()}-${twoDigits(selectedDate.getMonth() + 1)}`}
              variant="mono"
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
            {supportsTime ? copy.useCurrentDateTime : copy.useCurrentDate}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function presetFields(id: Iso8583PresetId) {
  return cloneIso8583Fields(getIso8583Preset(id).fields);
}

function EnumFieldSelect({
  enumOptions,
  field,
  invalid,
  label,
  onChange,
}: {
  readonly enumOptions: readonly Iso8583EnumOption[];
  readonly field: Iso8583Field;
  readonly invalid: boolean;
  readonly label: string;
  readonly onChange: (value: string) => void;
}) {
  const isKnownEnum = Boolean(
    enumOptions.some((opt) => opt.value === field.value)
  );
  const [customMode, setCustomMode] = useState(false);
  const isCustom = !isKnownEnum || customMode;

  const selectedLabel = useMemo(() => {
    if (isCustom) {
      return field.value
        ? formatMessage(copy.customValueWithParam, { value: field.value })
        : copy.customValueLabel;
    }
    return (
      enumOptions.find((opt) => opt.value === field.value)?.label ?? field.value
    );
  }, [isCustom, field.value, enumOptions]);

  return (
    <div className="space-y-2">
      <Select
        disabled={!field.enabled}
        onValueChange={(selected) => {
          if (selected === "__custom__") {
            setCustomMode(true);
          } else {
            setCustomMode(false);
            onChange(selected);
          }
        }}
        value={isCustom ? "__custom__" : field.value}
      >
        <SelectTrigger
          aria-describedby={
            invalid ? `iso-field-${field.number}-error` : undefined
          }
          aria-invalid={invalid || undefined}
          aria-label={label}
          className="w-full"
          id={`iso-field-${field.number}`}
          size="md"
          variant="mono"
        >
          <SelectValue
            placeholder={formatMessage(copy.selectBitCodePlaceholder, {
              number: field.number,
            })}
          >
            {selectedLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectGroup>
            {enumOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="font-mono text-xs sm:text-sm">
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
          <div className="my-1 border-border border-t" />
          <SelectItem value="__custom__">
            <span className="text-muted-foreground text-xs italic sm:text-sm">
              {copy.customValueOption}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {isCustom ? (
        <div className="flex items-center gap-2">
          <Input
            aria-describedby={
              invalid ? `iso-field-${field.number}-error` : undefined
            }
            aria-invalid={invalid || undefined}
            aria-label={formatMessage(copy.customValueAriaLabel, { label })}
            autoComplete="off"
            autoFocus
            className="min-w-0 flex-1"
            disabled={!field.enabled}
            inputMode={field.kind === "n" ? "numeric" : "text"}
            maxLength={field.length || undefined}
            onChange={(event) => onChange(event.currentTarget.value)}
            placeholder={
              field.kind === "n"
                ? formatMessage(copy.enterCustomDigitsPlaceholder, {
                    length: field.length,
                  })
                : copy.enterCustomValuePlaceholder
            }
            size="compact"
            spellCheck={false}
            value={field.value}
            variant="mono"
          />
          <Button
            className="shrink-0"
            onClick={() => {
              setCustomMode(false);
              onChange(enumOptions[0]?.value ?? "");
            }}
            size="compact"
            type="button"
            variant="outline"
          >
            {copy.resetToPreset}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function FieldExplainDialog({ field }: { readonly field: Iso8583Field }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label={formatMessage(copy.explainBitAriaLabel, {
            number: field.number,
          })}
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
            {formatMessage(copy.explainBitTitle, {
              label: field.label,
              number: field.number,
            })}
          </DialogTitle>
          <DialogDescription>
            {FIELD_EXPLANATIONS[field.number] ?? copy.explainBitFallback}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid gap-4 border-t pt-4 text-sm">
          <div>
            <dt className="font-medium">{copy.acceptedFormatLabel}</dt>
            <dd className="mt-1 text-muted-foreground">{fieldFormat(field)}</dd>
          </div>
          {field.value ? (
            <div>
              <dt className="font-medium">{copy.currentExampleLabel}</dt>
              <dd className="mt-1 break-all font-mono text-muted-foreground">
                {field.number === 2 ? copy.syntheticTestPan : field.value}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium">{copy.bitmapBehaviorLabel}</dt>
            <dd className="mt-1 text-muted-foreground">
              {formatMessage(copy.bitmapBehaviorDescription, {
                number: field.number,
              })}
            </dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function fieldDescriptionId(
  number: number,
  error?: string,
  readableValue?: string
) {
  if (error) {
    return `iso-field-${number}-error`;
  }
  if (readableValue) {
    return `iso-field-${number}-readable`;
  }
}

function ReadableFieldValue({
  value,
  number,
  invalid,
}: {
  readonly value?: string;
  readonly number: number;
  readonly invalid: boolean;
}) {
  if (!value || invalid) {
    return null;
  }
  return (
    <>
      <span aria-hidden="true">|</span>
      <span className="italic" id={`iso-field-${number}-readable`}>
        {value}
      </span>
    </>
  );
}

function FieldValueInput({
  error,
  field,
  invalid,
  label,
  onChange,
  readableValue,
}: {
  readonly error?: string;
  readonly field: Iso8583Field;
  readonly invalid: boolean;
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly readableValue?: string;
}) {
  const enumOptions = getIso8583FieldEnumOptions(field.number);

  if (enumOptions) {
    return (
      <EnumFieldSelect
        enumOptions={enumOptions}
        field={field}
        invalid={invalid}
        label={label}
        onChange={onChange}
      />
    );
  }

  if (field.number === 43) {
    return (
      <Bit43Input
        aria-describedby={fieldDescriptionId(
          field.number,
          error,
          readableValue
        )}
        aria-invalid={invalid || undefined}
        aria-label={label}
        autoComplete="off"
        className="h-11"
        disabled={!field.enabled}
        id={`iso-field-${field.number}`}
        inputMode="text"
        maxLength={field.length || undefined}
        onChange={(event) => onChange(event.currentTarget.value)}
        spellCheck={false}
        value={field.value}
        variant="mono"
      />
    );
  }

  return (
    <Input
      aria-describedby={fieldDescriptionId(field.number, error, readableValue)}
      aria-invalid={invalid || undefined}
      aria-label={label}
      autoComplete="off"
      disabled={!field.enabled}
      id={`iso-field-${field.number}`}
      inputMode={field.kind === "n" ? "numeric" : "text"}
      maxLength={field.length || undefined}
      onChange={(event) => onChange(event.currentTarget.value)}
      size="md"
      spellCheck={false}
      value={field.value}
      variant="mono"
    />
  );
}

function FieldInput({
  field,
  error,
  readableValue,
  onChange,
  onHelper,
  onToggle,
  onRemove,
}: {
  readonly field: Iso8583Field;
  readonly error?: string;
  readonly readableValue?: string;
  readonly onChange: (value: string) => void;
  readonly onHelper: () => void;
  readonly onToggle: (enabled: boolean) => void;
  readonly onRemove?: () => void;
}) {
  const invalid = Boolean(error);
  const label = formatMessage(copy.fieldInput, {
    label: field.label,
    number: field.number,
  });
  const hasDateTimePicker = [7, 12, 13, 14].includes(field.number);

  return (
    <Field
      className="min-w-0"
      data-disabled={!field.enabled || undefined}
      data-invalid={invalid || undefined}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Checkbox
          aria-label={formatMessage(copy.enableBitAriaLabel, {
            number: field.number,
          })}
          checked={field.enabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
        />
        <label
          className="flex min-w-0 flex-1 items-center gap-1.5 font-medium text-sm leading-5"
          htmlFor={`iso-field-${field.number}`}
        >
          <span className="mr-1 inline-block font-mono text-muted-foreground text-xs tabular-nums">
            {String(field.number).padStart(2, "0")}
          </span>
          <span className="truncate">{field.label}</span>
          {field.isCustom ? (
            <Badge className="shrink-0" size="micro" variant="outline-muted">
              {copy.customBadge}
            </Badge>
          ) : null}
        </label>
        <FieldExplainDialog field={field} />
        {onRemove ? (
          <Button
            aria-label={formatMessage(copy.removeBitFromFormAriaLabel, {
              number: field.number,
            })}
            className="shrink-0"
            onClick={onRemove}
            size="icon-sm"
            type="button"
            variant="ghost-destructive"
          >
            <Trash2 />
          </Button>
        ) : null}
        {hasDateTimePicker ? (
          <FieldDateTimePicker fieldNumber={field.number} onChange={onChange} />
        ) : null}
        {!hasDateTimePicker && field.helper ? (
          <Button
            aria-label={formatMessage(copy.fieldHelperAriaLabel, {
              helper: field.helper === "stan" ? copy.autoIncrement : copy.now,
              number: field.number,
            })}
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
      <FieldValueInput
        error={error}
        field={field}
        invalid={invalid}
        label={label}
        onChange={onChange}
        readableValue={readableValue}
      />
      {error ? (
        <p
          className="text-destructive text-xs"
          id={`iso-field-${field.number}-error`}
          role="alert"
        >
          {error} {fieldFormat(field)}
        </p>
      ) : null}
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-muted-foreground text-xs">
        <span>{fieldTypeLabel(field)}</span>
        <ReadableFieldValue
          invalid={invalid}
          number={field.number}
          value={readableValue}
        />
      </p>
      {field.number === 43 ? (
        <p className="font-mono text-muted-foreground/80 text-xs">
          {copy.bit43StandardLayout}
        </p>
      ) : null}
    </Field>
  );
}

export function Iso8583Generator() {
  useI18n();
  const [presetId, setPresetId] = useState<Iso8583PresetId>("sign-on");
  const [drafts, setDrafts] = useState<
    Partial<Record<Iso8583PresetId, Iso8583Field[]>>
  >(() => ({ "sign-on": presetFields("sign-on") }));
  // SAFETY: Every preset used by this component has a corresponding field draft.
  const fields = drafts[presetId] as Iso8583Field[];
  const [refreshTime, setRefreshTime] = useState(true);
  const [advanceStan, setAdvanceStan] = useState(true);
  const invalidateOutput = () => {
    setGeneratedPayload("");
    setOutputOpen(false);
    setCopied(false);
    setStatus(null);
  };
  const setFields = (update: SetStateAction<Iso8583Field[]>) => {
    setDrafts((current) => ({
      ...current,
      [presetId]:
        isUpdater(update) ? update(current[presetId] ?? []) : update,
    }));
    invalidateOutput();
  };
  const [addFieldOpen, setAddFieldOpen] = useState(false);

  const handleAddField = (newField: Iso8583Field, showToast = true) => {
    setFields((prev) => {
      const filtered = prev.filter((f) => f.number !== newField.number);
      return [...filtered, newField].sort((a, b) => a.number - b.number);
    });
    setStatus(null);
    if (showToast) {
      toast.success(
        formatMessage(copy.bitAdded, {
          label: newField.label,
          number: newField.number,
        })
      );
    }
  };

  const handleRemoveField = (fieldNumber: number) => {
    const target = fields.find((f) => f.number === fieldNumber);
    setFields((prev) => prev.filter((f) => f.number !== fieldNumber));
    setStatus(null);
    if (target) {
      toast.message(
        formatMessage(copy.bitRemoved, {
          label: target.label,
          number: target.number,
        }),
        {
          action: {
            label: copy.undo,
            onClick: () => {
              handleAddField(target, false);
              toast.info(
                formatMessage(copy.bitRestored, {
                  label: target.label,
                  number: target.number,
                })
              );
            },
          },
        }
      );
    }
  };
  const [generatedPayload, setGeneratedPayload] = useState("");
  const [copied, setCopied] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [payloadView, setPayloadView] = useState<"json" | "text">("text");
  const { theme } = useTheme();
  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      return typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  }, [theme]);
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
            : new Iso8583PackingError("field", copy.packErrorMessageFallback),
        message: null,
      };
    }
  }, [fields, preset.mti]);

  const choosePreset = (nextPresetId: Iso8583PresetId) => {
    setPresetId(nextPresetId);
    setDrafts((current) =>
      current[nextPresetId]
        ? current
        : { ...current, [nextPresetId]: presetFields(nextPresetId) }
    );
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

  const handleImportParsedFields = (
    mti: string,
    importedFields: {
      number: number;
      label: string;
      kind: Iso8583Field["kind"];
      length: number;
      cleanValue: string;
    }[]
  ) => {
    const matchingPreset =
      ISO8583_PRESETS.find((p) => p.mti === mti) ?? getIso8583Preset("sign-on");
    const baseFields = cloneIso8583Fields(matchingPreset.fields);

    for (const item of importedFields) {
      const idx = baseFields.findIndex((f) => f.number === item.number);
      if (idx >= 0) {
        baseFields[idx] = {
          ...baseFields[idx],
          enabled: true,
          value: item.cleanValue,
        };
      } else {
        baseFields.push({
          enabled: true,
          isCustom: true,
          kind: item.kind,
          label: item.label,
          length: item.length,
          number: item.number,
          value: item.cleanValue,
        });
      }
    }

    baseFields.sort((a, b) => a.number - b.number);
    setPresetId(matchingPreset.id);
    setDrafts((cur) => ({
      ...cur,
      [matchingPreset.id]: baseFields,
    }));
    invalidateOutput();
  };

  useEffect(() => {
    try {
      const rawDraft = sessionStorage.getItem("iso8583_import_draft");
      if (!rawDraft) {
        return;
      }
      sessionStorage.removeItem("iso8583_import_draft");
      const draft = JSON.parse(rawDraft);
      if (draft && Array.isArray(draft.fields)) {
        handleImportParsedFields(draft.mti, draft.fields);
        toast.success(
          formatMessage(messages.iso8583Generator.importStreamSuccess, {
            count: draft.fields.length,
            mti: draft.mti,
          })
        );
      }
    } catch {
      // Ignore parse errors from sessionStorage
    }
  }, []);

  const generate = () => {
    if (!packedState.message) {
      return;
    }
    const generatedFields = fields.map((field) => {
      if (
        field.enabled &&
        refreshTime &&
        field.number === 7 &&
        field.helper === "now"
      ) {
        return { ...field, value: nowValueForField(7) };
      }
      if (
        field.enabled &&
        advanceStan &&
        field.number === 11 &&
        field.helper === "stan"
      ) {
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
    <DeveloperToolLayout
      description={copy.subtitle}
      extraActions={
        <a
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "gap-1.5 text-muted-foreground hover:text-foreground"
          )}
          href="/dashboard/developer-tools/iso8583-parser"
        >
          <Binary className="size-3.5" />
          Stream parser
        </a>
      }
      headerExtra={
        <Badge className="shrink-0 self-start sm:self-center" variant="outline">
          BPD DIY ASCII
        </Badge>
      }
      title={copy.title}
    >
      <div className="mb-6 flex flex-col gap-2">
        <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
          {copy.messagePreset}
        </p>
        <div className="flex flex-col rounded-lg border bg-muted p-1 shadow-xs sm:flex-row">
          <Tabs
            className="min-w-0 flex-1"
            onValueChange={(value) =>
              // SAFETY: The tabs expose only the supported ISO 8583 presets.
              choosePreset(value as Iso8583PresetId)
            }
            value={presetId}
            variant="flush"
          >
            <TabsList
              aria-label={copy.preset}
              className="grid w-full grid-cols-3"
              size="lg"
              variant="transparent"
            >
              {ISO8583_PRESETS.filter((item) =>
                SIMPLE_PRESET_IDS.includes(item.id)
              ).map((item) => (
                <TabsTrigger
                  className="relative overflow-hidden"
                  key={item.id}
                  value={item.id}
                  variant="tile"
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
                        shouldReduceMotion ? undefined : "iso8583-active-preset"
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
            onValueChange={(value) =>
              // SAFETY: The select exposes only the supported ISO 8583 presets.
              choosePreset(value as Iso8583PresetId)
            }
            value={morePreset ? presetId : ""}
          >
            <SelectTrigger
              aria-label={copy.moreMessages}
              className="w-full data-[size=default]:h-11 sm:w-52 sm:data-[size=default]:h-14"
              variant={morePreset ? "subtle-active" : "subtle"}
            >
              <SelectValue placeholder={copy.moreMessages}>
                {morePreset ? morePreset.label : copy.moreMessages}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
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
        className="flex flex-col overflow-hidden rounded-t-xl border bg-card"
        initial={{
          opacity: shouldReduceMotion ? 0.7 : 0.45,
          transform: shouldReduceMotion ? "translateY(0)" : "translateY(14px)",
        }}
        key={presetId}
        transition={{
          duration: shouldReduceMotion ? 0.12 : 0.22,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        <div className="flex flex-col gap-3 border-b bg-muted/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <h2 className="font-semibold">
              {formatMessage(copy.presetMessageHeading, {
                preset: preset.label.split("·")[1]?.trim() ?? preset.label,
              })}
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              {preset.description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ImportStreamDialog onImport={handleImportParsedFields} />
            <AddFieldDialog
              currentFields={fields}
              existingFieldNumbers={fields.map((f) => f.number)}
              onAddField={handleAddField}
              onOpenChange={setAddFieldOpen}
              onRemoveField={handleRemoveField}
              open={addFieldOpen}
            />
          </div>
        </div>

        <Iso8583FieldBrowser
          error={packedState.error}
          fields={fields}
          renderField={(field, index) => (
            <motion.div
              animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
              className={cn("min-w-0", field.length >= 40 && "sm:col-span-2")}
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
                error={
                  packedState.error?.fieldNumber === field.number
                    ? packedState.error.message
                    : undefined
                }
                field={field}
                onChange={(value) => updateField(field.number, { value })}
                onHelper={() =>
                  updateField(field.number, {
                    value:
                      field.helper === "stan"
                        ? incrementStan(field.value)
                        : nowValueForField(field.number),
                  })
                }
                onRemove={
                  field.isCustom
                    ? () => handleRemoveField(field.number)
                    : undefined
                }
                onToggle={(enabled) => updateField(field.number, { enabled })}
                readableValue={formatIso8583FieldValue(field, fields)}
              />
            </motion.div>
          )}
        />
      </motion.section>

      <GeneratorActionBar>
        <FieldSet>
          <FieldLegend variant="label">{copy.onGenerate}</FieldLegend>
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-3">
            <label
              className="flex items-center gap-2 text-sm"
              htmlFor="iso-refresh-time"
            >
              <Checkbox
                checked={refreshTime}
                id="iso-refresh-time"
                onCheckedChange={(checked) => setRefreshTime(checked === true)}
              />
              {copy.refreshTransmissionTime}
            </label>
            <label
              className="flex items-center gap-2 text-sm"
              htmlFor="iso-advance-stan"
            >
              <Checkbox
                checked={advanceStan}
                id="iso-advance-stan"
                onCheckedChange={(checked) => setAdvanceStan(checked === true)}
              />
              {copy.incrementTraceNumber}
            </label>
          </div>
        </FieldSet>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            className="h-11 sm:mr-auto"
            onClick={() => {
              const previousFields = fields;
              setFields(presetFields(presetId));
              toast.message(copy.fieldsReset, {
                action: {
                  label: copy.undo,
                  onClick: () => setFields(previousFields),
                },
              });
            }}
            type="button"
            variant="ghost"
          >
            <RefreshCw data-icon="inline-start" />
            {copy.reset}
          </Button>
          {generatedPayload ? (
            <Button
              aria-haspopup="dialog"
              className="h-11 w-full sm:w-auto"
              onClick={() => setOutputOpen(true)}
              type="button"
              variant="outline"
            >
              <Code2 data-icon="inline-start" />
              {copy.viewRawMessage}
            </Button>
          ) : null}
          <Button
            className="h-11 w-full sm:w-auto"
            disabled={!packedState.message}
            onClick={generate}
            type="button"
          >
            <Code2 data-icon="inline-start" />
            {copy.generateRawMessage}
          </Button>
        </div>
      </GeneratorActionBar>

      <Sheet onOpenChange={setOutputOpen} open={outputOpen}>
        <SheetContent
          className="flex h-dvh w-full flex-col sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
          side="right"
          size="flush"
        >
          <SheetHeader variant="muted-lg">
            <SheetTitle variant="xl">{copy.rawMessageTitle}</SheetTitle>
            <SheetDescription>
              {formatMessage(copy.rawMessageDescription, { mti: preset.mti })}
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <CodeBlock
              className="flex min-h-72 flex-1 flex-col overflow-hidden rounded-lg border"
              data={codeBlockData}
              defaultValue="text"
              onValueChange={(val) => {
                // SAFETY: The tabs expose only the JSON and text payload views.
                setPayloadView(val as "json" | "text");
                setCopied(false);
                setStatus(null);
              }}
              storageKey="response-preview-themes"
              value={payloadView}
            >
              <CodeBlockHeader className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Tabs
                    onValueChange={(val) => {
                      // SAFETY: The tabs expose only the JSON and text payload views.
                      setPayloadView(val as "json" | "text");
                      setCopied(false);
                      setStatus(null);
                    }}
                    value={payloadView}
                  >
                    <TabsList variant="solid">
                      <TabsTrigger size="md" value="json">
                        {copy.formattedJsonTab}
                      </TabsTrigger>
                      <TabsTrigger size="md" value="text">
                        {copy.rawStreamTab}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-xs">
                      {copy.themeLabel}
                    </span>
                    <CodeBlockThemeSelector
                      mode={resolvedTheme === "dark" ? "dark" : "light"}
                    />
                  </div>
                  <CodeBlockCopyButton
                    aria-label={copy.copy}
                    onCopy={() => {
                      setCopied(true);
                      setStatus(copy.copied);
                    }}
                    size="sm"
                    text={
                      payloadView === "json" ? formattedJson : generatedPayload
                    }
                    variant="outline"
                  >
                    <ClipboardCopy data-icon="inline-start" />
                    {copy.copy}
                  </CodeBlockCopyButton>
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
                        language={
                          // SAFETY: CodeBlock data uses languages supported by the renderer.
                          item.language as never
                        }
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
                aria-label={copy.bitmapInspectorAriaLabel}
                className="shrink-0 space-y-3 border-t pt-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      {copy.bitmapInspectorTitle}
                    </h3>
                    <Badge mono size="sm" variant="secondary">
                      {packedState.message.activeFields.some((b) => b > 64)
                        ? copy.bitmap128Bit
                        : copy.bitmap64Bit}
                    </Badge>
                  </div>
                  <Button
                    onClick={copyOutput}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <ClipboardCopy className="size-3" />
                    {copied && payloadView === "text"
                      ? copy.copied
                      : copy.copyRawString}
                  </Button>
                </div>

                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    {copy.hexBitmap}
                  </span>
                  <div className="select-all break-all rounded border bg-background/80 px-2.5 py-1.5 font-mono text-foreground text-xs shadow-xs">
                    {packedState.message.bitmap}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    {formatMessage(copy.activeFieldsSection, {
                      count: packedState.message.activeFields.length,
                    })}
                  </span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {packedState.message.activeFields.map((number) => {
                      const field = fields.find((f) => f.number === number);
                      return (
                        <span
                          className="inline-flex items-center rounded border bg-background/60 px-1.5 py-0.5 font-mono text-muted-foreground text-xs transition-colors hover:bg-background hover:text-foreground"
                          key={number}
                          title={
                            field?.label
                              ? formatMessage(copy.explainBitTitle, {
                                  label: field.label,
                                  number,
                                })
                              : formatMessage(copy.bitBadge, { bit: number })
                          }
                        >
                          {formatMessage(copy.bitBadge, { bit: number })}
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
    </DeveloperToolLayout>
  );
}
