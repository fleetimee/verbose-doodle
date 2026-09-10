import {
  type ChangeEvent,
  type ComponentProps,
  useLayoutEffect,
  useRef,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const copy = messages.iso8583Generator;
const BIT_43_LENGTH = 40;

const BIT_43_SEGMENTS = [
  {
    end: 22,
    key: "merchant-name",
    label: copy.bit43MerchantName,
    positions: "1–22",
    start: 1,
    tone: "border-chart-2 bg-chart-2/80",
    swatch: "bg-chart-2",
  },
  {
    end: 23,
    key: "delimiter-1",
    label: copy.bit43Delimiter,
    positions: "23",
    start: 23,
    tone: "border-chart-5 border-x-2 bg-chart-5",
    swatch: "bg-chart-5",
  },
  {
    end: 36,
    key: "city",
    label: copy.bit43City,
    positions: "24–36",
    start: 24,
    tone: "border-chart-3 bg-chart-3/80",
    swatch: "bg-chart-3",
  },
  {
    end: 37,
    key: "delimiter-2",
    label: copy.bit43Delimiter,
    positions: "37",
    start: 37,
    tone: "border-chart-5 border-x-2 bg-chart-5",
    swatch: "bg-chart-5",
  },
  {
    end: 40,
    key: "country-code",
    label: copy.bit43CountryCode,
    positions: "38–40",
    start: 38,
    tone: "border-chart-4 bg-chart-4/80",
    swatch: "bg-chart-4",
  },
] as const;

function segmentForPosition(position: number) {
  return BIT_43_SEGMENTS.find(
    (segment) => position >= segment.start && position <= segment.end
  );
}

type Bit43InputProps = Omit<
  ComponentProps<typeof Textarea>,
  "onChange" | "value"
> & {
  readonly onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  readonly value: string;
};

export function Bit43Input({
  "aria-describedby": describedBy,
  className,
  onChange,
  onKeyDown,
  value,
  ...props
}: Bit43InputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const segmentsId = props.id
    ? `${props.id}-segments`
    : "iso-field-43-segments";
  const inputDescription = [describedBy, segmentsId].filter(Boolean).join(" ");
  const visualValue = value.padEnd(BIT_43_LENGTH, " ").slice(0, BIT_43_LENGTH);

  useLayoutEffect(() => {
    const textarea = inputRef.current;
    const visual = visualRef.current;
    if (!(textarea && visual)) {
      return;
    }

    const resize = () => {
      textarea.style.height = "auto";
      const styles = getComputedStyle(textarea);
      const borderHeight =
        Number.parseFloat(styles.borderTopWidth) +
        Number.parseFloat(styles.borderBottomWidth);
      const contentHeight = Math.max(
        textarea.scrollHeight,
        visual.scrollHeight
      );
      textarea.style.height = `${contentHeight + borderHeight}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, [value]);

  return (
    <div className="min-w-0 space-y-2">
      <div className="relative min-w-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[calc(var(--radius)-1px)] px-3 py-2 font-mono text-base leading-6 md:text-sm"
          ref={visualRef}
        >
          <span className="whitespace-pre-wrap break-all">
            {Array.from(visualValue, (character, index) => {
              const segment = segmentForPosition(index + 1);
              return (
                <span
                  className={cn(
                    "inline-block w-[1ch] min-w-[1ch] border-y align-top text-foreground",
                    segment?.tone
                  )}
                  key={`${index}-${character}`}
                >
                  {character === " " ? "\u00a0" : character}
                </span>
              );
            })}
          </span>
        </div>
        <Textarea
          {...props}
          aria-describedby={inputDescription}
          className={cn(
            "relative z-10 h-auto min-h-11 resize-none overflow-hidden break-all bg-transparent py-2 font-mono text-transparent leading-6 caret-foreground selection:bg-primary/20 selection:text-transparent dark:bg-transparent",
            className
          )}
          onChange={onChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
            }
            onKeyDown?.(event);
          }}
          ref={inputRef}
          rows={1}
          value={value}
          wrap="soft"
        />
      </div>

      <ul
        aria-label={copy.bit43SegmentsLabel}
        className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-muted-foreground text-xs"
        id={segmentsId}
      >
        {BIT_43_SEGMENTS.map((segment) => (
          <li
            className="inline-flex items-center gap-1.5"
            data-bit43-segment={segment.key}
            key={segment.key}
          >
            <span
              aria-hidden="true"
              className={cn("size-2 shrink-0 rounded-full", segment.swatch)}
            />
            <span>{segment.label}</span>
            <span className="text-muted-foreground/75">
              [{segment.positions}]
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
