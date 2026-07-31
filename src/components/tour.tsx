"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Torus } from "@/components/hugeicons";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface TourStep {
  borderRadius?: number;
  closeable?: boolean;
  content: React.ReactNode;
  height?: number;
  onClickWithinArea?: () => void;
  padding?: number;
  position?: "top" | "bottom" | "left" | "right";
  selectorId: string;
  showSkip?: boolean;
  width?: number;
}

export interface TourDefinition {
  id: string;
  steps: TourStep[];
}

interface TourContextType {
  activeTourId: string | null;
  currentStep: number;
  endTour: () => void;
  isActive: boolean;
  isTourCompleted: boolean;
  nextStep: () => void;
  previousStep: () => void;
  setIsTourCompleted: (completed: boolean) => void;
  setSteps: (steps: TourStep[]) => void;
  startTour: (tourId?: string) => void;
  steps: TourStep[];
  totalSteps: number;
}

interface TourProviderProps {
  children: React.ReactNode;
  className?: string;
  closeable?: boolean;
  isTourCompleted?: boolean;
  onComplete?: (tourId: string) => void;
  onSkip?: (tourId: string, step: number) => void;
  onStart?: (tourId: string) => void;
  onStepChange?: (tourId: string, step: number) => void;
  tours?: TourDefinition[];
}

const TourContext = createContext<TourContextType | null>(null);
const PADDING = 16;

function getElementPosition(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  };
}

function calculateContentPosition(
  elementPos: { top: number; left: number; width: number; height: number },
  position: "top" | "bottom" | "left" | "right" | undefined,
  contentSize: { width: number; height: number }
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const elementCenterX = elementPos.left + elementPos.width / 2;
  const elementInRightHalf = elementCenterX > viewportWidth / 2;

  let left = elementPos.left;
  let top = elementPos.top;

  switch (position ?? "bottom") {
    case "top":
      top = elementPos.top - PADDING - contentSize.height;
      left = elementInRightHalf
        ? elementPos.left + elementPos.width - contentSize.width
        : elementPos.left;
      break;
    case "bottom":
      top = elementPos.top + elementPos.height + PADDING;
      left = elementInRightHalf
        ? elementPos.left + elementPos.width - contentSize.width
        : elementPos.left;
      break;
    case "left":
      left = elementPos.left - PADDING - contentSize.width;
      top = elementPos.top + elementPos.height / 2 - contentSize.height / 2;
      break;
    case "right":
      left = elementPos.left + elementPos.width + PADDING;
      top = elementPos.top + elementPos.height / 2 - contentSize.height / 2;
      break;
    default:
      break;
  }

  top = Math.max(
    PADDING,
    Math.min(top, viewportHeight - contentSize.height - PADDING)
  );
  left = Math.max(
    PADDING,
    Math.min(left, viewportWidth - contentSize.width - PADDING)
  );

  return { left, top };
}

export function TourProvider({
  isTourCompleted = false,
  closeable = false,
  className,
  children,
  tours,
  onStart,
  onSkip,
  onComplete,
  onStepChange,
}: TourProviderProps) {
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [elementPosition, setElementPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(isTourCompleted);
  const shouldReduceMotion = useReducedMotion();

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentSize, setContentSize] = useState({ height: 200, width: 300 });
  const contentTransitioning = useRef(false);
  const previousStepRef = useRef(-1);

  useEffect(() => {
    if (currentStep >= 0 && previousStepRef.current >= 0) {
      contentTransitioning.current = true;
    }
    previousStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (contentTransitioning.current || !entry) {
        return;
      }
      setContentSize({
        height: entry.contentRect.height,
        width: entry.contentRect.width,
      });
    });

    observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, []);

  const updateElementPosition = useCallback(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      return;
    }

    const element = document.getElementById(
      steps[currentStep]?.selectorId ?? ""
    );

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();

    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    setElementPosition(getElementPosition(element));
  }, [currentStep, steps]);

  useEffect(() => {
    updateElementPosition();
    window.addEventListener("resize", updateElementPosition);
    window.addEventListener("scroll", updateElementPosition);

    return () => {
      window.removeEventListener("resize", updateElementPosition);
      window.removeEventListener("scroll", updateElementPosition);
    };
  }, [updateElementPosition]);

  const nextStep = useCallback(() => {
    setCurrentStep((previous) => {
      const isLast = previous >= steps.length - 1;

      if (isLast) {
        setIsCompleted(true);
        onComplete?.(activeTourId ?? "default");
        return -1;
      }

      const next = previous + 1;
      onStepChange?.(activeTourId ?? "default", next);

      return next;
    });
  }, [activeTourId, onComplete, onStepChange, steps.length]);

  const previousStep = useCallback(() => {
    setCurrentStep((previous) => {
      if (previous <= 0) {
        return previous;
      }

      const next = previous - 1;
      onStepChange?.(activeTourId ?? "default", next);

      return next;
    });
  }, [activeTourId, onStepChange]);

  const endTour = useCallback(() => {
    onSkip?.(activeTourId ?? "default", currentStep);
    setCurrentStep(-1);
  }, [activeTourId, currentStep, onSkip]);

  const startTour = useCallback(
    (tourId?: string) => {
      setIsCompleted(false);

      if (tourId && tours) {
        const tour = tours.find((item) => item.id === tourId);

        if (!tour) {
          return;
        }

        setActiveTourId(tourId);
        setSteps(tour.steps);
      } else if (!(tourId || tours)) {
        setActiveTourId("default");
      } else if (tourId) {
        setActiveTourId(tourId);
      }

      setCurrentStep(0);
      onStart?.(tourId ?? activeTourId ?? "default");
    },
    [activeTourId, onStart, tours]
  );

  useEffect(() => {
    if (currentStep < 0) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
          nextStep();
          break;
        case "ArrowLeft":
          previousStep();
          break;
        case "Escape":
          endTour();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [currentStep, endTour, nextStep, previousStep]);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      const currentStepData = steps[currentStep];

      if (
        !(
          currentStep >= 0 &&
          elementPosition &&
          currentStepData?.onClickWithinArea
        )
      ) {
        return;
      }

      const clickX = event.clientX;
      const clickY = event.clientY;
      const areaWidth = currentStepData.width || elementPosition.width;
      const areaHeight = currentStepData.height || elementPosition.height;
      const isWithinBounds =
        clickX >= elementPosition.left &&
        clickX <= elementPosition.left + areaWidth &&
        clickY >= elementPosition.top &&
        clickY <= elementPosition.top + areaHeight;

      if (isWithinBounds) {
        currentStepData.onClickWithinArea();
      }
    },
    [currentStep, elementPosition, steps]
  );

  useEffect(() => {
    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, [handleClick]);

  const setIsTourCompleted = useCallback((completed: boolean) => {
    setIsCompleted(completed);
  }, []);

  const currentStepData = steps[currentStep];
  const spotlightPadding = currentStepData?.padding ?? 8;
  const spotlightBorderRadius = currentStepData?.borderRadius ?? 8;
  const isCloseable = currentStepData?.closeable ?? closeable;
  const isLastStep = currentStep === steps.length - 1;
  const showSkip = !isLastStep && currentStepData?.showSkip !== false;
  const spotlightWidth = currentStepData?.width || elementPosition?.width || 0;
  const spotlightHeight =
    currentStepData?.height || elementPosition?.height || 0;

  const contentPosition = useMemo(
    () =>
      elementPosition
        ? calculateContentPosition(
            elementPosition,
            currentStepData?.position,
            contentSize
          )
        : { left: 0, top: 0 },
    [contentSize, currentStepData?.position, elementPosition]
  );

  return (
    <TourContext.Provider
      value={{
        activeTourId,
        currentStep,
        endTour,
        isActive: currentStep >= 0,
        isTourCompleted: isCompleted,
        nextStep,
        previousStep,
        setIsTourCompleted,
        setSteps,
        startTour,
        steps,
        totalSteps: steps.length,
      }}
    >
      {children}
      <AnimatePresence>
        {currentStep >= 0 && elementPosition && (
          <>
            <motion.svg
              animate={{ opacity: 1 }}
              className="pointer-events-auto fixed inset-0 z-50 h-full w-full"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              <defs>
                <mask id="tour-mask">
                  <rect fill="white" height="100%" width="100%" />
                  <rect
                    fill="black"
                    height={spotlightHeight + spotlightPadding * 2}
                    rx={spotlightBorderRadius}
                    ry={spotlightBorderRadius}
                    width={spotlightWidth + spotlightPadding * 2}
                    x={elementPosition.left - spotlightPadding}
                    y={elementPosition.top - spotlightPadding}
                  />
                </mask>
              </defs>
              <rect
                fill="rgba(0,0,0,0.5)"
                height="100%"
                mask="url(#tour-mask)"
                width="100%"
              />
            </motion.svg>
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "z-[100] border-2 border-muted-foreground",
                className
              )}
              exit={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.95,
              }}
              initial={{
                opacity: 0,
                scale: shouldReduceMotion ? 1 : 0.95,
              }}
              style={{
                borderRadius: spotlightBorderRadius,
                height: spotlightHeight,
                left: elementPosition.left,
                position: "fixed",
                top: elementPosition.top,
                width: spotlightWidth,
              }}
            />

            <motion.div
              animate={{
                left: contentPosition.left,
                opacity: 1,
                top: contentPosition.top,
                y: 0,
              }}
              className="relative z-[100] rounded-lg border bg-background p-4 shadow-lg"
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              ref={contentRef}
              style={{
                maxWidth: 400,
                minWidth: 300,
                position: "fixed",
              }}
              transition={{
                duration: shouldReduceMotion
                  ? MOTION_DURATION.instant
                  : MOTION_DURATION.panel,
                ease: MOTION_EASE.inOut,
                opacity: { duration: MOTION_DURATION.standard },
              }}
            >
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {currentStep + 1} / {steps.length}
                </span>
                {isCloseable && (
                  <button
                    className="inline-flex size-6 items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(event) => {
                      event.stopPropagation();
                      endTour();
                    }}
                    type="button"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                    <span className="sr-only">Close</span>
                  </button>
                )}
              </div>
              <AnimatePresence mode="wait">
                <div>
                  <motion.div
                    animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
                    className="overflow-hidden"
                    exit={{
                      filter: shouldReduceMotion ? "blur(0px)" : "blur(2px)",
                      opacity: 0,
                      scale: shouldReduceMotion ? 1 : 0.97,
                    }}
                    initial={{
                      filter: shouldReduceMotion ? "blur(0px)" : "blur(2px)",
                      opacity: 0,
                      scale: shouldReduceMotion ? 1 : 0.97,
                    }}
                    key={`tour-content-${currentStep}`}
                    onAnimationComplete={() => {
                      contentTransitioning.current = false;
                      if (contentRef.current) {
                        const rect = contentRef.current.getBoundingClientRect();
                        setContentSize({
                          height: rect.height,
                          width: rect.width,
                        });
                      }
                    }}
                    transition={{
                      duration: MOTION_DURATION.standard,
                      ease: MOTION_EASE.out,
                    }}
                  >
                    {steps[currentStep]?.content}
                  </motion.div>
                  <div className="mt-4 flex items-center justify-between">
                    {showSkip ? (
                      <button
                        className="text-muted-foreground text-xs hover:text-foreground"
                        onClick={endTour}
                        type="button"
                      >
                        Skip tour
                      </button>
                    ) : (
                      <div />
                    )}
                    <div className="flex gap-2">
                      {currentStep > 0 && (
                        <Button
                          onClick={previousStep}
                          size="sm"
                          variant="outline"
                        >
                          Previous
                        </Button>
                      )}
                      <Button onClick={nextStep} size="sm">
                        {currentStep === steps.length - 1 ? "Finish" : "Next"}
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);

  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }

  return context;
}

export function TourAlertDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { startTour, steps, isTourCompleted, currentStep } = useTour();
  const shouldReduceMotion = useReducedMotion();

  if (isTourCompleted || steps.length === 0 || currentStep > -1) {
    return null;
  }

  const handleSkip = () => {
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md p-6">
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <motion.div
              animate={{
                filter: "blur(0px)",
                rotate: shouldReduceMotion ? 42 : [42, 48, 42],
                scale: 1,
                y: shouldReduceMotion ? 0 : [0, -8, 0],
              }}
              initial={{
                filter: shouldReduceMotion ? "blur(0px)" : "blur(10px)",
                scale: shouldReduceMotion ? 1 : 0.9,
              }}
              transition={{
                duration: MOTION_DURATION.standard,
                ease: MOTION_EASE.out,
                rotate: shouldReduceMotion
                  ? { duration: MOTION_DURATION.instant }
                  : {
                      duration: 3,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    },
                y: shouldReduceMotion
                  ? { duration: MOTION_DURATION.instant }
                  : {
                      duration: 2.5,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    },
              }}
            >
              <Torus className="size-32 stroke-1 text-primary" />
            </motion.div>
          </div>
          <AlertDialogTitle className="text-center font-medium text-xl">
            Welcome to the Tour
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-center text-muted-foreground text-sm">
            Take a quick tour to learn about the key features and functionality
            of this application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-6 flex flex-col gap-3">
          <Button className="w-full" onClick={() => startTour()}>
            Start Tour
          </Button>
          <Button className="w-full" onClick={handleSkip} variant="ghost">
            Skip Tour
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
