export const developerToolsMessages = {
  accessLabel: "Access",
  accessValue: "USER + ADMIN",
  allTools: "All tools",
  catalogControls: "Catalog controls",
  catalogNavigation: "Tool catalog",
  conversionCategory: "Conversion",
  converterDescription:
    "Convert JSON and YAML 1.2 with strict parsing, readable formatting, and round-trip safety checks.",
  converterLimit: "1 MiB source",
  converterRuntime: "Browser only",
  converterTags: ["JSON", "YAML 1.2", "Local conversion"],
  cronParserDescription:
    "Build a Unix cron schedule or inspect an expression, with the next five runs in any IANA timezone.",
  cronParserLimit: "5 or 6 fields",
  cronParserRuntime: "Browser only",
  cronParserTags: ["Cron", "Timezones", "Run preview"],
  dateConverterDescription:
    "Convert Unix seconds, milliseconds, and ISO 8601 dates across UTC and IANA timezones.",
  dateConverterLimit: "ECMAScript date range",
  dateConverterRuntime: "Browser only",
  dateConverterTags: ["Unix time", "ISO 8601", "Timezones"],
  description:
    "Small, focused workspaces for checking data and reasoning about schedules.",
  documentDescription:
    "Browse validation, conversion, and scheduling tools for development workflows.",
  documentTitle: "Developer Tools",
  eyebrow: {
    one: "Utility index / {count} tool",
    other: "Utility index / {count} tools",
  },
  filesLabel: "Files",
  filesValue: "No uploads",
  gridView: "Grid view",
  inspectionCategory: "Inspection",
  iso8583GeneratorDescription:
    "Assemble framed ISO 8583 messages with field-aware inputs and live bitmaps.",
  iso8583GeneratorLabel: "Generator",
  iso8583GeneratorLimit: "128 data elements",
  iso8583GeneratorRuntime: "Browser only",
  iso8583GeneratorTags: ["ISO 8583", "MTI", "Bitmaps"],
  iso8583ParserDescription:
    "Parse raw ISO 8583 streams or hex dumps into structured data elements with decoded semantics.",
  iso8583ParserLabel: "Parser",
  iso8583NavigationDescription:
    "Build, pack, parse, and inspect ISO 8583 messages.",
  iso8583ParserLimit: "128 data elements",
  iso8583ParserRuntime: "Browser only",
  iso8583ParserTags: ["ISO 8583", "Stream Parser", "Inspection", "Bitmaps"],
  jwtInspectorDescription:
    "Decode, inspect, edit, and verify JSON Web Tokens (JWT) using secure, client-side Web Crypto.",
  jwtInspectorLimit: "Standard JWT structure",
  jwtInspectorRuntime: "Browser only",
  jwtInspectorTags: ["JWT", "Base64URL", "HMAC", "RSA", "ECDSA", "Ed25519"],
  listView: "List view",
  navigationGroup: "Developer Tools",
  numberBaseConverterDescription:
    "Convert exact 8-, 16-, 32-, and 64-bit values across binary, octal, decimal, and hexadecimal.",
  numberBaseConverterLimit: "64-bit exact",
  numberBaseConverterRuntime: "Browser only",
  numberBaseConverterTags: ["Binary", "Hex", "Two's complement"],
  openAction: "Open tool",
  openTool: "Open {tool}",
  pageTitle: "Developer Tools",
  pageTitleSuffix: "Developer Tools",
  schedulingCategory: "Scheduling",
  schemaValidatorDescription:
    "Validate a JSON document against Draft 7, 2019-09, or 2020-12 schemas with path-based diagnostics.",
  schemaValidatorLimit: "1 MiB per input",
  schemaValidatorRuntime: "Validation service",
  schemaValidatorTags: ["JSON Schema", "Diagnostics", "Format checks"],
  schemaValidatorSearchDescription: "Validate JSON against a schema.",
  jwtInspectorSearchDescription: "Decode, edit, and verify JSON Web Tokens.",
  dateConverterSearchDescription:
    "Convert timestamps and dates across timezones.",
  iso8583GeneratorSearchDescription: "Build and pack ISO 8583 messages.",
  converterSearchDescription: "Convert between JSON and YAML.",
  numberBaseConverterSearchDescription:
    "Convert binary, octal, decimal, and hexadecimal values.",
  cronParserSearchDescription:
    "Build cron schedules, explain expressions, and preview upcoming runs.",
  iso8583ParserSearchDescription:
    "Parse raw ISO 8583 streams and inspect fields.",
  showingCount: {
    one: "Showing {count} tool",
    other: "Showing {count} tools",
  },
  validationCategory: "Validation",
} as const;
