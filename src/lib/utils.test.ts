import { describe, expect, test } from "bun:test";
import { cn } from "@/lib/utils";

describe("cn utility function", () => {
  test("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("handles conditional classes", () => {
    const condition1 = false;
    const condition2 = true;
    expect(cn("foo", condition1 && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", condition2 && "bar", "baz")).toBe("foo bar baz");
  });

  test("handles array inputs", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
    expect(cn(["foo"], ["bar", "baz"])).toBe("foo bar baz");
  });

  test("handles object inputs", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  test("merges Tailwind classes correctly (removes conflicts)", () => {
    // Later classes should override earlier ones for conflicting utilities
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  test("preserves non-conflicting Tailwind classes", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  test("handles empty or undefined inputs", () => {
    expect(cn()).toBe("");
    expect(cn("", undefined, null, false)).toBe("");
  });

  test("handles mixed input types", () => {
    expect(
      cn("foo", ["bar", { baz: true, qux: false }], undefined, "quux")
    ).toBe("foo bar baz quux");
  });

  test("handles duplicate classes", () => {
    // cn doesn't deduplicate simple duplicates - it merges and leaves resolution to tailwind-merge
    expect(cn("foo", "foo")).toContain("foo");
    expect(cn("foo bar", "bar baz")).toContain("bar");
  });
});
