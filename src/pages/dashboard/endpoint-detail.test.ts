import { describe, expect, test } from "bun:test";
import {
  getActiveResponses,
  selectActiveResponse,
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
});
