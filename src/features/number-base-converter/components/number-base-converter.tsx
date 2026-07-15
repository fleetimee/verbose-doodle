import { Binary, Check, ClipboardCopy, Cpu, Hash } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
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
} from "@/features/number-base-converter/convert-number-base";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type OutputKey = "binary" | "octal" | "decimal" | "hexadecimal";

type OutputDefinition = {
  readonly key: OutputKey;
  readonly label: string;
  readonly radix: string;
};

const EXAMPLE_VALUE = "255";
const EXAMPLE_RESULT = convertNumberBase({
  bitWidth: 8,
  input: EXAMPLE_VALUE,
  inputBase: 10,
  representation: "unsigned",
});
const BIT_WIDTHS: readonly NumberBitWidth[] = [8, 16, 32, 64];
const BASE_LABELS: Readonly<Record<NumberBase, string>> = {
  2: messages.numberBaseConverter.binary,
  8: messages.numberBaseConverter.octal,
  10: messages.numberBaseConverter.decimal,
  16: messages.numberBaseConverter.hexadecimal,
};
const OUTPUTS: readonly OutputDefinition[] = [
  {
    key: "binary",
    label: messages.numberBaseConverter.binary,
    radix: "BASE 02",
  },
  { key: "octal", label: messages.numberBaseConverter.octal, radix: "BASE 08" },
  {
    key: "decimal",
    label: messages.numberBaseConverter.decimal,
    radix: "BASE 10",
  },
  {
    key: "hexadecimal",
    label: messages.numberBaseConverter.hexadecimal,
    radix: "BASE 16",
  },
];

const parentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, duration: 0.32, bounce: 0.08 },
  },
};

const TOUR_ID = "number-base-converter-intro";
const TOUR_TARGETS = {
  bytes: "number-base-converter-tour-bytes",
  controls: "number-base-converter-tour-controls",
  results: "number-base-converter-tour-results",
} as const;
const TOUR_STEPS: readonly DeveloperToolTourStep[] = [
  {
    selectorId: TOUR_TARGETS.controls,
    position: "bottom",
    title: messages.numberBaseConverter.tour.controlsTitle,
    description: messages.numberBaseConverter.tour.controlsDescription,
  },
  {
    selectorId: TOUR_TARGETS.results,
    position: "top",
    title: messages.numberBaseConverter.tour.resultsTitle,
    description: messages.numberBaseConverter.tour.resultsDescription,
  },
  {
    selectorId: TOUR_TARGETS.bytes,
    position: "top",
    title: messages.numberBaseConverter.tour.bytesTitle,
    description: messages.numberBaseConverter.tour.bytesDescription,
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
  value,
}: {
  readonly copied: boolean;
  readonly definition: OutputDefinition;
  readonly onCopy: () => void;
  readonly value: string;
}) {
  const outputLabel = formatMessage(messages.numberBaseConverter.outputLabel, {
    base: definition.label,
  });

  return (
    <section
      aria-label={outputLabel}
      className="group min-w-0 border-b p-5 odd:border-r"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.18em]">
            {definition.radix}
          </p>
          <h3 className="mt-1 font-medium text-sm">{definition.label}</h3>
        </div>
        <Button
          aria-label={formatMessage(messages.numberBaseConverter.copyOutput, {
            base: definition.label.toLowerCase(),
          })}
          className="rounded-md"
          onClick={onCopy}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          {copied ? <Check /> : <ClipboardCopy />}
        </Button>
      </div>
      <code className="mt-6 block overflow-x-auto pb-1 font-mono text-lg leading-7 tracking-[0.04em]">
        {formatOutput(value, definition.key)}
      </code>
    </section>
  );
}

export function NumberBaseConverter() {
  const shouldReduceMotion = useReducedMotion();
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

  const convert = useCallback(() => {
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

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        convert();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [convert]);

  const changeBase = (value: string) => {
    setInputBase(Number(value) as NumberBase);
    resetResult();
  };

  const changeBitWidth = (values: readonly unknown[]) => {
    const value = values.at(-1);
    if (typeof value === "string") {
      setBitWidth(Number(value) as NumberBitWidth);
      resetResult();
    }
  };

  const changeRepresentation = (values: readonly unknown[]) => {
    const value = values.at(-1);
    if (value === "signed" || value === "unsigned") {
      setRepresentation(value);
      resetResult();
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

  const bitGroups = result?.binary.match(/.{1,4}/g) ?? [];

  return (
    <motion.div
      animate="visible"
      className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 pb-10 md:grid-cols-[210px_minmax(0,1fr)] md:gap-10 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-14"
      initial={shouldReduceMotion ? "visible" : "hidden"}
      variants={parentVariants}
    >
      <motion.aside
        className="md:sticky md:top-6 md:self-start"
        variants={childVariants}
      >
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
          {messages.numberBaseConverter.eyebrow}
        </p>
        <h1 className="mt-4 max-w-52 font-semibold text-3xl leading-[0.96] tracking-[-0.045em]">
          {messages.numberBaseConverter.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-sm leading-6">
          {messages.numberBaseConverter.description}
        </p>

        <dl className="mt-8 border-y text-xs">
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.numberBaseConverter.basesLabel}
            </dt>
            <dd className="font-mono">
              {messages.numberBaseConverter.basesValue}
            </dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.numberBaseConverter.widthsLabel}
            </dt>
            <dd>{messages.numberBaseConverter.widthsValue}</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">
              {messages.numberBaseConverter.storageLabel}
            </dt>
            <dd className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              {messages.numberBaseConverter.storageValue}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:items-start">
          <DeveloperToolTourButton
            label={messages.numberBaseConverter.tour.startButton}
            steps={TOUR_STEPS}
            storageKey="number-base-converter-tour-seen"
            tourId={TOUR_ID}
          />
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={resetExample}
            type="button"
          >
            {messages.numberBaseConverter.resetExample}
          </button>
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={clear}
            type="button"
          >
            {messages.numberBaseConverter.clear}
          </button>
        </div>
      </motion.aside>

      <main className="min-w-0">
        <motion.section
          className="border-y py-5"
          id={TOUR_TARGETS.controls}
          variants={childVariants}
        >
          <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="number-input-base">
                {messages.numberBaseConverter.inputBaseLabel}
              </Label>
              <Select onValueChange={changeBase} value={String(inputBase)}>
                <SelectTrigger
                  className="w-full rounded-md bg-background shadow-none"
                  id="number-input-base"
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
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="number-base-value">
                {messages.numberBaseConverter.valueLabel}
              </Label>
              <Input
                aria-describedby="number-base-help"
                aria-invalid={error ? true : undefined}
                autoComplete="off"
                className="h-12 rounded-md bg-background px-4 font-mono text-lg shadow-none md:text-lg"
                id="number-base-value"
                onChange={(event) => setInput(event.currentTarget.value)}
                placeholder={messages.numberBaseConverter.valuePlaceholder}
                spellCheck={false}
                value={input}
              />
            </div>
            <Button
              className="h-12 min-w-28 rounded-md active:translate-y-px"
              onClick={convert}
              type="button"
            >
              <Hash data-icon="inline-start" />
              {messages.numberBaseConverter.convert}
            </Button>
          </div>

          <div className="mt-5 grid gap-4 border-t pt-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
            <div>
              <Label className="text-xs">
                {messages.numberBaseConverter.bitWidthLabel}
              </Label>
              <ToggleGroup
                aria-label={messages.numberBaseConverter.bitWidthLabel}
                className="mt-2"
                onValueChange={changeBitWidth}
                value={[String(bitWidth)]}
                variant="outline"
              >
                {BIT_WIDTHS.map((width) => (
                  <ToggleGroupItem
                    aria-label={`${width} bit`}
                    key={width}
                    value={String(width)}
                  >
                    {width}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <p
              className="text-[11px] text-muted-foreground leading-5 lg:px-6"
              id="number-base-help"
            >
              {messages.numberBaseConverter.inputHelp}
            </p>
            <div>
              <Label className="text-xs">
                {messages.numberBaseConverter.representationLabel}
              </Label>
              <ToggleGroup
                aria-label={messages.numberBaseConverter.representationLabel}
                className="mt-2"
                onValueChange={changeRepresentation}
                value={[representation]}
                variant="outline"
              >
                <ToggleGroupItem value="unsigned">
                  {messages.numberBaseConverter.unsigned}
                </ToggleGroupItem>
                <ToggleGroupItem value="signed">
                  {messages.numberBaseConverter.signed}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <p className="mt-4 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {messages.numberBaseConverter.shortcutLabel}
          </p>
        </motion.section>

        <AnimatePresence>
          {error ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 border border-destructive/40 bg-destructive/5 px-5 py-4"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              role="alert"
              transition={{ duration: 0.2 }}
            >
              <p className="font-medium text-destructive text-sm">
                {messages.numberBaseConverter.conversionFailed}
              </p>
              <p className="mt-1 text-muted-foreground text-xs leading-5">
                {error}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 grid gap-8"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              key="results"
              transition={{ duration: 0.2 }}
            >
              <motion.section
                id={TOUR_TARGETS.results}
                variants={childVariants}
              >
                <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
                  <div>
                    <h2 className="font-semibold text-lg tracking-[-0.02em]">
                      {messages.numberBaseConverter.resultTitle}
                    </h2>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {messages.numberBaseConverter.resultDescription}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                    <span className="border px-2 py-1">
                      {formatMessage(messages.numberBaseConverter.signedValue, {
                        value: result.signedDecimal,
                      })}
                    </span>
                    <span className="border px-2 py-1">
                      {formatMessage(
                        messages.numberBaseConverter.unsignedValue,
                        {
                          value: result.unsignedDecimal,
                        }
                      )}
                    </span>
                  </div>
                </div>
                <div className="grid border-x sm:grid-cols-2">
                  {OUTPUTS.map((definition) => (
                    <OutputCard
                      copied={copiedOutput === definition.key}
                      definition={definition}
                      key={definition.key}
                      onCopy={() => copyOutput(definition.key)}
                      value={result[definition.key]}
                    />
                  ))}
                </div>
              </motion.section>

              <motion.section variants={childVariants}>
                <div className="flex items-start gap-3 border-b pb-4">
                  <Binary className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <h2 className="font-semibold text-lg tracking-[-0.02em]">
                      {messages.numberBaseConverter.patternTitle}
                    </h2>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {messages.numberBaseConverter.patternDescription}
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto border-x border-b p-4">
                  <div className="flex min-w-max gap-2">
                    {bitGroups.map((group, groupIndex) => (
                      <div
                        className={cn(
                          "flex border font-mono text-sm",
                          groupIndex % 2 === 0 ? "bg-muted/40" : "bg-background"
                        )}
                        key={`${group}-${groupIndex}`}
                      >
                        {[...group].map((bit, bitIndex) => (
                          <span
                            className="flex size-8 items-center justify-center border-r last:border-r-0"
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

              <motion.section id={TOUR_TARGETS.bytes} variants={childVariants}>
                <div className="flex items-start gap-3 border-b pb-4">
                  <Cpu className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <h2 className="font-semibold text-lg tracking-[-0.02em]">
                      {messages.numberBaseConverter.bytesTitle}
                    </h2>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {messages.numberBaseConverter.bytesDescription}
                    </p>
                  </div>
                </div>
                <div className="grid border-x border-b lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="flex flex-wrap gap-2 p-5">
                    {result.bytes.map((byte, index) => (
                      <div className="border bg-muted/25 px-3 py-2" key={index}>
                        <span className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                          {formatMessage(
                            messages.numberBaseConverter.byteIndex,
                            {
                              index: String(index).padStart(2, "0"),
                            }
                          )}
                        </span>
                        <code className="mt-1 block font-mono text-base">
                          {byte}
                        </code>
                      </div>
                    ))}
                  </div>
                  <div className="border-t p-5 lg:border-t-0 lg:border-l">
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                      {messages.numberBaseConverter.asciiLabel}
                    </span>
                    <code className="mt-3 block overflow-x-auto font-mono text-xl tracking-[0.16em]">
                      {result.ascii}
                    </code>
                  </div>
                </div>
              </motion.section>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1 }}
              aria-hidden="true"
              className="mt-8 grid gap-8"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="empty"
              transition={{ duration: 0.15 }}
            >
              <section
                className="grid min-h-40 place-items-center border border-dashed px-6 text-center"
                id={TOUR_TARGETS.results}
              >
                <p className="max-w-sm text-muted-foreground text-xs leading-5">
                  {messages.numberBaseConverter.emptyResults}
                </p>
              </section>
              <section
                className="grid min-h-28 place-items-center border border-dashed px-6 text-center"
                id={TOUR_TARGETS.bytes}
              >
                <p className="max-w-sm text-muted-foreground text-xs leading-5">
                  {messages.numberBaseConverter.emptyBytes}
                </p>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
