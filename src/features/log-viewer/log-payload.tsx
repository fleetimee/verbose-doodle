import { memo, type ReactNode, useMemo } from "react";
import { TrafficJsonPreview } from "@/features/endpoints/components/traffic-json-preview";
import { InspectLogPayload } from "@/features/log-viewer/inspect-log-payload";
import { IsoLogPayload } from "@/features/log-viewer/iso-log-payload";
import { findStructuredLogRanges } from "@/features/log-viewer/structured-log-ranges";

function highlightLogPayload(text: string): ReactNode[] {
  const content: ReactNode[] = [];
  let offset = 0;
  for (const range of findStructuredLogRanges(text)) {
    if (range.start > offset) {
      content.push(
        <IsoLogPayload
          key={`text-${offset}`}
          text={text.slice(offset, range.start)}
        />
      );
    }
    content.push(
      range.kind === "inspect" ? (
        <InspectLogPayload
          key={`inspect-${range.start}`}
          text={text.slice(range.start, range.end)}
        />
      ) : (
        <TrafficJsonPreview
          key={`json-${range.start}`}
          value={text.slice(range.start, range.end)}
        />
      )
    );
    offset = range.end;
  }
  if (offset < text.length) {
    content.push(
      <IsoLogPayload key={`text-${offset}`} text={text.slice(offset)} />
    );
  }
  return content;
}

export const LogPayload = memo(function LogPayload({ text }: { text: string }) {
  const content = useMemo(() => highlightLogPayload(text), [text]);
  return <>{content}</>;
});
