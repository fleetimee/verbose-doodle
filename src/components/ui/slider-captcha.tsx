import { CheckCircle2Icon, RefreshCwIcon, ShieldCheckIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SliderCaptchaProps = {
  onVerify: (verified: boolean) => void;
  className?: string;
  imageUrl?: string;
};

const PUZZLE_SIZE = 50;
const PUZZLE_TAB_SIZE = 10;
const IMAGE_HEIGHT = 160;

const CAPTCHA_IMAGES = [
  "/assets/captcha-images/frieren-ambience.webp",
  "/assets/captcha-images/wuwa-ambience.webp",
  "/assets/captcha-images/wuwa-ambience-2.webp",
  "/assets/captcha-images/wuwa-ambience-3.webp",
];

const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * CAPTCHA_IMAGES.length);
  return CAPTCHA_IMAGES[randomIndex] ?? CAPTCHA_IMAGES[0] ?? "";
};

const generateRandomPuzzlePath = () => {
  const size = PUZZLE_SIZE;
  const tab = PUZZLE_TAB_SIZE;
  const half = size / 2;

  const topTab = Math.random() > 0.5;
  const rightTab = Math.random() > 0.5;
  const bottomTab = Math.random() > 0.5;
  const leftTab = Math.random() > 0.5;

  const topTabSize = tab + (Math.random() - 0.5) * 4;
  const rightTabSize = tab + (Math.random() - 0.5) * 4;
  const bottomTabSize = tab + (Math.random() - 0.5) * 4;
  const leftTabSize = tab + (Math.random() - 0.5) * 4;

  const topSign = topTab ? -1 : 1;
  const rightSign = rightTab ? 1 : -1;
  const bottomSign = bottomTab ? 1 : -1;
  const leftSign = leftTab ? -1 : 1;

  return `
    M 0,${half}
    L 0,${tab}
    Q 0,0 ${tab},0
    L ${half - topTabSize},0
    C ${half - topTabSize},${topSign * topTabSize} ${half - topTabSize / 2},${
    topSign * topTabSize
  } ${half},${topSign * topTabSize}
    C ${half + topTabSize / 2},${topSign * topTabSize} ${half + topTabSize},${
    topSign * topTabSize
  } ${half + topTabSize},0
    L ${size - tab},0
    Q ${size},0 ${size},${tab}
    L ${size},${half - rightTabSize}
    C ${size + rightSign * rightTabSize},${half - rightTabSize} ${
    size + rightSign * rightTabSize
  },${half - rightTabSize / 2} ${size + rightSign * rightTabSize},${half}
    C ${size + rightSign * rightTabSize},${half + rightTabSize / 2} ${
    size + rightSign * rightTabSize
  },${half + rightTabSize} ${size},${half + rightTabSize}
    L ${size},${size - tab}
    Q ${size},${size} ${size - tab},${size}
    L ${half + bottomTabSize},${size}
    C ${half + bottomTabSize},${size + bottomSign * bottomTabSize} ${
    half + bottomTabSize / 2
  },${size + bottomSign * bottomTabSize} ${half},${
    size + bottomSign * bottomTabSize
  }
    C ${half - bottomTabSize / 2},${size + bottomSign * bottomTabSize} ${
    half - bottomTabSize
  },${size + bottomSign * bottomTabSize} ${half - bottomTabSize},${size}
    L ${tab},${size}
    Q 0,${size} 0,${size - tab}
    L 0,${half + leftTabSize}
    C ${leftSign * leftTabSize},${half + leftTabSize} ${
    leftSign * leftTabSize
  },${half + leftTabSize / 2} ${leftSign * leftTabSize},${half}
    C ${leftSign * leftTabSize},${half - leftTabSize / 2} ${
    leftSign * leftTabSize
  },${half - leftTabSize} 0,${half - leftTabSize}
    Z
  `.trim();
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
  const [currentImage, setCurrentImage] = React.useState(
    () => imageUrl ?? getRandomImage()
  );
  const [isLocked, setIsLocked] = React.useState(false);
  const [puzzlePath, setPuzzlePath] = React.useState(() =>
    generateRandomPuzzlePath()
  );

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

      const minY = 20;
      const maxY = IMAGE_HEIGHT - PUZZLE_SIZE - 20;
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

      toast.success("Verification successful!", {
        description: "You have been verified",
      });
    } else if (!isCloseEnough && isVerified) {
      setIsVerified(false);
      onVerify(false);
    }
  }, [piecePosition, targetPosition, isVerified, onVerify, hasInteracted]);

  const handleRefresh = () => {
    setPiecePosition(0);
    setIsVerified(false);
    setHasInteracted(false);

    setCurrentImage(imageUrl ?? getRandomImage());

    setPuzzlePath(generateRandomPuzzlePath());

    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;

    const minX = PUZZLE_SIZE + 20;
    const maxX = width - PUZZLE_SIZE - 20;
    const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

    const minY = 20;
    const maxY = IMAGE_HEIGHT - PUZZLE_SIZE - 20;
    const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    setTargetPosition(randomX);
    setTargetY(randomY);
    setIsLocked(false);
  };

  const handlePuzzleDragStart = (clientX: number) => {
    if (isVerified || isLocked) return;
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    setIsDragging(true);
    setDragStartX(clientX);
    setDragStartPosition(piecePosition);
  };

  const handlePuzzleDragMove = React.useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;

      const deltaX = clientX - dragStartX;
      const newPosition = dragStartPosition + deltaX;
      const clampedPosition = Math.max(
        -PUZZLE_TAB_SIZE,
        Math.min(containerWidth - PUZZLE_SIZE + PUZZLE_TAB_SIZE, newPosition)
      );

      setPiecePosition(clampedPosition);
    },
    [dragStartX, dragStartPosition, containerWidth]
  );

  const handlePuzzleDragEnd = React.useCallback(() => {
    setIsDragging(false);

    if (hasInteracted && !isVerified) {
      const tolerance = 8;
      const isCloseEnough =
        Math.abs(piecePosition - targetPosition) <= tolerance;

      if (!isCloseEnough) {
        setIsLocked(true);
        toast.error("Verification failed", {
          description: "Please try again",
        });

        setTimeout(() => {
          handleRefresh();
        }, 1000);
      }
    }
  }, [hasInteracted, isVerified, piecePosition, targetPosition]);

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
      e.preventDefault();
      handlePuzzleDragMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handlePuzzleDragMove(touch.clientX);
      }
    };

    const handleMouseUp = () => {
      handlePuzzleDragEnd();
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handlePuzzleDragMove, handlePuzzleDragEnd]);

  const getStatusColor = () => {
    if (!hasInteracted) return "border-border";
    if (isVerified) return "border-green-500 bg-green-50 dark:bg-green-950/20";
    return "border-red-500 bg-red-50 dark:bg-red-950/20";
  };

  const getProximityColor = () => {
    if (!hasInteracted || isVerified) {
      return {
        stroke: "rgba(156, 163, 175, 1)",
        glow: "rgba(156, 163, 175, 0.3)",
      };
    }

    const distance = Math.abs(piecePosition - targetPosition);
    const maxDistance = containerWidth;
    const tolerance = 8;

    if (distance <= tolerance) {
      return { stroke: "rgba(34, 197, 94, 1)", glow: "rgba(34, 197, 94, 0.6)" };
    }

    if (distance <= 30) {
      const ratio = distance / 30;
      const r = Math.round(234 + (34 - 234) * (1 - ratio));
      const g = Math.round(179 + (197 - 179) * (1 - ratio));
      const b = Math.round(8 + (94 - 8) * (1 - ratio));
      return {
        stroke: `rgba(${r}, ${g}, ${b}, 1)`,
        glow: `rgba(${r}, ${g}, ${b}, 0.6)`,
      };
    }

    if (distance <= 100) {
      const ratio = (distance - 30) / 70;
      const r = Math.round(239 + (234 - 239) * (1 - ratio));
      const g = Math.round(68 + (179 - 68) * (1 - ratio));
      const b = Math.round(68 + (8 - 68) * (1 - ratio));
      return {
        stroke: `rgba(${r}, ${g}, ${b}, 1)`,
        glow: `rgba(${r}, ${g}, ${b}, 0.5)`,
      };
    }

    const opacity = Math.max(0.3, 1 - distance / maxDistance);
    return {
      stroke: "rgba(239, 68, 68, 1)",
      glow: `rgba(239, 68, 68, ${opacity})`,
    };
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border p-3 transition-all duration-300",
          getStatusColor()
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheckIcon
              className={cn(
                "size-4 transition-colors",
                isVerified ? "text-green-600" : "text-muted-foreground"
              )}
            />
            <span className="font-medium text-xs">
              {isVerified ? "Verified" : "Slide to complete the puzzle"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {isVerified && (
              <CheckCircle2Icon className="size-4 animate-in zoom-in-50 text-green-600 duration-300" />
            )}
            <button
              aria-label="Generate new puzzle"
              className="rounded-md p-0.5 transition-colors hover:bg-muted"
              onClick={handleRefresh}
              type="button"
            >
              <RefreshCwIcon className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative mb-2 overflow-hidden rounded-md bg-muted"
          style={{ height: `${IMAGE_HEIGHT}px` }}
        >
          <img
            alt="Captcha background"
            className="h-full w-full object-cover"
            draggable={false}
            height={IMAGE_HEIGHT}
            src={currentImage}
            width="400"
          />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-black/40" />

            <svg
              aria-label="Puzzle cutout target area"
              className="absolute"
              role="img"
              style={{
                left: `${targetPosition - PUZZLE_TAB_SIZE}px`,
                top: `${targetY - PUZZLE_TAB_SIZE}px`,
                width: `${PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2}px`,
                height: `${PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2}px`,
              }}
              viewBox={`${-PUZZLE_TAB_SIZE} ${-PUZZLE_TAB_SIZE} ${
                PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2
              } ${PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2}`}
            >
              <title>Puzzle piece target location</title>
              <defs>
                <clipPath id="puzzle-cutout">
                  <path d={puzzlePath} />
                </clipPath>
                <filter id="cutout-inner-shadow">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                  <feOffset dx="0" dy="2" result="offsetblur" />
                  <feFlood floodColor="rgba(0, 0, 0, 0.5)" />
                  <feComposite in2="offsetblur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect
                clipPath="url(#puzzle-cutout)"
                fill="white"
                height={PUZZLE_SIZE}
                width={PUZZLE_SIZE}
                x={0}
                y={0}
              />
              <path
                d={puzzlePath}
                fill="none"
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth="1"
              />
              <path
                d={puzzlePath}
                fill="none"
                stroke={
                  isVerified
                    ? "rgba(34, 197, 94, 1)"
                    : hasInteracted
                    ? getProximityColor().stroke
                    : "rgba(255, 255, 255, 0.8)"
                }
                strokeWidth="3"
                style={{
                  transition: isDragging ? "none" : "stroke 0.3s ease",
                  filter:
                    hasInteracted && !isVerified
                      ? `drop-shadow(0 0 6px ${getProximityColor().glow})`
                      : "drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))",
                }}
              />
            </svg>
          </div>

          <div
            className={cn(
              "absolute",
              !isDragging && "transition-all duration-200",
              isVerified
                ? "cursor-default drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                : "cursor-grab active:cursor-grabbing",
              isDragging && !isVerified && "cursor-grabbing",
              isLocked && "cursor-not-allowed pointer-events-none"
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            role="button"
            style={{
              left: `${piecePosition - PUZZLE_TAB_SIZE}px`,
              top: `${targetY - PUZZLE_TAB_SIZE}px`,
              width: `${PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2}px`,
              height: `${PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2}px`,
              willChange: isDragging ? "transform" : "auto",
            }}
            tabIndex={isVerified || isLocked ? -1 : 0}
            aria-disabled={isVerified || isLocked}
          >
            <svg
              aria-label="Draggable puzzle piece"
              height={PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2}
              role="img"
              width={PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2}
              viewBox={`${-PUZZLE_TAB_SIZE} ${-PUZZLE_TAB_SIZE} ${
                PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2
              } ${PUZZLE_SIZE + PUZZLE_TAB_SIZE * 2}`}
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
                <filter id="proximity-glow">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                  <feOffset dx="0" dy="0" result="offsetblur" />
                  <feFlood floodColor={getProximityColor().glow} />
                  <feComposite in2="offsetblur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                className={cn(
                  "transition-colors duration-300",
                  isVerified
                    ? "fill-green-100 dark:fill-green-900/30"
                    : "fill-white dark:fill-gray-800"
                )}
                d={puzzlePath}
                filter="url(#piece-shadow)"
              />
              <image
                clipPath="url(#puzzle-piece)"
                height={IMAGE_HEIGHT}
                href={currentImage}
                width={containerWidth}
                x={-targetPosition}
                y={-targetY}
                opacity="0.95"
              />
              <path
                d={puzzlePath}
                fill="none"
                stroke="rgba(0, 0, 0, 0.2)"
                strokeWidth="1"
              />
              <path
                d={puzzlePath}
                fill="none"
                filter={isVerified ? undefined : "url(#proximity-glow)"}
                stroke={
                  isVerified
                    ? "rgba(34, 197, 94, 1)"
                    : getProximityColor().stroke
                }
                strokeWidth="4"
                style={{
                  transition: isDragging ? "none" : "stroke 0.3s ease",
                }}
              />
            </svg>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-center text-muted-foreground text-[11px]">
            {isVerified
              ? "Puzzle completed successfully!"
              : "Drag the puzzle piece to fit it into the cutout"}
          </p>
          {hasInteracted && !isVerified && (
            <div className="space-y-0.5">
              <div className="relative h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full transition-all duration-150"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(
                        100,
                        ((containerWidth -
                          Math.abs(piecePosition - targetPosition)) /
                          containerWidth) *
                          100
                      )
                    )}%`,
                    backgroundColor: getProximityColor().stroke,
                  }}
                />
              </div>
              <p
                className="text-center text-[9px]"
                style={{ color: getProximityColor().stroke }}
              >
                {Math.abs(piecePosition - targetPosition) <= 8
                  ? "Perfect! Release to verify"
                  : Math.abs(piecePosition - targetPosition) <= 30
                  ? "Very close..."
                  : Math.abs(piecePosition - targetPosition) <= 100
                  ? "Getting warmer"
                  : "Keep trying"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
