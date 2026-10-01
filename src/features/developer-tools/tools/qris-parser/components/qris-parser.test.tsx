import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import {
  QRIS_DYNAMIC_SAMPLE,
  QRIS_SAMPLE,
} from "@/features/developer-tools/tools/qris-parser/parse-qris";

const decode = mock(async (_file: File) => QRIS_SAMPLE);
mock.module(
  "@/features/developer-tools/tools/qris-parser/decode-qr-image",
  () => ({
    decodeQrImage: decode,
    QrImageError: class extends Error {},
  })
);
const { QrisParser } = await import(
  "@/features/developer-tools/tools/qris-parser/components/qris-parser"
);

afterEach(() => {
  decode.mockReset();
  decode.mockImplementation(async () => QRIS_SAMPLE);
});

function renderParser() {
  return render(
    <MemoryRouter>
      <QrisParser />
    </MemoryRouter>
  );
}
function upload() {
  fireEvent.change(screen.getByLabelText("QR image"), {
    target: { files: [new File(["test"], "qr.png", { type: "image/png" })] },
  });
}

describe("QRIS parser input transitions", () => {
  test("replaces parsed output on errors and recovers after correction", () => {
    renderParser();
    expect(screen.getByText("CRC matches")).toBeDefined();
    fireEvent.change(screen.getByLabelText("QR payload"), {
      target: { value: "000299" },
    });
    expect(screen.queryByText("CRC matches")).toBeNull();
    fireEvent.change(screen.getByLabelText("QR payload"), {
      target: { value: "00020" },
    });
    expect(screen.getByRole("alert")).toBeDefined();
    fireEvent.change(screen.getByLabelText("QR payload"), {
      target: { value: QRIS_SAMPLE },
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("CRC matches")).toBeDefined();
  });
  test("parses decoded image text and preserves text after an upload failure", async () => {
    renderParser();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    upload();
    await screen.findByText("QR decoded");
    expect(screen.getByText("CRC matches")).toBeDefined();
    decode.mockRejectedValueOnce(new Error("bad image"));
    upload();
    await screen.findByText(
      "Could not read this image. Try a PNG or JPEG export."
    );
    expect(
      (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value
    ).toBe(QRIS_SAMPLE);
  });
  test("switches between static and dynamic samples with an amount", () => {
    renderParser();
    expect(screen.getByText("Entered by payer")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Dynamic sample" }));
    expect(screen.getByText("Rp12.500,00")).toBeDefined();
    expect(screen.getByText("Dynamic")).toBeDefined();
    expect(screen.getByText("CRC matches")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Static sample" }));
    expect(screen.getByText("Entered by payer")).toBeDefined();
    expect(screen.queryByText("Rp12.500,00")).toBeNull();
  });
  test("blocks payload editing while the image decodes and unlocks it afterward", async () => {
    let resolve: (value: string) => void = () => {};
    decode.mockImplementationOnce(
      () =>
        new Promise<string>((done) => {
          resolve = done;
        })
    );
    renderParser();
    upload();
    await screen.findByText("Reading QR image…");
    const input = screen.getByLabelText("QR payload") as HTMLTextAreaElement;
    expect(input.disabled).toBe(true);
    await act(() => {
      resolve(QRIS_SAMPLE);
    });
    await waitFor(() => expect(input.disabled).toBe(false));
    expect(screen.getByText("QR decoded")).toBeDefined();
  });
  test.each(["clear", "sample"])(
    "ignores an image decode that finishes after %s",
    async (action) => {
      let resolve: (value: string) => void = () => {};
      decode.mockImplementationOnce(
        () =>
          new Promise<string>((done) => {
            resolve = done;
          })
      );
      renderParser();
      upload();
      await screen.findByText("Reading QR image…");
      if (action === "clear") {
        fireEvent.click(screen.getByRole("button", { name: "Clear" }));
      } else {
        fireEvent.click(screen.getByRole("button", { name: "Static sample" }));
      }
      await act(() => {
        resolve(QRIS_DYNAMIC_SAMPLE);
      });
      await waitFor(() =>
        expect(
          (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value
        ).toBe(action === "clear" ? "" : QRIS_SAMPLE)
      );
      expect(
        (screen.getByLabelText("QR payload") as HTMLTextAreaElement).disabled
      ).toBe(false);
    }
  );
});
