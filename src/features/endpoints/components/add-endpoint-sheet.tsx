import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useRef, useState } from "react";
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
import { AddBillerDialog } from "@/features/billers/components/add-biller-dialog";
import { useCreateBiller } from "@/features/billers/hooks/use-create-biller";
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import type { Biller } from "@/features/billers/types";
import {
  EndpointForm,
  type EndpointFormHandle,
} from "@/features/endpoints/forms/endpoint-form";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import { messages } from "@/lib/i18n";

type AddEndpointSheetProps = {
  onSubmit: (data: EndpointFormData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isSubmitting?: boolean;
  showTrigger?: boolean;
  initialBillerId?: number;
  onTriggerClick?: () => void;
};

export function AddEndpointSheet({
  onSubmit,
  open,
  onOpenChange,
  isSubmitting = false,
  showTrigger = true,
  initialBillerId,
  onTriggerClick,
}: AddEndpointSheetProps) {
  const formRef = useRef<EndpointFormHandle>(null);
  const [createdBiller, setCreatedBiller] = useState<Biller | null>(null);
  const [isAddBillerOpen, setIsAddBillerOpen] = useState(false);
  const { data: billers = [], isLoading: isLoadingBillers } = useGetBillers();
  const { mutate: createBiller, isPending: isCreatingBiller } =
    useCreateBiller();
  const availableBillers = useMemo(() => {
    if (
      !createdBiller ||
      billers.some((biller) => biller.id === createdBiller.id)
    ) {
      return billers;
    }

    return [createdBiller, ...billers];
  }, [billers, createdBiller]);

  const handleFormSubmit = (data: EndpointFormData) => {
    onSubmit(data);
    formRef.current?.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      formRef.current?.reset();
      setCreatedBiller(null);
      setIsAddBillerOpen(false);
    }
    onOpenChange?.(newOpen);
  };

  const handleAddBiller = (billerName: string) => {
    createBiller(
      { billerName },
      {
        onSuccess: (biller) => {
          setCreatedBiller(biller);
          setIsAddBillerOpen(false);
          formRef.current?.form.setValue("billerId", biller.id, {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
      }
    );
  };

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button onClick={onTriggerClick} type="button">
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={Add01Icon}
              strokeWidth={2}
            />
            {messages.endpoints.addEndpoint}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="flex w-[400px] flex-col sm:w-[640px]">
        <SheetHeader>
          <SheetTitle>{messages.endpoints.addEndpoint}</SheetTitle>
          <SheetDescription>
            {messages.endpoints.addEndpointDescription}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-hidden">
          <EndpointForm
            billers={availableBillers}
            initialBillerId={initialBillerId}
            isLoadingBillers={isLoadingBillers}
            onAddBiller={() => setIsAddBillerOpen(true)}
            onSubmit={handleFormSubmit}
            ref={formRef}
          >
            <SheetFooter className="border-t px-6 pt-4 pb-6">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting && <Spinner className="mr-2" />}
                {isSubmitting
                  ? messages.endpoints.creating
                  : messages.endpoints.createEndpoint}
              </Button>
            </SheetFooter>
          </EndpointForm>
        </div>
      </SheetContent>
      <AddBillerDialog
        isSubmitting={isCreatingBiller}
        onOpenChange={setIsAddBillerOpen}
        onSubmit={handleAddBiller}
        open={isAddBillerOpen}
      />
    </Sheet>
  );
}
