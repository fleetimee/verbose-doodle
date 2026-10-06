import { ActivityIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const panelStyle: CSSProperties & { "--console-height": string } = {
    "--console-height": `${height}dvh`,
  };
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const resizeRef = useRef<{
    pointerId: number;
    startY: number;
    startHeight: number;
    viewportHeight: number;
  } | null>(null);

  useEffect(() => {
    const handleToggle = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        (event.code === "Backquote" || event.key === "`") &&
        !event.repeat &&
        !event.defaultPrevented &&
        !document.querySelector('[role="dialog"], dialog[open]')
      ) {
        event.preventDefault();
        setHidden(false);
        setHasOpened(true);
        setOpen((current) => !current);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleToggle);
    return () => window.removeEventListener("keydown", handleToggle);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest(
          '[data-slot="drawer-content"], [data-slot="popover-content"], [data-slot="menubar-content"], [data-slot="combobox-content"], [data-slot="select-content"], [data-slot="dialog-content"]'
        )
      ) {
        return;
      }
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !document.querySelector(
          '[data-slot="dialog-content"], [data-slot="drawer-content"]'
        )
      ) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        panelRef.current?.contains(event.target) ||
        triggerRef.current?.contains(event.target) ||
        event.target.closest(
          '[data-slot="drawer-content"], [data-slot="popover-content"], [data-slot="menubar-content"], [data-slot="combobox-content"], [data-slot="select-content"], [data-slot="dialog-content"]'
        ) ||
        document.querySelector(
          '[data-slot="dialog-content"], [data-slot="drawer-content"]'
        )
      ) {
        return;
      }
      setOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [open]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              aria-controls={panelId}
              aria-expanded={open}
              aria-keyshortcuts="Control+`"
              aria-label={messages.endpoints.globalConsole.title}
              aria-pressed={open}
              onClick={() => {
                setHidden(false);
                setOpen(!open);
                setHasOpened(true);
              }}
              ref={triggerRef}
              size="icon-sm"
              variant={open ? "secondary" : "ghost"}
            />
          }
        >
          <HugeiconsIcon icon={ActivityIcon} strokeWidth={2} />
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {messages.endpoints.globalConsole.title} · Ctrl + `
        </TooltipContent>
      </Tooltip>
      {hasOpened &&
        createPortal(
          <aside
            aria-hidden={!open}
            aria-label={messages.endpoints.globalConsole.title}
            className="endpoint-console-panel fixed inset-x-0 bottom-0 z-40 flex h-[var(--console-height)] flex-col border-t bg-background shadow-lg data-[open=false]:pointer-events-none data-[hidden=true]:hidden"
            data-hidden={hidden}
            data-open={open}
            id={panelId}
            inert={!open}
            onTransitionEnd={(event) => {
              if (
                event.target === event.currentTarget &&
                event.propertyName === "opacity" &&
                !open
              ) {
                setHidden(true);
              }
            }}
            ref={panelRef}
            style={panelStyle}
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
          </aside>,
          document.body
        )}
    </>
  );
}
