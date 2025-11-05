import { Plus } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
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
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import {
  EndpointForm,
  type EndpointFormHandle,
} from "@/features/endpoints/forms/endpoint-form";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";

type AddEndpointSheetProps = {
  onSubmit: (data: EndpointFormData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isSubmitting?: boolean;
  showTrigger?: boolean;
};

export function AddEndpointSheet({
  onSubmit,
  open,
  onOpenChange,
  isSubmitting = false,
  showTrigger = true,
}: AddEndpointSheetProps) {
  const formRef = useRef<EndpointFormHandle>(null);
  const { data: billers = [], isLoading: isLoadingBillers } = useGetBillers();

  const handleFormSubmit = (data: EndpointFormData) => {
    onSubmit(data);
    formRef.current?.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      formRef.current?.reset();
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Endpoint
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="flex w-[400px] flex-col sm:w-[640px]">
        <SheetHeader>
          <SheetTitle>Add Endpoint</SheetTitle>
          <SheetDescription>
            Create a new API endpoint for a specific biller ID.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-hidden">
          <EndpointForm
            billers={billers}
            isLoadingBillers={isLoadingBillers}
            onSubmit={handleFormSubmit}
            ref={formRef}
          >
            <SheetFooter className="border-t px-6 pt-4 pb-6">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting && <Spinner className="mr-2" />}
                {isSubmitting ? "Creating..." : "Create Endpoint"}
              </Button>
            </SheetFooter>
          </EndpointForm>
        </div>
      </SheetContent>
    </Sheet>
  );
}
