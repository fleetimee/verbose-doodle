import { z } from "zod";

type JsonValue = z.infer<ReturnType<typeof z.json>>;
type JsonObject = { [key: string]: JsonValue };

interface InferredSchema {
  format?: string;
  items?: InferredSchema;
  properties?: Record<string, InferredSchema>;
  required?: string[];
  type?:
    | "null"
    | "boolean"
    | "integer"
    | "number"
    | "string"
    | "array"
    | "object";
}

interface FormatResult {
  readonly error?: string;
  readonly formatted?: string;
}

interface SchemaResult {
  readonly error?: string;
  readonly schema?: string;
}

interface MockResult {
  readonly error?: string;
  readonly mock?: string;
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isJsonString(value: JsonValue | undefined): value is string {
  return typeof value === "string";
}

function isJsonNumber(value: JsonValue | undefined): value is number {
  return typeof value === "number";
}

function isJsonBoolean(value: JsonValue): value is boolean {
  return typeof value === "boolean";
}

export type JsonSyntaxCheck = {
  readonly valid: boolean;
  readonly error?: string;
  readonly line?: number;
  readonly column?: number;
};

const LINE_COL_REGEX = /line\s+(\d+).*?column\s+(\d+)/i;
const POS_REGEX = /position\s+(\d+)/i;
const DATE_TIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}:\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URI_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s]+$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateJsonSyntax(text: string): JsonSyntaxCheck {
  if (!text.trim()) {
    return { valid: true };
  }
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    const lineColMatch = message.match(LINE_COL_REGEX);
    if (lineColMatch) {
      return {
        column: Number.parseInt(lineColMatch[2], 10),
        error: message,
        line: Number.parseInt(lineColMatch[1], 10),
        valid: false,
      };
    }

    const posMatch = message.match(POS_REGEX);
    if (posMatch) {
      const pos = Number.parseInt(posMatch[1], 10);
      const before = text.slice(0, pos);
      const lines = before.split("\n");
      const line = lines.length;
      const column = (lines.at(-1)?.length ?? 0) + 1;
      return {
        column,
        error: message,
        line,
        valid: false,
      };
    }

    return {
      error: message,
      valid: false,
    };
  }
}

export function formatJsonText(text: string): FormatResult {
  try {
    const parsed = JSON.parse(text);
    return { formatted: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function inferStringType(value: string): InferredSchema {
  if (DATE_TIME_REGEX.test(value)) {
    return { format: "date-time", type: "string" };
  }
  if (DATE_REGEX.test(value)) {
    return { format: "date", type: "string" };
  }
  if (TIME_REGEX.test(value)) {
    return { format: "time", type: "string" };
  }
  if (EMAIL_REGEX.test(value)) {
    return { format: "email", type: "string" };
  }
  if (URI_REGEX.test(value)) {
    return { format: "uri", type: "string" };
  }
  if (UUID_REGEX.test(value)) {
    return { format: "uuid", type: "string" };
  }
  return { type: "string" };
}

function inferObjectType(value: JsonObject): InferredSchema {
  const properties: Record<string, InferredSchema> = {};
  const required: string[] = [];
  for (const [key, propValue] of Object.entries(value)) {
    properties[key] = inferSchemaType(propValue);
    required.push(key);
  }
  const schema: InferredSchema = { properties, type: "object" };
  if (required.length > 0) {
    schema.required = required;
  }
  return schema;
}

function inferSchemaType(value: JsonValue): InferredSchema {
  if (value === null) {
    return { type: "null" };
  }
  if (isJsonBoolean(value)) {
    return { type: "boolean" };
  }
  if (isJsonNumber(value)) {
    return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
  }
  if (isJsonString(value)) {
    return inferStringType(value);
  }
  if (Array.isArray(value)) {
    return {
      items: value.length > 0 ? inferSchemaType(value[0]) : {},
      type: "array",
    };
  }
  if (isJsonObject(value)) {
    return inferObjectType(value);
  }
  return {};
}

export function inferSchemaFromJson(instanceJson: string): SchemaResult {
  try {
    const parsed = z.json().parse(JSON.parse(instanceJson));
    const inferred = inferSchemaType(parsed);
    const rootSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      ...inferred,
    };
    return { schema: JSON.stringify(rootSchema, null, 2) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function mockStringValue(schema: JsonObject): string {
  const format = schema.format;
  if (format === "email") {
    return "developer@example.com";
  }
  if (format === "date-time") {
    return "2026-09-21T12:00:00Z";
  }
  if (format === "date") {
    return "2026-09-21";
  }
  if (format === "time") {
    return "12:00:00";
  }
  if (format === "uri") {
    return "https://example.com";
  }
  if (format === "uuid") {
    return "123e4567-e89b-12d3-a456-426614174000";
  }
  return "sample";
}

function mockObjectValue(schema: JsonObject) {
  const result: JsonObject = {};
  const properties = schema.properties;
  if (properties === undefined || !isJsonObject(properties)) {
    return result;
  }
  for (const [key, propSchema] of Object.entries(properties)) {
    if (!isJsonObject(propSchema)) {
      throw new Error(`Schema for property "${key}" must be an object`);
    }
    result[key] = generateMockValue(propSchema);
  }
  return result;
}

function mockPrimitiveOrTyped(
  type: string | undefined,
  schema: JsonObject
): JsonValue {
  if (type === "string") {
    return mockStringValue(schema);
  }
  if (type === "integer") {
    return isJsonNumber(schema.minimum) ? schema.minimum : 1;
  }
  if (type === "number") {
    return isJsonNumber(schema.minimum) ? schema.minimum : 1.0;
  }
  if (type === "boolean") {
    return true;
  }
  if (type === "null") {
    return null;
  }
  if (type === "array") {
    return schema.items !== undefined && isJsonObject(schema.items)
      ? [generateMockValue(schema.items)]
      : [];
  }
  if (
    type === "object" ||
    (schema.properties !== undefined && isJsonObject(schema.properties))
  ) {
    return mockObjectValue(schema);
  }
  return "value";
}

function generateMockValue(schema: JsonObject): JsonValue {
  if (Array.isArray(schema.examples) && schema.examples.length > 0) {
    return schema.examples[0];
  }
  if (schema.default !== undefined) {
    return schema.default;
  }
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }
  if (Array.isArray(schema.const) && schema.const.length > 0) {
    return schema.const[0];
  }

  const type = isJsonString(schema.type) ? schema.type : undefined;
  return mockPrimitiveOrTyped(type, schema);
}

export function generateMockFromSchema(schemaJson: string): MockResult {
  try {
    const parsed = z.json().parse(JSON.parse(schemaJson));
    if (!isJsonObject(parsed)) {
      return { error: "Schema must be an object" };
    }
    const mock = generateMockValue(parsed);
    return { mock: JSON.stringify(mock, null, 2) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
