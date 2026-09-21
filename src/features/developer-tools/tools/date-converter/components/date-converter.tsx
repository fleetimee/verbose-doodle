import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { addDays, addHours, addWeeks } from "date-fns";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ClipboardCopy,
  Clock3,
  Globe2,
  TimerReset,
} from "@/components/hugeicons";
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
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
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
import { DateDetailsBreakdown } from "./date-details-breakdown";
import { DatePickerPopover } from "./date-picker-popover";

type OutputKey =
  | "iso8601"
  | "iso8601Local"
  | "rfc2822"
  | "sqlDateTime"
  | "unixMilliseconds"
  | "unixSeconds";

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
  "unix-microseconds",
  "unix-nanoseconds",
  "iso-8601",
  "sql-datetime",
  "rfc-2822",
];

const INPUT_MODE_LABELS: Readonly<Record<DateInputMode, string>> = {
  get auto() {
    return messages.dateConverter.inputModes.auto;
  },
  get "iso-8601"() {
    return messages.dateConverter.inputModes.iso8601;
  },
  get "rfc-2822"() {
    return messages.dateConverter.inputModes.rfc2822;
  },
  get "sql-datetime"() {
    return messages.dateConverter.inputModes.sqlDatetime;
  },
  get "unix-microseconds"() {
    return messages.dateConverter.inputModes.unixMicroseconds;
  },
  get "unix-milliseconds"() {
    return messages.dateConverter.inputModes.unixMilliseconds;
  },
  get "unix-nanoseconds"() {
    return messages.dateConverter.inputModes.unixNanoseconds;
  },
  get "unix-seconds"() {
    return messages.dateConverter.inputModes.unixSeconds;
  },
};

const OUTPUTS: readonly OutputDefinition[] = [
  {
    key: "unixSeconds",
    get label() {
      return messages.dateConverter.unixSeconds;
    },
    marker: "EPOCH / S",
  },
  {
    key: "unixMilliseconds",
    get label() {
      return messages.dateConverter.unixMilliseconds;
    },
    marker: "EPOCH / MS",
  },
  {
    key: "iso8601",
    get label() {
      return messages.dateConverter.iso8601;
    },
    marker: "ISO / UTC",
  },
  {
    key: "iso8601Local",
    get label() {
      return messages.dateConverter.details.isoLocal;
    },
    marker: "ISO / LOCAL",
  },
  {
    key: "rfc2822",
    get label() {
      return messages.dateConverter.rfc2822;
    },
    marker: "RFC / UTC",
  },
  {
    key: "sqlDateTime",
    get label() {
      return messages.dateConverter.details.sqlDateTime;
    },
    marker: "SQL / LOCAL",
  },
];

const TOUR_ID = "date-converter-intro";
const TOUR_TARGETS = {
  controls: "date-converter-tour-controls",
  results: "date-converter-tour-results",
  timezone: "date-converter-tour-timezone",
} as const;

const getTourSteps = (): readonly DeveloperToolTourStep[] => [
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
      className="group flex min-w-0 flex-col justify-between border-b p-4 sm:border-r"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
            {definition.marker}
          </p>
          <h3 className="mt-0.5 font-medium text-sm">{definition.label}</h3>
        </div>
        <Button
          aria-label={formatMessage(messages.dateConverter.copyOutput, {
            format: definition.label,
          })}
          onClick={onCopy}
          size="icon-xs"
          type="button"
          variant="ghost"
        >
          <span className="relative size-3.5">
            <AnimatePresence initial={false} mode="sync">
              <motion.span
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0"
                exit={{
                  opacity: 0,
                  scale: shouldReduceMotion ? 1 : 0.95,
                }}
                initial={{
                  opacity: 0,
                  scale: shouldReduceMotion ? 1 : 0.95,
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
      <code className="mt-3 block overflow-x-auto font-mono text-sm leading-6">
        {value}
      </code>
    </section>
  );
}

function renderStatusBadge(
  result: DateConversionResult | null,
  error: string | null
) {
  if (result) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-success text-xs">
        <HugeiconsIcon className="size-3.5" icon={CheckmarkCircle02Icon} />
        <span>
          {formatMessage(messages.dateConverter.status.valid, {
            format: INPUT_MODE_LABELS[result.detectedMode],
          })}
        </span>
      </span>
    );
  }
  if (error) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-destructive text-xs">
        <HugeiconsIcon className="size-3.5" icon={AlertCircleIcon} />
        <span className="max-w-48 truncate">{error}</span>
      </span>
    );
  }
  return (
    <span className="text-muted-foreground text-xs">
      {messages.dateConverter.status.empty}
    </span>
  );
}

function renderResultsContent({
  activeTab,
  copiedOutput,
  copyOutput,
  result,
  shouldReduceMotion,
  timeZone,
}: {
  readonly activeTab: "formats" | "breakdown";
  readonly copiedOutput: OutputKey | null;
  readonly copyOutput: (key: OutputKey) => void;
  readonly result: DateConversionResult | null;
  readonly shouldReduceMotion: boolean;
  readonly timeZone: string;
}) {
  if (!result) {
    return (
      <div className="grid min-h-48 place-items-center p-6 text-center text-muted-foreground text-xs">
        <p className="max-w-xs leading-5">
          {messages.dateConverter.emptyResults}
        </p>
      </div>
    );
  }

  if (activeTab === "breakdown") {
    return (
      <div className="mt-3">
        <DateDetailsBreakdown result={result} timeZone={timeZone} />
      </div>
    );
  }

  return (
    <div className="grid divide-y border-b sm:grid-cols-2 sm:divide-y-0">
      {OUTPUTS.map((definition) => (
        <OutputCard
          copied={copiedOutput === definition.key}
          definition={definition}
          key={definition.key}
          onCopy={() => copyOutput(definition.key)}
          shouldReduceMotion={shouldReduceMotion}
          value={result[definition.key]}
        />
      ))}
    </div>
  );
}

export function DateConverter() {
  const { locale } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const tourSteps = useMemo(() => getTourSteps(), [locale]);
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
  const [activeTab, setActiveTab] = useState<"formats" | "breakdown">(
    "formats"
  );

  useEffect(() => {
    if (savedTimeZone !== timeZone) {
      setSavedTimeZone(timeZone);
    }
  }, [savedTimeZone, setSavedTimeZone, timeZone]);

  const convert = useCallback(
    (
      nextInput = input,
      nextInputMode = inputMode,
      nextTimeZone = timeZone,
      notify = false
    ) => {
      try {
        const nextResult = convertDate({
          input: nextInput,
          inputMode: nextInputMode,
          timeZone: nextTimeZone,
        });
        setResult(nextResult);
        setError(null);
        setCopiedOutput(null);
        if (notify) {
          toast.success(
            formatMessage(messages.dateConverter.conversionSuccess, {
              format: INPUT_MODE_LABELS[nextResult.detectedMode],
            })
          );
        }
      } catch (conversionError) {
        const msg =
          conversionError instanceof DateConversionError
            ? conversionError.message
            : messages.dateConverter.conversionFailed;
        setResult(null);
        setError(msg);
        if (notify) {
          toast.error(msg);
        }
      }
    },
    [input, inputMode, timeZone]
  );

  useEffect(() => {
    convert();
  }, [convert]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        convert(input, inputMode, timeZone, true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [convert, input, inputMode, timeZone]);

  const changeInputMode = (value: string) => {
    // SAFETY: INPUT_MODES is the complete set of values accepted by the mode control.
    if (INPUT_MODES.includes(value as DateInputMode)) {
      const nextMode = value as DateInputMode;
      setInputMode(nextMode);
      if (result) {
        convert(input, nextMode, timeZone);
      }
    }
  };

  const changeTimeZone = (nextTimeZone: string) => {
    setSavedTimeZone(nextTimeZone);
    if (result) {
      convert(input, inputMode, nextTimeZone);
    }
  };

  const applyDate = useCallback(
    (date: Date) => {
      let nextInput: string;
      if (inputMode === "unix-seconds") {
        nextInput = String(Math.floor(date.getTime() / 1000));
      } else if (inputMode === "unix-milliseconds") {
        nextInput = String(date.getTime());
      } else if (inputMode === "unix-microseconds") {
        nextInput = (BigInt(date.getTime()) * 1000n).toString();
      } else if (inputMode === "unix-nanoseconds") {
        nextInput = (BigInt(date.getTime()) * 1000000n).toString();
      } else {
        nextInput = date.toISOString();
      }
      setInput(nextInput);
      convert(nextInput, inputMode, timeZone);
    },
    [convert, inputMode, timeZone]
  );

  const useCurrentTime = () => {
    const currentMilliseconds = String(Date.now());
    setInput(currentMilliseconds);
    setInputMode("unix-milliseconds");
    convert(currentMilliseconds, "unix-milliseconds", timeZone, true);
    toast.success(messages.dateConverter.currentTimeApplied);
  };

  const shiftTime = (amount: number, unit: "hour" | "day" | "week") => {
    let baseTime: number;
    if (result) {
      baseTime = Number(result.unixMilliseconds);
    } else {
      try {
        const temp = convertDate({ input, inputMode, timeZone });
        baseTime = Number(temp.unixMilliseconds);
      } catch {
        baseTime = Date.now();
      }
    }

    const d = new Date(baseTime);
    let next: Date;
    if (unit === "hour") {
      next = addHours(d, amount);
    } else if (unit === "day") {
      next = addDays(d, amount);
    } else {
      next = addWeeks(d, amount);
    }

    applyDate(next);
  };

  const parsedDateForPicker = useMemo(() => {
    if (result) {
      const d = new Date(result.iso8601);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    try {
      const res = convertDate({ input, inputMode, timeZone });
      const d = new Date(res.iso8601);
      return Number.isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }, [result, input, inputMode, timeZone]);

  const copyOutput = async (key: OutputKey) => {
    if (!result) {
      return;
    }
    try {
      const copied = await copyToClipboard(result[key]);
      setCopiedOutput(copied ? key : null);
      if (copied) {
        const def = OUTPUTS.find((o) => o.key === key);
        const label = def ? def.label : key;
        toast.success(
          formatMessage(messages.dateConverter.copySuccess, {
            format: label,
          })
        );
      } else {
        toast.error(messages.dateConverter.copyFailed);
        setError(messages.dateConverter.copyFailed);
      }
    } catch {
      setCopiedOutput(null);
      toast.error(messages.dateConverter.copyFailed);
      setError(messages.dateConverter.copyFailed);
    }
  };

  const resetExample = () => {
    setInput(EXAMPLE_VALUE);
    setInputMode("auto");
    setSavedTimeZone("UTC");
    setError(null);
    setCopiedOutput(null);
    convert(EXAMPLE_VALUE, "auto", "UTC");
  };

  const clear = () => {
    setInput("");
    setResult(null);
    setError(null);
    setCopiedOutput(null);
  };

  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4"
      clearLabel={messages.dateConverter.clear}
      description={messages.dateConverter.description}
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={clear}
      onReset={resetExample}
      resetLabel={messages.dateConverter.resetExample}
      title={messages.dateConverter.title}
      tour={
        <DeveloperToolTourButton
          label={messages.dateConverter.tour.startButton}
          steps={tourSteps}
          storageKey="date-converter-tour-seen"
          tourId={TOUR_ID}
        />
      }
    >
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-12">
        {/* Left pane: Controls, Input, Steppers (Compact) */}
        <div
          className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:col-span-5"
          id={TOUR_TARGETS.controls}
        >
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm tracking-tight">
                {messages.dateConverter.inputLabel}
              </h2>
            </div>
            {renderStatusBadge(result, error)}
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date-input-mode" size="sm">
                  {messages.dateConverter.inputModeLabel}
                </Label>
                <Select onValueChange={changeInputMode} value={inputMode}>
                  <SelectTrigger
                    className="w-full"
                    id="date-input-mode"
                    variant="surface"
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

              <div className="space-y-1.5">
                <Label htmlFor="date-timezone" size="sm">
                  {messages.dateConverter.timezoneLabel}
                </Label>
                <TimezoneCombobox
                  emptyMessage={messages.dateConverter.timezoneEmpty}
                  id="date-timezone"
                  onChange={changeTimeZone}
                  options={timeZoneOptions}
                  searchPlaceholder={messages.dateConverter.timezoneSearch}
                  useQueryLabel={(tz) =>
                    formatMessage(messages.dateConverter.timezoneUse, {
                      timezone: tz,
                    })
                  }
                  value={timeZone}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date-converter-input" size="sm">
                {messages.dateConverter.inputLabel}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  aria-describedby="date-converter-help"
                  aria-invalid={error ? true : undefined}
                  autoComplete="off"
                  className="flex-1"
                  id="date-converter-input"
                  onChange={(event) => {
                    const val = event.currentTarget.value;
                    setInput(val);
                    if (val.trim()) {
                      try {
                        const res = convertDate({
                          input: val,
                          inputMode,
                          timeZone,
                        });
                        setResult(res);
                        setError(null);
                      } catch {
                        // Silent live typing errors until convert is invoked
                      }
                    } else {
                      setResult(null);
                      setError(null);
                    }
                  }}
                  placeholder={messages.dateConverter.inputPlaceholder}
                  size="xl"
                  spellCheck={false}
                  value={input}
                  variant="mono-flat"
                />
                <DatePickerPopover
                  currentDate={parsedDateForPicker}
                  onDateChange={applyDate}
                />
              </div>
            </div>

            <Button
              className="w-full active:translate-y-px"
              onClick={() => convert(input, inputMode, timeZone, true)}
              size="lg"
              type="button"
            >
              <Clock3 data-icon="inline-start" />
              {messages.dateConverter.convert}
            </Button>

            <div className="rounded-md border bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
                  Quick Shift
                </span>
                <Button
                  onClick={useCurrentTime}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  <TimerReset data-icon="inline-start" />
                  {messages.dateConverter.useCurrentTime}
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                <Button
                  onClick={() => shiftTime(-1, "day")}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  {messages.dateConverter.stepper.minusDay}
                </Button>
                <Button
                  onClick={() => shiftTime(-1, "hour")}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  {messages.dateConverter.stepper.minusHour}
                </Button>
                <Button
                  onClick={() => shiftTime(1, "hour")}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  {messages.dateConverter.stepper.plusHour}
                </Button>
                <Button
                  onClick={() => shiftTime(1, "day")}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  {messages.dateConverter.stepper.plusDay}
                </Button>
                <Button
                  onClick={() => shiftTime(1, "week")}
                  size="xs"
                  type="button"
                  variant="outline"
                >
                  {messages.dateConverter.stepper.plusWeek}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <p id="date-converter-help">{messages.dateConverter.inputHelp}</p>
              <span className="font-mono uppercase">
                {messages.dateConverter.shortcutLabel}
              </span>
            </div>

            {error && (
              <div
                className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3"
                role="alert"
              >
                <p className="font-medium text-destructive text-sm">
                  {messages.dateConverter.conversionFailed}
                </p>
                <p className="mt-0.5 text-muted-foreground text-xs">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Results & Breakdown (Side by Side) */}
        <div
          className="flex flex-col overflow-hidden rounded-lg border bg-card lg:col-span-7"
          id={TOUR_TARGETS.results}
        >
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Button
                  aria-pressed={activeTab === "formats"}
                  onClick={() => setActiveTab("formats")}
                  size="sm"
                  variant={activeTab === "formats" ? "secondary" : "ghost"}
                >
                  {messages.dateConverter.formatsTab}
                </Button>
                <Button
                  aria-pressed={activeTab === "breakdown"}
                  onClick={() => setActiveTab("breakdown")}
                  size="sm"
                  variant={activeTab === "breakdown" ? "secondary" : "ghost"}
                >
                  {messages.dateConverter.breakdownTab}
                </Button>
              </div>
              {result && (
                <span className="border px-2 py-0.5 font-mono text-muted-foreground text-xs uppercase tracking-wider">
                  {formatMessage(messages.dateConverter.detectedAs, {
                    format: INPUT_MODE_LABELS[result.detectedMode],
                  })}
                </span>
              )}
            </div>

            {renderResultsContent({
              activeTab,
              copiedOutput,
              copyOutput,
              result,
              shouldReduceMotion: shouldReduceMotion ?? false,
              timeZone,
            })}
          </div>

          {/* Timezone Projection Footer */}
          <div
            className="border-t bg-muted/15 px-4 py-2.5"
            id={TOUR_TARGETS.timezone}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <Globe2 className="size-3.5 text-muted-foreground" />
                <span className="font-semibold text-xs tracking-tight">
                  {messages.dateConverter.timezoneTitle}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground uppercase">
                  {timeZone}
                </span>
              </div>
              {result && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {result.relativeTime}
                </span>
              )}
            </div>

            {result ? (
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <code className="truncate font-medium font-mono text-foreground text-xs sm:text-sm">
                  {result.zonedDateTime}
                </code>
                <Button
                  aria-label={formatMessage(messages.dateConverter.copyOutput, {
                    format: messages.dateConverter.timezoneTitle,
                  })}
                  onClick={() => {
                    copyToClipboard(result.zonedDateTime);
                    toast.success(
                      formatMessage(messages.dateConverter.copySuccess, {
                        format: messages.dateConverter.timezoneTitle,
                      })
                    );
                  }}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <ClipboardCopy className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <p className="mt-1 text-muted-foreground text-xs leading-normal">
                {messages.dateConverter.emptyTimezone}
              </p>
            )}
          </div>
        </div>
      </div>
    </DeveloperToolLayout>
  );
}
