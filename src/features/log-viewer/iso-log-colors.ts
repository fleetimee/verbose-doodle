export function isoFieldColor(field: number, value: string): string {
  if (field === 0) {
    return "iso8583-syntax-mti";
  }
  if (field === 1) {
    return "iso8583-syntax-field";
  }
  if (field === 39) {
    return value.trim() === "00" ? "iso8583-syntax-value" : "text-destructive";
  }
  if ([4, 5, 6, 28, 29, 30, 31, 49, 50, 51, 54].includes(field)) {
    return "iso8583-syntax-length";
  }
  if ([7, 12, 13, 14, 15, 16, 17].includes(field)) {
    return "iso8583-syntax-mti";
  }
  if ([2, 35, 36, 52, 55, 102, 103].includes(field)) {
    return "iso8583-syntax-field";
  }
  if ([11, 32, 33, 37, 38, 41, 42, 98, 100].includes(field)) {
    return "iso8583-syntax-identifier";
  }
  return "iso8583-syntax-value";
}
