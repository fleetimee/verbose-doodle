import type { ColumnMetadata } from "@/features/simulator-db/types";
import type { Messages } from "@/lib/i18n";

type Template = { label: keyof Messages["simulatorDb"]; sql: string };
export type QueryTemplateGroup = {
  label: keyof Messages["simulatorDb"];
  items: Template[];
};
const quoteIdentifier = (value: string) => `"${value.replace(/"/g, '""')}"`;
const quoteLiteral = (value: string) => `'${value.replace(/'/g, "''")}'`;
const numericType = /INT|REAL|NUM|DEC|FLOAT|DOUBLE/i;
const textType = /CHAR|TEXT|CLOB/i;

export function buildQueryTemplates(
  tableName: string | null,
  columns: readonly ColumnMetadata[]
): QueryTemplateGroup[] {
  const schemaItems: Template[] = [
    {
      label: "templateTables",
      sql: "SELECT type, name, sql\nFROM sqlite_master\nWHERE type IN ('table', 'view') AND name NOT GLOB 'sqlite_*'\nORDER BY type, name;",
    },
  ];
  if (!tableName) {
    return [{ label: "templateInspect", items: schemaItems }];
  }
  const table = quoteIdentifier(tableName);
  const groups: QueryTemplateGroup[] = [
    {
      label: "templateBrowse",
      items: [
        { label: "templateSelect", sql: `SELECT *\nFROM ${table}\nLIMIT 100;` },
        {
          label: "templatePage",
          sql: `SELECT *\nFROM ${table}\nLIMIT 50 OFFSET 50;`,
        },
      ],
    },
  ];
  const aggregates: Template[] = [
    {
      label: "templateCount",
      sql: `SELECT COUNT(*) AS row_count\nFROM ${table};`,
    },
  ];
  const firstColumn = columns.find((column) => column.primaryKey) ?? columns[0];
  if (firstColumn) {
    const field = quoteIdentifier(firstColumn.name);
    const textColumn =
      columns.find(
        (column) => !column.primaryKey && textType.test(column.type)
      ) ?? firstColumn;
    const textField = quoteIdentifier(textColumn.name);
    const example = numericType.test(firstColumn.type) ? "0" : "'value'";
    groups[0].items.push({
      label: "templateSort",
      sql: `SELECT *\nFROM ${table}\nORDER BY ${field} ASC\nLIMIT 100;`,
    });
    groups.push({
      label: "templateFilter",
      items: [
        {
          label: "templateEquals",
          sql: `SELECT *\nFROM ${table}\nWHERE ${field} = ${example}\nLIMIT 100;`,
        },
        {
          label: "templateSearch",
          sql: `SELECT *\nFROM ${table}\nWHERE ${textField} LIKE '%search%'\nLIMIT 100;`,
        },
        {
          label: "templateNull",
          sql: `SELECT *\nFROM ${table}\nWHERE ${textField} IS NULL\nLIMIT 100;`,
        },
      ],
    });
    aggregates.push(
      {
        label: "templateDistinct",
        sql: `SELECT DISTINCT ${textField}\nFROM ${table}\nORDER BY ${textField}\nLIMIT 100;`,
      },
      {
        label: "templateGroup",
        sql: `SELECT ${textField}, COUNT(*) AS row_count\nFROM ${table}\nGROUP BY ${textField}\nORDER BY row_count DESC\nLIMIT 100;`,
      },
      {
        label: "templateDuplicates",
        sql: `SELECT ${textField}, COUNT(*) AS occurrences\nFROM ${table}\nGROUP BY ${textField}\nHAVING COUNT(*) > 1\nORDER BY occurrences DESC\nLIMIT 100;`,
      }
    );
    const numericColumn = columns.find((column) =>
      numericType.test(column.type)
    );
    if (numericColumn) {
      const numericField = quoteIdentifier(numericColumn.name);
      groups[1].items.push({
        label: "templateRange",
        sql: `SELECT *\nFROM ${table}\nWHERE ${numericField} BETWEEN 0 AND 100\nORDER BY ${numericField}\nLIMIT 100;`,
      });
      aggregates.push({
        label: "templateMinMax",
        sql: `SELECT MIN(${numericField}) AS minimum, MAX(${numericField}) AS maximum\nFROM ${table};`,
      });
    }
  }
  groups.push({ label: "templateAggregate", items: aggregates });
  schemaItems.unshift(
    { label: "templateColumns", sql: `PRAGMA table_info(${table});` },
    { label: "templateIndexes", sql: `PRAGMA index_list(${table});` },
    { label: "templateForeignKeys", sql: `PRAGMA foreign_key_list(${table});` },
    {
      label: "templatePlan",
      sql: `EXPLAIN QUERY PLAN\nSELECT * FROM ${table} LIMIT 100;`,
    },
    {
      label: "templateDefinitions",
      sql: `SELECT type, name, sql\nFROM sqlite_master\nWHERE tbl_name = ${quoteLiteral(tableName)} AND type IN ('index', 'trigger')\nORDER BY type, name;`,
    }
  );
  groups.push({ label: "templateInspect", items: schemaItems });
  return groups;
}
