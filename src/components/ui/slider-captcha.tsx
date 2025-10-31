import { CheckCircle2Icon, RefreshCwIcon, ShieldCheckIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SliderCaptchaProps = {
  onVerify: (verified: boolean) => void;
  className?: string;
  imageUrl?: string;
};

const PUZZLE_SIZE = 60;
const PUZZLE_NOTCH = 10;

const CAPTCHA_IMAGES = [
  "/assets/captcha-images/frieren-ambience.png",
  "/assets/captcha-images/wuwa-ambience.png",
  "/assets/captcha-images/wuwa-ambience-2.png",
  "/assets/captcha-images/wuwa-ambience-3.png",
];

const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * CAPTCHA_IMAGES.length);
  return CAPTCHA_IMAGES[randomIndex] ?? CAPTCHA_IMAGES[0] ?? "";
};

export const SliderCaptcha = ({
  onVerify,
  className,
  imageUrl,
}: SliderCaptchaProps) => {
  const [piecePosition, setPiecePosition] = React.useState(0);
  const [targetPosition, setTargetPosition] = React.useState(0);
  const [targetY, setTargetY] = React.useState(0);
  const [isVerified, setIsVerified] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartX, setDragStartX] = React.useState(0);
  const [dragStartPosition, setDragStartPosition] = React.useState(0);
  const [currentImage, setCurrentImage] = React.useState(() => imageUrl ?? getRandomImage());

  React.useEffect(() => {
    if (!imageUrl) return;
    setCurrentImage(imageUrl);
  }, [imageUrl]);

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
    if (!hasInteracted) return;

    const tolerance = 8;
    const isCloseEnough = Math.abs(piecePosition - targetPosition) <= tolerance;

    if (isCloseEnough && !isVerified) {
      setIsVerified(true);
      onVerify(true);

      // Show success toast
      toast.success("Verification successful!", {
        description: "You have been verified",
      });
    } else if (!isCloseEnough && isVerified) {
      setIsVerified(false);
      onVerify(false);
    }
  }, [
    piecePosition,
    targetPosition,
    isVerified,
    onVerify,
    hasInteracted,
  ]);

  const handleRefresh = () => {
    setPiecePosition(0);
    setIsVerified(false);
    setHasInteracted(false);

    // Pick a new random image
    setCurrentImage(imageUrl ?? getRandomImage());

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

  const handlePuzzleDragStart = (clientX: number) => {
    if (isVerified) return; // Lock when verified
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    setIsDragging(true);
    setDragStartX(clientX);
    setDragStartPosition(piecePosition);
  };

  const handlePuzzleDragMove = (clientX: number) => {
    if (!isDragging || !containerRef.current) return;

    const deltaX = clientX - dragStartX;
    const newPosition = dragStartPosition + deltaX;
    const clampedPosition = Math.max(0, Math.min(containerWidth - PUZZLE_SIZE, newPosition));

    setPiecePosition(clampedPosition);
  };

  const handlePuzzleDragEnd = () => {
    setIsDragging(false);

    // Check verification on drag end
    if (hasInteracted && !isVerified) {
      const tolerance = 8;
      const isCloseEnough = Math.abs(piecePosition - targetPosition) <= tolerance;

      if (!isCloseEnough) {
        // Failed verification - show error and reset
        toast.error("Verification failed", {
          description: "Please try again",
        });

        // Reset after a short delay
        setTimeout(() => {
          handleRefresh();
        }, 1000);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePuzzleDragStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      handlePuzzleDragStart(touch.clientX);
    }
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handlePuzzleDragMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handlePuzzleDragMove(touch.clientX);
      }
    };

    const handleMouseUp = () => {
      handlePuzzleDragEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartPosition, containerWidth, hasInteracted, isVerified, piecePosition, targetPosition]);

  const getStatusColor = () => {
    if (!hasInteracted) return "border-border";
    if (isVerified) return "border-green-500 bg-green-50 dark:bg-green-950/20";
    return "border-orange-400 bg-orange-50 dark:bg-orange-950/20";
  };

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
            src={currentImage}
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
                href={currentImage}
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
              "absolute transition-all duration-200",
              isVerified
                ? "cursor-default drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                : "cursor-grab active:cursor-grabbing",
              isDragging && !isVerified && "cursor-grabbing"
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            role="button"
            style={{
              left: `${piecePosition}px`,
              top: `${targetY}px`,
              width: `${PUZZLE_SIZE}px`,
              height: `${PUZZLE_SIZE}px`,
            }}
            tabIndex={0}
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
                    dy="4"
                    floodOpacity="0.4"
                    stdDeviation="4"
                  />
                </filter>
              </defs>
              {/* Solid background shape to make the puzzle piece stand out */}
              <path
                className={cn(
                  "transition-colors duration-300",
                  isVerified ? "fill-green-100 dark:fill-green-900/30" : "fill-white dark:fill-gray-800"
                )}
                d={puzzlePath}
                filter="url(#piece-shadow)"
              />
              {/* Image clipped to puzzle shape */}
              <image
                clipPath="url(#puzzle-piece)"
                height="200"
                href={currentImage}
                width={containerWidth}
                x={-targetPosition}
                y={-targetY}
                opacity="0.95"
              />
              {/* Stroke outline */}
              <path
                className={cn(
                  "transition-colors duration-300",
                  isVerified ? "stroke-green-500" : "stroke-gray-400 dark:stroke-gray-500"
                )}
                d={puzzlePath}
                fill="none"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        <p className="mt-2 text-center text-muted-foreground text-xs">
          {isVerified
            ? "Puzzle completed successfully!"
            : "Drag the puzzle piece to fit it into the cutout"}
        </p>
      </div>
    </div>
  );
};
