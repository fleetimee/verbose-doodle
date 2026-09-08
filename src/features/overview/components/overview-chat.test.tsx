import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { QueryObserverResult } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { OverviewChat } from "@/features/overview/components/overview-chat";
import type { OverviewData } from "@/features/overview/types";
import type { ApiError } from "@/lib/api";

const conversationStorageKey = "fleetime-labs.overview.conversation";
const clearChatOptionPattern = /Clear chat/;
const jwtInspectorLinkPattern = /JWT inspector/i;
const refreshOverviewOptionPattern = /Refresh overview/;

function findStreamingText(text: string) {
  return screen.findByText(
    (_content, element) =>
      element?.getAttribute("data-slot") === "streaming" &&
      element.textContent?.includes(text) === true,
    {},
    { timeout: 2000 }
  );
}

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
      endpointSlug: "pln-inquiry-post-a1b2c3",
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

  const view = render(
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
    container: view.container,
    getRefetchCalls: () => refetchCalls,
    input: screen.getByLabelText(
      "Ask the biller operator"
    ) as HTMLTextAreaElement,
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
    const { container } = renderOverview();

    expect(
      screen.getByRole("heading", { name: "What should we look up?" })
    ).toBeTruthy();
    const mascot = screen.getByRole("img", {
      name: "Biller operator mascot reading a tablet",
    });
    expect(mascot).toBeTruthy();
    expect(mascot.tagName).toBe("VIDEO");
    expect(mascot.querySelector('source[type="video/webm"]')).toBeTruthy();
    expect(mascot.querySelector('source[type*="hvc1"]')).toBeTruthy();
    expect(
      container.querySelector('[data-slot="overview-chat-ambient"]')
    ).toBeTruthy();
    expect(screen.getByText("Try a question")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Show recent endpoints" })
    ).toBeTruthy();
    expect(screen.queryByText("Live simulator snapshot")).toBeNull();
  });

  test("staggers the overview items when the welcome state enters", () => {
    const { container } = renderOverview();
    const entranceItems = container.querySelectorAll(
      '[data-overview-entrance="item"]'
    );

    expect(entranceItems).toHaveLength(7);
    expect(entranceItems[0]?.getAttribute("style")).toContain("opacity: 0");
    expect(entranceItems[3]?.getAttribute("style")).toContain(
      "translateY(14px)"
    );
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

    const savedReply = screen.getByText("Saved snapshot reply");
    const savedBubble = savedReply.closest('[data-slot="bubble"]');
    expect(savedBubble).toBeTruthy();
    expect(savedBubble?.classList.contains("overview-chat-bubble")).toBe(false);
    expect(savedReply.classList.contains("overview-chat-bubble")).toBe(true);
    expect(savedReply.closest('[data-slot="message"]')).toBeTruthy();
    expect(savedReply.closest('[data-slot="message-scroller"]')).toBeTruthy();
    expect(
      screen.getByRole("navigation", { name: "Chat minimap" })
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Jump to: Saved snapshot reply" })
    ).toBeTruthy();
    const assistantAvatar = savedReply
      .closest('[data-slot="message"]')
      ?.querySelector('[data-slot="message-avatar"]');
    expect(assistantAvatar?.classList.contains("self-start")).toBe(true);
    expect(assistantAvatar?.classList.contains("bg-transparent")).toBe(true);
    expect(assistantAvatar?.classList.contains("overflow-visible")).toBe(true);
    const userMessage = screen
      .getByText("Show recent endpoints")
      .closest('[data-slot="message"]');
    expect(userMessage?.getAttribute("data-align")).toBe("end");
    expect(screen.getByText("Live simulator snapshot")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open endpoint catalog" })
    ).toBeTruthy();
  });

  test("answers a snapshot question with live coverage and endpoint actions", async () => {
    const { container, input } = renderOverview();

    fireEvent.change(input, {
      target: { value: "Show me a simulator snapshot" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => {
      expect(
        container.querySelector('[data-slot="overview-chat-ambient"]')
      ).toBeNull();
    });

    expect(screen.getByRole("status").querySelector(".shimmer")).toBeTruthy();
    expect(
      container.querySelector(
        '[data-slot="overview-operator-mascot"][data-state="thinking"]'
      )
    ).toBeTruthy();
    expect(await screen.findByText("Live simulator snapshot")).toBeTruthy();
    expect(screen.getByText("4", { selector: "strong" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Open endpoint catalog" })
    ).toBeTruthy();
    expect(
      screen.getByText("/api/inquiry").closest("a")?.getAttribute("href")
    ).toBe("/dashboard/endpoints/pln-inquiry-post-a1b2c3");
    expect(
      screen.getByText("1 endpoint has no response template")
    ).toBeTruthy();
    expect(input.value).toBe("");
  });

  test("supports slash commands and clears the persisted conversation", async () => {
    const { container, input } = renderOverview();

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
    expect(
      container.querySelector('[data-slot="overview-chat-ambient"]')
    ).toBeTruthy();
    expect(input.value).toBe("");
    expect(window.sessionStorage.getItem(conversationStorageKey)).toBeNull();
  });

  test("keeps the selected slash command visible while navigating", async () => {
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    let scrollCalls = 0;
    Element.prototype.scrollIntoView = () => {
      scrollCalls += 1;
    };

    try {
      const { input } = renderOverview();

      fireEvent.change(input, { target: { value: "/" } });
      scrollCalls = 0;
      fireEvent.keyDown(input, { key: "ArrowDown" });

      await waitFor(() => {
        expect(scrollCalls).toBeGreaterThan(0);
      });
      expect(
        screen
          .getByRole("option", { name: refreshOverviewOptionPattern })
          .getAttribute("aria-selected")
      ).toBe("true");
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });

  test("refreshes the overview through the slash command", async () => {
    const { getRefetchCalls, input } = renderOverview(false);

    fireEvent.change(input, { target: { value: "/refresh" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(await findStreamingText("The overview is refreshed.")).toBeTruthy();
    expect(getRefetchCalls()).toBe(1);
    expect(screen.getByText("Live simulator snapshot")).toBeTruthy();
  });

  test("answers tool-specific slash commands with direct destination actions", async () => {
    const { input } = renderOverview();

    fireEvent.change(input, { target: { value: "/jwt" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await findStreamingText("The JWT Inspector allows you to decode")
    ).toBeTruthy();
    expect(
      screen.getAllByRole("link", { name: jwtInspectorLinkPattern }).length
    ).toBeGreaterThan(0);
  });

  test("provides cheat sheet and command guide on /help", async () => {
    const { input } = renderOverview();

    fireEvent.change(input, { target: { value: "/help" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    const streamedHelp = await findStreamingText("• /jwt, /iso8583");
    expect(streamedHelp.textContent).toContain(
      "Here are the available slash commands"
    );
    expect(streamedHelp.textContent).toContain("• /snapshot");
  });
});
