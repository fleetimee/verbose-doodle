import { useId } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";

export function EmployeeEmploymentFilters({
  activeOnly,
  includeOutsourcing,
  onChange,
}: {
  activeOnly: boolean;
  includeOutsourcing: boolean;
  onChange: (activeOnly: boolean, includeOutsourcing: boolean) => void;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  const activeId = useId();
  const outsourcingId = useId();
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <Field className="w-auto" orientation="horizontal" size="sm">
        <Checkbox
          checked={activeOnly}
          id={activeId}
          onCheckedChange={(checked) =>
            onChange(checked === true, includeOutsourcing)
          }
        />
        <FieldLabel
          className="cursor-pointer"
          htmlFor={activeId}
          title={copy.activeHint}
        >
          {copy.activeOnly}
        </FieldLabel>
      </Field>
      <Field className="w-auto" orientation="horizontal" size="sm">
        <Checkbox
          checked={includeOutsourcing}
          id={outsourcingId}
          onCheckedChange={(checked) => onChange(activeOnly, checked === true)}
        />
        <FieldLabel
          className="cursor-pointer"
          htmlFor={outsourcingId}
          title={copy.outsourcingHint}
        >
          {copy.includeOutsourcing}
        </FieldLabel>
      </Field>
    </div>
  );
}
