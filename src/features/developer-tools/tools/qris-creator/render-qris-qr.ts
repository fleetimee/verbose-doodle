import QRCode from "qrcode";
import { APP_ICON_SRC } from "@/components/ui/logo";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load QR image"));
    image.src = src;
  });
}

let logoPromise: Promise<string> | undefined;
export function loadQrisLogo(): Promise<string> {
  logoPromise ??= loadImage(APP_ICON_SRC).then((image) => {
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas unavailable");
    }
    context.drawImage(image, 0, 0, 96, 96);
    return canvas.toDataURL("image/png");
  });
  return logoPromise;
}

export function renderQrisQr(payload: string, logo?: string) {
  const { modules } = QRCode.create(payload, { errorCorrectionLevel: "H" });
  const size = modules.size + 8;
  const paths: string[] = [];
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) {
        paths.push(`M${col + 4} ${row + 4}h1v1h-1z`);
      }
    }
  }
  // Keep the logo backing small and aligned to module boundaries.
  const logoSize = Math.max(3, Math.floor((modules.size * 0.2) / 2) * 2 + 1);
  const logoStart = (size - logoSize) / 2;
  const branding = logo
    ? `<rect x="${logoStart}" y="${logoStart}" width="${logoSize}" height="${logoSize}" fill="#fff"/><image href="${logo}" x="${logoStart + 0.5}" y="${logoStart + 0.5}" width="${logoSize - 1}" height="${logoSize - 1}" style="image-rendering:auto"/>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><path fill="#fff" d="M0 0h${size}v${size}H0z"/><path fill="#000" d="${paths.join("")}"/>${branding}</svg>`;
  return { svg, src: `data:image/svg+xml,${encodeURIComponent(svg)}` };
}

export async function renderQrisPng(payload: string, logo?: string) {
  const image = await loadImage(renderQrisQr(payload, logo).src);
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas unavailable");
  }
  context.drawImage(image, 0, 0, 1024, 1024);
  return canvas.toDataURL("image/png");
}
