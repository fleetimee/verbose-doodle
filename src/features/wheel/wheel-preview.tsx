import { useId } from "react";
import { useI18n } from "@/components/i18n-provider";
import { WheelDisc } from "@/features/wheel/wheel-disc";

export function WheelPreview({ entries }: { entries: string }) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  const heading = useId();
  const names = entries
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 100);
  const previewEntries = names.length
    ? names
    : Array.from({ length: 8 }, () => "");
  return (
    <section
      aria-labelledby={heading}
      className="flex min-h-0 flex-col rounded-xl border bg-muted/20 p-4"
    >
      <h3 className="font-semibold text-sm" id={heading}>
        {copy.previewTitle}
      </h3>
      <p className="mt-1 text-muted-foreground text-sm">{copy.previewHint}</p>
      <div className="wheel-stage my-4 grid h-64 min-h-48 place-items-center lg:h-auto lg:flex-1">
        <WheelDisc
          draw={null}
          eligible={previewEntries.map((_, index) => index)}
          entries={previewEntries}
          fit
          idleSpin
          playing={false}
          replay={0}
        />
      </div>
      {names.length === 0 && (
        <p className="text-center text-muted-foreground text-sm">
          {copy.previewEmpty}
        </p>
      )}
    </section>
  );
}
