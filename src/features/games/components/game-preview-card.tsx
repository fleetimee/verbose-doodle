import { useReducedMotion } from "motion/react";
import { type ReactElement, useEffect, useRef, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export type GamePreviewMedia = {
  screenshots?: readonly string[];
  video?: string;
};

type GamePreviewCardProps = {
  active: boolean;
  children: ReactElement;
  cover: string;
  description: string;
  media: GamePreviewMedia;
  onActiveChange: (active: boolean) => void;
  title: string;
};

export function GamePreviewMedia({
  cover,
  media,
}: {
  cover: string;
  media: GamePreviewMedia;
}) {
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const [videoFailed, setVideoFailed] = useState(false);
  const screenshots = (media.screenshots ?? []).filter(
    (src) => !failedImages.includes(src)
  );
  const saveData =
    "connection" in navigator &&
    Boolean((navigator.connection as { saveData?: boolean }).saveData);
  const playVideo = Boolean(
    media.video && !videoFailed && !reducedMotion && !saveData
  );

  useEffect(() => {
    if (playVideo || reducedMotion || screenshots.length < 2) {
      return;
    }
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % screenshots.length),
      2500
    );
    return () => window.clearInterval(timer);
  }, [playVideo, reducedMotion, screenshots.length]);

  useEffect(() => {
    const video = videoRef.current;
    if (!(playVideo && video)) {
      return;
    }
    let cancelled = false;
    video.play().catch(() => {
      if (!cancelled) {
        setVideoFailed(true);
      }
    });
    return () => {
      cancelled = true;
      video.pause();
    };
  }, [playVideo]);

  const current = screenshots[index % screenshots.length] ?? cover;
  return (
    <div
      className="relative aspect-video overflow-hidden rounded-md bg-muted"
      data-game-preview-media=""
    >
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        height={720}
        src={cover}
        width={1280}
      />
      {screenshots.map((src) => (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Image load failure must remove the broken preview frame.
        <img
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-out motion-reduce:transition-none ${src === current ? "opacity-100" : "opacity-0"}`}
          height={720}
          key={src}
          onError={() => setFailedImages((failed) => [...failed, src])}
          src={src}
          width={1280}
        />
      ))}
      {playVideo && (
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          onError={() => setVideoFailed(true)}
          playsInline
          poster={current}
          ref={videoRef}
          src={media.video}
          tabIndex={-1}
        />
      )}
      {!playVideo && screenshots.length > 1 && !reducedMotion && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5"
        >
          {screenshots.map((src) => (
            <span
              className={`h-1 w-5 rounded-full ${src === current ? "bg-white" : "bg-black/50"}`}
              key={src}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GamePreviewCard({
  active,
  children,
  cover,
  description,
  media,
  onActiveChange,
  title,
}: GamePreviewCardProps) {
  return (
    <HoverCard
      onOpenChange={(open, details) => {
        if (
          open &&
          !window.matchMedia("(hover: hover) and (pointer: fine)").matches
        ) {
          details.cancel();
          return;
        }
        onActiveChange(open);
      }}
      open={active}
    >
      <HoverCardTrigger asChild closeDelay={200} delay={350}>
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="max-h-[calc(100dvh-2rem)] w-[min(25rem,calc(100vw-2rem))] overflow-y-auto duration-200 motion-reduce:transition-none"
        collisionPadding={{ top: 80, bottom: 16, left: 16, right: 16 }}
        side="right"
        sideOffset={12}
      >
        {active && (
          <div className="space-y-3" data-game-preview="">
            <h3 className="font-semibold text-xl tracking-tight">{title}</h3>
            <GamePreviewMedia cover={cover} media={media} />
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
