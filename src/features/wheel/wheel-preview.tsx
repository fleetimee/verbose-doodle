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
      className="rounded-xl border bg-muted/20 p-4 lg:sticky lg:top-0 lg:self-start"
    >
      <h3 className="font-semibold text-sm" id={heading}>
        {copy.previewTitle}
      </h3>
      <p className="mt-1 text-muted-foreground text-sm">{copy.previewHint}</p>
      <div className="mx-auto my-4 w-full max-w-xs">
        <WheelDisc
          draw={null}
          eligible={previewEntries.map((_, index) => index)}
          entries={previewEntries}
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
