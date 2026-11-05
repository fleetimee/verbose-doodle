import { StickerIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CHAT_STICKER_IDS,
  type ChatStickerId,
  getChatStickerSrc,
} from "@/features/dashboard/chat-stickers";
import { messages } from "@/lib/i18n";

export function VisitorChatStickerPicker({
  disabled,
  onSelect,
}: {
  disabled: boolean;
  onSelect: (id: ChatStickerId) => void;
}) {
  const [open, setOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const setTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    setPortalContainer(
      node?.closest<HTMLElement>('[data-slot="drawer-content"]') ?? null
    );
  }, []);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={messages.dashboardActivity.presence.stickers.open}
          disabled={disabled}
          ref={setTriggerRef}
          size="chat-sticker"
          title={messages.dashboardActivity.presence.stickers.open}
          type="button"
          variant="outline"
        >
          <HugeiconsIcon
            aria-hidden="true"
            icon={StickerIcon}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label={messages.dashboardActivity.presence.stickers.title}
        className="w-[min(24rem,calc(100vw-2rem))]"
        data-vaul-no-drag=""
        portalContainer={portalContainer}
        side="top"
      >
        <p className="mb-3 font-medium text-sm">
          {messages.dashboardActivity.presence.stickers.title}
        </p>
        <ScrollArea
          aria-label={messages.dashboardActivity.presence.stickers.title}
          className="h-[min(28rem,60dvh)]"
          variant="fit"
        >
          <div className="grid grid-cols-2 gap-2 pr-2">
            {CHAT_STICKER_IDS.map((id) => (
              <Button
                aria-label={
                  messages.dashboardActivity.presence.stickers.labels[id]
                }
                disabled={disabled}
                key={id}
                onClick={() => {
                  onSelect(id);
                  setOpen(false);
                }}
                size="tile"
                title={messages.dashboardActivity.presence.stickers.labels[id]}
                type="button"
                variant="ghost"
              >
                <img
                  alt=""
                  className="aspect-square w-full object-contain"
                  decoding="async"
                  height={160}
                  loading="lazy"
                  src={getChatStickerSrc(id)}
                  width={160}
                />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
