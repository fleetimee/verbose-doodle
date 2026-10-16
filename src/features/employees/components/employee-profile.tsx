import { toast } from "sonner";
import { CopyIcon } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  EmployeeCertifications,
  EmployeeTraining,
  EmployeeWorkHistory,
} from "@/features/employees/components/employee-career-history";
import { EmployeePresence } from "@/features/employees/components/employee-presence";
import {
  EmployeeProfileHeader,
  EmployeeProfileTabs,
} from "@/features/employees/components/employee-profile-header";
import type {
  EmployeeDetails,
  EmployeeSupervisor,
} from "@/features/employees/types";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage } from "@/lib/i18n";

function ProfileField({
  label,
  value,
  canCopy = false,
}: {
  label: string;
  value: string | null;
  canCopy?: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  async function handleCopy() {
    if (!value) {
      return;
    }
    try {
      if (await copyToClipboard(value)) {
        toast.success(copy.copied);
      } else {
        toast.error(copy.copyFailed);
      }
    } catch {
      toast.error(copy.copyFailed);
    }
  }
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="flex items-start gap-2 text-sm">
        <span
          className={value ? "min-w-0 break-words" : "text-muted-foreground"}
        >
          {value || copy.unavailable}
        </span>
        {canCopy && value ? (
          <Button
            aria-label={formatMessage(copy.copyField, { field: label })}
            onClick={handleCopy}
            size="icon-xs"
            variant="ghost"
          >
            <CopyIcon />
          </Button>
        ) : null}
      </dd>
    </div>
  );
}

function EmploymentFacts({ employee }: { employee: EmployeeDetails }) {
  const { messages, locale } = useI18n();
  const copy = messages.employees;
  let status: string | null = null;
  if (employee.active === true) {
    status = copy.active;
  }
  if (employee.active === false) {
    status = copy.inactive;
  }
  let tenure: string | null = null;
  if (employee.tenure) {
    const asOf = new Date(`${employee.tenure.asOfDate}T12:00:00`);
    const duration = formatMessage(copy.tenureValue, {
      years: employee.tenure.years,
      months: employee.tenure.months,
    });
    if (!Number.isNaN(asOf.getTime())) {
      tenure = formatMessage(copy.tenureAsOf, {
        duration,
        date: new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(asOf),
      });
    }
  }
  return (
    <>
      <ProfileField
        label={copy.employmentCategory}
        value={employee.employmentCategory}
      />
      <ProfileField label={copy.employmentStatus} value={status} />
      <ProfileField label={copy.tenure} value={tenure} />
    </>
  );
}

export function EmployeeProfile({
  employee,
  onOpenEmployee,
  initialTab = "employment",
}: {
  employee: EmployeeDetails;
  onOpenEmployee: (supervisor: EmployeeSupervisor) => void;
  initialTab?: "employment" | "reporting";
}) {
  const { messages, locale } = useI18n();
  const copy = messages.employees;
  const date = employee.employmentStartDate
    ? new Date(`${employee.employmentStartDate}T12:00:00`)
    : null;
  const birth = employee.birthDate
    ? new Date(`${employee.birthDate}T12:00:00`)
    : null;
  const birthDate =
    birth && !Number.isNaN(birth.getTime())
      ? `${birth.getDate()} ${new Intl.DateTimeFormat(locale, {
          month: "long",
        }).format(birth)} ${birth.getFullYear()}`
      : null;
  const birthDetails =
    [employee.birthPlace?.trim(), birthDate].filter(Boolean).join(", ") || null;
  const educationRecords = employee.education ?? [];
  const startDate =
    date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date)
      : null;
  return (
    <article className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <EmployeeProfileHeader employee={employee} />
      <Tabs
        className="min-h-0 flex-1"
        defaultValue={initialTab}
        variant="flush"
      >
        <EmployeeProfileTabs />
        <TabsContent className="min-h-0 overflow-hidden" value="employment">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <section aria-labelledby="employment-heading">
                <h3
                  className="mb-4 font-semibold text-sm"
                  id="employment-heading"
                >
                  {copy.employment}
                </h3>
                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <ProfileField canCopy label={copy.nip} value={employee.nip} />
                  <ProfileField label={copy.branch} value={employee.branch} />
                  <ProfileField label={copy.unit} value={employee.unitKerja} />
                  <ProfileField
                    label={copy.unitCode}
                    value={employee.unitCode}
                  />
                  <ProfileField
                    label={copy.officeCity}
                    value={employee.officeCity}
                  />
                  <ProfileField
                    label={copy.birthDetails}
                    value={birthDetails}
                  />
                  <ProfileField
                    label={copy.birthYear}
                    value={employee.birthYear?.toString() ?? null}
                  />
                  <ProfileField
                    label={copy.age}
                    value={
                      employee.age !== null && employee.age !== undefined
                        ? formatMessage(copy.ageValue, { years: employee.age })
                        : null
                    }
                  />
                  <ProfileField label={copy.startDate} value={startDate} />
                  <EmploymentFacts employee={employee} />
                </dl>
              </section>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent className="min-h-0 overflow-hidden" value="contact">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <section aria-labelledby="contact-heading">
                <h3 className="mb-4 font-semibold text-sm" id="contact-heading">
                  {copy.contact}
                </h3>
                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <ProfileField
                    canCopy
                    label={copy.email}
                    value={employee.email}
                  />
                  <ProfileField
                    canCopy
                    label={copy.phone}
                    value={employee.phone}
                  />
                  <ProfileField
                    canCopy
                    label={copy.secondaryPhone}
                    value={employee.secondaryPhone}
                  />
                  <ProfileField label={copy.address} value={employee.address} />
                  <ProfileField
                    label={copy.domicile}
                    value={employee.domicileAddress}
                  />
                  <ProfileField
                    label={copy.locality}
                    value={
                      [
                        employee.village,
                        employee.kelurahan,
                        employee.district,
                        employee.city,
                        employee.province,
                        employee.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ") || null
                    }
                  />
                </dl>
              </section>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent className="min-h-0 overflow-hidden" value="presence">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <EmployeePresence key={employee.nrp} nrp={employee.nrp} />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent className="min-h-0 overflow-hidden" value="work-history">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <EmployeeWorkHistory employee={employee} />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent className="min-h-0 overflow-hidden" value="training">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <EmployeeTraining employee={employee} />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent className="min-h-0 overflow-hidden" value="certifications">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <EmployeeCertifications employee={employee} />
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent className="min-h-0 overflow-hidden" value="education">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <section aria-labelledby="education-heading">
                <h3
                  className="mb-4 font-semibold text-sm"
                  id="education-heading"
                >
                  {copy.education}
                </h3>
                {educationRecords.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {copy.noEducation}
                  </p>
                ) : (
                  <ol className="ml-2 border-l">
                    {educationRecords.map((education) => (
                      <li
                        className="relative flex flex-col gap-3 pb-6 pl-6 last:pb-0"
                        key={education.sequence}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute top-1.5 -left-1 size-2 rounded-full bg-border"
                        />
                        <div>
                          <p className="break-words font-medium text-sm">
                            {education.institution || copy.unavailable}
                          </p>
                          <p className="mt-1 text-muted-foreground text-sm">
                            {education.level || copy.unavailable}
                          </p>
                          <p className="mt-1 text-muted-foreground text-xs">
                            {education.startYear || copy.unavailable} –{" "}
                            {education.endYear || copy.unavailable}
                          </p>
                        </div>
                        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                          <ProfileField
                            label={copy.faculty}
                            value={education.faculty}
                          />
                          <ProfileField
                            label={copy.major}
                            value={education.major}
                          />
                          <ProfileField
                            label={copy.graduationStatus}
                            value={education.graduationStatus}
                          />
                        </dl>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent className="min-h-0 overflow-hidden" value="family">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <section aria-labelledby="family-heading">
                <h3 className="mb-4 font-semibold text-sm" id="family-heading">
                  {copy.family}
                </h3>
                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <ProfileField
                    label={copy.fatherName}
                    value={employee.fatherName}
                  />
                  <ProfileField
                    label={copy.motherName}
                    value={employee.motherName}
                  />
                </dl>
              </section>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent className="min-h-0 overflow-hidden" value="reporting">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <section aria-labelledby="reporting-heading">
                <h3
                  className="mb-4 font-semibold text-sm"
                  id="reporting-heading"
                >
                  {copy.reporting}
                </h3>
                <ol className="ml-2 border-l">
                  <li className="relative pb-5 pl-6">
                    <span
                      aria-hidden="true"
                      className="absolute top-1.5 -left-1 size-2 rounded-full bg-primary"
                    />
                    <p className="text-muted-foreground text-xs">
                      {copy.selectedEmployee}
                    </p>
                    <p className="mt-1 font-medium text-sm">
                      {employee.name || copy.unavailable}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {employee.position || copy.unavailable}
                    </p>
                  </li>
                  {employee.supervisors.map((supervisor) => (
                    <li
                      className="relative pb-5 pl-6 last:pb-0"
                      key={`${supervisor.soid}-${supervisor.nrp}`}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 -left-1 size-2 rounded-full bg-border"
                      />
                      <Button
                        aria-label={formatMessage(copy.openProfile, {
                          name:
                            supervisor.name ||
                            supervisor.nip ||
                            String(supervisor.nrp),
                        })}
                        className="max-w-full justify-start whitespace-normal text-left"
                        onClick={() => onOpenEmployee(supervisor)}
                        size="text-link"
                        variant="link"
                      >
                        {supervisor.name || copy.unavailable}
                      </Button>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {supervisor.position || copy.unavailable}
                      </p>
                      <p className="mt-1 break-words text-muted-foreground text-xs">
                        {supervisor.unit || copy.unavailable}
                      </p>
                      <p className="mt-1 font-mono text-muted-foreground text-xs">
                        {copy.nip}: {supervisor.nip || copy.unavailable}
                      </p>
                    </li>
                  ))}
                </ol>
                {employee.supervisors.length === 0 ? (
                  <p className="mt-3 text-muted-foreground text-sm">
                    {copy.noSupervisors}
                  </p>
                ) : null}
              </section>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </article>
  );
}
