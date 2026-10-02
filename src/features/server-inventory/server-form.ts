import { z } from "zod";
import type {
  ServerEntry,
  ServerEntryRequest,
} from "@/features/server-inventory/types";
import { formatMessage, type Messages } from "@/lib/i18n";

const INVALID_HOST_CHARACTERS = /[\s/,]/;
const WHOLE_NUMBER = /^\d+$/;

export function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function createServerFormSchema(copy: Messages["servers"]) {
  const text = (max: number) =>
    z.string().trim().max(max, formatMessage(copy.tooLong, { max }));
  return z.object({
    accessType: text(50).min(1, copy.required),
    clearPassword: z.boolean(),
    databaseEngine: text(50),
    databaseName: text(150),
    host: text(255)
      .min(1, copy.required)
      .refine(
        (host) =>
          !(INVALID_HOST_CHARACTERS.test(host) || host.includes("://")) &&
          (!host.includes(":") || host.indexOf(":") !== host.lastIndexOf(":")),
        copy.invalidHost
      ),
    name: text(150).min(1, copy.required),
    notes: text(10_000),
    password: z.string().max(4096, formatMessage(copy.tooLong, { max: 4096 })),
    port: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          (WHOLE_NUMBER.test(value) &&
            Number(value) >= 1 &&
            Number(value) <= 65_535),
        copy.invalidPort
      ),
    url: text(2048).refine(
      (value) => value === "" || isWebUrl(value),
      copy.invalidUrl
    ),
    username: text(150),
  });
}

export type ServerFormValues = z.infer<
  ReturnType<typeof createServerFormSchema>
>;

export function serverFormDefaults(entry?: ServerEntry): ServerFormValues {
  return {
    accessType: entry?.accessType ?? "SSH",
    clearPassword: false,
    databaseEngine: entry?.databaseEngine ?? "",
    databaseName: entry?.databaseName ?? "",
    host: entry?.host ?? "",
    name: entry?.name ?? "",
    notes: entry?.notes ?? "",
    password: "",
    port: entry?.port?.toString() ?? "",
    url: entry?.url ?? "",
    username: entry?.username ?? "",
  };
}

export function buildServerEntryRequest(
  values: ServerFormValues
): ServerEntryRequest {
  return {
    accessType: values.accessType.trim().toUpperCase(),
    databaseEngine: values.databaseEngine.trim().toUpperCase() || null,
    databaseName: values.databaseName.trim() || null,
    host: values.host.trim().toLowerCase(),
    name: values.name.trim(),
    notes: values.notes.trim() || null,
    ...(values.clearPassword
      ? { password: "" }
      : values.password !== "" && { password: values.password }),
    port: values.port === "" ? null : Number(values.port),
    url: values.url.trim() || null,
    username: values.username.trim() || null,
  };
}
