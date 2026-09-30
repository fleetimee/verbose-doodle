import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const script = readFileSync("public/games/activity.js", "utf8");

function createGame() {
  const listeners = new Map<string, (event?: unknown) => void>();
  const messages: unknown[] = [];
  let now = 0;
  let focused = true;
  let tick = () => {};
  let pads: unknown[] = [];
  const document = {
    visibilityState: "visible",
    hasFocus: () => focused,
    addEventListener: (type: string, handler: () => void) =>
      listeners.set(type, handler),
  };
  runInNewContext(script, {
    Date: { now: () => now },
    document,
    navigator: { getGamepads: () => pads },
    window: {
      parent: { postMessage: (message: unknown) => messages.push(message) },
      addEventListener: (type: string, handler: () => void) =>
        listeners.set(type, handler),
      setInterval: (handler: () => void) => {
        tick = handler;
      },
    },
  });
  return {
    messages,
    document,
    input: (type: string, event?: unknown) => listeners.get(type)?.(event),
    advance: () => {
      now += 1000;
      tick();
    },
    setFocus: (value: boolean) => {
      focused = value;
    },
    setPads: (value: unknown[]) => {
      pads = value;
    },
  };
}

describe("game activity bridge", () => {
  test("reports held input and stops after release or blur", () => {
    const game = createGame();
    game.input("keydown", { code: "KeyW" });
    expect(game.messages).toHaveLength(1);
    game.advance();
    expect(game.messages).toHaveLength(2);
    game.input("keyup", { code: "KeyW" });
    game.advance();
    expect(game.messages).toHaveLength(2);
    game.input("pointerdown", { pointerId: 1 });
    expect(game.messages).toHaveLength(3);
    game.input("blur");
    game.advance();
    expect(game.messages).toHaveLength(3);
  });

  test("gamepad input counts only while focused and visible, with a drift deadzone", () => {
    const game = createGame();
    game.setPads([{ buttons: [{ pressed: false }], axes: [0.1] }]);
    game.advance();
    expect(game.messages).toHaveLength(0);
    game.setPads([{ buttons: [{ pressed: true }], axes: [0] }]);
    game.advance();
    expect(game.messages).toHaveLength(1);
    game.setFocus(false);
    game.advance();
    expect(game.messages).toHaveLength(1);
    game.setFocus(true);
    game.document.visibilityState = "hidden";
    game.advance();
    expect(game.messages).toHaveLength(1);
  });
});
