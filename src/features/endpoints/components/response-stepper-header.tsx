import { ArrowLeft, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  STEP_TRANSITION_DURATION,
  STEPS,
} from "@/features/endpoints/constants/stepper-steps";

type ResponseStepperHeaderProps = {
  currentStepIndex: number;
  progress: number;
  onBack: () => void;
  onCancel: () => void;
  isFirstStep: boolean;
};

const getHeaderStepClasses = (isActive: boolean, isComplete: boolean) => {
  if (isActive) {
    return "border-primary/40 bg-primary/10 text-foreground";
  }
  if (isComplete) {
    return "border-border bg-muted/40 text-foreground";
  }
  return "border-border/70 bg-background text-muted-foreground";
};

const getHeaderStepIconClasses = (isActive: boolean, isComplete: boolean) => {
  if (isActive) {
    return "bg-primary text-primary-foreground";
  }
  if (isComplete) {
    return "bg-primary/20 text-primary";
  }
  return "bg-muted text-muted-foreground";
};

export function ResponseStepperHeader({
  currentStepIndex,
  progress,
  onBack,
  onCancel,
  isFirstStep,
}: ResponseStepperHeaderProps) {
  return (
    <header className="shrink-0 border-b bg-background/95 backdrop-blur">
      <div className="h-1 bg-muted">
        <motion.div
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          transition={{ duration: STEP_TRANSITION_DURATION, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              aria-label={isFirstStep ? "Close response builder" : "Go back"}
              onClick={isFirstStep ? onCancel : onBack}
              size="icon"
              variant="ghost"
            >
              <ArrowLeft />
            </Button>
            <div className="min-w-0">
              <div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Step {currentStepIndex + 1} of {STEPS.length}
              </div>
              <h1 className="truncate font-semibold text-lg tracking-tight">
                Create Response
              </h1>
            </div>
          </div>
          <Button
            aria-label="Cancel response builder"
            onClick={onCancel}
            size="icon"
            variant="ghost"
          >
            <X />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isComplete = index < currentStepIndex;

            return (
              <div
                className={`flex min-w-0 items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${getHeaderStepClasses(
                  isActive,
                  isComplete
                )}`}
                key={step.id}
              >
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-md ${getHeaderStepIconClasses(
                    isActive,
                    isComplete
                  )}`}
                >
                  <Icon className="size-3.5" />
                </div>
                <span className="truncate font-medium">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
