import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchEmployeePresence } from "@/features/employees/api";
import type {
  EmployeePresencePage,
  EmployeePresence as PresenceRecord,
} from "@/features/employees/types";

function PresenceEntry({ record }: { record: PresenceRecord }) {
  const { messages, locale } = useI18n();
  const copy = messages.employees;
  const [open, setOpen] = useState(false);
  const meaning = presenceMeaning(record.statusCode, copy);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${record.date}T12:00:00`));
  function timestamp(value: string | null) {
    if (!value) {
      return copy.notRecorded;
    }
    const day = value.slice(0, 10);
    const time = value.slice(11, 16);
    return day === record.date ? time : `${day} · ${time}`;
  }
  return (
    <Drawer
      direction="right"
      onOpenChange={setOpen}
      open={open}
      shouldScaleBackground={false}
    >
      <TableRow className="cursor-pointer" onClick={() => setOpen(true)}>
        <TableCell size="compact">
          <DrawerTrigger asChild>
            <Button size="text-link" variant="link">
              {date}
            </Button>
          </DrawerTrigger>
        </TableCell>
        <TableCell size="compact" variant="mono">
          {timestamp(record.checkIn)}
        </TableCell>
        <TableCell size="compact" variant="mono">
          {timestamp(record.checkOut)}
        </TableCell>
        <TableCell size="compact">
          <span>{record.statusCode || copy.unavailable}</span>
          <span className="ml-2 text-muted-foreground">{meaning}</span>
        </TableCell>
      </TableRow>
      <DrawerContent
        className="overflow-hidden data-[vaul-drawer-direction=right]:w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-lg"
        showSwipeHandle={false}
      >
        <DrawerHeader className="shrink-0" size="lg" variant="left">
          <DrawerTitle>{copy.presenceDetails}</DrawerTitle>
          <DrawerDescription>{date}</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-4"
          data-vaul-no-drag
        >
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <PresenceDetailField
              label={copy.checkIn}
              value={timestamp(record.checkIn)}
            />
            <PresenceDetailField
              label={copy.checkOut}
              value={timestamp(record.checkOut)}
            />
            <PresenceDetailField
              label={copy.presenceStatus}
              value={record.statusCode || copy.unavailable}
            />
            <PresenceDetailField label={copy.statusMeaning} value={meaning} />
            <PresenceDetailField
              label={copy.recordedOffice}
              value={record.recordedOffice || copy.unavailable}
            />
            <PresenceDetailField
              label={copy.presenceShift}
              value={record.shift || copy.unavailable}
            />
          </dl>
          <p className="text-muted-foreground text-xs">
            {copy.presenceLocationHint}
          </p>
        </div>
        <DrawerFooter size="lg">
          <DrawerClose asChild>
            <Button variant="outline">{messages.common.close}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function PresenceDetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="break-words text-sm">{value}</dd>
    </div>
  );
}

function presenceMeaning(
  code: string | null,
  copy: ReturnType<typeof useI18n>["messages"]["employees"]
) {
  const meanings = new Map([
    ["H", copy.presencePresent],
    ["L", copy.presenceDayOff],
    ["AO", copy.presenceMissingCheckout],
    ["AI", copy.presenceMissingCheckin],
    ["TH", copy.presenceLate],
    ["TI", copy.presenceNoPunches],
    ["C", copy.presenceLeave],
    ["CB", copy.presenceExtendedLeave],
    ["CH", copy.presenceMaternityLeave],
    ["S", copy.presenceSick],
    ["OP", copy.presenceHospitalized],
    ["P", copy.presencePermission],
    ["D1", copy.presenceDutyTraining],
    ["D2", copy.presenceDutyTraining],
  ]);
  return meanings.get(code ?? "") ?? copy.presenceUnknownStatus;
}

function PresenceSelect({
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

export function EmployeePresence({ nrp }: { nrp: number }) {
  const { messages, locale } = useI18n();
  const copy = messages.employees;
  const queryClient = useQueryClient();
  const [recordedOnly, setRecordedOnly] = useState(false);
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const query = useInfiniteQuery({
    queryKey: ["employee-presence", nrp, year, month, recordedOnly],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      fetchEmployeePresence(nrp, year, month, recordedOnly, pageParam, signal),
    getNextPageParam: (page) => (page.hasMore ? page.page + 1 : undefined),
    staleTime: 30_000,
    retry: false,
  });
  const records = query.data?.pages.flatMap((page) => page.records) ?? [];
  const allPeriods = queryClient.getQueryData<
    InfiniteData<EmployeePresencePage>
  >(["employee-presence", nrp, "all", "all", false]);
  const years =
    query.data?.pages[0]?.years ?? allPeriods?.pages[0]?.years ?? [];
  const yearOptions = [
    { value: "all", label: copy.allYears },
    ...years.map((value) => ({ value: String(value), label: String(value) })),
  ];
  const monthOptions = [
    { value: "all", label: copy.allMonths },
    ...Array.from({ length: 12 }, (_, index) => ({
      value: String(index + 1),
      label: new Intl.DateTimeFormat(locale, { month: "long" }).format(
        new Date(2020, index, 1)
      ),
    })),
  ];
  return (
    <section aria-labelledby="presence-heading" className="flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-sm" id="presence-heading">
          {copy.presence}
        </h3>
        <p className="mt-2 text-muted-foreground text-xs">
          {copy.presenceHint}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <PresenceSelect
          id="presence-year"
          label={copy.year}
          onChange={(value) => {
            setYear(value);
            setMonth("all");
          }}
          options={yearOptions}
          value={year}
        />
        <PresenceSelect
          disabled={year === "all"}
          id="presence-month"
          label={copy.month}
          onChange={setMonth}
          options={monthOptions}
          value={month}
        />
      </div>
      <Field className="w-auto" orientation="horizontal" size="sm">
        <Checkbox
          checked={recordedOnly}
          id="presence-recorded-only"
          onCheckedChange={setRecordedOnly}
        />
        <FieldLabel htmlFor="presence-recorded-only">
          {copy.recordedOnly}
        </FieldLabel>
      </Field>
      <p className="text-muted-foreground text-xs">{copy.recordedOnlyHint}</p>
      <PresenceResults
        error={query.isError}
        loading={query.isPending}
        records={records}
      />
      {query.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            <span>{copy.presenceError}</span>
            <Button
              onClick={() => {
                if (query.isFetchNextPageError) {
                  query.fetchNextPage();
                } else {
                  query.refetch();
                }
              }}
              size="sm"
              variant="outline"
            >
              {copy.retry}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      {query.hasNextPage && !query.isError ? (
        <Button
          className="w-fit"
          disabled={query.isFetching}
          onClick={() => query.fetchNextPage()}
          size="sm"
          variant="outline"
        >
          {query.isFetchingNextPage ? copy.loadingPresence : copy.loadMore}
        </Button>
      ) : null}
    </section>
  );
}

function PresenceResults({
  loading,
  error,
  records,
}: {
  loading: boolean;
  error: boolean;
  records: PresenceRecord[];
}) {
  const { messages } = useI18n();
  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label={messages.employees.loadingPresence}
        className="flex flex-col gap-4"
        role="status"
      >
        {[0, 1, 2].map((key) => (
          <div className="flex flex-col gap-3" key={key}>
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (error && records.length === 0) {
    return null;
  }
  if (records.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {messages.employees.noPresence}
      </p>
    );
  }
  return (
    <Table aria-label={messages.employees.presence}>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">{messages.employees.presenceDate}</TableHead>
          <TableHead scope="col">{messages.employees.checkIn}</TableHead>
          <TableHead scope="col">{messages.employees.checkOut}</TableHead>
          <TableHead scope="col">{messages.employees.presenceStatus}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <PresenceEntry key={record.date} record={record} />
        ))}
      </TableBody>
    </Table>
  );
}
