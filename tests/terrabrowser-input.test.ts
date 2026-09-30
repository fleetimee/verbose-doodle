import { expect, test } from "bun:test";

const inputModulePath = "../public/games/terrabrowser/src/input.js";
const { createInput } = await import(inputModulePath);

test("clicking a name field focuses the canvas so keyboard text reaches the game", () => {
  const canvas = document.createElement("canvas");
  canvas.tabIndex = 0;
  document.body.append(canvas);
  const input = createInput(canvas);
  let name = "";
  input.text = (event: KeyboardEvent) => {
    if (event.key.length === 1) {
      name += event.key;
      return true;
    }
    return false;
  };

  canvas.dispatchEvent(
    new MouseEvent("mousedown", { button: 0, bubbles: true, cancelable: true })
  );
  expect(document.activeElement).toBe(canvas);
  document.activeElement?.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "A",
      code: "KeyA",
      bubbles: true,
      cancelable: true,
    })
  );
  expect(name).toBe("A");
  expect(input.isDown("KeyA")).toBe(false);
});
