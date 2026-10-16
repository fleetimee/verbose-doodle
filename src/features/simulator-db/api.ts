import { z } from "zod";
import type {
  ColumnMetadata,
  SchemaObject,
  SqlExecuteResponse,
  SqlRow,
  TableDataPage,
  TableMetadata,
} from "@/features/simulator-db/types";
import { apiGet, apiPost } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

const endpoints = API_ENDPOINTS.admin.simulatorDb;

export async function fetchTables(): Promise<TableMetadata[]> {
  const tables: TableMetadata[] = [];
  const pageSize = 200;
  for (let offset = 0; ; offset += pageSize) {
    const rows = await executeSqlQuery(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT GLOB 'sqlite_*' ORDER BY name LIMIT ${pageSize} OFFSET ${offset};`,
      pageSize
    );
    tables.push(...z.array(z.object({ name: z.string() })).parse(rows));
    if (rows.length < pageSize) {
      return tables;
    }
  }
}

export async function fetchColumns(
  tableName: string
): Promise<ColumnMetadata[]> {
  const response = await apiGet<{ data: ColumnMetadata[] }>(
    endpoints.columns(tableName)
  );
  return response.data;
}

export async function fetchTableData(
  tableName: string,
  page: number,
  size: number,
  sortBy?: string,
  sortDir?: "asc" | "desc",
  search?: string,
  signal?: AbortSignal
): Promise<TableDataPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (sortBy) {
    params.set("sortBy", sortBy);
  }
  if (sortDir) {
    params.set("sortDir", sortDir);
  }
  if (search && search.trim() !== "") {
    params.set("search", search.trim());
  }

  const response = await apiGet<{ data: TableDataPage }>(
    `${endpoints.data(tableName)}?${params}`,
    { signal }
  );
  return response.data;
}

export async function executeSqlQuery(
  sql: string,
  maxRows = 200
): Promise<SqlRow[]> {
  const response = await apiPost<{ data: SqlRow[] }>(endpoints.query, {
    maxRows,
    sql,
  });
  return response.data;
}

export async function executeSqlStatement(
  sql: string
): Promise<SqlExecuteResponse> {
  const response = await apiPost<{ data: SqlExecuteResponse }>(
    endpoints.execute,
    { sql }
  );
  return response.data;
}

export async function fetchSchemaObjects(): Promise<SchemaObject[]> {
  const objects: SchemaObject[] = [];
  const pageSize = 200;
  for (let offset = 0; ; offset += pageSize) {
    const rows = await executeSqlQuery(
      `SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type IN ('index', 'trigger', 'view') ORDER BY type, name LIMIT ${pageSize} OFFSET ${offset};`,
      pageSize
    );
    const schemaRows = z
      .array(
        z.object({
          type: z.enum(["index", "trigger", "view"]),
          name: z.string(),
          tbl_name: z.string(),
          sql: z.string().nullable(),
        })
      )
      .parse(rows);
    for (const row of schemaRows) {
      objects.push({
        type: row.type,
        name: row.name,
        tableName: row.tbl_name,
        sql: row.sql,
      });
    }
    if (rows.length < pageSize) {
      return objects;
    }
  }
}
