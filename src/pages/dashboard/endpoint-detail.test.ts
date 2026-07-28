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
          { billerId: 1, id: "first", responses: [] },
          { billerId: 1, id: "remembered", responses: [] },
        ],
        1,
        "remembered"
      )?.id
    ).toBe("remembered");
  });

  test("falls back to the first endpoint with an active response", () => {
    expect(
      selectEndpointForBiller(
        [
          { billerId: 1, id: "inactive", responses: [] },
          {
            billerId: 1,
            id: "active",
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
        1
      )?.id
    ).toBe("active");
  });

  test("falls back to the first endpoint when no response is active", () => {
    expect(
      selectEndpointForBiller(
        [
          { billerId: 1, id: "first", responses: [] },
          {
            billerId: 1,
            id: "second",
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
        1
      )?.id
    ).toBe("first");
  });

  test("ignores a remembered endpoint that is absent from the catalog", () => {
    expect(
      selectEndpointForBiller(
        [
          { billerId: 1, id: "first", responses: [] },
          {
            billerId: 1,
            id: "active",
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
        1,
        "deleted"
      )?.id
    ).toBe("active");
  });
});
