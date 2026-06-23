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
import { messages } from "@/lib/i18n";

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
                  <FieldLabel htmlFor="response-name">
                    {messages.endpoints.responseNameLabel}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      id="response-name"
                      placeholder={messages.endpoints.responseNamePlaceholder}
                    />
                    <FieldDescription>
                      {messages.endpoints.responseNameDescription}
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
                    {messages.endpoints.statusCodeLabel}
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      id="response-status-code"
                      inputMode="numeric"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder={messages.endpoints.statusCodePlaceholder}
                      type="number"
                      value={field.value}
                    />
                    <FieldDescription>
                      {messages.endpoints.statusCodeDescription}
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
                  <FieldLabel htmlFor="response-json">
                    {messages.endpoints.jsonResponseLabel}
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="font-mono text-sm"
                      id="response-json"
                      placeholder={messages.endpoints.jsonResponsePlaceholder}
                      rows={10}
                    />
                    <FieldDescription>
                      {messages.endpoints.jsonResponseDescription}
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
                        {messages.endpoints.activateLabel}
                      </FieldLabel>
                      <FieldDescription>
                        {messages.endpoints.activateDescription}
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
