import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { ResponseList } from "@/features/endpoints/components/response-list";
import type { EndpointResponse } from "@/features/endpoints/types";

type SlotProps = {
  readonly children?: ReactNode;
};

const Slot = ({ children }: SlotProps) => <>{children}</>;

type MotionProps = SlotProps & {
  readonly layoutId?: string;
  readonly [key: string]: unknown;
};

const createMotionElement = (tag: string) => {
  const MotionElement = ({ children, layoutId, ...props }: MotionProps) => {
    const {
      animate: _animate,
      exit: _exit,
      initial: _initial,
      layout: _layout,
      transition: _transition,
      ...elementProps
    } = props;

    return createElement(
      tag,
      {
        ...elementProps,
        ...(layoutId ? { "data-layout-id": layoutId } : {}),
      },
      children
    );
  };

  return MotionElement;
};

const motion = new Proxy<Record<string, unknown>>(
  {},
  {
    get: (_target, tag: string) => createMotionElement(tag),
  }
);

mock.module("motion/react", () => ({
  AnimatePresence: Slot,
  LayoutGroup: Slot,
  motion,
  useReducedMotion: () => false,
}));

mock.module("@/components/ui/scroll-area", () => ({
  ScrollArea: Slot,
  ScrollBar: Slot,
}));

mock.module("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

mock.module("@/features/endpoints/components/response-list-item", () => ({
  ResponseListItem: ({ response }: { readonly response: EndpointResponse }) => (
    <div
      data-activated={String(response.activated)}
      data-testid={`response-${response.id}`}
    >
      {response.name}
    </div>
  ),
}));

const response: EndpointResponse = {
  activated: false,
  id: "response-1",
  json: '{"ok":true}',
  name: "Primary response",
  statusCode: 200,
};

const listProps = {
  endpointId: "endpoint-1",
  isActivating: false,
  isDeactivating: false,
  onActivateResponse: mock(() => undefined),
  onDeactivateResponse: mock(() => undefined),
  onSelectResponse: mock(() => undefined),
  selectedResponseId: null,
};

describe("ResponseList", () => {
  test("keeps a response layout identity while activating and deactivating", () => {
    const { container, rerender } = render(
      <ResponseList {...listProps} responses={[response]} />
    );

    const layoutId = container
      .querySelector("[data-layout-id]")
      ?.getAttribute("data-layout-id");
    expect(layoutId).not.toBeNull();
    expect(
      screen.getByTestId("response-response-1").getAttribute("data-activated")
    ).toBe("false");

    const activeResponse = { ...response, activated: true };
    rerender(<ResponseList {...listProps} responses={[activeResponse]} />);

    expect(
      container.querySelector(`[data-layout-id="${layoutId}"]`)
    ).not.toBeNull();
    expect(
      screen.getByTestId("response-response-1").getAttribute("data-activated")
    ).toBe("true");

    rerender(<ResponseList {...listProps} responses={[response]} />);

    expect(
      container.querySelector(`[data-layout-id="${layoutId}"]`)
    ).not.toBeNull();
    expect(
      screen.getByTestId("response-response-1").getAttribute("data-activated")
    ).toBe("false");
  });
});
