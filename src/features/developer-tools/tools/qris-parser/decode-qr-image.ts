export type QrImageErrorCode =
  | "imageType"
  | "imageSize"
  | "imageUnreadable"
  | "imageNoQr";

export class QrImageError extends Error {
  readonly code: QrImageErrorCode;
  constructor(code: QrImageErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = "QrImageError";
    this.code = code;
  }
}

export async function decodeQrImage(file: File): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new QrImageError("imageType");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new QrImageError("imageSize");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (cause) {
    throw new QrImageError("imageUnreadable", { cause });
  }
  try {
    if (bitmap.width * bitmap.height > 16_000_000) {
      throw new QrImageError("imageSize");
    }
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new QrImageError("imageUnreadable");
    }
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const { default: jsQR } = await import("jsqr");
    const code = jsQR(pixels.data, pixels.width, pixels.height, {
      inversionAttempts: "attemptBoth",
    });
    if (!code?.data) {
      throw new QrImageError("imageNoQr");
    }
    return code.data;
  } finally {
    bitmap.close();
  }
}
