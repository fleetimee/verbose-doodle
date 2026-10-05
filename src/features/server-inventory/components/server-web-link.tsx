import { type SyntheticEvent, useState } from "react";
import { preconnect } from "react-dom";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { formatMessage } from "@/lib/i18n";

function warmServerConnection(event: SyntheticEvent<HTMLAnchorElement>) {
  preconnect(new URL(event.currentTarget.href).origin);
}

export function ServerWebLink({ name, url }: { name: string; url: string }) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [open, setOpen] = useState(false);
  const previewLabel = formatMessage(copy.previewWebUrl, { name });
  const openLabel = formatMessage(copy.openWebUrl, { name });

  return (
    <HoverCard onOpenChange={setOpen} open={open}>
      <HoverCardTrigger asChild closeDelay={200} delay={400}>
        <a
          aria-label={openLabel}
          className="shrink-0 rounded-sm text-primary text-xs underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={url}
          onFocus={warmServerConnection}
          onPointerDown={warmServerConnection}
          onPointerEnter={warmServerConnection}
          rel="noopener noreferrer"
          target="_blank"
        >
          [{copy.link}]
        </a>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        aria-label={previewLabel}
        className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden"
        size="none"
      >
        <div className="flex items-center justify-between gap-3 border-b p-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="truncate font-medium text-sm">{name}</p>
            <p className="truncate text-muted-foreground text-xs" title={url}>
              {url}
            </p>
          </div>
          <Button
            aria-label={openLabel}
            nativeButton={false}
            render={<a href={url} rel="noopener noreferrer" target="_blank" />}
            size="xs"
            variant="outline"
          >
            {copy.openInNewTab}
          </Button>
        </div>
        {open && (
          <div className="server-web-preview-viewport">
            <iframe
              className="server-web-preview-frame"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin"
              src={url}
              tabIndex={-1}
              title={previewLabel}
            />
          </div>
        )}
        <p className="border-t p-3 text-muted-foreground text-xs">
          {copy.webPreviewHint}
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}
