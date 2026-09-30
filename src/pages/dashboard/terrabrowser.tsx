import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { GameFullscreenButton } from "@/components/game-fullscreen-button";
import { FileJson, Globe, Info, Users } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Spinner } from "@/components/ui/spinner";
import { formatMessage } from "@/lib/i18n";

type SaveSummary = { id: string; name: string };
type BackupCatalog = { characters: SaveSummary[]; worlds: SaveSummary[] };
type BackupSelection = { characters: string[]; worlds: string[] };
type BackupBridge = {
  list: () => Promise<BackupCatalog>;
  inspect: (text: string) => BackupCatalog;
  export: (selection: BackupSelection) => Promise<string>;
  import: (
    text: string,
    selection: BackupSelection
  ) => Promise<{ characters: number; worlds: number }>;
};
type BackupPicker = {
  mode: "export" | "import";
  catalog: BackupCatalog;
  text?: string;
  fileName?: string;
};

const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

export function TerrabrowserPage() {
  const { messages } = useI18n();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const copy = messages.common;
  const fieldId = useId();
  const [picker, setPicker] = useState<BackupPicker | null>(null);
  const [selection, setSelection] = useState<BackupSelection>({
    characters: [],
    worlds: [],
  });
  const selectionCount = selection.characters.length + selection.worlds.length;
  const importing = picker?.mode === "import";
  const confirmLabel = importing
    ? copy.backupImportSelected
    : copy.backupExportSelected;
  const pendingLabel = importing ? copy.backupImporting : copy.backupExporting;

  function getBridge() {
    const frame = frameRef.current?.contentWindow as
      | (Window & { terrabrowserBackup?: BackupBridge })
      | null;
    if (!frame?.terrabrowserBackup) {
      throw new Error("backupBusy");
    }
    return frame.terrabrowserBackup;
  }

  function showError(error: unknown) {
    const errors: Record<string, string> = {
      backupBusy: copy.backupBusy,
      backupMenuRequired: copy.backupMenuRequired,
      backupInvalid: copy.backupInvalid,
      backupStorageFailed: copy.backupStorageFailed,
      backupSaveFailed: copy.backupSaveFailed,
      backupSelectionRequired: copy.backupSelectHint,
    };
    // Errors from the game iframe belong to a different JavaScript realm.
    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
        ? error.message
        : "";
    toast.error(errors[message] ?? copy.backupFailed);
  }

  async function openExport() {
    setBusy(true);
    try {
      const catalog = await getBridge().list();
      setSelection({ characters: [], worlds: [] });
      setPicker({ mode: "export", catalog });
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }

  async function confirmSelection() {
    if (!picker || selectionCount === 0) {
      return;
    }
    setBusy(true);
    try {
      if (picker.mode === "import") {
        if (picker.text === undefined) {
          return;
        }
        await getBridge().import(picker.text, selection);
        toast.success(copy.backupImported);
        setPicker(null);
        return;
      }
      const text = await getBridge().export(selection);
      const url = URL.createObjectURL(
        new Blob([text], { type: "application/json" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `terrabrowser-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setPicker(null);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }

  async function importGame(file: File) {
    setBusy(true);
    try {
      if (file.size > MAX_BACKUP_BYTES) {
        throw new Error("backupInvalid");
      }
      const text = await file.text();
      const catalog = getBridge().inspect(text);
      setSelection({ characters: [], worlds: [] });
      setPicker({ mode: "import", catalog, text, fileName: file.name });
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-border/40 border-b pb-3">
        <div>
          <h1 className="font-semibold text-xl tracking-tight">
            {messages.common.terrabrowserTitle}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {messages.common.terrabrowserDescription}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <GameFullscreenButton frameRef={frameRef} />
          <ButtonGroup aria-label={copy.backupActions}>
            <Button
              disabled={!ready || busy}
              onClick={openExport}
              size="xs"
              variant="outline"
            >
              {copy.backupExport}
            </Button>
            <Button
              disabled={!ready || busy}
              onClick={() => fileRef.current?.click()}
              size="xs"
              variant="outline"
            >
              {copy.backupImport}
            </Button>
          </ButtonGroup>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                aria-label={copy.backupInfo}
                size="icon-xs"
                variant="ghost"
              >
                <Info aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <p className="text-sm">{copy.backupHint}</p>
              <p className="mt-2 text-muted-foreground text-xs">
                {copy.backupImportHint}
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <input
          accept=".json,application/json"
          aria-label={copy.backupImport}
          className="hidden"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) {
              importGame(file);
            }
          }}
          ref={fileRef}
          type="file"
        />
      </header>
      <Dialog
        onOpenChange={(open) => {
          if (!(open || busy)) {
            setPicker(null);
          }
        }}
        open={picker !== null}
      >
        <DialogContent
          className="max-h-[90dvh]"
          showCloseButton={!busy}
          size="xl"
          variant="pane"
        >
          <DialogHeader className="shrink-0" variant="banner">
            <div className="min-w-0">
              <DialogTitle size="sm">
                {picker?.mode === "import"
                  ? copy.backupImportTitle
                  : copy.backupExportTitle}
              </DialogTitle>
              <DialogDescription className="mt-1.5" size="xs">
                {picker?.mode === "import"
                  ? copy.backupImportHint
                  : copy.backupSelectHint}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex min-w-0 shrink-0 items-center gap-2 border-b px-6 py-2.5 text-muted-foreground text-xs">
            <FileJson aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate" title={picker?.fileName}>
              {picker?.fileName ?? copy.backupSource}
            </span>
          </div>
          <FieldGroup
            className="max-h-[50dvh] min-h-0 overflow-y-auto px-6 py-5"
            size="compact"
          >
            {(["characters", "worlds"] as const).map((kind) => {
              const saves = picker?.catalog[kind] ?? [];
              const label =
                kind === "characters"
                  ? copy.backupCharacters
                  : copy.backupWorlds;
              const Icon = kind === "characters" ? Users : Globe;
              const allSelected =
                saves.length > 0 && selection[kind].length === saves.length;
              return (
                <FieldSet className="gap-2" disabled={busy} key={kind}>
                  <FieldLegend
                    className="mb-2 flex w-full items-center justify-between gap-3"
                    variant="label"
                  >
                    <span className="flex items-center gap-2">
                      <Icon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                      {label}
                      <Badge size="sm" variant="muted">
                        {saves.length}
                      </Badge>
                    </span>
                    <Button
                      aria-label={formatMessage(
                        allSelected
                          ? copy.backupClearGroup
                          : copy.backupSelectGroup,
                        { group: label }
                      )}
                      disabled={busy || saves.length === 0}
                      onClick={() =>
                        setSelection((current) => ({
                          ...current,
                          [kind]: allSelected
                            ? []
                            : saves.map((save) => save.id),
                        }))
                      }
                      size="xs"
                      variant="ghost"
                    >
                      {allSelected ? copy.backupClear : copy.backupSelectAll}
                    </Button>
                  </FieldLegend>
                  <FieldGroup size="sm">
                    {saves.length === 0 ? (
                      <FieldDescription className="py-2">
                        {copy.backupNoSaves}
                      </FieldDescription>
                    ) : null}
                    {saves.map((save, index) => (
                      <Field
                        data-disabled={busy}
                        key={save.id}
                        orientation="horizontal"
                        variant="card"
                      >
                        <Checkbox
                          checked={selection[kind].includes(save.id)}
                          disabled={busy}
                          id={`${fieldId}-${kind}-${index}`}
                          onCheckedChange={(checked) => {
                            setSelection((current) => ({
                              ...current,
                              [kind]: checked
                                ? [...current[kind], save.id]
                                : current[kind].filter((id) => id !== save.id),
                            }));
                          }}
                        />
                        <FieldLabel
                          className="min-w-0 flex-1 break-words"
                          htmlFor={`${fieldId}-${kind}-${index}`}
                        >
                          {save.name}
                        </FieldLabel>
                      </Field>
                    ))}
                  </FieldGroup>
                </FieldSet>
              );
            })}
          </FieldGroup>
          <DialogFooter
            className="shrink-0 items-center sm:justify-between"
            variant="pane"
          >
            <p aria-live="polite" className="text-muted-foreground text-xs">
              {selectionCount === 0
                ? copy.backupNoneSelected
                : formatMessage(copy.backupSelectionCount, {
                    count: selectionCount,
                  })}
            </p>
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <Button
                disabled={busy}
                onClick={() => setPicker(null)}
                size="sm"
                variant="outline"
              >
                {copy.cancel}
              </Button>
              <Button
                disabled={busy || selectionCount === 0}
                onClick={confirmSelection}
                size="sm"
              >
                {busy ? <Spinner size="xs" /> : null}
                {busy ? pendingLabel : confirmLabel}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: iframe load enables backup actions after the game boots. */}
      <iframe
        allow="fullscreen"
        className="aspect-video max-h-[75dvh] min-h-80 w-full rounded-lg border [&:fullscreen]:h-dvh [&:fullscreen]:max-h-none [&:fullscreen]:rounded-none [&:fullscreen]:border-0"
        onLoad={() => setReady(true)}
        ref={frameRef}
        src={`${import.meta.env.BASE_URL}games/terrabrowser/index.html`}
        title={messages.common.terrabrowserTitle}
      />
    </section>
  );
}
