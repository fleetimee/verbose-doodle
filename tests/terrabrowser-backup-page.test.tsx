import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nProvider } from "@/components/i18n-provider";
import { TerrabrowserPage } from "@/pages/dashboard/terrabrowser";

const catalog = {
  characters: [{ id: "c1", name: "Miner" }],
  worlds: [{ id: "w1", name: "Home" }],
};

test("import previews saves and requires an explicit selection and confirmation", async () => {
  const importSave = mock(async () => ({ characters: 1, worlds: 0 }));
  const { container } = render(
    <I18nProvider defaultLocale="en-US">
      <TerrabrowserPage />
    </I18nProvider>
  );
  const frame = container.querySelector("iframe");
  if (!frame) {
    throw new Error("Missing game frame");
  }
  Object.defineProperty(frame, "contentWindow", {
    configurable: true,
    value: {
      terrabrowserBackup: {
        inspect: () => catalog,
        import: importSave,
      },
    },
  });
  fireEvent.load(frame);
  fireEvent.change(screen.getByLabelText("Import"), {
    target: {
      files: [
        new File(['{"backup":true}'], "backup.json", {
          type: "application/json",
        }),
      ],
    },
  });
  const confirm = await screen.findByRole("button", {
    name: "Import selected",
  });
  expect(importSave).not.toHaveBeenCalled();
  expect(confirm.hasAttribute("disabled")).toBe(true);
  const character = screen.getByRole("checkbox", { name: "Miner" });
  const world = screen.getByRole("checkbox", { name: "Home" });
  expect(character.getAttribute("aria-checked")).toBe("false");
  expect(world.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(
    screen.getByRole("button", { name: "Select all Characters" })
  );
  expect(character.getAttribute("aria-checked")).toBe("true");
  expect(world.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(
    screen.getByRole("button", { name: "Clear Characters selection" })
  );
  expect(character.getAttribute("aria-checked")).toBe("false");
  expect(confirm.hasAttribute("disabled")).toBe(true);
  fireEvent.click(character);
  expect(character.getAttribute("aria-checked")).toBe("true");
  expect(importSave).not.toHaveBeenCalled();
  fireEvent.click(confirm);
  await waitFor(() =>
    expect(importSave).toHaveBeenCalledWith('{"backup":true}', {
      characters: ["c1"],
      worlds: [],
    })
  );
});

test("canceling the export picker does not export saves", async () => {
  const exportSave = mock(async () => "{}");
  const { container } = render(
    <I18nProvider defaultLocale="en-US">
      <TerrabrowserPage />
    </I18nProvider>
  );
  const frame = container.querySelector("iframe");
  if (!frame) {
    throw new Error("Missing game frame");
  }
  Object.defineProperty(frame, "contentWindow", {
    configurable: true,
    value: {
      terrabrowserBackup: {
        list: async () => catalog,
        export: exportSave,
      },
    },
  });
  fireEvent.load(frame);
  fireEvent.click(screen.getByRole("button", { name: "Export", exact: true }));
  await screen.findByRole("button", { name: "Export selected" });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(exportSave).not.toHaveBeenCalled();
});
