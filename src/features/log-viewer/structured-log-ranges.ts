import { inspectLogTokens } from "@/features/log-viewer/inspect-log-payload";

interface StructuredLogRange {
  end: number;
  kind: "json" | "inspect";
  start: number;
}

const ISO_FIELD_LABEL = /^\[\d{1,3}\]$/;
const FIELD_SEPARATOR = /^[ \t]*:/;

function quotedStringEnd(text: string, start: number): number {
  for (let index = start + 1; index < text.length; index++) {
    if (text[index] === "\\") {
      index++;
    } else if (text[index] === text[start]) {
      return index;
    }
  }
  return -1;
}

function containerEnd(text: string, start: number): number {
  const closings: string[] = [];
  for (let index = start; index < text.length; index++) {
    const character = text[index];
    if (character === '"' || character === "'") {
      index = quotedStringEnd(text, index);
      if (index === -1) {
        return -1;
      }
    } else if (character === "{" || character === "[") {
      closings.push(character === "{" ? "}" : "]");
    } else if (
      (character === "}" || character === "]") &&
      (character !== closings.pop() || closings.length === 0)
    ) {
      return index + 1;
    }
  }
  return -1;
}

function isJson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function isIsoFieldLabel(text: string, start: number, end: number): boolean {
  return (
    ISO_FIELD_LABEL.test(text.slice(start, end)) &&
    FIELD_SEPARATOR.test(text.slice(end))
  );
}

export function findStructuredLogRanges(text: string): StructuredLogRange[] {
  const ranges: StructuredLogRange[] = [];
  for (let index = 0; index < text.length; index++) {
    if (text[index] !== "{" && text[index] !== "[") {
      continue;
    }
    const end = containerEnd(text, index);
    if (end === -1) {
      break;
    }
    const candidate = text.slice(index, end);
    if (!isIsoFieldLabel(text, index, end)) {
      if (isJson(candidate)) {
        ranges.push({ start: index, end, kind: "json" });
      } else if (inspectLogTokens(candidate)) {
        ranges.push({ start: index, end, kind: "inspect" });
      }
    }
    index = end - 1;
  }
  return ranges;
}
