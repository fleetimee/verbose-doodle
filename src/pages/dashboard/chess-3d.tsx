import { useRef } from "react";
import { GameFullscreenButton } from "@/components/game-fullscreen-button";
import { useI18n } from "@/components/i18n-provider";
import { useGameConnection } from "@/features/games/use-game-connection";

export function Chess3dPage() {
  const { messages } = useI18n();
  const frameRef = useRef<HTMLIFrameElement>(null);
  useGameConnection(frameRef, "chess");

  return (
    <section className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-border/40 border-b pb-3">
        <div>
          <h1 className="font-semibold text-xl tracking-tight">
            {messages.common.chess3dTitle}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {messages.common.chess3dDescription}
          </p>
        </div>
        <GameFullscreenButton frameRef={frameRef} />
      </header>
      <div className="mx-auto aspect-video w-full max-w-[min(1400px,calc((100dvh_-_14rem)*16/9))] overflow-hidden rounded-lg border">
        <iframe
          allow="fullscreen; clipboard-write"
          className="block h-full w-full border-0 [&:fullscreen]:h-dvh"
          data-game-frame=""
          ref={frameRef}
          src={`${import.meta.env.BASE_URL}games/chess-3d/index.html?v=frontend-theme-1`}
          title={messages.common.chess3dTitle}
        />
      </div>
    </section>
  );
}
