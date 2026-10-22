import type { ReactNode } from "react";
import { isoFieldColor } from "@/features/log-viewer/iso-log-colors";

const PACKED_LINE =
  /^(\[[^\]\r\n]+\][ \t]+[RS][ \t]+)([012][0-9]{3})([0-9a-f]{16})([^\r\n]*)(\r?)$/gim;
const HEX_16 = /^[0-9a-f]{16}$/i;
const DUMP_LINE =
  /^[ \t]*\[(MTI|\d{1,3})\][ \t]*:[ \t]*(['"])(.*)\2(?:[ \t]+\(\d+\))?[ \t]*\r?$/gim;
const NEXT_MESSAGE =
  /^\[(?:\d{2}\/\d{2}\/\d{4}[ \t]+)?\d{2}:\d{2}:\d{2}(?:\.\d+)?\][ \t]+/m;

interface DumpField {
  number: number;
  value: string;
}

function dumpFields(tail: string, mti: string): DumpField[] {
  const next = tail.search(NEXT_MESSAGE);
  const dump = next < 0 ? tail : tail.slice(0, next);
  const result: DumpField[] = [];
  let sawMti = false;
  for (const match of dump.matchAll(DUMP_LINE)) {
    if (match[1].toUpperCase() === "MTI") {
      if (sawMti || match[3] !== mti) {
        break;
      }
      sawMti = true;
    } else if (sawMti) {
      const number = Number(match[1]);
      if (number > 1) {
        result.push({ number, value: match[3] });
      }
    }
  }
  return result;
}

function presentFields(bitmap: string): number[] {
  return [...bitmap].flatMap((hex, index) => {
    const bits = Number.parseInt(hex, 16).toString(2).padStart(4, "0");
    return [...bits].flatMap((bit, position) => {
      const field = index * 4 + position + 1;
      return bit === "1" && field !== 1 && field !== 65 ? [field] : [];
    });
  });
}

function payloadTokens(
  payload: string,
  bitmap: string,
  fields: DumpField[]
): ReactNode {
  const present = presentFields(bitmap);
  if (
    present.length !== fields.length ||
    present.some((field, index) => field !== fields[index].number)
  ) {
    return payload;
  }
  const tokens: ReactNode[] = [];
  let offset = 0;
  for (const field of fields) {
    const candidates = [0, 2, 3, 4].filter((prefix) => {
      const length = payload.slice(offset, offset + prefix);
      return (
        (prefix === 0 ||
          length === String(field.value.length).padStart(prefix, "0")) &&
        payload.slice(offset + prefix, offset + prefix + field.value.length) ===
          field.value
      );
    });
    if (candidates.length !== 1) {
      return payload;
    }
    const prefix = candidates[0];
    tokens.push(
      <span key={offset}>
        <span className="iso8583-syntax-length">
          {payload.slice(offset, offset + prefix)}
        </span>
        <span
          className={isoFieldColor(field.number, field.value)}
          title={`DE ${field.number}`}
        >
          {field.value}
        </span>
      </span>
    );
    offset += prefix + field.value.length;
  }
  return offset === payload.length ? tokens : payload;
}

export function highlightPackedLogs(
  text: string,
  continuation = ""
): ReactNode[] {
  const output: ReactNode[] = [];
  let offset = 0;
  for (const match of text.matchAll(PACKED_LINE)) {
    const [line, prefix, mti, primary, remainder, ending] = match;
    const hasSecondary = Number.parseInt(primary[0], 16) >= 8;
    const secondary = hasSecondary ? remainder.slice(0, 16) : "";
    if (hasSecondary && !HEX_16.test(secondary)) {
      continue;
    }
    const bitmap = primary + secondary;
    const payload = remainder.slice(secondary.length);
    const fields = dumpFields(
      text.slice(match.index + line.length) + continuation,
      mti
    );
    output.push(text.slice(offset, match.index));
    output.push(
      <span key={match.index}>
        {prefix}
        <span className={isoFieldColor(0, mti)} title="MTI">
          {mti}
        </span>
        <span
          className={isoFieldColor(1, bitmap)}
          title={`Bitmap · ${presentFields(bitmap).join(", ")}`}
        >
          {bitmap}
        </span>
        {payloadTokens(payload, bitmap, fields)}
        {ending}
      </span>
    );
    offset = match.index + line.length;
  }
  output.push(text.slice(offset));
  return output;
}
