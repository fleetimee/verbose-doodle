export const JSON_SCHEMA_DIALECTS = [
  "AUTO",
  "DRAFT_7",
  "DRAFT_2019_09",
  "DRAFT_2020_12",
] as const;

export type JsonSchemaDialect = (typeof JSON_SCHEMA_DIALECTS)[number];

export type JsonSchemaValidationOutcome =
  | "VALIDATION_RESULT"
  | "PARSE_ERROR"
  | "SCHEMA_ERROR"
  | "TIMEOUT";

export type JsonSchemaDiagnostic = {
  readonly source: "SCHEMA" | "INSTANCE";
  readonly message: string;
  readonly instancePath?: string;
  readonly schemaPath?: string;
  readonly keyword?: string;
  readonly line?: number;
  readonly column?: number;
};

export type JsonSchemaValidationRequest = {
  readonly schema: string;
  readonly instance: string;
  readonly dialect: JsonSchemaDialect;
  readonly formatAssertions: boolean;
};

export type JsonSchemaValidationResult = {
  readonly outcome: JsonSchemaValidationOutcome;
  readonly valid: boolean | null;
  readonly resolvedDialect: Exclude<JsonSchemaDialect, "AUTO"> | null;
  readonly errorCount: number;
  readonly truncated: boolean;
  readonly durationMs: number;
  readonly diagnostics: readonly JsonSchemaDiagnostic[];
};
