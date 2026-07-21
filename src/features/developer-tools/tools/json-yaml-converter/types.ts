import type { DocumentFormat } from "@/features/developer-tools/types";

export type ConversionResult = {
  readonly targetFormat: DocumentFormat;
  readonly output: string;
};
