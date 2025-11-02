import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { JsonEditor } from "@/features/endpoints/components/json-editor";
import { ResponseReviewStep } from "@/features/endpoints/components/response-review-step";
import { StatusCodeCombobox } from "@/features/endpoints/components/status-code-combobox";
import {
  ACTIVE_INDICATOR_SCALE,
  ANIMATION_DURATION,
  INACTIVE_INDICATOR_OPACITY,
  INACTIVE_INDICATOR_SCALE,
  PERCENT_MULTIPLIER,
  STEP_TRANSITION_DURATION,
  STEPS,
} from "@/features/endpoints/constants/stepper-steps";
import {
  type ResponseFormData,
  responseSchema,
} from "@/features/endpoints/schemas/response-schema";

type ResponseStepperProps = {
  onSubmit: (data: ResponseFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export function ResponseStepper({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ResponseStepperProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = STEPS[currentStepIndex];

  const form = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      name: "",
      json: "{}",
      statusCode: 200,
      activated: false,
    },
    mode: "onChange",
  });

  const canProceed = () => {
    const stepId = currentStep.id;

    // Review and activation steps don't require validation
    if (stepId === "review" || stepId === "activated") {
      return true;
    }

    // For form field steps, check validation
    const value = form.watch(stepId as keyof ResponseFormData);
    const fieldState = form.getFieldState(stepId as keyof ResponseFormData);

    // Check if field has value and is valid
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

  const getStepIndicatorClass = (index: number) => {
    const step = STEPS[index];
    if (index < currentStepIndex) {
      // Completed step - use step color
      return step.color.replace("text-", "bg-");
    }
    if (index === currentStepIndex) {
      // Active step - use step color with opacity
      return `${step.color.replace("text-", "bg-")}/70`;
    }
    return "bg-muted";
  };

  const handleNext = async () => {
    const stepId = currentStep.id;

    // For review and activation steps, just proceed
    if (stepId === "review" || stepId === "activated") {
      if (currentStepIndex < STEPS.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
      return;
    }

    // For form field steps, validate first
    const isValid = await form.trigger(stepId as keyof ResponseFormData);

    if (isValid && currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      // Trigger validation of all fields when reaching the review step
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
      // Don't intercept Enter on JSON step (let CodeMirror handle it)
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

  // Watch all form values to ensure button reactivity
  const formValues = form.watch();

  const MIN_HTTP_STATUS = 100;
  const MAX_HTTP_STATUS = 599;

  const isFormReadyToSubmit = () => {
    // On final step, check if all previous fields are valid
    if (currentStepIndex === STEPS.length - 1) {
      const hasName = formValues.name && formValues.name.trim().length > 0;
      const hasValidStatus =
        typeof formValues.statusCode === "number" &&
        formValues.statusCode >= MIN_HTTP_STATUS &&
        formValues.statusCode <= MAX_HTTP_STATUS;
      const hasValidJson = formValues.json && formValues.json.trim().length > 0;

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
      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <motion.div
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          transition={{ duration: STEP_TRANSITION_DURATION, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <div className="border-b px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={currentStepIndex === 0 ? onCancel : handlePrevious}
              size="icon"
              variant="ghost"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="font-medium text-muted-foreground text-sm">
                Step {currentStepIndex + 1} of {STEPS.length}
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
                key={currentStepIndex}
                transition={{
                  duration: STEP_TRANSITION_DURATION,
                  ease: "easeInOut",
                }}
              >
                {/* Step Header with Icon */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${currentStep.bgColor}`}
                    >
                      <currentStep.icon
                        className={`h-7 w-7 ${currentStep.color}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <h2 className="font-semibold text-3xl tracking-tight md:text-4xl">
                        {currentStep.title}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {currentStep.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4">
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
                              className="h-20 rounded-none border-0 border-border border-b-2 px-0 text-3xl shadow-none focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive md:text-4xl"
                              id="response-name"
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

                  {currentStep.id === "statusCode" && (
                    <Controller
                      control={form.control}
                      name="statusCode"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldContent>
                            <StatusCodeCombobox
                              field={field}
                              fieldError={fieldState.error}
                              onAdvance={handleNext}
                              onSelect={handleNext}
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

                  {currentStep.id === "json" && (
                    <Controller
                      control={form.control}
                      name="json"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldContent>
                            <JsonEditor
                              aria-invalid={fieldState.invalid}
                              autoFocus
                              id="response-json"
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

                  {currentStep.id === "review" && (
                    <ResponseReviewStep formValues={formValues} />
                  )}

                  {currentStep.id === "activated" && (
                    <Controller
                      control={form.control}
                      name="activated"
                      render={({ field }) => (
                        <Field>
                          <div className="flex flex-col items-start gap-6 rounded-xl border-2 bg-gradient-to-br from-background to-muted/20 p-8 shadow-sm md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                              <FieldLabel
                                className="font-semibold text-xl"
                                htmlFor="response-activated"
                              >
                                Activate this response
                              </FieldLabel>
                              <FieldDescription className="text-base">
                                When activated, this response will be returned
                                for all requests to this endpoint. You can
                                change this later from the endpoint details
                                page.
                              </FieldDescription>
                            </div>
                            <Switch
                              checked={field.value}
                              className="scale-150"
                              id="response-activated"
                              onCheckedChange={field.onChange}
                            />
                          </div>
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

      {/* Footer */}
      <div className="relative z-10 shrink-0 border-t bg-background px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {STEPS.map((step, index) => (
              <motion.div
                animate={{
                  scale:
                    index === currentStepIndex
                      ? ACTIVE_INDICATOR_SCALE
                      : INACTIVE_INDICATOR_SCALE,
                  opacity:
                    index === currentStepIndex ? 1 : INACTIVE_INDICATOR_OPACITY,
                }}
                className={`h-2 w-2 rounded-full ${getStepIndicatorClass(index)}`}
                key={step.id}
                transition={{ duration: ANIMATION_DURATION }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStepIndex < STEPS.length - 1 ? (
              <Button
                disabled={!canProceed()}
                onClick={handleNext}
                size="lg"
                type="button"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                disabled={!isFormReadyToSubmit()}
                onClick={handleSubmit}
                size="lg"
                type="button"
              >
                {isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Response
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
