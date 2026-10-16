import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { SchemaObject } from "@/features/simulator-db/types";
import { copyDatabaseValue } from "@/features/simulator-db/utils/clipboard";

type SchemaDefinitionDialogProps = {
  readonly object: SchemaObject | null;
  readonly onClose: () => void;
};

export function SchemaDefinitionDialog({
  object,
  onClose,
}: SchemaDefinitionDialogProps) {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={Boolean(object)}
    >
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>{object?.name}</DialogTitle>
          <DialogDescription>
            {m.definition} · {object?.tableName}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60dvh]" variant="fit">
          <pre className="whitespace-pre-wrap break-all font-mono text-xs">
            {object?.sql ??
              (object?.type === "index" ? m.autoIndex : m.noDefinition)}
          </pre>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Button
          disabled={!object?.sql}
          onClick={() => copyDatabaseValue(object?.sql ?? "")}
          size="sm"
          variant="outline"
        >
          {m.copyDefinition}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
