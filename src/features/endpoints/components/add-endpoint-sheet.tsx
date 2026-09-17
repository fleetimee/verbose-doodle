import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useRef, useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { AddBillerDialog } from "@/features/billers/components/add-biller-dialog";
import { useCreateBiller } from "@/features/billers/hooks/use-create-biller";
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import type { Biller } from "@/features/billers/types";
import { httpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
import {
  EndpointForm,
  type EndpointFormHandle,
} from "@/features/endpoints/forms/endpoint-form";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import { messages } from "@/lib/i18n";

type AddEndpointSheetProps = {
  onSubmit: (data: EndpointFormData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isSubmitting?: boolean;
  showTrigger?: boolean;
  initialBillerSlug?: string;
  onTriggerClick?: () => void;
};

export function AddEndpointSheet({
  onSubmit,
  open,
  onOpenChange,
  isSubmitting = false,
  showTrigger = true,
  initialBillerSlug,
  onTriggerClick,
}: AddEndpointSheetProps) {
  const formRef = useRef<EndpointFormHandle>(null);
  const [createdBiller, setCreatedBiller] = useState<Biller | null>(null);
  const [isAddBillerOpen, setIsAddBillerOpen] = useState(false);
  const { data: billers = [], isLoading: isLoadingBillers } = useGetBillers();
  const { mutate: createBiller, isPending: isCreatingBiller } =
    useCreateBiller();
  const { updateEndpoint } = useEndpointCatalog();
  const availableBillers = useMemo(() => {
    if (
      !createdBiller ||
      billers.some((biller) => biller.slug === createdBiller.slug)
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
          formRef.current?.form.setValue("billerSlug", biller.slug, {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
      }
    );
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
          <Button onClick={onTriggerClick} type="button">
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={Add01Icon}
              strokeWidth={2}
            />
            {messages.endpoints.addEndpoint}
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent
        className="overflow-hidden data-[vaul-drawer-direction=right]:w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-lg"
        showSwipeHandle={false}
      >
        <DrawerHeader className="shrink-0" size="lg" variant="left">
          <DrawerTitle>{messages.endpoints.addEndpoint}</DrawerTitle>
          <DrawerDescription>
            {messages.endpoints.addEndpointDescription}
          </DrawerDescription>
        </DrawerHeader>
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          data-vaul-no-drag
        >
          <EndpointForm
            billers={availableBillers}
            checkEndpointAvailability={
              httpEndpointAdapter.checkEndpointAvailability
            }
            initialBillerSlug={initialBillerSlug}
            isLoadingBillers={isLoadingBillers}
            onAddBiller={() => setIsAddBillerOpen(true)}
            onDisableConflictingEndpoint={async (endpointSlug) => {
              await updateEndpoint.mutateAsync({
                changes: { enabled: false },
                endpointSlug,
              });
            }}
            onSubmit={handleFormSubmit}
            ref={formRef}
          >
            <DrawerFooter className="shrink-0" size="lg" variant="bordered">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting && <Spinner className="mr-2" />}
                {isSubmitting
                  ? messages.endpoints.creating
                  : messages.endpoints.createEndpoint}
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant="outline">
                  {messages.common.cancel}
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </EndpointForm>
        </div>
      </DrawerContent>
      <AddBillerDialog
        isSubmitting={isCreatingBiller}
        onOpenChange={setIsAddBillerOpen}
        onSubmit={handleAddBiller}
        open={isAddBillerOpen}
      />
    </Drawer>
  );
}
