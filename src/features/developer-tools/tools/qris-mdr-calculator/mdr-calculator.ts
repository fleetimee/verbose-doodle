export type QrisMdrInput = {
  transactionAmount: string;
  mdrRate: string;
  switchShare: string;
  issuerShare: string;
  acquirerShare: string;
};

export const DEFAULT_MDR_INPUT: QrisMdrInput = {
  transactionAmount: "108000",
  mdrRate: "0.4",
  switchShare: "24",
  issuerShare: "31",
  acquirerShare: "45",
};

export type MdrPreset = {
  readonly id: string;
  readonly label: string;
  readonly rate: string;
  readonly description: string;
};

export const MDR_PRESETS: readonly MdrPreset[] = [
  {
    id: "default",
    label: "Reguler / Sample (0.4%)",
    rate: "0.4",
    description: "Tarif standar QRIS / contoh transaksi",
  },
  {
    id: "umi_micro",
    label: "UMI Mikro > 100rb (0.3%)",
    rate: "0.3",
    description: "Usaha Mikro untuk transaksi di atas Rp100.000",
  },
  {
    id: "umi_free",
    label: "UMI Mikro ≤ 100rb (0%)",
    rate: "0",
    description: "Usaha Mikro untuk transaksi sampai dengan Rp100.000",
  },
  {
    id: "medium_large",
    label: "UKE / Menengah / Besar (0.7%)",
    rate: "0.7",
    description: "Usaha Kecil, Menengah, dan Besar",
  },
  {
    id: "spbu",
    label: "SPBU (0.4%)",
    rate: "0.4",
    description: "Stasiun Pengisian Bahan Bakar Umum",
  },
  {
    id: "government",
    label: "G2P / Pemerintah / Donasi (0%)",
    rate: "0",
    description: "Transaksi pemerintah, bansos, dan donasi sosial",
  },
];

export type QrisMdrResult = {
  transactionAmount: number;
  mdrRate: number;
  totalMdr: number;
  totalMdrRounded: number;
  netMerchantAmount: number;
  netMerchantAmountRounded: number;
  switchSharePercent: number;
  issuerSharePercent: number;
  acquirerSharePercent: number;
  switchAmount: number;
  switchAmountRounded: number;
  issuerAmount: number;
  issuerAmountRounded: number;
  acquirerAmount: number;
  acquirerAmountRounded: number;
  totalSharePercent: number;
  isShareValid: boolean;
};

function parseNum(val: string): number {
  const cleaned = val.replace(/,/g, ".").replace(/[^\d.-]/g, "");
  const num = Number.parseFloat(cleaned);
  return Number.isNaN(num) || num < 0 ? 0 : num;
}

export function calculateQrisMdr(input: QrisMdrInput): QrisMdrResult {
  const transactionAmount = parseNum(input.transactionAmount);
  const mdrRate = parseNum(input.mdrRate);
  const switchSharePercent = parseNum(input.switchShare);
  const issuerSharePercent = parseNum(input.issuerShare);
  const acquirerSharePercent = parseNum(input.acquirerShare);

  const totalSharePercent =
    Math.round(
      (switchSharePercent + issuerSharePercent + acquirerSharePercent) * 100
    ) / 100;
  const isShareValid = Math.abs(totalSharePercent - 100) < 0.001;

  const totalMdr = (transactionAmount * mdrRate) / 100;
  const totalMdrRounded = Math.round(totalMdr);

  const netMerchantAmount = transactionAmount - totalMdr;
  const netMerchantAmountRounded = Math.round(netMerchantAmount);

  const switchAmount = (totalMdr * switchSharePercent) / 100;
  const switchAmountRounded = Math.round(switchAmount);

  const issuerAmount = (totalMdr * issuerSharePercent) / 100;
  const issuerAmountRounded = Math.round(issuerAmount);

  const acquirerAmount = (totalMdr * acquirerSharePercent) / 100;
  const acquirerAmountRounded = Math.round(acquirerAmount);

  return {
    transactionAmount,
    mdrRate,
    totalMdr,
    totalMdrRounded,
    netMerchantAmount,
    netMerchantAmountRounded,
    switchSharePercent,
    issuerSharePercent,
    acquirerSharePercent,
    switchAmount,
    switchAmountRounded,
    issuerAmount,
    issuerAmountRounded,
    acquirerAmount,
    acquirerAmountRounded,
    totalSharePercent,
    isShareValid,
  };
}

export function formatRupiah(amount: number, rounded = false): string {
  if (rounded) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(amount));
  }

  // If number is a whole integer, format without decimals, else up to 2 decimal places
  const hasDecimals = amount % 1 !== 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
