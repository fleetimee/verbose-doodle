import { describe, expect, test } from "bun:test";
import {
  assertDeveloperToolRegistry,
  DEVELOPER_TOOLS,
  getDeveloperToolHref,
} from "@/features/developer-tools/catalog";

describe("Developer tool registry", () => {
  test("gives every entry identity, navigation, loading, and document metadata", () => {
    expect(DEVELOPER_TOOLS).toHaveLength(7);

    for (const tool of DEVELOPER_TOOLS) {
      expect(tool.id).toBeTruthy();
      expect(getDeveloperToolHref(tool)).toBe(`/dashboard/${tool.path}`);
      expect(typeof tool.load).toBe("function");
      expect(tool.document.title).toBeTruthy();
      expect(tool.document.description).toBeTruthy();
      expect(tool.document.keywords.length).toBeGreaterThan(0);
    }
  });

  test("rejects duplicate IDs", () => {
    expect(() =>
      assertDeveloperToolRegistry([
        { id: "duplicate", path: "developer-tools/one" },
        { id: "duplicate", path: "developer-tools/two" },
      ])
    ).toThrow("Duplicate developer tool ID");
  });

  test("rejects duplicate paths", () => {
    expect(() =>
      assertDeveloperToolRegistry([
        { id: "one", path: "developer-tools/duplicate" },
        { id: "two", path: "developer-tools/duplicate" },
      ])
    ).toThrow("Duplicate developer tool path");
  });
});
