import { useMemo, useState } from "react";
import {
  Binary,
  Check,
  ClipboardCopy,
  Code2,
  RefreshCw,
  SendHorizontal,
  SlidersHorizontal,
} from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  cloneIso8583Fields,
  fieldTypeLabel,
  getIso8583Preset,
  ISO8583_PRESETS,
  type Iso8583BitmapEncoding,
  type Iso8583Field,
  type Iso8583FieldKind,
  type Iso8583HeaderType,
  Iso8583PackingError,
  type Iso8583PresetId,
  incrementStan,
  nowValueForField,
  type PackedIso8583Message,
  packIso8583,
} from "@/features/developer-tools/tools/iso8583-generator/pack-iso8583";
import { useSocketBridgeContext } from "@/features/socket-tester/context/socket-bridge-context";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const copy = messages.iso8583Generator;

const HEADER_LABELS: Readonly<Record<Iso8583HeaderType, string>> = {
  "ascii-4": copy.headerAscii4,
  "binary-2": copy.headerBinary2,
  none: copy.headerNone,
};

const OPTIONAL_FIELDS: readonly {
  readonly kind: Iso8583FieldKind;
  readonly label: string;
  readonly length: number;
  readonly number: number;
}[] = [
  { kind: "n", label: "Expiration date", length: 4, number: 14 },
  { kind: "n", label: "Point of service entry mode", length: 3, number: 22 },
  {
    kind: "n",
    label: "Point of service condition code",
    length: 2,
    number: 25,
  },
  { kind: "llvar", label: "Track 2 data", length: 37, number: 35 },
  { kind: "lllvar", label: "Private data", length: 999, number: 48 },
  { kind: "ans", label: "Original data elements", length: 42, number: 90 },
  { kind: "llvar", label: "Account identification 1", length: 28, number: 102 },
  { kind: "llvar", label: "Account identification 2", length: 28, number: 103 },
  { kind: "lllvar", label: "Private extension", length: 999, number: 112 },
  { kind: "lllvar", label: "Private extension", length: 999, number: 120 },
  { kind: "lllvar", label: "Private extension", length: 999, number: 125 },
];

const MTI_OPTIONS = ["0800", "0200", "0100", "0400", "0500"] as const;

function presetFields(id: Iso8583PresetId) {
  return cloneIso8583Fields(getIso8583Preset(id).fields);
}

function ErrorMessage({ error }: { readonly error: Iso8583PackingError }) {
  return (
    <div
      aria-live="polite"
      className="border border-destructive/40 bg-destructive/5 px-4 py-3"
      role="alert"
    >
      <p className="font-medium text-destructive text-sm">
        {copy.invalidMessage}
      </p>
      <p className="mt-1 text-muted-foreground text-xs leading-5">
        {error.message}
      </p>
    </div>
  );
}

function FieldRow({
  field,
  invalid,
  onChange,
  onIncrementStan,
  onNow,
  onToggle,
}: {
  readonly field: Iso8583Field;
  readonly invalid: boolean;
  readonly onChange: (value: string) => void;
  readonly onIncrementStan: () => void;
  readonly onNow: () => void;
  readonly onToggle: (enabled: boolean) => void;
}) {
  const fieldLabel = formatMessage(copy.fieldInput, {
    label: field.label,
    number: field.number,
  });
  const supportsNow = field.helper === "now";
  const supportsStan = field.helper === "stan";

  return (
    <div
      className={cn(
        "grid min-w-0 gap-3 border-b px-4 py-3 transition-colors sm:grid-cols-[auto_minmax(180px,0.75fr)_minmax(0,1.25fr)_96px] sm:items-center sm:px-5",
        field.enabled ? "bg-background" : "bg-muted/10"
      )}
      data-field-number={field.number}
    >
      <Checkbox
        aria-label={`Enable bit ${field.number}`}
        checked={field.enabled}
        onCheckedChange={(checked) => onToggle(checked === true)}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-[4.75rem] shrink-0 font-mono font-semibold text-primary text-xs">
            Bit {field.number}
          </span>
          <span className="truncate text-sm">{field.label}</span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          {fieldTypeLabel(field)}
        </p>
      </div>
      <Input
        aria-invalid={invalid || undefined}
        aria-label={fieldLabel}
        autoComplete="off"
        className="h-10 min-w-0 rounded-md bg-background font-mono text-sm shadow-none"
        disabled={!field.enabled && field.length === 0}
        inputMode={field.kind === "n" ? "numeric" : "text"}
        maxLength={field.length}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={field.kind === "ans" ? " " : "Enter value"}
        spellCheck={false}
        value={field.value}
      />
      <div className="flex min-w-0 items-center justify-start">
        {supportsNow ? (
          <Button
            aria-label={`${copy.now} Bit ${field.number}`}
            className="h-8 w-full justify-start whitespace-nowrap px-1.5 text-xs"
            onClick={onNow}
            type="button"
            variant="ghost"
          >
            <RefreshCw data-icon="inline-start" />
            {copy.now}
          </Button>
        ) : null}
        {supportsStan ? (
          <Button
            aria-label={`${copy.autoIncrement} Bit ${field.number}`}
            className="h-8 w-full justify-start whitespace-nowrap px-1.5 text-xs"
            onClick={onIncrementStan}
            type="button"
            variant="ghost"
          >
            {copy.autoIncrement}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function BitmapGrid({
  label,
  start,
  value,
}: {
  readonly label: string;
  readonly start: number;
  readonly value: string;
}) {
  const bits = [...value]
    .flatMap((character) =>
      Number.parseInt(character, 16).toString(2).padStart(4, "0").split("")
    )
    .map((bit) => bit === "1");

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.16em]">
          {label}
        </span>
        <code className="font-mono text-[10px] text-foreground tracking-wider">
          {value || "--"}
        </code>
      </div>
      {value ? (
        <ul
          aria-label={`${label} bit map`}
          className="m-0 grid list-none grid-cols-16 gap-1 p-0"
        >
          {bits.map((active, index) => {
            const fieldNumber = start + index;
            return (
              <li
                aria-label={`Bit ${fieldNumber} ${active ? "active" : "inactive"}`}
                className={cn(
                  "grid aspect-square min-w-0 place-items-center border font-mono text-[8px] transition-colors",
                  active
                    ? "border-primary/60 bg-primary text-primary-foreground"
                    : "border-border/60 bg-muted/20 text-muted-foreground/70"
                )}
                key={fieldNumber}
                title={`Bit ${fieldNumber}`}
              >
                {active ? "1" : "0"}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function BitmapInspector({
  message,
}: {
  readonly message: PackedIso8583Message;
}) {
  return (
    <section aria-label="Bitmap inspector" className="border-t p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-sm">Bitmap inspector</h2>
        </div>
        <Binary className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-4 grid gap-5">
        <BitmapGrid
          label={copy.primaryBitmap}
          start={1}
          value={message.primaryBitmap}
        />
        {message.secondaryBitmap ? (
          <BitmapGrid
            label={copy.secondaryBitmap}
            start={65}
            value={message.secondaryBitmap}
          />
        ) : null}
      </div>
      <div className="mt-5 border-t pt-4">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.16em]">
          {copy.activeBits}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {message.activeFields.map((fieldNumber) => (
            <span
              className="border bg-muted/20 px-1.5 py-1 font-mono text-[10px]"
              key={fieldNumber}
            >
              Bit {fieldNumber}
            </span>
          ))}
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 border-t text-xs">
        <div className="border-r py-3">
          <dt className="text-muted-foreground">{copy.bodyLength}</dt>
          <dd className="mt-1 font-mono">
            {message.bodyLength} {copy.wireBytes}
          </dd>
        </div>
        <div className="py-3 pl-4">
          <dt className="text-muted-foreground">{copy.totalLength}</dt>
          <dd className="mt-1 font-mono">
            {message.totalLength} {copy.wireBytes}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function Iso8583Generator() {
  const bridge = useSocketBridgeContext();
  const [presetId, setPresetId] = useState<Iso8583PresetId>("sign-on");
  const [mti, setMti] = useState(getIso8583Preset("sign-on").mti);
  const [fields, setFields] = useState(() => presetFields("sign-on"));
  const [headerType, setHeaderType] = useState<Iso8583HeaderType>("ascii-4");
  const [bitmapEncoding, setBitmapEncoding] =
    useState<Iso8583BitmapEncoding>("hex");
  const [autoLengthHeader, setAutoLengthHeader] = useState(true);
  const [autoBitmap, setAutoBitmap] = useState(true);
  const [manualLengthHeader, setManualLengthHeader] = useState("");
  const [manualPrimaryBitmap, setManualPrimaryBitmap] = useState("");
  const [manualSecondaryBitmap, setManualSecondaryBitmap] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [showAddField, setShowAddField] = useState(false);
  const [addFieldNumber, setAddFieldNumber] = useState("");

  const packedState = useMemo(() => {
    try {
      return {
        error: null,
        message: packIso8583({
          autoBitmap,
          autoLengthHeader,
          bitmapEncoding,
          fields,
          headerType,
          manualLengthHeader,
          manualPrimaryBitmap,
          manualSecondaryBitmap,
          mti,
        }),
      };
    } catch (packingError) {
      return {
        error:
          packingError instanceof Iso8583PackingError
            ? packingError
            : new Iso8583PackingError("field", "Could not pack this message."),
        message: null,
      };
    }
  }, [
    autoBitmap,
    autoLengthHeader,
    bitmapEncoding,
    fields,
    headerType,
    manualLengthHeader,
    manualPrimaryBitmap,
    manualSecondaryBitmap,
    mti,
  ]);

  const addableFields = OPTIONAL_FIELDS.filter(
    (optionalField) =>
      !fields.some((field) => field.number === optionalField.number)
  );

  const loadPreset = (nextPresetId: Iso8583PresetId) => {
    const preset = getIso8583Preset(nextPresetId);
    setPresetId(nextPresetId);
    setMti(preset.mti);
    setFields(presetFields(nextPresetId));
    setManualLengthHeader("");
    setManualPrimaryBitmap("");
    setManualSecondaryBitmap("");
    setCopied(false);
    setStatus(null);
  };

  const updateField = (number: number, update: Partial<Iso8583Field>) => {
    setFields((currentFields) =>
      currentFields.map((field) =>
        field.number === number ? { ...field, ...update } : field
      )
    );
    setCopied(false);
    setStatus(null);
  };

  const loadCurrentPreset = () => loadPreset(presetId);

  const saveTemplate = () => {
    localStorage.setItem(
      "iso8583-generator-template",
      JSON.stringify({
        autoBitmap,
        autoLengthHeader,
        bitmapEncoding,
        fields,
        headerType,
        manualLengthHeader,
        manualPrimaryBitmap,
        manualSecondaryBitmap,
        mti,
        presetId,
      })
    );
    setStatus(copy.templateSaved);
  };

  const addField = () => {
    const definition = addableFields.find(
      (candidate) => String(candidate.number) === addFieldNumber
    );
    if (!definition) {
      return;
    }
    setFields((currentFields) => [
      ...currentFields,
      {
        ...definition,
        enabled: false,
        value: "",
      },
    ]);
    setAddFieldNumber("");
    setShowAddField(false);
    setStatus(null);
  };

  const copyOutput = async () => {
    if (!packedState.message) {
      return;
    }
    const value = packedState.message.isPrintable
      ? packedState.message.payload
      : packedState.message.hexPayload;
    try {
      const didCopy = await copyToClipboard(value);
      setCopied(didCopy);
      setStatus(didCopy ? copy.copied : copy.copyFailed);
    } catch {
      setCopied(false);
      setStatus(copy.copyFailed);
    }
  };

  const sendToTcp = () => {
    if (!packedState.message) {
      return;
    }
    const sendData = packedState.message.isPrintable
      ? { encoding: "ascii" as const, value: packedState.message.payload }
      : { encoding: "hex" as const, value: packedState.message.hexPayload };
    bridge.sendTcpClient(sendData.value, sendData.encoding, "");
    setStatus(copy.sentToTcp);
  };

  const toggleAutoLength = (checked: boolean) => {
    if (!checked && packedState.message) {
      setManualLengthHeader(String(packedState.message.bodyLength));
    }
    setAutoLengthHeader(checked);
  };

  const toggleAutoBitmap = (checked: boolean) => {
    if (!checked && packedState.message) {
      setManualPrimaryBitmap(packedState.message.primaryBitmap);
      setManualSecondaryBitmap(packedState.message.secondaryBitmap);
    }
    setAutoBitmap(checked);
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-6 overflow-x-clip pb-10">
      <header className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
            {copy.eyebrow}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-9 place-items-center border bg-muted/20 text-primary">
              <Code2 className="size-4" />
            </span>
            <h1 className="font-semibold text-3xl tracking-[-0.045em] md:text-4xl">
              {copy.title}
            </h1>
          </div>
          <p className="mt-4 text-muted-foreground text-sm leading-6">
            {copy.description}
          </p>
        </div>
        <div className="w-full max-w-xs space-y-2">
          <Label
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            htmlFor="iso8583-preset"
          >
            {copy.preset}
          </Label>
          <Select
            onValueChange={(value) => loadPreset(value as Iso8583PresetId)}
            value={presetId}
          >
            <SelectTrigger
              className="h-11 rounded-md bg-background shadow-none"
              id="iso8583-preset"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ISO8583_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm lg:grid-cols-[220px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)_340px]">
        <section
          aria-label={copy.messageConfiguration}
          className="min-w-0 border-b p-4 sm:p-5 lg:border-r lg:border-b-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-sm">{copy.configuration}</h2>
            </div>
            <SlidersHorizontal className="size-4 text-muted-foreground" />
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="iso8583-mti">
                {copy.mti}
              </Label>
              <Input
                aria-describedby="iso8583-mti-description"
                aria-label={copy.mti}
                autoComplete="off"
                className="h-11 bg-background font-mono text-lg tracking-widest"
                id="iso8583-mti"
                inputMode="numeric"
                list="iso8583-mti-options"
                maxLength={4}
                onChange={(event) => {
                  setMti(
                    event.currentTarget.value.replace(/\D/g, "").slice(0, 4)
                  );
                  setCopied(false);
                  setStatus(null);
                }}
                spellCheck={false}
                value={mti}
              />
              <datalist id="iso8583-mti-options">
                {MTI_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <p
                className="text-[11px] text-muted-foreground leading-5"
                id="iso8583-mti-description"
              >
                {copy.mtiDescription}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs" htmlFor="iso8583-header-type">
                {copy.headerType}
              </Label>
              <Select
                onValueChange={(value) => {
                  setHeaderType(value as Iso8583HeaderType);
                  setCopied(false);
                  setStatus(null);
                }}
                value={headerType}
              >
                <SelectTrigger
                  className="w-full bg-background shadow-none"
                  id="iso8583-header-type"
                >
                  <SelectValue>{HEADER_LABELS[headerType]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(HEADER_LABELS) as Iso8583HeaderType[]).map(
                    (value) => (
                      <SelectItem key={value} value={value}>
                        {HEADER_LABELS[value]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <fieldset className="space-y-3">
              <legend className="font-medium text-xs">
                {copy.bitmapFormat}
              </legend>
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  checked={bitmapEncoding === "hex"}
                  className="accent-primary"
                  name="iso8583-bitmap-encoding"
                  onChange={() => setBitmapEncoding("hex")}
                  type="radio"
                  value="hex"
                />
                <span>{copy.bitmapHex}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  16 / 32 chars
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  checked={bitmapEncoding === "binary"}
                  className="accent-primary"
                  name="iso8583-bitmap-encoding"
                  onChange={() => setBitmapEncoding("binary")}
                  type="radio"
                  value="binary"
                />
                <span>{copy.bitmapBinary}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  8 / 16 bytes
                </span>
              </label>
            </fieldset>

            <div className="space-y-3 border-t pt-5">
              <div className="flex items-center justify-between gap-3">
                <Label
                  className="cursor-pointer text-xs"
                  htmlFor="iso8583-auto-length"
                >
                  {copy.autoLength}
                </Label>
                <Switch
                  checked={headerType !== "none" && autoLengthHeader}
                  disabled={headerType === "none"}
                  id="iso8583-auto-length"
                  onCheckedChange={toggleAutoLength}
                />
              </div>
              {headerType !== "none" && !autoLengthHeader ? (
                <Input
                  aria-label={copy.manualLength}
                  className="bg-background font-mono"
                  inputMode="numeric"
                  onChange={(event) =>
                    setManualLengthHeader(
                      event.currentTarget.value.replace(/\D/g, "")
                    )
                  }
                  placeholder={
                    packedState.message
                      ? String(packedState.message.bodyLength)
                      : "0"
                  }
                  value={manualLengthHeader}
                />
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <Label
                  className="cursor-pointer text-xs"
                  htmlFor="iso8583-auto-bitmap"
                >
                  {copy.autoBitmap}
                </Label>
                <Switch
                  checked={autoBitmap}
                  id="iso8583-auto-bitmap"
                  onCheckedChange={toggleAutoBitmap}
                />
              </div>
              {autoBitmap ? null : (
                <div className="grid gap-2">
                  <Input
                    aria-label={copy.primaryBitmap}
                    className="bg-background font-mono text-xs uppercase tracking-wider"
                    maxLength={16}
                    onChange={(event) =>
                      setManualPrimaryBitmap(
                        event.currentTarget.value.toUpperCase()
                      )
                    }
                    placeholder="F23A400188E08016"
                    value={manualPrimaryBitmap}
                  />
                  <Input
                    aria-label={copy.secondaryBitmap}
                    className="bg-background font-mono text-xs uppercase tracking-wider"
                    maxLength={16}
                    onChange={(event) =>
                      setManualSecondaryBitmap(
                        event.currentTarget.value.toUpperCase()
                      )
                    }
                    placeholder="0000000000560000"
                    value={manualSecondaryBitmap}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          aria-label={copy.fields}
          className="min-w-0 border-b lg:border-b-0 2xl:border-r"
        >
          <div className="flex items-start justify-between gap-4 border-b bg-muted/10 p-4 sm:p-5">
            <div>
              <h2 className="font-semibold text-sm">{copy.fields}</h2>
              <p className="mt-2 max-w-xl text-muted-foreground text-xs leading-5">
                {copy.fieldListDescription}
              </p>
            </div>
            <span className="shrink-0 border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              {formatMessage(copy.activeFields, {
                count: fields.filter((field) => field.enabled).length,
              })}
            </span>
          </div>

          <div className="max-h-[min(68vh,620px)] overflow-y-auto overscroll-contain">
            {fields
              .filter((field) => !field.hidden)
              .sort((left, right) => left.number - right.number)
              .map((field) => (
                <FieldRow
                  field={field}
                  invalid={packedState.error?.fieldNumber === field.number}
                  key={field.number}
                  onChange={(value) => updateField(field.number, { value })}
                  onIncrementStan={() =>
                    updateField(field.number, {
                      value: incrementStan(field.value),
                    })
                  }
                  onNow={() =>
                    updateField(field.number, {
                      value: nowValueForField(field.number),
                    })
                  }
                  onToggle={(enabled) => updateField(field.number, { enabled })}
                />
              ))}
          </div>

          <div className="border-t p-4 sm:p-5">
            {showAddField ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  onValueChange={setAddFieldNumber}
                  value={addFieldNumber}
                >
                  <SelectTrigger
                    aria-label={copy.addFieldTitle}
                    className="bg-background shadow-none sm:flex-1"
                  >
                    <SelectValue placeholder={copy.addFieldTitle} />
                  </SelectTrigger>
                  <SelectContent>
                    {addableFields.map((field) => (
                      <SelectItem
                        key={field.number}
                        value={String(field.number)}
                      >
                        Bit {field.number} · {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!addFieldNumber}
                  onClick={addField}
                  type="button"
                >
                  {copy.addField}
                </Button>
              </div>
            ) : (
              <Button
                className="w-full border-dashed"
                disabled={addableFields.length === 0}
                onClick={() => setShowAddField(true)}
                type="button"
                variant="outline"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-base leading-none"
                >
                  +
                </span>
                {copy.addField}
              </Button>
            )}
            {fields.some((field) => field.hidden) ? (
              <p className="mt-3 text-[10px] text-muted-foreground leading-4">
                This preset keeps{" "}
                {fields.filter((field) => field.hidden).length} private
                extension bits in its packed sample tail.
              </p>
            ) : null}
          </div>
        </section>

        <aside
          aria-label={copy.output}
          className="min-w-0 lg:col-span-2 2xl:col-span-1 2xl:col-start-3 2xl:row-start-1"
        >
          <section className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-sm">{copy.output}</h2>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  aria-label={copied ? copy.copied : copy.copy}
                  className="size-8"
                  disabled={!packedState.message}
                  onClick={copyOutput}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  {copied ? <Check /> : <ClipboardCopy />}
                </Button>
                <Button
                  aria-label={copy.sendToTcp}
                  className="size-8"
                  disabled={!packedState.message}
                  onClick={sendToTcp}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <SendHorizontal />
                </Button>
              </div>
            </div>
            <Textarea
              aria-label={copy.rawStream}
              className="mt-4 min-h-[220px] resize-none overflow-y-auto bg-muted/10 font-mono text-xs leading-6 shadow-none [field-sizing:fixed]"
              readOnly
              value={packedState.message?.displayPayload ?? ""}
            />
            <p className="mt-3 text-[10px] text-muted-foreground leading-4">
              {copy.outputDescription} {copy.hexOutputHint}
            </p>
            {packedState.error ? (
              <div className="mt-4">
                <ErrorMessage error={packedState.error} />
              </div>
            ) : null}
            {status ? (
              <p
                aria-live="polite"
                className="mt-3 font-mono text-[10px] text-primary uppercase tracking-wider"
                role="status"
              >
                {status}
              </p>
            ) : null}
            {bridge.tcpClient.connected ? null : (
              <p className="mt-3 text-[10px] text-muted-foreground leading-4">
                {copy.socketDisconnected}
              </p>
            )}
          </section>
          {packedState.message ? (
            <BitmapInspector message={packedState.message} />
          ) : null}
        </aside>
      </div>

      <footer className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadCurrentPreset} type="button" variant="outline">
            <RefreshCw data-icon="inline-start" />
            {copy.loadPreset}
          </Button>
          <Button onClick={saveTemplate} type="button" variant="outline">
            {copy.saveTemplate}
          </Button>
        </div>
        <Button
          className="h-11 min-w-44"
          disabled={!packedState.message}
          onClick={() => {
            setCopied(false);
            setStatus(null);
          }}
          type="button"
        >
          <Code2 data-icon="inline-start" />
          {copy.generate}
        </Button>
      </footer>
    </div>
  );
}
