import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TrafficLogEntry } from "@/features/socket-tester/types";
import { copyToClipboard } from "@/lib/clipboard";

type HexInspectorProps = {
  readonly entry: TrafficLogEntry | null;
  readonly onOpenChange: (open: boolean) => void;
};

const BYTE_COLUMNS = 16;

function toHexRows(value: string) {
  const bytes = new TextEncoder().encode(value);
  const rows: string[] = [];

  for (let index = 0; index < bytes.length; index += BYTE_COLUMNS) {
    const slice = bytes.slice(index, index + BYTE_COLUMNS);
    const offset = index.toString(16).padStart(4, "0");
    const hex = Array.from(slice)
      .map((byte) => byte.toString(16).padStart(2, "0").toUpperCase())
      .join(" ")
      .padEnd(47, " ");
    const ascii = Array.from(slice)
      .map((byte) =>
        byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : "."
      )
      .join("");
    rows.push(`${offset}  ${hex}  ${ascii}`);
  }

  return rows.length > 0 ? rows : ["0000"];
}

export function HexInspector({ entry, onOpenChange }: HexInspectorProps) {
  const open = Boolean(entry);
  const metadata = entry?.metadata
    ? JSON.stringify(entry.metadata, null, 2)
    : "No metadata captured for this frame.";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[82vh] overflow-hidden border-border/70 bg-zinc-950 text-zinc-100 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">
            Frame inspector
          </DialogTitle>
          <DialogDescription>
            Raw payload, byte view, and bridge metadata for the selected log
            row.
          </DialogDescription>
        </DialogHeader>
        {entry && (
          <div className="grid min-h-0 gap-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <InspectorStat
                label="Direction"
                value={entry.direction.toUpperCase()}
              />
              <InspectorStat label="Protocol" value={entry.protocol} />
              <InspectorStat label="Scope" value={entry.scope} />
              <InspectorStat label="Format" value={entry.format} />
            </div>
            <section className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium text-sm">Payload</h3>
                <Button
                  className="h-8 gap-2"
                  onClick={() => {
                    copyToClipboard(entry.data).catch(() => undefined);
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Copy className="size-3.5" />
                  Copy
                </Button>
              </div>
              <pre className="max-h-32 overflow-auto rounded-md border border-white/10 bg-black/45 p-3 font-mono text-emerald-300 text-xs leading-relaxed">
                {entry.data}
              </pre>
            </section>
            <section className="grid gap-2">
              <h3 className="font-medium text-sm">Hex</h3>
              <pre className="max-h-52 overflow-auto rounded-md border border-white/10 bg-black/45 p-3 font-mono text-sky-300 text-xs leading-relaxed">
                {toHexRows(entry.data).join("\n")}
              </pre>
            </section>
            <section className="grid min-h-0 gap-2">
              <h3 className="font-medium text-sm">Metadata</h3>
              <pre className="max-h-44 overflow-auto rounded-md border border-white/10 bg-black/45 p-3 font-mono text-xs text-zinc-300 leading-relaxed">
                {metadata}
              </pre>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InspectorStat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
      <p className="font-medium text-[10px] text-zinc-500 uppercase tracking-[0.16em]">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-sm text-zinc-100">{value}</p>
    </div>
  );
}
