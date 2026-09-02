import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { EditResponseStepper } from "@/features/endpoints/components/edit-response-stepper";
import type { EndpointResponse } from "@/features/endpoints/types";

type SlotProps = {
  readonly children?: ReactNode;
};

const Slot = ({ children }: SlotProps) => <div>{children}</div>;

mock.module("motion/react", () => ({
  AnimatePresence: Slot,
  motion: {
    div: ({
      children,
      className,
    }: {
      readonly children?: ReactNode;
      readonly className?: string;
    }) => <div className={className}>{children}</div>,
  },
  useReducedMotion: () => false,
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
      data-testid="json-editor-textarea"
      id={id}
      onChange={(event) => onChange(event.currentTarget.value)}
      value={value}
    />
  ),
}));

const sampleResponse: EndpointResponse = {
  activated: true,
  id: "response-1",
  json: '{"nomorVA":"999015100000000098","alamatVA":"-","jumlahData":"1"}',
  name: "Success Response",
  statusCode: 200,
};

describe("EditResponseStepper", () => {
  test("auto-formats (autowands) unformatted JSON response on initial load", () => {
    render(
      <EditResponseStepper
        editType="json"
        onCancel={() => undefined}
        onSubmit={() => undefined}
        response={sampleResponse}
      />
    );

    const textarea = screen.getByTestId<HTMLTextAreaElement>(
      "json-editor-textarea"
    );
    const expectedFormattedJson = JSON.stringify(
      JSON.parse(sampleResponse.json),
      null,
      2
    );

    expect(textarea.value).toBe(expectedFormattedJson);
  });
});
