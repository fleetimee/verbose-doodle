import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SocketStatusCardProps = {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly tone?: "blue" | "green" | "red" | "yellow";
  readonly value: string | number;
};

const toneStyles = {
  blue: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  red: "border-red-500/20 bg-red-500/10 text-red-300",
  yellow: "border-amber-500/20 bg-amber-500/10 text-amber-300",
};

export function SocketStatusCard({
  icon: Icon,
  label,
  tone = "blue",
  value,
}: SocketStatusCardProps) {
  return (
    <div className="inline-flex h-8 items-center gap-2 rounded-md border border-border/70 bg-background/70 px-2.5 font-medium text-muted-foreground text-xs shadow-xs">
      <span
        className={cn(
          "grid size-5 place-items-center rounded-sm border",
          toneStyles[tone]
        )}
      >
        <Icon className="size-3" />
      </span>
      <span>{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}
