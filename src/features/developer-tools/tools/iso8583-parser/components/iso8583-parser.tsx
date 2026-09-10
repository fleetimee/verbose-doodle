import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Binary,
  CheckCircle2,
  CircleAlert,
  ClipboardCopy,
  Code2,
  FileJson,
  Layers3,
  SendHorizontal,
  Trash2,
} from "@/components/hugeicons";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockItem,
} from "@/components/kibo-ui/code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import { copyToClipboard } from "@/lib/clipboard";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  type ParsedIso8583Field,
  type ParsedIso8583Message,
  parseIso8583Stream,
} from "../parse-iso8583";

const SAMPLE_STREAMS = [
  {
    label: "0800 · Sign-On Request",
    stream: "0060080082200000800000000400000000000000090108003700364503112001",
  },
  {
    label: "0200 · Account Inquiry",
    stream:
      "03730200F23A400188E0801600000000005600000039200000000000000008070925090004791625090807080760990311203112080700000479        000000000000000KANTOR PUSAT                     DIY IDN3600030000001301000000000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000                         0311219999003200000000000100",
  },
  {
    label: "0200 · Purchase Transaction",
    stream:
      "0200B220000000100000000000000000000016621487000000000100000000000001000001010000000000010000000101251260110120006000112000000000001TERM0001MERCHANT000001MERCHANT TEST 01          YOGYAKARTA IDN360",
  },
  {
    label: "Hex Dump (Sign-On)",
    stream:
      "30 30 36 30 30 38 30 30 38 32 32 30 30 30 30 30 38 30 30 30 30 30 30 30 30 34 30 30 30 30 30 30 30 30 30 30 30 30 30 30 30 39 30 31 30 38 30 30 33 37 30 30 33 36 34 35 30 33 31 31 32 30 30 31",
  },
];

function getFieldKindLabel(kind: string, length: number): string {
  if (kind === "llvar") {
    return `LLVAR ≤ ${length}`;
  }
  if (kind === "lllvar") {
    return `LLLVAR ≤ ${length}`;
  }
  return `${kind} ${length}`;
}

function getBitButtonClass(isActive: boolean, isSelected: boolean): string {
  if (!isActive) {
    return "cursor-default border border-border/30 bg-muted/10 text-muted-foreground/30";
  }
  if (isSelected) {
    return "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary ring-offset-1";
  }
  return "border border-primary/40 bg-primary/10 font-semibold text-primary hover:scale-105 hover:bg-primary/20";
}

function OverviewChips({
  parsed,
  onCopy,
}: {
  readonly parsed: ParsedIso8583Message;
  readonly onCopy: (text: string, label: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Message Type (MTI)
          </span>
          <Badge className="font-mono" variant="secondary">
            {parsed.mti.mti}
          </Badge>
        </div>
        <p className="mt-1.5 font-semibold text-foreground text-sm">
          {parsed.mti.description}
        </p>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {parsed.mti.version} · {parsed.mti.messageOrigin}
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Length Framing</span>
          <Badge
            className="font-mono text-[10px]"
            variant={parsed.lengthHeader ? "outline" : "secondary"}
          >
            {parsed.lengthHeader ? parsed.lengthHeader.type : "None"}
          </Badge>
        </div>
        <p className="mt-1.5 font-semibold text-foreground text-sm">
          {parsed.lengthHeader
            ? `${parsed.lengthHeader.value} bytes body`
            : "No Framing Header"}
        </p>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {parsed.lengthHeader
            ? `Prefix: "${parsed.lengthHeader.raw}"`
            : "Starts directly at MTI"}
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Data Elements</span>
          <Badge
            className="bg-primary/10 text-primary hover:bg-primary/20"
            variant="outline"
          >
            {parsed.fields.length} active
          </Badge>
        </div>
        <p className="mt-1.5 font-semibold text-foreground text-sm">
          {parsed.fields.length} Fields Unpacked
        </p>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {parsed.secondaryBitmapHex
            ? "Primary & Secondary Bitmaps"
            : "Primary Bitmap only"}
        </p>
      </div>

      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">Bitmaps</span>
          <button
            className="text-muted-foreground transition hover:text-foreground"
            onClick={() =>
              onCopy(
                parsed.primaryBitmapHex + (parsed.secondaryBitmapHex ?? ""),
                "Bitmaps"
              )
            }
            title="Copy Bitmaps"
            type="button"
          >
            <ClipboardCopy className="size-3.5" />
          </button>
        </div>
        <p
          className="mt-1.5 truncate font-medium font-mono text-foreground text-xs"
          title={parsed.primaryBitmapHex}
        >
          P: {parsed.primaryBitmapHex}
        </p>
        {parsed.secondaryBitmapHex ? (
          <p
            className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground"
            title={parsed.secondaryBitmapHex}
          >
            S: {parsed.secondaryBitmapHex}
          </p>
        ) : (
          <p className="mt-0.5 text-muted-foreground text-xs">64 bits total</p>
        )}
      </div>
    </div>
  );
}

function BitmapMatrix({
  activeBits,
  hasSecondary,
  selectedBit,
  onSelectBit,
}: {
  readonly activeBits: readonly number[];
  readonly hasSecondary: boolean;
  readonly selectedBit: number | null;
  readonly onSelectBit: (bit: number | null) => void;
}) {
  const totalBits = hasSecondary ? 128 : 64;
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            Interactive Bitmap Matrix
          </h3>
          <p className="text-muted-foreground text-xs">
            Active bits are highlighted. Click any active bit to isolate that
            data element below.
          </p>
        </div>
        {selectedBit ? (
          <Button
            className="h-7 text-xs"
            onClick={() => onSelectBit(null)}
            size="sm"
            variant="ghost"
          >
            Clear bit filter (#{selectedBit})
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-16">
        {Array.from({ length: totalBits }, (_, i) => i + 1).map((bitNum) => {
          const isActive =
            bitNum === 1 ? hasSecondary : activeBits.includes(bitNum);
          const isSelected = selectedBit === bitNum;

          return (
            <button
              className={cn(
                "flex h-7 items-center justify-center rounded-md font-mono text-[11px] transition-all",
                getBitButtonClass(isActive, isSelected)
              )}
              disabled={!isActive}
              key={bitNum}
              onClick={() => {
                if (isActive && bitNum !== 1) {
                  onSelectBit(isSelected ? null : bitNum);
                }
              }}
              title={
                isActive
                  ? `Bit ${bitNum} is active. Click to view.`
                  : `Bit ${bitNum} is not present in message.`
              }
              type="button"
            >
              {String(bitNum).padStart(2, "0")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FieldCard({
  field,
  onCopy,
}: {
  readonly field: ParsedIso8583Field;
  readonly onCopy: (text: string, label: string) => void;
}) {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4 shadow-2xs transition-all hover:border-border hover:shadow-xs">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              className="font-mono font-semibold text-xs"
              variant="secondary"
            >
              BIT {String(field.number).padStart(2, "0")}
            </Badge>
            <span className="font-semibold text-foreground text-sm leading-tight">
              {field.name}
            </span>
          </div>
          <Badge
            className="px-1.5 py-0 font-mono text-[10px] text-muted-foreground"
            variant="outline"
          >
            {getFieldKindLabel(field.kind, field.maxOrFixedLength)}
          </Badge>
        </div>

        <div className="relative mt-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 font-mono text-foreground text-xs">
          <div className="select-all break-all">
            {field.cleanValue || (
              <span className="text-muted-foreground italic">
                [Empty / Zero length]
              </span>
            )}
          </div>
          <button
            className="absolute top-2 right-2 opacity-0 transition hover:text-primary group-hover:opacity-100"
            onClick={() =>
              onCopy(field.cleanValue, `Bit ${field.number} value`)
            }
            title="Copy field value"
            type="button"
          >
            <ClipboardCopy className="size-3.5" />
          </button>
        </div>

        {field.decodedMeaning ? (
          <div className="mt-2 flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-primary text-xs">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span className="font-medium">{field.decodedMeaning}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between border-border/40 border-t pt-2 text-[11px] text-muted-foreground">
        <span>
          Stream slice: [{field.startIndex}..{field.endIndex}]
        </span>
        <span>{field.rawSlice.length} characters</span>
      </div>
    </div>
  );
}

function SlicesTable({ parsed }: { readonly parsed: ParsedIso8583Message }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-border/60 border-b bg-muted/40 font-medium text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Segment</th>
              <th className="px-4 py-2.5">Offset</th>
              <th className="px-4 py-2.5">Length</th>
              <th className="px-4 py-2.5">Raw Chunk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono">
            {parsed.lengthHeader ? (
              <tr className="hover:bg-muted/20">
                <td className="px-4 py-2 font-medium text-foreground">
                  Length Header
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  [0..{parsed.lengthHeader.type === "ascii-4" ? 4 : 2}]
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {parsed.lengthHeader.type === "ascii-4" ? 4 : 2}
                </td>
                <td className="max-w-xs truncate px-4 py-2 text-primary">
                  {parsed.lengthHeader.raw}
                </td>
              </tr>
            ) : null}
            <tr className="hover:bg-muted/20">
              <td className="px-4 py-2 font-medium text-foreground">MTI</td>
              <td className="px-4 py-2 text-muted-foreground">
                [{parsed.lengthHeader ? 4 : 0}..{parsed.lengthHeader ? 8 : 4}]
              </td>
              <td className="px-4 py-2 text-muted-foreground">4</td>
              <td className="px-4 py-2 font-bold text-primary">
                {parsed.mti.mti}
              </td>
            </tr>
            <tr className="hover:bg-muted/20">
              <td className="px-4 py-2 font-medium text-foreground">
                Primary Bitmap
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                [{parsed.lengthHeader ? 8 : 4}..{parsed.lengthHeader ? 24 : 20}]
              </td>
              <td className="px-4 py-2 text-muted-foreground">16</td>
              <td className="px-4 py-2 text-foreground">
                {parsed.primaryBitmapHex}
              </td>
            </tr>
            {parsed.secondaryBitmapHex ? (
              <tr className="hover:bg-muted/20">
                <td className="px-4 py-2 font-medium text-foreground">
                  Secondary Bitmap
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  [{parsed.lengthHeader ? 24 : 20}..
                  {parsed.lengthHeader ? 40 : 36}]
                </td>
                <td className="px-4 py-2 text-muted-foreground">16</td>
                <td className="px-4 py-2 text-foreground">
                  {parsed.secondaryBitmapHex}
                </td>
              </tr>
            ) : null}
            {parsed.fields.map((f) => (
              <tr className="hover:bg-muted/20" key={f.number}>
                <td className="px-4 py-2 text-foreground">
                  Bit {f.number} ({f.name})
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  [{f.startIndex}..{f.endIndex}]
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {f.rawSlice.length}
                </td>
                <td className="max-w-md truncate px-4 py-2 text-foreground">
                  {f.rawSlice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JsonView({ parsed }: { readonly parsed: ParsedIso8583Message }) {
  const jsonContent = useMemo(
    () =>
      JSON.stringify(
        {
          active_bits: parsed.activeBits,
          bitmaps: {
            primary: parsed.primaryBitmapHex,
            secondary: parsed.secondaryBitmapHex ?? null,
          },
          data_elements: Object.fromEntries(
            parsed.fields.map((f) => [
              `bit_${f.number}`,
              {
                decoded_meaning: f.decodedMeaning ?? null,
                name: f.name,
                type: f.kind,
                value: f.cleanValue,
              },
            ])
          ),
          length_header: parsed.lengthHeader ?? null,
          mti: {
            class: parsed.mti.messageClass,
            description: parsed.mti.description,
            function: parsed.mti.messageFunction,
            mti: parsed.mti.mti,
            origin: parsed.mti.messageOrigin,
            version: parsed.mti.version,
          },
          raw_stream: parsed.sanitizedStream,
        },
        null,
        2
      ),
    [parsed]
  );

  const codeData = useMemo(
    () => [
      {
        code: jsonContent,
        filename: "parsed-message.json",
        language: "json",
      },
    ],
    [jsonContent]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <CodeBlock data={codeData} defaultValue="json">
        <CodeBlockHeader className="border-border/60 border-b px-4 py-2 text-xs">
          <span className="font-mono text-muted-foreground">
            parsed-message.json
          </span>
          <CodeBlockCopyButton />
        </CodeBlockHeader>
        <CodeBlockBody>
          {(item) => (
            <CodeBlockItem key={item.language} value={item.language}>
              <CodeBlockContent className="p-4 font-mono text-xs">
                {item.code}
              </CodeBlockContent>
            </CodeBlockItem>
          )}
        </CodeBlockBody>
      </CodeBlock>
    </div>
  );
}

export function Iso8583Parser() {
  const navigate = useNavigate();
  const [streamInput, setStreamInput] = useState<string>(
    SAMPLE_STREAMS[0].stream
  );
  const [selectedBit, setSelectedBit] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"fields" | "json" | "slices">(
    "fields"
  );

  const parsedResult = useMemo<{
    readonly data?: ParsedIso8583Message;
    readonly error?: string;
  }>(() => {
    if (!streamInput.trim()) {
      return {};
    }
    try {
      const parsed = parseIso8583Stream(streamInput);
      return { data: parsed };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "Failed to parse ISO 8583 stream.",
      };
    }
  }, [streamInput]);

  const { data: parsed, error } = parsedResult;

  const filteredFields = useMemo(() => {
    if (!parsed) {
      return [];
    }
    return parsed.fields.filter((field) => {
      if (selectedBit && field.number !== selectedBit) {
        return false;
      }
      if (!searchQuery.trim()) {
        return true;
      }
      const q = searchQuery.toLowerCase();
      return (
        String(field.number).includes(q) ||
        field.name.toLowerCase().includes(q) ||
        field.cleanValue.toLowerCase().includes(q) ||
        field.decodedMeaning?.toLowerCase().includes(q)
      );
    });
  }, [parsed, selectedBit, searchQuery]);

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      toast.success(`Copied ${label} to clipboard`);
    } else {
      toast.error(messages.iso8583Parser.copyFailed);
    }
  };

  const handleAssignToGenerator = () => {
    if (!parsed) {
      return;
    }
    try {
      sessionStorage.setItem(
        "iso8583_import_draft",
        JSON.stringify({
          fields: parsed.fields.map((f) => ({
            cleanValue: f.cleanValue,
            kind: f.kind,
            label: f.name,
            length: f.maxOrFixedLength,
            number: f.number,
          })),
          mti: parsed.mti.mti,
          rawStream: parsed.sanitizedStream,
        })
      );
      toast.success(
        `Assigned ${parsed.fields.length} data elements to ISO 8583 Generator!`
      );
      navigate("/dashboard/developer-tools/iso8583-generator");
    } catch {
      toast.error("Failed to assign message to generator.");
    }
  };

  return (
    <DeveloperToolLayout
      categoryLabel="Inspection"
      description="Parse raw streams or hex dumps into structured data elements with decoded semantics, visual bitmap, and generator transfer."
      extraActions={
        <div className="flex flex-wrap items-center gap-2">
          {parsed ? (
            <Button
              className="gap-1.5 font-medium shadow-sm"
              onClick={handleAssignToGenerator}
              size="sm"
              variant="default"
            >
              <SendHorizontal className="size-3.5" />
              {messages.iso8583Parser.openInGenerator}
            </Button>
          ) : null}
          <Button
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setStreamInput("");
              setSelectedBit(null);
            }}
            size="sm"
            variant="outline"
          >
            <Trash2 className="size-3.5" />
            {messages.iso8583Parser.clear}
          </Button>
        </div>
      }
      headerExtra={
        <Badge className="shrink-0 self-start sm:self-center" variant="outline">
          ISO 8583:1987 / ASCII
        </Badge>
      }
      title={messages.iso8583Parser.title}
    >
      <div className="space-y-6">
        {/* Stream Input Workbench Card */}
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs transition-colors sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground text-sm">
                {messages.iso8583Parser.inputLabel}
              </span>
              {parsed ? (
                <Badge
                  className="px-1.5 py-0 font-mono text-[10px]"
                  variant="outline"
                >
                  {parsed.streamFormat === "hex"
                    ? messages.iso8583Parser.formatHex
                    : messages.iso8583Parser.formatAscii}
                </Badge>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-xs">Samples:</span>
              {SAMPLE_STREAMS.map((sample) => (
                <button
                  className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:bg-muted hover:text-foreground"
                  key={sample.label}
                  onClick={() => {
                    setStreamInput(sample.stream);
                    setSelectedBit(null);
                  }}
                  type="button"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            aria-label={messages.iso8583Parser.inputLabel}
            className="h-28 w-full resize-y rounded-lg border border-border/80 bg-muted/20 p-3 font-mono text-foreground text-xs leading-relaxed placeholder:text-muted-foreground/50 focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring"
            onChange={(e) => setStreamInput(e.target.value)}
            placeholder={messages.iso8583Parser.inputPlaceholder}
            spellCheck={false}
            value={streamInput}
          />

          <div className="mt-2 flex items-center justify-between text-muted-foreground text-xs">
            <span>
              {streamInput.length} characters{" "}
              {parsed ? `· ${parsed.totalParsedBytes} parsed bytes` : ""}
            </span>
            {parsed?.lengthHeader ? (
              <span className="font-mono text-[11px]">
                Header: {parsed.lengthHeader.raw} ({parsed.lengthHeader.type} ·{" "}
                {parsed.lengthHeader.value} bytes body)
              </span>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Parsing Error</p>
              <p className="font-mono text-destructive/90 text-xs">{error}</p>
            </div>
          </div>
        ) : null}

        {!streamInput.trim() && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border border-dashed p-12 text-center">
            <Binary className="mb-3 size-8 text-muted-foreground/40" />
            <p className="font-medium text-foreground text-sm">
              {messages.iso8583Parser.emptyStateTitle}
            </p>
            <p className="mt-1 max-w-md text-muted-foreground text-xs">
              {messages.iso8583Parser.emptyStateDescription}
            </p>
          </div>
        )}

        {parsed ? (
          <div className="space-y-6">
            <OverviewChips onCopy={handleCopy} parsed={parsed} />

            <BitmapMatrix
              activeBits={parsed.activeBits}
              hasSecondary={Boolean(parsed.secondaryBitmapHex)}
              onSelectBit={setSelectedBit}
              selectedBit={selectedBit}
            />

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-border/70 border-b pb-3">
                <Tabs
                  onValueChange={(val) =>
                    setActiveTab(val as "fields" | "json" | "slices")
                  }
                  value={activeTab}
                >
                  <TabsList className="h-8">
                    <TabsTrigger className="gap-1.5 text-xs" value="fields">
                      <Layers3 className="size-3.5" />
                      Data Elements ({filteredFields.length})
                    </TabsTrigger>
                    <TabsTrigger className="gap-1.5 text-xs" value="json">
                      <FileJson className="size-3.5" />
                      JSON Structure
                    </TabsTrigger>
                    <TabsTrigger className="gap-1.5 text-xs" value="slices">
                      <Code2 className="size-3.5" />
                      Stream Slices
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {activeTab === "fields" ? (
                  <Input
                    className="h-8 w-48 text-xs sm:w-64"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search bit # or name..."
                    value={searchQuery}
                  />
                ) : null}
              </div>

              {activeTab === "fields" ? (
                <div className="space-y-3">
                  {filteredFields.length === 0 ? (
                    <div className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground text-xs">
                      No data elements match the current filter.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {filteredFields.map((field) => (
                        <FieldCard
                          field={field}
                          key={field.number}
                          onCopy={handleCopy}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {activeTab === "json" ? <JsonView parsed={parsed} /> : null}

              {activeTab === "slices" ? <SlicesTable parsed={parsed} /> : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
              <div>
                <h4 className="font-semibold text-foreground text-sm">
                  Ready to test or modify this packet?
                </h4>
                <p className="text-muted-foreground text-xs">
                  Assign all {parsed.fields.length} unpacked data elements into
                  the ISO 8583 Generator workbench to adjust field values or
                  re-pack.
                </p>
              </div>
              <Button
                className="gap-2 font-medium shadow-sm"
                onClick={handleAssignToGenerator}
                size="default"
              >
                <SendHorizontal className="size-4" />
                {messages.iso8583Parser.openInGenerator}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </DeveloperToolLayout>
  );
}
