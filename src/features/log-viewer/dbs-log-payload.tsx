import { memo, type ReactNode, useMemo } from "react";

export const DBS_LOG_LINE =
  /(?:\[[^\]\r\n]+\][ \t]+)?(call|rslt)([ \t]+)((?:[A-Za-z_][\w$#]*\.)*[A-Za-z_][\w$#]*)([ \t]*\()[^\r\n]*/iy;

const DBS_TOKEN =
  /('(?:''|[^'\r\n])*')|\b(NULL)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([(),=])/gi;

function highlight(text: string): ReactNode {
  const line = new RegExp(DBS_LOG_LINE).exec(text);
  if (!line) {
    return text;
  }
  const [, operation, spacing, routine] = line;
  const operationStart = line[0].indexOf(operation);
  const argumentStart =
    operationStart + operation.length + spacing.length + routine.length;
  const output: ReactNode[] = [
    text.slice(0, operationStart),
    <span
      className={
        operation.toLowerCase() === "call" ? "text-info" : "text-primary"
      }
      key="operation"
    >
      {operation}
    </span>,
    spacing,
    <span className="iso8583-syntax-identifier" key="routine">
      {routine}
    </span>,
  ];
  let offset = argumentStart;
  for (const match of text.slice(argumentStart).matchAll(DBS_TOKEN)) {
    const start = argumentStart + match.index;
    output.push(text.slice(offset, start));
    let className = "text-muted-foreground";
    if (match[1]) {
      className = "iso8583-syntax-value";
    } else if (match[2]) {
      className = "text-primary";
    } else if (match[3]) {
      className = "iso8583-syntax-length";
    }
    output.push(
      <span className={className} key={start}>
        {match[0]}
      </span>
    );
    offset = start + match[0].length;
  }
  output.push(text.slice(offset));
  return output;
}

export const DbsLogPayload = memo(function DbsLogPayload({
  text,
}: {
  text: string;
}) {
  const content = useMemo(() => highlight(text), [text]);
  return <>{content}</>;
});
