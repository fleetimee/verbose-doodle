export const developerToolsMessages = {
  navigationGroup: "Developer Tools",
  catalogNavigation: "Tool catalog",
  pageTitle: "Developer Tools",
  documentTitle: "Developer Tools | BPDDIY DevTools",
  documentDescription:
    "Browse validation and conversion tools for structured data workflows.",
  eyebrow: {
    one: "Utility index / {count} tool",
    other: "Utility index / {count} tools",
  },
  description:
    "Small, focused workspaces for checking and transforming structured data.",
  accessLabel: "Access",
  accessValue: "USER + ADMIN",
  filesLabel: "Files",
  filesValue: "No uploads",
  categoryCount: {
    one: "{count} tool",
    other: "{count} tools",
  },
  validationCategory: "Validation",
  validationDescription:
    "Check a document against explicit rules before it reaches another system.",
  conversionCategory: "Conversion",
  conversionDescription:
    "Translate between data formats while keeping the source under your control.",
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
  openTool: "Open {tool}",
  openAction: "Open tool",
} as const;
