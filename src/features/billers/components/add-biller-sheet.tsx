import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { messages } from "@/lib/i18n";

type AddBillerSheetProps = {
  readonly isSubmitting?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onSubmit: (billerName: string) => void;
  readonly open?: boolean;
  readonly showTrigger?: boolean;
};

export function AddBillerSheet({
  isSubmitting = false,
  onOpenChange,
  onSubmit,
  open,
  showTrigger = true,
}: AddBillerSheetProps) {
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
    <Sheet onOpenChange={handleOpenChange} open={open}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button type="button">
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={Add01Icon}
              strokeWidth={2}
            />
            {messages.billers.addBiller}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="flex w-[400px] flex-col sm:w-[640px]">
        <SheetHeader>
          <SheetTitle>{messages.billers.addBiller}</SheetTitle>
          <SheetDescription>
            {messages.billers.addBillerDescription}
          </SheetDescription>
        </SheetHeader>
        <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex-1 space-y-2 px-6 py-6">
            <label className="font-medium text-sm" htmlFor="biller-name">
              {messages.billers.billerNameLabel}
            </label>
            <Input
              autoComplete="off"
              id="biller-name"
              maxLength={100}
              onChange={(event) => setBillerName(event.target.value)}
              placeholder={messages.billers.billerNamePlaceholder}
              required
              value={billerName}
            />
          </div>
          <SheetFooter className="border-t px-6 pt-4 pb-6">
            <Button disabled={isSubmitting || !billerName.trim()} type="submit">
              {isSubmitting && <Spinner className="mr-2" />}
              {isSubmitting
                ? messages.billers.creatingBiller
                : messages.billers.createBiller}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
