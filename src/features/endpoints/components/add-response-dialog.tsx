import { Plus } from "lucide-react";
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
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {messages.endpoints.addResponse}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{messages.endpoints.addNewResponse}</DialogTitle>
          <DialogDescription>
            {messages.endpoints.addResponseDescription}
          </DialogDescription>
        </DialogHeader>
        <ResponseForm onSubmit={handleSubmit} ref={formRef}>
          <DialogFooter>
            <Button
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              {messages.common.cancel}
            </Button>
            <Button disabled={isSubmitting} type="submit">
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
