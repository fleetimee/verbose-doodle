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
    const graphics = window.__townGraphics;
    const graphicsSection = document.createElement("section");
    graphicsSection.className = "view-rotation-settings graphics-settings";
    const graphicsLabel = document.createElement("label");
    graphicsLabel.htmlFor = "graphics-quality";
    const quality = document.createElement("select");
    quality.id = "graphics-quality";
    quality.setAttribute("aria-describedby", "graphics-note graphics-status");
    const options = [["auto", "Auto", "Auto"], ["low", "Low", "Faible"], ["medium", "Medium", "Moyenne"],
      ["high", "High", "Élevée"], ["custom", "Custom", "Personnalisée"]];
    for (const [value] of options) {
      const option = document.createElement("option");
      option.value = value;
      quality.append(option);
    }
    const graphicsNote = document.createElement("p");
    graphicsNote.id = "graphics-note";
    const graphicsStatus = document.createElement("p");
    graphicsStatus.id = "graphics-status";
    graphicsStatus.setAttribute("role", "status");
    const sliders = document.createElement("div");
    sliders.className = "graphics-sliders";
    const controls = [];
    for (const [name, en, fr, min, max, step] of [
      ["resolution", "Render resolution", "Résolution de rendu", 0.75, 2, 0.25],
      ["fps", "Frame-rate limit", "Limite d’images par seconde", 15, 60, 5],
      ["effects", "Visual effects", "Effets visuels", 0, 2, 1],
    ]) {
      const row = document.createElement("div");
      row.className = "view-scale-label";
      const label = document.createElement("label");
      label.htmlFor = `graphics-${name}`;
      const output = document.createElement("output");
      output.htmlFor = label.htmlFor;
      const input = document.createElement("input");
      input.id = label.htmlFor;
      input.type = "range";
      input.min = String(min); input.max = String(max); input.step = String(step);
      input.addEventListener("input", () => graphics.setCustom({ [name]: Number(input.value) }));
      row.append(label, output);
      sliders.append(row, input);
      controls.push({ name, en, fr, label, output, input });
    }
    const syncGraphics = () => {
      const state = graphics.state();
      graphicsLabel.textContent = text("Graphics quality", "Qualité graphique");
      options.forEach(([, en, fr], index) => { quality.options[index].textContent = text(en, fr); });
      quality.value = state.mode;
      graphicsNote.textContent = text("Auto adapts to performance. Adjust a slider for Custom. City simulation stays unchanged.",
        "Auto s’adapte aux performances. Un curseur active le mode personnalisé. La simulation reste inchangée.");
      const names = [text("Low", "Faible"), text("Medium", "Moyenne"), text("High", "Élevée")];
      graphicsStatus.textContent = state.mode === "auto" ? text(`Auto is using ${names[["low", "medium", "high"].indexOf(state.tier)]} quality.`,
        `Auto utilise la qualité ${names[["low", "medium", "high"].indexOf(state.tier)].toLowerCase()}.`) : "";
      graphicsStatus.hidden = state.mode !== "auto";
      for (const { name, en, fr, label, output, input } of controls) {
        label.textContent = text(en, fr);
        input.value = String(state[name]);
        const value = name === "resolution" ? `${Math.round(state[name] * 100)}%` : name === "fps" ? `${state[name]} ${text("FPS", "i/s")}` : names[state[name]];
        output.textContent = value;
        input.setAttribute("aria-valuetext", value);
      }
    };
    quality.addEventListener("change", () => graphics.setMode(quality.value));
    graphicsSection.append(graphicsLabel, quality, graphicsNote, graphicsStatus, sliders);
    panel.append(graphicsSection);
    window.addEventListener("town-graphics-change", syncGraphics);
    new MutationObserver(syncGraphics).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    syncGraphics();
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
    const rotateLeft = button(text("Rotate map left 90°", "Tourner la carte à gauche de 90°"), "M3 10a9 9 0 1 1 2 8M3 4v6h6");
    const rotateRight = button(text("Rotate map right 90°", "Tourner la carte à droite de 90°"), "M21 10a9 9 0 1 0-2 8M21 4v6h-6");
    const angle = document.createElement("output");
    angle.id = "settings-map-angle";
    angle.textContent = "0°";
    angle.setAttribute("aria-label", text("Camera rotation", "Rotation de la caméra"));
    angle.setAttribute("aria-live", "polite");
    rotateLeft.addEventListener("click", event => { event.stopPropagation(); window.__mapRotation?.rotate(-1); });
    rotateRight.addEventListener("click", event => { event.stopPropagation(); window.__mapRotation?.rotate(1); });
    window.addEventListener("town-view-rotation", event => { angle.textContent = `${event.detail}°`; });
    const rotations = document.createElement("div");
    rotations.id = "settings-map-rotation";
    rotations.append(rotateLeft, angle, rotateRight);
    document.querySelector("#minimap .head").append(zoom);
    const rotationSection = document.createElement("section");
    rotationSection.className = "view-rotation-settings";
    const rotationLabel = document.createElement("label");
    rotationLabel.className = "view-rotation-toggle";
    const enableRotation = document.createElement("input");
    enableRotation.type = "checkbox";
    enableRotation.id = "enable-map-rotation";
    try { enableRotation.checked = localStorage.getItem("citybuilder.mapRotation") === "true"; } catch {}
    rotationLabel.append(enableRotation, document.createTextNode(text("Enable map rotation", "Activer la rotation de la carte")));
    const rotationNote = document.createElement("p");
    rotationNote.textContent = text("Turn the camera in 90° steps. Disabling restores the original view.", "Tournez la caméra par pas de 90°. Désactiver rétablit la vue d'origine.");
    const applyRotation = () => {
      window.__mapRotation?.setEnabled(enableRotation.checked);
      rotateLeft.disabled = rotateRight.disabled = !enableRotation.checked;
      rotations.hidden = !enableRotation.checked;
      try { localStorage.setItem("citybuilder.mapRotation", String(enableRotation.checked)); } catch {}
    };
    enableRotation.addEventListener("change", applyRotation);
    rotationSection.append(rotationLabel, rotationNote, rotations);
    panel.append(rotationSection);
    applyRotation();
    const disasterSection = document.createElement("section");
    disasterSection.className = "view-rotation-settings";
    const disasterLabel = document.createElement("label");
    disasterLabel.className = "view-rotation-toggle";
    const manualDisasters = document.createElement("input");
    manualDisasters.type = "checkbox";
    manualDisasters.id = "enable-manual-disasters";
    try { manualDisasters.checked = localStorage.getItem("citybuilder.manualDisasters") === "true"; } catch {}
    disasterLabel.append(manualDisasters, document.createTextNode(text("Manual disaster response", "Intervention manuelle")));
    const disasterNote = document.createElement("p");
    disasterNote.textContent = text("Require firefighter dispatch and track storm repairs. Off uses automatic fire response.", "Envoyez les pompiers et suivez les réparations. Désactivé, les pompiers interviennent automatiquement.");
    const applyDisasters = () => {
      window.__disasterRecovery?.setManual(manualDisasters.checked);
      try { localStorage.setItem("citybuilder.manualDisasters", String(manualDisasters.checked)); } catch {}
    };
    manualDisasters.addEventListener("change", applyDisasters);
    disasterSection.append(disasterLabel, disasterNote);
    panel.append(disasterSection);
    applyDisasters();
    const encounterSection = document.createElement("section");
    encounterSection.className = "view-rotation-settings";
    const encounterLabel = document.createElement("label");
    encounterLabel.className = "view-rotation-toggle";
    const enabledEncounters = document.createElement("input");
    enabledEncounters.type = "checkbox";
    enabledEncounters.id = "enable-random-encounters";
    const encounterOptions = window.__townEncounters.getOptions();
    enabledEncounters.checked = encounterOptions.enabled;
    encounterLabel.append(enabledEncounters, document.createTextNode(text("Random encounters", "Événements aléatoires")));
    const frequencyLabel = document.createElement("label");
    frequencyLabel.htmlFor = "encounter-frequency";
    frequencyLabel.textContent = text("Frequency", "Fréquence");
    const frequency = document.createElement("select");
    frequency.id = "encounter-frequency";
    for (const [value, en, fr] of [["rare", "Occasional", "Occasionnelle"], ["normal", "Standard", "Normale"], ["frequent", "Frequent", "Fréquente"]]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text(en, fr);
      frequency.append(option);
    }
    frequency.value = encounterOptions.frequency;
    frequency.disabled = !enabledEncounters.checked;
    const encounterNote = document.createElement("p");
    encounterNote.textContent = text("Mayor requests and city dilemmas during gameplay. Never shown on the main menu.", "Demandes au maire et décisions pendant le jeu. Jamais dans le menu principal.");
    const updateEncounters = () => {
      frequency.disabled = !enabledEncounters.checked;
      window.__townEncounters.setOptions({ enabled: enabledEncounters.checked, frequency: frequency.value });
    };
    enabledEncounters.addEventListener("change", updateEncounters);
    frequency.addEventListener("change", updateEncounters);
    encounterSection.append(encounterLabel, frequencyLabel, frequency, encounterNote);
    panel.append(encounterSection);

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
