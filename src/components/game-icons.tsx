import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { HugeIcon } from "@/components/hugeicons";

const gamesDefinition: IconSvgElement = [
  [
    "path",
    {
      d: "M7 7h10a4 4 0 0 1 4 3l1 7a2 2 0 0 1-3 2l-3-3H8l-3 3a2 2 0 0 1-3-2l1-7a4 4 0 0 1 4-3Z",
      key: "games-0",
    },
  ],
  ["path", { d: "M6 10v4m-2-2h4m8-1h.01M18 13h.01", key: "games-1" }],
];

export const GamesIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={gamesDefinition}
    strokeWidth={2}
    {...props}
  />
);

const fallLinesDefinition: IconSvgElement = [
  [
    "path",
    {
      d: "m7 3 5 16a2 2 0 0 1-3 2L3 5m11-3 6 16a2 2 0 0 1-3 2L11 4M3 12l4-1m7 1 4-1",
      key: "falllines-0",
    },
  ],
];

export const FallLinesIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={fallLinesDefinition}
    strokeWidth={2}
    {...props}
  />
);

const terrabrowserDefinition: IconSvgElement = [
  [
    "path",
    {
      d: "m5 20 11-11M4 8c5-6 11-6 16 0l-4 1-1 4-3-5-4-1Z",
      key: "terrabrowser-0",
    },
  ],
];

export const TerrabrowserIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={terrabrowserDefinition}
    strokeWidth={2}
    {...props}
  />
);

const ponpokoKartDefinition: IconSvgElement = [
  [
    "path",
    {
      d: "M5 12 7 6h10l2 6M3 12h18v6H3ZM8 6V3m8 3V3M8 12l1-3h6l1 3M3 18v3m18-3v3M6 15h2m8 0h2",
      key: "ponpokokart-0",
    },
  ],
];

export const PonpokoKartIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={ponpokoKartDefinition}
    strokeWidth={2}
    {...props}
  />
);

const emberwakeDefinition: IconSvgElement = [
  [
    "path",
    {
      d: "M9 5V4a3 3 0 0 1 6 0v1M6 8h12l2 11H4ZM6 8l3-3h6l3 3M4 22h16",
      key: "emberwake-0",
    },
  ],
  [
    "path",
    { d: "M12 11c0 3-3 3-3 5a3 3 0 0 0 6 0c0-2-1-3-3-5Z", key: "emberwake-1" },
  ],
];

export const EmberwakeIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={emberwakeDefinition}
    strokeWidth={2}
    {...props}
  />
);

const buildYourTownDefinition: IconSvgElement = [
  [
    "path",
    {
      d: "M2 21h20M4 21V11l4-3 4 3v10m0-14h7v14M14 7V3h5v4M7 13h2m-2 4h2m6-6h1m-1 4h1m-1 4h1",
      key: "buildyourtown-0",
    },
  ],
];

export const BuildYourTownIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={buildYourTownDefinition}
    strokeWidth={2}
    {...props}
  />
);

const chess3dDefinition: IconSvgElement = [
  [
    "path",
    {
      d: "M5 21h14l-1-4H7ZM7 17c0-4 1-6 5-8l-5 1-2-3 5-4V1l5 3c4 4 4 8 3 13M12 6h.01",
      key: "chess3d-0",
    },
  ],
];

export const Chess3dIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={chess3dDefinition}
    strokeWidth={2}
    {...props}
  />
);

const novaLancerDefinition: IconSvgElement = [
  [
    "path",
    {
      d: "m12 2 3 9 6 5v3l-7-2-2 3-2-3-7 2v-3l6-5ZM8 3v3m8-3v3M12 22v1",
      key: "novalancer-0",
    },
  ],
];

export const NovaLancerIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={novaLancerDefinition}
    strokeWidth={2}
    {...props}
  />
);

const sunbreakDefinition: IconSvgElement = [
  ["circle", { cx: 5, cy: 17, r: 4, key: "sunbreak-0" }],
  ["circle", { cx: 19, cy: 17, r: 4, key: "sunbreak-1" }],
  [
    "path",
    {
      d: "m5 17 5-8 5 8H5m5-8h6l3 8M8 6h4m3-2h3l-2 5M2 5l2-2 2 2",
      key: "sunbreak-2",
    },
  ],
];

export const SunbreakIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={sunbreakDefinition}
    strokeWidth={2}
    {...props}
  />
);

const arkanoidNeonDefinition: IconSvgElement = [
  ["rect", { x: 3, y: 3, width: 8, height: 4, rx: 1, key: "arkanoidneon-0" }],
  ["rect", { x: 13, y: 3, width: 8, height: 4, rx: 1, key: "arkanoidneon-1" }],
  ["rect", { x: 3, y: 9, width: 8, height: 4, rx: 1, key: "arkanoidneon-2" }],
  ["circle", { cx: 16, cy: 13, r: 2, key: "arkanoidneon-3" }],
  ["path", { d: "m17 16 2 2", key: "arkanoidneon-4" }],
  ["rect", { x: 5, y: 20, width: 14, height: 2, rx: 1, key: "arkanoidneon-5" }],
];

export const ArkanoidNeonIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={arkanoidNeonDefinition}
    strokeWidth={2}
    {...props}
  />
);

const hearthvaleDefinition: IconSvgElement = [
  [
    "path",
    {
      d: "M12 15V8m0 4C6 12 4 9 4 5c5 0 8 2 8 7Zm0-3c0-4 3-6 8-6 0 4-3 6-8 6ZM3 19l9-4 9 4M5 20l7-3 7 3M8 22l4-2 4 2",
      key: "hearthvale-0",
    },
  ],
];

export const HearthvaleIcon: HugeIcon = (props) => (
  <HugeiconsIcon
    aria-hidden="true"
    icon={hearthvaleDefinition}
    strokeWidth={2}
    {...props}
  />
);
