export interface ClaimDefinition {
  readonly description: string;
  readonly name: string;
  readonly rfc?: string;
}

export const HEADER_CLAIMS: Record<string, ClaimDefinition> = {
  alg: {
    name: "Algorithm",
    description: "Cryptographic algorithm used to secure the token (RFC 7515)",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.1",
  },
  typ: {
    name: "Type",
    description: 'Media type of the complete token, typically "JWT" (RFC 7519)',
    rfc: "https://datatracker.ietf.org/doc/html/rfc7519#section-5.1",
  },
  cty: {
    name: "Content Type",
    description: "Content type of the payload for nested tokens (RFC 7515)",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.10",
  },
  kid: {
    name: "Key ID",
    description: "Key identifier hint indicating which key was used (RFC 7515)",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.4",
  },
  jku: {
    name: "JWK Set URL",
    description:
      "URI that refers to a resource for a set of JSON-encoded public keys",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.2",
  },
  jwk: {
    name: "JSON Web Key",
    description:
      "Public key that corresponds to the key used to sign the token",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.3",
  },
  x5u: {
    name: "X.509 URL",
    description:
      "URI that refers to an X.509 public key certificate (RFC 7515)",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.5",
  },
  x5c: {
    name: "X.509 Certificate Chain",
    description:
      "Certificate chain for the public key used to verify the token",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.6",
  },
  x5t: {
    name: "X.509 SHA-1 Thumbprint",
    description: "Base64URL-encoded SHA-1 thumbprint of the X.509 certificate",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.7",
  },
  "x5t#S256": {
    name: "X.509 SHA-256 Thumbprint",
    description:
      "Base64URL-encoded SHA-256 thumbprint of the X.509 certificate",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.8",
  },
  crit: {
    name: "Critical",
    description: "Header parameter names that must be understood and processed",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.11",
  },
};

export const PAYLOAD_CLAIMS: Record<string, ClaimDefinition> = {
  iss: {
    name: "Issuer",
    description: "Identifies the principal that issued the JWT (RFC 7519)",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.1",
  },
  sub: {
    name: "Subject",
    description: "Subject (whom the token refers to)",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.2",
  },
  aud: {
    name: "Audience",
    description:
      "Identifies the recipient(s) that the JWT is intended for (RFC 7519)",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3",
  },
  exp: {
    name: "Expiration Time",
    description:
      "Identifies the expiration time on or after which the JWT must not be accepted",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.4",
  },
  nbf: {
    name: "Not Before",
    description:
      "Identifies the time before which the JWT must not be accepted",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.5",
  },
  iat: {
    name: "Issued At",
    description: "Issued at (time token was generated)",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.6",
  },
  jti: {
    name: "JWT ID",
    description: "Unique case-sensitive identifier for the JWT",
    rfc: "https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7",
  },
};

export function getClaimInfo(
  key: string,
  type?: "header" | "payload"
): ClaimDefinition | undefined {
  if (type === "header") {
    return HEADER_CLAIMS[key];
  }
  if (type === "payload") {
    return PAYLOAD_CLAIMS[key];
  }
  return PAYLOAD_CLAIMS[key] || HEADER_CLAIMS[key];
}

export function isKnownClaim(key: string): boolean {
  return Boolean(PAYLOAD_CLAIMS[key] || HEADER_CLAIMS[key]);
}

export function formatTimeRelative(secondsDelta: number): string {
  const absSeconds = Math.abs(secondsDelta);
  if (absSeconds < 60) {
    return `${absSeconds}s`;
  }
  const minutes = Math.floor(absSeconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes === 0
      ? `${hours}h`
      : `${hours}h ${remainingMinutes}m`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours === 0 ? `${days}d` : `${days}d ${remainingHours}h`;
}

export interface TimestampClaimStatus {
  readonly isoDate: string;
  readonly isValid: boolean;
  readonly localDate: string;
  readonly statusLabel: string;
  readonly statusType: "active" | "expired" | "pending" | "info";
  readonly summary: string;
}

export function formatClaimTimestamp(
  name: string,
  value: unknown,
  now: number = Date.now()
): TimestampClaimStatus | null {
  if (!["exp", "iat", "nbf"].includes(name)) {
    return null;
  }
  const numericVal = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericVal) || numericVal <= 0) {
    return {
      isValid: false,
      isoDate: "",
      localDate: "",
      statusLabel: "Invalid timestamp",
      statusType: "expired",
      summary: "Invalid timestamp",
    };
  }

  const date = new Date(numericVal * 1000);
  if (Number.isNaN(date.getTime())) {
    return {
      isValid: false,
      isoDate: "",
      localDate: "",
      statusLabel: "Invalid timestamp",
      statusType: "expired",
      summary: "Invalid timestamp",
    };
  }

  const isoDate = date.toISOString();
  const localDate = date.toLocaleString();
  const diffSeconds = Math.ceil(numericVal - now / 1000);

  if (name === "exp") {
    if (diffSeconds <= 0) {
      const rel = formatTimeRelative(diffSeconds);
      return {
        isValid: true,
        isoDate,
        localDate,
        statusLabel: `Expired ${rel} ago`,
        statusType: "expired",
        summary: `${isoDate} · Expired (${rel} ago)`,
      };
    }
    const rel = formatTimeRelative(diffSeconds);
    return {
      isValid: true,
      isoDate,
      localDate,
      statusLabel: `Expires in ${rel}`,
      statusType: "active",
      summary: `${isoDate} · Expires in ${rel}`,
    };
  }

  if (name === "nbf") {
    if (diffSeconds > 0) {
      const rel = formatTimeRelative(diffSeconds);
      return {
        isValid: true,
        isoDate,
        localDate,
        statusLabel: `Active in ${rel}`,
        statusType: "pending",
        summary: `${isoDate} · Not active yet (starts in ${rel})`,
      };
    }
    return {
      isValid: true,
      isoDate,
      localDate,
      statusLabel: "Active / Valid",
      statusType: "active",
      summary: `${isoDate} · Active`,
    };
  }

  // iat
  const elapsed = Math.abs(diffSeconds);
  const rel = formatTimeRelative(elapsed);
  return {
    isValid: true,
    isoDate,
    localDate,
    statusLabel: `Issued ${rel} ago`,
    statusType: "info",
    summary: `${isoDate} · Issued ${rel} ago`,
  };
}
