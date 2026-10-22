import { memo, type ReactNode, useMemo } from "react";
import { useI18n } from "@/components/i18n-provider";
import { ISO8583_FIELD_DICTIONARY } from "@/features/developer-tools/tools/iso8583-generator/iso8583-enums";

import { isoFieldColor } from "@/features/log-viewer/iso-log-colors";
import { highlightPackedLogs } from "@/features/log-viewer/iso-packed-log";

const ISO_FIELD_LINE =
  /^([ \t]*)(\[(MTI|BITMAP|\d{1,3})\])([ \t]*:[ \t]*)(['"])(.*)\5([ \t]*(?:\(\d+\))?[ \t]*\r?)$/gim;

const BITMAP_HEX = /^(?:[0-9a-f]{16}|[0-9a-f]{32})$/i;

function bitmapFields(value: string): string {
  if (!BITMAP_HEX.test(value)) {
    return "";
  }
  const fields: number[] = [];
  for (let index = 0; index < value.length; index++) {
    const nibble = Number.parseInt(value[index], 16)
      .toString(2)
      .padStart(4, "0");
    for (let bit = 0; bit < 4; bit++) {
      const field = index * 4 + bit + 1;
      if (field !== 1 && field !== 65 && nibble[bit] === "1") {
        fields.push(field);
      }
    }
  }
  return fields.join(", ");
}

interface IsoCopy {
  isoBitmap: string;
  isoBits: string;
  isoCustomField: string;
  isoField: string;
  isoMti: string;
}

function describeField(identifier: string, value: string, copy: IsoCopy) {
  const field = Number(identifier);
  if (identifier.toUpperCase() === "MTI" || field === 0) {
    return {
      labelClass: "iso8583-syntax-mti",
      valueClass: "iso8583-syntax-value",
      hint: copy.isoMti,
    };
  }
  if (identifier.toUpperCase() === "BITMAP" || field === 1) {
    const bits = bitmapFields(value);
    return {
      labelClass: "iso8583-syntax-field",
      valueClass: "iso8583-syntax-length",
      hint: bits
        ? `${copy.isoBitmap} · ${copy.isoBits}: ${bits}`
        : copy.isoBitmap,
    };
  }
  if (field < 2 || field > 192) {
    return null;
  }
  return {
    labelClass: "iso8583-syntax-field",
    valueClass: isoFieldColor(field, value),
    hint: `${copy.isoField} ${field} · ${ISO8583_FIELD_DICTIONARY[field]?.label || copy.isoCustomField}`,
  };
}

function highlight(text: string, copy: IsoCopy): ReactNode[] {
  const output: ReactNode[] = [];
  let offset = 0;
  for (const match of text.matchAll(ISO_FIELD_LINE)) {
    const [
      line,
      indentation,
      label,
      identifier,
      separator,
      quote,
      value,
      suffix,
    ] = match;
    const info = describeField(identifier, value, copy);
    if (!info) {
      continue;
    }
    output.push(
      ...highlightPackedLogs(
        text.slice(offset, match.index),
        text.slice(match.index)
      )
    );
    output.push(
      <span key={match.index}>
        {indentation}
        <span className={info.labelClass} title={info.hint}>
          {label}
        </span>
        {separator}
        <span className={info.valueClass}>
          {quote}
          {value}
          {quote}
        </span>
        <span className="iso8583-syntax-length">{suffix}</span>
      </span>
    );
    offset = match.index + line.length;
  }
  output.push(...highlightPackedLogs(text.slice(offset)));
  return output;
}

export const IsoLogPayload = memo(function IsoLogPayload({
  text,
}: {
  text: string;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const content = useMemo(() => highlight(text, copy), [text, copy]);
  return <>{content}</>;
});
