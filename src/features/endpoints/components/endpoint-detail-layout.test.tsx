import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/features/auth/context";
import { EndpointDetailLayout } from "@/features/endpoints/components/endpoint-detail-layout";

const response = {
  activated: true,
  id: "response-1",
  json: '{"ok":true}',
  name: "Success",
  statusCode: 200,
};

describe("EndpointDetailLayout", () => {
  test("keeps the tabbed layout active until the detail view has room for two panels", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { container } = render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider defaultTheme="light">
              <EndpointDetailLayout
                endpointId="endpoint-1"
                endpointMethod="POST"
                endpointSlug="pln-post-payments-inquiry-a1b2c3"
                endpointUrl="/payments/inquiry"
                isActivating={false}
                isDeactivating={false}
                onActivateResponse={() => undefined}
                onDeactivateResponse={() => undefined}
                onSelectResponse={() => undefined}
                responses={[response]}
                selectedResponse={response}
                selectedResponseId={response.id}
              />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    await act(async () => {
      await Promise.resolve();
    });

    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards).toHaveLength(2);
    expect(cards[0]?.className).toContain("lg:hidden");
    expect(cards[1]?.className).toContain("lg:block");
  });
});
