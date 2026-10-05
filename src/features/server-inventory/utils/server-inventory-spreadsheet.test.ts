import { expect, test } from "bun:test";
import { strFromU8, unzipSync } from "fflate";
import writeXlsxFile from "write-excel-file/node";
import type {
  ServerEntry,
  ServerInventoryQuery,
} from "@/features/server-inventory/types";
import {
  collectServerExportEntries,
  getServerInventorySpreadsheet,
} from "@/features/server-inventory/utils/server-inventory-spreadsheet";

const entry: ServerEntry = {
  id: "0001",
  name: "Database",
  host: "127.0.0.1",
  port: 0,
  accessType: "DATABASE",
  databaseEngine: "POSTGRESQL",
  databaseName: null,
  username: "admin",
  hasPassword: true,
  notes: "<note>&text",
  url: null,
  createdAt: "2026-10-05T00:00:00Z",
  updatedAt: "2026-10-05T00:00:00Z",
};
const query: ServerInventoryQuery = {
  page: 3,
  size: 50,
  search: "database",
  accessType: "DATABASE",
  databaseEngine: "POSTGRESQL",
  sortBy: "name",
  direction: "asc",
};

function createApi() {
  const queries: ServerInventoryQuery[] = [];
  const revealed: string[] = [];
  return {
    queries,
    revealed,
    api: {
      fetchServerEntries: (value: ServerInventoryQuery) => {
        queries.push(value);
        return Promise.resolve({
          servers: [
            { ...entry, id: String(value.page), hasPassword: value.page === 0 },
          ],
          page: value.page,
          size: 50,
          totalPages: 2,
          totalElements: 2,
          totalHosts: 2,
          accessTypes: [],
          databaseEngines: [],
        });
      },
      revealServerPassword: (id: string) => {
        revealed.push(id);
        return Promise.resolve("=secret");
      },
    },
  };
}

test("page export retrieves passwords only when requested and never mutates table data", async () => {
  const { api, queries, revealed } = createApi();
  await collectServerExportEntries([entry], query, "page", false, api);
  expect(revealed).toEqual([]);
  const rows = await collectServerExportEntries(
    [entry],
    query,
    "page",
    true,
    api
  );
  expect(rows[0].password).toBe("=secret");
  expect("password" in entry).toBe(false);
  expect(queries).toEqual([]);
  expect(revealed).toEqual(["0001"]);
});

test("all matching export traverses pages from zero and preserves filters", async () => {
  const { api, queries, revealed } = createApi();
  const rows = await collectServerExportEntries(
    [],
    query,
    "filtered",
    true,
    api
  );
  expect(queries).toEqual([
    { ...query, page: 0 },
    { ...query, page: 1 },
  ]);
  expect(rows.map((row) => row.password)).toEqual(["=secret", ""]);
  expect(revealed).toEqual(["0"]);
});

test("entire inventory export clears filters across every page", async () => {
  const { api, queries } = createApi();
  const rows = await collectServerExportEntries([], query, "all", false, api);
  expect(rows).toHaveLength(2);
  expect(queries).toEqual(
    [0, 1].map((page) => ({
      ...query,
      page,
      search: "",
      accessType: "",
      databaseEngine: "",
    }))
  );
});

test("password failure aborts export instead of silently omitting credentials", async () => {
  const { api } = createApi();
  api.revealServerPassword = () => Promise.reject(new Error("Forbidden"));
  await expect(
    collectServerExportEntries([entry], query, "page", true, api)
  ).rejects.toThrow("Forbidden");
});

test("xlsx preserves passwords as literal text and omits the password column when disabled", async () => {
  const rows = [{ ...entry, password: "=secret" }];
  const withoutPasswords = getServerInventorySpreadsheet(rows, false);
  expect(withoutPasswords.data[0]).toHaveLength(13);
  const { data, columns } = getServerInventorySpreadsheet(rows, true);
  expect(data[1][13]).toEqual({ value: "=secret", type: String, wrap: true });
  const buffer = await writeXlsxFile(data, {
    sheet: "Server inventory",
    columns,
    stickyRowsCount: 1,
  }).toBuffer();
  const files = unzipSync(new Uint8Array(buffer));
  const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
  expect(sheet).not.toContain("<f>");
  expect(sheet).toContain('state="frozen"');
  const strings = strFromU8(files["xl/sharedStrings.xml"]);
  expect(strings).toContain("=secret");
  expect(strings).toContain("0001");
  expect(strings).toContain("&lt;note&gt;&amp;text");
});
