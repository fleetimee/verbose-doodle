import type {
  ColumnMetadata,
  SqlExecuteResponse,
  SqlRow,
  TableDataPage,
  TableMetadata,
} from "@/features/simulator-db/types";
import { apiGet, apiPost } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

const endpoints = API_ENDPOINTS.admin.simulatorDb;

export async function fetchTables(): Promise<TableMetadata[]> {
  const response = await apiGet<{ data: TableMetadata[] }>(endpoints.tables);
  return response.data;
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
  search?: string
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
    `${endpoints.data(tableName)}?${params}`
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
