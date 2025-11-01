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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type ResponseFormData,
  responseSchema,
} from "@/features/endpoints/schemas/response-schema";

type ResponseFormProps = {
  onSubmit: (data: ResponseFormData) => void;
  children?: React.ReactNode;
};

export type ResponseFormHandle = {
  reset: () => void;
  getValues: () => ResponseFormData;
  form: UseFormReturn<ResponseFormData>;
};

export const ResponseForm = forwardRef<ResponseFormHandle, ResponseFormProps>(
  ({ onSubmit, children }, ref) => {
    const form = useForm<ResponseFormData>({
      resolver: zodResolver(responseSchema),
      defaultValues: {
        name: "",
        json: "{}",
        statusCode: 200,
        activated: false,
      },
    });

    useImperativeHandle(ref, () => ({
      reset: () => form.reset(),
      getValues: () => form.getValues(),
      form,
    }));

    const handleSubmit = (data: ResponseFormData) => {
      onSubmit(data);
    };

    return (
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup className="space-y-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="response-name">Name</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      id="response-name"
                      placeholder="e.g., success_response, error_response"
                    />
                    <FieldDescription>
                      A descriptive name for this response
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
              name="statusCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="response-status-code">
                    Status Code
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      id="response-status-code"
                      inputMode="numeric"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="200"
                      type="number"
                      value={field.value}
                    />
                    <FieldDescription>
                      HTTP status code (100-599)
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
              name="json"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="response-json">JSON Response</FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="font-mono text-sm"
                      id="response-json"
                      placeholder='{"key": "value"}'
                      rows={10}
                    />
                    <FieldDescription>
                      The JSON response body (must be valid JSON)
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
              name="activated"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FieldLabel
                        className="text-base"
                        htmlFor="response-activated"
                      >
                        Activate
                      </FieldLabel>
                      <FieldDescription>
                        Set this as the active response for the endpoint
                      </FieldDescription>
                    </div>
                    <Switch
                      checked={field.value}
                      id="response-activated"
                      onCheckedChange={field.onChange}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {children}
        </form>
      </Form>
    );
  }
);
