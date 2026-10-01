import { describe, expect, test } from "bun:test";
import jsQR from "jsqr";
import {
  createQris,
  QRIS_CREATOR_SAMPLE,
} from "@/features/developer-tools/tools/qris-creator/create-qris";
import { renderQrisQr } from "@/features/developer-tools/tools/qris-creator/render-qris-qr";
import { parseQris } from "@/features/developer-tools/tools/qris-parser/parse-qris";

const LOGO_RECT = /<rect x="(\d+)" y="(\d+)" width="(\d+)"/;
const VIEWBOX = /viewBox="0 0 (\d+)/;

for (const mode of ["static", "dynamic"] as const) {
  test(`${mode} payload has matching CRC and survives QR scanning`, () => {
    const { payload } = createQris({ ...QRIS_CREATOR_SAMPLE, mode });
    expect(payload).not.toBeNull();
    const parsed = parseQris(payload ?? "");
    expect(parsed.crcValid).toBe(true);
    expect(parsed.mode).toBe(mode);
    expect(parsed.amount).toBe(mode === "dynamic" ? "12500" : undefined);
    const { svg } = renderQrisQr(payload ?? "");
    const size = Number(svg.match(VIEWBOX)?.[1]);
    const scale = 6;
    const width = size * scale;
    const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
    const modules = svg.matchAll(/M(\d+) (\d+)h1v1h-1z/g);
    for (const module of modules) {
      const x = Number(module[1]) * scale;
      const y = Number(module[2]) * scale;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const offset = ((y + dy) * width + x + dx) * 4;
          pixels[offset] = 0;
          pixels[offset + 1] = 0;
          pixels[offset + 2] = 0;
        }
      }
    }
    expect(jsQR(pixels, width, width)?.data).toBe(payload ?? "");
    const branded = renderQrisQr(payload ?? "", "data:image/png;base64,test");
    const rect = branded.svg.match(LOGO_RECT);
    if (!rect) {
      throw new Error("Missing logo backing");
    }
    const start = Number(rect[1]) * scale;
    const logoSize = Number(rect[3]) * scale;
    for (const color of [255, 0]) {
      for (let y = start; y < start + logoSize; y++) {
        for (let x = start; x < start + logoSize; x++) {
          const offset = (y * width + x) * 4;
          pixels[offset] = color;
          pixels[offset + 1] = color;
          pixels[offset + 2] = color;
        }
      }
      expect(jsQR(pixels, width, width)?.data).toBe(payload ?? "");
    }
  });
}

describe("validation", () => {
  test.each(["0", "0.00", "-1", "12,50", "1.234", "12345678901234"])(
    "rejects invalid dynamic amount %s",
    (amount) => {
      expect(
        createQris({ ...QRIS_CREATOR_SAMPLE, mode: "dynamic", amount }).errors
          .amount
      ).toBe("invalid");
    }
  );
  test("preserves decimal amount and leading zero merchant identifiers", () => {
    const result = createQris({
      ...QRIS_CREATOR_SAMPLE,
      mode: "dynamic",
      amount: "25000.50",
      merchantPan: "000123",
    });
    const parsed = parseQris(result.payload ?? "");
    expect(parsed.amount).toBe("25000.50");
    expect(
      parsed.fields
        .find((field) => field.id === "26")
        ?.children.find((field) => field.id === "01")?.value
    ).toBe("000123");
  });
  test("static omits amount and optional empty templates", () => {
    const parsed = parseQris(
      createQris({ ...QRIS_CREATOR_SAMPLE, amount: "invalid" }).payload ?? ""
    );
    expect(parsed.fields.some((field) => field.id === "62")).toBe(false);
    expect(parsed.amount).toBeUndefined();
  });
  test("rejects missing fields, non-ASCII names and maximum account template", () => {
    expect(
      createQris({ ...QRIS_CREATOR_SAMPLE, merchantName: "" }).payload
    ).toBeNull();
    expect(
      createQris({ ...QRIS_CREATOR_SAMPLE, merchantCity: "東京" }).errors
        .merchantCity
    ).toBe("invalid");
    expect(
      createQris({
        ...QRIS_CREATOR_SAMPLE,
        providerGuid: "A".repeat(32),
        merchantId: "B".repeat(25),
      }).payload
    ).not.toBeNull();
  });
});
