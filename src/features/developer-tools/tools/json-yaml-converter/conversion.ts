import { parseDocument, stringify, visit } from "yaml";
import type { ConversionResult } from "@/features/developer-tools/tools/json-yaml-converter/types";
import type { DocumentFormat } from "@/features/developer-tools/types";
import { formatMessage, messages } from "@/lib/i18n";

export const MAX_SOURCE_BYTES = 1024 * 1024;

const JSON_POSITION_REGEX = /(?:position|character)\s+(\d+)/iu;
const JSON_LINE_COLUMN_REGEX = /line\s+(\d+)(?:\s+column\s+(\d+))?/iu;

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { readonly [key: string]: JsonValue };

interface JsonTreeRecord {
  readonly [key: string]: JsonTree;
}
interface JsonTreeArray extends ReadonlyArray<JsonTree> {}
type JsonTree =
  | null
  | boolean
  | number
  | string
  | JsonTreeArray
  | JsonTreeRecord;

interface YamlTreeRecord {
  readonly [key: string]: YamlTree;
}
interface YamlTreeArray extends ReadonlyArray<YamlTree> {}
interface YamlTreeMap extends ReadonlyMap<YamlTree, YamlTree> {}
type YamlTree =
  | null
  | boolean
  | number
  | bigint
  | string
  | YamlTreeArray
  | YamlTreeRecord
  | YamlTreeMap;

type SourceLocation = {
  readonly line?: number;
  readonly column?: number;
};

export class ConversionError extends Error {
  readonly line?: number;
  readonly column?: number;

  constructor(message: string, location: SourceLocation = {}, cause?: unknown) {
    super(message, { cause });
    this.name = "ConversionError";
    this.line = location.line;
    this.column = location.column;
  }
}

function offsetToLocation(source: string, offset: number): SourceLocation {
  const beforeError = source.slice(0, Math.max(0, offset));
  const lines = beforeError.split("\n");
  return {
    column: (lines.at(-1)?.length ?? 0) + 1,
    line: lines.length,
  };
}

function jsonErrorLocation(source: string, error: SyntaxError): SourceLocation {
  const positionMatch = error.message.match(JSON_POSITION_REGEX);
  if (positionMatch?.[1]) {
    return offsetToLocation(source, Number(positionMatch[1]));
  }

  const lineColumnMatch = error.message.match(JSON_LINE_COLUMN_REGEX);
  if (lineColumnMatch?.[1]) {
    return {
      column: Number(lineColumnMatch[2] ?? 1),
      line: Number(lineColumnMatch[1]),
    };
  }

  return { column: 1, line: 1 };
}

function parseJson(source: string): JsonValue {
  try {
    // SAFETY: JSON.parse returns a parsed JSON tree structure
    return validateJsonValue(JSON.parse(source) as JsonTree);
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      // biome-ignore lint/style/useErrorCause: ConversionError forwards the cause through its constructor.
      throw new ConversionError(
        formatMessage(messages.jsonYamlConverter.jsonParseError, {
          detail: error.message,
        }),
        jsonErrorLocation(source, error),
        error
      );
    }
    throw error;
  }
}

function isPrimitiveJsonTree(value: JsonTree): value is string | boolean {
  return typeof value === "string" || typeof value === "boolean";
}

function isJsonTreeNumber(value: JsonTree): value is number {
  return typeof value === "number";
}

function isJsonTreeRecord(value: JsonTree): value is JsonTreeRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateJsonValue(value: JsonTree): JsonValue {
  if (value === null || isPrimitiveJsonTree(value)) {
    return value;
  }

  if (isJsonTreeNumber(value)) {
    if (!Number.isFinite(value)) {
      throw new ConversionError(
        messages.jsonYamlConverter.nonFiniteNumberError
      );
    }
    if (Object.is(value, -0)) {
      throw new ConversionError(
        messages.jsonYamlConverter.jsonNegativeZeroError
      );
    }
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new ConversionError(
        messages.jsonYamlConverter.jsonUnsafeIntegerError
      );
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(validateJsonValue);
  }

  if (isJsonTreeRecord(value)) {
    // SAFETY: isJsonTreeRecord verifies that the value is a JSON object tree.
    const normalized: Record<string, JsonValue> = Object.create(null) as Record<
      string,
      JsonValue
    >;
    for (const [key, item] of Object.entries(value)) {
      normalized[key] = validateJsonValue(item);
    }
    return normalized;
  }

  throw new ConversionError(messages.jsonYamlConverter.errorTitle);
}

function yamlErrorLocation(error: {
  readonly linePos?: readonly { readonly line: number; readonly col: number }[];
}): SourceLocation {
  const start = error.linePos?.[0];
  return start ? { column: start.col, line: start.line } : {};
}

function isPrimitiveYamlTree(value: YamlTree): value is string | boolean {
  return typeof value === "string" || typeof value === "boolean";
}

function isYamlTreeNumber(value: YamlTree): value is number {
  return typeof value === "number";
}

function isYamlTreeBigInt(value: YamlTree): value is bigint {
  return typeof value === "bigint";
}

function isYamlObject(
  value: YamlTree
): value is YamlTreeArray | YamlTreeRecord | YamlTreeMap {
  return typeof value === "object" && value !== null;
}

function isStringKey(key: unknown): key is string {
  return typeof key === "string";
}

function isScalarBigInt(value: unknown): value is bigint {
  return typeof value === "bigint";
}

function normalizeYamlValue(
  value: YamlTree,
  ancestors: ReadonlySet<object> = new Set()
): JsonValue {
  if (value === null || isPrimitiveYamlTree(value)) {
    return value;
  }

  if (isYamlTreeNumber(value)) {
    if (!Number.isFinite(value)) {
      throw new ConversionError(
        messages.jsonYamlConverter.nonFiniteNumberError
      );
    }
    if (Object.is(value, -0)) {
      throw new ConversionError(
        messages.jsonYamlConverter.yamlNegativeZeroError
      );
    }
    return value;
  }

  if (isYamlTreeBigInt(value)) {
    if (
      value < BigInt(Number.MIN_SAFE_INTEGER) ||
      value > BigInt(Number.MAX_SAFE_INTEGER)
    ) {
      throw new ConversionError(
        messages.jsonYamlConverter.yamlUnsafeIntegerError
      );
    }
    return Number(value);
  }

  if (!isYamlObject(value)) {
    throw new ConversionError(
      messages.jsonYamlConverter.unsupportedYamlValueError
    );
  }

  if (ancestors.has(value)) {
    throw new ConversionError(messages.jsonYamlConverter.circularAliasError);
  }

  const nextAncestors = new Set(ancestors);
  nextAncestors.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => normalizeYamlValue(item, nextAncestors));
  }

  if (value instanceof Map) {
    // SAFETY: The normalized null-prototype object is populated only with validated JSON values.
    const normalized: Record<string, JsonValue> = Object.create(null) as Record<
      string,
      JsonValue
    >;
    for (const [key, item] of value) {
      if (!isStringKey(key)) {
        throw new ConversionError(
          messages.jsonYamlConverter.nonStringYamlKeyError
        );
      }
      normalized[key] = normalizeYamlValue(item, nextAncestors);
    }
    return normalized;
  }

  throw new ConversionError(
    messages.jsonYamlConverter.unsupportedYamlValueError
  );
}

function parseYaml(source: string): JsonValue {
  const document = parseDocument(source, {
    intAsBigInt: true,
    uniqueKeys: true,
    version: "1.2",
  });
  const parseError = document.errors[0];

  if (parseError) {
    const message =
      parseError.code === "DUPLICATE_KEY"
        ? messages.jsonYamlConverter.duplicateYamlKeyError
        : formatMessage(messages.jsonYamlConverter.yamlParseError, {
            detail: parseError.message,
          });
    throw new ConversionError(message, yamlErrorLocation(parseError));
  }

  visit(document, {
    Scalar: (_key, node) => {
      if (
        isScalarBigInt(node.value) &&
        node.value === 0n &&
        node.source?.startsWith("-")
      ) {
        throw new ConversionError(
          messages.jsonYamlConverter.yamlNegativeZeroError,
          offsetToLocation(source, node.range?.[0] ?? 0)
        );
      }
    },
  });

  try {
    // SAFETY: document.toJS produces an arbitrary YAML data structure matching YamlTree
    return normalizeYamlValue(
      document.toJS({ mapAsMap: true, maxAliasCount: 100 }) as YamlTree
    );
  } catch (error) {
    if (error instanceof ConversionError) {
      throw error;
    }
    // biome-ignore lint/style/useErrorCause: ConversionError forwards the cause through its constructor.
    throw new ConversionError(
      error instanceof Error
        ? formatMessage(messages.jsonYamlConverter.yamlConversionError, {
            detail: error.message,
          })
        : messages.jsonYamlConverter.errorTitle,
      undefined,
      error
    );
  }
}

export function convertDocument(
  source: string,
  sourceFormat: DocumentFormat
): ConversionResult {
  if (new TextEncoder().encode(source).length > MAX_SOURCE_BYTES) {
    throw new ConversionError(messages.jsonYamlConverter.sourceTooLargeError);
  }

  const value = sourceFormat === "json" ? parseJson(source) : parseYaml(source);

  if (sourceFormat === "json") {
    return {
      output: stringify(value, { indent: 2, lineWidth: 0 }),
      targetFormat: "yaml",
    };
  }

  return {
    output: JSON.stringify(value, null, 2),
    targetFormat: "json",
  };
}
