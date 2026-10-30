export type TextCryptoAlgorithm = "BASE64" | "MD5" | "BCRYPT" | "ARGON2";

export type TextCryptoOperation = "CONVERT" | "DECODE" | "VERIFY";

export type TextCryptoRequest = {
  readonly algorithm: TextCryptoAlgorithm;
  readonly operation?: TextCryptoOperation;
  readonly input: string;
  readonly targetHash?: string;
  readonly urlSafe?: boolean;
  readonly withoutPadding?: boolean;
  readonly uppercaseHex?: boolean;
  readonly bcryptCost?: number;
  readonly argon2MemoryKb?: number;
  readonly argon2Iterations?: number;
  readonly argon2Parallelism?: number;
  readonly argon2SaltLength?: number;
  readonly argon2HashLength?: number;
};

export type TextCryptoResult = {
  readonly algorithm: TextCryptoAlgorithm;
  readonly operation: TextCryptoOperation;
  readonly output: string;
  readonly verified: boolean | null;
  readonly inputBytes: number;
  readonly outputLength: number;
  readonly durationMs: number;
  readonly summary: string;
};
