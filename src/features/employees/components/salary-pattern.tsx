import { useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { formatMessage } from "@/lib/i18n";

const DOTS = Array.from({ length: 9 }, (_, index) => index + 1);
const point = (dot: number) => ({
  x: ((dot - 1) % 3) * 100 + 50,
  y: Math.floor((dot - 1) / 3) * 100 + 50,
});

export function SalaryPattern({
  onComplete,
}: {
  onComplete: (pattern: string) => void;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  const board = useRef<HTMLDivElement>(null);
  const path = useRef<number[]>([]);
  const dragging = useRef(false);
  const moved = useRef(false);
  const [dots, setDots] = useState<number[]>([]);

  function clear() {
    path.current = [];
    setDots([]);
  }

  function append(dot: number) {
    if (path.current.includes(dot)) {
      return;
    }
    const previous = path.current.at(-1);
    if (previous) {
      const a = point(previous);
      const b = point(dot);
      const middle = DOTS.find((value) => {
        const p = point(value);
        return p.x === (a.x + b.x) / 2 && p.y === (a.y + b.y) / 2;
      });
      if (middle && !path.current.includes(middle)) {
        path.current.push(middle);
      }
    }
    path.current = [...path.current, dot];
    setDots(path.current);
  }

  function finish() {
    const pattern = path.current.join("");
    clear();
    onComplete(pattern);
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className="relative grid aspect-square w-72 max-w-full touch-none select-none grid-cols-3 place-items-center"
        ref={board}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full text-primary"
          viewBox="0 0 300 300"
        >
          <polyline
            fill="none"
            points={dots
              .map((dot) => {
                const p = point(dot);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        </svg>
        {DOTS.map((dot) => (
          <Button
            aria-label={formatMessage(copy.salaryPatternDot, { dot })}
            aria-pressed={dots.includes(dot)}
            className="relative size-16 touch-none"
            key={dot}
            onClick={(event) => {
              if (event.detail === 0) {
                append(dot);
              }
            }}
            onPointerCancel={() => {
              dragging.current = false;
              clear();
            }}
            onPointerDown={(event) => {
              if (!event.isPrimary || event.button !== 0) {
                return;
              }
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              dragging.current = true;
              moved.current = false;
              clear();
              append(dot);
            }}
            onPointerMove={(event) => {
              if (!(dragging.current && board.current)) {
                return;
              }
              const rect = board.current.getBoundingClientRect();
              const x = ((event.clientX - rect.left) / rect.width) * 300;
              const y = ((event.clientY - rect.top) / rect.height) * 300;
              const hit = DOTS.find((value) => {
                const p = point(value);
                return Math.hypot(x - p.x, y - p.y) <= 30;
              });
              if (hit && hit !== path.current[0]) {
                moved.current = true;
              }
              if (hit) {
                append(hit);
              }
            }}
            onPointerUp={() => {
              if (!dragging.current) {
                return;
              }
              dragging.current = false;
              if (moved.current) {
                finish();
              }
            }}
            size="icon"
            variant="pattern-dot"
          >
            <span
              aria-hidden="true"
              className="size-3 rounded-full bg-current"
            />
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground text-xs" role="status">
        {formatMessage(copy.salaryPatternSelected, { count: dots.length })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={dots.length === 0}
          onClick={clear}
          size="sm"
          variant="ghost"
        >
          {copy.salaryPatternClear}
        </Button>
        <Button disabled={dots.length < 4} onClick={finish} size="sm">
          {copy.salaryUnlock}
        </Button>
      </div>
    </div>
  );
}
