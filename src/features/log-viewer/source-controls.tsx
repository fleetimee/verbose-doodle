import {
  Clock3,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { LogDatePicker } from "@/features/log-viewer/log-date-picker";
import type { LogCatalog, LogSource } from "@/features/log-viewer/types";

function SourceStatus({
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
  if (failed) {
    return <Badge variant="destructive">{copy.unavailable}</Badge>;
  }
  if (!connected) {
    return (
      <Badge variant="secondary">
        <Spinner />
        {copy.checking}
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      {checking && <Spinner />}
      {copy.connected}
    </Badge>
  );
}

export function SourceControls({
  selected,
  sources,
  catalog,
  checking,
  failed,
  editing,
  deleting,
  from,
  to,
  setFrom,
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
  failed: boolean;
  editing: boolean;
  deleting: boolean;
  from: string;
  to: string;
  setFrom: (value: string) => void;
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
              <Select onValueChange={onSelect} value={selected.id}>
                <SelectTrigger className="min-w-0 flex-1" id="log-source">
                  <SelectValue>
                    <span className="truncate">{selected.name}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start" className="w-(--anchor-width)">
                  <SelectGroup>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name} · {source.host}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                aria-label={copy.add}
                disabled={editing}
                onClick={onAdd}
                size="icon-sm"
                title={copy.add}
                variant="outline"
              >
                <Plus />
              </Button>
              <Button
                aria-label={copy.edit}
                disabled={editing}
                onClick={onEdit}
                size="icon-sm"
                title={copy.edit}
                variant="outline"
              >
                <SlidersHorizontal />
              </Button>
              <Button
                aria-label={copy.refresh}
                disabled={checking || !from}
                onClick={onCheck}
                size="icon-sm"
                title={copy.refresh}
                variant="outline"
              >
                {checking ? <Spinner /> : <RefreshCw />}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      aria-label={copy.delete}
                      disabled={deleting}
                      size="icon-sm"
                      title={copy.delete}
                      variant="ghost-destructive"
                    />
                  }
                >
                  <Trash2 />
                </AlertDialogTrigger>
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
        </FieldGroup>
        <div className="mt-2 flex min-w-0 items-center gap-3">
          <code
            className="min-w-0 flex-1 truncate font-mono text-muted-foreground text-xs"
            title={catalog?.resolvedPath ?? selected.basePath}
          >
            {catalog?.resolvedPath ??
              `\\\\${selected.host}\\${selected.shareName}\\${selected.basePath.replaceAll("/", "\\")}`}
          </code>
          <span className="hidden shrink-0 items-center gap-1.5 text-muted-foreground text-xs sm:flex">
            <Clock3 aria-hidden="true" className="size-3.5" />
            {selected.timezone}
          </span>
          <SourceStatus
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
