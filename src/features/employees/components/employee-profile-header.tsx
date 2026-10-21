import { type CSSProperties, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  EmployeeDetails,
  EmployeeSummary,
} from "@/features/employees/types";
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
    <Avatar aria-hidden="true" size="xl" variant="square">
      <AvatarFallback variant="square">{initials}</AvatarFallback>
    </Avatar>
  );
}

export function EmployeeProfileHeader({
  employee,
}: {
  employee: EmployeeSummary | EmployeeDetails;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  const active = "active" in employee ? employee.active : undefined;
  return (
    <header className="flex shrink-0 flex-col gap-2 border-b px-4 py-3">
      <div className="flex items-start gap-3">
        <EmployeeInitials name={employee.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words font-semibold text-lg leading-tight tracking-tight">
              {employee.name || copy.unavailable}
            </h2>
            {active === true ? (
              <Badge size="sm" variant="primary-subtle">
                {copy.active}
              </Badge>
            ) : null}
            {active === false ? (
              <Badge size="sm" variant="outline-muted">
                {copy.inactive}
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm leading-snug">
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
    { value: "salary", label: copy.salary },
    { value: "work-history", label: copy.workHistory },
    { value: "training", label: copy.training },
    { value: "certifications", label: copy.certifications },
    { value: "education", label: copy.education },
    { value: "family", label: copy.family },
    { value: "reporting", label: copy.reporting },
  ];
  return (
    <div
      className="employee-profile-tab-navigation shrink-0 border-b px-4"
      style={tabMotionStyle}
    >
      <ScrollArea className="w-full">
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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
