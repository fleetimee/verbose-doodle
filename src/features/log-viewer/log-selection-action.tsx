import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { CopyIcon } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

const CONFETTI_COLORS = [
  "bg-[var(--wheel-color-1)]",
  "bg-[var(--wheel-color-2)]",
  "bg-[var(--wheel-color-3)]",
  "bg-[var(--wheel-color-4)]",
  "bg-[var(--wheel-color-5)]",
  "bg-[var(--wheel-color-6)]",
  "bg-[var(--wheel-color-7)]",
  "bg-[var(--wheel-color-8)]",
];

const CONFETTI_PIECES = [
  { x: -38, y: -20, rotation: -70 },
  { x: -22, y: -32, rotation: 45 },
  { x: 0, y: -38, rotation: -30 },
  { x: 22, y: -32, rotation: 75 },
  { x: 38, y: -20, rotation: -45 },
  { x: 42, y: 8, rotation: 60 },
  { x: -42, y: 8, rotation: -60 },
  { x: 10, y: 24, rotation: 90 },
];

interface SelectedLogText {
  text: string;
  x: number;
  y: number;
}

interface SelectionActionStyle extends CSSProperties {
  "--selection-x": string;
  "--selection-y": string;
}

function selectedLogText(
  viewport: HTMLElement,
  host: HTMLElement,
  pointer: { x: number; y: number } | null
): SelectedLogText | null {
  const selection = window.getSelection();
  if (
    !selection ||
    selection.isCollapsed ||
    selection.rangeCount === 0 ||
    !viewport.contains(selection.anchorNode) ||
    !viewport.contains(selection.focusNode)
  ) {
    return null;
  }
  const text = selection.toString();
  if (!text) {
    return null;
  }
  const frame = host.getBoundingClientRect();
  const visible = viewport.getBoundingClientRect();
  const bounds = Array.from(selection.getRangeAt(0).getClientRects()).find(
    (rect) =>
      rect.width > 0 && rect.bottom > visible.top && rect.top < visible.bottom
  );
  if (!bounds) {
    return null;
  }
  if (pointer) {
    return {
      text,
      x: pointer.x - frame.left - 48,
      y: Math.max(8, Math.min(frame.height - 44, pointer.y - frame.top - 48)),
    };
  }
  const top = bounds.top - frame.top;
  const y =
    top >= 48
      ? top - 48
      : Math.min(frame.height - 44, bounds.bottom - frame.top + 12);
  return { text, x: bounds.left - frame.left, y: Math.max(8, y) };
}

export function LogSelectionAction({
  viewportRef,
  disabled = false,
}: {
  viewportRef: RefObject<HTMLDivElement | null>;
  disabled?: boolean;
}) {
  const { messages } = useI18n();
  const copy = messages.logViewer;
  const hostRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectedLogText | null>(null);
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => {
      setSelection(null);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (disabled) {
      setSelection(null);
      setCopied(false);
      return;
    }
    let dragging = false;
    let pointer: { x: number; y: number } | null = null;
    const hide = () => {
      setSelection(null);
      setCopied(false);
    };
    const update = () => {
      const viewport = viewportRef.current;
      const host = hostRef.current;
      if (!dragging && viewport && host) {
        setSelection(selectedLogText(viewport, host, pointer));
      }
    };
    const down = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        hostRef.current?.contains(event.target)
      ) {
        return;
      }
      dragging = true;
      pointer = null;
      hide();
    };
    const up = (event: PointerEvent) => {
      if (!dragging) {
        return;
      }
      pointer = { x: event.clientX, y: event.clientY };
      dragging = false;
      update();
    };
    const cancel = () => {
      dragging = false;
      hide();
    };
    const keyDown = (event: KeyboardEvent) => {
      pointer = null;
      if (event.key === "Escape") {
        hide();
      }
    };
    document.addEventListener("selectionchange", update);
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", cancel);
    document.addEventListener("keydown", keyDown);
    document.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    window.addEventListener("blur", cancel);
    document.addEventListener("fullscreenchange", hide);
    return () => {
      document.removeEventListener("selectionchange", update);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", cancel);
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("blur", cancel);
      document.removeEventListener("fullscreenchange", hide);
    };
  }, [viewportRef, disabled]);

  async function copySelection() {
    if (!selection || copied) {
      return;
    }
    try {
      if (await copyToClipboard(selection.text)) {
        setCopied(true);
      } else {
        toast.error(copy.selectionCopyFailed);
      }
    } catch {
      toast.error(copy.selectionCopyFailed);
    }
  }

  const style: SelectionActionStyle = {
    "--selection-x": `${selection?.x ?? 0}px`,
    "--selection-y": `${selection?.y ?? 0}px`,
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10" ref={hostRef}>
      <AnimatePresence>
        {selection && (
          <motion.div
            animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
            className="log-selection-action absolute origin-bottom-left"
            exit={{
              opacity: 0,
              transform: reduceMotion ? "none" : "translateY(3px) scale(0.98)",
            }}
            initial={{
              opacity: 0,
              transform: reduceMotion ? "none" : "translateY(3px) scale(0.98)",
            }}
            key="selection-action"
            style={style}
            transition={{
              duration: MOTION_DURATION.fast,
              ease: MOTION_EASE.out,
            }}
          >
            {copied && !reduceMotion && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
              >
                {CONFETTI_PIECES.map((piece, index) => (
                  <motion.span
                    animate={{
                      opacity: [0, 1, 0],
                      transform: `translate(${piece.x}px, ${piece.y}px) rotate(${piece.rotation}deg)`,
                    }}
                    className={`absolute top-1/2 left-1/2 h-1.5 w-1 rounded-xs ${CONFETTI_COLORS[index]}`}
                    initial={{
                      opacity: 0,
                      transform: "translate(0, 0) rotate(0deg)",
                    }}
                    key={piece.rotation}
                    transition={{
                      delay: 0.25,
                      duration: 0.45,
                      ease: MOTION_EASE.out,
                    }}
                  />
                ))}
              </span>
            )}
            <Button
              aria-label={copied ? copy.selectionCopied : copy.copySelectedText}
              className="pointer-events-auto w-24"
              onClick={copySelection}
              onPointerDown={(event) => event.preventDefault()}
              size="selection"
              variant="floating"
            >
              <CopyIcon aria-hidden="true" className="size-4" />
              <span aria-live="polite">
                {copied ? copy.selectionCopiedShort : copy.copySelection}
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
