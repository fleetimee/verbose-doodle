import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { JsonEditor } from "@/features/endpoints/components/json-editor";
import { ResponseStepperFooter } from "@/features/endpoints/components/response-stepper-footer";
import { ResponseStepperHeader } from "@/features/endpoints/components/response-stepper-header";
import { StatusCodeCombobox } from "@/features/endpoints/components/status-code-combobox";
import {
  ANIMATION_DURATION,
  JSON_PRESETS,
  PERCENT_MULTIPLIER,
  STEPS,
} from "@/features/endpoints/constants/stepper-steps";
import {
  type ResponseFormData,
  responseSchema,
} from "@/features/endpoints/schemas/response-schema";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

const ResponseReviewStep = lazy(() =>
  import("@/features/endpoints/components/response-review-step").then(
    ({ ResponseReviewStep }) => ({ default: ResponseReviewStep })
  )
);

const COMMON_STATUS_CODES = [
  { code: 200, label: "OK" },
  { code: 201, label: "Created" },
  { code: 400, label: "Bad Request" },
  { code: 404, label: "Not Found" },
  { code: 500, label: "Server Error" },
] as const;

const getRailStepClasses = (isActive: boolean, isComplete: boolean) => {
  if (isActive) {
    return "border-primary/40 bg-primary/10";
  }
  if (isComplete) {
    return "border-border bg-muted/50";
  }
  return "border-transparent bg-transparent";
};

const getRailStepIconClasses = (isActive: boolean, isComplete: boolean) => {
  if (isActive) {
    return "bg-primary text-primary-foreground";
  }
  if (isComplete) {
    return "bg-primary/20 text-primary";
  }
  return "bg-muted text-muted-foreground";
};

const getRailStepStatus = (isActive: boolean, isComplete: boolean) => {
  if (isComplete) {
    return "Complete";
  }
  if (isActive) {
    return "Editing";
  }
  return "Next";
};

type ResponseStepperProps = {
  onSubmit: (data: ResponseFormData) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  isSubmitting?: boolean;
};

export function ResponseStepper({
  onSubmit,
  onCancel,
  onDirtyChange,
  isSubmitting = false,
}: ResponseStepperProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const currentStep = STEPS[currentStepIndex];

  const form = useForm<ResponseFormData>({
    defaultValues: {
      json: "{}",
      name: "",
      statusCode: 200,
    },
    mode: "onChange",
    resolver: zodResolver(responseSchema),
  });

  const canProceed = () => {
    const stepId = currentStep.id;

    if (stepId === "review") {
      return true;
    }

    const value = form.watch(stepId as keyof ResponseFormData);
    const fieldState = form.getFieldState(stepId as keyof ResponseFormData);

    if (stepId === "name") {
      return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        !fieldState.invalid
      );
    }
    if (stepId === "statusCode") {
      return typeof value === "number" && !fieldState.invalid;
    }
    if (stepId === "json") {
      return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        !fieldState.invalid
      );
    }

    return false;
  };

  const handleNext = async () => {
    const stepId = currentStep.id;

    if (stepId === "review") {
      if (currentStepIndex < STEPS.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
      return;
    }

    const isValid = await form.trigger(stepId as keyof ResponseFormData);

    if (isValid && currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      const nextStep = STEPS[currentStepIndex + 1];
      if (nextStep?.id === "review") {
        await form.trigger();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (currentStep.id === "json") {
        return;
      }

      e.preventDefault();
      if (currentStepIndex === STEPS.length - 1) {
        handleSubmit();
      } else if (canProceed()) {
        handleNext();
      }
    }
  };

  const progress = ((currentStepIndex + 1) / STEPS.length) * PERCENT_MULTIPLIER;

  const formValues = form.watch();

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
    return () => onDirtyChange?.(false);
  }, [form.formState.isDirty, onDirtyChange]);

  const MIN_HTTP_STATUS = 100;
  const MAX_HTTP_STATUS = 599;

  const isFormReadyToSubmit = (): boolean => {
    if (currentStepIndex === STEPS.length - 1) {
      const hasName = Boolean(
        formValues.name && formValues.name.trim().length > 0
      );
      const hasValidStatus =
        typeof formValues.statusCode === "number" &&
        formValues.statusCode >= MIN_HTTP_STATUS &&
        formValues.statusCode <= MAX_HTTP_STATUS;
      const hasValidJson = Boolean(
        formValues.json && formValues.json.trim().length > 0
      );

      return hasName && hasValidStatus && hasValidJson && !isSubmitting;
    }
    return false;
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: ANIMATION_DURATION }}
    >
      <ResponseStepperHeader
        currentStepIndex={currentStepIndex}
        isFirstStep={currentStepIndex === 0}
        onBack={handlePrevious}
        onCancel={onCancel}
        progress={progress}
      />

      <div className="flex-1 overflow-auto bg-muted/20 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <ResponseBuilderRail
            currentStepIndex={currentStepIndex}
            formValues={formValues}
          />

          <section className="min-w-0 rounded-lg border bg-card shadow-sm">
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
                  exit={{
                    opacity: 0,
                    x: shouldReduceMotion ? 0 : -8,
                  }}
                  initial={{
                    opacity: 0,
                    x: shouldReduceMotion ? 0 : 8,
                  }}
                  key={currentStepIndex}
                  transition={{
                    duration: shouldReduceMotion
                      ? MOTION_DURATION.fast
                      : MOTION_DURATION.step,
                    ease: MOTION_EASE.out,
                  }}
                >
                  <div className="flex items-start gap-3 border-b pb-5">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-md ${currentStep.bgColor}`}
                    >
                      <currentStep.icon
                        className={`size-5 ${currentStep.color}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Badge className="mb-3" variant="secondary">
                        Step {currentStepIndex + 1}
                      </Badge>
                      <h2 className="font-semibold text-2xl tracking-tight md:text-3xl">
                        {currentStep.title}
                      </h2>
                      <p className="mt-2 max-w-2xl text-muted-foreground">
                        {currentStep.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    {currentStep.id === "name" && (
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
                                id="response-name"
                                placeholder="success_response"
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
                                      form
                                        .trigger("name")
                                        .catch(() => undefined);
                                    }}
                                    type="button"
                                  >
                                    {example}
                                  </button>
                                ))}
                              </div>
                              <FieldDescription className="mt-4">
                                Choose a stable name your team can recognize in
                                tests and traffic logs.
                              </FieldDescription>
                            </FieldContent>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    )}

                    {currentStep.id === "statusCode" && (
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
                                onAdvance={handleNext}
                                onSelect={handleNext}
                              />
                              <FieldDescription className="mt-4">
                                Pick a common status or search the complete HTTP
                                status catalog.
                              </FieldDescription>
                            </FieldContent>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    )}

                    {currentStep.id === "json" && (
                      <Controller
                        control={form.control}
                        name="json"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldContent>
                              <div className="overflow-hidden rounded-lg border bg-background shadow-xs">
                                <div className="flex items-center justify-between border-b bg-muted/35 px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">JSON</Badge>
                                    <span className="text-muted-foreground text-sm">
                                      response.json
                                    </span>
                                  </div>
                                  <span className="font-mono text-muted-foreground text-xs">
                                    editable
                                  </span>
                                </div>
                                <JsonEditor
                                  aria-invalid={fieldState.invalid}
                                  autoFocus
                                  className="[&>div:first-child]:rounded-none [&>div:first-child]:border-0"
                                  height="280px"
                                  id="response-json"
                                  onBlur={field.onBlur}
                                  onChange={field.onChange}
                                  placeholder='{\n  "name": "Novian Andika",\n  "age": 17,\n  "gender": true,\n  "jobs": ["fishing", "running"]\n}'
                                  value={field.value}
                                />
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {JSON_PRESETS.map((preset) => (
                                  <button
                                    className="rounded-md border bg-muted/40 px-2.5 py-1 font-mono text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                                    key={preset.name}
                                    onClick={() => {
                                      field.onChange(preset.value);
                                      form
                                        .trigger("json")
                                        .catch(() => undefined);
                                    }}
                                    type="button"
                                  >
                                    {preset.name}
                                  </button>
                                ))}
                              </div>
                              <FieldDescription className="mt-4">
                                Use valid JSON. The formatter button is
                                available when the payload can be parsed.
                              </FieldDescription>
                            </FieldContent>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    )}

                    {currentStep.id === "review" && (
                      <Suspense fallback={<EditorFallback />}>
                        <ResponseReviewStep formValues={formValues} />
                      </Suspense>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </form>
          </section>
        </div>
      </div>

      <ResponseStepperFooter
        canProceed={canProceed()}
        currentStepIndex={currentStepIndex}
        isFormReadyToSubmit={isFormReadyToSubmit()}
        isLastStep={currentStepIndex === STEPS.length - 1}
        isSubmitting={isSubmitting}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}

type ResponseBuilderRailProps = {
  currentStepIndex: number;
  formValues: ResponseFormData;
};

function ResponseBuilderRail({
  currentStepIndex,
  formValues,
}: ResponseBuilderRailProps) {
  return (
    <aside className="hidden rounded-lg border bg-card p-4 shadow-sm lg:sticky lg:top-6 lg:block lg:self-start">
      <div className="flex flex-col gap-5">
        <div>
          <div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Builder
          </div>
          <div className="mt-1 font-semibold text-lg">Response contract</div>
          <p className="mt-2 text-muted-foreground text-sm">
            Define the mock response returned by this endpoint.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isComplete = index < currentStepIndex;

            return (
              <div
                className={`flex items-center gap-3 rounded-md border px-3 py-3 transition-colors ${getRailStepClasses(
                  isActive,
                  isComplete
                )}`}
                key={step.id}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-md ${getRailStepIconClasses(
                    isActive,
                    isComplete
                  )}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-sm">
                    {step.title}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {getRailStepStatus(isActive, isComplete)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-md border bg-muted/35 p-3">
          <div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Draft
          </div>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="truncate font-mono">
                {formValues.name || "Not set"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-mono">{formValues.statusCode}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Payload</dt>
              <dd className="font-mono">
                {formValues.json?.trim() ? "JSON" : "Empty"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  );
}

function EditorFallback() {
  return <div className="min-h-[360px] rounded-md border bg-muted/20" />;
}
