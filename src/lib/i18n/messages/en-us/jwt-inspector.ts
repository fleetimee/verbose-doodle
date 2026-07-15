export const jwtInspectorMessages = {
  title: "JWT Inspector",
  description:
    "Decode, inspect, edit, and verify JSON Web Tokens (JWT) interactively using standard Web Crypto APIs.",
  pageTitle: "JWT Inspector",
  pageDescription:
    "Decode, inspect, edit, and verify JSON Web Tokens (JWT) interactively using standard Web Crypto APIs.",
  pageKeywords: ["JWT", "JSON Web Token", "Parser", "Decoder", "HMAC", "HS256"],
  eyebrow: "Developer tools / 06",
  algorithmsLabel: "Algorithms",
  algorithmsValue: "HS256 symmetric (parse all)",
  limitLabel: "Limit",
  limitValue: "HMAC key verification",
  storageLabel: "Storage",
  storageValue: "Memory / Local only",
  resetExample: "Reset example",
  clear: "Clear",
  runtime: "Browser only",
  limit: "Standard JWT structure",
  tags: ["JWT", "Base64Url", "HMAC-SHA256", "Web Crypto"],
  inputLabel: "Encoded Token",
  inputDescription:
    "Paste your JWT token here. Editing this field updates the decoded JSON views.",
  inputPlaceholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  headerLabel: "Header",
  headerDescription: "Algorithm & Token Type",
  payloadLabel: "Payload",
  payloadDescription: "Data & Claims",
  secretLabel: "HMAC Secret Key (symmetric HS256)",
  secretPlaceholder: "Enter secret for signature verification...",
  signatureStatusLabel: "Signature Verification",
  signatureValid: "Signature Verified",
  signatureInvalid: "Invalid Signature",
  signatureUnsupported:
    "Signature verification not supported for this algorithm (only HS256 supported)",
  structureInvalid:
    "Invalid JWT structure (must contain 3 dot-separated parts)",
  claimsTitle: "Claims Analysis",
  claimsDescription:
    "Detailed inspection of standard time-based and identity claims.",
  claimHeaderName: "Claim",
  claimHeaderValue: "Decoded Value",
  claimHeaderDescription: "Description",
  claimHeaderStatus: "Status",
  claimExpDescription:
    "Expiration time (exp) - when the token ceases to be valid",
  claimIatDescription: "Issued at (iat) - when the token was generated",
  claimNbfDescription:
    "Not before (nbf) - before which the token must not be accepted",
  claimSubDescription:
    "Subject (sub) - the principal of the token (e.g. user ID)",
  claimIssDescription: "Issuer (iss) - the authority that issued the token",
  claimAudDescription: "Audience (aud) - the intended recipients of the token",
  statusActive: "Active / Valid",
  statusExpired: "Expired",
  statusNotYetActive: "Not active yet",
  copyToken: "Copy Token",
  copyDecoded: "Copy Decoded Payload",
  copySuccess: "Copied to clipboard!",
  tour: {
    startButton: "Start tour",
    controlsTitle: "Token Editing & Input",
    controlsDescription:
      "Paste an encoded JWT to inspect it, or edit the header/payload JSON to auto-generate a new token.",
    editorsTitle: "Signature & Claims Analysis",
    editorsDescription:
      "Provide an HMAC secret to verify signatures in real time, and analyze standard claims dynamically.",
  },
} as const;
