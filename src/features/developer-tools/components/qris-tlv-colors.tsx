import type { TlvNode } from "@/features/developer-tools/tools/qris-cpm-parser/parse-cpm";

const QRIS_TLV_COLORS = new Map(
  Object.entries({
    "85": 0,
    "61": 1,
    "4F": 2,
    "50": 3,
    "5A": 4,
    "5F20": 5,
    "5F2D": 6,
    "5F50": 7,
    "9F25": 0,
    "63": 2,
    "9F74": 6,
    "9F7A": 1,
    "9F7B": 7,
  })
);

export function qrisTlvColor(tag: string): string {
  return `qris-color-${QRIS_TLV_COLORS.get(tag) ?? Number.parseInt(tag, 16) % 8}`;
}

export function TlvHexSegments({
  nodes,
  hex,
}: {
  readonly nodes: readonly TlvNode[];
  readonly hex: string;
}) {
  let offset = 0;
  return nodes.map((node, index) => {
    const lengthAt = offset + node.tag.length;
    const firstLengthByte = Number.parseInt(
      hex.slice(lengthAt, lengthAt + 2),
      16
    );
    const lengthSize =
      firstLengthByte < 128 ? 2 : (firstLengthByte - 128 + 1) * 2;
    const valueAt = lengthAt + lengthSize;
    const end = valueAt + node.length * 2;
    const header = hex.slice(offset, valueAt);
    const value = hex.slice(valueAt, end);
    offset = end;
    return (
      <span className={qrisTlvColor(node.tag)} key={`${node.tag}-${index}`}>
        <span className="font-bold">{header}</span>
        {node.children ? (
          <TlvHexSegments hex={value} nodes={node.children} />
        ) : (
          value
        )}
      </span>
    );
  });
}
