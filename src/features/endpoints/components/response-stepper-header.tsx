import { ArrowLeft02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  PERCENT_MULTIPLIER,
  STEPS,
} from "@/features/endpoints/constants/stepper-steps";
import { formatMessage, messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

type ResponseStepperHeaderProps = {
  currentStepIndex: number;
  progress: number;
  onBack: () => void;
  onCancel: () => void;
  isFirstStep: boolean;
};

const getHeaderStepClasses = (isActive: boolean, isComplete: boolean) => {
  if (isActive) {
    return "border border-primary/40 bg-primary/10 text-foreground";
  }
  if (isComplete) {
    return "border border-border/70 bg-muted/30 text-foreground";
  }
  return "border border-border/50 bg-background text-muted-foreground";
};

const getHeaderStepIconClasses = (isActive: boolean, isComplete: boolean) => {
  if (isActive) {
    return "bg-primary text-primary-foreground font-bold";
  }
  if (isComplete) {
    return "bg-primary/20 text-primary font-bold";
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
  const endpointMessages = messages.endpoints;

  return (
    <header className="shrink-0 border-b bg-background/95 backdrop-blur">
      <div className="h-1 bg-muted">
        <motion.div
          animate={{ transform: `scaleX(${progress / PERCENT_MULTIPLIER})` }}
          className="h-full bg-primary"
          initial={{ transform: "scaleX(0)" }}
          style={{ transformOrigin: "left" }}
          transition={{
            duration: MOTION_DURATION.standard,
            ease: MOTION_EASE.inOut,
          }}
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              aria-label={
                isFirstStep
                  ? endpointMessages.responseBuilderCloseAriaLabel
                  : endpointMessages.responseBuilderBackAriaLabel
              }
              className="rounded-xl border border-border/80 bg-background/80 shadow-xs hover:bg-accent"
              onClick={isFirstStep ? onCancel : onBack}
              size="icon"
              variant="ghost"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
            </Button>
            <div className="min-w-0">
              <div className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                {formatMessage(endpointMessages.responseBuilderStepLabel, {
                  current: currentStepIndex + 1,
                  total: STEPS.length,
                })}
              </div>
              <h1 className="truncate font-bold text-lg tracking-tight">
                {endpointMessages.responseBuilderTitle}
              </h1>
            </div>
          </div>
          <Button
            aria-label={endpointMessages.responseBuilderCancelAriaLabel}
            className="rounded-xl border border-border/80 bg-background/80 shadow-xs hover:bg-accent"
            onClick={onCancel}
            size="icon"
            variant="ghost"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isComplete = index < currentStepIndex;

            return (
              <div
                className={`flex min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${getHeaderStepClasses(
                  isActive,
                  isComplete
                )}`}
                key={step.id}
              >
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${getHeaderStepIconClasses(
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
