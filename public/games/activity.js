(() => {
  const keys = new Set();
  const pointers = new Set();
  let lastActivity = Number.NEGATIVE_INFINITY;

  const reportActivity = () => {
    if (document.visibilityState !== "visible" || !document.hasFocus()) {
      return;
    }
    const now = Date.now();
    if (now - lastActivity < 1000) {
      return;
    }
    lastActivity = now;
    window.parent.postMessage({ type: "fleetime-game-activity" }, "*");
  };

  window.addEventListener(
    "keydown",
    (event) => {
      keys.add(event.code);
      reportActivity();
    },
    { capture: true }
  );
  window.addEventListener("keyup", (event) => keys.delete(event.code), {
    capture: true,
  });
  window.addEventListener(
    "pointerdown",
    (event) => {
      pointers.add(event.pointerId);
      reportActivity();
    },
    { capture: true, passive: true }
  );
  for (const type of ["pointerup", "pointercancel"]) {
    window.addEventListener(type, (event) => pointers.delete(event.pointerId), {
      capture: true,
    });
  }
  for (const type of [
    "pointermove",
    "touchstart",
    "touchmove",
    "wheel",
    "scroll",
  ]) {
    window.addEventListener(type, reportActivity, {
      capture: true,
      passive: true,
    });
  }
  const clearHeldInput = () => {
    keys.clear();
    pointers.clear();
  };
  window.addEventListener("blur", clearHeldInput);
  document.addEventListener("visibilitychange", clearHeldInput);

  window.setInterval(() => {
    if (document.visibilityState !== "visible" || !document.hasFocus()) {
      return;
    }
    const gamepads = navigator.getGamepads?.() ?? [];
    const activeGamepad = Array.from(gamepads).some(
      (pad) =>
        pad &&
        (pad.buttons.some((button) => button.pressed) ||
          pad.axes.some((axis) => Math.abs(axis) > 0.2))
    );
    if (keys.size > 0 || pointers.size > 0 || activeGamepad) {
      reportActivity();
    }
  }, 1000);
})();
