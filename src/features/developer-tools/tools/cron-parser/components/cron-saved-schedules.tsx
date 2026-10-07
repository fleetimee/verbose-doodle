import { useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { isValidTimeZone } from "@/features/developer-tools/timezones";
import {
  type CronPreview,
  parseCronPreview,
} from "@/features/developer-tools/tools/cron-parser/cron-preview";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { formatMessage, messages } from "@/lib/i18n";

const STORAGE_KEY = "cron-parser-schedules";
const savedScheduleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  expression: z.string().trim().min(1).max(2400),
  timeZone: z.string().max(100).refine(isValidTimeZone),
});
const schedulesSchema = z.array(savedScheduleSchema).max(100);
const exportSchema = z.object({
  version: z.literal(1),
  schedules: schedulesSchema,
});
type SavedSchedule = z.infer<typeof savedScheduleSchema>;

function scheduleKey(schedule: SavedSchedule) {
  return JSON.stringify([
    schedule.name,
    schedule.expression,
    schedule.timeZone,
  ]);
}

function validateSchedules(schedules: SavedSchedule[]): SavedSchedule[] {
  for (const schedule of schedules) {
    parseCronPreview({
      expression: schedule.expression,
      timeZone: schedule.timeZone,
    });
  }
  return schedules;
}

export function CronSavedSchedules({
  preview,
  onLoad,
}: {
  readonly preview: CronPreview | null;
  readonly onLoad: (expression: string, timeZone: string) => void;
}) {
  const [schedules, setSchedules] = useLocalStorage<SavedSchedule[]>(
    STORAGE_KEY,
    [],
    {
      deserializer: (value) =>
        validateSchedules(schedulesSchema.parse(JSON.parse(value))),
    }
  );
  const [name, setName] = useState("");
  const [page, setPage] = useState(0);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const copy = messages.cronParser.enhancements;

  const persist = (next: SavedSchedule[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSchedules(next);
      setError(null);
      return true;
    } catch {
      setStatus(null);
      setError(copy.storageFailed);
      return false;
    }
  };

  const save = () => {
    const schedule = savedScheduleSchema.safeParse({
      name,
      expression: preview?.normalizedExpression,
      timeZone: preview?.timeZone,
    });
    if (!schedule.success) {
      setError(copy.saveFailed);
      setStatus(null);
      return;
    }
    const next = [
      ...schedules.filter(
        (item) => scheduleKey(item) !== scheduleKey(schedule.data)
      ),
      schedule.data,
    ];
    if (next.length > 100) {
      setError(copy.saveFailed);
      setStatus(null);
      return;
    }
    if (persist(next)) {
      setName("");
      setStatus(copy.saved);
    }
  };

  const importSchedules = async (file: File) => {
    setImporting(true);
    try {
      if (file.size > 256 * 1024) {
        throw new Error(copy.invalidImport);
      }
      const data = exportSchema.parse(JSON.parse(await file.text()));
      const imported = validateSchedules(data.schedules);
      const merged = new Map(
        schedules.map((schedule) => [scheduleKey(schedule), schedule])
      );
      for (const schedule of imported) {
        merged.set(scheduleKey(schedule), schedule);
      }
      if (merged.size > 100) {
        throw new Error(copy.invalidImport);
      }
      if (persist([...merged.values()])) {
        setStatus(
          formatMessage(copy.imported, {
            count: merged.size - schedules.length,
          })
        );
      }
    } catch {
      setStatus(null);
      setError(copy.invalidImport);
    } finally {
      setImporting(false);
    }
  };

  const exportSchedules = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, schedules }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cron-schedules.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const pageCount = Math.max(1, Math.ceil(schedules.length / 3));
  const activePage = Math.min(page, pageCount - 1);
  return (
    <section
      aria-label={copy.savedTitle}
      className="flex h-full min-h-0 flex-col"
    >
      <div className="flex shrink-0 flex-col gap-2 px-4 pt-3">
        <FieldGroup className="flex flex-row items-end" size="sm">
          <Field className="min-w-0 flex-1" size="sm">
            <FieldLabel htmlFor="cron-schedule-name" size="sm">
              {copy.name}
            </FieldLabel>
            <Input
              id="cron-schedule-name"
              maxLength={100}
              onChange={(event) => setName(event.currentTarget.value)}
              size="sm"
              value={name}
            />
          </Field>
          <Button
            disabled={importing || !(preview && name.trim())}
            onClick={save}
            size="sm"
            type="button"
          >
            {copy.save}
          </Button>
        </FieldGroup>
        <div className="flex items-center justify-between gap-2">
          <p
            className="truncate text-muted-foreground text-xs"
            title={copy.savedHelp}
          >
            {copy.savedHelp}
          </p>
          <div className="flex shrink-0 gap-1">
            <Button
              disabled={!schedules.length}
              onClick={exportSchedules}
              size="xs"
              type="button"
              variant="ghost"
            >
              {copy.export}
            </Button>
            <Button
              disabled={importing}
              onClick={() => importInput.current?.click()}
              size="xs"
              type="button"
              variant="outline"
            >
              {copy.import}
            </Button>
          </div>
          <input
            accept=".json,application/json"
            aria-label={copy.import}
            className="hidden"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) {
                importSchedules(file);
              }
            }}
            ref={importInput}
            type="file"
          />
        </div>
        {error ? (
          <p className="text-destructive text-xs" role="alert">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="text-muted-foreground text-xs" role="status">
            {status}
          </p>
        ) : null}
      </div>
      {schedules.length ? (
        <ul className="flex min-h-0 flex-1 flex-col divide-y px-4 pt-2">
          {schedules
            .slice(activePage * 3, activePage * 3 + 3)
            .map((schedule) => (
              <li
                className="flex shrink-0 items-center justify-between gap-2 py-3"
                key={scheduleKey(schedule)}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate font-medium text-xs"
                    title={schedule.name}
                  >
                    {schedule.name}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    {schedule.timeZone}
                  </p>
                  <pre
                    className="truncate font-mono text-xs"
                    title={schedule.expression}
                  >
                    {schedule.expression.replaceAll("\n", "; ")}
                  </pre>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    aria-label={`${copy.load}: ${schedule.name}`}
                    onClick={() =>
                      onLoad(schedule.expression, schedule.timeZone)
                    }
                    size="xs"
                    type="button"
                    variant="outline"
                  >
                    {copy.load}
                  </Button>
                  <Button
                    aria-label={`${copy.remove}: ${schedule.name}`}
                    disabled={importing}
                    onClick={() => {
                      setStatus(null);
                      persist(
                        schedules.filter(
                          (item) => scheduleKey(item) !== scheduleKey(schedule)
                        )
                      );
                    }}
                    size="xs"
                    type="button"
                    variant="ghost"
                  >
                    {copy.remove}
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <p className="min-h-0 flex-1 p-4 text-muted-foreground text-sm">
          {copy.savedEmpty}
        </p>
      )}
      <div className="flex shrink-0 items-center justify-between gap-2 border-t px-4 py-2">
        <span className="text-muted-foreground text-xs">
          {formatMessage(copy.page, { page: activePage + 1, pages: pageCount })}
        </span>
        <div className="flex gap-1">
          <Button
            disabled={activePage === 0}
            onClick={() => setPage(activePage - 1)}
            size="xs"
            type="button"
            variant="ghost"
          >
            {copy.previous}
          </Button>
          <Button
            disabled={activePage === pageCount - 1}
            onClick={() => setPage(activePage + 1)}
            size="xs"
            type="button"
            variant="outline"
          >
            {copy.next}
          </Button>
        </div>
      </div>
    </section>
  );
}
