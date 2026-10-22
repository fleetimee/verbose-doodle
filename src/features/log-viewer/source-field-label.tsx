import { useId } from "react";
import { Info } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { LogSourceRequest } from "@/features/log-viewer/types";

export function SourceFieldLabel({
  field,
  htmlFor,
  portalContainer,
}: {
  field: Exclude<keyof LogSourceRequest, "serverEntryId">;
  htmlFor: string;
  portalContainer: HTMLDivElement | null;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const headingId = useId();
  const help = copy.fieldHelp[field];
  const label = copy[field];
  const helpLabel = copy.fieldHelpLabel.replace("{field}", label);
  return (
    <div className="flex items-center gap-1.5">
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              aria-label={helpLabel}
              size="icon-xs"
              title={helpLabel}
              type="button"
              variant="ghost-muted"
            />
          }
        >
          <Info />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          aria-labelledby={headingId}
          className="max-w-[calc(100vw-3rem)]"
          portalContainer={portalContainer}
        >
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-sm" id={headingId}>
              {label}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {help.description}
            </p>
            <Separator />
            <div className="flex flex-col gap-1.5">
              <p className="font-medium text-xs">{copy.fieldHelpExamples}</p>
              <p className="whitespace-pre-wrap break-words text-muted-foreground text-xs leading-relaxed">
                {help.examples}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
