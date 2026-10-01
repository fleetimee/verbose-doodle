import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DeveloperToolLayout } from "@/features/developer-tools/components/developer-tool-layout";
import { MerchantCodeSelect } from "@/features/developer-tools/tools/qris-creator/components/merchant-code-select";
import {
  createQris,
  QRIS_CREATOR_EMPTY,
  QRIS_CREATOR_SAMPLE,
  type QrisCreatorInput,
} from "@/features/developer-tools/tools/qris-creator/create-qris";
import {
  type ImportedQris,
  importQris,
} from "@/features/developer-tools/tools/qris-creator/import-qris";
import {
  loadQrisLogo,
  renderQrisPng,
  renderQrisQr,
} from "@/features/developer-tools/tools/qris-creator/render-qris-qr";
import { QrImageInput } from "@/features/developer-tools/tools/qris-parser/components/qr-image-input";
import { formatQrisAmount } from "@/features/developer-tools/tools/qris-parser/format-qris-amount";
import { copyToClipboard } from "@/lib/clipboard";
import { messages } from "@/lib/i18n";

const limits = {
  merchantName: 25,
  merchantCity: 15,
  merchantCategoryCode: 4,
  postalCode: 10,
  providerGuid: 32,
  merchantPan: 19,
  merchantId: 25,
  nationalMerchantId: 15,
  merchantCriteria: 3,
  amount: 13,
  reference: 25,
  terminal: 25,
};
type TextField = keyof typeof limits;

function download(src: string, filename: string) {
  const link = document.createElement("a");
  link.href = src;
  link.download = filename;
  link.click();
}

function brandingStatus(
  branded: boolean,
  logo: string | undefined,
  failed: boolean
) {
  const copy = messages.developerTools.qrisCreator;
  if (!branded) {
    return "";
  }
  if (failed) {
    return copy.logoFailed;
  }
  return logo ? "" : copy.logoLoading;
}

export function QrisCreator() {
  useI18n();
  const copy = messages.developerTools.qrisCreator;
  const [input, setInput] = useState({ ...QRIS_CREATOR_SAMPLE });
  const [imported, setImported] = useState<ImportedQris>();
  const [importError, setImportError] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageRevision, setImageRevision] = useState(0);
  function decodeImport(payload: string) {
    try {
      const decoded = importQris(payload);
      setImported(decoded);
      setInput({ ...decoded.input });
      setImportError(false);
      setStatus(null);
    } catch {
      setImportError(true);
    }
  }
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"copied" | "failed" | null>(null);
  const [branded, setBranded] = useState(true);
  const [logo, setLogo] = useState<string>();
  const [logoFailed, setLogoFailed] = useState(false);
  useEffect(() => {
    let active = true;
    loadQrisLogo()
      .then((value) => {
        if (active) {
          setLogo(value);
        }
      })
      .catch(() => {
        if (active) {
          setLogoFailed(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const result = useMemo(() => createQris(input, imported), [input, imported]);
  const previewLogo = branded ? logo : undefined;
  const exportBlocked = imageBusy || (branded && !logo);
  const qr = useMemo(() => {
    if (!result.payload) {
      return null;
    }
    try {
      return renderQrisQr(result.payload, previewLogo);
    } catch {
      return null;
    }
  }, [result.payload, previewLogo]);
  const fictional =
    input.providerGuid === QRIS_CREATOR_SAMPLE.providerGuid &&
    input.merchantPan === QRIS_CREATOR_SAMPLE.merchantPan;
  function replace(value: QrisCreatorInput) {
    setInput({ ...value });
    setImported(undefined);
    setImportError(false);
    setImageBusy(false);
    setImageRevision((revision) => revision + 1);
    setStatus(null);
  }
  function accountReadOnly(key: TextField) {
    if (!imported) {
      return false;
    }
    if (["providerGuid", "merchantPan", "merchantId"].includes(key)) {
      return !imported.accountTag;
    }
    if (key === "nationalMerchantId") {
      return !imported.nationalTag;
    }
    return (
      key === "merchantCriteria" &&
      !(imported.accountTag || imported.nationalTag)
    );
  }
  function field(key: TextField) {
    const error = result.errors[key];
    const id = `qris-create-${key}`;
    return (
      <Field data-invalid={Boolean(error)} key={key}>
        <FieldLabel htmlFor={id}>{copy[key]}</FieldLabel>
        {(key === "merchantCriteria" || key === "merchantCategoryCode") && (
          <MerchantCodeSelect
            describedBy={error ? `${id}-error` : undefined}
            disabled={accountReadOnly(key)}
            id={id}
            invalid={Boolean(error)}
            key={`${key}-${imageBusy}`}
            kind={key}
            onChange={(value) => {
              setInput((current) => ({ ...current, [key]: value }));
              setStatus(null);
            }}
            value={input[key]}
          />
        )}
        {key !== "merchantCriteria" && key !== "merchantCategoryCode" && (
          <Input
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={Boolean(error)}
            disabled={
              accountReadOnly(key) ||
              (key === "amount" && input.mode === "static")
            }
            id={id}
            inputMode={
              ["amount", "merchantPan", "merchantCategoryCode"].includes(key)
                ? "decimal"
                : "text"
            }
            maxLength={limits[key]}
            onChange={(event) => {
              setInput((current) => ({
                ...current,
                [key]: event.target.value,
              }));
              setStatus(null);
            }}
            size="sm"
            value={input[key]}
            variant="muted-mono"
          />
        )}
        {key === "merchantCategoryCode" && (
          <p className="text-muted-foreground text-xs" id={`${id}-hint`}>
            {copy.mccHint}
          </p>
        )}
        {error && (
          <p className="text-destructive text-xs" id={`${id}-error`}>
            {copy[error]}
          </p>
        )}
      </Field>
    );
  }
  async function exportPng() {
    if (!result.payload) {
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      download(
        await renderQrisPng(result.payload, previewLogo),
        "qris-mpm.png"
      );
    } catch {
      setStatus("failed");
    } finally {
      setSaving(false);
    }
  }
  return (
    <DeveloperToolLayout
      className="min-h-0 flex-1 gap-4 pb-4 [&>header]:shrink-0 [&>header]:border-b-0 [&>header]:pb-2"
      clearLabel={copy.clear}
      description={copy.description}
      mainClassName="flex min-h-0 flex-1 flex-col"
      onClear={() => replace(QRIS_CREATOR_EMPTY)}
      title={copy.title}
    >
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[minmax(0,1fr)]">
        <section
          aria-label={copy.details}
          className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card"
        >
          <ScrollArea
            className="min-h-0 flex-1"
            contentClassName="p-4"
            variant="fit"
          >
            <details
              className="mb-4 border-b pb-3"
              open={Boolean(imported) || imageBusy || importError}
            >
              <summary className="cursor-pointer font-medium text-sm">
                {copy.importImage}
              </summary>
              <div className="mt-3">
                <QrImageInput
                  key={imageRevision}
                  onDecode={decodeImport}
                  onProcessing={setImageBusy}
                  onRemove={() => {
                    setImageRevision((revision) => revision + 1);
                    setImageBusy(false);
                  }}
                />
              </div>
              {importError && (
                <p className="mt-2 text-destructive text-xs" role="alert">
                  {copy.importInvalid}
                </p>
              )}
              {imported && (
                <>
                  <p className="mt-2 text-muted-foreground text-xs">
                    {copy.importedNote}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">
                      {copy.importedFields}
                    </summary>
                    <dl className="mt-2 space-y-2 text-xs">
                      {imported.fields
                        .flatMap((field) => [field, ...field.children])
                        .map((field) => (
                          <div key={field.path}>
                            <dt className="font-mono text-muted-foreground">
                              {field.path} · {field.length}
                            </dt>
                            <dd className="break-all font-mono">
                              {field.value}
                            </dd>
                          </div>
                        ))}
                    </dl>
                  </details>
                </>
              )}
            </details>
            <fieldset
              aria-busy={imageBusy}
              className="min-w-0"
              disabled={imageBusy}
            >
              <h2 className="mb-3 font-semibold text-sm">{copy.details}</h2>
              <fieldset
                aria-label={messages.developerTools.qris.mode}
                className="mb-4 flex gap-1"
              >
                {(["static", "dynamic"] as const).map((mode) => (
                  <Button
                    aria-pressed={input.mode === mode}
                    key={mode}
                    onClick={() => {
                      setInput((current) => ({ ...current, mode }));
                      setStatus(null);
                    }}
                    size="sm"
                    variant={input.mode === mode ? "default" : "outline"}
                  >
                    {copy[mode]}
                  </Button>
                ))}
              </fieldset>
              <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {field("merchantName")}
                {field("merchantCity")}
                {field("merchantCategoryCode")}
                {field("amount")}
              </FieldGroup>
              <p className="mt-2 text-muted-foreground text-xs">
                {copy.amountHint}
              </p>
              <div className="my-4 border-t" />
              <h3 className="mb-2 font-semibold text-sm">{copy.account}</h3>
              <p className="mb-3 text-muted-foreground text-xs leading-relaxed">
                {copy.hint}
              </p>
              <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {field("providerGuid")}
                {field("merchantPan")}
                {field("nationalMerchantId")}
                {field("merchantCriteria")}
              </FieldGroup>
              <details className="mt-4 border-t pt-3">
                <summary className="cursor-pointer font-medium text-sm">
                  {copy.optional}
                </summary>
                <FieldGroup className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {field("merchantId")}
                  {field("postalCode")}
                  {field("reference")}
                  {field("terminal")}
                </FieldGroup>
              </details>
              <details className="mt-4 border-t pt-3">
                <summary className="cursor-pointer font-medium text-sm">
                  {copy.how}
                </summary>
                <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                  {copy.explanation}
                </p>
              </details>
            </fieldset>
          </ScrollArea>
        </section>
        <section
          aria-label={copy.preview}
          className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
            <h2 className="font-semibold text-sm">{copy.preview}</h2>
            <div className="flex items-center gap-2">
              <FieldLabel htmlFor="qris-branding">{copy.branding}</FieldLabel>
              <Switch
                checked={branded}
                disabled={imageBusy || saving}
                id="qris-branding"
                onCheckedChange={(checked) => {
                  setBranded(checked);
                  setStatus(null);
                }}
              />
            </div>
          </div>
          <ScrollArea
            className="min-h-0 flex-1"
            contentClassName="flex min-h-full flex-col"
            variant="fit"
          >
            {qr ? (
              <>
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
                  <img
                    alt={copy.scan}
                    className="aspect-square w-full max-w-80 shrink-0 rounded-sm border"
                    height={320}
                    src={qr.src}
                    width={320}
                  />
                  <div className="text-center">
                    <p className="font-semibold text-sm">
                      {input.merchantName.trim()}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {input.merchantCity.trim()}
                    </p>
                    <p className="mt-1 font-mono text-sm">
                      {input.mode === "dynamic"
                        ? formatQrisAmount(input.amount.trim(), "360")
                        : copy.noAmount}
                    </p>
                  </div>
                  {fictional && (
                    <p className="text-muted-foreground text-xs">
                      {copy.fictional}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      disabled={saving || exportBlocked}
                      onClick={exportPng}
                      size="sm"
                      variant="outline"
                    >
                      {saving ? copy.saving : copy.png}
                    </Button>
                    <Button
                      disabled={exportBlocked}
                      onClick={() => download(qr.src, "qris-mpm.svg")}
                      size="sm"
                      variant="outline"
                    >
                      {copy.svg}
                    </Button>
                  </div>
                </div>
                <div className="border-t p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <FieldLabel htmlFor="created-qris-payload">
                      {copy.payload}
                    </FieldLabel>
                    <Button
                      disabled={imageBusy}
                      onClick={async () =>
                        setStatus(
                          (await copyToClipboard(result.payload ?? ""))
                            ? "copied"
                            : "failed"
                        )
                      }
                      size="sm"
                      variant="ghost"
                    >
                      {copy.copy}
                    </Button>
                  </div>
                  <Textarea
                    className="field-sizing-fixed min-h-24 resize-y font-mono text-xs"
                    id="created-qris-payload"
                    readOnly
                    value={result.payload ?? ""}
                  />
                </div>
              </>
            ) : (
              <p className="flex flex-1 items-center justify-center p-8 text-center text-muted-foreground text-sm">
                {result.payload ? copy.qrTooLarge : copy.empty}
              </p>
            )}
            <p
              aria-live="polite"
              className="px-4 pb-3 text-muted-foreground text-xs"
            >
              {status
                ? copy[status]
                : brandingStatus(branded, logo, logoFailed)}
            </p>
          </ScrollArea>
        </section>
      </div>
    </DeveloperToolLayout>
  );
}
