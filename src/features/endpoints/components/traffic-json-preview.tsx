import { useMemo } from "react";

const JSON_TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],:])/g;

type JsonTokenKind =
  | "key"
  | "string"
  | "number"
  | "literal"
  | "punctuation"
  | "text";
type JsonToken = {
  readonly offset: number;
  readonly text: string;
  readonly kind: JsonTokenKind;
};

const TOKEN_CLASSES: Record<JsonTokenKind, string> = {
  key: "text-info",
  string: "text-success",
  number: "text-warning",
  literal: "text-primary",
  punctuation: "text-muted-foreground",
  text: "text-foreground",
};

function tokenizeJsonPreview(value: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let offset = 0;
  for (const match of value.matchAll(JSON_TOKEN_PATTERN)) {
    if (match.index > offset) {
      tokens.push({
        offset,
        text: value.slice(offset, match.index),
        kind: "text",
      });
    }
    tokens.push({
      offset: match.index,
      text: match[0],
      kind: tokenKind(match),
    });
    offset = match.index + match[0].length;
  }
  if (offset < value.length) {
    tokens.push({ offset, text: value.slice(offset), kind: "text" });
  }
  return tokens;
}

function tokenKind(match: RegExpMatchArray): JsonTokenKind {
  if (match[1]) {
    return match[2] ? "key" : "string";
  }
  if (match[3]) {
    return "number";
  }
  if (match[4]) {
    return "literal";
  }
  return "punctuation";
}

export function TrafficJsonPreview({
  value,
}: {
  readonly value: string | null;
}) {
  const tokens = useMemo(() => tokenizeJsonPreview(value ?? "-"), [value]);
  return (
    <span className="text-foreground">
      {tokens.map((token) => (
        <span className={TOKEN_CLASSES[token.kind]} key={token.offset}>
          {token.text}
        </span>
      ))}
    </span>
  );
}
