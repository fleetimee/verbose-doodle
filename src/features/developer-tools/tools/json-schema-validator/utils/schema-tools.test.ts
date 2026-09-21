import { describe, expect, test } from "bun:test";
import {
  formatJsonText,
  generateMockFromSchema,
  inferSchemaFromJson,
  validateJsonSyntax,
} from "./schema-tools";

describe("schema-tools", () => {
  describe("validateJsonSyntax", () => {
    test("returns valid for correct JSON", () => {
      expect(validateJsonSyntax('{"name": "Alice"}')).toEqual({ valid: true });
      expect(validateJsonSyntax("")).toEqual({ valid: true });
    });

    test("detects syntax error for broken JSON", () => {
      const result = validateJsonSyntax('{\n  "name":\n}');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("formatJsonText", () => {
    test("formats valid unformatted JSON", () => {
      const result = formatJsonText('{"a":1,"b":2}');
      expect(result.formatted).toBe('{\n  "a": 1,\n  "b": 2\n}');
    });

    test("returns error for invalid JSON", () => {
      const result = formatJsonText('{"a":');
      expect(result.error).toBeDefined();
    });
  });

  describe("inferSchemaFromJson", () => {
    test("infers primitive types, objects, and formats", () => {
      const instance = JSON.stringify({
        active: true,
        age: 30,
        createdAt: "2026-09-21T12:00:00Z",
        email: "test@example.com",
        name: "Test User",
        tags: ["admin", "dev"],
      });

      const { schema, error } = inferSchemaFromJson(instance);
      expect(error).toBeUndefined();
      expect(schema).toBeDefined();

      const parsed = JSON.parse(schema ?? "{}");
      expect(parsed.$schema).toBe(
        "https://json-schema.org/draft/2020-12/schema"
      );
      expect(parsed.type).toBe("object");
      expect(parsed.properties.email).toEqual({
        format: "email",
        type: "string",
      });
      expect(parsed.properties.createdAt).toEqual({
        format: "date-time",
        type: "string",
      });
      expect(parsed.properties.age).toEqual({ type: "integer" });
      expect(parsed.properties.active).toEqual({ type: "boolean" });
      expect(parsed.properties.tags.type).toBe("array");
      expect(parsed.properties.tags.items).toEqual({ type: "string" });
      expect(parsed.required).toContain("email");
    });

    test("returns error for unparseable input", () => {
      const { schema, error } = inferSchemaFromJson("invalid json");
      expect(schema).toBeUndefined();
      expect(error).toBeDefined();
    });
  });

  describe("generateMockFromSchema", () => {
    test("generates mock values for schema properties", () => {
      const schema = JSON.stringify({
        properties: {
          age: { type: "integer" },
          email: { format: "email", type: "string" },
          name: { type: "string" },
          roles: { items: { type: "string" }, type: "array" },
        },
        type: "object",
      });

      const { mock, error } = generateMockFromSchema(schema);
      expect(error).toBeUndefined();
      expect(mock).toBeDefined();

      const parsed = JSON.parse(mock ?? "{}");
      expect(parsed.email).toBe("developer@example.com");
      expect(parsed.name).toBe("sample");
      expect(parsed.age).toBe(1);
      expect(Array.isArray(parsed.roles)).toBe(true);
    });

    test("uses default or examples if defined", () => {
      const schema = JSON.stringify({
        properties: {
          status: { default: "ACTIVE", type: "string" },
        },
        type: "object",
      });

      const { mock } = generateMockFromSchema(schema);
      const parsed = JSON.parse(mock ?? "{}");
      expect(parsed.status).toBe("ACTIVE");
    });
  });
});
