import type {
  ColumnMetadata,
  SqlCellValue,
  SqlRow,
} from "@/features/simulator-db/types";

function formatSqlLiteral(
  value: string,
  isNull: boolean,
  type: string
): string {
  if (isNull) {
    return "NULL";
  }
  const upperType = type.toUpperCase();
  if (
    upperType.includes("INT") ||
    upperType.includes("NUM") ||
    upperType.includes("REAL") ||
    upperType.includes("DOUB") ||
    upperType.includes("FLOAT")
  ) {
    const trimmed = value.trim();
    if (trimmed !== "" && !Number.isNaN(Number(trimmed))) {
      return trimmed;
    }
  }
  return `'${value.replace(/'/g, "''")}'`;
}

function isBoolean(val: SqlCellValue): val is boolean {
  return typeof val === "boolean";
}

function formatRawCellValue(val: SqlCellValue, type: string): string {
  if (val === null || val === undefined) {
    return "NULL";
  }
  if (isBoolean(val)) {
    return val ? "1" : "0";
  }
  return formatSqlLiteral(String(val), false, type);
}

export function buildWhereClause(
  columns: readonly ColumnMetadata[],
  row: SqlRow
): string {
  const pkCols = columns.filter((c) => c.primaryKey);
  const targetCols = pkCols.length > 0 ? pkCols : columns;

  return targetCols
    .map((col) => {
      const val = row[col.name];
      if (val === null || val === undefined) {
        return `"${col.name}" IS NULL`;
      }
      return `"${col.name}" = ${formatRawCellValue(val, col.type)}`;
    })
    .join(" AND ");
}

export function buildInsertSql(
  tableName: string,
  columns: readonly ColumnMetadata[],
  fieldValues: Record<string, { isNull: boolean; value: string }>
): string {
  const activeEntries = columns.filter((col) => {
    const field = fieldValues[col.name];
    return Boolean(field);
  });

  const colNames = activeEntries.map((col) => `"${col.name}"`).join(", ");
  const valLiterals = activeEntries
    .map((col) => {
      const field = fieldValues[col.name] ?? { isNull: true, value: "" };
      return formatSqlLiteral(field.value, field.isNull, col.type);
    })
    .join(", ");

  return `INSERT INTO "${tableName}" (${colNames})\nVALUES (${valLiterals});`;
}

export function buildUpdateSql(
  tableName: string,
  columns: readonly ColumnMetadata[],
  originalRow: SqlRow,
  fieldValues: Record<string, { isNull: boolean; value: string }>
): string {
  const setClauses = columns
    .map((col) => {
      const field = fieldValues[col.name] ?? { isNull: true, value: "" };
      return `"${col.name}" = ${formatSqlLiteral(field.value, field.isNull, col.type)}`;
    })
    .join(",\n  ");

  const whereClause = buildWhereClause(columns, originalRow);

  return `UPDATE "${tableName}"\nSET\n  ${setClauses}\nWHERE ${whereClause};`;
}

export function buildDeleteSql(
  tableName: string,
  columns: readonly ColumnMetadata[],
  row: SqlRow
): string {
  const whereClause = buildWhereClause(columns, row);
  return `DELETE FROM "${tableName}" WHERE ${whereClause};`;
}
