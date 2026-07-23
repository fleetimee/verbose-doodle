import {
  CheckmarkCircle02Icon,
  ComputerTerminalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3 } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CronParseError,
  type CronParseResult,
  parseCronExpression,
} from "@/features/developer-tools/tools/cron-parser/parse-cron-expression";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { formatMessage, messages } from "@/lib/i18n";

const EXAMPLE_EXPRESSION = "*/15 * * * *";

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

const CRON_PARSER_TOUR_ID = "cron-parser-intro";
const CRON_PARSER_TOUR_TARGETS = {
  controls: "cron-parser-tour-controls",
  fields: "cron-parser-tour-fields",
  runs: "cron-parser-tour-runs",
} as const;
const CRON_PARSER_TOUR_STEPS: readonly DeveloperToolTourStep[] = [
  {
    selectorId: CRON_PARSER_TOUR_TARGETS.controls,
    position: "bottom",
    title: messages.cronParser.tour.controlsTitle,
    description: messages.cronParser.tour.controlsDescription,
  },
  {
    selectorId: CRON_PARSER_TOUR_TARGETS.fields,
    position: "top",
    title: messages.cronParser.tour.fieldsTitle,
    description: messages.cronParser.tour.fieldsDescription,
  },
  {
    selectorId: CRON_PARSER_TOUR_TARGETS.runs,
    position: "top",
    title: messages.cronParser.tour.runsTitle,
    description: messages.cronParser.tour.runsDescription,
  },
];

function formatExecution(date: Date, timeZone: string) {
  const dateTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    hour12: false,
    timeStyle: "medium",
    timeZone,
  }).format(date);
  const zoneName = getTimeZoneName(date, timeZone, "short");
  const offset = getTimeZoneName(date, timeZone, "longOffset");
  return `${dateTime} · ${zoneName} · ${offset}`;
}

function getTimeZoneName(
  date: Date,
  timeZone: string,
  timeZoneName: "longOffset" | "short"
) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName,
  }).formatToParts(date);
  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export function CronParser() {
  const shouldReduceMotion = useReducedMotion();
  const browserTimeZone = useMemo(getBrowserTimeZone, []);
  const timeZoneOptions = useMemo(
    () => getTimeZoneOptions(browserTimeZone),
    [browserTimeZone]
  );
  const [savedTimeZone, setSavedTimeZone] = useLocalStorage(
    "cron-parser-timezone",
    browserTimeZone
  );
  const timeZone = resolveTimeZone(savedTimeZone, browserTimeZone);
  const [expression, setExpression] = useState(EXAMPLE_EXPRESSION);
  const [result, setResult] = useState<CronParseResult | null>(null);
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
          parseCronExpression({ expression, timeZone: selectedTimeZone })
        );
        setError(null);
      } catch (parseError) {
        setResult(null);
        setError(
          parseError instanceof CronParseError
            ? parseError.message
            : messages.cronParser.invalidExpression
        );
      }
    },
    [expression, timeZone]
  );

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
    setResult(null);
    setError(null);
  };

  const clear = () => {
    setExpression("");
    setResult(null);
    setError(null);
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
          {messages.cronParser.eyebrow}
        </p>
        <h1 className="mt-4 max-w-48 font-semibold text-3xl leading-[0.96] tracking-[-0.045em]">
          {messages.cronParser.title}
        </h1>
        <p className="mt-5 text-muted-foreground text-sm leading-6">
          {messages.cronParser.description}
        </p>

        <dl className="mt-8 border-y text-xs">
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.cronParser.formatsLabel}
            </dt>
            <dd>{messages.cronParser.formatsValue}</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 border-b py-3">
            <dt className="text-muted-foreground">
              {messages.cronParser.outputLabel}
            </dt>
            <dd className="font-mono">{messages.cronParser.outputValue}</dd>
          </div>
          <div className="grid grid-cols-[72px_1fr] gap-3 py-3">
            <dt className="text-muted-foreground">
              {messages.cronParser.storageLabel}
            </dt>
            <dd className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              {messages.cronParser.storageValue}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 md:flex-col md:items-start">
          <DeveloperToolTourButton
            label={messages.cronParser.tour.startButton}
            steps={CRON_PARSER_TOUR_STEPS}
            storageKey="cron-parser-tour-seen"
            tourId={CRON_PARSER_TOUR_ID}
          />
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={resetExample}
            type="button"
          >
            {messages.cronParser.resetExample}
          </button>
          <button
            className="text-muted-foreground text-xs underline decoration-border underline-offset-4 transition-colors hover:text-foreground active:translate-y-px"
            onClick={clear}
            type="button"
          >
            {messages.cronParser.clear}
          </button>
        </div>
      </motion.aside>

      <main className="min-w-0">
        <motion.section
          className="border-y py-5"
          id={CRON_PARSER_TOUR_TARGETS.controls}
          variants={childVariants}
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)_auto] lg:items-end">
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="cron-expression">
                {messages.cronParser.expressionLabel}
              </Label>
              <Input
                aria-describedby="cron-expression-help"
                aria-invalid={error ? true : undefined}
                autoComplete="off"
                className="h-12 rounded-md bg-background px-4 font-mono text-base shadow-none md:text-base"
                id="cron-expression"
                onChange={(event) => setExpression(event.currentTarget.value)}
                placeholder={messages.cronParser.expressionPlaceholder}
                spellCheck={false}
                value={expression}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs" htmlFor="cron-timezone">
                {messages.cronParser.timezoneLabel}
              </Label>
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
            </div>
            <Button
              className="h-12 min-w-28 rounded-md active:translate-y-px"
              onClick={() => parse()}
              type="button"
            >
              <HugeiconsIcon
                data-icon="inline-start"
                icon={ComputerTerminalIcon}
                strokeWidth={2}
              />
              {messages.cronParser.parse}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p
              className="text-[11px] text-muted-foreground leading-5"
              id="cron-expression-help"
            >
              {messages.cronParser.expressionHelp}
            </p>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              {messages.cronParser.shortcutLabel}
            </span>
          </div>
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
                {messages.cronParser.invalidExpression}
              </p>
              <p className="mt-1 text-muted-foreground text-xs leading-5">
                {error}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>{" "}
        <AnimatePresence>
          {result ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 grid gap-8"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: 10 }}
              key="cron-results"
              transition={{ duration: 0.2 }}
            >
              <motion.section
                className="grid gap-5 border-y py-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-start md:gap-7"
                variants={childVariants}
              >
                <div className="flex size-12 items-center justify-center rounded-full border border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <HugeiconsIcon
                    className="size-5"
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-emerald-700 uppercase tracking-[0.2em] dark:text-emerald-300">
                    {messages.cronParser.validExpression}
                  </p>
                  <h2 className="mt-3 max-w-[28ch] font-semibold text-2xl leading-tight tracking-[-0.035em] md:text-3xl">
                    {result.description}
                  </h2>
                  <code className="mt-4 block w-fit border bg-muted/30 px-2.5 py-1.5 font-mono text-xs">
                    {result.normalizedExpression}
                  </code>
                </div>
              </motion.section>

              <motion.section
                id={CRON_PARSER_TOUR_TARGETS.fields}
                variants={childVariants}
              >
                <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
                  <div>
                    <h2 className="font-semibold text-lg tracking-[-0.02em]">
                      {messages.cronParser.fieldBreakdown}
                    </h2>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {messages.cronParser.fieldBreakdownDescription}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                    {result.mode === "five-field" ? "5 fields" : "6 fields"}
                  </span>
                </div>
                <div className="grid border-x sm:grid-cols-2 xl:grid-cols-3">
                  {result.fields.map((field, index) => (
                    <article
                      className="min-w-0 border-b p-4 sm:border-r"
                      key={field.key}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <code className="max-w-full truncate bg-muted px-2 py-1 font-mono text-sm">
                          {field.token}
                        </code>
                      </div>
                      <h3 className="mt-5 font-medium text-sm">
                        {field.label}
                      </h3>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatMessage(messages.cronParser.allowedRange, {
                          range: field.range,
                        })}
                      </p>
                    </article>
                  ))}
                </div>
              </motion.section>

              <motion.section
                id={CRON_PARSER_TOUR_TARGETS.runs}
                variants={childVariants}
              >
                <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
                  <div>
                    <h2 className="font-semibold text-lg tracking-[-0.02em]">
                      {messages.cronParser.upcomingRuns}
                    </h2>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {messages.cronParser.upcomingRunsDescription}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                    {timeZone}
                  </span>
                </div>
                <ol className="divide-y border-x border-b">
                  {result.nextRuns.map((date, index) => (
                    <li
                      className="grid gap-3 px-4 py-4 sm:grid-cols-[48px_minmax(0,1fr)_auto] sm:items-center"
                      key={date.toISOString()}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <time
                        className="font-mono text-xs sm:text-sm"
                        dateTime={date.toISOString()}
                      >
                        {formatExecution(date, timeZone)}
                      </time>
                      <Clock3 className="hidden size-4 text-muted-foreground sm:block" />
                    </li>
                  ))}
                </ol>
              </motion.section>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
