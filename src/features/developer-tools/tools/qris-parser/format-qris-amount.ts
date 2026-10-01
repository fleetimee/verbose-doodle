const AMOUNT_PATTERN = /^(\d+)(?:\.(\d{1,2}))?$/;
const RUPIAH_INTEGER_FORMAT = new Intl.NumberFormat("id-ID");

export function formatQrisAmount(amount: string, currency?: string): string {
  const match = AMOUNT_PATTERN.exec(amount);
  if (currency !== "360" || !match) {
    return [amount, currency].filter(Boolean).join(" ");
  }
  const integer = RUPIAH_INTEGER_FORMAT.format(BigInt(match[1]));
  const fraction = (match[2] ?? "").padEnd(2, "0");
  return `Rp${integer},${fraction}`;
}
