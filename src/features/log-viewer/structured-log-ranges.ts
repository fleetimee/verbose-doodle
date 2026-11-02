import { DBS_LOG_LINE } from "@/features/log-viewer/dbs-log-payload";
import { inspectLogTokens } from "@/features/log-viewer/inspect-log-payload";
import { SIG_LOG_HEADER } from "@/features/log-viewer/sig-log-payload";

interface StructuredLogRange {
  end: number;
  kind: "json" | "inspect" | "dbs" | "sig";
  start: number;
}

const ISO_FIELD_LABEL = /^\[\d{1,3}\]$/;
const FIELD_SEPARATOR = /^[ \t]*:/;
const NEXT_LOG_RECORD =
  /\r?\n\[(?:\d{2}\/\d{2}\/\d{4}[ \t]+)?\d{2}:\d{2}:\d{2}(?:\.\d+)?\][ \t]+/;

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

function logRecordRange(
  text: string,
  start: number,
  dbsLine: RegExp,
  sigHeader: RegExp
): StructuredLogRange | null {
  sigHeader.lastIndex = start;
  const sigMatch = sigHeader.exec(text);
  if (sigMatch) {
    const bodyStart = start + sigMatch[0].length;
    const next = text.slice(bodyStart).search(NEXT_LOG_RECORD);
    const end = next < 0 ? text.length : bodyStart + next;
    return { start, end, kind: "sig" };
  }
  dbsLine.lastIndex = start;
  const dbsMatch = dbsLine.exec(text);
  return dbsMatch
    ? { start, end: start + dbsMatch[0].length, kind: "dbs" }
    : null;
}

export function findStructuredLogRanges(text: string): StructuredLogRange[] {
  const ranges: StructuredLogRange[] = [];
  const dbsLine = new RegExp(DBS_LOG_LINE);
  const sigHeader = new RegExp(SIG_LOG_HEADER);
  for (let index = 0; index < text.length; index++) {
    if (index === 0 || text[index - 1] === "\n") {
      const record = logRecordRange(text, index, dbsLine, sigHeader);
      if (record) {
        ranges.push(record);
        index = record.end - 1;
        continue;
      }
    }
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
