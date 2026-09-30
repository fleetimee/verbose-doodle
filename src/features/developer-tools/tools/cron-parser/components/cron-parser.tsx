import {
  CheckmarkCircle02Icon,
  ComputerTerminalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ClipboardCopy, Clock3 } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { CronScheduleControls } from "@/features/developer-tools/tools/cron-parser/components/cron-schedule-controls";
import {
  type CronParseResult,
  parseCronExpression,
} from "@/features/developer-tools/tools/cron-parser/parse-cron-expression";
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
    dateStyle: "full",
    hour12: false,
    timeStyle: "medium",
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
  const [result, setResult] = useState<CronParseResult | null>(() =>
    parseCronExpression({ expression: EXAMPLE_EXPRESSION, timeZone })
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
          parseCronExpression({
            expression:
              mode === "schedule" ? buildCronExpression(schedule) : expression,
            timeZone: selectedTimeZone,
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
    [expression, mode, schedule, timeZone]
  );

  const changeSchedule = (nextSchedule: CronSchedule) => {
    setSchedule(nextSchedule);
    try {
      setResult(
        parseCronExpression({
          expression: buildCronExpression(nextSchedule),
          timeZone,
        })
      );
      setError(null);
    } catch (scheduleError) {
      setResult(null);
      setError(
        scheduleError instanceof Error
          ? scheduleError.message
          : messages.cronParser.parseFailed
      );
    }
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
    setExpression(EXAMPLE_EXPRESSION);
    setSchedule(DEFAULT_CRON_SCHEDULE);
    setSavedTimeZone(DEFAULT_TIME_ZONE);
    setResult(
      parseCronExpression({
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
      className="min-h-0 flex-1 gap-4 pb-4 [&>header]:border-b-0 [&>header]:pb-2"
      clearLabel={messages.cronParser.clear}
      description={messages.cronParser.description}
      mainClassName="flex min-h-0 flex-1 flex-col"
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
        <ToggleGroup
          aria-label={messages.cronParser.builder.modeLabel}
          className="mb-3"
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
        <FieldGroup className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)] sm:items-end lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)_auto]">
          {mode === "schedule" ? (
            <CronScheduleControls
              invalid={Boolean(error)}
              onChange={changeSchedule}
              schedule={schedule}
            />
          ) : (
            <Field className="min-w-0" data-invalid={Boolean(error)} size="sm">
              <FieldLabel htmlFor="cron-expression" size="sm">
                {messages.cronParser.expressionLabel}
              </FieldLabel>
              <Input
                aria-describedby="cron-expression-help"
                aria-invalid={error ? true : undefined}
                autoComplete="off"
                id="cron-expression"
                onChange={(event) => setExpression(event.currentTarget.value)}
                placeholder={messages.cronParser.expressionPlaceholder}
                size="default"
                spellCheck={false}
                value={expression}
                variant="mono-flat"
              />
            </Field>
          )}
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
          <Button
            className="min-w-28 sm:col-span-2 lg:col-span-1"
            onClick={() => parse()}
            size="default"
            type="button"
          >
            <HugeiconsIcon
              data-icon="inline-start"
              icon={ComputerTerminalIcon}
              strokeWidth={2}
            />
            {mode === "schedule"
              ? messages.cronParser.builder.preview
              : messages.cronParser.parse}
          </Button>
        </FieldGroup>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p
            className="text-muted-foreground text-xs leading-5"
            id="cron-expression-help"
          >
            {mode === "expression"
              ? messages.cronParser.expressionHelp
              : scheduleHelp}
          </p>
          <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
            {messages.cronParser.shortcutLabel}
          </span>
        </div>
      </motion.section>
      {error ? (
        <div
          className="mt-4 border border-destructive/40 bg-destructive/5 px-4 py-3"
          role="alert"
        >
          <p className="font-medium text-destructive text-sm">
            {messages.cronParser.invalidExpression}
          </p>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            {error}
          </p>
        </div>
      ) : null}
      {copyError ? (
        <p className="mt-2 text-destructive text-xs" role="alert">
          {copyError}
        </p>
      ) : null}
      <AnimatePresence>
        {result ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex min-h-0 flex-1 flex-col gap-4"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key="cron-results"
            transition={{ duration: 0.2 }}
          >
            <section className="flex flex-wrap items-center justify-between gap-3 pb-2">
              <div className="flex min-w-0 items-start gap-3">
                <HugeiconsIcon
                  className="mt-0.5 size-5 shrink-0 text-success"
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                />
                <div className="min-w-0">
                  <h2 className="font-semibold text-lg tracking-tight sm:text-xl">
                    {result.description}
                  </h2>
                  <p className="mt-1 text-success text-xs">
                    {messages.cronParser.validExpression}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <code className="break-all rounded-md bg-muted/40 px-2.5 py-1.5 font-mono text-xs">
                  {result.normalizedExpression}
                </code>
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
              </div>
            </section>

            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <section
                className="flex min-w-0 flex-col"
                id={CRON_PARSER_TOUR_TARGETS.fields}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                  <h2 className="font-semibold text-sm">
                    {messages.cronParser.fieldBreakdown}
                  </h2>
                  <span className="text-muted-foreground text-xs">
                    {result.mode === "five-field"
                      ? messages.cronParser.fiveFields
                      : messages.cronParser.sixFields}
                  </span>
                </div>
                <p className="mb-3 text-muted-foreground text-xs">
                  {messages.cronParser.fieldBreakdownDescription}
                </p>
                <div className="flex flex-1 flex-col divide-y rounded-lg border bg-background/50">
                  {result.fields.map((field) => (
                    <article
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-2.5"
                      key={field.key}
                    >
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm">
                          {messages.cronParser.fieldLabels[field.key]}
                        </h3>
                        <p className="mt-0.5 text-muted-foreground text-xs">
                          {formatMessage(messages.cronParser.allowedRange, {
                            range: field.range,
                          })}
                        </p>
                      </div>
                      <code className="max-w-[50%] break-all rounded-md bg-muted/50 px-2 py-1 font-mono text-sm">
                        {field.token}
                      </code>
                    </article>
                  ))}
                </div>
              </section>

              <section
                className="flex min-w-0 flex-col"
                id={CRON_PARSER_TOUR_TARGETS.runs}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                  <h2 className="font-semibold text-sm">
                    {messages.cronParser.upcomingRuns}
                  </h2>
                  <span className="font-mono text-muted-foreground text-xs">
                    {timeZone}
                  </span>
                </div>
                <p className="mb-3 text-muted-foreground text-xs">
                  {messages.cronParser.upcomingRunsDescription}
                </p>
                <ol className="flex flex-1 flex-col divide-y rounded-lg border bg-background/50">
                  {result.nextRuns.map((date, index) => (
                    <li
                      className="flex flex-1 items-center gap-3 px-4 py-3"
                      key={date.toISOString()}
                    >
                      <span className="font-mono text-muted-foreground text-xs">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <time
                        className="min-w-0 flex-1 break-words font-mono text-xs leading-5"
                        dateTime={date.toISOString()}
                      >
                        {formatExecution(date, timeZone)}
                      </time>
                      <Clock3 className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DeveloperToolLayout>
  );
}
