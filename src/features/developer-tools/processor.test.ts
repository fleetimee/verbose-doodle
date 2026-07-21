import { describe, expect, test } from "bun:test";
import type { ToolProcessor } from "./processor";

describe("ToolProcessor interface seam", () => {
  test("implements standardized ToolProcessor pattern", async () => {
    const stringLengthProcessor: ToolProcessor<string, number> = {
      id: "string-length",
      name: "String Length Counter",
      process: (input) => ({
        success: true,
        data: input.length,
      }),
    };

    expect(stringLengthProcessor.id).toBe("string-length");
    const result = await stringLengthProcessor.process("Biller Simulator");
    expect(result.success).toBeTrue();
    expect(result.data).toBe(16);
  });
});
