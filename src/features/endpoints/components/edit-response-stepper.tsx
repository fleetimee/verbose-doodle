import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft02Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Code2, FileText, Hash } from "@/components/hugeicons";
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
  JSON_PRESETS,
} from "@/features/endpoints/constants/stepper-steps";
import type { EndpointResponse } from "@/features/endpoints/types";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

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
  onDirtyChange?: (isDirty: boolean) => void;
  isSubmitting?: boolean;
};

const COMMON_STATUS_CODES = [
  { code: 200, label: "OK" },
  { code: 201, label: "Created" },
  { code: 400, label: "Bad Request" },
  { code: 404, label: "Not Found" },
  { code: 500, label: "Server Error" },
] as const;

const MIN_STATUS_CODE = 100;
const MAX_STATUS_CODE = 599;

const editSchemas = {
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
  name: z.object({ name: z.string().min(1, "Name is required") }),
  statusCode: z.object({
    statusCode: z.number().min(MIN_STATUS_CODE).max(MAX_STATUS_CODE),
  }),
};

const stepConfig = {
  json: {
    bgColor: "bg-primary/10 dark:bg-primary/20",
    color: "text-primary",
    description: "Update the JSON response body",
    icon: Code2,
    title: "Edit JSON Response",
  },
  name: {
    bgColor: "bg-primary/10 dark:bg-primary/20",
    color: "text-primary",
    description: "Update the name of this response configuration",
    icon: FileText,
    title: "Edit Response Name",
  },
  statusCode: {
    bgColor: "bg-primary/10 dark:bg-primary/20",
    color: "text-primary",
    description: "Update the HTTP status code for this response",
    icon: Hash,
    title: "Edit Status Code",
  },
};

export function EditResponseStepper({
  response,
  editType,
  onSubmit,
  onCancel,
  onDirtyChange,
  isSubmitting = false,
}: EditResponseStepperProps) {
  const step = stepConfig[editType];
  const schema = editSchemas[editType];
  const shouldReduceMotion = useReducedMotion();

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
    defaultValues: {
      [editType]: getDefaultValue(),
    },
    mode: "onChange",
    resolver: zodResolver(schema),
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

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
    return () => onDirtyChange?.(false);
  }, [form.formState.isDirty, onDirtyChange]);

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
              <HugeiconsIcon
                className="h-5 w-5"
                icon={ArrowLeft02Icon}
                strokeWidth={2}
              />
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
      <div className="flex flex-1 items-center justify-center overflow-auto bg-muted/20 px-4 py-8 md:px-8 md:pb-8">
        <Card className="w-full max-w-3xl border bg-card shadow-sm">
          {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: Form needs keyboard navigation for stepper UX */}
          <form
            className="flex min-h-[34rem] flex-col"
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
          >
            <AnimatePresence initial={false}>
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-1 flex-col gap-8 p-5 md:p-8"
                exit={{ opacity: 0, x: shouldReduceMotion ? 0 : -8 }}
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 8 }}
                key={editType}
                transition={{
                  duration: shouldReduceMotion
                    ? MOTION_DURATION.fast
                    : MOTION_DURATION.step,
                  ease: MOTION_EASE.out,
                }}
              >
                <div className="flex items-start gap-3 border-b pb-5">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-md ${step.bgColor}`}
                  >
                    <step.icon className={`size-5 ${step.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-2xl tracking-tight md:text-3xl">
                      {step.title}
                    </h2>
                    <p className="mt-2 text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
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
                              className="h-16 rounded-md border bg-background px-4 font-mono text-2xl shadow-xs focus-visible:ring-2 aria-invalid:border-destructive md:text-3xl"
                              id="edit-response-name"
                              placeholder="e.g., success_response, error_response"
                            />
                            <div className="mt-4 flex flex-wrap gap-2">
                              {[
                                "success_response",
                                "validation_error",
                                "timeout_fallback",
                              ].map((example) => (
                                <button
                                  className="rounded-md border bg-muted/40 px-2.5 py-1 font-mono text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                                  key={example}
                                  onClick={() => {
                                    field.onChange(example);
                                    form.trigger("name").catch(() => undefined);
                                  }}
                                  type="button"
                                >
                                  {example}
                                </button>
                              ))}
                            </div>
                            <FieldDescription className="mt-4">
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
                            <div className="mb-4 grid gap-2 sm:grid-cols-5">
                              {COMMON_STATUS_CODES.map((status) => (
                                <Button
                                  className="h-auto min-h-16 flex-col gap-1 px-3 py-3"
                                  key={status.code}
                                  onClick={() => {
                                    field.onChange(status.code);
                                    form
                                      .trigger("statusCode")
                                      .catch(() => undefined);
                                  }}
                                  type="button"
                                  variant={
                                    field.value === status.code
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  <span className="font-mono text-base">
                                    {status.code}
                                  </span>
                                  <span className="max-w-full truncate text-xs">
                                    {status.label}
                                  </span>
                                </Button>
                              ))}
                            </div>
                            <StatusCodeCombobox
                              field={field}
                              fieldError={fieldState.error}
                              onSelect={handleSubmit}
                            />
                            <FieldDescription className="mt-4">
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
                              height="280px"
                              id="edit-response-json"
                              onBlur={field.onBlur}
                              onChange={field.onChange}
                              placeholder='{\n  "name": "Novian Andika",\n  "age": 17,\n  "gender": true,\n  "jobs": ["fishing", "running"]\n}'
                              value={field.value}
                            />
                            <div className="mt-4 flex flex-wrap gap-2">
                              {JSON_PRESETS.map((preset) => (
                                <button
                                  className="rounded-md border bg-muted/40 px-2.5 py-1 font-mono text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                                  key={preset.name}
                                  onClick={() => {
                                    field.onChange(preset.value);
                                    form.trigger("json").catch(() => undefined);
                                  }}
                                  type="button"
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                            <FieldDescription className="mt-4">
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
                <HugeiconsIcon
                  className="mr-2 h-4 w-4"
                  icon={Tick02Icon}
                  strokeWidth={2}
                />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
