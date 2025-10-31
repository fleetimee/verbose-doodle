import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  type EndpointFormData,
  endpointSchema,
  httpMethods,
} from "@/features/endpoints/schemas/endpoint-schema";
import { getMethodTextColor } from "@/features/endpoints/utils/http-method-colors";

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
  isSubmitting: externalIsSubmitting,
  showTrigger = true,
}: AddEndpointSheetProps) {
  const form = useForm<EndpointFormData>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      method: "GET",
      url: "/",
      billerId: 1,
    },
  });

  const handleFormSubmit = (data: EndpointFormData) => {
    onSubmit(data);
  };

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange?.(newOpen);
  };

  const isSubmitting = externalIsSubmitting ?? false;

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
      <SheetContent className="w-[400px] sm:w-[640px]">
        <SheetHeader>
          <SheetTitle>Add Endpoint</SheetTitle>
          <SheetDescription>
            Create a new API endpoint for a specific biller ID.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="flex h-full flex-col"
            onSubmit={form.handleSubmit(handleFormSubmit)}
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <FieldGroup className="space-y-4">
                <Controller
                  control={form.control}
                  name="method"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="endpoint-method">Method</FieldLabel>
                      <FieldContent>
                        <Select
                          name={field.name}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            aria-invalid={fieldState.invalid}
                            id="endpoint-method"
                          >
                            <SelectValue placeholder="Select method">
                              {field.value && (
                                <span
                                  className={getMethodTextColor(field.value)}
                                >
                                  {field.value}
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {httpMethods.map((method) => (
                              <SelectItem key={method} value={method}>
                                <span className={getMethodTextColor(method)}>
                                  {method}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription>
                          Choose the HTTP method this endpoint should respond
                          to.
                        </FieldDescription>
                      </FieldContent>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="url"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="endpoint-url">URL</FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          id="endpoint-url"
                          placeholder="/api/users"
                        />
                        <FieldDescription>
                          Provide a path relative to the base URL, including a
                          leading slash.
                        </FieldDescription>
                      </FieldContent>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="billerId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="endpoint-biller">
                        Biller ID
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          id="endpoint-biller"
                          inputMode="numeric"
                          placeholder="1"
                          type="number"
                        />
                        <FieldDescription>
                          Specify the biller ID this endpoint belongs to.
                        </FieldDescription>
                      </FieldContent>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            <SheetFooter className="px-6 pb-6">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create Endpoint"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
