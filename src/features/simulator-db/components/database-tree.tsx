import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type DatabaseTreeBranchProps = {
  readonly label: string;
  readonly icon: ReactNode;
  readonly children: ReactNode;
  readonly defaultOpen?: boolean;
};

export function DatabaseTreeBranch({
  label,
  icon,
  children,
  defaultOpen = false,
}: DatabaseTreeBranchProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <CollapsibleTrigger
        render={
          <Button
            className="w-full justify-start"
            size="xs"
            variant="ghost-muted"
          />
        }
      >
        <HugeiconsIcon
          className={cn("shrink-0", open && "rotate-90")}
          icon={ArrowRight01Icon}
        />
        {icon}
        <span className="truncate" title={label}>
          {label}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-2 border-border/70 border-l pl-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
