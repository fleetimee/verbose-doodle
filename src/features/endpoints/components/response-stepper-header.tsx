import { ArrowLeft } from "lucide-react";
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

export function ResponseStepperHeader({
  currentStepIndex,
  progress,
  onBack,
  onCancel,
  isFirstStep,
}: ResponseStepperHeaderProps) {
  return (
    <>
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
              onClick={isFirstStep ? onCancel : onBack}
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
    </>
  );
}
