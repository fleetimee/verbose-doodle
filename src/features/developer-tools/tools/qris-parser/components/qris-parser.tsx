import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import { QrImageInput } from "@/features/developer-tools/tools/qris-parser/components/qr-image-input";
import { formatQrisAmount } from "@/features/developer-tools/tools/qris-parser/format-qris-amount";
import {
  parseQris,
  QRIS_DYNAMIC_SAMPLE,
  QRIS_SAMPLE,
  type QrisField,
  type QrisParseError,
} from "@/features/developer-tools/tools/qris-parser/parse-qris";
import { formatMessage, messages } from "@/lib/i18n";

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

function FieldRows({ fields }: { readonly fields: readonly QrisField[] }) {
  return fields.map((field) => (
    <tbody className="border-t" key={field.path}>
      <tr>
        <td className="px-3 py-2 font-mono text-muted-foreground">
          {field.path}
        </td>
        <td className="px-3 py-2">{fieldLabel(field)}</td>
        <td className="px-3 py-2 text-right font-mono text-muted-foreground">
          {field.length}
        </td>
        <td className="max-w-64 break-all px-3 py-2 font-mono">
          {field.children.length ? (
            <details>
              <summary className="cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
                {field.value}
              </summary>
              <dl className="mt-2 space-y-2 border-t pt-2">
                {field.children.map((child) => (
                  <div key={child.path}>
                    <dt className="text-muted-foreground">
                      {child.path} · {fieldLabel(child)}
                    </dt>
                    <dd>{child.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ) : (
            field.value
          )}
        </td>
      </tr>
    </tbody>
  ));
}

function MerchantSummary({
  result,
}: {
  readonly result: ReturnType<typeof parseQris>;
}) {
  const copy = messages.developerTools.qris;
  return (
    <dl className="grid grid-cols-2 gap-3 border-b p-4 text-sm">
      {[
        [copy.merchant, result.merchant ?? "—"],
        [copy.city, result.city ?? "—"],
        [copy.mode, copy[result.mode as "static" | "dynamic" | "unknown"]],
        [
          copy.amount,
          result.amount
            ? formatQrisAmount(result.amount, result.currency)
            : copy.noAmount,
        ],
      ].map(([label, value]) => (
        <div key={label}>
          <dt className="text-muted-foreground text-xs">{label}</dt>
          <dd className="mt-1 break-all font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function QrisParser() {
  useI18n();
  const copy = messages.developerTools.qris;
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
          <Textarea
            aria-busy={imageBusy}
            aria-describedby={error ? "qris-error" : "qris-local"}
            aria-invalid={Boolean(error)}
            className="field-sizing-fixed min-h-40 flex-1 resize-y lg:resize-none"
            disabled={imageBusy}
            id="qris-payload"
            onChange={(event) => changeSource(event.target.value)}
            placeholder={copy.placeholder}
            value={source}
            variant="mono-muted"
          />
          <p className="text-muted-foreground text-xs" id="qris-local">
            {copy.local}
          </p>
          {source === QRIS_SAMPLE || source === QRIS_DYNAMIC_SAMPLE ? (
            <p className="text-muted-foreground text-xs">{copy.sampleNote}</p>
          ) : null}
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
              <MerchantSummary result={result} />
              <div
                aria-live="polite"
                className="space-y-1 border-b px-4 py-3 text-xs"
              >
                <p
                  className={
                    result.crcValid
                      ? "font-medium"
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
