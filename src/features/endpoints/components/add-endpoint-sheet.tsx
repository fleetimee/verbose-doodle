import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  type EndpointGroupFormData,
  endpointGroupSchema,
} from "@/features/endpoints/schemas/endpoint-group-schema";

type AddEndpointSheetProps = {
  onSubmit: (data: EndpointGroupFormData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isSubmitting?: boolean;
};

export function AddEndpointSheet({
  onSubmit,
  open,
  onOpenChange,
  isSubmitting: externalIsSubmitting,
}: AddEndpointSheetProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EndpointGroupFormData>({
    resolver: zodResolver(endpointGroupSchema),
  });

  const handleFormSubmit = (data: EndpointGroupFormData) => {
    onSubmit(data);
  };

  // Reset form when sheet closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange?.(newOpen);
  };

  const isSubmitting = externalIsSubmitting ?? false;

  return (
    <Sheet onOpenChange={handleOpenChange} open={open}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Endpoint
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Endpoint Group</SheetTitle>
          <SheetDescription>
            Create a new endpoint group to organize your API endpoints.
          </SheetDescription>
        </SheetHeader>
        <form
          className="flex h-full flex-col"
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <div className="flex-1 space-y-4 px-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Payment Gateway, User Service"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
          <SheetFooter>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Endpoint Group"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
