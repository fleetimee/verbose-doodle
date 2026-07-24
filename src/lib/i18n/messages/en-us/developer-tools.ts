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
  inspectionCategory: "Inspection",
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
  nfcReaderName: "NFC Reader Inspector",
  nfcReaderCatalogDescription:
    "Connect to a loopback bridge and verify PC/SC health for an ACS ACR122U reader.",
  nfcReaderRuntime: "Local Bun bridge",
  nfcReaderLimit: "Loopback WebSocket",
  nfcReaderTags: ["NFC", "PC/SC", "ACR122U", "WebSocket"],
  nfcReaderDocumentTitle: "NFC Reader Inspector | BPDDIY DevTools",
  nfcReaderDocumentDescription:
    "Check the local Bun bridge and ACS ACR122U PC/SC reader health.",
  nfcReaderDocumentKeywords: [
    "NFC reader",
    "ACR122U",
    "PC/SC",
    "WebSocket bridge",
  ],
  nfcReaderEyebrow: "Hardware inspection / local bridge",
  nfcReaderTitle: "NFC Reader Inspector",
  nfcReaderTransport: "LOOPBACK / WS",
  nfcReaderDescription:
    "Verify that the local bridge can reach your ACS ACR122U before a scan session begins.",
  nfcBridgeStatusLabel: "Bridge status",
  nfcReaderStatusLabel: "Reader status",
  nfcBridgeVersionLabel: "Protocol bridge",
  nfcBridgeNotConnected:
    "Connect to the local bridge to read its version and capabilities.",
  nfcReaderNotDetected:
    "No compatible reader has reported itself to the bridge.",
  nfcConnectBridge: "Connect bridge",
  nfcDisconnectBridge: "Disconnect",
  nfcRetryBridge: "Retry connection",
  nfcReaderNextStepTitle: "Ready for the next NFC slice",
  nfcReaderNextStepDescription:
    "This first slice confirms loopback transport, bridge authentication, PC/SC availability, and ACR122U reader health. Tag scanning and NDEF inspection will build on this status contract.",
  nfcBridgeConnectionStates: {
    connected: "Connected",
    connecting: "Connecting",
    disconnected: "Disconnected",
    error: "Connection error",
  },
  nfcReaderStates: {
    detected: "Reader detected",
    "tag-detected": "Tag detected",
    unavailable: "Reader unavailable",
    waiting: "Waiting for tag",
  },
  openTool: "Open {tool}",
  openAction: "Open tool",
} as const;
