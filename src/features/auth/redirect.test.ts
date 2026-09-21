import { describe, expect, test } from "bun:test";
import { getSafeRedirectPath } from "@/features/auth/redirect";

describe("getSafeRedirectPath", () => {
  test("returns valid internal route paths", () => {
    expect(
      getSafeRedirectPath("/dashboard/developer-tools/date-converter")
    ).toBe("/dashboard/developer-tools/date-converter");
  });

  test("preserves query parameters and hashes from string", () => {
    expect(
      getSafeRedirectPath(
        "/dashboard/developer-tools/date-converter?tab=format#preview"
      )
    ).toBe("/dashboard/developer-tools/date-converter?tab=format#preview");
  });

  test("extracts path, search, and hash from Location object", () => {
    expect(
      getSafeRedirectPath({
        hash: "#details",
        pathname: "/dashboard/developer-tools/date-converter",
        search: "?input=1700000000",
      })
    ).toBe(
      "/dashboard/developer-tools/date-converter?input=1700000000#details"
    );
  });

  test("falls back to /dashboard on missing or empty input", () => {
    expect(getSafeRedirectPath(undefined)).toBe("/dashboard");
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
    expect(getSafeRedirectPath("")).toBe("/dashboard");
    expect(getSafeRedirectPath("   ")).toBe("/dashboard");
  });

  test("uses custom fallback when provided", () => {
    expect(getSafeRedirectPath(undefined, "/dashboard/overview")).toBe(
      "/dashboard/overview"
    );
  });

  test("blocks external and protocol-relative URLs", () => {
    expect(getSafeRedirectPath("https://example.com")).toBe("/dashboard");
    expect(getSafeRedirectPath("http://malicious.org/dashboard")).toBe(
      "/dashboard"
    );
    expect(getSafeRedirectPath("//malicious.org")).toBe("/dashboard");
    expect(getSafeRedirectPath("/\\malicious.org")).toBe("/dashboard");
    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
  });

  test("blocks loops back to login, logged-out, and root", () => {
    expect(getSafeRedirectPath("/login")).toBe("/dashboard");
    expect(getSafeRedirectPath("/login?reason=expired")).toBe("/dashboard");
    expect(getSafeRedirectPath("/logged-out")).toBe("/dashboard");
    expect(getSafeRedirectPath("/")).toBe("/dashboard");
  });

  test("blocks targets containing carriage return or newline characters", () => {
    expect(getSafeRedirectPath("/dashboard\r\n/evil")).toBe("/dashboard");
  });
});
