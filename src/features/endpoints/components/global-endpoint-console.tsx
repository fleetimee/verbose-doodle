import { ActivityIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import {
  type CSSProperties,
  lazy,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

const EndpointTrafficLogViewer = lazy(() =>
  import("@/features/endpoints/components/endpoint-traffic-log-viewer").then(
    (module) => ({ default: module.EndpointTrafficLogViewer })
  )
);

export function GlobalEndpointConsole() {
  const { messages } = useI18n();
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(65);
  const previousHeightRef = useRef(65);
  const [hasOpened, setHasOpened] = useState(false);
  const [hidden, setHidden] = useState(true);
  const reduceMotion = useReducedMotion();
  const panelDuration = open ? MOTION_DURATION.panel : MOTION_DURATION.standard;
  const panelStyle: CSSProperties & { "--console-height": string } = {
    "--console-height": `${height}dvh`,
  };
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resizeRef = useRef<{
    pointerId: number;
    startY: number;
    startHeight: number;
    viewportHeight: number;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest(
          '[data-slot="menubar-content"], [data-slot="combobox-content"], [data-slot="select-content"], [data-slot="dialog-content"]'
        )
      ) {
        return;
      }
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !document.querySelector('[data-slot="dialog-content"]')
      ) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <Button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label={messages.endpoints.globalConsole.title}
        onClick={() => {
          setHidden(false);
          setOpen(!open);
          setHasOpened(true);
        }}
        ref={triggerRef}
        size="sm"
        variant={open ? "secondary" : "outline"}
      >
        <HugeiconsIcon
          data-icon="inline-start"
          icon={ActivityIcon}
          strokeWidth={2}
        />
        <span className="hidden sm:inline">
          {messages.endpoints.globalConsole.title}
        </span>
      </Button>
      {hasOpened &&
        createPortal(
          <motion.aside
            animate={open ? "open" : "closed"}
            aria-hidden={!open}
            aria-label={messages.endpoints.globalConsole.title}
            className="fixed inset-x-0 bottom-0 z-40 flex h-[var(--console-height)] flex-col border-t bg-background shadow-lg data-[open=false]:pointer-events-none data-[hidden=true]:hidden"
            data-hidden={hidden}
            data-open={open}
            id={panelId}
            inert={!open}
            initial="closed"
            onAnimationComplete={(definition) => {
              if (definition === "closed" && !open) {
                setHidden(true);
              }
            }}
            style={panelStyle}
            transition={{
              duration: reduceMotion ? MOTION_DURATION.fast : panelDuration,
              ease: MOTION_EASE.out,
            }}
            variants={{
              open: { opacity: 1, transform: "translateY(0%)" },
              closed: {
                opacity: 0,
                transform: reduceMotion ? "translateY(0%)" : "translateY(100%)",
              },
            }}
          >
            <hr
              aria-label={messages.endpoints.globalConsole.height}
              aria-orientation="horizontal"
              aria-valuemax={100}
              aria-valuemin={35}
              aria-valuenow={Math.round(height)}
              className="absolute inset-x-0 -top-1.5 z-10 flex h-3 cursor-row-resize touch-none items-center justify-center border-0 outline-none after:h-0.5 after:w-10 after:rounded-full after:bg-muted-foreground/50 hover:bg-primary/10 focus-visible:bg-primary/15"
              onKeyDown={(event) => {
                const step = event.shiftKey ? 5 : 1;
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setHeight((value) => Math.min(100, value + step));
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setHeight((value) => Math.max(35, value - step));
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  setHeight(35);
                }
                if (event.key === "End") {
                  event.preventDefault();
                  setHeight(100);
                }
              }}
              onLostPointerCapture={() => {
                resizeRef.current = null;
              }}
              onPointerCancel={() => {
                resizeRef.current = null;
              }}
              onPointerDown={(event) => {
                if (event.button !== 0) {
                  return;
                }
                event.preventDefault();
                event.currentTarget.focus();
                event.currentTarget.setPointerCapture(event.pointerId);
                resizeRef.current = {
                  pointerId: event.pointerId,
                  startY: event.clientY,
                  startHeight: height,
                  viewportHeight:
                    window.visualViewport?.height ?? window.innerHeight,
                };
              }}
              onPointerMove={(event) => {
                const resize = resizeRef.current;
                if (!resize || resize.pointerId !== event.pointerId) {
                  return;
                }
                const nextHeight =
                  resize.startHeight +
                  ((resize.startY - event.clientY) / resize.viewportHeight) *
                    100;
                setHeight(Math.max(35, Math.min(100, nextHeight)));
              }}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                resizeRef.current = null;
              }}
              tabIndex={0}
            />
            <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2">
              <h2 className="font-semibold text-sm">
                {messages.endpoints.globalConsole.title}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <span className="sr-only sm:not-sr-only">
                    {messages.endpoints.globalConsole.height}
                  </span>
                  <Slider
                    aria-label={messages.endpoints.globalConsole.height}
                    className="w-24"
                    max={100}
                    min={35}
                    onValueChange={(value) =>
                      setHeight(Array.isArray(value) ? value[0] : value)
                    }
                    step={1}
                    value={[height]}
                  />
                </div>
                <Button
                  aria-label={
                    height === 100
                      ? messages.endpoints.globalConsole.restore
                      : messages.endpoints.globalConsole.fullscreen
                  }
                  aria-pressed={height === 100}
                  onClick={() => {
                    if (height === 100) {
                      setHeight(previousHeightRef.current);
                    } else {
                      previousHeightRef.current = height;
                      setHeight(100);
                    }
                  }}
                  size="sm"
                  variant="ghost"
                >
                  {height === 100
                    ? messages.endpoints.globalConsole.restore
                    : messages.endpoints.globalConsole.fullscreen}
                </Button>
                <Button
                  aria-label={messages.endpoints.globalConsole.close}
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  size="icon-sm"
                  variant="ghost"
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                </Button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
              <Suspense
                fallback={
                  <p className="p-4 text-muted-foreground text-sm">
                    {messages.common.loading}
                  </p>
                }
              >
                <EndpointTrafficLogViewer
                  enabled={open}
                  endpointId="global"
                  global
                  hasActiveResponse
                  responseCount={1}
                />
              </Suspense>
            </div>
          </motion.aside>,
          document.body
        )}
    </>
  );
}
