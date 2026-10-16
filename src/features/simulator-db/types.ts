export type SqlCellValue = string | number | boolean | null | undefined;
export type SqlRow = Record<string, SqlCellValue>;

export type TableMetadata = {
  readonly name: string;
  readonly columnCount: number;
  readonly rowCount: number;
};

export type ColumnMetadata = {
  readonly cid: number;
  readonly name: string;
  readonly type: string;
  readonly notNull: boolean;
  readonly defaultValue: string | null;
  readonly primaryKey: boolean;
};

export type TableDataPage = {
  readonly tableName: string;
  readonly columns: readonly ColumnMetadata[];
  readonly rows: readonly SqlRow[];
  readonly totalRows: number;
  readonly page: number;
  readonly size: number;
};

export type SqlQueryRequest = {
  readonly sql: string;
  readonly maxRows?: number;
};

export type SqlExecuteRequest = {
  readonly sql: string;
};

export type SqlExecuteResponse = {
  readonly affectedRows: number;
  readonly message: string;
};

function isDetailedError(cause: unknown): cause is { message: string } {
  if (typeof cause !== "object" || cause === null) {
    return false;
  }
  return (
    "message" in cause &&
    // SAFETY: verified property presence before typeof assertion
    typeof (cause as { message: unknown }).message === "string"
  );
}

export function extractErrorMessage(cause: unknown): string {
  if (cause instanceof Error) {
    return cause.message;
  }
  if (isDetailedError(cause)) {
    return cause.message;
  }
  return String(cause);
}
