import { ArrowRight, Check } from "lucide-react";
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
  const step = STEPS[index];
  // Map step colors to actual color values for animation
  const colorMap: Record<string, string> = {
    "text-blue-500": "rgb(59, 130, 246)",
    "text-emerald-500": "rgb(16, 185, 129)",
    "text-violet-500": "rgb(139, 92, 246)",
    "text-purple-500": "rgb(168, 85, 247)",
    "text-amber-500": "rgb(245, 158, 11)",
  };

  if (index < currentStepIndex) {
    // Completed step - use step color
    return colorMap[step.color] || "rgb(59, 130, 246)";
  }
  if (index === currentStepIndex) {
    // Active step - use step color
    return colorMap[step.color] || "rgb(59, 130, 246)";
  }
  // Upcoming step - muted color
  return "hsl(var(--muted))";
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
  return (
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
                backgroundColor: getStepIndicatorColor(index, currentStepIndex),
                opacity:
                  index === currentStepIndex
                    ? ACTIVE_INDICATOR_OPACITY
                    : INACTIVE_INDICATOR_OPACITY,
              }}
              className="h-2 w-2 rounded-full"
              key={step.id}
              transition={{ duration: ANIMATION_DURATION }}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {isLastStep ? (
            <Button
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
                  <Check className="mr-2 h-4 w-4" />
                  Create Response
                </>
              )}
            </Button>
          ) : (
            <Button
              disabled={!canProceed}
              onClick={onNext}
              size="lg"
              type="button"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
