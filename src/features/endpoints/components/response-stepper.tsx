import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Code2,
  FileText,
  Hash,
  Sparkles,
} from "lucide-react";
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
import {
  type ResponseFormData,
  responseSchema,
} from "@/features/endpoints/schemas/response-schema";

type ResponseStepperProps = {
  onSubmit: (data: ResponseFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

const STEPS = [
  {
    id: "name",
    title: "Response Name",
    description: "What should we call this response?",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "statusCode",
    title: "Status Code",
    description: "Which HTTP status code?",
    icon: Hash,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    id: "json",
    title: "JSON Response",
    description: "What data should it return?",
    icon: Code2,
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    id: "activated",
    title: "Activate Response",
    description: "Set as active response?",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
] as const;

const PERCENT_MULTIPLIER = 100;
const ACTIVE_INDICATOR_SCALE = 1.2;
const INACTIVE_INDICATOR_SCALE = 1;
const INACTIVE_INDICATOR_OPACITY = 0.6;
const ANIMATION_DURATION = 0.2;
const STEP_TRANSITION_DURATION = 0.3;

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
    const fieldName = currentStep.id;
    const value = form.watch(fieldName);
    const fieldState = form.getFieldState(fieldName);

    // Check if field has value and is valid
    if (fieldName === "name") {
      return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        !fieldState.invalid
      );
    }
    if (fieldName === "statusCode") {
      return typeof value === "number" && !fieldState.invalid;
    }
    if (fieldName === "json") {
      return (
        typeof value === "string" &&
        value.trim().length > 0 &&
        !fieldState.invalid
      );
    }
    if (fieldName === "activated") {
      return true; // Always can proceed from activation step
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
    const fieldName = currentStep.id;
    const isValid = await form.trigger(fieldName);

    if (isValid && currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      // Trigger validation of all fields when reaching the final step
      if (currentStepIndex + 1 === STEPS.length - 1) {
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
                              className="h-16 text-2xl"
                              id="response-name"
                              placeholder="e.g., success_response, error_response"
                            />
                            <FieldDescription className="text-base">
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
                            <Input
                              {...field}
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                              autoFocus
                              className="h-16 text-2xl"
                              id="response-status-code"
                              inputMode="numeric"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              placeholder="200"
                              type="number"
                              value={field.value}
                            />
                            <FieldDescription className="text-base">
                              Common codes: 200 (Success), 400 (Bad Request),
                              404 (Not Found), 500 (Server Error)
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
