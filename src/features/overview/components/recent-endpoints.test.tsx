import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { RecentEndpoints } from "@/features/overview/components/recent-endpoints";
import type { OverviewData } from "@/features/overview/types";

const data = {
  recentEndpoints: [
    {
      billerName: "PLN",
      endpointId: 12,
      endpointSlug: "pln-inquiry-post-a1b2c3",
      method: "POST",
      responseCount: 2,
      url: "/inquiry",
    },
  ],
} as OverviewData;

describe("RecentEndpoints", () => {
  test("links to endpoint details by public slug", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { enabled: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecentEndpoints data={data} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/dashboard/endpoints/pln-inquiry-post-a1b2c3"
    );
  });
});
