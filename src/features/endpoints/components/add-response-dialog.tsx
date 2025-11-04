import { Plus } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResponseForm,
  type ResponseFormHandle,
} from "@/features/endpoints/forms/response-form";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";

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
            Add Response
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Response</DialogTitle>
          <DialogDescription>
            Create a new response configuration for this endpoint
          </DialogDescription>
        </DialogHeader>
        <ResponseForm onSubmit={handleSubmit} ref={formRef}>
          <DialogFooter>
            <Button
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting && <Spinner className="mr-2" />}
              {isSubmitting ? "Adding..." : "Add Response"}
            </Button>
          </DialogFooter>
        </ResponseForm>
      </DialogContent>
    </Dialog>
  );
}
