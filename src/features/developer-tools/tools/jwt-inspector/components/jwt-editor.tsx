import {
  AlertCircleIcon,
  BracesIcon,
  CheckmarkCircle02Icon,
  ClipboardCopyIcon,
  MaximizeScreenIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Fragment,
  type ReactNode,
  type UIEvent,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DocumentEditor } from "@/features/developer-tools/components/document-editor";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { jwtClaimsExtensions } from "../utils/jwt-claims-extension";
import { JwtClaimsBreakdown } from "./jwt-claims-breakdown";

interface JwtEditorProps {
  readonly className?: string;
  readonly colorizeToken?: boolean;
  readonly copyLabel?: string;
  readonly description?: string;
  readonly footer?: ReactNode;
  readonly height?: string;
  readonly json?: boolean;
  readonly label: string;
  readonly minHeight?: string;
  readonly onChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly value: string;
}

const TOKEN_PARTS = [
  {
    color: "color-mix(in oklch, var(--chart-5) 72%, var(--foreground))",
    key: "header",
    get label() {
      return messages.jwtInspector.headerLabel;
    },
  },
  {
    color: "color-mix(in oklch, var(--chart-4) 82%, var(--foreground))",
    key: "payload",
    get label() {
      return messages.jwtInspector.payloadLabel;
    },
  },
  {
    color: "color-mix(in oklch, var(--chart-2) 82%, var(--foreground))",
    key: "signature",
    get label() {
      return messages.jwtInspector.tokenSignatureLabel;
    },
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
            className="text-(--part-color)"
            data-token-part={TOKEN_PARTS[index]?.key ?? "unknown"}
            // SAFETY: CSS custom property for token part color
            style={
              {
                "--part-color":
                  TOKEN_PARTS[index]?.color ?? "var(--foreground)",
              } as React.CSSProperties
            }
          >
            {part}
          </span>
        </Fragment>
      ))}
    </>
  );
}

function InlineTokenInput({
  label,
  minHeight = "160px",
  onChange,
  placeholder,
  value,
}: {
  readonly label: string;
  readonly minHeight?: string;
  readonly onChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly value: string;
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
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden whitespace-pre-wrap break-all px-3 py-2 font-mono text-sm leading-6"
        ref={highlightRef}
      >
        <TokenHighlight value={value} />
      </div>
      <textarea
        aria-label={label}
        className="!bg-transparent relative z-10 h-full min-h-[var(--min-height,320px)] w-full flex-1 resize-none overflow-auto font-mono text-sm text-transparent leading-6 caret-foreground shadow-none outline-none [-webkit-text-fill-color:transparent] selection:bg-primary/20 selection:text-transparent placeholder:text-muted-foreground focus-visible:ring-0"
        onChange={(event) => onChange?.(event.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        readOnly={!onChange}
        spellCheck={false}
        // SAFETY: CSS custom property for dynamic min-height
        style={
          minHeight
            ? ({ "--min-height": minHeight } as React.CSSProperties)
            : undefined
        }
        value={value}
      />
    </div>
  );
}

function ModalTokenInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  readonly label: string;
  readonly onChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly value: string;
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
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden whitespace-pre-wrap break-all p-4 font-mono text-sm leading-6"
        ref={highlightRef}
      >
        <TokenHighlight value={value} />
      </div>
      <textarea
        aria-label={label}
        className="!bg-transparent relative z-10 h-full w-full resize-none overflow-auto rounded-none border-0 p-4 font-mono text-sm text-transparent leading-6 caret-foreground shadow-none outline-none [-webkit-text-fill-color:transparent] selection:bg-primary/20 selection:text-transparent placeholder:text-muted-foreground focus-visible:ring-0"
        onChange={(event) => onChange?.(event.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        readOnly={!onChange}
        spellCheck={false}
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
            className="size-2 rounded-full bg-(--part-color)"
            // SAFETY: CSS custom property for token part color
            style={{ "--part-color": part.color } as React.CSSProperties}
          />
          <span className="text-muted-foreground">{part.label}</span>
        </span>
      ))}
    </fieldset>
  );
}

function ModalTokenLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs">
      <span className="font-medium text-foreground">
        {messages.jwtInspector.tokenLegendLabel}:
      </span>
      {TOKEN_PARTS.map((part) => (
        <span className="inline-flex items-center gap-1.5" key={part.key}>
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-(--part-color)"
            // SAFETY: CSS custom property for token part color
            style={{ "--part-color": part.color } as React.CSSProperties}
          />
          <span className="text-muted-foreground">{part.label}</span>
        </span>
      ))}
    </div>
  );
}

function JsonStatusBadge({
  isValid,
  value,
}: {
  readonly isValid: boolean;
  readonly value: string;
}) {
  if (!value.trim()) {
    return (
      <span className="text-muted-foreground text-xs">
        {messages.jwtInspector.emptyDocument}
      </span>
    );
  }
  if (isValid) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 text-xs dark:text-emerald-400">
        <HugeiconsIcon className="size-3.5" icon={CheckmarkCircle02Icon} />
        <span>{messages.jwtInspector.validJson}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 text-xs dark:text-amber-400">
      <HugeiconsIcon className="size-3.5" icon={AlertCircleIcon} />
      <span>{messages.jwtInspector.invalidJson}</span>
    </span>
  );
}

function JwtDialogJsonView({
  byteCount,
  claimType,
  copied,
  copyAriaLabel,
  copyLabel,
  copyValue,
  description,
  formatJson,
  isEditable,
  isValidJson,
  label,
  lineCount,
  modalTab,
  onChange,
  onClose,
  setModalTab,
  value,
}: {
  readonly byteCount: number;
  readonly claimType: "header" | "payload";
  readonly copied: boolean;
  readonly copyAriaLabel: string;
  readonly copyLabel: string;
  readonly copyValue: () => void;
  readonly description?: string;
  readonly formatJson: () => void;
  readonly isEditable: boolean;
  readonly isValidJson: boolean;
  readonly label: string;
  readonly lineCount: number;
  readonly modalTab: "json" | "claims";
  readonly onChange?: (value: string) => void;
  readonly onClose: () => void;
  readonly setModalTab: (tab: "json" | "claims") => void;
  readonly value: string;
}) {
  return (
    <Tabs
      className="flex h-full flex-col overflow-hidden"
      onValueChange={(val) => setModalTab(val as "json" | "claims")}
      value={modalTab}
      variant="flush"
    >
      <DialogHeader variant="banner">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="min-w-0 space-y-1">
            <DialogTitle size="sm">{label}</DialogTitle>
            <DialogDescription size="xs">
              <span className="flex items-center gap-2">
                {description && <span>{description}</span>}
                {description && <span aria-hidden="true">·</span>}
                <span>
                  {formatMessage(
                    lineCount === 1
                      ? messages.jwtInspector.lineCount
                      : messages.jwtInspector.lineCountPlural,
                    { count: lineCount }
                  )}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {formatMessage(messages.jwtInspector.byteCount, {
                    count: byteCount.toLocaleString(),
                  })}
                </span>
              </span>
            </DialogDescription>
          </div>
          <TabsList className="ml-2 h-7" size="xs" variant="subtle">
            <TabsTrigger size="sm" value="json" variant="compact">
              JSON
            </TabsTrigger>
            <TabsTrigger size="sm" value="claims" variant="compact">
              {messages.jwtInspector.claimsBreakdown}
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {modalTab === "json" && isEditable && (
            <Button
              aria-label={messages.jwtInspector.formatJson}
              className="size-8"
              disabled={!value.trim()}
              onClick={formatJson}
              size="icon-sm"
              title={messages.jwtInspector.formatJson}
              variant="outline"
            >
              <HugeiconsIcon className="size-4" icon={BracesIcon} />
              <span className="sr-only">
                {messages.jwtInspector.formatJson}
              </span>
            </Button>
          )}
          <Button
            aria-label={copyAriaLabel}
            className="size-8"
            disabled={!value}
            onClick={copyValue}
            size="icon-sm"
            title={copied ? messages.jwtInspector.copied : copyLabel}
            variant="outline"
          >
            <HugeiconsIcon
              className="size-4"
              icon={copied ? CheckmarkCircle02Icon : ClipboardCopyIcon}
            />
            <span className="sr-only">
              {copied ? messages.jwtInspector.copied : copyLabel}
            </span>
          </Button>
        </div>
      </DialogHeader>

      <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-background">
        <TabsContent className="m-0 h-full w-full" value="json" variant="flush">
          <DocumentEditor
            className="h-full border-0"
            extensions={jwtClaimsExtensions}
            format="json"
            height="100%"
            label={label}
            onChange={onChange}
            readOnly={!onChange}
            showHeader={false}
            value={value}
          />
        </TabsContent>
        <TabsContent
          className="m-0 h-full w-full"
          value="claims"
          variant="flush"
        >
          <JwtClaimsBreakdown
            className="h-full"
            height="100%"
            jsonValue={value}
            type={claimType}
          />
        </TabsContent>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/15 px-6 py-2.5 text-muted-foreground text-xs">
        <div className="flex items-center gap-3">
          <JsonStatusBadge isValid={isValidJson} value={value} />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden font-mono text-[11px] text-muted-foreground/70 sm:inline">
            {messages.jwtInspector.escToClose}
          </span>
          <Button onClick={onClose} size="xs" variant="ghost">
            {messages.jwtInspector.done}
          </Button>
        </div>
      </div>
    </Tabs>
  );
}

function JwtDialogPlainView({
  byteCount,
  colorizeToken,
  copied,
  copyAriaLabel,
  copyLabel,
  copyValue,
  description,
  label,
  lineCount,
  onChange,
  onClose,
  placeholder,
  value,
}: {
  readonly byteCount: number;
  readonly colorizeToken: boolean;
  readonly copied: boolean;
  readonly copyAriaLabel: string;
  readonly copyLabel: string;
  readonly copyValue: () => void;
  readonly description?: string;
  readonly label: string;
  readonly lineCount: number;
  readonly onChange?: (value: string) => void;
  readonly onClose: () => void;
  readonly placeholder?: string;
  readonly value: string;
}) {
  return (
    <>
      <DialogHeader variant="banner">
        <div className="min-w-0 space-y-1">
          <DialogTitle size="sm">{label}</DialogTitle>
          <DialogDescription size="xs">
            <span className="flex items-center gap-2">
              {description && <span>{description}</span>}
              {description && <span aria-hidden="true">·</span>}
              <span>
                {formatMessage(
                  lineCount === 1
                    ? messages.jwtInspector.lineCount
                    : messages.jwtInspector.lineCountPlural,
                  { count: lineCount }
                )}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {formatMessage(messages.jwtInspector.byteCount, {
                  count: byteCount.toLocaleString(),
                })}
              </span>
            </span>
          </DialogDescription>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            aria-label={copyAriaLabel}
            disabled={!value}
            onClick={copyValue}
            size="icon-sm"
            title={copied ? messages.jwtInspector.copied : copyLabel}
            variant="outline"
          >
            <HugeiconsIcon
              className="size-4"
              icon={copied ? CheckmarkCircle02Icon : ClipboardCopyIcon}
            />
            <span className="sr-only">
              {copied ? messages.jwtInspector.copied : copyLabel}
            </span>
          </Button>
        </div>
      </DialogHeader>

      <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-background">
        {colorizeToken ? (
          <ModalTokenInput
            label={label}
            onChange={onChange}
            placeholder={placeholder}
            value={value}
          />
        ) : (
          <Textarea
            aria-label={label}
            className="h-full w-full resize-none overflow-auto"
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            readOnly={!onChange}
            spellCheck={false}
            value={value}
            variant="ghost-mono"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/15 px-6 py-2.5 text-muted-foreground text-xs">
        <div className="flex items-center gap-3">
          {colorizeToken ? (
            <ModalTokenLegend />
          ) : (
            <span>
              {formatMessage(
                value.length === 1
                  ? messages.jwtInspector.characterCount
                  : messages.jwtInspector.characterCountPlural,
                { count: value.length.toLocaleString() }
              )}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden font-mono text-[11px] text-muted-foreground/70 sm:inline">
            {messages.jwtInspector.escToClose}
          </span>
          <Button onClick={onClose} size="xs" variant="ghost">
            {messages.jwtInspector.done}
          </Button>
        </div>
      </div>
    </>
  );
}

export function JwtEditor({
  className,
  colorizeToken = false,
  copyLabel = messages.jwtInspector.copy,
  description,
  footer,
  height,
  json = false,
  label,
  minHeight,
  onChange,
  placeholder,
  value,
}: JwtEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"json" | "claims">("json");
  const [modalTab, setModalTab] = useState<"json" | "claims">("json");

  const copyAriaLabel =
    copyLabel === messages.jwtInspector.copy
      ? `${copyLabel} ${label}`
      : copyLabel;

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(messages.jwtInspector.copySuccess);
    } catch {
      toast.error(messages.jwtInspector.copyFailed);
    }
  };

  const formatJson = () => {
    if (!(onChange && value.trim())) {
      return;
    }
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      toast.success(messages.jwtInspector.formatJsonSuccess);
    } catch {
      toast.error(messages.jwtInspector.formatJsonError);
    }
  };

  const byteCount = new TextEncoder().encode(value || "").length;
  const lineCount = value ? value.split("\n").length : 0;
  const isEditable = Boolean(onChange);

  let isValidJson = false;
  if (json && value.trim()) {
    try {
      JSON.parse(value);
      isValidJson = true;
    } catch {
      isValidJson = false;
    }
  }

  const claimType = label.toLowerCase().includes("header")
    ? "header"
    : "payload";

  const renderInlineActions = (currentTab?: "json" | "claims"): ReactNode => (
    <div className="flex items-center gap-1">
      {json && isEditable && (!currentTab || currentTab === "json") && (
        <Button
          aria-label={messages.jwtInspector.formatJson}
          className="size-7"
          disabled={!value.trim()}
          onClick={formatJson}
          size="icon"
          title={messages.jwtInspector.formatJson}
          variant="ghost"
        >
          <HugeiconsIcon className="size-3.5" icon={BracesIcon} />
          <span className="sr-only">{messages.jwtInspector.formatJson}</span>
        </Button>
      )}
      <Button
        aria-label={copyAriaLabel}
        className="size-7"
        disabled={!value}
        onClick={copyValue}
        size="icon"
        title={copied ? messages.jwtInspector.copied : copyLabel}
        variant="ghost"
      >
        <HugeiconsIcon
          className="size-3.5"
          icon={copied ? CheckmarkCircle02Icon : ClipboardCopyIcon}
        />
        <span className="sr-only">
          {copied ? messages.jwtInspector.copied : copyLabel}
        </span>
      </Button>
      <Button
        aria-label={`${messages.jwtInspector.expand} ${label}`}
        className="size-7"
        onClick={() => {
          setModalTab(activeTab);
          setExpanded(true);
        }}
        size="icon"
        title={`${messages.jwtInspector.expand} ${label}`}
        variant="ghost"
      >
        <HugeiconsIcon className="size-3.5" icon={MaximizeScreenIcon} />
        <span className="sr-only">{messages.jwtInspector.expand}</span>
      </Button>
    </div>
  );

  return (
    <>
      <div
        className={cn(
          "min-w-0 overflow-hidden rounded-md border bg-card text-card-foreground",
          className
        )}
      >
        {json ? (
          <Tabs
            className="w-full"
            onValueChange={(val) => setActiveTab(val as "json" | "claims")}
            value={activeTab}
            variant="flush"
          >
            <header className="flex items-center justify-between gap-2 border-b bg-muted/10 px-3 py-1.5">
              <div className="flex items-center gap-2.5">
                <h2 className="font-medium text-foreground text-xs sm:text-sm">
                  {label}
                </h2>
                <TabsList size="xs" variant="subtle">
                  <TabsTrigger size="sm" value="json" variant="compact">
                    JSON
                  </TabsTrigger>
                  <TabsTrigger size="sm" value="claims" variant="compact">
                    {messages.jwtInspector.claimsBreakdown}
                  </TabsTrigger>
                </TabsList>
              </div>
              {renderInlineActions(activeTab)}
            </header>

            <TabsContent className="m-0" value="json" variant="flush">
              <DocumentEditor
                byteCountMessage=""
                compact
                description=""
                extensions={jwtClaimsExtensions}
                format="json"
                height={height ?? "220px"}
                index=""
                label={label}
                lineCountMessage=""
                onChange={onChange}
                readOnly={!onChange}
                showHeader={false}
                value={value}
              />
            </TabsContent>

            <TabsContent className="m-0" value="claims" variant="flush">
              <JwtClaimsBreakdown
                height={height ?? "220px"}
                jsonValue={value}
                type={claimType}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <section
            className={cn(
              colorizeToken && "flex h-full min-h-0 flex-1 flex-col"
            )}
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2">
              <h2 className="font-medium text-sm">{label}</h2>
              {renderInlineActions()}
            </header>
            {colorizeToken ? (
              <InlineTokenInput
                label={label}
                minHeight={minHeight}
                onChange={onChange}
                placeholder={placeholder}
                value={value}
              />
            ) : (
              <Textarea
                aria-label={label}
                className="min-h-[var(--min-height,160px)] resize-y break-all"
                onChange={(event) => onChange?.(event.target.value)}
                placeholder={placeholder}
                readOnly={!onChange}
                spellCheck={false}
                // SAFETY: CSS custom property for dynamic min-height
                style={
                  {
                    "--min-height": minHeight ?? "160px",
                  } as React.CSSProperties
                }
                value={value}
                variant="ghost-mono"
              />
            )}
            {colorizeToken && <TokenLegend />}
            {footer}
          </section>
        )}
      </div>

      <Dialog onOpenChange={setExpanded} open={expanded}>
        <DialogContent
          className="flex h-[85vh] max-h-[820px] sm:max-w-4xl lg:max-w-5xl"
          variant="pane"
        >
          <div className="jwt-inspector-scrollbars flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            {json ? (
              <JwtDialogJsonView
                byteCount={byteCount}
                claimType={claimType}
                copied={copied}
                copyAriaLabel={copyAriaLabel}
                copyLabel={copyLabel}
                copyValue={copyValue}
                description={description}
                formatJson={formatJson}
                isEditable={isEditable}
                isValidJson={isValidJson}
                label={label}
                lineCount={lineCount}
                modalTab={modalTab}
                onChange={onChange}
                onClose={() => setExpanded(false)}
                setModalTab={setModalTab}
                value={value}
              />
            ) : (
              <JwtDialogPlainView
                byteCount={byteCount}
                colorizeToken={colorizeToken}
                copied={copied}
                copyAriaLabel={copyAriaLabel}
                copyLabel={copyLabel}
                copyValue={copyValue}
                description={description}
                label={label}
                lineCount={lineCount}
                onChange={onChange}
                onClose={() => setExpanded(false)}
                placeholder={placeholder}
                value={value}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
