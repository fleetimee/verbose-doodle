import {
  keepPreviousData,
  type UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Users } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import { fetchEmployee, searchEmployees } from "@/features/employees/api";
import { EmployeeFilters } from "@/features/employees/components/employee-filters";
import { EmployeePagination } from "@/features/employees/components/employee-pagination";
import { EmployeeProfile } from "@/features/employees/components/employee-profile";
import { EmployeeInitials } from "@/features/employees/components/employee-profile-header";
import { EmployeeProfileLoading } from "@/features/employees/components/employee-profile-loading";
import { useEmployeeSelection } from "@/features/employees/hooks/use-employee-selection";
import type {
  EmployeeDetails,
  EmployeeQuery,
  EmployeeSummary,
  EmployeeSupervisor,
} from "@/features/employees/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import type { ApiError } from "@/lib/api";
import { formatMessage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function DirectoryMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
      <Users aria-hidden="true" className="mb-4 size-7 text-muted-foreground" />
      <h2 className="font-semibold text-base">{title}</h2>
      <p className="mt-2 max-w-sm text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function DirectoryError({
  error,
  retry,
  loading,
}: {
  error: ApiError;
  retry: () => void;
  loading: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  let message = copy.error;
  if (error.status === 403) {
    message = copy.forbidden;
  }
  if (error.status === 404) {
    message = copy.notFound;
  }
  return (
    <div className="space-y-4 p-6" role="alert">
      <p className="text-destructive text-sm">{message}</p>
      <Button disabled={loading} onClick={retry} size="sm" variant="outline">
        {copy.retry}
      </Button>
    </div>
  );
}

function useEmployeeSearch(input: string, query: EmployeeQuery) {
  const results = useQuery({
    queryKey: ["employees", "search", query],
    queryFn: ({ signal }) => searchEmployees(query, signal),
    placeholderData: keepPreviousData,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const isSearching =
    input.trim().length >= 2 &&
    (input.trim() !== query.search || results.isFetching);
  return { results, isSearching: isSearching || results.isFetching };
}

function EmployeeProfileContent({
  details,
  employee,
  selected,
  onOpenEmployee,
  initialTab,
}: {
  onOpenEmployee: (supervisor: EmployeeSupervisor) => void;
  initialTab: "employment" | "reporting";
  details: UseQueryResult<EmployeeDetails>;
  employee: EmployeeSummary | undefined;
  selected: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  if (details.isSuccess) {
    return (
      <EmployeeProfile
        employee={details.data}
        initialTab={initialTab}
        key={details.data.nrp}
        onOpenEmployee={onOpenEmployee}
      />
    );
  }
  if (details.isLoading) {
    return <EmployeeProfileLoading employee={employee} />;
  }
  return (
    <ScrollArea className="min-h-0 flex-1" variant="fit">
      {selected ? null : (
        <DirectoryMessage
          description={copy.selectDescription}
          title={copy.selectTitle}
        />
      )}
      {details.isError ? (
        <DirectoryError
          error={details.error}
          loading={details.isFetching}
          retry={() => {
            details.refetch();
          }}
        />
      ) : null}
    </ScrollArea>
  );
}

function ProfileNavigation({
  selected,
  hasPrevious,
  onBack,
  onResults,
}: {
  selected: boolean;
  hasPrevious: boolean;
  onBack: () => void;
  onResults: () => void;
}) {
  const { messages } = useI18n();
  if (!selected) {
    return null;
  }
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2",
        !hasPrevious && "lg:hidden"
      )}
    >
      {hasPrevious ? (
        <Button onClick={onBack} size="sm" variant="outline">
          {messages.employees.backToProfile}
        </Button>
      ) : null}
      <Button
        className="lg:hidden"
        onClick={onResults}
        size="sm"
        variant="outline"
      >
        {messages.employees.back}
      </Button>
    </div>
  );
}

export function EmployeeDirectoryPage() {
  const { messages } = useI18n();
  const copy = messages.employees;
  useDocumentMeta({ title: copy.title, description: copy.description });
  const [input, setInput] = useState("");
  const [query, setQuery] = useState<EmployeeQuery>({
    activeOnly: true,
    includeOutsourcing: false,
    search: "",
    branchCode: "",
    unitCode: "",
    page: 0,
  });
  const search = query.search;
  const selection = useEmployeeSelection();
  const selectedNrp = selection.nrp;
  const inputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLElement>(null);
  const { results, isSearching } = useEmployeeSearch(input, query);
  const details = useQuery({
    queryKey: ["employees", "details", selectedNrp],
    queryFn: ({ signal }) => {
      if (selectedNrp === null) {
        throw new Error("No employee selected");
      }
      return fetchEmployee(selectedNrp, signal);
    },
    enabled: selectedNrp !== null,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const validSearch = input.trim().length >= 2 && input.trim().length <= 100;
  useEffect(() => {
    const value = input.trim();
    const timer = setTimeout(() => {
      setQuery((previous) => {
        const nextSearch =
          value.length >= 2 && value.length <= 100 ? value : "";
        return previous.search === nextSearch
          ? previous
          : { ...previous, search: nextSearch, page: 0 };
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  function selectEmployee(employee: EmployeeSummary) {
    selection.select(employee);
    requestAnimationFrame(() => profileRef.current?.focus());
  }
  function followEmployee(supervisor: EmployeeSupervisor) {
    selection.follow(supervisor);
    requestAnimationFrame(() => profileRef.current?.focus());
  }
  function backToProfile() {
    selection.back();
    requestAnimationFrame(() => profileRef.current?.focus());
  }
  function backToResults() {
    selection.clear();
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  return (
    <DeveloperToolLayout
      categoryHref="/dashboard/overview"
      categoryLabel={messages.common.navWorkspace}
      className="min-h-0 flex-1 gap-3 overflow-hidden pb-0 [&>header]:shrink-0 [&>header]:border-b-0 [&>header]:pb-0 [&>header_h1]:mt-1 [&>header_h1]:text-2xl [&>header_h1]:sm:text-2xl [&>header_h1]:lg:text-2xl [&>header_p]:mt-1"
      description={copy.description}
      mainClassName="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden"
      title={copy.title}
    >
      <div className="grid shrink-0 gap-3 lg:grid-cols-3">
        <form
          className="min-w-0 shrink-0"
          onSubmit={(event) => {
            event.preventDefault();
            if (!validSearch) {
              return;
            }
            selection.clear();
            const nextSearch = input.trim();
            if (nextSearch === search) {
              results.refetch();
            } else {
              setQuery((previous) => ({
                ...previous,
                search: nextSearch,
                page: 0,
              }));
            }
          }}
        >
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="employee-search"
          >
            {copy.searchLabel}
          </label>
          <div className="flex gap-2">
            <Input
              aria-describedby="employee-search-hint"
              autoComplete="off"
              id="employee-search"
              maxLength={100}
              onChange={(event) => {
                const value = event.target.value;
                setInput(value);
                selection.clear();
                if (value.trim().length < 2) {
                  setQuery((previous) => ({
                    ...previous,
                    search: "",
                    page: 0,
                  }));
                }
              }}
              placeholder={copy.searchPlaceholder}
              ref={inputRef}
              type="search"
              value={input}
              variant="search-field"
            />
            <Button disabled={!validSearch} type="submit">
              {copy.search}
            </Button>
          </div>
          <p
            className="mt-2 text-muted-foreground text-xs leading-6"
            id="employee-search-hint"
          >
            {copy.searchHint}
          </p>
        </form>
        <div className="min-w-0 lg:col-span-2">
          <EmployeeFilters
            activeOnly={query.activeOnly}
            branchCode={query.branchCode}
            includeOutsourcing={query.includeOutsourcing}
            onChange={(branchCode, unitCode) => {
              selection.clear();
              setQuery((previous) => ({
                ...previous,
                branchCode,
                unitCode,
                page: 0,
              }));
            }}
            onEmploymentChange={(activeOnly, includeOutsourcing) => {
              selection.clear();
              setQuery((previous) => ({
                ...previous,
                activeOnly,
                includeOutsourcing,
                page: 0,
              }));
            }}
            unitCode={query.unitCode}
          />
        </div>
      </div>
      <div className="grid min-h-0 min-w-0 flex-1 grid-rows-1 overflow-hidden rounded-lg border bg-card lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section
          aria-label={copy.results}
          className={cn(
            "flex min-h-0 min-w-0 flex-col overflow-hidden lg:border-r",
            selectedNrp !== null && "hidden lg:flex"
          )}
        >
          <div className="shrink-0 border-b px-4 py-3">
            <h2 className="font-medium text-sm">{copy.results}</h2>
            <p
              aria-live="polite"
              className="mt-1 flex min-h-4 items-center gap-2 text-muted-foreground text-xs"
            >
              {isSearching ? <Spinner aria-hidden="true" size="xs" /> : null}
              {isSearching
                ? copy.loadingResults
                : formatMessage(copy.resultCount, {
                    count: results.data?.total ?? 0,
                  })}
            </p>
          </div>
          <ScrollArea className="min-h-0 flex-1" variant="fit">
            {results.isPending ? (
              <div
                aria-busy="true"
                aria-label={copy.loadingResults}
                className="space-y-5 p-4"
                role="status"
              >
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : null}
            {results.isError ? (
              <DirectoryError
                error={results.error}
                loading={results.isFetching}
                retry={() => {
                  results.refetch();
                }}
              />
            ) : null}
            {results.isSuccess &&
            !isSearching &&
            results.data.employees.length === 0 ? (
              <DirectoryMessage
                description={copy.noResultsDescription}
                title={copy.noResults}
              />
            ) : null}
            {results.isSuccess ? (
              <ul aria-busy={isSearching} className="divide-y">
                {results.data.employees.map((employee) => (
                  <li key={employee.nrp}>
                    <button
                      aria-controls="employee-profile"
                      aria-current={
                        selectedNrp === employee.nrp ? "true" : undefined
                      }
                      className={cn(
                        "flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 disabled:cursor-wait",
                        selectedNrp === employee.nrp && "bg-primary/5"
                      )}
                      disabled={isSearching}
                      onClick={() => selectEmployee(employee)}
                      type="button"
                    >
                      <EmployeeInitials name={employee.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-medium text-sm">
                          {employee.name || copy.unavailable}
                        </span>
                        <span className="mt-1 block font-mono text-muted-foreground text-xs">
                          {employee.nip || copy.unavailable}
                        </span>
                        <span className="mt-2 block break-words text-muted-foreground text-xs">
                          {employee.branch || copy.unavailable} ·{" "}
                          {employee.unitKerja || copy.unavailable}
                        </span>
                        <span className="mt-1 block break-words text-muted-foreground text-xs">
                          {employee.position || copy.unavailable}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </ScrollArea>
          <EmployeePagination
            data={results.data}
            loading={isSearching}
            onChange={(page) => {
              selection.clear();
              setQuery((previous) => ({ ...previous, page }));
            }}
            page={query.page}
          />
        </section>
        <section
          aria-label={copy.title}
          className={cn(
            "flex min-h-0 min-w-0 flex-col overflow-hidden outline-none",
            selectedNrp === null && "hidden lg:flex"
          )}
          id="employee-profile"
          ref={profileRef}
          tabIndex={-1}
        >
          <ProfileNavigation
            hasPrevious={selection.hasPrevious}
            onBack={backToProfile}
            onResults={backToResults}
            selected={selectedNrp !== null}
          />
          <EmployeeProfileContent
            details={details}
            employee={selection.employee}
            initialTab={selection.initialTab}
            onOpenEmployee={followEmployee}
            selected={selectedNrp !== null}
          />
        </section>
      </div>
    </DeveloperToolLayout>
  );
}
