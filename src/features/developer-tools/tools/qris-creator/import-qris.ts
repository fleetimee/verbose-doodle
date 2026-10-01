import type { QrisCreatorInput } from "@/features/developer-tools/tools/qris-creator/create-qris";
import {
  calculateQrisCrc,
  parseQris,
  type QrisField,
} from "@/features/developer-tools/tools/qris-parser/parse-qris";

export type ImportedQris = {
  readonly payload: string;
  readonly fields: readonly QrisField[];
  readonly input: QrisCreatorInput;
  readonly accountTag: string | undefined;
  readonly nationalTag: string | undefined;
};

export function importQris(payload: string): ImportedQris {
  const parsed = parseQris(payload);
  if (
    !(parsed.crcValid && parsed.profileMatches) ||
    parsed.missing.length ||
    !["static", "dynamic"].includes(parsed.mode)
  ) {
    throw new Error("Invalid QRIS MPM payload");
  }
  const account = parsed.fields.find(
    (field) =>
      Number(field.id) >= 26 &&
      Number(field.id) <= 50 &&
      field.children.some((child) => child.id === "00")
  );
  const get = (tag: string, child?: string) => {
    const field = parsed.fields.find((item) => item.id === tag);
    return (
      (child
        ? field?.children.find((item) => item.id === child)?.value
        : field?.value) ?? ""
    );
  };
  const accountTag = account?.id;
  const nationalTag = get("51", "00") === "ID.CO.QRIS.WWW" ? "51" : undefined;
  const input: QrisCreatorInput = {
    mode: parsed.mode,
    merchantName: get("59"),
    merchantCity: get("60"),
    merchantCategoryCode: get("52"),
    postalCode: get("61"),
    providerGuid: accountTag ? get(accountTag, "00") : "",
    merchantPan: accountTag ? get(accountTag, "01") : "",
    merchantId: accountTag ? get(accountTag, "02") : "",
    nationalMerchantId: nationalTag ? get(nationalTag, "02") : "",
    merchantCriteria:
      (nationalTag ? get(nationalTag, "03") : "") ||
      (accountTag ? get(accountTag, "03") : ""),
    amount: get("54"),
    reference: get("62", "05"),
    terminal: get("62", "07"),
  };
  return {
    payload: payload.trim(),
    fields: parsed.fields,
    input,
    accountTag,
    nationalTag,
  };
}

function encode(tag: string, value: string) {
  const length = [...value].length;
  if (length > 99) {
    throw new Error("Template exceeds 99 characters");
  }
  return `${tag}${String(length).padStart(2, "0")}${value}`;
}

function update(
  fields: readonly QrisField[],
  tag: string,
  value: string
): QrisField[] {
  const next = fields.filter((field) => field.id !== tag || value);
  const existing = next.findIndex((field) => field.id === tag);
  const field: QrisField = {
    id: tag,
    path: tag,
    value,
    length: [...value].length,
    children: [],
  };
  if (existing >= 0) {
    next[existing] = field;
  } else if (value) {
    next.push(field);
  }
  return next;
}

export function editImportedQris(
  imported: ImportedQris,
  input: QrisCreatorInput
): string {
  let fields = imported.fields.filter((field) => field.id !== "63");
  const changed = (key: keyof QrisCreatorInput) =>
    input[key].trim() !== imported.input[key].trim();
  const root = {
    merchantName: "59",
    merchantCity: "60",
    merchantCategoryCode: "52",
    postalCode: "61",
  } as const;
  for (const [key, tag] of Object.entries(root)) {
    const name = key as keyof typeof root;
    if (changed(name)) {
      fields = update(fields, tag, input[name].trim());
    }
  }
  if (changed("mode")) {
    fields = update(fields, "01", input.mode === "static" ? "11" : "12");
  }
  if (changed("mode") || changed("amount")) {
    fields = update(
      fields,
      "54",
      input.mode === "dynamic" ? input.amount.trim() : ""
    );
  }
  const templates = [
    {
      tag: imported.accountTag,
      keys: {
        providerGuid: "00",
        merchantPan: "01",
        merchantId: "02",
        merchantCriteria: "03",
      },
    },
    {
      tag: imported.nationalTag,
      keys: { nationalMerchantId: "02", merchantCriteria: "03" },
    },
    { tag: "62", keys: { reference: "05", terminal: "07" } },
  ];
  for (const { tag, keys } of templates) {
    fields = updateTemplate(fields, tag, keys, imported.input, input);
  }
  const body = `${fields.map((field) => encode(field.id, field.value)).join("")}6304`;
  return body + calculateQrisCrc(body);
}

function updateTemplate(
  fields: readonly QrisField[],
  tag: string | undefined,
  keys: Partial<Record<keyof QrisCreatorInput, string>>,
  original: QrisCreatorInput,
  input: QrisCreatorInput
) {
  if (!tag) {
    return [...fields];
  }
  const existing = fields.find((field) => field.id === tag);
  let children = existing?.children ?? [];
  let modified = false;
  for (const [key, child] of Object.entries(keys)) {
    const name = key as keyof QrisCreatorInput;
    if (input[name].trim() !== original[name].trim()) {
      if (tag !== "62" && !existing) {
        throw new Error("Unsupported merchant account template");
      }
      children = update(children, child, input[name].trim());
      modified = true;
    }
  }
  if (!modified) {
    return [...fields];
  }
  return update(
    fields,
    tag,
    children.map((field) => encode(field.id, field.value)).join("")
  );
}
