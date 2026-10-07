import {
  CheckmarkCircle02Icon,
  ComputerTerminalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ClipboardCopy } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  developerToolChildVariants as childVariants,
  DeveloperToolLayout,
} from "@/features/developer-tools/components/developer-tool-layout";
import {
  DeveloperToolTourButton,
  type DeveloperToolTourStep,
} from "@/features/developer-tools/components/developer-tool-tour-button";
import { TimezoneCombobox } from "@/features/developer-tools/components/timezone-combobox";
import {
  getTimeZoneOptions,
  resolveTimeZone,
} from "@/features/developer-tools/timezones";
import {
  buildCronExpression,
  type CronSchedule,
  DEFAULT_CRON_SCHEDULE,
} from "@/features/developer-tools/tools/cron-parser/build-cron-expression";
import { CronPreviewDatePicker } from "@/features/developer-tools/tools/cron-parser/components/cron-preview-date-picker";
import { CronPreviewResults } from "@/features/developer-tools/tools/cron-parser/components/cron-preview-results";
import { CronScheduleControls } from "@/features/developer-tools/tools/cron-parser/components/cron-schedule-controls";
import {
  type CronPreview,
  parseCronPreview,
  readPreviewDate,
} from "@/features/developer-tools/tools/cron-parser/cron-preview";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, getActiveLocale, messages } from "@/lib/i18n";

const EXAMPLE_EXPRESSION = "*/15 * * * *";
const DEFAULT_TIME_ZONE = "Asia/Jakarta";

const CRON_PARSER_TOUR_ID = "cron-parser-intro";
const CRON_PARSER_TOUR_TARGETS = {
  controls: "cron-parser-tour-controls",
  fields: "cron-parser-tour-fields",
  runs: "cron-parser-tour-runs",
} as const;
const getCronParserTourSteps = (): readonly DeveloperToolTourStep[] => [
  {
    description: messages.cronParser.tour.controlsDescription,
    position: "bottom",
    selectorId: CRON_PARSER_TOUR_TARGETS.controls,
    title: messages.cronParser.tour.controlsTitle,
  },
  {
    description: messages.cronParser.tour.fieldsDescription,
    position: "top",
    selectorId: CRON_PARSER_TOUR_TARGETS.fields,
    title: messages.cronParser.tour.fieldsTitle,
  },
  {
    description: messages.cronParser.tour.runsDescription,
    position: "top",
    selectorId: CRON_PARSER_TOUR_TARGETS.runs,
    title: messages.cronParser.tour.runsTitle,
  },
];

function formatExecution(date: Date, timeZone: string) {
  const locale = getActiveLocale();
  const dateTime = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    hour12: false,
    timeStyle: "short",
    timeZone,
  }).format(date);
  const zoneName = getTimeZoneName(date, timeZone, "short", locale);
  const offset = getTimeZoneName(date, timeZone, "longOffset", locale);
  return `${dateTime} · ${zoneName} · ${offset}`;
}

function getTimeZoneName(
  date: Date,
  timeZone: string,
  timeZoneName: "longOffset" | "short",
  locale = getActiveLocale()
) {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    timeZoneName,
  }).formatToParts(date);
  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export function CronParser() {
  const { locale } = useI18n();
  const tourSteps = useMemo(() => getCronParserTourSteps(), [locale]);
  const timeZoneOptions = useMemo(
    () => getTimeZoneOptions(DEFAULT_TIME_ZONE),
    []
  );
  const [savedTimeZone, setSavedTimeZone] = useLocalStorage(
    "cron-parser-timezone",
    DEFAULT_TIME_ZONE
  );
  const timeZone = resolveTimeZone(savedTimeZone, DEFAULT_TIME_ZONE);
  const [mode, setMode] = useState<"expression" | "schedule">("expression");
  const [schedule, setSchedule] = useState<CronSchedule>(DEFAULT_CRON_SCHEDULE);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [expression, setExpression] = useState(EXAMPLE_EXPRESSION);
  const [previewFrom, setPreviewFrom] = useState("");
  const [runCount, setRunCount] = useState(5);
  const [result, setResult] = useState<CronPreview | null>(() =>
    parseCronPreview({ expression: EXAMPLE_EXPRESSION, timeZone })
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (savedTimeZone !== timeZone) {
      setSavedTimeZone(timeZone);
    }
  }, [savedTimeZone, setSavedTimeZone, timeZone]);

  const parse = useCallback(
    (selectedTimeZone = timeZone) => {
      try {
        setResult(
          parseCronPreview({
            expression:
              mode === "schedule" ? buildCronExpression(schedule) : expression,
            timeZone: selectedTimeZone,
            currentDate: readPreviewDate(previewFrom, selectedTimeZone),
            runCount,
          })
        );
        setError(null);
      } catch (parseError) {
        setResult(null);
        setError(
          parseError instanceof Error
            ? parseError.message
            : messages.cronParser.parseFailed
        );
      }
    },
    [expression, mode, schedule, timeZone, previewFrom, runCount, locale]
  );

  useEffect(() => {
    if (mode === "expression" && !expression.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    parse();
  }, [parse, mode, expression]);

  const changeSchedule = (nextSchedule: CronSchedule) => {
    setSchedule(nextSchedule);
  };

  const changeMode = (values: readonly unknown[]) => {
    const nextMode = values.at(-1);
    if (nextMode !== "expression" && nextMode !== "schedule") {
      return;
    }
    if (nextMode === mode) {
      return;
    }
    if (nextMode === "schedule") {
      changeSchedule(schedule);
    } else if (result) {
      setExpression(result.normalizedExpression);
    } else {
      setResult(null);
      setError(null);
    }
    setMode(nextMode);
  };

  const copyExpression = async () => {
    if (!result) {
      return;
    }
    try {
      const success = await copyToClipboard(result.normalizedExpression);
      setCopied(success);
      setCopyError(success ? null : messages.cronParser.builder.copyFailed);
    } catch {
      setCopied(false);
      setCopyError(messages.cronParser.builder.copyFailed);
    }
  };

  useEffect(() => {
    setCopied(false);
    setCopyError(null);
  }, [result]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        parse();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [parse]);

  const changeTimeZone = (nextTimeZone: string) => {
    setSavedTimeZone(nextTimeZone);
    if (result) {
      parse(nextTimeZone);
    }
  };

  const resetExample = () => {
    setPreviewFrom("");
    setRunCount(5);
    setExpression(EXAMPLE_EXPRESSION);
    setSchedule(DEFAULT_CRON_SCHEDULE);
    setSavedTimeZone(DEFAULT_TIME_ZONE);
    setResult(
      parseCronPreview({
        expression: EXAMPLE_EXPRESSION,
        timeZone: DEFAULT_TIME_ZONE,
      })
    );
    setError(null);
  };

  const clear = () => {
    setMode("expression");
    setExpression("");
    setResult(null);
    setError(null);
  };

  const scheduleHelp =
    schedule.frequency === "monthly"
      ? messages.cronParser.builder.monthlyHelp
      : messages.cronParser.builder.help;

  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-3 pb-0 lg:overflow-hidden [&>header]:shrink-0 [&>header]:border-b-0 [&>header]:pb-0"
      clearLabel={messages.cronParser.clear}
      description={messages.cronParser.description}
      mainClassName="flex min-h-0 flex-1 flex-col gap-3"
      onClear={clear}
      onReset={resetExample}
      resetLabel={messages.cronParser.resetExample}
      title={messages.cronParser.title}
      tour={
        <DeveloperToolTourButton
          label={messages.cronParser.tour.startButton}
          steps={tourSteps}
          storageKey="cron-parser-tour-seen"
          tourId={CRON_PARSER_TOUR_ID}
        />
      }
    >
      <motion.section
        className="shrink-0 rounded-lg bg-muted/20 px-4 py-3"
        id={CRON_PARSER_TOUR_TARGETS.controls}
        variants={childVariants}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <ToggleGroup
            aria-label={messages.cronParser.builder.modeLabel}
            onValueChange={changeMode}
            size="sm"
            value={[mode]}
            variant="outline"
          >
            <ToggleGroupItem value="expression">
              {messages.cronParser.builder.expressionMode}
            </ToggleGroupItem>
            <ToggleGroupItem value="schedule">
              {messages.cronParser.builder.scheduleMode}
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={() => parse()} size="sm" type="button">
            <HugeiconsIcon
              data-icon="inline-start"
              icon={ComputerTerminalIcon}
              strokeWidth={2}
            />
            {mode === "schedule"
              ? messages.cronParser.builder.preview
              : messages.cronParser.parse}
          </Button>
        </div>
        <FieldGroup
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.75fr)_auto]"
          size="sm"
        >
          <Field className="min-w-0" data-invalid={Boolean(error)} size="sm">
            <FieldLabel
              htmlFor={
                mode === "expression" ? "cron-expression" : "cron-configure"
              }
              size="sm"
            >
              {mode === "expression"
                ? messages.cronParser.expressionLabel
                : messages.cronParser.builder.frequencyLabel}
            </FieldLabel>
            <div className="flex h-16 min-w-0 flex-col gap-2">
              {mode === "expression" ? (
                <Textarea
                  aria-describedby="cron-expression-help"
                  aria-invalid={error ? true : undefined}
                  autoComplete="off"
                  className="h-full resize-none [field-sizing:fixed]"
                  id="cron-expression"
                  onChange={(event) => setExpression(event.currentTarget.value)}
                  placeholder={messages.cronParser.expressionPlaceholder}
                  rows={2}
                  size="xs"
                  spellCheck={false}
                  value={expression}
                  variant="mono"
                />
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="w-full justify-between"
                      id="cron-configure"
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <span>
                        {
                          messages.cronParser.builder.frequencies[
                            schedule.frequency
                          ]
                        }
                      </span>
                      <span>{messages.cronParser.enhancements.configure}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[min(32rem,calc(100vw-2rem))]"
                  >
                    <ScrollArea
                      className="max-h-[60dvh]"
                      viewportClassName="max-h-[60dvh]"
                    >
                      <CronScheduleControls
                        invalid={Boolean(error)}
                        onChange={changeSchedule}
                        schedule={schedule}
                      />
                      <p className="mt-3 text-muted-foreground text-xs">
                        {scheduleHelp}
                      </p>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              )}
              {mode === "schedule" && result ? (
                <code
                  className="truncate font-mono text-muted-foreground text-xs"
                  title={result.normalizedExpression}
                >
                  {result.normalizedExpression.replaceAll("\n", "; ")}
                </code>
              ) : null}
            </div>
          </Field>
          <Field className="min-w-0" size="sm">
            <FieldLabel htmlFor="cron-timezone" size="sm">
              {messages.cronParser.timezoneLabel}
            </FieldLabel>
            <TimezoneCombobox
              emptyMessage={messages.cronParser.timezoneEmpty}
              id="cron-timezone"
              onChange={changeTimeZone}
              options={timeZoneOptions}
              searchPlaceholder={messages.cronParser.timezoneSearch}
              useQueryLabel={(timezone) =>
                formatMessage(messages.cronParser.timezoneUse, { timezone })
              }
              value={timeZone}
            />
          </Field>
          <Field className="min-w-0" size="sm">
            <FieldLabel htmlFor="cron-preview-from" size="sm">
              {messages.cronParser.enhancements.previewFrom}
            </FieldLabel>
            <CronPreviewDatePicker
              onChange={setPreviewFrom}
              timeZone={timeZone}
              value={previewFrom}
            />
          </Field>
          <Field size="sm">
            <FieldLabel size="sm">
              {messages.cronParser.enhancements.runCount}
            </FieldLabel>
            <ToggleGroup
              aria-label={messages.cronParser.enhancements.runCount}
              onValueChange={(values) => {
                const count = Number(values.at(-1));
                if ([5, 10, 20].includes(count)) {
                  setRunCount(count);
                }
              }}
              size="sm"
              value={[String(runCount)]}
              variant="outline"
            >
              {[5, 10, 20].map((count) => (
                <ToggleGroupItem
                  aria-label={formatMessage(
                    messages.cronParser.enhancements.runOption,
                    { count }
                  )}
                  key={count}
                  value={String(count)}
                >
                  {count}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </FieldGroup>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p
            className="truncate text-muted-foreground text-xs"
            id="cron-expression-help"
            title={
              mode === "expression"
                ? messages.cronParser.expressionHelp
                : scheduleHelp
            }
          >
            {mode === "expression"
              ? messages.cronParser.expressionHelp
              : scheduleHelp}
          </p>
          <span className="hidden shrink-0 font-mono text-muted-foreground text-xs xl:block">
            {messages.cronParser.shortcutLabel}
          </span>
        </div>
      </motion.section>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{messages.cronParser.invalidExpression}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {copyError ? (
        <p className="text-destructive text-xs" role="alert">
          {copyError}
        </p>
      ) : null}
      {result ? (
        <section className="flex shrink-0 items-center justify-between gap-3 px-1">
          <div className="flex min-w-0 items-center gap-2">
            <HugeiconsIcon
              className="size-4 shrink-0 text-success"
              icon={CheckmarkCircle02Icon}
              strokeWidth={2}
            />
            <div className="min-w-0">
              <h2
                className="truncate font-semibold text-sm"
                title={result.entries
                  .map((entry) => entry.description)
                  .join("; ")}
              >
                {result.entries.length === 1
                  ? result.entries[0]?.description
                  : formatMessage(
                      messages.cronParser.enhancements.combinedSchedule,
                      { count: result.entries.length }
                    )}
              </h2>
              <p
                className="truncate text-muted-foreground text-xs"
                title={formatExecution(result.currentDate, result.timeZone)}
              >
                {formatMessage(
                  messages.cronParser.enhancements.upcomingDescription,
                  {
                    count: result.nextRuns.length,
                    date: formatExecution(result.currentDate, result.timeZone),
                  }
                )}
              </p>
            </div>
          </div>
          <Button
            aria-label={
              copied
                ? messages.cronParser.builder.copied
                : messages.cronParser.builder.copyExpression
            }
            onClick={copyExpression}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            {copied ? <Check /> : <ClipboardCopy />}
          </Button>
        </section>
      ) : null}
      <CronPreviewResults
        fieldsId={CRON_PARSER_TOUR_TARGETS.fields}
        onLoad={(nextExpression, nextTimeZone) => {
          setMode("expression");
          setExpression(nextExpression);
          setSavedTimeZone(nextTimeZone);
        }}
        preview={result}
        runsId={CRON_PARSER_TOUR_TARGETS.runs}
      />
    </DeveloperToolLayout>
  );
}
