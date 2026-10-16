(() => {
  const compact = matchMedia("(max-width: 900px), (pointer: coarse) and (max-width: 1024px)");
  const touch = matchMedia("(pointer: coarse)");
  const viewport = window.visualViewport;
  function resize() {
    const root = document.documentElement;
    const useViewport = compact.matches && viewport && viewport.scale <= 1.05;
    root.style.setProperty("--town-viewport-height", useViewport ? `${viewport.height}px` : "100dvh");
    root.style.setProperty("--town-viewport-top", useViewport ? `${viewport.offsetTop}px` : "0px");
  }
  viewport?.addEventListener("resize", resize);
  viewport?.addEventListener("scroll", resize);
  window.addEventListener("resize", resize);
  resize();
  window.__townMobile = {
    focusWelcome(input) {
      // Leave the map choices visible until a touch player asks for the keyboard.
      (compact.matches && touch.matches ? document.getElementById("welcome-form") : input).focus({ preventScroll: true });
    },
    bindInput(canvas) {
      const pointers = new Map();
      const cancel = pointer => {
        pointers.delete(pointer.pointerId);
        canvas.dispatchEvent(new PointerEvent("pointercancel", {
          pointerId: pointer.pointerId, pointerType: pointer.pointerType,
          clientX: pointer.clientX, clientY: pointer.clientY, button: pointer.button,
        }));
        if (canvas.hasPointerCapture(pointer.pointerId)) canvas.releasePointerCapture(pointer.pointerId);
      };
      canvas.addEventListener("pointerdown", event => pointers.set(event.pointerId, event));
      // A pending capture can be released before the browser emits a lost-capture event.
      for (const type of ["pointermove", "pointerup"]) {
        canvas.addEventListener(type, event => {
          const pointer = pointers.get(event.pointerId);
          if (pointer && !canvas.hasPointerCapture(event.pointerId)) {
            cancel(pointer);
            event.stopImmediatePropagation();
          }
        }, true);
      }
      for (const type of ["pointerup", "pointercancel"]) {
        canvas.addEventListener(type, event => pointers.delete(event.pointerId));
      }
      canvas.addEventListener("lostpointercapture", event => {
        const pointer = pointers.get(event.pointerId);
        if (pointer) cancel(pointer);
      });
      const cancelAll = () => { for (const pointer of [...pointers.values()]) cancel(pointer); };
      window.addEventListener("blur", cancelAll);
      document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAll(); });
    },
  };
})();
