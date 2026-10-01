import { afterEach, expect, mock, spyOn, test } from "bun:test";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import {
  createQris,
  QRIS_CREATOR_SAMPLE,
} from "@/features/developer-tools/tools/qris-creator/create-qris";

const sample =
  createQris({
    ...QRIS_CREATOR_SAMPLE,
    merchantName: "IMPORTED SHOP",
    mode: "dynamic",
  }).payload ?? "";
const decode = mock(async (_file: File) => sample);
mock.module(
  "@/features/developer-tools/tools/qris-parser/decode-qr-image",
  () => ({ decodeQrImage: decode, QrImageError: class extends Error {} })
);
const { renderQrisQr } = await import(
  "@/features/developer-tools/tools/qris-creator/render-qris-qr"
);
const logo = "data:image/png;base64,brand";
const pngExport = mock(
  async (_payload: string, _logo?: string) => "data:image/png;base64,export"
);
mock.module(
  "@/features/developer-tools/tools/qris-creator/render-qris-qr",
  () => ({
    renderQrisQr,
    loadQrisLogo: async () => logo,
    renderQrisPng: pngExport,
  })
);
const { QrisCreator } = await import(
  "@/features/developer-tools/tools/qris-creator/components/qris-creator"
);
afterEach(() => {
  pngExport.mockClear();
  decode.mockReset();
  decode.mockImplementation(async () => sample);
});
function uploadQr() {
  fireEvent.change(screen.getByLabelText("QR image"), {
    target: { files: [new File(["qr"], "real.png", { type: "image/png" })] },
  });
}

import { parseQris } from "@/features/developer-tools/tools/qris-parser/parse-qris";

test("updates the QR and removes stale output when merchant input becomes invalid", () => {
  render(
    <MemoryRouter>
      <QrisCreator />
    </MemoryRouter>
  );
  const payload = () =>
    (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value;
  expect(parseQris(payload()).mode).toBe("static");
  fireEvent.click(screen.getByRole("button", { name: "Dynamic" }));
  fireEvent.change(screen.getByLabelText("Amount (IDR)"), {
    target: { value: "25000.50" },
  });
  expect(parseQris(payload()).amount).toBe("25000.50");
  expect(screen.getByText("Rp25.000,50")).toBeDefined();
  fireEvent.change(screen.getByLabelText("Merchant name"), {
    target: { value: "" },
  });
  expect(screen.queryByRole("img")).toBeNull();
  expect(screen.queryByLabelText("QR payload")).toBeNull();
  fireEvent.change(screen.getByLabelText("Merchant name"), {
    target: { value: "MY SHOP" },
  });
  expect(parseQris(payload()).merchant).toBe("MY SHOP");
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(screen.queryByLabelText("QR payload")).toBeNull();
});

test("selects known merchant codes and accepts manual provider codes", async () => {
  render(
    <MemoryRouter>
      <QrisCreator />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole("combobox", { name: "Merchant criteria" }));
  fireEvent.click(screen.getByRole("option", { name: "UKE Small enterprise" }));
  let parsed = parseQris(
    (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value
  );
  expect(
    parsed.fields
      .find((field) => field.id === "51")
      ?.children.find((field) => field.id === "03")?.value
  ).toBe("UKE");
  fireEvent.change(screen.getByLabelText("Merchant category code"), {
    target: { value: "9876" },
  });
  expect(
    parseQris(
      (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value
    ).fields.find((field) => field.id === "52")?.value
  ).toBe("9876");
  fireEvent.change(screen.getByLabelText("Merchant category code"), {
    target: { value: "98" },
  });
  expect(screen.queryByLabelText("QR payload")).toBeNull();
  fireEvent.click(
    screen.getByRole("combobox", { name: "Select category code" })
  );
  fireEvent.input(
    screen.getByPlaceholderText("Search code or business type…"),
    { target: { value: "1234" } }
  );
  fireEvent.click(
    await screen.findByRole("option", { name: "Use entered code · 1234" })
  );
  parsed = parseQris(
    (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value
  );
  expect(parsed.fields.find((field) => field.id === "52")?.value).toBe("1234");
  fireEvent.click(screen.getByRole("combobox", { name: "Merchant criteria" }));
  fireEvent.input(
    screen.getByPlaceholderText("Search or enter a 3-character code…"),
    { target: { value: "XYZ" } }
  );
  fireEvent.click(
    await screen.findByRole("option", { name: "Use entered code · XYZ" })
  );
  parsed = parseQris(
    (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value
  );
  expect(
    parsed.fields
      .find((field) => field.id === "51")
      ?.children.find((field) => field.id === "03")?.value
  ).toBe("XYZ");
});

test("imports images, blocks editing during decoding and retains work after invalid import", async () => {
  let resolve: (payload: string) => void = () => {};
  decode.mockImplementationOnce(
    () =>
      new Promise<string>((done) => {
        resolve = done;
      })
  );
  render(
    <MemoryRouter>
      <QrisCreator />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText("Import existing QRIS"));
  uploadQr();
  await screen.findByText("Reading QR image…");
  expect(
    (
      screen
        .getByLabelText("Merchant name")
        .closest("fieldset") as HTMLFieldSetElement
    ).disabled
  ).toBe(true);
  await act(() => {
    resolve(sample);
    return Promise.resolve();
  });
  await waitFor(() =>
    expect(
      (screen.getByLabelText("Merchant name") as HTMLInputElement).value
    ).toBe("IMPORTED SHOP")
  );
  expect(
    (
      screen
        .getByLabelText("Merchant name")
        .closest("fieldset") as HTMLFieldSetElement
    ).disabled
  ).toBe(false);
  fireEvent.change(screen.getByLabelText("Amount (IDR)"), {
    target: { value: "25000" },
  });
  expect(
    parseQris(
      (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value
    ).amount
  ).toBe("25000");
  decode.mockResolvedValueOnce("not a payment QR");
  uploadQr();
  await screen.findByRole("alert");
  expect(
    (screen.getByLabelText("Merchant name") as HTMLInputElement).value
  ).toBe("IMPORTED SHOP");
  expect(
    parseQris(
      (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value
    ).amount
  ).toBe("25000");
});

test("clear cancels a pending image import", async () => {
  let resolve: (payload: string) => void = () => {};
  decode.mockImplementationOnce(
    () =>
      new Promise<string>((done) => {
        resolve = done;
      })
  );
  render(
    <MemoryRouter>
      <QrisCreator />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText("Import existing QRIS"));
  uploadQr();
  await screen.findByText("Reading QR image…");
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  await act(() => {
    resolve(sample);
    return Promise.resolve();
  });
  expect(
    (screen.getByLabelText("Merchant name") as HTMLInputElement).value
  ).toBe("");
  expect(
    screen.queryByText("Imported QRIS · CRC matches.", { exact: false })
  ).toBeNull();
});

test("branding switch controls preview and both exports without changing the payload", async () => {
  render(
    <MemoryRouter>
      <QrisCreator />
    </MemoryRouter>
  );
  const download = spyOn(
    HTMLAnchorElement.prototype,
    "click"
  ).mockImplementation(() => {});
  try {
    const image = screen.getByAltText(
      "Scannable QR for the current payload"
    ) as HTMLImageElement;
    await waitFor(() =>
      expect(decodeURIComponent(image.src)).toContain(
        '<image href="data:image/png;base64,brand"'
      )
    );
    const payload = (screen.getByLabelText("QR payload") as HTMLTextAreaElement)
      .value;
    fireEvent.click(screen.getByRole("button", { name: "Download PNG" }));
    await waitFor(() => expect(pngExport).toHaveBeenCalledWith(payload, logo));
    await waitFor(() =>
      expect(
        screen
          .getByRole("switch", { name: "App logo" })
          .hasAttribute("data-disabled")
      ).toBe(false)
    );
    fireEvent.click(screen.getByRole("switch", { name: "App logo" }));
    expect(decodeURIComponent(image.src)).not.toContain("<image");
    expect(
      (screen.getByLabelText("QR payload") as HTMLTextAreaElement).value
    ).toBe(payload);
    fireEvent.click(screen.getByRole("button", { name: "Download PNG" }));
    await waitFor(() =>
      expect(pngExport).toHaveBeenLastCalledWith(payload, undefined)
    );
    fireEvent.click(screen.getByRole("button", { name: "Download SVG" }));
    const svgLink = download.mock.contexts.at(-1) as HTMLAnchorElement;
    expect(decodeURIComponent(svgLink.href)).not.toContain("<image");
  } finally {
    download.mockRestore();
  }
});
