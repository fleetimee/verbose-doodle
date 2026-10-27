import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function metricBytes(value: number | null, compact = false) {
  if (value === null) {
    return "—";
  }
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  const index =
    value > 0
      ? Math.max(0, Math.min(4, Math.floor(Math.log(value) / Math.log(1024))))
      : 0;
  const amount = value / 1024 ** index;
  const decimals = index === 0 || (compact && amount >= 10) ? 0 : 1;
  return `${amount.toFixed(decimals)}${compact ? "" : " "}${units[index]}`;
}

export function MetricGauge({
  label,
  percent,
  detail,
}: {
  label: string;
  percent: number | null;
  detail: ReactNode;
}) {
  const value = percent === null ? null : Math.max(0, Math.min(100, percent));
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="relative size-10">
        <svg
          aria-hidden="true"
          className="size-full -rotate-90"
          viewBox="0 0 64 64"
        >
          <circle
            className="stroke-muted"
            cx="32"
            cy="32"
            fill="none"
            r="27"
            strokeWidth="5"
          />
          {value !== null && (
            <circle
              className={cn(
                "stroke-primary",
                value >= 75 && "stroke-warning",
                value >= 90 && "stroke-destructive"
              )}
              cx="32"
              cy="32"
              fill="none"
              pathLength="100"
              r="27"
              strokeDasharray={`${value} 100`}
              strokeLinecap="round"
              strokeWidth="5"
            />
          )}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-xs tabular-nums">
          {percent === null ? "—" : `${Math.round(percent)}%`}
        </span>
      </div>
      <span className="flex max-w-full flex-col gap-0.5 text-center font-mono text-xs tabular-nums">
        {detail}
      </span>
    </div>
  );
}

export function MetricRates({
  label,
  firstLabel,
  secondLabel,
  first,
  second,
}: {
  label: string;
  firstLabel: string;
  secondLabel: string;
  first: number | null;
  second: number | null;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <dl className="flex flex-col gap-1 text-xs">
        <dt className="text-muted-foreground">{firstLabel}</dt>
        <dd className="whitespace-nowrap font-mono tabular-nums">
          {metricBytes(first, true)}/s
        </dd>
        <dt className="text-muted-foreground">{secondLabel}</dt>
        <dd className="whitespace-nowrap font-mono tabular-nums">
          {metricBytes(second, true)}/s
        </dd>
      </dl>
    </div>
  );
}
