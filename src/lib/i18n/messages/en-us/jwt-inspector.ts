export const jwtInspectorMessages = {
  algorithmsLabel: "Algorithms",
  algorithmsValue: "HS256 symmetric (parse all)",
  claimAudDescription: "Audience (aud) - the intended recipients of the token",
  claimExpDescription:
    "Expiration time (exp) - when the token ceases to be valid",
  claimHeaderDescription: "Description",
  claimHeaderName: "Claim",
  claimHeaderStatus: "Status",
  claimHeaderValue: "Decoded Value",
  claimIatDescription: "Issued at (iat) - when the token was generated",
  claimIssDescription: "Issuer (iss) - the authority that issued the token",
  claimNbfDescription:
    "Not before (nbf) - before which the token must not be accepted",
  claimSubDescription:
    "Subject (sub) - the principal of the token (e.g. user ID)",
  claimsDescription:
    "Detailed inspection of standard time-based and identity claims.",
  claimsTitle: "Claims Analysis",
  clear: "Clear",
  copyDecoded: "Copy Decoded Payload",
  copySuccess: "Copied to clipboard!",
  copyToken: "Copy Token",
  description:
    "Decode, inspect, edit, and verify JSON Web Tokens (JWT) interactively using standard Web Crypto APIs.",
  eyebrow: "Developer tools / 06",
  headerDescription: "Algorithm & Token Type",
  headerLabel: "Header",
  inputDescription:
    "Paste your JWT token here. Editing this field updates the decoded JSON views.",
  inputLabel: "Encoded Token",
  inputPlaceholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  limit: "Standard JWT structure",
  limitLabel: "Limit",
  limitValue: "HMAC key verification",
  pageDescription:
    "Decode, inspect, edit, and verify JSON Web Tokens (JWT) interactively using standard Web Crypto APIs.",
  pageKeywords: ["JWT", "JSON Web Token", "Parser", "Decoder", "HMAC", "HS256"],
  pageTitle: "JWT Inspector",
  payloadDescription: "Data & Claims",
  payloadLabel: "Payload",
  resetExample: "Reset example",
  runtime: "Browser only",
  secretLabel: "HMAC Secret Key (symmetric HS256)",
  secretPlaceholder: "Enter secret for signature verification...",
  signatureInvalid: "Invalid Signature",
  signatureStatusLabel: "Signature Verification",
  signatureUnsupported:
    "Signature verification not supported for this algorithm (only HS256 supported)",
  signatureValid: "Signature Verified",
  statusActive: "Active / Valid",
  statusExpired: "Expired",
  statusNotYetActive: "Not active yet",
  storageLabel: "Storage",
  storageValue: "Memory / Local only",
  structureInvalid:
    "Invalid JWT structure (must contain 3 dot-separated parts)",
  tags: ["JWT", "Base64Url", "HMAC-SHA256", "Web Crypto"],
  title: "JWT Inspector",
  tour: {
    controlsDescription:
      "Paste an encoded JWT to inspect it, or edit the header/payload JSON to auto-generate a new token.",
    controlsTitle: "Token Editing & Input",
    editorsDescription:
      "Provide an HMAC secret to verify signatures in real time, and analyze standard claims dynamically.",
    editorsTitle: "Signature & Claims Analysis",
    startButton: "Start tour",
  },
} as const;
