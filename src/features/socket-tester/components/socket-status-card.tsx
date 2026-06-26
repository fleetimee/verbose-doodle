import type { LucideIcon } from "lucide-react";

type SocketStatusCardProps = {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string | number;
};

export function SocketStatusCard({
  icon: Icon,
  label,
  value,
}: SocketStatusCardProps) {
  return (
    <div className="inline-flex h-8 items-center gap-2 rounded-md border border-border/70 bg-background/70 px-2.5 font-medium text-muted-foreground text-xs shadow-xs">
      <span className="grid size-5 place-items-center rounded-sm border border-border/70 bg-muted/35 text-muted-foreground">
        <Icon className="size-3" />
      </span>
      <span>{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}
