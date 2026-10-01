import { afterEach, describe, expect, mock, test } from "bun:test";
import { decodeQrImage } from "@/features/developer-tools/tools/qris-parser/decode-qr-image";
import { QRIS_SAMPLE } from "@/features/developer-tools/tools/qris-parser/parse-qris";

const originalContext = HTMLCanvasElement.prototype.getContext;
const originalBitmap = globalThis.createImageBitmap;
afterEach(() => {
  globalThis.createImageBitmap = originalBitmap;
  HTMLCanvasElement.prototype.getContext = originalContext;
});

describe("QR image input boundaries", () => {
  test("rejects unsupported files before image decoding", async () => {
    const bitmap = mock();
    globalThis.createImageBitmap = bitmap;
    await expect(
      decodeQrImage(new File(["text"], "qr.svg", { type: "image/svg+xml" }))
    ).rejects.toThrow("imageType");
    expect(bitmap).not.toHaveBeenCalled();
  });
  test("rejects oversized files before image decoding", async () => {
    const bitmap = mock();
    globalThis.createImageBitmap = bitmap;
    await expect(
      decodeQrImage(
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], "qr.png", {
          type: "image/png",
        })
      )
    ).rejects.toThrow("imageSize");
    expect(bitmap).not.toHaveBeenCalled();
  });
  test("reports unreadable images", async () => {
    globalThis.createImageBitmap = mock(() =>
      Promise.reject(new Error("invalid image"))
    );
    await expect(
      decodeQrImage(new File(["bad"], "qr.png", { type: "image/png" }))
    ).rejects.toThrow("imageUnreadable");
  });
  test("decodes QR pixels through the image pipeline and closes unreadable bitmaps", async () => {
    const matrix = (
      await Bun.file(
        new URL("./qris-sample-matrix.txt", import.meta.url)
      ).text()
    )
      .trim()
      .split("\n");
    const width = (matrix.length + 8) * 4;
    const data = new Uint8ClampedArray(width * width * 4).fill(255);
    for (let y = 0; y < width; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (matrix[Math.floor(y / 4) - 4]?.[Math.floor(x / 4) - 4] === "#") {
          data.fill(0, (y * width + x) * 4, (y * width + x) * 4 + 3);
        }
      }
    }
    const close = mock();
    globalThis.createImageBitmap = mock(
      async () => ({ width, height: width, close }) as ImageBitmap
    );
    const drawImage = mock();
    // SAFETY: This test exercises only the 2D context overload with a pixel fixture.
    HTMLCanvasElement.prototype.getContext = mock(() => ({
      fillRect: mock(),
      drawImage,
      getImageData: () => ({ data, width, height: width }),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    const file = new File(["fixture"], "qr.png", { type: "image/png" });
    expect(await decodeQrImage(file)).toBe(QRIS_SAMPLE);
    expect(drawImage).toHaveBeenCalledTimes(1);
    data.fill(255);
    await expect(decodeQrImage(file)).rejects.toThrow("imageNoQr");
    expect(close).toHaveBeenCalledTimes(2);
  });
  test("closes a bitmap rejected for excessive dimensions", async () => {
    const close = mock();
    globalThis.createImageBitmap = mock(
      async () => ({ width: 5000, height: 5000, close }) as ImageBitmap
    );
    await expect(
      decodeQrImage(new File(["image"], "qr.png", { type: "image/png" }))
    ).rejects.toThrow("imageSize");
    expect(close).toHaveBeenCalledTimes(1);
  });
});
