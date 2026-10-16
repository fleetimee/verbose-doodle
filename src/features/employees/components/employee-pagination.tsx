import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import type { EmployeePage } from "@/features/employees/types";
import { formatMessage } from "@/lib/i18n";

export function EmployeePagination({
  data,
  page,
  loading,
  onChange,
}: {
  data: EmployeePage | undefined;
  page: number;
  loading: boolean;
  onChange: (page: number) => void;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  if (!data || data.total === 0) {
    return null;
  }
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-muted/10 px-3 py-2">
      <Button
        disabled={loading || page === 0}
        onClick={() => onChange(page - 1)}
        size="sm"
        variant="outline"
      >
        {copy.previous}
      </Button>
      <span className="text-muted-foreground text-xs">
        {formatMessage(copy.pageStatus, {
          page: page + 1,
          pages: Math.max(1, Math.ceil(data.total / data.size)),
        })}
      </span>
      <Button
        disabled={loading || !data.hasMore}
        onClick={() => onChange(page + 1)}
        size="sm"
        variant="outline"
      >
        {copy.next}
      </Button>
    </div>
  );
}
