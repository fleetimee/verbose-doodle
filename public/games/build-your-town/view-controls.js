(() => {
  const key = "citybuilder.uiScale";
  const text = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const button = (label, path) => {
    const element = document.createElement("button");
    element.type = "button";
    element.title = label;
    element.setAttribute("aria-label", label);
    element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
    return element;
  };
  document.addEventListener("DOMContentLoaded", () => {
    let scale = 100;
    try { scale = Number(localStorage.getItem(key)) || 100; } catch {}
    scale = Math.max(75, Math.min(125, scale));
    const apply = (value) => {
      scale = value;
      document.documentElement.style.setProperty("--game-ui-scale", String(scale / 100));
      try { localStorage.setItem(key, String(scale)); } catch {}
      window.dispatchEvent(new Event("resize"));
    };
    const settings = button(text("Interface settings", "Réglages de l'interface"), "M4 7h16M4 17h16M9 4v6m6 4v6");
    settings.id = "btn-view-settings";
    settings.setAttribute("aria-expanded", "false");
    settings.setAttribute("aria-controls", "view-settings");
    document.querySelector("#topbar .group.menus").append(settings);
    const panel = document.createElement("section");
    panel.id = "view-settings";
    panel.hidden = true;
    const heading = document.createElement("h2");
    heading.textContent = text("Interface settings", "Réglages de l'interface");
    const close = button(text("Close settings", "Fermer les réglages"), "m6 6 12 12M6 18 18 6");
    const header = document.createElement("div");
    header.className = "view-settings-head";
    header.append(heading, close);
    const label = document.createElement("label");
    label.htmlFor = "game-ui-scale";
    label.textContent = text("UI scale", "Taille de l'interface");
    const output = document.createElement("output");
    output.htmlFor = "game-ui-scale";
    output.textContent = `${scale}%`;
    const range = document.createElement("input");
    range.id = "game-ui-scale";
    range.type = "range";
    range.min = "75";
    range.max = "125";
    range.step = "5";
    range.value = String(scale);
    range.addEventListener("input", () => {
      output.textContent = `${range.value}%`;
      apply(Number(range.value));
    });
    const note = document.createElement("p");
    note.textContent = text("Resize menus and controls. Map zoom stays separate.", "Redimensionnez les menus et commandes. Le zoom de la carte reste indépendant.");
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = text("Reset to 100%", "Rétablir à 100 %");
    reset.addEventListener("click", () => { range.value = "100"; output.textContent = "100%"; apply(100); });
    const row = document.createElement("div");
    row.className = "view-scale-label";
    row.append(label, output);
    panel.append(header, row, range, note, reset);
    document.body.append(panel);
    const hide = () => { panel.hidden = true; settings.setAttribute("aria-expanded", "false"); };
    close.addEventListener("click", () => { hide(); settings.focus(); });
    settings.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      settings.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) range.focus();
    });
    document.addEventListener("pointerdown", event => { if (!panel.contains(event.target) && !settings.contains(event.target)) hide(); });
    panel.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.stopPropagation(); hide(); settings.focus(); }
    });
    const minus = button(text("Zoom out", "Dézoomer"), "M5 12h14");
    const plus = button(text("Zoom in", "Zoomer"), "M5 12h14M12 5v14");
    const zoom = document.createElement("span");
    zoom.id = "minimap-zoom";
    zoom.append(minus, plus);
    document.querySelector("#minimap .head").append(zoom);
    for (const [control, direction] of [[minus, -1], [plus, 1]]) {
      control.addEventListener("click", event => {
        event.stopPropagation();
        window.__townView?.zoom(direction);
        sync();
      });
    }
    const sync = () => {
      const value = window.__townView?.getZoom();
      minus.disabled = value === undefined || value <= 0.25;
      plus.disabled = value === undefined || value >= 2;
    };
    document.addEventListener("wheel", sync, { passive: true });
    document.addEventListener("pointerup", sync);
    window.addEventListener("resize", sync);
    // Camera zoom can also change through touch gestures or city loading.
    window.setInterval(sync, 500);
    apply(scale);
    sync();
  });
})();
