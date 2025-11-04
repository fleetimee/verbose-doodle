import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Postman } from "@/components/ui/svgs/postman";
import type { GroupedEndpoints } from "@/features/endpoints/types";
import { exportPostmanWithEnvironment } from "@/features/endpoints/utils/export-to-postman";

type ExportEndpointsDialogProps = {
  groupedEndpoints: GroupedEndpoints[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ExportEndpointsDialog({
  groupedEndpoints,
  onOpenChange,
  open,
}: ExportEndpointsDialogProps) {
  const [selectedBillerIds, setSelectedBillerIds] = useState<Set<number>>(
    new Set()
  );

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedBillerIds(
        new Set(groupedEndpoints.map((group) => group.billerId))
      );
    }
  }, [open, groupedEndpoints]);

  const allSelected = selectedBillerIds.size === groupedEndpoints.length;
  const someSelected = selectedBillerIds.size > 0 && !allSelected;

  const getCheckboxState = (): boolean | "indeterminate" => {
    if (allSelected) {
      return true;
    }
    if (someSelected) {
      return "indeterminate";
    }
    return false;
  };

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedBillerIds(new Set());
    } else {
      setSelectedBillerIds(
        new Set(groupedEndpoints.map((group) => group.billerId))
      );
    }
  };

  const handleToggleBiller = (billerId: number) => {
    const newSelected = new Set(selectedBillerIds);
    if (newSelected.has(billerId)) {
      newSelected.delete(billerId);
    } else {
      newSelected.add(billerId);
    }
    setSelectedBillerIds(newSelected);
  };

  const handleExport = () => {
    const selectedGroups = groupedEndpoints.filter((group) =>
      selectedBillerIds.has(group.billerId)
    );

    if (selectedGroups.length > 0) {
      exportPostmanWithEnvironment(
        selectedGroups,
        "Biller Simulator API",
        "Biller Simulator"
      );
      onOpenChange(false);
    }
  };

  const totalEndpoints = groupedEndpoints.reduce(
    (sum, group) => sum + group.endpoints.length,
    0
  );

  const selectedEndpoints = groupedEndpoints
    .filter((group) => selectedBillerIds.has(group.billerId))
    .reduce((sum, group) => sum + group.endpoints.length, 0);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export to Postman</DialogTitle>
          <DialogDescription>
            Select which biller groups you want to export. Both the collection
            and environment files will be downloaded. The environment includes
            the base URL configured in your application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2 border-b pb-3">
            <Checkbox
              checked={getCheckboxState()}
              id="select-all"
              onCheckedChange={handleToggleAll}
            />
            <Label className="font-medium text-sm" htmlFor="select-all">
              Select All ({groupedEndpoints.length} billers, {totalEndpoints}{" "}
              endpoints)
            </Label>
          </div>

          {/* Biller List */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {groupedEndpoints.map((group) => (
                <div
                  className="flex items-start space-x-2"
                  key={group.billerId}
                >
                  <Checkbox
                    checked={selectedBillerIds.has(group.billerId)}
                    id={`biller-${group.billerId}`}
                    onCheckedChange={() => handleToggleBiller(group.billerId)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      htmlFor={`biller-${group.billerId}`}
                    >
                      {group.billerName}
                    </Label>
                    <p className="text-muted-foreground text-xs">
                      {group.endpoints.length} endpoint
                      {group.endpoints.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Summary */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">
              Selected: {selectedBillerIds.size} biller
              {selectedBillerIds.size !== 1 ? "s" : ""} • {selectedEndpoints}{" "}
              endpoint
              {selectedEndpoints !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={selectedBillerIds.size === 0}
            onClick={handleExport}
          >
            <Postman className="mr-2 h-4 w-4" />
            Export Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
