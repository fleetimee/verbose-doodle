import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ClipboardCopy } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import {
  renderQrisPng,
  renderQrisQr,
} from "@/features/developer-tools/tools/qris-creator/render-qris-qr";
import { QrImageInput } from "@/features/developer-tools/tools/qris-parser/components/qr-image-input";
import { formatQrisAmount } from "@/features/developer-tools/tools/qris-parser/format-qris-amount";
import {
  parseQris,
  QRIS_DYNAMIC_SAMPLE,
  QRIS_SAMPLE,
  type QrisField,
  type QrisParseError,
} from "@/features/developer-tools/tools/qris-parser/parse-qris";
import { copyToClipboard } from "@/lib/clipboard";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function CopyButton({
  value,
  label,
  className,
}: {
  readonly value: string;
  readonly label?: string;
  readonly className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const ok = await copyToClipboard(value);
      if (ok) {
        setCopied(true);
        toast.success(
          label
            ? formatMessage(messages.developerTools.qris.copiedNamed, {
                name: label,
              })
            : messages.developerTools.qris.copied
        );
        setTimeout(() => setCopied(false), 1500);
      } else {
        toast.error(messages.developerTools.qris.copyFailed);
      }
    } catch {
      toast.error(messages.developerTools.qris.copyFailed);
    }
  };

  return (
    <Button
      aria-label={
        label ? `Copy ${label}` : messages.developerTools.qris.copyValue
      }
      className={cn(
        "size-6 shrink-0 text-muted-foreground hover:text-foreground",
        className
      )}
      onClick={handleCopy}
      size="icon-xs"
      type="button"
      variant="ghost"
    >
      {copied ? (
        <Check className="size-3 text-primary" />
      ) : (
        <ClipboardCopy className="size-3" />
      )}
    </Button>
  );
}

function download(src: string, filename: string) {
  const link = document.createElement("a");
  link.href = src;
  link.download = filename;
  link.click();
}

function fieldLabel(field: QrisField): string {
  const copy = messages.developerTools.qris;
  const parent = field.path.split(".")[0];
  if (field.path.includes(".")) {
    if (parent === "62") {
      return (
        copy.additionalLabels[field.id as keyof typeof copy.additionalLabels] ??
        copy.unknownField
      );
    }
    if (parent === "64") {
      return (
        copy.languageLabels[field.id as keyof typeof copy.languageLabels] ??
        copy.unknownField
      );
    }
    return field.id === "00" ? copy.guid : copy.unknownField;
  }
  if (field.id === "62") {
    return copy.additional;
  }
  if (field.id === "64") {
    return copy.language;
  }
  if (Number(field.id) >= 2 && Number(field.id) <= 51) {
    return copy.account;
  }
  if (Number(field.id) >= 80) {
    return copy.unreserved;
  }
  return copy.labels[field.id as keyof typeof copy.labels] ?? copy.unknownField;
}

function fieldColor(field: QrisField): string {
  const tag = field.path.split(".")[0];
  return `qris-color-${Number(tag) % 8}`;
}

function PayloadSegments({
  fields,
}: {
  readonly fields: readonly QrisField[];
}) {
  return fields.map((field) => (
    <span className={fieldColor(field)} key={field.path}>
      <span className="font-bold">
        {field.id}
        {String(field.length).padStart(2, "0")}
      </span>
      {field.value}
    </span>
  ));
}

function FieldRows({ fields }: { readonly fields: readonly QrisField[] }) {
  return fields.map((field) => (
    <tbody className="border-t" key={field.path}>
      <tr className={cn("group/row", fieldColor(field))}>
        <td className="px-3 py-2 font-mono font-semibold">{field.path}</td>
        <td className="px-3 py-2">{fieldLabel(field)}</td>
        <td className="px-3 py-2 text-right font-mono text-muted-foreground">
          {field.length}
        </td>
        <td className="max-w-64 break-all px-3 py-2 font-mono">
          {field.children.length ? (
            <details>
              <summary className="cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
                <span className="select-text">{field.value}</span>
              </summary>
              <dl className="mt-2 space-y-2 border-t pt-2">
                {field.children.map((child) => (
                  <div
                    className="group/child flex items-center justify-between gap-2"
                    key={child.path}
                  >
                    <div className="min-w-0">
                      <dt className="font-semibold">
                        {child.path} · {fieldLabel(child)}
                      </dt>
                      <dd className="select-text">{child.value}</dd>
                    </div>
                    <CopyButton
                      className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/child:opacity-100"
                      label={`${fieldLabel(child)} (${child.path})`}
                      value={child.value}
                    />
                  </div>
                ))}
              </dl>
            </details>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 select-text">{field.value}</span>
              <CopyButton
                className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/row:opacity-100"
                label={`${fieldLabel(field)} (${field.path})`}
                value={field.value}
              />
            </div>
          )}
        </td>
      </tr>
    </tbody>
  ));
}

function MerchantSummary({
  result,
  payload,
  qrSrc,
}: {
  readonly result: ReturnType<typeof parseQris>;
  readonly payload: string;
  readonly qrSrc?: string | null;
}) {
  const copy = messages.developerTools.qris;
  const [savingPng, setSavingPng] = useState(false);

  return (
    <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center">
      {qrSrc ? (
        <div className="flex shrink-0 justify-center">
          <Dialog>
            <DialogTrigger
              aria-label={copy.viewQr}
              className="group relative cursor-pointer rounded-md border bg-white p-1 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <img
                alt={copy.scan}
                className="size-24 shrink-0 rounded-sm"
                height={96}
                src={qrSrc}
                width={96}
              />
            </DialogTrigger>
            <DialogContent
              className="flex flex-col items-center gap-4 text-center"
              size="sm"
            >
              <DialogHeader className="items-center text-center">
                <DialogTitle className="font-semibold text-base">
                  {result.merchant || copy.title}
                </DialogTitle>
                {result.city ? (
                  <DialogDescription className="text-xs">
                    {result.city}
                  </DialogDescription>
                ) : null}
              </DialogHeader>
              <div className="rounded-lg border bg-white p-3 shadow-xs">
                <img
                  alt={copy.scan}
                  className="aspect-square size-64 max-w-full rounded-sm"
                  height={256}
                  src={qrSrc}
                  width={256}
                />
              </div>
              <div className="text-center">
                <p className="font-medium font-mono text-sm">
                  {result.amount
                    ? formatQrisAmount(result.amount, result.currency)
                    : copy.noAmount}
                </p>
                <p className="text-muted-foreground text-xs">
                  {copy[result.mode as "static" | "dynamic" | "unknown"]}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  disabled={savingPng}
                  onClick={async () => {
                    setSavingPng(true);
                    try {
                      download(await renderQrisPng(payload), "qris-mpm.png");
                    } finally {
                      setSavingPng(false);
                    }
                  }}
                  size="sm"
                  variant="outline"
                >
                  {copy.png}
                </Button>
                <Button
                  onClick={() => download(qrSrc, "qris-mpm.svg")}
                  size="sm"
                  variant="outline"
                >
                  {copy.svg}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : null}
      <dl className="grid flex-1 grid-cols-2 gap-3 text-sm">
        {[
          [copy.merchant, result.merchant, result.merchant],
          [copy.city, result.city, result.city],
          [
            copy.mode,
            copy[result.mode as "static" | "dynamic" | "unknown"],
            copy[result.mode as "static" | "dynamic" | "unknown"],
          ],
          [
            copy.amount,
            result.amount
              ? formatQrisAmount(result.amount, result.currency)
              : copy.noAmount,
            result.amount
              ? formatQrisAmount(result.amount, result.currency)
              : undefined,
          ],
        ].map(([label, displayText, copyValue]) => (
          <div className="group/item min-w-0" key={label}>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="mt-1 flex items-center justify-between gap-1 break-all font-medium">
              <span className="min-w-0">{displayText ?? "—"}</span>
              {copyValue ? (
                <CopyButton
                  className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/item:opacity-100"
                  label={label}
                  value={copyValue}
                />
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function QrisParser() {
  useI18n();
  const copy = messages.developerTools.qris;
  const payloadHighlight = useRef<HTMLPreElement>(null);
  const [source, setSource] = useState(QRIS_SAMPLE);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageRevision, setImageRevision] = useState(0);
  function changeSource(value: string) {
    setSource(value);
    setImageBusy(false);
    setImageRevision((revision) => revision + 1);
  }
  const parsed = useMemo(() => {
    if (!source.trim()) {
      return null;
    }
    try {
      return { result: parseQris(source), error: null };
    } catch (error) {
      return { result: null, error: error as QrisParseError };
    }
  }, [source]);
  const qr = useMemo(() => {
    if (!source.trim()) {
      return null;
    }
    try {
      return renderQrisQr(source);
    } catch {
      return null;
    }
  }, [source]);
  const result = parsed?.result;
  const error = parsed?.error;
  const errorText = error
    ? formatMessage(
        copy[error.code === "length" ? "lengthError" : error.code],
        { path: error.path }
      )
    : null;

  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4 [&>header]:border-b-0 [&>header]:pb-2"
      clearLabel={copy.clear}
      description={copy.description}
      extraActions={
        <>
          <Button
            onClick={() => changeSource(QRIS_SAMPLE)}
            size="sm"
            variant="tool-action"
          >
            {copy.sample}
          </Button>
          <Button
            onClick={() => changeSource(QRIS_DYNAMIC_SAMPLE)}
            size="sm"
            variant="tool-action"
          >
            {copy.dynamicSample}
          </Button>
        </>
      }
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={() => changeSource("")}
      title={copy.title}
    >
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="flex min-h-0 min-w-0 flex-col gap-3 rounded-xl border border-border/70 p-4">
          <QrImageInput
            key={imageRevision}
            onDecode={setSource}
            onProcessing={setImageBusy}
            onRemove={() => changeSource("")}
          />
          <Label htmlFor="qris-payload">{copy.input}</Label>
          <div className="relative min-h-40 flex-1 overflow-hidden rounded-md bg-muted/10">
            {result ? (
              <pre
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-all border border-transparent px-3 py-2 font-mono text-xs leading-6"
                ref={payloadHighlight}
              >
                {source.slice(0, source.length - source.trimStart().length)}
                <PayloadSegments fields={result.fields} />
                {source.slice(source.trimEnd().length)}
              </pre>
            ) : null}
            <Textarea
              aria-busy={imageBusy}
              aria-describedby={error ? "qris-error" : undefined}
              aria-invalid={Boolean(error)}
              className={cn(
                "field-sizing-fixed relative h-full min-h-40 w-full resize-none break-all bg-transparent text-xs md:text-xs dark:bg-transparent",
                result &&
                  "text-transparent caret-foreground selection:bg-blue-500/25 selection:text-transparent"
              )}
              disabled={imageBusy}
              id="qris-payload"
              onChange={(event) => changeSource(event.target.value)}
              onScroll={(event) => {
                if (payloadHighlight.current) {
                  payloadHighlight.current.scrollTop =
                    event.currentTarget.scrollTop;
                  payloadHighlight.current.scrollLeft =
                    event.currentTarget.scrollLeft;
                }
              }}
              placeholder={copy.placeholder}
              value={source}
              variant="mono-muted"
            />
          </div>
          {errorText ? (
            <p
              className="text-destructive text-sm"
              id="qris-error"
              role="alert"
            >
              {errorText}
            </p>
          ) : null}
          <details className="border-t pt-3 text-sm">
            <summary className="cursor-pointer rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
              {copy.how}
            </summary>
            <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
              {copy.explanation}
            </p>
            <div className="mt-2 flex gap-3 text-primary text-xs">
              <a
                className="underline underline-offset-4"
                href="https://www.emvco.com/emv-technologies/qr-codes/"
                rel="noreferrer"
                target="_blank"
              >
                EMVCo
              </a>
              <a
                className="underline underline-offset-4"
                href="https://www.bi.go.id/en/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/qris/default.aspx"
                rel="noreferrer"
                target="_blank"
              >
                Bank Indonesia
              </a>
            </div>
          </details>
        </section>
        <section
          aria-label={copy.fields}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-border/70"
        >
          <h2 className="border-b bg-muted/10 px-4 py-3 font-semibold text-sm">
            {copy.fields}
          </h2>
          {result ? (
            <>
              <MerchantSummary
                payload={source}
                qrSrc={qr?.src}
                result={result}
              />
              <div
                aria-live="polite"
                className="space-y-1 border-b px-4 py-3 text-xs"
              >
                <p
                  className={
                    result.crcValid
                      ? "font-semibold text-[#08783e] dark:text-[#4dff91]"
                      : "font-medium text-destructive"
                  }
                >
                  {result.crcValid ? copy.crcValid : copy.crcInvalid}
                </p>
                <p className="font-mono text-muted-foreground">
                  {formatMessage(copy.crcDetail, {
                    actual: result.actualCrc ?? "—",
                    expected: result.expectedCrc ?? "—",
                  })}
                </p>
                {result.profileMatches ? null : (
                  <p className="text-destructive">{copy.profile}</p>
                )}
                {result.missing.length ? (
                  <p className="text-destructive">
                    {formatMessage(copy.missing, {
                      tags: result.missing.join(", "),
                    })}
                  </p>
                ) : null}
              </div>
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/10 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">{copy.tag}</th>
                      <th className="px-3 py-2 font-medium">{copy.fields}</th>
                      <th className="px-3 py-2 text-right font-medium">
                        {copy.length}
                      </th>
                      <th className="px-3 py-2 font-medium">{copy.value}</th>
                    </tr>
                  </thead>
                  <FieldRows fields={result.fields} />
                </table>
              </div>
            </>
          ) : (
            <p className="grid flex-1 place-items-center px-4 py-10 text-center text-muted-foreground text-sm">
              {copy.empty}
            </p>
          )}
        </section>
      </div>
    </DeveloperToolLayout>
  );
}
