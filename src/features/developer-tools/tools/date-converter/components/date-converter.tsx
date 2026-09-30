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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const INPUT_MODE_GROUPS: readonly {
  readonly label: "automatic" | "dateStandards" | "unixTimestamps";
  readonly modes: readonly DateInputMode[];
}[] = [
  { label: "automatic", modes: ["auto"] },
  {
    label: "unixTimestamps",
    modes: [
      "unix-seconds",
      "unix-milliseconds",
      "unix-microseconds",
      "unix-nanoseconds",
    ],
  },
  {
    label: "dateStandards",
    modes: ["iso-8601", "sql-datetime", "rfc-2822"],
  },
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
  },
  {
    key: "unixMilliseconds",
    get label() {
      return messages.dateConverter.unixMilliseconds;
    },
  },
  {
    key: "iso8601",
    get label() {
      return messages.dateConverter.iso8601;
    },
  },
  {
    key: "iso8601Local",
    get label() {
      return messages.dateConverter.details.isoLocal;
    },
  },
  {
    key: "rfc2822",
    get label() {
      return messages.dateConverter.rfc2822;
    },
  },
  {
    key: "sqlDateTime",
    get label() {
      return messages.dateConverter.details.sqlDateTime;
    },
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
      className="group grid min-w-0 grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)_auto] items-center gap-3 border-b px-4 py-3 last:border-b-0"
    >
      <h3 className="font-medium text-muted-foreground text-sm">
        {definition.label}
      </h3>
      <code className="min-w-0 truncate font-mono text-sm" title={value}>
        {value}
      </code>
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
    </section>
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
    <div>
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
      // SAFETY: Membership in INPUT_MODES was checked above.
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
      <FieldGroup
        className="grid sm:grid-cols-2 lg:grid-cols-[20rem_minmax(0,1fr)_auto] lg:items-end"
        id={TOUR_TARGETS.controls}
        size="sm"
        variant="toolbar"
      >
        <Field size="sm">
          <FieldLabel htmlFor="date-input-mode">
            {messages.dateConverter.inputModeLabel}
          </FieldLabel>
          <Select onValueChange={changeInputMode} value={inputMode}>
            <SelectTrigger
              className="w-full"
              id="date-input-mode"
              variant="surface"
            >
              <SelectValue>{INPUT_MODE_LABELS[inputMode]}</SelectValue>
            </SelectTrigger>
            <SelectContent
              align="start"
              className="w-(--anchor-width)"
              sideOffset={6}
            >
              {INPUT_MODE_GROUPS.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectLabel>
                    {messages.dateConverter.inputModeGroups[group.label]}
                  </SelectLabel>
                  {group.modes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {INPUT_MODE_LABELS[mode]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field size="sm">
          <FieldLabel htmlFor="date-timezone">
            {messages.dateConverter.timezoneLabel}
          </FieldLabel>
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
        </Field>

        <Button
          aria-label={messages.dateConverter.useCurrentTime}
          className="w-fit justify-self-start sm:col-span-2 lg:col-span-1 lg:justify-self-end"
          onClick={useCurrentTime}
          size="sm-compact"
          title={messages.dateConverter.useCurrentTime}
          type="button"
          variant="outline-muted"
        >
          <TimerReset data-icon="inline-start" />
          {messages.dateConverter.stepper.now}
        </Button>
      </FieldGroup>

      <div className="mt-4 grid min-h-[420px] min-w-0 overflow-hidden rounded-xl border border-border/70 lg:h-[clamp(32rem,calc(100dvh-23rem),46rem)] lg:min-h-0 lg:flex-none lg:grid-cols-[minmax(20rem,5fr)_minmax(0,7fr)] lg:grid-rows-[minmax(0,1fr)_auto]">
        <section className="flex min-h-0 min-w-0 flex-col lg:border-r">
          <header className="flex min-h-14 items-center gap-3 border-b px-4">
            <span className="font-mono text-muted-foreground text-xs">01</span>
            <h2 className="font-semibold text-sm">
              {messages.dateConverter.inputLabel}
            </h2>
          </header>

          <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
            <Field data-invalid={error ? true : undefined} size="sm">
              <FieldLabel htmlFor="date-converter-input">
                {messages.dateConverter.inputLabel}
              </FieldLabel>
              <InputGroup className="h-11">
                <InputGroupInput
                  aria-describedby="date-converter-help"
                  aria-invalid={error ? true : undefined}
                  autoComplete="off"
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
                        // Keep the last valid result while the user is typing.
                      }
                    } else {
                      setResult(null);
                      setError(null);
                    }
                  }}
                  placeholder={messages.dateConverter.inputPlaceholder}
                  spellCheck={false}
                  value={input}
                  variant="mono"
                />
                <InputGroupAddon align="inline-end">
                  <DatePickerPopover
                    currentDate={parsedDateForPicker}
                    onDateChange={applyDate}
                  />
                </InputGroupAddon>
              </InputGroup>
              {error ? (
                <FieldError>{error}</FieldError>
              ) : (
                <FieldDescription id="date-converter-help">
                  {messages.dateConverter.inputHelp}
                </FieldDescription>
              )}
            </Field>

            <div className="flex flex-col gap-2.5">
              <p className="font-medium text-muted-foreground text-xs">
                {messages.dateConverter.quickShiftLabel}
              </p>
              <div className="flex flex-wrap gap-2">
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

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <span className="font-mono text-muted-foreground text-xs uppercase">
                {messages.dateConverter.shortcutLabel}
              </span>
              <Button
                className="active:translate-y-px"
                onClick={() => convert(input, inputMode, timeZone, true)}
                type="button"
              >
                <Clock3 data-icon="inline-start" />
                {messages.dateConverter.convert}
              </Button>
            </div>
          </div>
        </section>

        <section
          className="flex min-h-0 min-w-0 flex-col overflow-hidden border-t lg:border-t-0"
          id={TOUR_TARGETS.results}
        >
          <Tabs
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onValueChange={(value) =>
              setActiveTab(value === "breakdown" ? "breakdown" : "formats")
            }
            value={activeTab}
            variant="flush"
          >
            <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-muted-foreground text-xs">
                  02
                </span>
                <TabsList size="xs" variant="subtle">
                  <TabsTrigger size="xs" value="formats">
                    {messages.dateConverter.formatsTab}
                  </TabsTrigger>
                  <TabsTrigger size="xs" value="breakdown">
                    {messages.dateConverter.breakdownTab}
                  </TabsTrigger>
                </TabsList>
              </div>
              {result && (
                <span className="font-mono text-muted-foreground text-xs">
                  {formatMessage(messages.dateConverter.detectedAs, {
                    format: INPUT_MODE_LABELS[result.detectedMode],
                  })}
                </span>
              )}
            </header>

            <TabsContent
              className="min-h-0 overflow-auto"
              value="formats"
              variant="flush"
            >
              {renderResultsContent({
                activeTab: "formats",
                copiedOutput,
                copyOutput,
                result,
                shouldReduceMotion: shouldReduceMotion ?? false,
                timeZone,
              })}
            </TabsContent>
            <TabsContent
              className="min-h-0 overflow-auto"
              value="breakdown"
              variant="flush"
            >
              {renderResultsContent({
                activeTab: "breakdown",
                copiedOutput,
                copyOutput,
                result,
                shouldReduceMotion: shouldReduceMotion ?? false,
                timeZone,
              })}
            </TabsContent>
          </Tabs>
        </section>

        <footer
          className="border-t bg-muted/15 px-4 py-3 lg:col-span-2"
          id={TOUR_TARGETS.timezone}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Globe2 className="size-3.5 text-muted-foreground" />
              <span className="font-semibold text-xs">
                {messages.dateConverter.timezoneTitle}
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="truncate font-mono text-muted-foreground text-xs">
                {timeZone}
              </span>
            </div>
            {result && (
              <span className="font-mono text-muted-foreground text-xs">
                {result.relativeTime}
              </span>
            )}
          </div>

          {result ? (
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <code className="truncate font-medium font-mono text-xs sm:text-sm">
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
                <ClipboardCopy />
              </Button>
            </div>
          ) : (
            <p className="mt-1 text-muted-foreground text-xs leading-normal">
              {messages.dateConverter.emptyTimezone}
            </p>
          )}
        </footer>
      </div>
    </DeveloperToolLayout>
  );
}
