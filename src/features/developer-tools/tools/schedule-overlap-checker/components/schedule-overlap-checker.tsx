import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ClipboardCopy,
  Code2,
  Plus,
  Trash2,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import { TimezoneCombobox } from "@/features/developer-tools/components/timezone-combobox";
import { getTimeZoneOptions } from "@/features/developer-tools/timezones";
import { CronPreviewDatePicker } from "@/features/developer-tools/tools/cron-parser/components/cron-preview-date-picker";
import { readPreviewDate } from "@/features/developer-tools/tools/cron-parser/cron-preview";
import {
  checkScheduleOverlap,
  type OverlapResult,
  type OverlapSchedule,
} from "@/features/developer-tools/tools/schedule-overlap-checker/check-schedule-overlap";
import { OverlapResults } from "@/features/developer-tools/tools/schedule-overlap-checker/components/overlap-results";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage } from "@/lib/i18n";

function createSample(names: readonly string[]): OverlapSchedule[] {
  return [
    {
      id: "settlement",
      name: names[0] ?? "",
      expression: "*/15 * * * *",
      duration: "12",
    },
    {
      id: "polling",
      name: names[1] ?? "",
      expression: "5-59/15 * * * *",
      duration: "4",
    },
    {
      id: "reconciliation",
      name: names[2] ?? "",
      expression: "*/30 * * * *",
      duration: "8",
    },
  ];
}

export function ScheduleOverlapChecker() {
  const { messages } = useI18n();
  const copy = messages.scheduleOverlapChecker;
  const [schedules, setSchedules] = useState(() =>
    createSample(copy.sampleNames)
  );
  const [timeZone, setTimeZone] = useState("UTC");
  const [from, setFrom] = useState("");
  const [hours, setHours] = useState("24");
  const [result, setResult] = useState<OverlapResult | null>(() =>
    checkScheduleOverlap({
      schedules,
      start: new Date(),
      hours: 24,
      timeZone: "UTC",
    })
  );
  const [error, setError] = useState("");
  const [options] = useState(() => getTimeZoneOptions("UTC"));
  function invalidate() {
    setResult(null);
    setError("");
  }
  function updateSchedule(
    id: string,
    key: "name" | "expression" | "duration",
    value: string
  ) {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === id ? { ...schedule, [key]: value } : schedule
      )
    );
    invalidate();
  }
  function analyze(jobs = schedules) {
    invalidate();
    try {
      const start = readPreviewDate(from, timeZone) ?? new Date();
      setResult(
        checkScheduleOverlap({
          schedules: jobs,
          start,
          hours: Number(hours),
          timeZone,
        })
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.invalid);
    }
  }
  async function handleCopy() {
    if (!result) {
      return;
    }
    try {
      const copied = await copyToClipboard(
        JSON.stringify(
          {
            unit: "milliseconds since Unix epoch",
            durationUnit: "minutes",
            schedules,
            ...result,
          },
          null,
          2
        )
      );
      if (copied) {
        toast.success(copy.copied);
      } else {
        toast.error(copy.copyFailed);
      }
    } catch {
      toast.error(copy.copyFailed);
    }
  }
  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4 lg:overflow-hidden [&>header]:shrink-0 [&>header]:border-b-0 [&>header]:pb-2"
      description={copy.description}
      extraActions={
        <>
          <Button
            onClick={() => {
              const jobs = createSample(copy.sampleNames);
              setSchedules(jobs);
              analyze(jobs);
            }}
            size="sm"
            variant="tool-action"
          >
            {copy.sample}
          </Button>
          <Button
            disabled={!result}
            onClick={handleCopy}
            size="sm"
            variant="tool-action"
          >
            <ClipboardCopy data-icon="inline-start" />
            {copy.copy}
          </Button>
        </>
      }
      mainClassName="flex min-h-0 flex-1 flex-col"
      onReset={() => {
        const jobs = createSample(copy.sampleNames);
        setSchedules(jobs);
        setTimeZone("UTC");
        setFrom("");
        setHours("24");
        setError("");
        setResult(
          checkScheduleOverlap({
            schedules: jobs,
            start: new Date(),
            hours: 24,
            timeZone: "UTC",
          })
        );
      }}
      resetLabel={copy.reset}
      title={copy.title}
    >
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:grid-rows-[minmax(0,1fr)]">
        <Card
          className="min-h-0 min-w-0 overflow-hidden"
          size="none"
          variant="outline"
        >
          <CardHeader size="sm" variant="subtle">
            <CardTitle size="sm">{copy.schedules}</CardTitle>
            <CardAction>
              <Button
                disabled={schedules.length >= 8}
                onClick={() => {
                  setSchedules([
                    ...schedules,
                    {
                      id: crypto.randomUUID(),
                      name: `${copy.job} ${schedules.length + 1}`,
                      expression: "0 * * * *",
                      duration: "5",
                    },
                  ]);
                  invalidate();
                }}
                size="xs"
                variant="outline"
              >
                <Plus data-icon="inline-start" />
                {copy.add}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col" size="none">
            <ScrollArea
              className="min-h-0 flex-1"
              contentSize="stack"
              variant="fit"
            >
              <FieldGroup className="grid grid-cols-2" size="sm">
                <Field size="sm">
                  <FieldLabel htmlFor="overlap-timezone">
                    {copy.timezone}
                  </FieldLabel>
                  <TimezoneCombobox
                    emptyMessage={messages.cronParser.timezoneEmpty}
                    id="overlap-timezone"
                    onChange={(value) => {
                      setTimeZone(value);
                      invalidate();
                    }}
                    options={options}
                    searchPlaceholder={messages.cronParser.timezoneSearch}
                    useQueryLabel={(timezone) =>
                      formatMessage(messages.cronParser.timezoneUse, {
                        timezone,
                      })
                    }
                    value={timeZone}
                  />
                </Field>
                <Field size="sm">
                  <FieldLabel htmlFor="overlap-window">
                    {copy.window}
                  </FieldLabel>
                  <Select
                    items={[
                      { value: "6", label: copy.sixHours },
                      { value: "24", label: copy.day },
                      { value: "168", label: copy.week },
                    ]}
                    onValueChange={(value) => {
                      if (value) {
                        setHours(value);
                        invalidate();
                      }
                    }}
                    value={hours}
                  >
                    <SelectTrigger id="overlap-window" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="6">{copy.sixHours}</SelectItem>
                        <SelectItem value="24">{copy.day}</SelectItem>
                        <SelectItem value="168">{copy.week}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="col-span-2" size="sm">
                  <FieldLabel htmlFor="overlap-from">{copy.from}</FieldLabel>
                  <CronPreviewDatePicker
                    id="overlap-from"
                    onChange={(value) => {
                      setFrom(value);
                      invalidate();
                    }}
                    timeZone={timeZone}
                    value={from}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup size="sm">
                {schedules.map((schedule, index) => (
                  <div className="border-t pt-3" key={schedule.id}>
                    <FieldGroup
                      className="grid grid-cols-[minmax(0,1fr)_6.5rem_auto]"
                      size="sm"
                    >
                      <Field size="sm">
                        <FieldLabel htmlFor={`overlap-name-${schedule.id}`}>
                          {copy.job} {index + 1}
                        </FieldLabel>
                        <Input
                          id={`overlap-name-${schedule.id}`}
                          maxLength={80}
                          onChange={(event) =>
                            updateSchedule(
                              schedule.id,
                              "name",
                              event.target.value
                            )
                          }
                          size="sm"
                          value={schedule.name}
                        />
                      </Field>
                      <Field size="sm">
                        <FieldLabel htmlFor={`overlap-duration-${schedule.id}`}>
                          {copy.duration}
                        </FieldLabel>
                        <Input
                          id={`overlap-duration-${schedule.id}`}
                          inputMode="decimal"
                          onChange={(event) =>
                            updateSchedule(
                              schedule.id,
                              "duration",
                              event.target.value
                            )
                          }
                          size="sm"
                          value={schedule.duration}
                          variant="mono"
                        />
                      </Field>
                      <div className="flex items-end">
                        <Button
                          aria-label={formatMessage(copy.remove, {
                            name: schedule.name,
                          })}
                          disabled={schedules.length <= 2}
                          onClick={() => {
                            setSchedules(
                              schedules.filter((job) => job.id !== schedule.id)
                            );
                            invalidate();
                          }}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <Field className="col-span-3" size="sm">
                        <FieldLabel
                          className="sr-only"
                          htmlFor={`overlap-cron-${schedule.id}`}
                        >
                          {copy.cron} {index + 1}
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupInput
                            aria-describedby="overlap-cron-help"
                            id={`overlap-cron-${schedule.id}`}
                            maxLength={256}
                            onChange={(event) =>
                              updateSchedule(
                                schedule.id,
                                "expression",
                                event.target.value
                              )
                            }
                            placeholder={copy.cron}
                            size="sm"
                            value={schedule.expression}
                            variant="mono"
                          />
                          <InputGroupAddon>
                            <InputGroupText>
                              <Code2 aria-hidden="true" />
                              Cron
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                    </FieldGroup>
                  </div>
                ))}
              </FieldGroup>
              <p className="sr-only" id="overlap-cron-help">
                {copy.invalidCron}
              </p>
              <Separator />
              <Collapsible>
                <CollapsibleTrigger
                  render={
                    <Button
                      className="w-full justify-between data-panel-open:[&>svg]:rotate-180"
                      size="sm"
                      variant="ghost"
                    />
                  }
                >
                  {copy.assumptions}
                  <ChevronDown data-icon="inline-end" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-2 pt-2 text-muted-foreground text-xs leading-relaxed">
                    <p>{copy.assumptionsHelp}</p>
                    <p>{copy.limitsHelp}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardFooter className="shrink-0">
            <Button className="my-3 w-full" onClick={() => analyze()} size="sm">
              {copy.check}
            </Button>
          </CardFooter>
        </Card>
        <Card
          className="min-h-0 min-w-0 overflow-hidden"
          size="none"
          variant="outline"
        >
          <CardHeader size="sm" variant="subtle">
            <CardTitle size="sm">{copy.results}</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col" size="none">
            {error && (
              <div className="p-4">
                <Alert variant="destructive">
                  <AlertTitle>{copy.invalid}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            {result && (
              <OverlapResults
                key={`${result.start}-${result.timeZone}-${result.runs.length}`}
                result={result}
              />
            )}
            {!(result || error) && (
              <Empty size="compact" variant="plain">
                <EmptyHeader>
                  <EmptyTitle>{copy.ready}</EmptyTitle>
                  <EmptyDescription>{copy.readyHelp}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </DeveloperToolLayout>
  );
}
