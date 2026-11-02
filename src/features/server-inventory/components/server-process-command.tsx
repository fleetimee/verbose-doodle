import { toast } from "sonner";
import { CopyIcon } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copyToClipboard } from "@/lib/clipboard";

export function ServerProcessCommand({ command }: { command: string }) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;

  async function handleCopy() {
    try {
      if (await copyToClipboard(command)) {
        toast.success(messages.servers.copied);
      } else {
        toast.error(messages.servers.copyFailed);
      }
    } catch {
      toast.error(messages.servers.copyFailed);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={copy.processCommand}
          className="block w-full truncate rounded-sm text-left underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          type="button"
        >
          {command}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(36rem,calc(100vw-2rem))]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-sm">{copy.processCommand}</p>
            <Button onClick={handleCopy} size="sm" variant="outline">
              <CopyIcon aria-hidden="true" className="size-3.5" />
              {copy.processCommandCopy}
            </Button>
          </div>
          <ScrollArea className="max-h-64" viewportClassName="max-h-64">
            <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
              {command}
            </pre>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
