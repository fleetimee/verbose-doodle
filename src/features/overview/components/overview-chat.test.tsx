import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { QueryObserverResult } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { OverviewChat } from "@/features/overview/components/overview-chat";
import type { OverviewData } from "@/features/overview/types";
import type { ApiError } from "@/lib/api";

const conversationStorageKey = "fleetime-labs.overview.conversation";
const clearChatOptionPattern = /Clear chat/;
const refreshReplyPattern = /The overview is refreshed\./;

const overviewData: OverviewData = {
  endpointsByBiller: [
    { billerName: "PLN", endpointCount: 3 },
    { billerName: "PDAM", endpointCount: 1 },
  ],
  methodDistribution: [],
  recentEndpoints: [
    {
      billerName: "PLN",
      endpointId: 12,
      method: "POST",
      responseCount: 2,
      url: "/api/inquiry",
    },
  ],
  responseActivation: { active: 5, inactive: 1 },
  responseStatusDistribution: [],
  stats: {
    activeResponses: 5,
    activeResponsesPercentage: "83%",
    endpointsWithoutResponses: 1,
    totalBillers: 2,
    totalEndpoints: 4,
    totalResponses: 6,
  },
  userRoleDistribution: [{ count: 1, role: "ADMIN" }],
  userStatusDistribution: [{ count: 3, status: "active" }],
  userStats: {
    activeUsers: 3,
    adminUsers: 1,
    inactiveUsers: 1,
    regularUsers: 3,
    totalUsers: 4,
  },
};

function renderOverview(isAdmin = true) {
  let refetchCalls = 0;
  const refetch = () => {
    refetchCalls += 1;
    return Promise.resolve({
      data: overviewData,
      error: null,
    } as unknown as QueryObserverResult<OverviewData, ApiError>);
  };

  render(
    <MemoryRouter>
      <OverviewChat
        data={overviewData}
        error={null}
        isAdmin={isAdmin}
        isLoading={false}
        refetch={refetch}
      />
    </MemoryRouter>
  );

  return {
    getRefetchCalls: () => refetchCalls,
    input: screen.getByLabelText("Ask the simulator") as HTMLTextAreaElement,
  };
}

describe("Overview chat", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.removeItem(conversationStorageKey);
  });

  test("starts with a focused welcome state and suggested questions", () => {
    renderOverview();

    expect(
      screen.getByRole("heading", { name: "Ask the simulator" })
    ).toBeTruthy();
    expect(screen.getByText("Try a question")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Show recent endpoints" })
    ).toBeTruthy();
    expect(screen.queryByText("Live simulator snapshot")).toBeNull();
  });

  test("restores the saved conversation and its destination actions", () => {
    window.sessionStorage.setItem(
      conversationStorageKey,
      JSON.stringify([
        { id: "user-0", role: "user", text: "Show recent endpoints" },
        {
          actionIds: ["endpoints"],
          id: "assistant-1",
          role: "assistant",
          showSnapshot: true,
          text: "Saved snapshot reply",
        },
      ])
    );

    renderOverview();

    expect(screen.getByText("Saved snapshot reply")).toBeTruthy();
    expect(screen.getByText("Live simulator snapshot")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open endpoint catalog" })
    ).toBeTruthy();
  });

  test("answers a snapshot question with live coverage and endpoint actions", async () => {
    const { input } = renderOverview();

    fireEvent.change(input, {
      target: { value: "Show me a simulator snapshot" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("Live simulator snapshot")).toBeTruthy();
    expect(screen.getByText("4", { selector: "strong" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open endpoint catalog" })
    ).toBeTruthy();
    expect(
      screen.getByText("1 endpoint has no response template")
    ).toBeTruthy();
    expect(input.value).toBe("");
  });

  test("supports slash commands and clears the persisted conversation", async () => {
    const { input } = renderOverview();

    fireEvent.change(input, { target: { value: "Show recent endpoints" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Live simulator snapshot")).toBeTruthy();

    fireEvent.change(input, { target: { value: "/" } });
    expect(
      screen.getByRole("listbox", { name: "Slash commands" })
    ).toBeTruthy();
    expect(
      screen.getByRole("option", { name: clearChatOptionPattern })
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("option", { name: clearChatOptionPattern })
    );

    await waitFor(() => {
      expect(screen.queryByText("Live simulator snapshot")).toBeNull();
    });
    expect(input.value).toBe("");
    expect(window.sessionStorage.getItem(conversationStorageKey)).toBeNull();
  });

  test("refreshes the overview through the slash command", async () => {
    const { getRefetchCalls, input } = renderOverview(false);

    fireEvent.change(input, { target: { value: "/refresh" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await screen.findByText(refreshReplyPattern)).toBeTruthy();
    expect(getRefetchCalls()).toBe(1);
    expect(screen.getByText("Live simulator snapshot")).toBeTruthy();
  });
});
