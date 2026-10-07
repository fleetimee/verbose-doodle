import { Button } from "@/components/ui/button";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  type CronSchedule,
  MINUTE_INTERVALS,
  SCHEDULE_FREQUENCIES,
} from "@/features/developer-tools/tools/cron-parser/build-cron-expression";
import { formatMessage, messages } from "@/lib/i18n";

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
        <SelectTrigger className="w-full" id={id} size="sm" variant="surface">
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
    <FieldGroup className="grid min-w-0 grid-cols-2" size="sm">
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
      {schedule.frequency === "weekly" ? (
        <Field
          className="col-span-2"
          data-invalid={invalid || undefined}
          size="sm"
        >
          <FieldLabel size="sm">{copy.weekdayLabel}</FieldLabel>
          <ToggleGroup
            aria-label={copy.weekdayLabel}
            className="flex-wrap"
            multiple
            onValueChange={(values) =>
              onChange({ ...schedule, weekdays: values.map(String) })
            }
            size="sm"
            value={[...schedule.weekdays]}
            variant="outline"
          >
            {copy.weekdays.map((label, day) => (
              <ToggleGroupItem
                aria-label={label}
                key={label}
                value={String(day)}
              >
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
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
      {schedule.frequency !== "minutes" && schedule.frequency !== "hourly" ? (
        <Field
          className="col-span-2"
          data-invalid={invalid || undefined}
          size="sm"
        >
          <FieldLabel size="sm">{copy.timeLabel}</FieldLabel>
          <div className="flex flex-col gap-3">
            {schedule.times.map((time, index) => (
              <FieldGroup
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end"
                key={`time-${index}`}
                size="sm"
              >
                <ScheduleSelect
                  id={`cron-hour-${index}`}
                  label={messages.cronParser.enhancements.hours}
                  onChange={(hour) =>
                    onChange({
                      ...schedule,
                      times: schedule.times.map((value, position) =>
                        position === index ? `${hour}:${time.slice(3)}` : value
                      ),
                    })
                  }
                  options={Array.from({ length: 24 }, (_, hour) => ({
                    value: String(hour).padStart(2, "0"),
                    label: String(hour).padStart(2, "0"),
                  }))}
                  value={time.slice(0, 2)}
                />
                <ScheduleSelect
                  id={`cron-time-minute-${index}`}
                  label={messages.cronParser.enhancements.minutes}
                  onChange={(minute) =>
                    onChange({
                      ...schedule,
                      times: schedule.times.map((value, position) =>
                        position === index
                          ? `${time.slice(0, 2)}:${minute}`
                          : value
                      ),
                    })
                  }
                  options={Array.from({ length: 60 }, (_, minute) => ({
                    value: String(minute).padStart(2, "0"),
                    label: String(minute).padStart(2, "0"),
                  }))}
                  value={time.slice(3)}
                />
                <Button
                  aria-label={formatMessage(copy.removeTimeNumber, {
                    number: index + 1,
                  })}
                  disabled={schedule.times.length === 1}
                  onClick={() =>
                    onChange({
                      ...schedule,
                      times: schedule.times.filter(
                        (_, position) => position !== index
                      ),
                    })
                  }
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {copy.removeTime}
                </Button>
              </FieldGroup>
            ))}
            <Button
              disabled={schedule.times.length >= 12}
              onClick={() =>
                onChange({ ...schedule, times: [...schedule.times, "12:00"] })
              }
              size="sm"
              type="button"
              variant="outline"
            >
              {copy.addTime}
            </Button>
          </div>
        </Field>
      ) : null}
    </FieldGroup>
  );
}
