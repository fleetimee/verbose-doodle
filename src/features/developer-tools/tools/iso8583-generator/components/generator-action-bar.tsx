import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function GeneratorActionBar({
  children,
}: {
  readonly children: ReactNode;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setFloating(
          !entry.isIntersecting &&
            entry.boundingClientRect.top >=
              (entry.rootBounds?.bottom ?? window.innerHeight)
        );
      }
    });
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        className={cn(
          "sticky bottom-0 isolate z-20 rounded-b-lg border border-border/70 border-t-0 bg-card/90 backdrop-blur-sm",
          floating && "rounded-t-lg border-t"
        )}
        data-floating={floating}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 rounded-b-lg bg-card transition-opacity duration-200 ease-out motion-reduce:transition-none",
            floating
              ? "rounded-t-lg opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
              : "opacity-100"
          )}
        />
        <div className="flex flex-col gap-3 rounded-b-lg px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
          {children}
        </div>
      </div>
      <div aria-hidden="true" className="h-px" ref={anchorRef} />
    </>
  );
}
