import { type CSSProperties, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EmployeeSummary } from "@/features/employees/types";

import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

const NAME_SEPARATOR = /\s+/;

export function EmployeeInitials({ name }: { name: string | null }) {
  const initials =
    name
      ?.trim()
      .split(NAME_SEPARATOR)
      .slice(0, 2)
      .map((part) => part[0])
      .join("") || "?";
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold text-muted-foreground text-sm"
    >
      {initials}
    </span>
  );
}

export function EmployeeProfileHeader({
  employee,
}: {
  employee: EmployeeSummary;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  return (
    <header className="shrink-0 border-b px-4 py-3">
      <div className="mb-2 flex items-center gap-3">
        <EmployeeInitials name={employee.name} />
        <div className="min-w-0">
          <h2 className="break-words font-semibold text-lg tracking-tight">
            {employee.name || copy.unavailable}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {employee.position || copy.unavailable}
          </p>
        </div>
      </div>
      <p className="break-words text-muted-foreground text-xs">
        {[employee.branch, employee.unitKerja].filter(Boolean).join(" · ") ||
          copy.unavailable}
      </p>
    </header>
  );
}

export function EmployeeProfileTabs({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  const [instant, setInstant] = useState(true);
  const tabMotionStyle: CSSProperties & Record<`--${string}`, string> = {
    "--employee-tab-duration": instant
      ? "0ms"
      : `${MOTION_DURATION.fast * 1000}ms`,
    "--employee-tab-ease-in-out": `cubic-bezier(${MOTION_EASE.inOut.join(",")})`,
    "--employee-tab-ease-out": `cubic-bezier(${MOTION_EASE.out.join(",")})`,
  };
  const sections = [
    { value: "employment", label: copy.employment },
    { value: "contact", label: copy.contact },
    { value: "presence", label: copy.presence },
    { value: "work-history", label: copy.workHistory },
    { value: "training", label: copy.training },
    { value: "certifications", label: copy.certifications },
    { value: "education", label: copy.education },
    { value: "family", label: copy.family },
    { value: "reporting", label: copy.reporting },
  ];
  return (
    <div
      className="employee-profile-tab-navigation shrink-0 overflow-x-auto border-b px-4"
      style={tabMotionStyle}
    >
      <TabsList
        aria-label={copy.profileSections}
        className="relative w-full min-w-max justify-start"
        onKeyDownCapture={() => setInstant(true)}
        onPointerDownCapture={() => setInstant(false)}
        variant="transparent"
      >
        {sections.map((section) => (
          <TabsTrigger
            className="flex-none shrink-0"
            disabled={disabled}
            key={section.value}
            size="sm"
            value={section.value}
          >
            {section.label}
          </TabsTrigger>
        ))}
        {disabled ? null : (
          <TabsIndicator onTransitionEnd={() => setInstant(true)} />
        )}
      </TabsList>
    </div>
  );
}
