export const hmacGeneratorMessages = {
  title: "HMAC signature",
  description:
    "Generate HMAC-SHA-256 signatures and compare partner API signatures.",
  runtime: "Browser only",
  limit: "100 KB per message or key",
  tags: ["HMAC", "SHA-256", "Signatures"],
  keywords: [
    "HMAC generator",
    "API signature",
    "SHA-256",
    "signature comparison",
  ],
  inputs: "Signing inputs",
  results: "Signature and comparison",
  message: "Message",
  key: "Signing key",
  messageEncoding: "Message encoding",
  keyEncoding: "Key encoding",
  outputEncoding: "Signature encoding",
  expectedEncoding: "Expected signature encoding",
  utf8: "UTF-8",
  hex: "Hex",
  base64: "Base64",
  reset: "Load example",
  clear: "Clear inputs",
  copy: "Copy signature",
  copied: "Signature copied",
  copyError: "Could not copy. Select the signature and copy it manually.",
  note: "Message whitespace and line endings are signed exactly as entered. Hex inputs allow whitespace between bytes.",
  privacy:
    "Calculated locally. Messages and keys are not saved or sent to a server.",
  example:
    "The default inputs are a public example, not production credentials.",
  expected: "Expected signature (optional)",
  expectedHint:
    "Paste a full SHA-256 signature. Hex accepts either letter case; Base64 requires padding.",
  signature: "Generated signature",
  bytes: "{message} message bytes · {key} key bytes · 32 signature bytes",
  preview: "Exact signed bytes (hex)",
  previewHint:
    "The byte preview includes spaces, tabs, and newlines. No JSON formatting or normalization is applied.",
  match: "Signatures match",
  mismatch: "Signatures do not match",
  noExpected: "Enter an expected signature to compare.",
  pending: "Calculating signature…",
  empty:
    "Enter a signing key to generate a signature. Empty messages are supported.",
  invalid: "Check the signing inputs",
  hexError:
    "Enter complete hex byte pairs using 0–9 and A–F. Only whitespace separators are allowed.",
  unicodeError:
    "The text contains an unpaired Unicode surrogate. Replace it or use hex bytes.",
  sizeError: "This input exceeds 100 KB. Use a smaller value.",
  keyError: "Enter a non-empty signing key.",
  signatureError:
    "Enter 64 hex digits or a canonical, padded 44-character Base64 SHA-256 signature.",
  failed:
    "Could not calculate the signature. Check your browser and try again.",
  emptyBytes: "(empty message)",
} as const;
