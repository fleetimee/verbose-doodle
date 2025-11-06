import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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
  onSubmit,
  onCancel,
  isLoading,
}: EditResponseStatusCodeFormProps) {
  const form = useForm<EditStatusCodeFormData>({
    resolver: zodResolver(editStatusCodeSchema),
    defaultValues: {
      statusCode: defaultValue,
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-4">
          <Controller
            control={form.control}
            name="statusCode"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-response-status-code">
                  Status Code
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
        </FieldGroup>

        <div className="flex justify-end gap-2">
          <Button
            disabled={isLoading}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
