import { useI18n } from "@/components/i18n-provider";
import type { EmployeeDetails } from "@/features/employees/types";

function historyDate(value: string | null, locale: string) {
  if (!value) {
    return null;
  }
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
}

function HistoryField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  const { messages } = useI18n();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd
        className={
          value ? "break-words text-sm" : "text-muted-foreground text-sm"
        }
      >
        {value || messages.employees.unavailable}
      </dd>
    </div>
  );
}

export function EmployeeWorkHistory({
  employee,
}: {
  employee: EmployeeDetails;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.employees;
  const history = employee.workHistory ?? [];
  return (
    <section aria-labelledby="work-history-heading">
      <h3 className="mb-2 font-semibold text-sm" id="work-history-heading">
        {copy.workHistory}
      </h3>
      <p className="mb-4 text-muted-foreground text-xs">
        {copy.workHistoryHint}
      </p>
      {history.length === 0 ? (
        <p className="text-muted-foreground text-sm">{copy.noWorkHistory}</p>
      ) : (
        <ol className="ml-2 border-l">
          {history.map((entry) => (
            <li
              className="relative flex flex-col gap-3 pb-6 pl-6 last:pb-0"
              key={entry.sequence}
            >
              <span
                aria-hidden="true"
                className="absolute top-1.5 -left-1 size-2 rounded-full bg-border"
              />
              <div>
                <p className="break-words font-medium text-sm">
                  {entry.position || copy.unavailable}
                </p>
                <p className="mt-1 break-words text-muted-foreground text-sm">
                  {entry.unit || copy.unavailable}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {entry.branch || copy.unavailable}
                </p>
              </div>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <HistoryField
                  label={copy.employmentCategory}
                  value={entry.employmentCategory}
                />
                <HistoryField
                  label={copy.decisionDate}
                  value={historyDate(entry.decisionDate, locale)}
                />
                <HistoryField
                  label={copy.effectiveDate}
                  value={historyDate(entry.effectiveDate, locale)}
                />
                <HistoryField
                  label={copy.decisionNumber}
                  value={entry.decisionNumber}
                />
              </dl>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function LearningRecordType({
  related,
}: {
  related: boolean | null | undefined;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  if (related === undefined) {
    return copy.certificationRecord;
  }
  if (related === null) {
    return copy.unavailable;
  }
  return related ? copy.certificationTraining : copy.trainingRecord;
}

function EmployeeLearningHistory({
  employee,
  training = false,
}: {
  employee: EmployeeDetails;
  training?: boolean;
}) {
  const { messages, locale } = useI18n();
  const copy = messages.employees;
  const records =
    (training ? employee.training : employee.certifications) ?? [];
  const headingId = training ? "training-heading" : "certifications-heading";
  return (
    <section aria-labelledby={headingId}>
      <h3 className="mb-2 font-semibold text-sm" id={headingId}>
        {training ? copy.training : copy.certifications}
      </h3>
      <p className="mb-4 text-muted-foreground text-xs">
        {training ? copy.trainingHint : copy.certificationHint}
      </p>
      {records.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {training ? copy.noTraining : copy.noCertifications}
        </p>
      ) : (
        <ol className="ml-2 border-l">
          {records.map((entry) => (
            <li
              className="relative flex flex-col gap-3 pb-6 pl-6 last:pb-0"
              key={entry.sequence}
            >
              <span
                aria-hidden="true"
                className="absolute top-1.5 -left-1 size-2 rounded-full bg-border"
              />
              <div>
                <p className="break-words font-medium text-sm">
                  {entry.name || copy.unavailable}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  <LearningRecordType
                    related={
                      "certificationRelated" in entry
                        ? entry.certificationRelated
                        : undefined
                    }
                  />
                </p>
              </div>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <HistoryField label={copy.provider} value={entry.provider} />
                <HistoryField
                  label={copy.eventStartDate}
                  value={historyDate(entry.startDate, locale)}
                />
                <HistoryField
                  label={copy.eventEndDate}
                  value={historyDate(entry.endDate, locale)}
                />
                <HistoryField
                  label={copy.issuedDate}
                  value={historyDate(entry.issuedDate, locale)}
                />
                <HistoryField
                  label={copy.expiryDate}
                  value={historyDate(entry.expiryDate, locale)}
                />
              </dl>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function EmployeeCertifications({
  employee,
}: {
  employee: EmployeeDetails;
}) {
  return <EmployeeLearningHistory employee={employee} />;
}

export function EmployeeTraining({ employee }: { employee: EmployeeDetails }) {
  return <EmployeeLearningHistory employee={employee} training />;
}
