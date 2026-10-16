import { useI18n } from "@/components/i18n-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  EmployeeProfileHeader,
  EmployeeProfileTabs,
} from "@/features/employees/components/employee-profile-header";
import type { EmployeeSummary } from "@/features/employees/types";

export function EmployeeProfileLoading({
  employee,
}: {
  employee: EmployeeSummary | undefined;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  const fields = [
    copy.nip,
    copy.branch,
    copy.unit,
    copy.unitCode,
    copy.officeCity,
    copy.startDate,
    copy.employmentCategory,
    copy.employmentStatus,
    copy.tenure,
  ];
  return (
    <article
      aria-busy="true"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      {employee ? (
        <EmployeeProfileHeader employee={employee} />
      ) : (
        <div className="shrink-0 border-b p-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
      )}
      <Tabs
        className="min-h-0 flex-1"
        defaultValue="employment"
        variant="flush"
      >
        <EmployeeProfileTabs disabled />
        <TabsContent className="min-h-0 overflow-hidden" value="employment">
          <ScrollArea className="h-full min-h-0" variant="fit">
            <div className="p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-sm">{copy.employment}</h3>
                <p
                  className="flex items-center gap-2 text-muted-foreground text-xs"
                  role="status"
                >
                  <Spinner aria-hidden="true" size="xs" />
                  {copy.loading}
                </p>
              </div>
              <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {fields.map((label) => (
                  <div className="flex min-w-0 flex-col gap-2" key={label}>
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd>
                      <Skeleton className="h-4 w-3/4 max-w-64" />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </article>
  );
}
