import { describe, expect, test } from "bun:test";
import { DEVELOPER_TOOLS } from "@/features/developer-tools/catalog";
import { DEVELOPER_TOOL_ROUTES } from "@/features/developer-tools/routes";

describe("Developer tool routes", () => {
  test("makes every registered tool reachable through a lazy route", () => {
    expect(DEVELOPER_TOOL_ROUTES).toHaveLength(DEVELOPER_TOOLS.length);

    expect(DEVELOPER_TOOL_ROUTES.map((route) => route.path)).toEqual(
      DEVELOPER_TOOLS.map((tool) => tool.path)
    );

    for (const route of DEVELOPER_TOOL_ROUTES) {
      expect(route.tool.path).toBe(route.path);
      expect(route.Page).toBeDefined();
    }
  });
});
