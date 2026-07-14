import { describe, expect, test } from "bun:test";
import {
  ConversionError,
  convertDocument,
  MAX_SOURCE_BYTES,
} from "@/features/json-yaml-converter/conversion";

describe("convertDocument", () => {
  test("converts nested JSON values to YAML", () => {
    const result = convertDocument(
      JSON.stringify({
        customer: { name: "Ayu ☕", active: true, note: null },
        invoices: [{ id: 1, tags: [] }],
        metadata: {},
      }),
      "json"
    );

    expect(result.targetFormat).toBe("yaml");
    expect(result.output).toBe(
      [
        "customer:",
        "  name: Ayu ☕",
        "  active: true",
        "  note: null",
        "invoices:",
        "  - id: 1",
        "    tags: []",
        "metadata: {}",
        "",
      ].join("\n")
    );
  });

  test("converts YAML collections and scalars to formatted JSON", () => {
    const collection = convertDocument(
      "customer:\n  name: Ayu\nitems: [1, 2]\nempty: {}\nnothing: null\n",
      "yaml"
    );
    const scalar = convertDocument("こんにちは", "yaml");

    expect(collection).toEqual({
      targetFormat: "json",
      output: [
        "{",
        '  "customer": {',
        '    "name": "Ayu"',
        "  },",
        '  "items": [',
        "    1,",
        "    2",
        "  ],",
        '  "empty": {},',
        '  "nothing": null',
        "}",
      ].join("\n"),
    });
    expect(scalar.output).toBe('"こんにちは"');
  });

  test("reports malformed JSON and YAML with source locations", () => {
    for (const [source, format] of [
      ['{\n  "name": true,\n}', "json"],
      ["name: [one, two\n", "yaml"],
    ] as const) {
      try {
        convertDocument(source, format);
        throw new Error("Expected conversion to fail");
      } catch (error) {
        expect(error).toBeInstanceOf(ConversionError);
        expect((error as ConversionError).line).toBeGreaterThan(0);
        expect((error as ConversionError).column).toBeGreaterThan(0);
      }
    }
  });

  test("rejects duplicate YAML keys and non-string mapping keys", () => {
    expect(() => convertDocument("name: one\nname: two\n", "yaml")).toThrow(
      ConversionError
    );
    expect(() => convertDocument("? [one, two]\n: value\n", "yaml")).toThrow(
      "YAML mapping keys must be strings"
    );
  });

  test("rejects aliases that form a cycle", () => {
    expect(() =>
      convertDocument("value: &loop\n  nested: *loop\n", "yaml")
    ).toThrow("Circular YAML aliases are not supported");
  });

  test("rejects non-finite numbers and values that cannot round-trip through JSON", () => {
    for (const source of ["value: .inf\n", "value: -.inf\n", "value: .nan\n"]) {
      expect(() => convertDocument(source, "yaml")).toThrow(
        "Non-finite numbers are not supported"
      );
    }

    expect(() => convertDocument("value: -0\n", "yaml")).toThrow(
      "This YAML value cannot round-trip through JSON"
    );
    expect(() => convertDocument("value: 9007199254740993\n", "yaml")).toThrow(
      "This YAML value cannot round-trip through JSON"
    );
    expect(() => convertDocument("1e400", "json")).toThrow(
      "Non-finite numbers are not supported"
    );
    expect(() => convertDocument("-0", "json")).toThrow(
      "This JSON value cannot round-trip through YAML"
    );
  });

  test("rejects UTF-8 source input larger than 1 MiB", () => {
    const source = `"${"a".repeat(MAX_SOURCE_BYTES)}"`;

    expect(() => convertDocument(source, "json")).toThrow(
      "Source input cannot exceed 1 MiB"
    );
  });
});
