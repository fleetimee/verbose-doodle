import { Fragment, type UIEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DocumentEditor } from "@/features/developer-tools/components/document-editor";
import { messages } from "@/lib/i18n";

interface JwtEditorProps {
  readonly colorizeToken?: boolean;
  readonly copyLabel?: string;
  readonly json?: boolean;
  readonly label: string;
  readonly onChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly value: string;
}

const TOKEN_PARTS = [
  {
    color: "color-mix(in oklch, var(--chart-5) 72%, var(--foreground))",
    key: "header",
    label: messages.jwtInspector.headerLabel,
  },
  {
    color: "color-mix(in oklch, var(--chart-4) 82%, var(--foreground))",
    key: "payload",
    label: messages.jwtInspector.payloadLabel,
  },
  {
    color: "color-mix(in oklch, var(--chart-2) 82%, var(--foreground))",
    key: "signature",
    label: messages.jwtInspector.tokenSignatureLabel,
  },
] as const;

function TokenHighlight({ value }: { readonly value: string }) {
  return (
    <>
      {value.split(".").map((part, index) => (
        <Fragment key={`${index}-${part}`}>
          {index > 0 && (
            <span aria-hidden="true" className="text-foreground/45">
              .
            </span>
          )}
          <span
            data-token-part={TOKEN_PARTS[index]?.key ?? "unknown"}
            style={{ color: TOKEN_PARTS[index]?.color ?? "var(--foreground)" }}
          >
            {part}
          </span>
        </Fragment>
      ))}
    </>
  );
}

function TokenInput({
  label,
  onChange,
  placeholder,
  value,
  large,
}: {
  readonly label: string;
  readonly onChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly value: string;
  readonly large: boolean;
}) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const syncScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (!highlightRef.current) {
      return;
    }
    highlightRef.current.scrollTop = event.currentTarget.scrollTop;
    highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
  };

  return (
    <div className="relative min-h-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-all px-3 py-2 font-mono text-sm leading-6"
        ref={highlightRef}
      >
        <TokenHighlight value={value} />
      </div>
      <Textarea
        aria-label={label}
        className="!bg-transparent relative z-10 resize-y font-mono text-sm text-transparent leading-6 caret-foreground shadow-none [-webkit-text-fill-color:transparent] selection:bg-primary/20 selection:text-transparent placeholder:text-muted-foreground"
        onChange={(event) => onChange?.(event.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        readOnly={!onChange}
        spellCheck={false}
        style={{ minHeight: large ? "65vh" : "160px" }}
        value={value}
      />
    </div>
  );
}

function TokenLegend() {
  return (
    <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t bg-muted/10 px-4 py-2.5 text-xs">
      <legend className="mr-1 font-medium text-foreground">
        {messages.jwtInspector.tokenLegendLabel}
      </legend>
      {TOKEN_PARTS.map((part) => (
        <span className="inline-flex items-center gap-2" key={part.key}>
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{ backgroundColor: part.color }}
          />
          <span className="text-muted-foreground">{part.label}</span>
        </span>
      ))}
    </fieldset>
  );
}

export function JwtEditor({
  label,
  value,
  onChange,
  json = false,
  placeholder,
  copyLabel = messages.jwtInspector.copy,
  colorizeToken = false,
}: JwtEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(messages.jwtInspector.copySuccess);
    } catch {
      toast.error(messages.jwtInspector.copyFailed);
    }
  };
  const editor = (large: boolean) => {
    const actions = (
      <div className="flex gap-1">
        <Button
          aria-label={
            copyLabel === messages.jwtInspector.copy
              ? `${copyLabel} ${label}`
              : copyLabel
          }
          disabled={!value}
          onClick={copyValue}
          size="sm"
          variant="ghost"
        >
          {copyLabel}
        </Button>
        {!large && (
          <Button
            aria-label={`${messages.jwtInspector.expand} ${label}`}
            onClick={() => setExpanded(true)}
            size="sm"
            variant="ghost"
          >
            {messages.jwtInspector.expand}
          </Button>
        )}
      </div>
    );
    if (json) {
      return (
        <DocumentEditor
          byteCountMessage=""
          compact
          description=""
          format="json"
          headerActions={actions}
          height={large ? "65vh" : "220px"}
          index=""
          label={label}
          lineCountMessage=""
          onChange={onChange}
          readOnly={!onChange}
          value={value}
        />
      );
    }
    return (
      <section>
        <header className="flex items-center justify-between gap-2 border-b px-4 py-2">
          <h2 className="font-medium text-sm">{label}</h2>
          {actions}
        </header>
        {colorizeToken ? (
          <TokenInput
            label={label}
            large={large}
            onChange={onChange}
            placeholder={placeholder}
            value={value}
          />
        ) : (
          <Textarea
            aria-label={label}
            className="resize-y break-all rounded-none border-0 font-mono text-sm shadow-none"
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            readOnly={!onChange}
            spellCheck={false}
            style={{ minHeight: large ? "65vh" : "160px" }}
            value={value}
          />
        )}
        {colorizeToken && <TokenLegend />}
      </section>
    );
  };
  return (
    <>
      <div className="min-w-0 overflow-hidden rounded-md border">
        {editor(false)}
      </div>
      <Dialog onOpenChange={setExpanded} open={expanded}>
        <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-[90vw]">
          <DialogTitle>{label}</DialogTitle>
          {editor(true)}
        </DialogContent>
      </Dialog>
    </>
  );
}
