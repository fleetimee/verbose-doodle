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
import { messages } from "@/lib/i18n";

type AddBillerDialogProps = {
  readonly isSubmitting?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onSubmit: (billerName: string) => void;
  readonly open?: boolean;
};

export function AddBillerDialog({
  isSubmitting = false,
  onOpenChange,
  onSubmit,
  open,
}: AddBillerDialogProps) {
  const [billerName, setBillerName] = useState("");

  useEffect(() => {
    if (!open) {
      setBillerName("");
    }
  }, [open]);

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
          <DialogTitle>{messages.billers.addBiller}</DialogTitle>
          <DialogDescription>
            {messages.billers.addBillerDescription}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="biller-name-dialog">
              {messages.billers.billerNameLabel}
            </label>
            <Input
              autoComplete="off"
              id="biller-name-dialog"
              maxLength={100}
              onChange={(event) => setBillerName(event.target.value)}
              placeholder={messages.billers.billerNamePlaceholder}
              required
              value={billerName}
            />
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting || !billerName.trim()} type="submit">
              {isSubmitting && <Spinner className="mr-2" />}
              {isSubmitting
                ? messages.billers.creatingBiller
                : messages.billers.createBiller}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
