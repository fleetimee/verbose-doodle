import { CircleHelp } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { type TourStep, useTour } from "@/components/tour";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";

export type DeveloperToolTourStep = {
  readonly description: string;
  readonly position?: "top" | "bottom" | "left" | "right";
  readonly selectorId: string;
  readonly title: string;
};

type DeveloperToolTourButtonProps = {
  readonly label: string;
  readonly storageKey: string;
  readonly steps: readonly DeveloperToolTourStep[];
  readonly tourId: string;
};

const AUTO_START_DELAY_MS = 350;

function TourStepContent({
  description,
  title,
}: Pick<DeveloperToolTourStep, "description" | "title">) {
  return (
    <div className="flex flex-col gap-2 pr-10">
      <h2 className="font-semibold text-base">{title}</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function DeveloperToolTourButton({
  label,
  steps,
  storageKey,
  tourId,
}: DeveloperToolTourButtonProps) {
  const [hasSeenTour, setHasSeenTour] = useLocalStorage(storageKey, false);
  const hasStartedTour = useRef(false);
  const shouldMarkTourSeenOnEnd = useRef(false);
  const { activeTourId, isActive, setSteps, startTour } = useTour();

  const tourSteps = useMemo<TourStep[]>(
    () =>
      steps.map((step) => ({
        selectorId: step.selectorId,
        position: step.position,
        content: (
          <TourStepContent description={step.description} title={step.title} />
        ),
      })),
    [steps]
  );

  const handleStartTour = useCallback(() => {
    hasStartedTour.current = true;
    shouldMarkTourSeenOnEnd.current = true;
    setSteps(tourSteps);
    startTour(tourId);
  }, [setSteps, startTour, tourId, tourSteps]);

  useEffect(() => {
    if (hasSeenTour || hasStartedTour.current || tourSteps.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (!hasStartedTour.current) {
        handleStartTour();
      }
    }, AUTO_START_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [handleStartTour, hasSeenTour, tourSteps.length]);

  useEffect(() => {
    if (
      shouldMarkTourSeenOnEnd.current &&
      activeTourId === tourId &&
      !isActive
    ) {
      shouldMarkTourSeenOnEnd.current = false;
      setHasSeenTour(true);
    }
  }, [activeTourId, isActive, setHasSeenTour, tourId]);

  return (
    <Button
      className="w-fit rounded-md"
      onClick={handleStartTour}
      size="sm"
      type="button"
      variant="outline"
    >
      <CircleHelp data-icon="inline-start" />
      {label}
    </Button>
  );
}
