import { memo, useMemo } from "react";

const INSPECT_TOKEN =
  /(\s+)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")|(-?(?:\d+n|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?))|([A-Za-z_$][\w$]*)|([{}[\],:])/gy;
const JSON_LITERALS = new Set(["true", "false", "null"]);
const INSPECT_LITERALS = new Set(["undefined", "NaN", "Infinity"]);

interface InspectToken {
  kind: "space" | "string" | "number" | "identifier" | "punctuation";
  offset: number;
  text: string;
}

function tokenize(text: string): InspectToken[] | null {
  const pattern = new RegExp(INSPECT_TOKEN);
  const tokens: InspectToken[] = [];
  while (pattern.lastIndex < text.length) {
    const match = pattern.exec(text);
    if (!match) {
      return null;
    }
    let kind: InspectToken["kind"] = "punctuation";
    if (match[1]) {
      kind = "space";
    } else if (match[2]) {
      kind = "string";
    } else if (match[3]) {
      kind = "number";
    } else if (match[4]) {
      kind = "identifier";
    }
    tokens.push({ offset: match.index, text: match[0], kind });
  }
  return tokens;
}

function normalizedToken(
  token: InspectToken,
  next?: InspectToken
): string | null {
  if (token.kind === "string") {
    return JSON.stringify(token.text.slice(1, -1));
  }
  if (token.kind === "identifier") {
    if (next?.text === ":") {
      return JSON.stringify(token.text);
    }
    if (next?.text === "{") {
      return "";
    }
    if (JSON_LITERALS.has(token.text)) {
      return token.text;
    }
    return INSPECT_LITERALS.has(token.text) ? "null" : null;
  }
  if (token.kind === "number") {
    return token.text.endsWith("n") ? token.text.slice(0, -1) : token.text;
  }
  if (token.text === "," && (next?.text === "}" || next?.text === "]")) {
    return "";
  }
  return token.text;
}

export function inspectLogTokens(text: string): InspectToken[] | null {
  const tokens = tokenize(text);
  if (!tokens) {
    return null;
  }
  const significant = tokens.filter((token) => token.kind !== "space");
  const normalized: string[] = [];
  let inspectSyntax = false;
  for (let index = 0; index < significant.length; index++) {
    const token = significant[index];
    const next = significant[index + 1];
    if (
      token.text.startsWith("'") ||
      (token.kind === "identifier" &&
        (next?.text === ":" || !JSON_LITERALS.has(token.text))) ||
      (token.kind === "number" && token.text.endsWith("n"))
    ) {
      inspectSyntax = true;
    }
    const value = normalizedToken(token, next);
    if (value === null) {
      return null;
    }
    normalized.push(value);
  }
  if (!inspectSyntax) {
    return null;
  }
  try {
    // Validate the container's structure; only the original tokens are rendered.
    JSON.parse(normalized.join(" "));
    return tokens;
  } catch {
    return null;
  }
}

function tokenClass(token: InspectToken, next?: InspectToken): string {
  if (next?.text === ":" && token.kind !== "punctuation") {
    return "text-info";
  }
  if (token.kind === "string") {
    return "text-success";
  }
  if (token.kind === "number") {
    return "text-warning";
  }
  return token.kind === "identifier" ? "text-primary" : "text-muted-foreground";
}

export const InspectLogPayload = memo(function InspectLogPayload({
  text,
}: {
  text: string;
}) {
  const tokens = useMemo(() => inspectLogTokens(text), [text]);
  if (!tokens) {
    return <>{text}</>;
  }
  const significant = tokens.filter((token) => token.kind !== "space");
  let index = 0;
  return (
    <>
      {tokens.map((token) => {
        if (token.kind === "space") {
          return token.text;
        }
        index++;
        return (
          <span
            className={tokenClass(token, significant[index])}
            key={token.offset}
          >
            {token.text}
          </span>
        );
      })}
    </>
  );
});
