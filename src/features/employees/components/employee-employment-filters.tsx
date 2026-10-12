import { useId } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Checkbox } from "@/components/ui/checkbox";

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
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={activeOnly}
          id={activeId}
          onCheckedChange={(checked) =>
            onChange(checked === true, includeOutsourcing)
          }
        />
        <label
          className="cursor-pointer text-sm"
          htmlFor={activeId}
          title={copy.activeHint}
        >
          {copy.activeOnly}
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={includeOutsourcing}
          id={outsourcingId}
          onCheckedChange={(checked) => onChange(activeOnly, checked === true)}
        />
        <label
          className="cursor-pointer text-sm"
          htmlFor={outsourcingId}
          title={copy.outsourcingHint}
        >
          {copy.includeOutsourcing}
        </label>
      </div>
    </div>
  );
}
