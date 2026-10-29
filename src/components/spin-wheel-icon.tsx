import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { HugeIconProps } from "@/components/hugeicons";

const WHEEL_ICON: IconSvgElement = [
  [
    "path",
    {
      d: "M12 5.5a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 6.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Z",
      fill: "currentColor",
      fillRule: "evenodd",
      stroke: "none",
      key: "wheel",
    },
  ],
  [
    "path",
    {
      d: "M9.5 1.5h5L12 5Z",
      fill: "currentColor",
      stroke: "none",
      key: "pointer",
    },
  ],
];

export function SpinWheelIcon(props: HugeIconProps) {
  return (
    <HugeiconsIcon
      aria-hidden="true"
      icon={WHEEL_ICON}
      strokeWidth={1.5}
      {...props}
    />
  );
}
