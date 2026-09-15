import { useState } from "react";
import { toast } from "sonner";
import { Binary, CircleAlert } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatMessage, messages } from "@/lib/i18n";
import { parseIso8583Stream } from "../../iso8583-parser/parse-iso8583";
import type { Iso8583Field } from "../pack-iso8583";

type ImportStreamDialogProps = {
  readonly onImport: (
    mti: string,
    importedFields: {
      number: number;
      label: string;
      kind: Iso8583Field["kind"];
      length: number;
      cleanValue: string;
    }[]
  ) => void;
};

export function ImportStreamDialog({ onImport }: ImportStreamDialogProps) {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleParseAndAssign = () => {
    if (!stream.trim()) {
      setError(messages.iso8583Generator.importStreamEmptyError);
      return;
    }

    try {
      setError(null);
      const parsed = parseIso8583Stream(stream);
      onImport(
        parsed.mti.mti,
        parsed.fields.map((f) => ({
          cleanValue: f.cleanValue,
          kind: f.kind,
          label: f.name,
          length: f.maxOrFixedLength,
          number: f.number,
        }))
      );
      toast.success(
        formatMessage(messages.iso8583Generator.importStreamSuccess, {
          count: parsed.fields.length,
          mti: parsed.mti.mti,
        })
      );
      setOpen(false);
      setStream("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : messages.iso8583Generator.importStreamParseError
      );
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="gap-1.5" size="sm" variant="outline">
          <Binary className="size-3.5" />
          {messages.iso8583Generator.importStreamButton}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {messages.iso8583Generator.importStreamTitle}
          </DialogTitle>
          <DialogDescription>
            {messages.iso8583Generator.importStreamDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <textarea
            aria-label={messages.iso8583Generator.importStreamAriaLabel}
            className="h-32 w-full rounded-lg border border-border bg-muted/20 p-3 font-mono text-xs focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring"
            onChange={(e) => {
              setStream(e.target.value);
              setError(null);
            }}
            placeholder="0060080082200000800000000400000000000000090108003700364503112001..."
            value={stream}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-2.5 text-destructive text-xs">
              <CircleAlert className="mt-0.5 size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={() => setOpen(false)} variant="ghost">
            {messages.iso8583Generator.importStreamCancel}
          </Button>
          <Button onClick={handleParseAndAssign} variant="default">
            {messages.iso8583Generator.importStreamSubmit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
