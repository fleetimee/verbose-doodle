import { CheckCircle2Icon, RefreshCwIcon, ShieldCheckIcon } from "lucide-react";
import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type SliderCaptchaProps = {
  onVerify: (verified: boolean) => void;
  className?: string;
  imageUrl?: string;
};

const PUZZLE_SIZE = 60;
const PUZZLE_NOTCH = 10;

export const SliderCaptcha = ({
  onVerify,
  className,
  imageUrl = "/assets/frieren-ambience.png",
}: SliderCaptchaProps) => {
  const [sliderValue, setSliderValue] = React.useState([0]);
  const [targetPosition, setTargetPosition] = React.useState(0);
  const [targetY, setTargetY] = React.useState(0);
  const [isVerified, setIsVerified] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    const generatePosition = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setContainerWidth(width);

      const minX = PUZZLE_SIZE + 20;
      const maxX = width - PUZZLE_SIZE - 20;
      const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

      const imageHeight = 200;
      const minY = 20;
      const maxY = imageHeight - PUZZLE_SIZE - 20;
      const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

      setTargetPosition(randomX);
      setTargetY(randomY);
    };

    generatePosition();

    const handleResize = () => generatePosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (!hasInteracted || !containerWidth) return;

    const currentPixels = (sliderValue[0] ?? 0) * (containerWidth / 100);
    const tolerance = 8;
    const isCloseEnough = Math.abs(currentPixels - targetPosition) <= tolerance;

    if (isCloseEnough && !isVerified) {
      setIsVerified(true);
      onVerify(true);
    } else if (!isCloseEnough && isVerified) {
      setIsVerified(false);
      onVerify(false);
    }
  }, [
    sliderValue,
    targetPosition,
    isVerified,
    onVerify,
    hasInteracted,
    containerWidth,
  ]);

  const handleValueChange = (value: number[]) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    setSliderValue(value);
  };

  const handleRefresh = () => {
    setSliderValue([0]);
    setIsVerified(false);
    setHasInteracted(false);

    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;

    const minX = PUZZLE_SIZE + 20;
    const maxX = width - PUZZLE_SIZE - 20;
    const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

    const imageHeight = 200;
    const minY = 20;
    const maxY = imageHeight - PUZZLE_SIZE - 20;
    const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    setTargetPosition(randomX);
    setTargetY(randomY);
  };

  const getStatusColor = () => {
    if (!hasInteracted) return "border-border";
    if (isVerified) return "border-green-500 bg-green-50 dark:bg-green-950/20";
    return "border-orange-400 bg-orange-50 dark:bg-orange-950/20";
  };

  const currentPixelPosition = (sliderValue[0] ?? 0) * (containerWidth / 100);

  const puzzlePath = `
    M 0,${PUZZLE_NOTCH}
    Q 0,0 ${PUZZLE_NOTCH},0
    L ${PUZZLE_SIZE / 2 - PUZZLE_NOTCH},0
    Q ${PUZZLE_SIZE / 2},${-PUZZLE_NOTCH} ${PUZZLE_SIZE / 2 + PUZZLE_NOTCH},0
    L ${PUZZLE_SIZE - PUZZLE_NOTCH},0
    Q ${PUZZLE_SIZE},0 ${PUZZLE_SIZE},${PUZZLE_NOTCH}
    L ${PUZZLE_SIZE},${PUZZLE_SIZE - PUZZLE_NOTCH}
    Q ${PUZZLE_SIZE},${PUZZLE_SIZE} ${PUZZLE_SIZE - PUZZLE_NOTCH},${PUZZLE_SIZE}
    L ${PUZZLE_NOTCH},${PUZZLE_SIZE}
    Q 0,${PUZZLE_SIZE} 0,${PUZZLE_SIZE - PUZZLE_NOTCH}
    Z
  `;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border p-4 transition-all duration-300",
          getStatusColor()
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon
              className={cn(
                "size-5 transition-colors",
                isVerified ? "text-green-600" : "text-muted-foreground"
              )}
            />
            <span className="font-medium text-sm">
              {isVerified ? "Verified" : "Slide to complete the puzzle"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isVerified && (
              <CheckCircle2Icon className="size-5 animate-in zoom-in-50 text-green-600 duration-300" />
            )}
            <button
              aria-label="Generate new puzzle"
              className="rounded-md p-1 transition-colors hover:bg-muted"
              onClick={handleRefresh}
              type="button"
            >
              <RefreshCwIcon className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative mb-4 h-[200px] overflow-hidden rounded-md bg-muted"
        >
          <img
            alt="Captcha background"
            className="h-full w-full object-cover"
            draggable={false}
            height="200"
            src={imageUrl}
            width="400"
          />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-black/40" />

            <svg
              aria-label="Puzzle cutout target area"
              className="absolute inset-0"
              role="img"
              style={{
                left: `${targetPosition}px`,
                top: `${targetY}px`,
              }}
            >
              <title>Puzzle piece target location</title>
              <defs>
                <clipPath id="puzzle-cutout">
                  <path d={puzzlePath} />
                </clipPath>
              </defs>
              <image
                clipPath="url(#puzzle-cutout)"
                height="200"
                href={imageUrl}
                width={containerWidth}
                x={-targetPosition}
                y={-targetY}
              />
              <path
                className={cn(
                  "transition-all duration-300",
                  isVerified ? "stroke-green-500" : "stroke-white/60"
                )}
                d={puzzlePath}
                fill="none"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div
            className={cn(
              "pointer-events-none absolute transition-all duration-200",
              isVerified && "drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            )}
            style={{
              left: `${currentPixelPosition}px`,
              top: `${targetY}px`,
              width: `${PUZZLE_SIZE}px`,
              height: `${PUZZLE_SIZE}px`,
            }}
          >
            <svg
              aria-label="Draggable puzzle piece"
              height={PUZZLE_SIZE}
              role="img"
              width={PUZZLE_SIZE}
            >
              <title>Movable puzzle piece</title>
              <defs>
                <clipPath id="puzzle-piece">
                  <path d={puzzlePath} />
                </clipPath>
                <filter id="piece-shadow">
                  <feDropShadow
                    dx="0"
                    dy="2"
                    floodOpacity="0.3"
                    stdDeviation="3"
                  />
                </filter>
              </defs>
              <image
                clipPath="url(#puzzle-piece)"
                filter="url(#piece-shadow)"
                height="200"
                href={imageUrl}
                width={containerWidth}
                x={-currentPixelPosition}
                y={-targetY}
              />
              <path
                className={cn(
                  "transition-colors duration-300",
                  isVerified ? "stroke-green-500" : "stroke-white"
                )}
                d={puzzlePath}
                fill="none"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <Slider
          aria-label="Captcha verification slider"
          max={100}
          min={0}
          onValueChange={handleValueChange}
          step={0.5}
          value={sliderValue}
        />

        <p className="mt-2 text-muted-foreground text-xs">
          {isVerified
            ? "Puzzle completed successfully!"
            : "Drag the slider to fit the puzzle piece"}
        </p>
      </div>
    </div>
  );
};
