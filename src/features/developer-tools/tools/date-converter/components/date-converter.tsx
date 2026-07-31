import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ClipboardCopy,
  Clock3,
  Globe2,
  TimerReset,
} from "@/components/hugeicons";
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
import {
  DeveloperToolTourButton,
  type DeveloperToolTourStep,
} from "@/features/developer-tools/components/developer-tool-tour-button";
import { TimezoneCombobox } from "@/features/developer-tools/components/timezone-combobox";
import {
  getBrowserTimeZone,
  getTimeZoneOptions,
  resolveTimeZone,
} from "@/features/developer-tools/timezones";
import {
  convertDate,
  DateConversionError,
  type DateConversionResult,
  type DateInputMode,
} from "@/features/developer-tools/tools/date-converter/convert-date";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

type OutputKey = "iso8601" | "rfc2822" | "unixMilliseconds" | "unixSeconds";

type OutputDefinition = {
  readonly key: OutputKey;
  readonly label: string;
  readonly marker: string;
};

const EXAMPLE_VALUE = "2024-01-01T00:00:00.000Z";
const INPUT_MODES: readonly DateInputMode[] = [
  "auto",
  "unix-seconds",
  "unix-milliseconds",
  "iso-8601",
];
const INPUT_MODE_LABELS: Readonly<Record<DateInputMode, string>> = {
  auto: messages.dateConverter.inputModes.auto,
  "iso-8601": messages.dateConverter.inputModes.iso8601,
  "unix-milliseconds": messages.dateConverter.inputModes.unixMilliseconds,
  "unix-seconds": messages.dateConverter.inputModes.unixSeconds,
};
const OUTPUTS: readonly OutputDefinition[] = [
  {
    key: "unixSeconds",
    label: messages.dateConverter.unixSeconds,
    marker: "EPOCH / S",
  },
  {
    key: "unixMilliseconds",
    label: messages.dateConverter.unixMilliseconds,
    marker: "EPOCH / MS",
  },
  {
    key: "iso8601",
    label: messages.dateConverter.iso8601,
    marker: "ISO / UTC",
  },
  {
    key: "rfc2822",
    label: messages.dateConverter.rfc2822,
    marker: "RFC / UTC",
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
    transition: { bounce: 0.08, duration: 0.32, type: "spring" as const },
    y: 0,
  },
};

const TOUR_ID = "date-converter-intro";
const TOUR_TARGETS = {
  controls: "date-converter-tour-controls",
  results: "date-converter-tour-results",
  timezone: "date-converter-tour-timezone",
} as const;
const TOUR_STEPS: readonly DeveloperToolTourStep[] = [
  {
    description: messages.dateConverter.tour.controlsDescription,
    position: "bottom",
    selectorId: TOUR_TARGETS.controls,
    title: messages.dateConverter.tour.controlsTitle,
  },
  {
    description: messages.dateConverter.tour.resultsDescription,
    position: "top",
    selectorId: TOUR_TARGETS.results,
    title: messages.dateConverter.tour.resultsTitle,
  },
  {
    description: messages.dateConverter.tour.timezoneDescription,
    position: "top",
    selectorId: TOUR_TARGETS.timezone,
    title: messages.dateConverter.tour.timezoneTitle,
  },
];

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

  return (
    <section
      aria-label={formatMessage(messages.dateConverter.outputLabel, {
        format: definition.label,
      })}
      className="group min-w-0 border-b p-5 odd:border-r"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.18em]">
            {definition.marker}
          </p>
          <h3 className="mt-1 font-medium text-sm">{definition.label}</h3>
        </div>
        <Button
          aria-label={formatMessage(messages.dateConverter.copyOutput, {
            format: definition.label,
          })}
          className="rounded-md"
          onClick={onCopy}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <span className="relative size-4">
            <AnimatePresence initial={false} mode="sync">
              <motion.span
                animate={{
                  opacity: 1,
                  ...(shouldReduceMotion ? {} : { scale: 1 }),
                }}
                className="absolute inset-0"
                exit={{
                  opacity: 0,
                  ...(shouldReduceMotion ? {} : { scale: 0.95 }),
                }}
                initial={{
                  opacity: 0,
                  ...(shouldReduceMotion ? {} : { scale: 0.95 }),
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
      </div>
      <code className="mt-6 block overflow-x-auto pb-1 font-mono text-base leading-7">
        {value}
      </code>
    </section>
  );
}

export function DateConverter() {
  const shouldReduceMotion = useReducedMotion();
  const browserTimeZone = useMemo(getBrowserTimeZone, []);
  const timeZoneOptions = useMemo(
    () => getTimeZoneOptions(browserTimeZone),
    [browserTimeZone]
  );
  const [savedTimeZone, setSavedTimeZone] = useLocalStorage(
    "date-converter-timezone",
    browserTimeZone
  );
  const timeZone = resolveTimeZone(savedTimeZone, browserTimeZone);
  const [input, setInput] = useState(EXAMPLE_VALUE);
  const [inputMode, setInputMode] = useState<DateInputMode>("auto");
  const [result, setResult] = useState<DateConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedOutput, setCopiedOutput] = useState<OutputKey | null>(null);

  useEffect(() => {
    if (savedTimeZone !== timeZone) {
      setSavedTimeZone(timeZone);
    }
  }, [savedTimeZone, setSavedTimeZone, timeZone]);

  const convert = useCallback(
    (nextInput = input, nextInputMode = inputMode, nextTimeZone = timeZone) => {
      try {
        setResult(
          convertDate({
            input: nextInput,
            inputMode: nextInputMode,
            timeZone: nextTimeZone,
          })
        );
        setError(null);
        setCopiedOutput(null);
      } catch (conversionError) {
        setResult(null);
        setError(
          conversionError instanceof DateConversionError
            ? conversionError.message
            : messages.dateConverter.conversionFailed
        );
      }
    },
    [input, inputMode, timeZone]
  );

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

  const changeInputMode = (value: string) => {
    if (INPUT_MODES.includes(value as DateInputMode)) {
      setInputMode(value as DateInputMode);
      setResult(null);
      setError(null);
    }
  };

  const changeTimeZone = (nextTimeZone: string) => {
    setSavedTimeZone(nextTimeZone);
    if (result) {
      convert(input, inputMode, nextTimeZone);
    }
  };

  const useCurrentTime = () => {
    const currentMilliseconds = String(Date.now());
    setInput(currentMilliseconds);
    setInputMode("unix-milliseconds");
    convert(currentMilliseconds, "unix-milliseconds");
  };

  const copyOutput = async (key: OutputKey) => {
    if (!result) {
      return;
    }
    try {
      const copied = await copyToClipboard(result[key]);
      setCopiedOutput(copied ? key : null);
      if (!copied) {
        setError(messages.dateConverter.copyFailed);
      }
    } catch {
      setCopiedOutput(null);
      setError(messages.dateConverter.copyFailed);
    }
  };

  const resetExample = () => {
    setInput(EXAMPLE_VALUE);
    setInputMode("auto");
    setSavedTimeZone("UTC");
    setResult(null);
    setError(null);
    setCopiedOutput(null);
  };

  const clear = () => {
    setInput("");
    setResult(null);
    setError(null);
    setCopiedOutput(null);
  };

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
          {messages.dateConverter.eyebrow}
        </p>
        <h1 className="mt-4 max-w-52 font-semibold text-3xl leading-[0.96] tracking-[-0.045em]">
          {messages.dateConverter.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-sm leading-6">
          {messages.dateConverter.description}
        </p>

        <dl className="mt-8 border-y text-xs">
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.dateConverter.formatsLabel}
            </dt>
            <dd className="font-mono">{messages.dateConverter.formatsValue}</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.dateConverter.zonesLabel}
            </dt>
            <dd>{messages.dateConverter.zonesValue}</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">
              {messages.dateConverter.storageLabel}
            </dt>
            <dd className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              {messages.dateConverter.storageValue}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:items-start">
          <DeveloperToolTourButton
            label={messages.dateConverter.tour.startButton}
            steps={TOUR_STEPS}
            storageKey="date-converter-tour-seen"
            tourId={TOUR_ID}
          />
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={resetExample}
            type="button"
          >
            {messages.dateConverter.resetExample}
          </button>
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={clear}
            type="button"
          >
            {messages.dateConverter.clear}
          </button>
        </div>
      </motion.aside>

      <main className="min-w-0">
        <motion.section
          className="border-y py-5"
          id={TOUR_TARGETS.controls}
          variants={childVariants}
        >
          <div className="grid gap-5 xl:grid-cols-[180px_minmax(0,1fr)_260px_auto] xl:items-end">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="date-input-mode">
                {messages.dateConverter.inputModeLabel}
              </Label>
              <Select onValueChange={changeInputMode} value={inputMode}>
                <SelectTrigger
                  className="w-full rounded-md bg-background shadow-none"
                  id="date-input-mode"
                >
                  <SelectValue>{INPUT_MODE_LABELS[inputMode]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INPUT_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {INPUT_MODE_LABELS[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="date-converter-input">
                {messages.dateConverter.inputLabel}
              </Label>
              <Input
                aria-describedby="date-converter-help"
                aria-invalid={error ? true : undefined}
                autoComplete="off"
                className="h-12 rounded-md bg-background px-4 font-mono text-base shadow-none md:text-base"
                id="date-converter-input"
                onChange={(event) => setInput(event.currentTarget.value)}
                placeholder={messages.dateConverter.inputPlaceholder}
                spellCheck={false}
                value={input}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="date-timezone">
                {messages.dateConverter.timezoneLabel}
              </Label>
              <TimezoneCombobox
                emptyMessage={messages.dateConverter.timezoneEmpty}
                id="date-timezone"
                onChange={changeTimeZone}
                options={timeZoneOptions}
                searchPlaceholder={messages.dateConverter.timezoneSearch}
                useQueryLabel={(timezone) =>
                  formatMessage(messages.dateConverter.timezoneUse, {
                    timezone,
                  })
                }
                value={timeZone}
              />
            </div>
            <Button
              className="h-12 min-w-28 rounded-md active:translate-y-px"
              onClick={() => convert()}
              type="button"
            >
              <Clock3 data-icon="inline-start" />
              {messages.dateConverter.convert}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p
              className="max-w-3xl text-[11px] text-muted-foreground leading-5"
              id="date-converter-help"
            >
              {messages.dateConverter.inputHelp}
            </p>
            <Button
              className="rounded-md"
              onClick={useCurrentTime}
              size="sm"
              type="button"
              variant="outline"
            >
              <TimerReset data-icon="inline-start" />
              {messages.dateConverter.useCurrentTime}
            </Button>
          </div>
          <p className="mt-3 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {messages.dateConverter.shortcutLabel}
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
                {messages.dateConverter.conversionFailed}
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
                      {messages.dateConverter.resultTitle}
                    </h2>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {messages.dateConverter.resultDescription}
                    </p>
                  </div>
                  <span className="border px-2 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                    {formatMessage(messages.dateConverter.detectedAs, {
                      format: INPUT_MODE_LABELS[result.detectedMode],
                    })}
                  </span>
                </div>
                <div className="grid border-x sm:grid-cols-2">
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

              <motion.section
                id={TOUR_TARGETS.timezone}
                variants={childVariants}
              >
                <div className="flex items-start gap-3 border-b pb-4">
                  <Globe2 className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <h2 className="font-semibold text-lg tracking-[-0.02em]">
                      {messages.dateConverter.timezoneTitle}
                    </h2>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {messages.dateConverter.timezoneDescription}
                    </p>
                  </div>
                </div>
                <div className="grid border-x border-b lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="size-5 text-muted-foreground" />
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
                        {timeZone}
                      </span>
                    </div>
                    <code className="mt-5 block overflow-x-auto font-mono text-xl tracking-[-0.02em] sm:text-2xl">
                      {result.zonedDateTime}
                    </code>
                  </div>
                  <div className="border-t p-6 lg:border-t-0 lg:border-l">
                    <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                      {messages.dateConverter.relativeLabel}
                    </span>
                    <p className="mt-3 font-medium text-lg">
                      {result.relativeTime}
                    </p>
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
                  {messages.dateConverter.emptyResults}
                </p>
              </section>
              <section
                className="grid min-h-32 place-items-center border border-dashed px-6 text-center"
                id={TOUR_TARGETS.timezone}
              >
                <p className="max-w-sm text-muted-foreground text-xs leading-5">
                  {messages.dateConverter.emptyTimezone}
                </p>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
