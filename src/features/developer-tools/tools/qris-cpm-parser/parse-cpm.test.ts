import { describe, expect, test } from "bun:test";
import {
  CPM_SAMPLE,
  CPM_SAMPLE_HEX,
  parseCpm,
} from "@/features/developer-tools/tools/qris-cpm-parser/parse-cpm";

describe("CPM decoding", () => {
  test("decodes the same nested CPM fields from Base64 and hex", () => {
    const result = parseCpm(` ${CPM_SAMPLE}\n`, "base64");
    expect(result).toEqual(parseCpm(CPM_SAMPLE_HEX, "hex"));
    expect(result.profileMatches).toBe(true);
    expect(result.tlv[0].value_ascii).toBe("CPV01");
    expect(
      result.tlv[1].children?.find((node) => node.tag === "5A")?.value_bcd
    ).toBe("9360011210006580709");
  });
  test("preserves issuer data without encryption or decryption", () => {
    const result = parseCpm("63069f7403010203", "hex");
    expect(result.tlv[0].children?.[0]).toEqual({
      tag: "9F74",
      name: "Issuer Private Data",
      length: 3,
      value_hex: "010203",
      value_b64: "AQID",
    });
    expect(result.profileMatches).toBe(false);
    expect(parseCpm("5a0312345f", "hex").tlv[0].value_bcd).toBe("12345");
  });
  test("handles canonical long lengths", () => {
    expect(
      parseCpm(`508180${"41".repeat(128)}`, "hex").tlv[0].value_ascii
    ).toBe("A".repeat(128));
  });
  test("rejects malformed encoding and truncated or invalid BER", () => {
    for (const input of [
      "Z!",
      "abc",
      "85054350",
      "9f",
      "8580",
      "85810141",
      "8582008041",
      "618185",
      "85",
    ]) {
      expect(() => parseCpm(input, "hex")).toThrow();
    }
    expect(() => parseCpm("%%%", "base64")).toThrow();
    expect(() => parseCpm("A".repeat(131_073), "base64")).toThrow();
  });
});

test("auto detects both supported encodings", () => {
  expect(parseCpm(CPM_SAMPLE, "auto")).toEqual(parseCpm(CPM_SAMPLE, "base64"));
  expect(parseCpm(CPM_SAMPLE_HEX, "auto")).toEqual(
    parseCpm(CPM_SAMPLE_HEX, "hex")
  );
});
