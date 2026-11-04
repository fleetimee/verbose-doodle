import { format, startOfYear, subDays, subMonths } from "date-fns";
import {
  Check,
  CircleAlert,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogDatePicker } from "@/features/log-viewer/log-date-picker";
import { SourcePicker } from "@/features/log-viewer/source-picker";
import type { LogCatalog, LogSource } from "@/features/log-viewer/types";
import { cn } from "@/lib/utils";

function SourceConnectionStatus({
  checking,
  failed,
  connected,
}: {
  checking: boolean;
  failed: boolean;
  connected: boolean;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  let icon = <Check aria-hidden="true" className="size-3.5" />;
  let text = copy.connectionConnected;
  if (checking) {
    icon = <Spinner aria-hidden="true" />;
    text = copy.connectionConnecting;
  } else if (failed) {
    icon = <CircleAlert aria-hidden="true" className="size-3.5" />;
    text = copy.unavailable;
  } else if (!connected) {
    return null;
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs",
        failed && !checking && "text-destructive"
      )}
      role="status"
    >
      {icon}
      {text}
    </span>
  );
}

export function SourceControls({
  selected,
  sources,
  catalog,
  checking,
  editing,
  failed,
  deleting,
  from,
  to,
  setFrom,
  setRange,
  setTo,
  onSelect,
  onEdit,
  onAdd,
  onCheck,
  onDelete,
}: {
  selected: LogSource;
  sources: LogSource[];
  catalog?: LogCatalog;
  checking: boolean;
  editing: boolean;
  failed: boolean;
  deleting: boolean;
  from: string;
  to: string;
  setFrom: (value: string) => void;
  setRange: (from: string, to: string) => void;
  setTo: (value: string) => void;
  onSelect: (id: string) => void;
  onEdit: () => void;
  onAdd: () => void;
  onCheck: () => void;
  onDelete: () => void;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const today = new Date();
  const end = format(today, "yyyy-MM-dd");
  const ranges = [
    { label: copy.rangeToday, description: copy.rangeToday, start: today },
    { label: "1W", description: copy.rangeWeek, start: subDays(today, 6) },
    { label: "1M", description: copy.rangeMonth, start: subMonths(today, 1) },
    { label: "YTD", description: copy.rangeYear, start: startOfYear(today) },
  ];
  return (
    <Card className="shrink-0" size="none" variant="outline">
      <CardHeader className="sr-only" size="none">
        <CardTitle>{copy.connectionTitle}</CardTitle>
        <CardDescription>{copy.sourceHint}</CardDescription>
      </CardHeader>
      <CardContent size="compact">
        <FieldGroup className="grid items-start md:grid-cols-12" size="compact">
          <Field className="col-span-2 min-w-0 md:col-span-6">
            <FieldLabel htmlFor="log-source">{copy.source}</FieldLabel>
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1">
                <SourcePicker
                  onSelect={onSelect}
                  selected={selected}
                  sources={sources}
                />
              </div>
              <ButtonGroup aria-label={copy.sourceActions}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label={copy.add}
                        disabled={editing}
                        focusableWhenDisabled
                        onClick={onAdd}
                        size="icon"
                        variant="tool-action"
                      />
                    }
                  >
                    <Plus />
                  </TooltipTrigger>
                  <TooltipContent>{copy.add}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label={copy.edit}
                        disabled={editing}
                        focusableWhenDisabled
                        onClick={onEdit}
                        size="icon"
                        variant="tool-action"
                      />
                    }
                  >
                    <SlidersHorizontal />
                  </TooltipTrigger>
                  <TooltipContent>{copy.edit}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        aria-label={copy.refresh}
                        disabled={checking || !from}
                        focusableWhenDisabled
                        onClick={onCheck}
                        size="icon"
                        variant="tool-action"
                      />
                    }
                  >
                    {checking ? <Spinner /> : <RefreshCw />}
                  </TooltipTrigger>
                  <TooltipContent>{copy.refresh}</TooltipContent>
                </Tooltip>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <AlertDialogTrigger
                          render={
                            <Button
                              aria-label={copy.delete}
                              disabled={deleting}
                              focusableWhenDisabled
                              size="icon"
                              variant="tool-destructive"
                            />
                          }
                        />
                      }
                    >
                      <Trash2 />
                    </TooltipTrigger>
                    <TooltipContent>{copy.delete}</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{copy.deleteTitle}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {copy.deleteDescription}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete}>
                        {copy.delete}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </ButtonGroup>
            </div>
          </Field>
          <Field className="min-w-0 md:col-span-3">
            <FieldLabel htmlFor="log-from">{copy.from}</FieldLabel>
            <LogDatePicker
              id="log-from"
              label={copy.from}
              max={to || undefined}
              onChange={setFrom}
              value={from}
            />
          </Field>
          <Field className="min-w-0 md:col-span-3">
            <FieldLabel htmlFor="log-to">{copy.to}</FieldLabel>
            <LogDatePicker
              id="log-to"
              label={copy.to}
              min={from}
              onChange={setTo}
              optional
              value={to}
            />
          </Field>
          <div className="col-span-2 flex flex-wrap items-center gap-2 md:col-span-6 md:col-start-7">
            <ButtonGroup aria-label={copy.quickRange}>
              {ranges.map((range) => {
                const start = format(range.start, "yyyy-MM-dd");
                return (
                  <Button
                    aria-label={range.description}
                    aria-pressed={from === start && to === end}
                    key={range.label}
                    onClick={() => setRange(start, end)}
                    size="sm"
                    title={range.description}
                    variant={
                      from === start && to === end ? "secondary" : "outline"
                    }
                  >
                    {range.label}
                  </Button>
                );
              })}
            </ButtonGroup>
          </div>
        </FieldGroup>
        <div className="mt-2 flex min-w-0 items-center gap-3">
          <code
            className="min-w-0 flex-1 truncate font-mono text-muted-foreground text-xs"
            title={catalog?.resolvedPath ?? selected.basePath}
          >
            {catalog?.resolvedPath ?? selected.basePath}
          </code>
          <SourceConnectionStatus
            checking={checking}
            connected={!!catalog}
            failed={failed}
          />
        </div>
        <FieldDescription className="sr-only">
          {copy.rangeHint}
        </FieldDescription>
      </CardContent>
    </Card>
  );
}
