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
  cronParserDescription:
    "Explain five- or six-field Unix cron expressions and preview the next five runs in any IANA timezone.",
  cronParserRuntime: "Browser only",
  cronParserLimit: "5 or 6 fields",
  cronParserTags: ["Cron", "Timezones", "Run preview"],
  openTool: "Open {tool}",
  openAction: "Open tool",
} as const;
