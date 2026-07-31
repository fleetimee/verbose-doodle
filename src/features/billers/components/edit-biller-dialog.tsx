import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { Biller } from "@/features/billers/types";
import { messages } from "@/lib/i18n";

type EditBillerDialogProps = {
  readonly biller: Biller | null;
  readonly isSubmitting?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onSubmit: (billerName: string) => void;
  readonly open?: boolean;
};

export function EditBillerDialog({
  biller,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
  open,
}: EditBillerDialogProps) {
  const [billerName, setBillerName] = useState("");

  useEffect(() => {
    setBillerName(open && biller ? biller.name : "");
  }, [biller, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setBillerName("");
    }
    onOpenChange?.(nextOpen);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = billerName.trim();
    if (trimmedName) {
      onSubmit(trimmedName);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{messages.billers.editBiller}</DialogTitle>
          <DialogDescription>
            {messages.billers.editBillerDescription}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="edit-biller-name">
              {messages.billers.billerNameLabel}
            </label>
            <Input
              autoComplete="off"
              id="edit-biller-name"
              maxLength={100}
              onChange={(event) => setBillerName(event.target.value)}
              required
              value={billerName}
            />
          </div>
          <div className="space-y-1">
            <span className="font-medium text-sm">
              {messages.billers.billerSlugLabel}
            </span>
            <code className="block rounded-md border bg-muted/40 px-3 py-2 font-mono text-muted-foreground text-sm">
              {biller?.slug ?? "—"}
            </code>
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting || !billerName.trim()} type="submit">
              {isSubmitting && <Spinner className="mr-2" />}
              {isSubmitting
                ? messages.billers.savingBiller
                : messages.billers.saveBiller}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
