import { FullScreenIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { RefObject } from "react";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function GameFullscreenButton({
  frameRef,
}: {
  readonly frameRef: RefObject<HTMLIFrameElement | null>;
}) {
  const { messages } = useI18n();
  const supported =
    typeof document !== "undefined" && document.fullscreenEnabled;

  async function enterFullscreen() {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    try {
      await frame.requestFullscreen();
      frame.focus();
    } catch {
      toast.error(messages.common.gameFullscreenFailed);
    }
  }

  return (
    <Button
      disabled={!supported}
      onClick={enterFullscreen}
      size="xs"
      title={
        supported
          ? messages.common.gameFullscreenHint
          : messages.common.gameFullscreenUnsupported
      }
      variant="outline"
    >
      <HugeiconsIcon
        aria-hidden="true"
        data-icon="inline-start"
        icon={FullScreenIcon}
        strokeWidth={2}
      />
      {messages.common.gameFullscreen}
    </Button>
  );
}
