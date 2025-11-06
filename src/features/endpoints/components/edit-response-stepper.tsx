import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Code2, FileText, Hash } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { JsonEditor } from "@/features/endpoints/components/json-editor";
import { StatusCodeCombobox } from "@/features/endpoints/components/status-code-combobox";
import {
  ANIMATION_DURATION,
  STEP_TRANSITION_DURATION,
} from "@/features/endpoints/constants/stepper-steps";
import type { EndpointResponse } from "@/features/endpoints/types";

type EditType = "name" | "statusCode" | "json";

type EditResponseStepperProps = {
  response: EndpointResponse;
  editType: EditType;
  onSubmit: (data: {
    name?: string;
    statusCode?: number;
    json?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

const MIN_STATUS_CODE = 100;
const MAX_STATUS_CODE = 599;

const editSchemas = {
  name: z.object({ name: z.string().min(1, "Name is required") }),
  statusCode: z.object({
    statusCode: z.number().min(MIN_STATUS_CODE).max(MAX_STATUS_CODE),
  }),
  json: z.object({
    json: z
      .string()
      .min(1, "JSON is required")
      .refine(
        (val) => {
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Must be valid JSON" }
      ),
  }),
};

const stepConfig = {
  name: {
    title: "Edit Response Name",
    description: "Update the name of this response configuration",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  statusCode: {
    title: "Edit Status Code",
    description: "Update the HTTP status code for this response",
    icon: Hash,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  json: {
    title: "Edit JSON Response",
    description: "Update the JSON response body",
    icon: Code2,
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
};

export function EditResponseStepper({
  response,
  editType,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EditResponseStepperProps) {
  const step = stepConfig[editType];
  const schema = editSchemas[editType];

  const getDefaultValue = () => {
    if (editType === "statusCode") {
      return response.statusCode;
    }
    if (editType === "json") {
      return response.json;
    }
    return response.name;
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      [editType]: getDefaultValue(),
    },
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && editType !== "json") {
      e.preventDefault();
      if (form.formState.isValid) {
        handleSubmit();
      }
    }
  };

  const canSubmit = form.formState.isValid && !isSubmitting;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: ANIMATION_DURATION }}
    >
      {/* Header */}
      <div className="border-b px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onCancel} size="icon" variant="ghost">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="font-medium text-muted-foreground text-sm">
                Editing: {response.name}
              </div>
            </div>
          </div>
          <Button onClick={onCancel} size="sm" variant="ghost">
            Cancel
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center overflow-auto px-4 py-8 md:px-8 md:pb-8">
        <Card className="w-full max-w-3xl border-0 p-8 shadow-none md:p-12">
          {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Form needs keyboard navigation for stepper UX */}
          <form onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
                exit={{ opacity: 0, x: -20 }}
                initial={{ opacity: 0, x: 20 }}
                transition={{
                  duration: STEP_TRANSITION_DURATION,
                  ease: "easeInOut",
                }}
              >
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${step.bgColor}`}
                    >
                      <step.icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <h2 className="font-semibold text-3xl tracking-tight md:text-4xl">
                        {step.title}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {editType === "name" && (
                    <Controller
                      control={form.control}
                      name="name"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldContent>
                            <Input
                              {...field}
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                              autoFocus
                              className="h-20 rounded-none border-0 border-border border-b-2 px-0 text-3xl shadow-none focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive md:text-4xl"
                              id="edit-response-name"
                              placeholder="e.g., success_response, error_response"
                            />
                            <FieldDescription className="mt-4 text-base">
                              Choose a descriptive name that helps identify this
                              response
                            </FieldDescription>
                          </FieldContent>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  )}

                  {editType === "statusCode" && (
                    <Controller
                      control={form.control}
                      name="statusCode"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldContent>
                            <StatusCodeCombobox
                              field={field}
                              fieldError={fieldState.error}
                              onSelect={handleSubmit}
                            />
                            <FieldDescription className="mt-4 text-base">
                              Search or select the appropriate HTTP status code
                            </FieldDescription>
                          </FieldContent>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  )}

                  {editType === "json" && (
                    <Controller
                      control={form.control}
                      name="json"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldContent>
                            <JsonEditor
                              aria-invalid={fieldState.invalid}
                              autoFocus
                              id="edit-response-json"
                              onBlur={field.onBlur}
                              onChange={field.onChange}
                              placeholder='{\n  "name": "Novian Andika",\n  "age": 17,\n  "gender": true,\n  "jobs": ["fishing", "running"]\n}'
                              value={field.value}
                            />
                            <FieldDescription className="text-base">
                              Full-featured JSON editor with syntax
                              highlighting, autocomplete, and bracket matching.
                              Click the wand to format.
                            </FieldDescription>
                          </FieldContent>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </form>
        </Card>
      </div>

      {/* Footer - Edge to Edge */}
      <div className="relative z-10 shrink-0 border-t bg-background px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Empty div for spacing - matching the stepper indicators position */}
          <div />

          <Button
            disabled={!canSubmit}
            onClick={handleSubmit}
            size="lg"
            type="button"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
