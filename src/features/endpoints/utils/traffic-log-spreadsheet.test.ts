import { expect, test } from "bun:test";
import { strFromU8, unzipSync } from "fflate";
import writeXlsxFile from "write-excel-file/node";
import type { EndpointTrafficLog } from "@/features/endpoints/types";
import { getTrafficLogSpreadsheet } from "@/features/endpoints/utils/traffic-log-spreadsheet";

const log: EndpointTrafficLog = {
  id: "log-1",
  requestId: "000123",
  occurredAt: "2026-10-05T00:00:00Z",
  endpointId: "1",
  responseId: null,
  billerId: null,
  method: "GET",
  path: "/inquiry",
  queryString: null,
  matched: true,
  hitStatus: "matched_success",
  httpStatusCode: 200,
  responseName: "Success",
  sourceIp: "127.0.0.1",
  sourcePort: 0,
  destinationIp: null,
  destinationPort: null,
  forwardedFor: null,
  userAgent: '=HYPERLINK("https://example.com")',
  durationMs: 0,
  delayMs: null,
  simulateTimeout: false,
  requestBodyPreview: "<payload>&value",
  responseBodyPreview: null,
};

test("exports identifiers and untrusted payloads as text while preserving zero, false, and null", async () => {
  const { data, columns } = getTrafficLogSpreadsheet([log]);
  expect(data).toHaveLength(2);
  expect(data[1][1]).toEqual({ value: "000123", type: String, wrap: true });
  expect(data[1][7]).toEqual({ value: 0, type: Number });
  expect(data[1][15]).toEqual({ value: false, type: Boolean });
  expect(data[1][5]).toBeNull();
  const buffer = await writeXlsxFile(data, {
    sheet: "Traffic logs",
    columns,
    stickyRowsCount: 1,
  }).toBuffer();
  const files = unzipSync(new Uint8Array(buffer));
  const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
  expect(sheet).not.toContain("<f>");
  expect(sheet).toContain('state="frozen"');
  const strings = strFromU8(files["xl/sharedStrings.xml"]);
  expect(strings).toContain("000123");
  expect(strings).toContain("HYPERLINK");
  expect(strings).toContain("&lt;payload&gt;&amp;value");
});
