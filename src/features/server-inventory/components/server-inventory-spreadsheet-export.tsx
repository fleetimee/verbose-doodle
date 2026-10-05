import { DownloadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  ServerEntry,
  ServerInventoryQuery,
} from "@/features/server-inventory/types";
import {
  collectServerExportEntries,
  downloadServerInventorySpreadsheet,
  type ServerExportScope,
} from "@/features/server-inventory/utils/server-inventory-spreadsheet";

export function ServerInventorySpreadsheetExport({
  entries,
  loading,
  query,
  isAdmin,
}: {
  readonly entries: readonly ServerEntry[];
  readonly loading: boolean;
  readonly query: ServerInventoryQuery;
  readonly isAdmin: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [scope, setScope] = useState<ServerExportScope>("page");
  const [includePasswords, setIncludePasswords] = useState(isAdmin);
  const scopeLabels = {
    page: copy.exportPage,
    filtered: copy.exportFiltered,
    all: copy.exportAll,
  };
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportPasswords = isAdmin && includePasswords;
      const rows = await collectServerExportEntries(
        entries,
        query,
        scope,
        exportPasswords
      );
      await downloadServerInventorySpreadsheet(rows, exportPasswords);
      setOpen(false);
    } catch {
      toast.error(copy.exportFailed);
    } finally {
      setExporting(false);
    }
  };
  return (
    <Drawer direction="bottom" onOpenChange={setOpen} open={open}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={copy.exportExcel}
            disabled={loading}
            onClick={() => setOpen(true)}
            size="icon-sm"
            type="button"
            variant="ghost-muted"
          >
            <HugeiconsIcon
              aria-hidden="true"
              icon={DownloadIcon}
              strokeWidth={2}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copy.exportExcel}</TooltipContent>
      </Tooltip>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-lg flex-col overflow-y-auto">
          <DrawerHeader size="lg" variant="left">
            <DrawerTitle>{copy.exportDownload}</DrawerTitle>
            <DrawerDescription>{copy.exportDescription}</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-5 px-6 py-5">
            <div className="grid gap-2">
              <Label htmlFor="server-export-scope">{copy.exportScope}</Label>
              <Select
                disabled={exporting}
                onValueChange={(value) => {
                  if (
                    value === "page" ||
                    value === "filtered" ||
                    value === "all"
                  ) {
                    setScope(value);
                  }
                }}
                value={scope}
              >
                <SelectTrigger
                  className="w-full"
                  id="server-export-scope"
                  variant="surface"
                >
                  <SelectValue>{scopeLabels[scope]}</SelectValue>
                </SelectTrigger>
                <SelectContent align="start" className="w-(--anchor-width)">
                  <SelectGroup>
                    <SelectItem value="page">{copy.exportPage}</SelectItem>
                    <SelectItem value="filtered">
                      {copy.exportFiltered}
                    </SelectItem>
                    <SelectItem value="all">{copy.exportAll}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={includePasswords}
                  disabled={exporting}
                  id="server-export-passwords"
                  onCheckedChange={(checked) =>
                    setIncludePasswords(checked === true)
                  }
                />
                <Label htmlFor="server-export-passwords">
                  {copy.exportPasswords}
                </Label>
              </div>
            )}
          </div>
          <DrawerFooter
            className="sm:flex-row sm:justify-end"
            size="lg"
            variant="bordered"
          >
            <DrawerClose asChild>
              <Button disabled={exporting} variant="ghost">
                {messages.common.cancel}
              </Button>
            </DrawerClose>
            <Button
              disabled={
                loading ||
                exporting ||
                (scope === "page" && entries.length === 0)
              }
              onClick={handleExport}
            >
              <HugeiconsIcon
                aria-hidden="true"
                data-icon="inline-start"
                icon={DownloadIcon}
                strokeWidth={2}
              />
              {exporting ? copy.exporting : copy.exportDownload}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
