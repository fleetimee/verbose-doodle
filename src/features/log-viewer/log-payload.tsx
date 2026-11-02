import { memo, type ReactNode, useMemo } from "react";
import { TrafficJsonPreview } from "@/features/endpoints/components/traffic-json-preview";
import { DbsLogPayload } from "@/features/log-viewer/dbs-log-payload";
import { InspectLogPayload } from "@/features/log-viewer/inspect-log-payload";
import { IsoLogPayload } from "@/features/log-viewer/iso-log-payload";
import { SigLogPayload } from "@/features/log-viewer/sig-log-payload";
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
    const value = text.slice(range.start, range.end);
    if (range.kind === "dbs") {
      content.push(<DbsLogPayload key={`dbs-${range.start}`} text={value} />);
    } else if (range.kind === "sig") {
      content.push(<SigLogPayload key={`sig-${range.start}`} text={value} />);
    } else if (range.kind === "inspect") {
      content.push(
        <InspectLogPayload key={`inspect-${range.start}`} text={value} />
      );
    } else {
      content.push(
        <TrafficJsonPreview key={`json-${range.start}`} value={value} />
      );
    }
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
