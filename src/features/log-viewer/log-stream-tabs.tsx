import { FileText } from "@/components/hugeicons";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LogStreamTabs({
  label,
  streams,
}: {
  label: string;
  streams: string[];
}) {
  const compact = streams.length >= 8;

  return (
    <div className="flex shrink-0 items-center px-2.5 py-1.5">
      <ScrollArea className="min-w-0 flex-1" contentClassName="w-max">
        <TabsList
          aria-label={label}
          size={compact ? "xs" : "sm"}
          variant="stream"
        >
          {streams.map((stream) => (
            <TabsTrigger
              key={stream}
              size={compact ? "xs" : "default"}
              value={stream}
              variant="stream"
            >
              <FileText aria-hidden="true" />
              {stream}
            </TabsTrigger>
          ))}
          <TabsIndicator />
        </TabsList>
        <ScrollBar
          className={compact ? "h-1.5" : undefined}
          orientation="horizontal"
        />
      </ScrollArea>
    </div>
  );
}
