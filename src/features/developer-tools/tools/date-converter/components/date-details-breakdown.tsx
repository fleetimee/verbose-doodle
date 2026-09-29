import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ClipboardCopy } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import type { DateConversionResult } from "@/features/developer-tools/tools/date-converter/convert-date";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

type BreakdownRow = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
};

type BreakdownSection = {
  readonly title: string;
  readonly rows: readonly BreakdownRow[];
};

export function DateDetailsBreakdown({
  result,
  timeZone,
}: {
  readonly result: DateConversionResult;
  readonly timeZone: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyRow = async (id: string, label: string, value: string) => {
    try {
      const success = await copyToClipboard(value);
      if (success) {
        setCopiedId(id);
        toast.success(
          formatMessage(messages.dateConverter.copySuccess, {
            format: label,
          })
        );
        setTimeout(
          () => setCopiedId((curr) => (curr === id ? null : curr)),
          1500
        );
      } else {
        toast.error(messages.dateConverter.copyFailed);
      }
    } catch {
      setCopiedId(null);
      toast.error(messages.dateConverter.copyFailed);
    }
  };

  const cal = result.calendarDetails;
  const sections: readonly BreakdownSection[] = [
    {
      title: messages.dateConverter.details.calendarSection,
      rows: [
        {
          id: "year",
          label: messages.dateConverter.details.year,
          value: String(cal.year),
        },
        {
          id: "month",
          label: messages.dateConverter.details.month,
          value: `${cal.monthName} (${String(cal.month).padStart(2, "0")})`,
        },
        {
          id: "day",
          label: messages.dateConverter.details.dayOfMonth,
          value: String(cal.day).padStart(2, "0"),
        },
        {
          id: "day-of-week",
          label: messages.dateConverter.details.dayOfWeek,
          value: `${cal.dayOfWeek} (Day ${cal.dayOfWeekNumber} of 7)`,
        },
        {
          id: "day-of-year",
          label: messages.dateConverter.details.dayOfYear,
          value: `Day ${cal.dayOfYear}`,
        },
        {
          id: "iso-week",
          label: messages.dateConverter.details.isoWeek,
          value: `Week ${cal.isoWeek}`,
        },
        {
          id: "leap-year",
          label: messages.dateConverter.details.isLeapYear,
          value: cal.isLeapYear
            ? messages.dateConverter.details.leapYearYes
            : messages.dateConverter.details.leapYearNo,
        },
      ],
    },
    {
      title: messages.dateConverter.details.timezoneSection,
      rows: [
        {
          id: "tz-name",
          label: messages.dateConverter.details.timeZoneName,
          value: timeZone,
        },
        {
          id: "tz-offset",
          label: messages.dateConverter.details.utcOffset,
          value: cal.timeZoneOffset,
        },
        {
          id: "iso-local",
          label: messages.dateConverter.details.isoLocal,
          value: result.iso8601Local,
        },
        {
          id: "sql-datetime",
          label: messages.dateConverter.details.sqlDateTime,
          value: result.sqlDateTime,
        },
      ],
    },
    {
      title: messages.dateConverter.details.precisionSection,
      rows: [
        {
          id: "unix-seconds",
          label: messages.dateConverter.unixSeconds,
          value: result.unixSeconds,
        },
        {
          id: "unix-milliseconds",
          label: messages.dateConverter.unixMilliseconds,
          value: result.unixMilliseconds,
        },
        {
          id: "unix-microseconds",
          label: messages.dateConverter.details.unixMicroseconds,
          value: result.unixMicroseconds,
        },
        {
          id: "unix-nanoseconds",
          label: messages.dateConverter.details.unixNanoseconds,
          value: result.unixNanoseconds,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-5">
      {sections.map((section) => (
        <section className="flex flex-col gap-2" key={section.title}>
          <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            {section.title}
          </h3>
          <div className="border-t font-mono text-xs">
            {section.rows.map((row) => {
              const isCopied = copiedId === row.id;
              const CopyIcon = isCopied ? Check : ClipboardCopy;

              return (
                <div
                  className="group grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)_auto] items-center gap-3 border-b py-2.5"
                  key={row.id}
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <code className="min-w-0 truncate font-medium text-foreground">
                    {row.value}
                  </code>
                  <Button
                    aria-label={formatMessage(
                      messages.dateConverter.copyOutput,
                      {
                        format: row.label,
                      }
                    )}
                    onClick={() => copyRow(row.id, row.label, row.value)}
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
                          key={isCopied ? "copied" : "idle"}
                          transition={{
                            duration: MOTION_DURATION.fast,
                            ease: MOTION_EASE.out,
                          }}
                        >
                          <CopyIcon
                            data-icon={isCopied ? "check" : "clipboard-copy"}
                          />
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
