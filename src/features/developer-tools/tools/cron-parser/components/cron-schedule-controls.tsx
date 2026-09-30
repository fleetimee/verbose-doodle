import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CronSchedule,
  MINUTE_INTERVALS,
  SCHEDULE_FREQUENCIES,
} from "@/features/developer-tools/tools/cron-parser/build-cron-expression";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function ScheduleSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly options: readonly { value: string; label: string }[];
  readonly onChange: (value: string) => void;
}) {
  return (
    <Field className="min-w-0" size="sm">
      <FieldLabel htmlFor={id} size="sm">
        {label}
      </FieldLabel>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger id={id} variant="surface">
          <SelectValue>
            {options.find((option) => option.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

export function CronScheduleControls({
  schedule,
  onChange,
  invalid,
}: {
  readonly schedule: CronSchedule;
  readonly onChange: (schedule: CronSchedule) => void;
  readonly invalid: boolean;
}) {
  const copy = messages.cronParser.builder;
  return (
    <FieldGroup
      className={cn(
        "grid min-w-0 grid-cols-2",
        (schedule.frequency === "weekly" || schedule.frequency === "monthly") &&
          "sm:grid-cols-3"
      )}
      size="sm"
    >
      <ScheduleSelect
        id="cron-frequency"
        label={copy.frequencyLabel}
        onChange={(value) => {
          const frequency = SCHEDULE_FREQUENCIES.find((item) => item === value);
          if (frequency) {
            onChange({ ...schedule, frequency });
          }
        }}
        options={SCHEDULE_FREQUENCIES.map((value) => ({
          value,
          label: copy.frequencies[value],
        }))}
        value={schedule.frequency}
      />
      {schedule.frequency === "minutes" ? (
        <ScheduleSelect
          id="cron-interval"
          label={copy.intervalLabel}
          onChange={(interval) => onChange({ ...schedule, interval })}
          options={MINUTE_INTERVALS.map((count) => ({
            value: String(count),
            label: formatMessage(copy.intervalOption, { count }),
          }))}
          value={schedule.interval}
        />
      ) : null}
      {schedule.frequency === "hourly" ? (
        <Field data-invalid={invalid || undefined} size="sm">
          <FieldLabel htmlFor="cron-minute" size="sm">
            {copy.minuteLabel}
          </FieldLabel>
          <Input
            aria-invalid={invalid || undefined}
            id="cron-minute"
            max={59}
            min={0}
            onChange={(event) =>
              onChange({ ...schedule, minute: event.currentTarget.value })
            }
            type="number"
            value={schedule.minute}
            variant="mono-flat"
          />
        </Field>
      ) : null}
      {schedule.frequency !== "minutes" && schedule.frequency !== "hourly" ? (
        <Field data-invalid={invalid || undefined} size="sm">
          <FieldLabel htmlFor="cron-time" size="sm">
            {copy.timeLabel}
          </FieldLabel>
          <Input
            aria-invalid={invalid || undefined}
            id="cron-time"
            onChange={(event) =>
              onChange({ ...schedule, time: event.currentTarget.value })
            }
            type="time"
            value={schedule.time}
            variant="mono-flat"
          />
        </Field>
      ) : null}
      {schedule.frequency === "weekly" ? (
        <ScheduleSelect
          id="cron-weekday"
          label={copy.weekdayLabel}
          onChange={(weekday) => onChange({ ...schedule, weekday })}
          options={copy.weekdays.map((label, day) => ({
            value: String(day),
            label,
          }))}
          value={schedule.weekday}
        />
      ) : null}
      {schedule.frequency === "monthly" ? (
        <Field data-invalid={invalid || undefined} size="sm">
          <FieldLabel htmlFor="cron-day" size="sm">
            {copy.dayLabel}
          </FieldLabel>
          <Input
            aria-invalid={invalid || undefined}
            id="cron-day"
            max={31}
            min={1}
            onChange={(event) =>
              onChange({ ...schedule, day: event.currentTarget.value })
            }
            type="number"
            value={schedule.day}
            variant="mono-flat"
          />
        </Field>
      ) : null}
    </FieldGroup>
  );
}
