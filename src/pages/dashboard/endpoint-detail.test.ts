import { describe, expect, test } from "bun:test";
import {
  getActiveResponses,
  selectActiveResponse,
  selectEndpointForBiller,
} from "@/features/endpoints/utils/endpoint-selection";

describe("endpoint detail response selection", () => {
  test("selects the first active response in server order", () => {
    const endpoint = {
      responses: [
        { activated: false, id: "inactive" },
        { activated: true, id: "first-active" },
        { activated: true, id: "second-active" },
      ],
    };

    expect(getActiveResponses(endpoint).map((response) => response.id)).toEqual(
      ["first-active", "second-active"]
    );
    expect(selectActiveResponse(endpoint)?.id).toBe("first-active");
  });

  test("leaves the preview empty when no response is active", () => {
    expect(
      selectActiveResponse({
        responses: [{ activated: false, id: "inactive" }],
      })
    ).toBeNull();
  });

  test("restores a remembered endpoint when it is still in the catalog", () => {
    expect(
      selectEndpointForBiller(
        [
          { billerSlug: "pln", slug: "first-slug", responses: [] },
          { billerSlug: "pln", slug: "remembered-slug", responses: [] },
        ],
        "pln",
        "remembered-slug"
      )?.slug
    ).toBe("remembered-slug");
  });

  test("falls back to the first endpoint with an active response", () => {
    expect(
      selectEndpointForBiller(
        [
          { billerSlug: "pln", slug: "inactive-slug", responses: [] },
          {
            billerSlug: "pln",
            slug: "active-slug",
            responses: [
              {
                activated: true,
                id: "active-response",
                json: "{}",
                name: "Active",
                statusCode: 200,
              },
            ],
          },
        ],
        "pln"
      )?.slug
    ).toBe("active-slug");
  });

  test("falls back to the first endpoint when no response is active", () => {
    expect(
      selectEndpointForBiller(
        [
          { billerSlug: "pln", slug: "first-slug", responses: [] },
          {
            billerSlug: "pln",
            slug: "second-slug",
            responses: [
              {
                activated: false,
                id: "inactive-response",
                json: "{}",
                name: "Inactive",
                statusCode: 200,
              },
            ],
          },
        ],
        "pln"
      )?.slug
    ).toBe("first-slug");
  });

  test("ignores a remembered endpoint that is absent from the catalog", () => {
    expect(
      selectEndpointForBiller(
        [
          { billerSlug: "pln", slug: "first-slug", responses: [] },
          {
            billerSlug: "pln",
            slug: "active-slug",
            responses: [
              {
                activated: true,
                id: "active-response",
                json: "{}",
                name: "Active",
                statusCode: 200,
              },
            ],
          },
        ],
        "pln",
        "deleted"
      )?.slug
    ).toBe("active-slug");
  });
});
