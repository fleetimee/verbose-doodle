import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown, FileText } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/context";
import { fetchEmployeeSalary } from "@/features/employees/api";
import { SalaryLock } from "@/features/employees/components/salary-lock";
import type { EmployeeSalary as SalaryRecord } from "@/features/employees/types";

function SalaryEntry({ record }: { record: SalaryRecord }) {
  const { messages } = useI18n();
  const copy = messages.employees;
  const [open, setOpen] = useState(false);
  const title = record.jnsSlipText || record.jnsSlip || copy.unavailable;
  const period =
    record.tahun && record.bulan
      ? new Intl.DateTimeFormat("id-ID", {
          month: "long",
          year: "numeric",
        }).format(new Date(record.tahun, record.bulan - 1, 1))
      : copy.unavailable;
  return (
    <li className="flex min-w-0 flex-col gap-3 border-b py-4 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <FileText
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="break-words font-medium text-sm">{title}</p>
            <p className="text-muted-foreground text-xs">
              {period} · {record.tanggal2 || copy.unavailable}
            </p>
          </div>
        </div>
        <Button
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          size="sm"
          variant="outline"
        >
          {open ? copy.salaryClose : copy.salaryOpen}
          <ChevronDown
            className={open ? "rotate-180" : undefined}
            data-icon="inline-end"
          />
        </Button>
      </div>
      {open ? (
        <iframe
          className="h-[70dvh] min-h-96 w-full rounded-md border bg-white"
          referrerPolicy="no-referrer"
          sandbox=""
          srcDoc={record.slip}
          title={`${title} · ${period}`}
        />
      ) : null}
    </li>
  );
}

export function EmployeeSalary({ nrp }: { nrp: number }) {
  const { snapshot } = useAuth();
  const account = snapshot.user?.user_id;
  if (!account) {
    return null;
  }
  return (
    <SalaryLock account={account} key={`${account}:${nrp}`} nrp={nrp}>
      {(deadline) => <EmployeeSalaryContent deadline={deadline} nrp={nrp} />}
    </SalaryLock>
  );
}

function EmployeeSalaryContent({
  nrp,
  deadline,
}: {
  nrp: number;
  deadline: number;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState("all");
  const month = selectedMonth === "all" ? "" : `${year}-${selectedMonth}`;
  const monthOptions = [
    { value: "all", label: copy.allMonths },
    ...Array.from({ length: 12 }, (_, index) => ({
      value: String(index + 1).padStart(2, "0"),
      label: new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
        new Date(2020, index, 1)
      ),
    })),
  ];
  const latestYear = new Date().getFullYear() + 1;
  const yearOptions = Array.from(
    { length: latestYear - 1900 + 1 },
    (_, index) => {
      const value = String(latestYear - index);
      return { value, label: value };
    }
  );
  const query = useInfiniteQuery({
    queryKey: ["employee-salary", nrp, month],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => {
      if (Date.now() >= deadline) {
        throw new Error("Salary view is locked");
      }
      return fetchEmployeeSalary(nrp, month, pageParam, signal);
    },
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    gcTime: 0,
    retry: false,
  });
  const records =
    query.data?.pages.flatMap((page) => page.listPenghasilan) ?? [];
  return (
    <section aria-label={copy.salary} className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-sm">{copy.salary}</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {copy.salaryHint}
        </p>
      </div>
      <div className="flex flex-col gap-3 border-b pb-4">
        <div className="grid grid-cols-2 gap-3">
          <SalaryPeriodSelect
            id="salary-month"
            label={copy.month}
            onChange={setSelectedMonth}
            options={monthOptions}
            value={selectedMonth}
          />
          <SalaryPeriodSelect
            disabled={selectedMonth === "all"}
            id="salary-year"
            label={copy.year}
            onChange={setYear}
            options={yearOptions}
            value={year}
          />
        </div>
        {month ? (
          <Button
            className="w-fit"
            onClick={() => setSelectedMonth("all")}
            size="sm"
            variant="ghost"
          >
            {copy.salaryClear}
          </Button>
        ) : null}
      </div>
      {query.isPending ? <Skeleton className="h-20 w-full" /> : null}
      {query.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{copy.salaryError}</AlertDescription>
          <Button
            disabled={query.isFetching}
            onClick={() => query.refetch()}
            size="sm"
            variant="outline"
          >
            {copy.retry}
          </Button>
        </Alert>
      ) : null}
      {!(query.isPending || query.isError) && records.length === 0 ? (
        <p className="text-muted-foreground text-sm">{copy.noSalary}</p>
      ) : null}
      <ul className="flex min-w-0 flex-col">
        {records.map((record) => (
          <SalaryEntry key={record.id} record={record} />
        ))}
      </ul>
      {query.hasNextPage ? (
        <Button
          disabled={query.isFetching}
          onClick={() => query.fetchNextPage()}
          variant="outline"
        >
          {copy.loadMore}
        </Button>
      ) : null}
    </section>
  );
}

function SalaryPeriodSelect({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Field className="min-w-0" data-disabled={disabled} size="sm">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        disabled={disabled}
        items={options}
        onValueChange={onChange}
        value={value}
      >
        <SelectTrigger className="w-full" id={id} size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
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
