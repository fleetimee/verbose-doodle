import type { QrisField } from "@/features/developer-tools/tools/qris-parser/parse-qris";

export function PayloadSegments({
  fields,
}: {
  readonly fields: readonly QrisField[];
}) {
  return fields.map((field) => (
    <span
      className={`qris-color-${Number(field.path.split(".")[0]) % 8}`}
      key={field.path}
    >
      <span className="font-bold">
        {field.id}
        {String(field.length).padStart(2, "0")}
      </span>
      {field.value}
    </span>
  ));
}
