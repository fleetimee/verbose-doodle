import { afterEach, describe, expect, mock, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { RequestSimulatorSheet } from "@/features/endpoints/components/request-simulator-sheet";
import type { EndpointResponse } from "@/features/endpoints/types";

type SlotProps = {
  readonly children?: ReactNode;
};

const Slot = ({ children }: SlotProps) => <div>{children}</div>;

mock.module("@/components/ui/sheet", () => ({
  Sheet: Slot,
  SheetContent: Slot,
  SheetDescription: ({ children }: SlotProps) => <p>{children}</p>,
  SheetFooter: Slot,
  SheetHeader: Slot,
  SheetTitle: ({ children }: SlotProps) => <h2>{children}</h2>,
}));

mock.module("@/components/ui/scroll-area", () => ({
  ScrollArea: Slot,
  ScrollBar: Slot,
}));

mock.module("@/components/ui/hover-card", () => ({
  HoverCard: Slot,
  HoverCardContent: Slot,
  HoverCardTrigger: Slot,
}));

mock.module("@/features/endpoints/components/json-editor", () => ({
  JsonEditor: ({
    id,
    onChange,
    value,
  }: {
    readonly id?: string;
    readonly onChange: (value: string) => void;
    readonly value: string;
  }) => (
    <textarea
      id={id}
      onChange={(event) => onChange(event.currentTarget.value)}
      value={value}
    />
  ),
}));

type CodeBlockItem = {
  readonly code: string;
  readonly filename: string;
  readonly language: string;
};

let codeBlockData: readonly CodeBlockItem[] = [];

mock.module("@/components/kibo-ui/code-block", () => ({
  CodeBlock: ({
    children,
    data,
  }: {
    readonly children?: ReactNode;
    readonly data: readonly CodeBlockItem[];
  }) => {
    codeBlockData = data;
    return <div>{children}</div>;
  },
  CodeBlockBody: ({
    children,
  }: {
    readonly children: (item: CodeBlockItem) => ReactNode;
  }) => children(codeBlockData[0]),
  CodeBlockContent: ({ children }: { readonly children: string }) => (
    <pre>{children}</pre>
  ),
  CodeBlockHeader: Slot,
  CodeBlockItem: Slot,
}));

mock.module("sonner", () => ({
  toast: {
    error: mock(() => undefined),
    success: mock(() => undefined),
  },
}));

const originalFetch = globalThis.fetch;

const response: EndpointResponse = {
  activated: true,
  id: "response-1",
  json: '{"customerId":"12345"}',
  name: "Default response",
  statusCode: 200,
};

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("RequestSimulatorSheet", () => {
  test("transitions from empty to result and back to empty on reset", async () => {
    const user = userEvent.setup();
    const fetchMock = mock(
      async () =>
        new Response('{"invoiceId":42}', {
          headers: { "content-type": "application/json" },
          status: 200,
        })
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    render(
      <RequestSimulatorSheet
        baseUrl="https://api.example.test"
        endpointUrl="/invoices"
        method="GET"
        onOpenChange={mock(() => undefined)}
        open
        response={response}
      />
    );

    expect(screen.getByText("No response yet")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Send Request" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(document.body.textContent).toContain("200");
      expect(document.body.textContent).toContain('"invoiceId": 42');
    });

    await user.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() => {
      expect(screen.getByText("No response yet")).toBeDefined();
      expect(document.body.textContent).not.toContain('"invoiceId": 42');
    });
  });
});
