import { ArrowRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
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
  isLastStep: boolean;
  isFormReadyToSubmit: boolean;
  isSubmitting: boolean;
  onNext: () => void;
  onSubmit: () => void;
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
  isLastStep,
  isFormReadyToSubmit,
  isSubmitting,
  onNext,
  onSubmit,
}: ResponseStepperFooterProps) {
  const currentStep = STEPS[currentStepIndex];

  return (
    <footer className="relative z-10 shrink-0 border-t bg-background/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden gap-2 sm:flex">
            {STEPS.map((step, index) => (
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
                className="size-2 rounded-full"
                key={step.id}
                transition={{ duration: ANIMATION_DURATION }}
              />
            ))}
          </div>
          <span className="max-w-[52vw] select-none truncate rounded-xl border-2 border-border/80 border-b-[3px] bg-muted/60 px-3 py-1 font-bold text-muted-foreground text-xs shadow-xs">
            {currentStep.title}
          </span>
        </div>

        <div className="flex shrink-0">
          {isLastStep ? (
            <Button
              className="rounded-xl border-2 border-primary/40 border-b-4 bg-primary font-bold text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary/95 active:translate-y-1 active:border-b-2"
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
                    strokeWidth={2.5}
                  />
                  Create Response
                </>
              )}
            </Button>
          ) : (
            <Button
              className="rounded-xl border-2 border-primary/40 border-b-4 bg-primary font-bold text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary/95 active:translate-y-1 active:border-b-2"
              disabled={!canProceed}
              onClick={onNext}
              size="lg"
              type="button"
            >
              Next
              <HugeiconsIcon
                data-icon="inline-end"
                icon={ArrowRight01Icon}
                strokeWidth={2.5}
              />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
