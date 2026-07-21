import { describe, expect, test } from "bun:test";
import { AboutVersionFooter } from "./about-version-footer";

describe("AboutVersionFooter component", () => {
  test("exports valid AboutVersionFooter component function", () => {
    expect(typeof AboutVersionFooter).toBe("function");
  });
});
