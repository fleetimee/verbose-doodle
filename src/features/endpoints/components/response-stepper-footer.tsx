import {
  ArrowLeft02Icon,
  ArrowRight01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ACTIVE_INDICATOR_OPACITY,
  ACTIVE_INDICATOR_SCALE,
  ANIMATION_DURATION,
  INACTIVE_INDICATOR_OPACITY,
  INACTIVE_INDICATOR_SCALE,
  STEPS,
} from "@/features/endpoints/constants/stepper-steps";

type ResponseStepperFooterProps = {
  currentStepIndex: number;
  canProceed: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  isFormReadyToSubmit: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onStepClick?: (index: number) => void;
};

const getStepIndicatorColor = (index: number, currentStepIndex: number) => {
  if (index <= currentStepIndex) {
    // Completed or active step - use primary theme color
    return "var(--primary)";
  }
  // Upcoming step - muted border color
  return "var(--border)";
};

export function ResponseStepperFooter({
  currentStepIndex,
  canProceed,
  isFirstStep,
  isLastStep,
  isFormReadyToSubmit,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  onStepClick,
}: ResponseStepperFooterProps) {
  const currentStep = STEPS[currentStepIndex];

  return (
    <footer className="relative z-10 shrink-0 border-t bg-background/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            {STEPS.map((step, index) => (
              <button
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                className="group flex cursor-pointer items-center justify-center p-1 focus-visible:outline-none"
                key={step.id}
                onClick={() => onStepClick?.(index)}
                type="button"
              >
                <motion.div
                  animate={{
                    backgroundColor: getStepIndicatorColor(
                      index,
                      currentStepIndex
                    ),
                    opacity:
                      index === currentStepIndex
                        ? ACTIVE_INDICATOR_OPACITY
                        : INACTIVE_INDICATOR_OPACITY,
                    scale:
                      index === currentStepIndex
                        ? ACTIVE_INDICATOR_SCALE
                        : INACTIVE_INDICATOR_SCALE,
                  }}
                  className="size-2 rounded-full transition-transform group-hover:scale-125"
                  transition={{ duration: ANIMATION_DURATION }}
                />
              </button>
            ))}
          </div>
          <span className="max-w-[52vw] select-none truncate rounded-xl border border-border/80 bg-muted/50 px-3 py-1 font-semibold text-muted-foreground text-xs shadow-xs">
            {currentStep.title}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {!isFirstStep && (
            <Button
              className="rounded-xl border border-border/80 bg-background font-semibold shadow-xs transition-all duration-150 hover:bg-accent active:translate-y-0.5"
              onClick={onBack}
              size="lg"
              type="button"
              variant="outline"
            >
              <HugeiconsIcon
                data-icon="inline-start"
                icon={ArrowLeft02Icon}
                strokeWidth={2}
              />
              Back
            </Button>
          )}

          {isLastStep ? (
            <Button
              className="rounded-xl border-2 border-primary/40 border-b-4 bg-primary font-bold text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary/95 active:translate-y-0.5 active:border-b-2"
              disabled={!isFormReadyToSubmit}
              onClick={onSubmit}
              size="lg"
              type="button"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    data-icon="inline-start"
                    icon={Tick02Icon}
                    strokeWidth={2}
                  />
                  Create Response
                </>
              )}
            </Button>
          ) : (
            <Button
              className="rounded-xl border-2 border-primary/40 border-b-4 bg-primary font-bold text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary/95 active:translate-y-0.5 active:border-b-2"
              disabled={!canProceed}
              onClick={onNext}
              size="lg"
              type="button"
            >
              Next
              <HugeiconsIcon
                data-icon="inline-end"
                icon={ArrowRight01Icon}
                strokeWidth={2}
              />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
