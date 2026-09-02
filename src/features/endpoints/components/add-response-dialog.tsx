import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  ResponseForm,
  type ResponseFormHandle,
} from "@/features/endpoints/forms/response-form";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";
import { messages } from "@/lib/i18n";

type AddResponseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ResponseFormData) => void;
  isSubmitting?: boolean;
  showTrigger?: boolean;
};

export function AddResponseDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  showTrigger = true,
}: AddResponseDialogProps) {
  const formRef = useRef<ResponseFormHandle>(null);

  const handleSubmit = (data: ResponseFormData) => {
    onSubmit(data);
    formRef.current?.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      formRef.current?.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button
            className="rounded-xl border-2 border-primary/40 border-b-4 bg-primary font-bold text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary/95 active:translate-y-1 active:border-b-2"
            size="sm"
          >
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={Add01Icon}
              strokeWidth={2.5}
            />
            {messages.endpoints.addResponse}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl rounded-2xl border-2 border-border/80 border-b-4 bg-card shadow-lg">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">
            {messages.endpoints.addNewResponse}
          </DialogTitle>
          <DialogDescription>
            {messages.endpoints.addResponseDescription}
          </DialogDescription>
        </DialogHeader>
        <ResponseForm onSubmit={handleSubmit} ref={formRef}>
          <DialogFooter>
            <Button
              className="rounded-xl border-2 border-border/80 border-b-[3px] bg-background font-bold shadow-xs transition-all duration-150 hover:bg-accent active:translate-y-0.5 active:border-b-2"
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              {messages.common.cancel}
            </Button>
            <Button
              className="rounded-xl border-2 border-primary/40 border-b-4 bg-primary font-bold text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary/95 active:translate-y-1 active:border-b-2"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting && <Spinner className="mr-2" />}
              {isSubmitting
                ? messages.endpoints.adding
                : messages.endpoints.addResponse}
            </Button>
          </DialogFooter>
        </ResponseForm>
      </DialogContent>
    </Dialog>
  );
}
