import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
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
    <Drawer
      direction="right"
      onOpenChange={handleOpenChange}
      open={open}
      shouldScaleBackground={false}
    >
      {showTrigger && (
        <DrawerTrigger asChild>
          <Button type="button">
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={Add01Icon}
              strokeWidth={2}
            />
            {messages.billers.addBiller}
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent
        className="overflow-hidden data-[vaul-drawer-direction=right]:w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-lg"
        showSwipeHandle={false}
      >
        <DrawerHeader className="shrink-0" size="lg" variant="left">
          <DrawerTitle>{messages.billers.addBiller}</DrawerTitle>
          <DrawerDescription>
            {messages.billers.addBillerDescription}
          </DrawerDescription>
        </DrawerHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          data-vaul-no-drag
          onSubmit={handleSubmit}
        >
          <div className="flex-1 space-y-2 overflow-y-auto px-6 py-6">
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
          <DrawerFooter className="shrink-0" size="lg" variant="bordered">
            <Button disabled={isSubmitting || !billerName.trim()} type="submit">
              {isSubmitting && <Spinner className="mr-2" />}
              {isSubmitting
                ? messages.billers.creatingBiller
                : messages.billers.createBiller}
            </Button>
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                {messages.common.cancel}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
