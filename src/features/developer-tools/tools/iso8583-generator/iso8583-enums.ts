import type { Iso8583FieldKind } from "./pack-iso8583";

export type Iso8583EnumOption = {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
};

export const ISO8583_FIELD_ENUMS: Readonly<
  Record<number, readonly Iso8583EnumOption[]>
> = {
  // Bit 3: Processing Code (6 numeric digits)
  3: [
    { value: "000000", label: "000000 · Purchase / Goods & Services" },
    { value: "010000", label: "010000 · Cash Withdrawal" },
    { value: "200000", label: "200000 · Refund / Return" },
    { value: "300000", label: "300000 · Available Balance Inquiry" },
    { value: "310000", label: "310000 · Balance Inquiry" },
    { value: "392000", label: "392000 · Account Inquiry (BPD DIY)" },
    { value: "500000", label: "500000 · Bill Payment" },
    { value: "920000", label: "920000 · Batch Settlement" },
  ],

  // Bit 18: Merchant Category Code / Merchant Type (4 numeric digits)
  18: [
    { value: "6011", label: "6011 · Automated Cash Disbursements (ATM)" },
    { value: "6010", label: "6010 · Manual Cash Disbursements (Bank Branch)" },
    {
      value: "6012",
      label: "6012 · Financial Institutions (Merchandise & Services)",
    },
    { value: "6099", label: "6099 · Financial Services (BPD DIY)" },
    { value: "5411", label: "5411 · Grocery Stores & Supermarkets" },
    { value: "5812", label: "5812 · Eating Places & Restaurants" },
    { value: "5999", label: "5999 · Miscellaneous & Specialty Retail" },
  ],

  // Bit 22: Point of Service Entry Mode (3 numeric digits)
  22: [
    {
      value: "012",
      label: "012 · Manual / Key-Entered (PAN Auto-Entry)",
    },
    { value: "021", label: "021 · Magnetic Stripe (PIN Capable)" },
    { value: "022", label: "022 · Magnetic Stripe (PIN Entry)" },
    { value: "051", label: "051 · EMV / ICC Chip (PIN Capable)" },
    { value: "071", label: "071 · Contactless / NFC Chip" },
    { value: "901", label: "901 · Magnetic Stripe (Full Track Read)" },
    { value: "000", label: "000 · Unspecified" },
  ],

  // Bit 25: Point of Service Condition Code (2 numeric digits)
  25: [
    {
      value: "00",
      label: "00 · Normal Presentment (Card & Customer Present)",
    },
    { value: "01", label: "01 · Customer Not Present (Mail / Phone)" },
    { value: "08", label: "08 · Mail / Telephone Order" },
    { value: "14", label: "14 · Electronic Commerce / Internet" },
    { value: "59", label: "59 · Electronic Terminal (ATM / POS)" },
  ],

  // Bit 39: Response Code (2 numeric digits)
  39: [
    { value: "00", label: "00 · Approved / Success" },
    { value: "01", label: "01 · Refer to Card Issuer" },
    { value: "05", label: "05 · Do Not Honor" },
    { value: "12", label: "12 · Invalid Transaction" },
    { value: "13", label: "13 · Invalid Amount" },
    { value: "14", label: "14 · Invalid Card Number" },
    { value: "30", label: "30 · Format Error" },
    { value: "41", label: "41 · Lost Card" },
    { value: "43", label: "43 · Stolen Card" },
    { value: "51", label: "51 · Insufficient Funds" },
    { value: "54", label: "54 · Expired Card" },
    { value: "55", label: "55 · Incorrect PIN" },
    { value: "58", label: "58 · Transaction Not Permitted to Terminal" },
    { value: "68", label: "68 · Response Received Too Late (Timeout)" },
    { value: "91", label: "91 · Issuer System Unavailable" },
    { value: "96", label: "96 · System Malfunction / Unable to Process" },
  ],

  // Bit 49: Currency Code (3 numeric digits - ISO 4217)
  49: [
    { value: "360", label: "360 · IDR (Indonesian Rupiah)" },
    { value: "840", label: "840 · USD (US Dollar)" },
    { value: "978", label: "978 · EUR (Euro)" },
    { value: "702", label: "702 · SGD (Singapore Dollar)" },
    { value: "392", label: "392 · JPY (Japanese Yen)" },
    { value: "458", label: "458 · MYR (Malaysian Ringgit)" },
    { value: "036", label: "036 · AUD (Australian Dollar)" },
  ],

  // Bit 70: Network Management Information Code (3 numeric digits)
  70: [
    { value: "001", label: "001 · Sign-On" },
    { value: "002", label: "002 · Sign-Off" },
    { value: "301", label: "301 · Echo Test / Cutover" },
    { value: "061", label: "061 · System Conditions" },
    { value: "101", label: "101 · Key Exchange" },
    { value: "201", label: "201 · Cutover / Reconciliation" },
  ],
};

export function getIso8583FieldEnumOptions(
  fieldNumber: number
): readonly Iso8583EnumOption[] | undefined {
  return ISO8583_FIELD_ENUMS[fieldNumber];
}

export function isIso8583EnumField(fieldNumber: number): boolean {
  return fieldNumber in ISO8583_FIELD_ENUMS;
}

export type SituationalFieldDefinition = {
  readonly number: number;
  readonly label: string;
  readonly kind: Iso8583FieldKind;
  readonly length: number;
  readonly defaultValue: string;
  readonly description: string;
};

export const COMMON_SITUATIONAL_FIELDS: readonly SituationalFieldDefinition[] =
  [
    {
      number: 28,
      label: "Amount, transaction fee",
      kind: "n",
      length: 9,
      defaultValue: "000000000",
      description:
        "Transaction surcharge / fee amount in minor units (9 digits).",
    },
    {
      number: 48,
      label: "Private data",
      kind: "lllvar",
      length: 999,
      defaultValue: "DATA001",
      description:
        "Private data elements, biller reference numbers, customer details.",
    },
    {
      number: 54,
      label: "Additional amounts",
      kind: "lllvar",
      length: 120,
      defaultValue: "1001360C000005000000",
      description:
        "Account ledger or available balance breakdowns and fee amounts.",
    },
    {
      number: 61,
      label: "Other private data",
      kind: "lllvar",
      length: 999,
      defaultValue: "00100",
      description:
        "Point of service dynamic private data or biller extension payload.",
    },
    {
      number: 102,
      label: "Account identification 1",
      kind: "llvar",
      length: 28,
      defaultValue: "001234567890",
      description:
        "Originating / source account or customer identification number.",
    },
    {
      number: 103,
      label: "Account identification 2",
      kind: "llvar",
      length: 28,
      defaultValue: "009876543210",
      description:
        "Destination / beneficiary account or receiving party identifier.",
    },
    {
      number: 104,
      label: "Transaction description",
      kind: "lllvar",
      length: 100,
      defaultValue: "PAYMENT SIMULATION",
      description: "Free-form transaction description or statement narrative.",
    },
    {
      number: 123,
      label: "POS delivery data",
      kind: "lllvar",
      length: 999,
      defaultValue: "000",
      description: "Delivery channel or terminal capability parameters.",
    },
    {
      number: 127,
      label: "Switch private data",
      kind: "lllvar",
      length: 999,
      defaultValue: "000",
      description:
        "Network routing, switch reconciliation, or post-dated metadata.",
    },
  ];

export const ISO8583_FIELD_DICTIONARY: Readonly<
  Record<
    number,
    {
      readonly label: string;
      readonly kind: Iso8583FieldKind;
      readonly length: number;
      readonly defaultValue: string;
    }
  >
> = {
  2: {
    label: "Primary account number (PAN)",
    kind: "llvar",
    length: 19,
    defaultValue: "6214870000000001",
  },
  3: { label: "Processing code", kind: "n", length: 6, defaultValue: "000000" },
  4: {
    label: "Amount, transaction",
    kind: "n",
    length: 12,
    defaultValue: "000000010000",
  },
  5: {
    label: "Amount, settlement",
    kind: "n",
    length: 12,
    defaultValue: "000000010000",
  },
  6: {
    label: "Amount, cardholder billing",
    kind: "n",
    length: 12,
    defaultValue: "000000010000",
  },
  7: {
    label: "Transmission date & time",
    kind: "n",
    length: 10,
    defaultValue: "0901080037",
  },
  9: {
    label: "Conversion rate, settlement",
    kind: "n",
    length: 8,
    defaultValue: "00000001",
  },
  10: {
    label: "Conversion rate, billing",
    kind: "n",
    length: 8,
    defaultValue: "00000001",
  },
  11: {
    label: "Systems trace audit number (STAN)",
    kind: "n",
    length: 6,
    defaultValue: "000001",
  },
  12: {
    label: "Time, local transaction",
    kind: "n",
    length: 6,
    defaultValue: "080037",
  },
  13: {
    label: "Date, local transaction",
    kind: "n",
    length: 4,
    defaultValue: "0901",
  },
  14: { label: "Date, expiration", kind: "n", length: 4, defaultValue: "2912" },
  15: { label: "Date, settlement", kind: "n", length: 4, defaultValue: "0901" },
  18: {
    label: "Merchant type / MCC",
    kind: "n",
    length: 4,
    defaultValue: "6011",
  },
  22: {
    label: "Point of service entry mode",
    kind: "n",
    length: 3,
    defaultValue: "021",
  },
  23: {
    label: "Card sequence number",
    kind: "n",
    length: 3,
    defaultValue: "001",
  },
  25: {
    label: "Point of service condition code",
    kind: "n",
    length: 2,
    defaultValue: "00",
  },
  26: {
    label: "Point of service capture code",
    kind: "n",
    length: 2,
    defaultValue: "00",
  },
  28: {
    label: "Amount, transaction fee",
    kind: "n",
    length: 9,
    defaultValue: "000000000",
  },
  32: {
    label: "Acquiring institution ID",
    kind: "llvar",
    length: 11,
    defaultValue: "000112",
  },
  33: {
    label: "Forwarding institution ID",
    kind: "llvar",
    length: 11,
    defaultValue: "000112",
  },
  35: {
    label: "Track 2 data",
    kind: "llvar",
    length: 37,
    defaultValue: "6214870000000001=291200000000000",
  },
  37: {
    label: "Retrieval reference number",
    kind: "ans",
    length: 12,
    defaultValue: "000000000001",
  },
  38: {
    label: "Authorization identification response",
    kind: "ans",
    length: 6,
    defaultValue: "AUTH01",
  },
  39: { label: "Response code", kind: "n", length: 2, defaultValue: "00" },
  41: {
    label: "Card acceptor terminal ID",
    kind: "ans",
    length: 8,
    defaultValue: "TERM0001",
  },
  42: {
    label: "Card acceptor ID code",
    kind: "ans",
    length: 15,
    defaultValue: "MERCHANT000001",
  },
  43: {
    label: "Card acceptor name / location",
    kind: "ans",
    length: 40,
    defaultValue: "MERCHANT TEST 01          YOGYAKARTA IDN",
  },
  48: {
    label: "Private data",
    kind: "lllvar",
    length: 999,
    defaultValue: "DATA001",
  },
  49: {
    label: "Currency code, transaction",
    kind: "n",
    length: 3,
    defaultValue: "360",
  },
  50: {
    label: "Currency code, settlement",
    kind: "n",
    length: 3,
    defaultValue: "360",
  },
  51: {
    label: "Currency code, billing",
    kind: "n",
    length: 3,
    defaultValue: "360",
  },
  52: {
    label: "PIN data",
    kind: "ans",
    length: 16,
    defaultValue: "0000000000000000",
  },
  54: {
    label: "Additional amounts",
    kind: "lllvar",
    length: 120,
    defaultValue: "1001360C000005000000",
  },
  60: {
    label: "Private data (terminal)",
    kind: "lllvar",
    length: 999,
    defaultValue: "000000",
  },
  61: {
    label: "Other private data",
    kind: "lllvar",
    length: 999,
    defaultValue: "00100",
  },
  62: {
    label: "Private data (invoice/biller)",
    kind: "lllvar",
    length: 999,
    defaultValue: "000000",
  },
  63: {
    label: "Private data (additional)",
    kind: "lllvar",
    length: 999,
    defaultValue: "000000",
  },
  70: {
    label: "Network management code",
    kind: "n",
    length: 3,
    defaultValue: "001",
  },
  90: {
    label: "Original data elements",
    kind: "ans",
    length: 42,
    defaultValue: "020000000101010000000000000011200000000112",
  },
  102: {
    label: "Account identification 1",
    kind: "llvar",
    length: 28,
    defaultValue: "001234567890",
  },
  103: {
    label: "Account identification 2",
    kind: "llvar",
    length: 28,
    defaultValue: "009876543210",
  },
  104: {
    label: "Transaction description",
    kind: "lllvar",
    length: 100,
    defaultValue: "PAYMENT SIMULATION",
  },
  106: {
    label: "Account balance data",
    kind: "ans",
    length: 53,
    defaultValue: "                         0311219999003200000000000100",
  },
  123: {
    label: "POS delivery data",
    kind: "lllvar",
    length: 999,
    defaultValue: "000",
  },
  127: {
    label: "Switch private data",
    kind: "lllvar",
    length: 999,
    defaultValue: "000",
  },
  128: {
    label: "Message authentication code (MAC)",
    kind: "ans",
    length: 16,
    defaultValue: "0000000000000000",
  },
};
