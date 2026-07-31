import { describe, expect, test } from "bun:test";
import {
  mapBillerList,
  mapCreatedBiller,
  mapUpdatedBiller,
} from "@/features/billers/data/http-biller-adapter";

describe("Biller HTTP adapter", () => {
  test("maps backend-generated slugs and display names from list responses", () => {
    expect(
      mapBillerList({
        data: {
          billers: [
            { biller_name: "PLN Postpaid", slug: "pln-postpaid" },
            { biller_name: "PDAM", slug: "pdam" },
          ],
        },
      })
    ).toEqual([
      { name: "PLN Postpaid", slug: "pln-postpaid" },
      { name: "PDAM", slug: "pdam" },
    ]);
  });

  test("keeps the generated slug from a name-only create response", () => {
    expect(
      mapCreatedBiller({
        data: {
          biller: {
            biller_name: "PLN Postpaid",
            slug: "pln-postpaid-2",
          },
        },
      })
    ).toEqual({ name: "PLN Postpaid", slug: "pln-postpaid-2" });
  });

  test("maps a rename response without changing the slug", () => {
    expect(
      mapUpdatedBiller({
        data: {
          biller: {
            biller_name: "PLN Retail",
            slug: "pln-postpaid-2",
          },
        },
      })
    ).toEqual({ name: "PLN Retail", slug: "pln-postpaid-2" });
  });
});
