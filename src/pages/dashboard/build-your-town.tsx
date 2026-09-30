import { useRef } from "react";
import { GameFullscreenButton } from "@/components/game-fullscreen-button";
import { useI18n } from "@/components/i18n-provider";

export function BuildYourTownPage() {
  const { messages } = useI18n();
  const frameRef = useRef<HTMLIFrameElement>(null);

  return (
    <section className="mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-border/40 border-b pb-3">
        <div>
          <h1 className="font-semibold text-xl tracking-tight">
            {messages.common.buildYourTownTitle}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {messages.common.buildYourTownDescription}
          </p>
        </div>
        <GameFullscreenButton frameRef={frameRef} />
      </header>
      <iframe
        allow="fullscreen"
        className="aspect-video max-h-[75dvh] min-h-80 w-full rounded-lg border [&:fullscreen]:h-dvh [&:fullscreen]:max-h-none [&:fullscreen]:rounded-none [&:fullscreen]:border-0"
        data-game-frame=""
        ref={frameRef}
        src={`${import.meta.env.BASE_URL}games/build-your-town/index.html`}
        title={messages.common.buildYourTownTitle}
      />
    </section>
  );
}
