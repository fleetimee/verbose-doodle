import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { HugeIcon } from "@/components/hugeicons";

function paymentIcon(path: string): HugeIcon {
  const definition: IconSvgElement = [
    ["path", { d: path, key: "payment-tool" }],
  ];
  return (props) => (
    <HugeiconsIcon
      aria-hidden="true"
      icon={definition}
      strokeWidth={2}
      {...props}
    />
  );
}

export const QrisToolsIcon = paymentIcon(
  "M3 3h6v6H3ZM15 3h6v6h-6ZM3 15h6v6H3ZM15 15h2v2h-2Zm6 0v6h-6m-3-9h.01M6 6h.01M18 6h.01M6 18h.01"
);
export const MpmParserIcon = paymentIcon(
  "M3 10V5h5m8 0h5v5M3 16v5h5m8 0h5v-5M7 11l1-3h8l1 3M7 11h10v6H7Zm3 6v-3h4v3"
);
export const CpmParserIcon = paymentIcon(
  "M3 5h18v14H3Zm0 4h18M6 13h4v3H6Zm8 0h.01M17 13h.01M14 16h3"
);
export const TapParserIcon = paymentIcon(
  "M3 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14m8-16h6v18h-6Zm2 3h2m-2 12h2M10 10a3 3 0 0 1 0 4"
);
export const MpmCreatorIcon = paymentIcon(
  "M3 3h6v6H3Zm12 0h6v6h-6ZM3 15h6v6H3Zm13-2v8m-4-4h8M6 6h.01M18 6h.01M6 18h.01"
);
export const MdrCalculatorIcon = paymentIcon(
  "M3 3h12v18H3Zm3 3h6M6 10h.01M11 10h.01M6 14h.01M11 14h.01M6 18h.01M11 18h.01m7-8 3-3m-3 0h.01M21 10h.01M18 16h3m-3 4h3"
);
export const Iso8583ToolsIcon = paymentIcon(
  "M3 4h18v16H3Zm0 5h18M7 13h2m-2 3h2m4-3h4m-4 3h4M6 6.5h.01M9 6.5h.01"
);
export const Iso8583ParserIcon = paymentIcon(
  "M3 3h7v5H3Zm11 13h7v5h-7ZM3 16h7v5H3Zm3-8v4h12v4m-12-4v4m7-9 3-3 3 3m-3-3v8"
);
export const Iso8583GeneratorIcon = paymentIcon(
  "M3 3h7v5H3Zm11 0h7v5h-7ZM7 16h10v5H7Zm-1-8v4h12V8m-6 4v4m-3-3 3 3 3-3"
);
