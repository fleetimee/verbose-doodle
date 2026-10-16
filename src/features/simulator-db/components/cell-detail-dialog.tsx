import { useState } from "react";
import { Check, ClipboardCopy } from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SqlCellValue } from "@/features/simulator-db/types";

type CellDetailDialogProps = {
  readonly columnName: string | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly value: SqlCellValue;
};

function isString(val: SqlCellValue): val is string {
  return typeof val === "string";
}

function isBoolean(val: SqlCellValue): val is boolean {
  return typeof val === "boolean";
}

function isNumber(val: SqlCellValue): val is number {
  return typeof val === "number";
}

function formatCellDetail(value: SqlCellValue): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (isBoolean(value)) {
    return value ? "true" : "false";
  }
  if (isNumber(value)) {
    return String(value);
  }
  return value;
}

export function CellDetailDialog({
  columnName,
  onOpenChange,
  open,
  value,
}: CellDetailDialogProps) {
  const [copied, setCopied] = useState(false);

  const formattedValue = formatCellDetail(value);

  const isJson =
    isString(value) &&
    ((value.startsWith("{") && value.endsWith("}")) ||
      (value.startsWith("[") && value.endsWith("]")));

  let prettyJson = formattedValue;
  if (isJson && isString(value)) {
    try {
      prettyJson = JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      prettyJson = value;
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prettyJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <DialogTitle>
                <span className="font-mono">
                  {columnName || "Cell Inspector"}
                </span>
              </DialogTitle>
              {value === null && (
                <Badge size="sm" variant="outline">
                  NULL
                </Badge>
              )}
              {isJson && (
                <Badge size="sm" variant="secondary">
                  JSON
                </Badge>
              )}
            </div>
            <Button onClick={handleCopy} size="sm" variant="outline">
              {copied ? (
                <>
                  <Check className="size-3.5 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <ClipboardCopy className="size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <DialogDescription>
            Viewing raw cell value and inspector details.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea
          className="max-h-[60vh]"
          contentSize="padded"
          variant="bordered"
        >
          <pre className="select-text whitespace-pre-wrap break-all font-mono text-xs">
            {prettyJson}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
