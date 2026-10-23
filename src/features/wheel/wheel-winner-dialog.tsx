import type { CSSProperties } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PIECES = Array.from({ length: 32 }, (_, index) => index);
function ConfettiPiece({ index }: { index: number }) {
  const angle = index * 2.399_96;
  const radius = 120 + (index % 5) * 30;
  const style: CSSProperties & Record<`--confetti-${string}`, string> = {
    "--confetti-x": `${Math.cos(angle) * radius}px`,
    "--confetti-y": `${Math.sin(angle) * radius + 140}px`,
    "--confetti-rotation": `${index * 71}deg`,
    "--confetti-delay": `${(index % 4) * 40}ms`,
    "--confetti-color": `var(--wheel-color-${(index % 8) + 1})`,
  };
  return <i className="wheel-winner-confetti" style={style} />;
}
export function WheelWinnerDialog({
  automatic = false,
  name,
  number,
  hasNext,
  onContinue,
  onClose,
}: {
  automatic?: boolean;
  name: string;
  number: number;
  hasNext: boolean;
  onContinue: () => void;
  onClose: () => void;
}) {
  const {
    messages: { wheel: copy },
  } = useI18n();
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open
    >
      <DialogContent className="overflow-hidden" size="md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {PIECES.map((index) => (
            <ConfettiPiece index={index} key={index} />
          ))}
        </div>
        <DialogHeader>
          <DialogTitle>{copy.winnerTitle}</DialogTitle>
          <DialogDescription>
            {copy.draw} {number} ·{" "}
            {automatic ? copy.remainingSaved : copy.winnerSaved}
          </DialogDescription>
        </DialogHeader>
        <p className="relative break-words py-6 text-center font-semibold text-4xl tracking-tight">
          {name}
        </p>
        <DialogFooter>
          {hasNext && (
            <Button onClick={onClose} variant="ghost">
              {copy.stopReplay}
            </Button>
          )}
          <Button onClick={hasNext ? onContinue : onClose}>
            {hasNext ? copy.continueReplay : copy.done}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
