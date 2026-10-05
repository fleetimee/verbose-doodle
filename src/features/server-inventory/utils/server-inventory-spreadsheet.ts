import type { SheetData } from "write-excel-file/browser";
import {
  fetchServerEntries,
  revealServerPassword,
} from "@/features/server-inventory/api";
import type {
  ServerEntry,
  ServerInventoryQuery,
} from "@/features/server-inventory/types";

type ExportEntry = ServerEntry & { password?: string };
export type ServerExportScope = "page" | "filtered" | "all";
const COLUMNS = [
  { key: "name", label: "Name", width: 30 },
  { key: "host", label: "Host", width: 25 },
  { key: "port", label: "Port", width: 12 },
  { key: "accessType", label: "Access type", width: 20 },
  { key: "databaseEngine", label: "Database engine", width: 22 },
  { key: "username", label: "Username", width: 25 },
  { key: "databaseName", label: "Database name", width: 25 },
  { key: "url", label: "URL", width: 50 },
  { key: "notes", label: "Notes", width: 60 },
  { key: "hasPassword", label: "Password stored", width: 20 },
  { key: "createdAt", label: "Created at (UTC)", width: 28 },
  { key: "updatedAt", label: "Updated at (UTC)", width: 28 },
  { key: "id", label: "Entry ID", width: 38 },
] as const;

export function getServerInventorySpreadsheet(
  entries: readonly ExportEntry[],
  includePasswords: boolean
) {
  const columns = includePasswords
    ? [...COLUMNS, { key: "password", label: "Password", width: 30 } as const]
    : COLUMNS;
  const data: SheetData = [
    columns.map(({ label }) => ({
      value: label,
      type: String,
      fontWeight: "bold",
      backgroundColor: "#226b65",
      textColor: "#ffffff",
      wrap: true,
    })),
    ...entries.map((entry) =>
      columns.map(({ key }) => {
        const value = entry[key];
        if (value === null || value === undefined) {
          return null;
        }
        if (typeof value === "number") {
          return { value, type: Number };
        }
        if (typeof value === "boolean") {
          return { value, type: Boolean };
        }
        return { value, type: String, wrap: true };
      })
    ),
  ];
  return { data, columns: columns.map(({ width }) => ({ width })) };
}

export async function collectServerExportEntries(
  visibleEntries: readonly ServerEntry[],
  query: ServerInventoryQuery,
  scope: ServerExportScope,
  includePasswords: boolean,
  api = { fetchServerEntries, revealServerPassword }
): Promise<ExportEntry[]> {
  const entries: ExportEntry[] = [];
  if (scope === "page") {
    entries.push(...visibleEntries);
  } else {
    const exportQuery =
      scope === "all"
        ? { ...query, search: "", accessType: "", databaseEngine: "" }
        : query;
    let page = 0;
    let totalPages = 1;
    do {
      const result = await api.fetchServerEntries({ ...exportQuery, page });
      entries.push(...result.servers);
      totalPages = result.totalPages;
      page += 1;
    } while (page < totalPages);
  }
  if (!includePasswords) {
    return entries;
  }
  const withPasswords: ExportEntry[] = [];
  for (const entry of entries) {
    const password = entry.hasPassword
      ? await api.revealServerPassword(entry.id)
      : "";
    withPasswords.push({ ...entry, password });
  }
  return withPasswords;
}

export async function downloadServerInventorySpreadsheet(
  entries: readonly ExportEntry[],
  includePasswords: boolean
) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const { data, columns } = getServerInventorySpreadsheet(
    entries,
    includePasswords
  );
  await writeXlsxFile(data, {
    sheet: "Server inventory",
    columns,
    stickyRowsCount: 1,
  }).toFile("server-inventory.xlsx");
}
