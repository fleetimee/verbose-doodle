(() => {
  // Optional auto-hide for the build toolbar. Collapsed by default when enabled; hover/tap the edge handle to reveal.
  const key = "citybuilder.autoHideToolbar";
  const idleDelay = 3500;
  let enabled = false;
  let collapsed = false;
  let hovering = false;
  let lastActive = 0;
  let handle;

  const toolbar = () => document.getElementById("toolbar");
  const flyoutOpen = () => {
    const flyout = document.getElementById("flyout");
    return !!flyout && !flyout.hidden;
  };
  const sync = () => {
    document.body.classList.toggle("toolbar-autohide", enabled);
    document.body.classList.toggle("toolbar-collapsed", enabled && collapsed);
    if (handle) handle.hidden = !(enabled && collapsed);
    window.dispatchEvent(new Event("resize"));
  };
  const setCollapsed = (value) => {
    if (collapsed === value) return;
    collapsed = value;
    sync();
  };
  const touch = () => { lastActive = performance.now(); };
  const reveal = () => { touch(); setCollapsed(false); };

  const ensureHandle = () => {
    if (handle) return;
    handle = document.createElement("button");
    handle.type = "button";
    handle.id = "toolbar-handle";
    handle.hidden = true;
    const label = document.documentElement.lang === "fr" ? "Afficher la barre d’outils" : "Show toolbar";
    handle.title = label;
    handle.setAttribute("aria-label", label);
    handle.setAttribute("aria-controls", "toolbar");
    handle.textContent = "";
    handle.addEventListener("pointerenter", reveal);
    handle.addEventListener("click", reveal);
    document.body.append(handle);
    const bar = toolbar();
    if (bar) {
      bar.addEventListener("pointerenter", () => { hovering = true; touch(); });
      bar.addEventListener("pointerleave", () => { hovering = false; touch(); });
      bar.addEventListener("pointerdown", touch);
      bar.addEventListener("focusin", touch);
      bar.addEventListener("scroll", touch, { passive: true });
      bar.addEventListener("transitionend", event => {
        if (event.target === bar && event.propertyName === "transform") {
          window.dispatchEvent(new Event("resize"));
        }
      });
    }
    window.setInterval(() => {
      if (!enabled || collapsed) return;
      const bar = toolbar();
      const focused = !!bar && bar.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
      if (hovering || focused || flyoutOpen()) { touch(); return; }
      if (performance.now() - lastActive > idleDelay) setCollapsed(true);
    }, 400);
  };

  function setEnabled(value, persist = true) {
    enabled = !!value;
    if (persist) {
      try { localStorage.setItem(key, String(enabled)); } catch {}
    }
    ensureHandle();
    touch();
    collapsed = enabled && !hovering && !flyoutOpen() ? collapsed : false;
    sync();
  }

  function isEnabled() {
    return enabled;
  }

  function init() {
    let saved = false;
    try { saved = localStorage.getItem(key) === "true"; } catch {}
    enabled = saved;
    ensureHandle();
    touch();
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.__toolbarAutohide = { setEnabled, isEnabled };
})();
