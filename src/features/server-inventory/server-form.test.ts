import { describe, expect, test } from "bun:test";
import {
  buildServerEntryRequest,
  createServerFormSchema,
  serverFormDefaults,
} from "@/features/server-inventory/server-form";
import { getMessages } from "@/lib/i18n";

const schema = createServerFormSchema(getMessages("en-US").servers);
const values = {
  ...serverFormDefaults(),
  name: " Linux ",
  host: " HARBOR.LOCAL ",
  accessType: " sftp ",
};

describe("server inventory form", () => {
  test("accepts custom types and normalizes connection metadata", () => {
    const request = buildServerEntryRequest(
      schema.parse({ ...values, port: "9433", databaseEngine: " sqlserver " })
    );
    expect(request.accessType).toBe("SFTP");
    expect(request.host).toBe("harbor.local");
    expect(request.port).toBe(9433);
    expect(request.databaseEngine).toBe("SQLSERVER");
  });

  test("preserves, replaces, or explicitly clears a stored password", () => {
    expect(buildServerEntryRequest(values)).not.toHaveProperty("password");
    expect(
      buildServerEntryRequest({ ...values, password: "  secret  " }).password
    ).toBe("  secret  ");
    expect(
      buildServerEntryRequest({
        ...values,
        password: "ignored",
        clearPassword: true,
      }).password
    ).toBe("");
  });

  test("rejects invalid ports, embedded host ports, and unsafe web URLs", () => {
    for (const port of ["0", "65536", "12.5", "-1", "abc"]) {
      expect(schema.safeParse({ ...values, port }).success).toBe(false);
    }
    for (const host of [
      "http://host/path",
      "host:22",
      "192,168,4,79",
      "host name",
    ]) {
      expect(schema.safeParse({ ...values, host }).success).toBe(false);
    }
    for (const url of [
      "javascript:alert(1)",
      "https://user:password@host",
      "not-a-url",
    ]) {
      expect(schema.safeParse({ ...values, url }).success).toBe(false);
    }
    expect(
      schema.safeParse({
        ...values,
        host: "::1",
        port: "65535",
        url: "https://harbor.local",
      }).success
    ).toBe(true);
  });
});
