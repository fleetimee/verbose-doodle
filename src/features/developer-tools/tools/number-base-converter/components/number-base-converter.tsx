import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Binary, Check, ClipboardCopy, Cpu } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  developerToolChildVariants as childVariants,
  DeveloperToolLayout,
} from "@/features/developer-tools/components/developer-tool-layout";
import {
  DeveloperToolTourButton,
  type DeveloperToolTourStep,
} from "@/features/developer-tools/components/developer-tool-tour-button";
import {
  convertNumberBase,
  type NumberBase,
  NumberBaseConversionError,
  type NumberBaseConversionResult,
  type NumberBitWidth,
  type NumberRepresentation,
} from "@/features/developer-tools/tools/number-base-converter/convert-number-base";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

type OutputKey = "binary" | "octal" | "decimal" | "hexadecimal";

type ExamplePreset = {
  readonly bitWidth: NumberBitWidth;
  readonly input: string;
  readonly inputBase: NumberBase;
  readonly label: string;
  readonly representation: NumberRepresentation;
};

function isString(value: unknown): value is string {
  return typeof value === "string";
}

type OutputDefinition = {
  readonly key: OutputKey;
  readonly label: string;
  readonly radix: string;
};

type SelectionIndicatorProps = {
  readonly selected: boolean;
  readonly shouldReduceMotion: boolean;
};

function SelectionIndicator({
  selected,
  shouldReduceMotion,
}: SelectionIndicatorProps) {
  return (
    <motion.span
      animate={{ opacity: selected ? 1 : 0 }}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 bg-accent shadow-xs"
      initial={false}
      transition={{
        duration: shouldReduceMotion
          ? MOTION_DURATION.instant
          : MOTION_DURATION.fast,
        ease: MOTION_EASE.out,
      }}
    />
  );
}

const EXAMPLE_VALUE = "255";
const EXAMPLE_RESULT = convertNumberBase({
  bitWidth: 8,
  input: EXAMPLE_VALUE,
  inputBase: 10,
  representation: "unsigned",
});
const BIT_WIDTHS: readonly NumberBitWidth[] = [8, 16, 32, 64];
const EXAMPLE_PRESETS: readonly ExamplePreset[] = [
  {
    bitWidth: 8,
    input: "255",
    inputBase: 10,
    label: "255 / 8-bit",
    representation: "unsigned",
  },
  {
    bitWidth: 8,
    input: "-42",
    inputBase: 10,
    label: "-42 / signed",
    representation: "signed",
  },
  {
    bitWidth: 32,
    input: "DEADBEEF",
    inputBase: 16,
    label: "DEADBEEF",
    representation: "unsigned",
  },
  {
    bitWidth: 16,
    input: "4869",
    inputBase: 16,
    label: "ASCII Hi",
    representation: "unsigned",
  },
];
const BASE_LABELS: Readonly<Record<NumberBase, string>> = {
  get 2() {
    return messages.numberBaseConverter.binary;
  },
  get 8() {
    return messages.numberBaseConverter.octal;
  },
  get 10() {
    return messages.numberBaseConverter.decimal;
  },
  get 16() {
    return messages.numberBaseConverter.hexadecimal;
  },
};
const OUTPUTS: readonly OutputDefinition[] = [
  {
    key: "binary",
    get label() {
      return messages.numberBaseConverter.binary;
    },
    radix: "BASE 02",
  },
  {
    key: "octal",
    get label() {
      return messages.numberBaseConverter.octal;
    },
    radix: "BASE 08",
  },
  {
    key: "decimal",
    get label() {
      return messages.numberBaseConverter.decimal;
    },
    radix: "BASE 10",
  },
  {
    key: "hexadecimal",
    get label() {
      return messages.numberBaseConverter.hexadecimal;
    },
    radix: "BASE 16",
  },
];

const TOUR_ID = "number-base-converter-intro";
const TOUR_TARGETS = {
  bytes: "number-base-converter-tour-bytes",
  controls: "number-base-converter-tour-controls",
  results: "number-base-converter-tour-results",
} as const;
const getTourSteps = (): readonly DeveloperToolTourStep[] => [
  {
    description: messages.numberBaseConverter.tour.controlsDescription,
    position: "bottom",
    selectorId: TOUR_TARGETS.controls,
    title: messages.numberBaseConverter.tour.controlsTitle,
  },
  {
    description: messages.numberBaseConverter.tour.resultsDescription,
    position: "top",
    selectorId: TOUR_TARGETS.results,
    title: messages.numberBaseConverter.tour.resultsTitle,
  },
  {
    description: messages.numberBaseConverter.tour.bytesDescription,
    position: "top",
    selectorId: TOUR_TARGETS.bytes,
    title: messages.numberBaseConverter.tour.bytesTitle,
  },
];

function groupFromRight(value: string, size: number) {
  const sign = value.startsWith("-") ? "-" : "";
  const digits = sign ? value.slice(1) : value;
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= size) {
    groups.unshift(digits.slice(Math.max(0, end - size), end));
  }
  return `${sign}${groups.join(" ")}`;
}

function formatOutput(value: string, key: OutputKey) {
  if (key === "binary") {
    return groupFromRight(value, 4);
  }
  if (key === "hexadecimal") {
    return groupFromRight(value, 2);
  }
  return groupFromRight(value, 3);
}

function OutputCard({
  copied,
  definition,
  onCopy,
  shouldReduceMotion,
  value,
}: {
  readonly copied: boolean;
  readonly definition: OutputDefinition;
  readonly onCopy: () => void;
  readonly shouldReduceMotion: boolean;
  readonly value: string;
}) {
  const CopyIcon = copied ? Check : ClipboardCopy;
  const outputLabel = formatMessage(messages.numberBaseConverter.outputLabel, {
    base: definition.label,
  });

  return (
    <section
      aria-label={outputLabel}
      className="group grid min-w-0 grid-cols-[minmax(7rem,0.7fr)_minmax(0,1.3fr)_auto] items-center gap-3 border-b px-4 py-3 last:border-b-0"
    >
      <div className="min-w-0">
        <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
          {definition.radix}
        </p>
        <h3 className="font-medium text-sm">{definition.label}</h3>
      </div>
      <code className="min-w-0 overflow-x-auto font-mono text-sm tracking-wide">
        {formatOutput(value, definition.key)}
      </code>
      <Button
        aria-label={formatMessage(messages.numberBaseConverter.copyOutput, {
          base: definition.label.toLowerCase(),
        })}
        onClick={onCopy}
        size="icon-xs"
        type="button"
        variant="ghost"
      >
        <span className="relative size-3.5">
          <AnimatePresence initial={false} mode="sync">
            <motion.span
              animate={{ opacity: 1, transform: "scale(1)" }}
              className="absolute inset-0"
              exit={{
                opacity: 0,
                transform: shouldReduceMotion ? "none" : "scale(0.95)",
              }}
              initial={{
                opacity: 0,
                transform: shouldReduceMotion ? "none" : "scale(0.95)",
              }}
              key={copied ? "copied" : "idle"}
              transition={{
                duration: MOTION_DURATION.fast,
                ease: MOTION_EASE.out,
              }}
            >
              <CopyIcon data-icon={copied ? "check" : "clipboard-copy"} />
            </motion.span>
          </AnimatePresence>
        </span>
      </Button>
    </section>
  );
}

export function NumberBaseConverter() {
  const { locale } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const tourSteps = useMemo(() => getTourSteps(), [locale]);
  const [input, setInput] = useState(EXAMPLE_VALUE);
  const [inputBase, setInputBase] = useState<NumberBase>(10);
  const [bitWidth, setBitWidth] = useState<NumberBitWidth>(8);
  const [representation, setRepresentation] =
    useState<NumberRepresentation>("unsigned");
  const [result, setResult] = useState<NumberBaseConversionResult | null>(
    EXAMPLE_RESULT
  );
  const [error, setError] = useState<string | null>(null);
  const [copiedOutput, setCopiedOutput] = useState<OutputKey | null>(null);

  const resetResult = () => {
    setResult(null);
    setError(null);
    setCopiedOutput(null);
  };

  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      setError(null);
      setCopiedOutput(null);
      return;
    }
    try {
      setResult(
        convertNumberBase({ bitWidth, input, inputBase, representation })
      );
      setError(null);
      setCopiedOutput(null);
    } catch (conversionError) {
      setResult(null);
      setError(
        conversionError instanceof NumberBaseConversionError
          ? conversionError.message
          : messages.numberBaseConverter.conversionFailed
      );
    }
  }, [bitWidth, input, inputBase, representation]);

  const changeBase = (value: string) => {
    // SAFETY: The select emits one of the supported numeric bases.
    setInputBase(Number(value) as NumberBase);
  };

  const changeBitWidth = (values: readonly unknown[]) => {
    const value = values.at(-1);
    if (isString(value)) {
      // SAFETY: The select emits one of the supported bit widths.
      const nextBitWidth = Number(value) as NumberBitWidth;
      setBitWidth(nextBitWidth);
    }
  };

  const changeRepresentation = (values: readonly unknown[]) => {
    const value = values.at(-1);
    if (value === "signed" || value === "unsigned") {
      let interpretedInput = input;
      if (inputBase === 10 && result) {
        interpretedInput =
          value === "signed" ? result.signedDecimal : result.unsignedDecimal;
      }
      setRepresentation(value);
      setInput(interpretedInput);
    }
  };

  const copyOutput = async (key: OutputKey) => {
    if (!result) {
      return;
    }
    try {
      const copied = await copyToClipboard(result[key]);
      setCopiedOutput(copied ? key : null);
      if (!copied) {
        setError(messages.numberBaseConverter.copyFailed);
      }
    } catch {
      setCopiedOutput(null);
      setError(messages.numberBaseConverter.copyFailed);
    }
  };

  const resetExample = () => {
    setInput(EXAMPLE_VALUE);
    setInputBase(10);
    setBitWidth(8);
    setRepresentation("unsigned");
    setResult(EXAMPLE_RESULT);
    setError(null);
    setCopiedOutput(null);
  };

  const clear = () => {
    setInput("");
    resetResult();
  };

  const applyPreset = (preset: ExamplePreset) => {
    setInput(preset.input);
    setInputBase(preset.inputBase);
    setBitWidth(preset.bitWidth);
    setRepresentation(preset.representation);
    setResult(convertNumberBase(preset));
    setError(null);
    setCopiedOutput(null);
  };

  const bitGroups = result?.binary.match(/.{1,4}/g) ?? [];

  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4 [&>header]:border-b-0 [&>header]:pb-2"
      clearLabel={messages.numberBaseConverter.clear}
      description={messages.numberBaseConverter.description}
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={clear}
      onReset={resetExample}
      resetLabel={messages.numberBaseConverter.resetExample}
      title={messages.numberBaseConverter.title}
      tour={
        <DeveloperToolTourButton
          label={messages.numberBaseConverter.tour.startButton}
          steps={tourSteps}
          storageKey="number-base-converter-tour-seen"
          tourId={TOUR_ID}
        />
      }
    >
      <motion.section
        className="rounded-lg bg-muted/15 px-4 py-3.5 md:px-5"
        id={TOUR_TARGETS.controls}
        variants={childVariants}
      >
        <div className="grid gap-x-3 gap-y-1.5 sm:grid-cols-[10rem_minmax(12rem,1fr)] sm:grid-rows-[auto_2rem]">
          <div className="grid gap-1.5 sm:row-span-2 sm:grid-rows-subgrid">
            <Label htmlFor="number-input-base" size="sm">
              {messages.numberBaseConverter.inputBaseLabel}
            </Label>
            <Select onValueChange={changeBase} value={String(inputBase)}>
              <SelectTrigger
                className="w-full"
                id="number-input-base"
                size="sm"
                variant="surface"
              >
                <SelectValue>{BASE_LABELS[inputBase]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BASE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 sm:row-span-2 sm:grid-rows-subgrid">
            <Label htmlFor="number-base-value" size="sm">
              {messages.numberBaseConverter.valueLabel}
            </Label>
            <Input
              aria-describedby="number-base-help"
              aria-invalid={error ? true : undefined}
              autoComplete="off"
              id="number-base-value"
              onChange={(event) => setInput(event.currentTarget.value)}
              placeholder={messages.numberBaseConverter.valuePlaceholder}
              size="sm"
              spellCheck={false}
              value={input}
              variant="mono-flat"
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 border-t pt-3 lg:grid-cols-[auto_auto_minmax(0,1fr)] lg:items-start">
          <div>
            <Label size="sm">
              {messages.numberBaseConverter.bitWidthLabel}
            </Label>
            <ToggleGroup
              aria-label={messages.numberBaseConverter.bitWidthLabel}
              className="mt-1.5"
              onValueChange={changeBitWidth}
              size="sm"
              value={[String(bitWidth)]}
              variant="outline-indicator"
            >
              {BIT_WIDTHS.map((width) => (
                <ToggleGroupItem
                  aria-label={formatMessage(
                    messages.numberBaseConverter.bitWidthItemAriaLabel,
                    { width }
                  )}
                  className="relative isolate overflow-hidden"
                  key={width}
                  value={String(width)}
                >
                  <SelectionIndicator
                    selected={bitWidth === width}
                    shouldReduceMotion={shouldReduceMotion ?? false}
                  />
                  <span className="relative z-10">{width}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div>
            <Label size="sm">
              {messages.numberBaseConverter.representationLabel}
            </Label>
            <ToggleGroup
              aria-label={messages.numberBaseConverter.representationLabel}
              className="mt-1.5"
              onValueChange={changeRepresentation}
              size="sm"
              value={[representation]}
              variant="outline-indicator"
            >
              <ToggleGroupItem
                className="relative isolate overflow-hidden"
                value="unsigned"
              >
                <SelectionIndicator
                  selected={representation === "unsigned"}
                  shouldReduceMotion={shouldReduceMotion ?? false}
                />
                <span className="relative z-10">
                  {messages.numberBaseConverter.unsigned}
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                className="relative isolate overflow-hidden"
                value="signed"
              >
                <SelectionIndicator
                  selected={representation === "signed"}
                  shouldReduceMotion={shouldReduceMotion ?? false}
                />
                <span className="relative z-10">
                  {messages.numberBaseConverter.signed}
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="min-w-0">
            <Label size="sm">
              {messages.numberBaseConverter.examplesLabel}
            </Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EXAMPLE_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  size="sm"
                  type="button"
                  variant="outline-muted"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <p
            className="text-muted-foreground text-xs leading-5 lg:col-span-3"
            id="number-base-help"
          >
            {messages.numberBaseConverter.inputHelp}
          </p>
        </div>
      </motion.section>

      {error ? (
        <div className="mt-4 border-destructive/30 border-y py-4" role="alert">
          <p className="font-medium text-destructive text-sm">
            {messages.numberBaseConverter.conversionFailed}
          </p>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            {error}
          </p>
        </div>
      ) : null}

      {result ? (
        <div
          className="mt-4 grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]"
          key="results"
        >
          <motion.section
            className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/70"
            id={TOUR_TARGETS.results}
            variants={childVariants}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/10 px-4 py-3">
              <div>
                <h2 className="font-semibold text-sm">
                  {messages.numberBaseConverter.resultTitle}
                </h2>
                <p className="text-muted-foreground text-xs">
                  {messages.numberBaseConverter.resultDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-muted-foreground text-xs uppercase tracking-wider">
                <span className="rounded-md border border-border/70 px-2 py-1">
                  {formatMessage(messages.numberBaseConverter.signedValue, {
                    value: result.signedDecimal,
                  })}
                </span>
                <span className="rounded-md border border-border/70 px-2 py-1">
                  {formatMessage(messages.numberBaseConverter.unsignedValue, {
                    value: result.unsignedDecimal,
                  })}
                </span>
              </div>
            </div>
            <div className="grid min-h-0 flex-1 grid-rows-4">
              {OUTPUTS.map((definition) => (
                <OutputCard
                  copied={copiedOutput === definition.key}
                  definition={definition}
                  key={definition.key}
                  onCopy={() => copyOutput(definition.key)}
                  shouldReduceMotion={shouldReduceMotion ?? false}
                  value={result[definition.key]}
                />
              ))}
            </div>
          </motion.section>

          <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4">
            <motion.section
              className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/70"
              variants={childVariants}
            >
              <div className="flex items-start gap-3 border-b bg-muted/10 px-4 py-3">
                <Binary className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <h2 className="font-semibold text-sm">
                    {messages.numberBaseConverter.patternTitle}
                  </h2>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {messages.numberBaseConverter.patternDescription}
                  </p>
                </div>
              </div>
              <div className="relative p-3">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-2">
                  {bitGroups.map((group, groupIndex) => (
                    <div
                      className={cn(
                        "flex min-w-0 rounded-md border font-mono text-xs",
                        groupIndex % 2 === 0 ? "bg-muted/40" : "bg-background"
                      )}
                      key={groupIndex}
                    >
                      {[...group].map((bit, bitIndex) => (
                        <span
                          className="flex h-7 min-w-0 flex-1 items-center justify-center border-r last:border-r-0"
                          key={`${groupIndex}-${bitIndex}`}
                        >
                          {bit}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.section
              className="overflow-hidden rounded-xl border border-border/70"
              id={TOUR_TARGETS.bytes}
              variants={childVariants}
            >
              <div className="flex items-start gap-3 border-b bg-muted/10 px-4 py-3">
                <Cpu className="mt-0.5 size-4 text-muted-foreground" />
                <div>
                  <h2 className="font-semibold text-sm">
                    {messages.numberBaseConverter.bytesTitle}
                  </h2>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {messages.numberBaseConverter.bytesDescription}
                  </p>
                </div>
              </div>
              <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="flex flex-wrap gap-2 p-3">
                  {result.bytes.map((byte, index) => (
                    <div
                      className="rounded-md border border-border/70 bg-muted/25 px-2.5 py-1.5"
                      key={index}
                    >
                      <span className="block font-mono text-muted-foreground text-xs uppercase tracking-wider">
                        {formatMessage(messages.numberBaseConverter.byteIndex, {
                          index: String(index).padStart(2, "0"),
                        })}
                      </span>
                      <code className="mt-1 block font-mono text-base">
                        {byte}
                      </code>
                    </div>
                  ))}
                </div>
                <div className="border-t p-3 lg:border-t-0 lg:border-l">
                  <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
                    {messages.numberBaseConverter.asciiLabel}
                  </span>
                  <code className="mt-2 block overflow-x-auto font-mono text-base tracking-wider">
                    {result.ascii}
                  </code>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]"
          key="empty"
        >
          <section
            className="grid min-h-32 place-items-center rounded-xl border border-border/70 border-dashed px-6 text-center"
            id={TOUR_TARGETS.results}
          >
            <p className="max-w-sm text-muted-foreground text-xs leading-5">
              {messages.numberBaseConverter.emptyResults}
            </p>
          </section>
          <section
            className="grid min-h-24 place-items-center rounded-xl border border-border/70 border-dashed px-6 text-center"
            id={TOUR_TARGETS.bytes}
          >
            <p className="max-w-sm text-muted-foreground text-xs leading-5">
              {messages.numberBaseConverter.emptyBytes}
            </p>
          </section>
        </div>
      )}
    </DeveloperToolLayout>
  );
}
