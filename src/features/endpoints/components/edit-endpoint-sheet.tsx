import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import { httpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
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
    <Drawer
      direction="right"
      onOpenChange={handleOpenChange}
      open={open}
      shouldScaleBackground={false}
    >
      <DrawerContent
        className="overflow-hidden data-[vaul-drawer-direction=right]:w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-lg"
        showSwipeHandle={false}
      >
        <DrawerHeader className="shrink-0 px-6 pt-6 pb-2 text-left">
          <DrawerTitle>{messages.endpoints.editEndpoint}</DrawerTitle>
          <DrawerDescription>
            {messages.endpoints.editEndpointDescription}
          </DrawerDescription>
        </DrawerHeader>
        {endpoint && (
          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            data-vaul-no-drag
          >
            <EndpointForm
              availabilityExcludeSlug={endpoint.slug}
              billers={billers}
              checkEndpointAvailability={
                httpEndpointAdapter.checkEndpointAvailability
              }
              initialBillerSlug={endpoint.billerSlug}
              initialMethod={endpoint.method}
              initialUrl={endpoint.url}
              isBillerReadOnly
              isLoadingBillers={isLoadingBillers}
              onSubmit={onSubmit}
              ref={formRef}
            >
              <DrawerFooter className="shrink-0 border-t px-6 pt-4 pb-6">
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting && <Spinner className="mr-2" />}
                  {isSubmitting
                    ? messages.endpoints.updating
                    : messages.endpoints.saveEndpoint}
                </Button>
                <DrawerClose asChild>
                  <Button type="button" variant="outline">
                    {messages.common.cancel}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </EndpointForm>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
