import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useI18n } from "@/components/i18n-provider";
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

const MIN_STATUS_CODE = 100;
const MAX_STATUS_CODE = 599;

const editStatusCodeSchema = z.object({
  statusCode: z.number().min(MIN_STATUS_CODE).max(MAX_STATUS_CODE),
});

type EditStatusCodeFormData = z.infer<typeof editStatusCodeSchema>;

type EditResponseStatusCodeFormProps = {
  defaultValue: number;
  onSubmit: (data: { statusCode: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function EditResponseStatusCodeForm({
  defaultValue,
  isLoading = false,
  onCancel,
  onSubmit,
}: EditResponseStatusCodeFormProps) {
  const { messages } = useI18n();
  const form = useForm<EditStatusCodeFormData>({
    defaultValues: {
      statusCode: defaultValue,
    },
    resolver: zodResolver(editStatusCodeSchema),
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup size="compact">
          <Controller
            control={form.control}
            name="statusCode"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-response-status-code">
                  {messages.endpoints.statusCodeLabel}
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    autoFocus
                    id="edit-response-status-code"
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
        </FieldGroup>

        <div className="flex justify-end gap-2">
          <Button
            disabled={isLoading}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            {messages.common.cancel}
          </Button>
          <Button disabled={isLoading} type="submit">
            {isLoading ? messages.common.saving : messages.common.save}
          </Button>
        </div>
      </form>
    </Form>
  );
}
