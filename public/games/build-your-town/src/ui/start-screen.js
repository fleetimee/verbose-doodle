(() => {
  if (new URLSearchParams(location.search).has("demo")) return;
  let home = true, api, screen, frame, actions;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const text = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const isHome = () => home;
  function createSettings(api) {
    const panel = document.createElement("section");
    panel.id = "home-settings";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "home-settings-title");
    panel.innerHTML = `<header class="home-panel-header"><div><div class="home-panel-kicker">Build Your Town</div><h2 id="home-settings-title">${text("Settings", "Réglages")}</h2><p>${text("Make yourself at home.", "Jouez à votre façon.")}</p></div><button type="button" class="home-panel-close" aria-label="${text("Close settings", "Fermer les réglages")}">×</button></header><div class="home-settings-tabs" role="tablist"></div><div class="home-settings-content"></div>`;
    panel.querySelector(".home-panel-close").addEventListener("click", () => { panel.hidden = true; });
    const tabs = panel.querySelector(".home-settings-tabs");
    const content = panel.querySelector(".home-settings-content");
    const pages = [];
    for (const [key, title] of [["display", text("Display", "Affichage")], ["gameplay", text("Gameplay", "Jeu")], ["preferences", text("Sound & language", "Son et langue")]]) {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `home-tab-${key}`;
      tab.textContent = title;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", `home-settings-${key}`);
      const page = document.createElement("div");
      page.id = `home-settings-${key}`;
      page.setAttribute("role", "tabpanel");
      page.setAttribute("aria-labelledby", tab.id);
      pages.push({ tab, page });
      const select = () => pages.forEach(item => {
        const selected = item.tab === tab;
        item.page.hidden = !selected;
        item.tab.setAttribute("aria-selected", String(selected));
        item.tab.tabIndex = selected ? 0 : -1;
      });
      tab.addEventListener("click", select);
      tab.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        const index = pages.findIndex(item => item.tab === tab);
        const next = pages[(index + (event.key === "ArrowRight" ? 1 : -1) + pages.length) % pages.length];
        next.tab.click(); next.tab.focus();
      });
      tabs.append(tab);
      content.append(page);
    }
    pages[0].tab.click();
    const row = (page, title, description, control) => {
      const element = document.createElement("div");
      element.className = "home-setting-row";
      const label = document.createElement("label");
      label.htmlFor = control.id;
      const name = document.createElement("span");
      name.textContent = title;
      const detail = document.createElement("small");
      detail.textContent = description;
      label.append(name, detail);
      element.append(label, control);
      page.append(element);
    };
    const toggle = (id, checked, change) => {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = id;
      input.checked = checked;
      input.setAttribute("role", "switch");
      input.addEventListener("change", () => change(input.checked));
      return input;
    };
    const originalScale = document.getElementById("game-ui-scale");
    const scale = document.createElement("input");
    scale.id = "home-ui-scale";
    scale.type = "range";
    scale.min = originalScale.min; scale.max = originalScale.max; scale.step = originalScale.step; scale.value = originalScale.value;
    row(pages[0].page, text("Interface scale", "Taille de l'interface"), text("Size of menus and controls in your city.", "Taille des menus et commandes dans votre ville."), scale);
    const output = document.createElement("output");
    output.htmlFor = scale.id;
    output.textContent = `${scale.value}%`;
    scale.parentElement.append(output);
    const syncScale = () => {
      scale.disabled = originalScale.disabled;
      scale.value = originalScale.value;
      output.textContent = `${scale.value}%`;
      scale.parentElement.querySelector("small").textContent = scale.disabled
        ? text("Fixed touch-friendly size on small screens. Map zoom stays separate.", "Taille adaptée au toucher sur petit écran. Le zoom de la carte reste indépendant.")
        : text("Size of menus and controls in your city.", "Taille des menus et commandes dans votre ville.");
    };
    window.addEventListener("resize", syncScale);
    syncScale();
    scale.addEventListener("input", () => {
      output.textContent = `${scale.value}%`;
      originalScale.value = scale.value;
      originalScale.dispatchEvent(new Event("input", { bubbles: true }));
    });
    row(pages[0].page, text("Living menu background", "Fond animé du menu"), text("Traffic and a gentle camera drift. Respects reduced motion.", "Circulation et caméra douce. Respecte la réduction des animations."), toggle("home-background-motion", localStorage.getItem("citybuilder.menuAnimation") !== "false", enabled => {
      localStorage.setItem("citybuilder.menuAnimation", String(enabled));
    }));
    const originalRotation = document.getElementById("enable-map-rotation");
    row(pages[0].page, text("Map rotation", "Rotation de la carte"), text("Enable 90° camera turns in your city.", "Activer les rotations de caméra à 90° dans votre ville."), toggle("home-map-rotation", originalRotation.checked, checked => {
      originalRotation.checked = checked; originalRotation.dispatchEvent(new Event("change", { bubbles: true }));
    }));
    const options = window.__townEncounters.getOptions();
    const frequency = document.createElement("select");
    frequency.id = "home-encounter-frequency";
    for (const [value, en, fr] of [["rare", "Occasional", "Occasionnelle"], ["normal", "Standard", "Normale"], ["frequent", "Frequent", "Fréquente"]]) {
      const option = document.createElement("option"); option.value = value; option.textContent = text(en, fr); frequency.append(option);
    }
    frequency.value = options.frequency;
    frequency.disabled = !options.enabled;
    const enabled = toggle("home-encounters", options.enabled, checked => {
      frequency.disabled = !checked;
      window.__townEncounters.setOptions({ enabled: checked, frequency: frequency.value });
      document.getElementById("enable-random-encounters").checked = checked;
      document.getElementById("encounter-frequency").disabled = !checked;
    });
    row(pages[1].page, text("Random encounters", "Événements aléatoires"), text("Mayor requests and city dilemmas during gameplay.", "Demandes au maire et décisions pendant le jeu."), enabled);
    row(pages[1].page, text("Encounter frequency", "Fréquence des événements"), text("How often your city needs a decision.", "Fréquence des décisions pour votre ville."), frequency);
    frequency.addEventListener("change", () => {
      window.__townEncounters.setOptions({ enabled: enabled.checked, frequency: frequency.value });
      document.getElementById("encounter-frequency").value = frequency.value;
    });
    const originalDisasters = document.getElementById("enable-manual-disasters");
    row(pages[1].page, text("Manual disaster response", "Intervention manuelle"), text("Dispatch firefighters and manage repairs yourself.", "Envoyez les pompiers et gérez les réparations."), toggle("home-manual-disasters", originalDisasters.checked, checked => {
      originalDisasters.checked = checked; originalDisasters.dispatchEvent(new Event("change", { bubbles: true }));
    }));
    const soundOriginal = document.getElementById("btn-sound");
    const sound = document.createElement("button");
    sound.type = "button";
    sound.id = "home-sound";
    const syncSound = () => { sound.textContent = soundOriginal.title.split(" / ")[document.documentElement.lang === "fr" ? 1 : 0]; };
    syncSound();
    sound.addEventListener("click", () => { soundOriginal.click(); syncSound(); });
    row(pages[2].page, text("Game audio", "Audio du jeu"), text("City ambience and interface sounds.", "Ambiance de la ville et sons de l'interface."), sound);
    const language = document.createElement("select");
    language.id = "home-language";
    for (const [value, label] of [["en", "English"], ["fr", "Français"]]) {
      const option = document.createElement("option"); option.value = value; option.textContent = label; language.append(option);
    }
    language.value = document.documentElement.lang;
    language.addEventListener("change", () => {
      if (language.value !== document.documentElement.lang) document.getElementById("btn-lang").click();
    });
    row(pages[2].page, text("Language", "Langue"), text("Changing language reloads the main menu.", "Changer de langue recharge le menu principal."), language);
    panel.addEventListener("keydown", event => {
      if (event.key !== "Tab") return;
      const controls = [...panel.querySelectorAll("button:not([tabindex='-1']), input:not(:disabled), select:not(:disabled)")].filter(element => element.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    document.body.append(panel);
  }
  const cityChanged = (city, key) => {
    if (!home || !key) return;
    home = false;
    cancelAnimationFrame(frame);
    screen?.remove();
    document.getElementById("home-settings")?.remove();
    document.body.classList.remove("town-home", "home-dialog");
    if (api?.renderer?.camera) api.renderer.camera.zoom = 0.5;
    if (api?.ui?.handlers?.onSpeed) api.ui.handlers.onSpeed(1);
    window.dispatchEvent(new Event("town-city-entered"));
    document.getElementById("btn-cities")?.focus();
  };

  const closeDialogs = () => {
    api?.ui?.closePanels?.();
    const toClose = ["welcome", "panel-cities", "home-settings", "modal-scenarios"];
    for (const id of toClose) {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    }
  };

  const renderStartScreen = () => {
    home = true;
    document.body.classList.add("town-home");
    document.body.classList.remove("home-dialog");

    document.getElementById("town-start-screen")?.remove();
    document.getElementById("home-settings")?.remove();

    screen = document.createElement("section");
    screen.id = "town-start-screen";
    screen.setAttribute("aria-label", text("Build Your Town main menu", "Menu principal de Build Your Town"));
    screen.innerHTML = `<div class="start-content"><div class="start-eyebrow">${text("A city of your own", "Une ville à vous")}</div><h1>Build<span>Your</span>Town</h1><p class="start-intro">${text("Every great city starts with you.", "Chaque grande ville commence avec vous.")}</p><div class="start-actions"></div><p id="start-status" role="status"></p></div><div class="start-bottom"><span>Build Your Town · v0.7.0</span><span>${text("A living city. Your next chapter.", "Une ville vivante. Votre prochain chapitre.")}</span></div>`;
    document.body.append(screen);
    createSettings(api);

    if (!document.querySelector(".home-new-title")) {
      const newCityTitle = document.createElement("h2");
      newCityTitle.className = "home-new-title";
      newCityTitle.textContent = text("New city", "Nouvelle ville");
      document.querySelector("#welcome-form .hero")?.prepend(newCityTitle);
    }

    actions = screen.querySelector(".start-actions");
    const cities = api?.cities ? api.cities() : [];
    const last = cities.find(city => city.key === api?.last?.()) ?? cities[0];

    const button = (label, description, action, primary = false) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = primary ? "start-action primary-action" : "start-action";
      const title = document.createElement("span");
      title.className = "start-action-title";
      title.textContent = label;
      element.append(title);
      if (description) {
        const detail = document.createElement("span");
        detail.className = "start-action-detail";
        detail.textContent = description;
        element.append(detail);
      }
      const arrow = document.createElement("span");
      arrow.className = "start-action-arrow";
      arrow.textContent = "→";
      arrow.setAttribute("aria-hidden", "true");
      element.append(arrow);
      element.addEventListener("click", action);
      actions.append(element);
      return element;
    };

    if (last) button(text("Continue", "Continuer"), `${last.name} · ${last.pop.toLocaleString()} ${text("residents", "habitants")}`, () => {
      api.ui.handlers.onLoadCity(last.key);
    }, true);

    const open = action => {
      document.body.classList.add("home-dialog");
      api.ui.handlers.onSpeed(0);
      action();
    };

    button(text("Sandbox city", "Ville bac à sable"), text("Custom map & free city building", "Carte personnalisée et construction libre"), () => open(() => api.ui.openWelcome(false)), !last);
    button(text("Career scenarios", "Scénarios de carrière"), text("Planet Coaster style crisis progression", "Défis de crise et médailles à débloquer"), () => open(() => {
      if (window.__openScenarioModal) window.__openScenarioModal();
    }));
    button(text("Load city", "Charger une ville"), text("Browse cities or import a save", "Parcourez vos villes ou importez une sauvegarde"), () => open(() => {
      api.ui.setCityList(api.cities(), null);
      document.getElementById("btn-cities").click();
    }));
    button(text("Settings", "Réglages"), text("Sound, language & interface", "Son, langue et interface"), () => open(() => {
      document.getElementById("home-settings").hidden = false;
      document.querySelector("#home-settings .home-panel-close").focus();
    }));

    const back = document.createElement("button");
    back.id = "start-back";
    back.type = "button";
    back.textContent = text("← Back to main menu", "← Retour au menu principal");
    screen.append(back);
    back.addEventListener("click", closeDialogs);

    cancelAnimationFrame(frame);
    if (api?.renderer?.camera) {
      api.renderer.camera.zoom = 0.8;
      const origin = { ...api.renderer.camera };
      const start = performance.now();
      const drift = time => {
        if (!home) return;
        if (!reducedMotion.matches && localStorage.getItem("citybuilder.menuAnimation") !== "false" && !document.body.classList.contains("home-dialog")) {
          const elapsed = (time - start) / 1000;
          api.renderer.camera.x = origin.x + Math.sin(elapsed / 25) * 100;
          api.renderer.camera.y = origin.y + Math.sin(elapsed / 32) * 35;
        }
        frame = requestAnimationFrame(drift);
      };
      frame = requestAnimationFrame(drift);
    }

    if (reducedMotion.matches || localStorage.getItem("citybuilder.menuAnimation") === "false") {
      api?.ui?.handlers?.onSpeed?.(0);
    } else {
      api?.ui?.handlers?.onSpeed?.(1);
    }

    actions.querySelector("button")?.focus();
  };

  const returnToHome = () => {
    if (home) return;

    // 1. Dispatch pagehide to trigger auto-save in engine
    window.dispatchEvent(new Event("pagehide"));

    // 2. Close any open panels, dialogs, and flyouts
    api?.ui?.closePanels?.();
    const toClose = [
      "welcome", "panel-cities", "home-settings", "modal-scenarios",
      "panel-missions", "panel-budget", "panel-journal", "demand-pop",
      "maps-menu", "flyout", "query", "view-settings", "panel-cheats",
      "topbar-popup"
    ];
    for (const id of toClose) {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    }

    // 3. Render fresh start screen
    renderStartScreen();
    window.dispatchEvent(new Event("town-returned-home"));
  };

  function ready(value, initialized = false) {
    if (!initialized && document.readyState !== "complete") {
      document.addEventListener("DOMContentLoaded", () => ready(value, true), { once: true });
      return;
    }
    api = value;
    renderStartScreen();
    window.__townLoading?.finish();
    for (const name of ["onNewCity", "onLoadCity"]) {
      const handler = api.ui.handlers[name];
      api.ui.handlers[name] = (...args) => window.__townLoading.run(() => {
        handler(...args);
        if (name === "onLoadCity" && home) document.getElementById("start-status").textContent = text("This save could not be opened. Choose another city or import a backup.", "Cette sauvegarde ne peut pas être ouverte. Choisissez une autre ville ou importez une sauvegarde.");
      });
    }

    const dialogs = ["welcome", "panel-cities", "home-settings", "modal-scenarios"].map(id => document.getElementById(id)).filter(Boolean);
    new MutationObserver(() => {
      if (!home || dialogs.some(dialog => !dialog.hidden)) return;
      document.body.classList.remove("home-dialog");
      api?.ui?.handlers?.onSpeed?.(reducedMotion.matches || localStorage.getItem("citybuilder.menuAnimation") === "false" ? 0 : 1);
      actions?.querySelector("button")?.focus();
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["hidden"] });

    window.addEventListener("keydown", event => {
      if (!home || document.querySelector("#town-confirmation[open]")) return;
      if (event.key === "Escape") { closeDialogs(); event.preventDefault(); event.stopImmediatePropagation(); return; }
      if (!document.body.classList.contains("home-dialog") && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const choices = [...(actions ? actions.querySelectorAll("button:not(:disabled)") : [])];
        const current = choices.indexOf(document.activeElement);
        let next;
        if (event.key === "Home") next = 0;
        else if (event.key === "End") next = choices.length - 1;
        else {
          const direction = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1;
          next = current === -1 ? direction > 0 ? 0 : choices.length - 1 : (current + direction + choices.length) % choices.length;
        }
        choices[next]?.focus();
        return;
      }

      if (event.target.getAttribute("role") === "tab") return;
      if (!["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) && !["Tab", "Enter"].includes(event.key)) event.stopImmediatePropagation();
    }, true);
  }
  window.__townStartScreen = { ready, cityChanged, isHome, returnToHome };
})();
