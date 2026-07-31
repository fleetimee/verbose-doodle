import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import {
  EndpointForm,
  type EndpointFormHandle,
} from "@/features/endpoints/forms/endpoint-form";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type { Endpoint } from "@/features/endpoints/types";
import { messages } from "@/lib/i18n";

type EditEndpointSheetProps = {
  endpoint: Endpoint | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EndpointFormData) => void;
  open: boolean;
};

export function EditEndpointSheet({
  endpoint,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
  open,
}: EditEndpointSheetProps) {
  const formRef = useRef<EndpointFormHandle>(null);
  const { data: billers = [], isLoading: isLoadingBillers } = useGetBillers();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      formRef.current?.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      <SheetContent
        className="flex w-[400px] flex-col sm:w-[640px]"
        keepMounted
      >
        <SheetHeader>
          <SheetTitle>{messages.endpoints.editEndpoint}</SheetTitle>
          <SheetDescription>
            {messages.endpoints.editEndpointDescription}
          </SheetDescription>
        </SheetHeader>
        {endpoint && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <EndpointForm
              billers={billers}
              initialBillerSlug={endpoint.billerSlug}
              initialMethod={endpoint.method}
              initialUrl={endpoint.url}
              isBillerReadOnly
              isLoadingBillers={isLoadingBillers}
              onSubmit={onSubmit}
              ref={formRef}
            >
              <SheetFooter className="border-t px-6 pt-4 pb-6">
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting && <Spinner className="mr-2" />}
                  {isSubmitting
                    ? messages.endpoints.updating
                    : messages.endpoints.saveEndpoint}
                </Button>
              </SheetFooter>
            </EndpointForm>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
