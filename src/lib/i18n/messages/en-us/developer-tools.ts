export const developerToolsMessages = {
  navigationGroup: "Developer Tools",
  catalogNavigation: "Tool catalog",
  pageTitle: "Developer Tools",
  documentTitle: "Developer Tools | BPDDIY DevTools",
  documentDescription:
    "Browse validation, conversion, and scheduling tools for development workflows.",
  eyebrow: {
    one: "Utility index / {count} tool",
    other: "Utility index / {count} tools",
  },
  description:
    "Small, focused workspaces for checking data and reasoning about schedules.",
  accessLabel: "Access",
  accessValue: "USER + ADMIN",
  filesLabel: "Files",
  filesValue: "No uploads",
  catalogControls: "Catalog controls",
  allTools: "All tools",
  gridView: "Grid view",
  listView: "List view",
  showingCount: {
    one: "Showing {count} tool",
    other: "Showing {count} tools",
  },
  validationCategory: "Validation",
  conversionCategory: "Conversion",
  schedulingCategory: "Scheduling",
  dateConverterDescription:
    "Convert Unix seconds, milliseconds, and ISO 8601 dates across UTC and IANA timezones.",
  dateConverterRuntime: "Browser only",
  dateConverterLimit: "ECMAScript date range",
  dateConverterTags: ["Unix time", "ISO 8601", "Timezones"],
  schemaValidatorDescription:
    "Validate a JSON document against Draft 7, 2019-09, or 2020-12 schemas with path-based diagnostics.",
  schemaValidatorRuntime: "Validation service",
  schemaValidatorLimit: "1 MiB per input",
  schemaValidatorTags: ["JSON Schema", "Diagnostics", "Format checks"],
  converterDescription:
    "Convert JSON and YAML 1.2 with strict parsing, readable formatting, and round-trip safety checks.",
  converterRuntime: "Browser only",
  converterLimit: "1 MiB source",
  converterTags: ["JSON", "YAML 1.2", "Local conversion"],
  numberBaseConverterDescription:
    "Convert exact 8-, 16-, 32-, and 64-bit values across binary, octal, decimal, and hexadecimal.",
  numberBaseConverterRuntime: "Browser only",
  numberBaseConverterLimit: "64-bit exact",
  numberBaseConverterTags: ["Binary", "Hex", "Two's complement"],
  cronParserDescription:
    "Explain five- or six-field Unix cron expressions and preview the next five runs in any IANA timezone.",
  cronParserRuntime: "Browser only",
  cronParserLimit: "5 or 6 fields",
  cronParserTags: ["Cron", "Timezones", "Run preview"],
  jwtInspectorDescription:
    "Decode, inspect, edit, and verify JSON Web Tokens (JWT) using secure, client-side Web Crypto.",
  jwtInspectorRuntime: "Browser only",
  jwtInspectorLimit: "Standard JWT structure",
  jwtInspectorTags: ["JWT", "Base64Url", "HMAC-SHA256", "Web Crypto"],
  openTool: "Open {tool}",
  openAction: "Open tool",
} as const;
