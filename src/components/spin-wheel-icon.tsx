import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { HugeIconProps } from "@/components/hugeicons";

const WHEEL_ICON: IconSvgElement = [
  [
    "path",
    {
      d: "M12 13V4.5A8.5 8.5 0 0 1 20.5 13Z",
      fill: "var(--wheel-color-1)",
      stroke: "none",
      key: "red",
    },
  ],
  [
    "path",
    {
      d: "M12 13H20.5A8.5 8.5 0 0 1 12 21.5Z",
      fill: "var(--wheel-color-3)",
      stroke: "none",
      key: "blue",
    },
  ],
  [
    "path",
    {
      d: "M12 13V21.5A8.5 8.5 0 0 1 3.5 13Z",
      fill: "var(--wheel-color-4)",
      stroke: "none",
      key: "yellow",
    },
  ],
  [
    "path",
    {
      d: "M12 13H3.5A8.5 8.5 0 0 1 12 4.5Z",
      fill: "var(--wheel-color-2)",
      stroke: "none",
      key: "green",
    },
  ],
  ["circle", { cx: "12", cy: "13", r: "8.5", fill: "none", key: "rim" }],
  [
    "circle",
    { cx: "12", cy: "13", r: "1.7", fill: "var(--background)", key: "hub" },
  ],
  [
    "path",
    {
      d: "M10 1.5h4L12 6Z",
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
