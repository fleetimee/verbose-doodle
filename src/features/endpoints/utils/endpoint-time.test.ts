import { describe, expect, test } from "bun:test";
import {
  formatJakartaTime,
  formatJakartaTimestamp,
} from "@/features/endpoints/utils/endpoint-time";

describe("endpoint time formatting", () => {
  test("formats UTC timestamps as Jakarta time with an explicit WIB label", () => {
    expect(formatJakartaTimestamp("2026-07-27T03:51:28.000Z")).toBe(
      "27 Jul 2026, 10:51:28 WIB"
    );
  });

  test("formats metric bucket labels in Jakarta time", () => {
    expect(formatJakartaTime(Date.parse("2026-07-27T03:51:28.000Z"))).toBe(
      "10:51:28"
    );
  });

  test("keeps invalid timestamps readable", () => {
    expect(formatJakartaTimestamp("not-a-timestamp")).toBe("not-a-timestamp");
  });
});
