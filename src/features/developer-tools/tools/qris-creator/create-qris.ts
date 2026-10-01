import {
  editImportedQris,
  type ImportedQris,
} from "@/features/developer-tools/tools/qris-creator/import-qris";
import { calculateQrisCrc } from "@/features/developer-tools/tools/qris-parser/parse-qris";

export const QRIS_MERCHANT_CRITERIA = [
  "UMI",
  "UKE",
  "UME",
  "UBE",
  "URE",
  "BLU",
  "PSO",
] as const;

export type QrisCreatorInput = {
  mode: "static" | "dynamic";
  merchantName: string;
  merchantCity: string;
  merchantCategoryCode: string;
  postalCode: string;
  providerGuid: string;
  merchantPan: string;
  merchantId: string;
  nationalMerchantId: string;
  merchantCriteria: string;
  amount: string;
  reference: string;
  terminal: string;
};
export const QRIS_CREATOR_SAMPLE: QrisCreatorInput = {
  mode: "static",
  merchantName: "DEMO MERCHANT",
  merchantCity: "YOGYAKARTA",
  merchantCategoryCode: "5812",
  postalCode: "55181",
  providerGuid: "ID.CO.EXAMPLE",
  merchantPan: "9360000000000000000",
  merchantId: "DEMO01",
  nationalMerchantId: "ID0000000000000",
  merchantCriteria: "UMI",
  amount: "12500",
  reference: "",
  terminal: "",
};
export const QRIS_CREATOR_EMPTY: QrisCreatorInput = Object.fromEntries(
  Object.keys(QRIS_CREATOR_SAMPLE).map((key) => [
    key,
    key === "mode" ? "static" : "",
  ])
) as QrisCreatorInput;

function tlv(tag: string, value: string): string {
  return `${tag}${value.length.toString().padStart(2, "0")}${value}`;
}

export function createQris(input: QrisCreatorInput, imported?: ImportedQris) {
  const values = { ...input };
  for (const key of Object.keys(values) as (keyof QrisCreatorInput)[]) {
    if (key !== "mode") {
      values[key] = values[key].trim();
    }
  }
  const errors = validate(values, imported);
  if (imported) {
    if (Object.keys(errors).length) {
      return { payload: null, errors };
    }
    try {
      return { payload: editImportedQris(imported, values), errors };
    } catch {
      errors.providerGuid = "templateLength";
      return { payload: null, errors };
    }
  }

  const account =
    tlv("00", values.providerGuid) +
    tlv("01", values.merchantPan) +
    (values.merchantId ? tlv("02", values.merchantId) : "") +
    tlv("03", values.merchantCriteria);
  if (account.length > 99) {
    errors.providerGuid = "templateLength";
  }
  if (Object.keys(errors).length) {
    return { payload: null, errors };
  }
  const national =
    tlv("00", "ID.CO.QRIS.WWW") +
    tlv("02", values.nationalMerchantId) +
    tlv("03", values.merchantCriteria);
  const additional =
    (values.reference ? tlv("05", values.reference) : "") +
    (values.terminal ? tlv("07", values.terminal) : "");
  const body =
    tlv("00", "01") +
    tlv("01", values.mode === "static" ? "11" : "12") +
    tlv("26", account) +
    tlv("51", national) +
    tlv("52", values.merchantCategoryCode) +
    tlv("53", "360") +
    (values.mode === "dynamic" ? tlv("54", values.amount) : "") +
    tlv("58", "ID") +
    tlv("59", values.merchantName) +
    tlv("60", values.merchantCity) +
    (values.postalCode ? tlv("61", values.postalCode) : "") +
    (additional ? tlv("62", additional) : "") +
    "6304";
  return { payload: body + calculateQrisCrc(body), errors };
}

const rules: Partial<Record<keyof QrisCreatorInput, RegExp>> = {
  merchantName: /^[\x20-\x7e]{1,25}$/,
  merchantCity: /^[\x20-\x7e]{1,15}$/,
  merchantCategoryCode: /^\d{4}$/,
  postalCode: /^[\x20-\x7e]{0,10}$/,
  providerGuid: /^[\x21-\x7e]{1,32}$/,
  merchantPan: /^\d{1,19}$/,
  merchantId: /^[\x20-\x7e]{0,25}$/,
  nationalMerchantId: /^[A-Za-z0-9]{15}$/,
  merchantCriteria: /^[A-Za-z0-9]{3}$/,
  reference: /^[\x20-\x7e]{0,25}$/,
  terminal: /^[\x20-\x7e]{0,25}$/,
};

function validate(values: QrisCreatorInput, imported?: ImportedQris) {
  const errors: Partial<
    Record<keyof QrisCreatorInput, "required" | "invalid" | "templateLength">
  > = {};
  const optional = new Set([
    "postalCode",
    "merchantId",
    "reference",
    "terminal",
  ]);
  for (const [key, rule] of Object.entries(rules)) {
    const field = key as keyof QrisCreatorInput;
    if (!(values[field] || optional.has(field))) {
      errors[field] = "required";
    } else if (!rule.test(values[field])) {
      errors[field] = "invalid";
    }
  }
  if (values.mode === "dynamic") {
    if (!values.amount) {
      errors.amount = "required";
    } else if (
      !AMOUNT.test(values.amount) ||
      values.amount.length > 13 ||
      !NONZERO.test(values.amount)
    ) {
      errors.amount = "invalid";
    }
  }

  if (imported) {
    for (const key of Object.keys(errors) as (keyof QrisCreatorInput)[]) {
      const amountModeChanged =
        key === "amount" && values.mode !== imported.input.mode;
      if (values[key] === imported.input[key].trim() && !amountModeChanged) {
        delete errors[key];
      }
    }
  }
  return errors;
}

const AMOUNT = /^\d+(?:\.\d{1,2})?$/;
const NONZERO = /[1-9]/;
