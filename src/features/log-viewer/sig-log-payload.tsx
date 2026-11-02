import { memo, type ReactNode, useMemo } from "react";

export const SIG_LOG_HEADER =
  /(\[(?:\d{2}\/\d{2}\/\d{4}[ \t]+)?\d{2}:\d{2}:\d{2}\.\d+\][ \t]+[RS][ \t]+)(\d{4})(\d{4})(\d{8})(\d{12})([A-Z]+)([^\r\n]*?)(\d{4})([RS])(?=\|)/iy;

const SIG_VALUE = /([^|]+)|(\|)/g;
const NUMERIC_VALUE = /^\d+$/;

function highlight(text: string): ReactNode {
  const header = new RegExp(SIG_LOG_HEADER).exec(text);
  if (!header) {
    return text;
  }
  const [
    ,
    prefix,
    length,
    code,
    date,
    reference,
    channel,
    metadata,
    bodyLength,
    direction,
  ] = header;
  const output: ReactNode[] = [
    prefix,
    <span className="iso8583-syntax-length" key="length">
      {length}
    </span>,
    <span className="iso8583-syntax-field" key="code">
      {code}
    </span>,
    <span className="iso8583-syntax-mti" key="date">
      {date}
    </span>,
    <span className="iso8583-syntax-identifier" key="reference">
      {reference}
    </span>,
    <span className="iso8583-syntax-field" key="channel">
      {channel}
    </span>,
    <span className="iso8583-syntax-identifier" key="metadata">
      {metadata}
    </span>,
    <span className="iso8583-syntax-length" key="body-length">
      {bodyLength}
    </span>,
    <span
      className={direction.toUpperCase() === "R" ? "text-info" : "text-primary"}
      key="direction"
    >
      {direction}
    </span>,
  ];
  for (const match of text.slice(header[0].length).matchAll(SIG_VALUE)) {
    let className = "iso8583-syntax-value";
    if (match[2]) {
      className = "text-muted-foreground";
    } else if (NUMERIC_VALUE.test(match[0])) {
      className = "iso8583-syntax-identifier";
    }
    output.push(
      <span className={className} key={match.index}>
        {match[0]}
      </span>
    );
  }
  return output;
}

export const SigLogPayload = memo(function SigLogPayload({
  text,
}: {
  text: string;
}) {
  const content = useMemo(() => highlight(text), [text]);
  return <>{content}</>;
});
