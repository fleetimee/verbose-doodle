import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle } from "react";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";
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
  type EndpointFormData,
  endpointSchema,
  httpMethods,
} from "@/features/endpoints/schemas/endpoint-schema";
import { getMethodTextColor } from "@/features/endpoints/utils/http-method-colors";

type EndpointFormProps = {
  onSubmit: (data: EndpointFormData) => void;
  children?: React.ReactNode;
};

export type EndpointFormHandle = {
  reset: () => void;
  getValues: () => EndpointFormData;
  form: UseFormReturn<EndpointFormData>;
};

export const EndpointForm = forwardRef<EndpointFormHandle, EndpointFormProps>(
  ({ onSubmit, children }, ref) => {
    const form = useForm<EndpointFormData>({
      resolver: zodResolver(endpointSchema),
      defaultValues: {
        method: "GET",
        url: "/",
        billerId: 1,
      },
    });

    useImperativeHandle(ref, () => ({
      reset: () => form.reset(),
      getValues: () => form.getValues(),
      form,
    }));

    const handleSubmit = (data: EndpointFormData) => {
      onSubmit(data);
    };

    return (
      <Form {...form}>
        <form
          className="flex h-full flex-col"
          onSubmit={form.handleSubmit(handleSubmit)}
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
                              <span className={getMethodTextColor(field.value)}>
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
                        Choose the HTTP method this endpoint should respond to.
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
                    <FieldLabel htmlFor="endpoint-biller">Biller ID</FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        id="endpoint-biller"
                        inputMode="numeric"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="1"
                        type="number"
                        value={field.value}
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

          {children}
        </form>
      </Form>
    );
  }
);
