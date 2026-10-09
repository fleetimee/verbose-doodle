import Guacamole from "guacamole-common-js";

const POINTER_EVENTS = ["mousedown", "mouseup", "mousemove"];
const CONTROL = 0xff_e3;
const ALT = 0xff_e9;
const DELETE = 0xff_ff;

export function createDesktopInput(
  client: Guacamole.Client,
  element: HTMLElement,
  label: string,
  releaseFocus: () => void
) {
  const input = document.createElement("textarea");
  input.className = "sr-only";
  input.setAttribute("aria-label", label);
  input.setAttribute("aria-describedby", "rdp-desktop-help");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("autocomplete", "off");
  input.spellcheck = false;
  input.disabled = true;
  element.append(input);
  const keyboard = new Guacamole.Keyboard(input);
  const display = client.getDisplay();
  const mouse = new Guacamole.Mouse(display.getElement());
  const touch = new Guacamole.Mouse.Touchscreen(display.getElement());
  let enabled = false;

  const focus = () => input.focus({ preventScroll: true });
  const reset = () => {
    keyboard.reset();
    mouse.reset();
    touch.reset();
  };
  const releaseKeyboard = (event: KeyboardEvent) => {
    if (event.key === "Escape" && event.shiftKey) {
      event.preventDefault();
      event.stopImmediatePropagation();
      reset();
      releaseFocus();
    }
  };
  element.addEventListener("keydown", releaseKeyboard, true);
  input.addEventListener("blur", reset);
  window.addEventListener("blur", reset);
  keyboard.onkeydown = (keysym) => {
    if (!enabled) {
      return true;
    }
    client.sendKeyEvent(1, keysym);
    return false;
  };
  keyboard.onkeyup = (keysym) => {
    if (enabled) {
      client.sendKeyEvent(0, keysym);
    }
  };
  const pointer: Guacamole.Event.TargetListener = (event) => {
    if (!(enabled && event instanceof Guacamole.Mouse.Event)) {
      return;
    }
    if (event.type === "mousedown") {
      focus();
    }
    client.sendMouseState(event.state, true);
  };
  mouse.onEach(POINTER_EVENTS, pointer);
  touch.onEach(POINTER_EVENTS, pointer);
  display.oncursor = (canvas, x, y) => {
    display.showCursor(!mouse.setCursor(canvas, x, y));
  };

  return {
    focus,
    reset,
    enable: () => {
      enabled = true;
      input.disabled = false;
    },
    disable: () => {
      reset();
      enabled = false;
      input.disabled = true;
    },
    sendCtrlAltDelete: () => {
      if (!enabled) {
        return;
      }
      reset();
      for (const keysym of [CONTROL, ALT, DELETE]) {
        client.sendKeyEvent(1, keysym);
      }
      for (const keysym of [DELETE, ALT, CONTROL]) {
        client.sendKeyEvent(0, keysym);
      }
      focus();
    },
    dispose: () => {
      reset();
      enabled = false;
      keyboard.onkeydown = null;
      keyboard.onkeyup = null;
      display.oncursor = null;
      mouse.offEach(POINTER_EVENTS, pointer);
      touch.offEach(POINTER_EVENTS, pointer);
      element.removeEventListener("keydown", releaseKeyboard, true);
      input.removeEventListener("blur", reset);
      window.removeEventListener("blur", reset);
      input.remove();
    },
  };
}
