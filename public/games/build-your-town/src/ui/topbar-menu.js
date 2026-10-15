(() => {
  const text = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const icon = path => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
  document.addEventListener("DOMContentLoaded", () => {
    const menus = document.querySelector("#topbar .menus");
    const speed = document.querySelector("#speed");
    const controls = [...speed.querySelectorAll("button[data-speed]")];
    const actions = [
      ["btn-missions", text("Career & objectives", "Carrière et objectifs"), "M12 3 3 7l9 4 9-4-9-4ZM3 12l9 4 9-4M3 17l9 4 9-4"],
      ["btn-view-settings", text("Interface settings", "Réglages de l'interface"), "M4 7h16M4 17h16M9 4v6m6 4v6"],
      ["btn-sound", text("Sound", "Son"), "M11 5 6 9H3v6h3l5 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"],
      ["btn-lang", text("Language", "Langue"), "M3 5h12M9 3v2m-4 3c2 4 5 7 9 9M13 5c-1 5-4 9-10 12m11 3 4-10 4 10m-6-3h4"],
      ["btn-help", text("Help & controls", "Aide et commandes"), "M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5m0 4h.01"],
      ["btn-cheats", text("Cheats", "Triches"), "m13 3-9 11h7l-1 7 10-12h-8l1-6Z"],
    ];
    for (const original of [...actions.map(([id]) => document.getElementById(id)), ...controls]) {
      original.classList.add("topbar-secondary");
      original.setAttribute("aria-hidden", "true");
      original.tabIndex = -1;
    }
    const menu = document.createElement("button");
    menu.type = "button";
    menu.id = "btn-game-menu";
    menu.innerHTML = icon("M4 6h16M4 12h16M4 18h16");
    menu.setAttribute("aria-label", text("Game menu", "Menu du jeu"));
    menu.title = text("Game menu", "Menu du jeu");
    menus.append(menu);
    const play = document.createElement("button");
    play.type = "button";
    play.id = "btn-play-toggle";
    const rate = document.createElement("button");
    rate.type = "button";
    rate.id = "btn-speed-menu";
    const status = document.createElement("span");
    status.id = "simulation-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    document.body.append(status);
    speed.append(play, rate);
    const popup = document.createElement("div");
    popup.id = "topbar-popup";
    popup.hidden = true;
    popup.setAttribute("role", "group");
    document.body.append(popup);
    let trigger, lastSpeed = 1;
    const close = (focus = false) => {
      popup.hidden = true;
      trigger?.setAttribute("aria-expanded", "false");
      if (focus) trigger?.focus();
    };
    const activeSpeed = () => Number(controls.find(button => button.classList.contains("active"))?.dataset.speed ?? 1);
    const sync = () => {
      const value = activeSpeed();
      if (value) lastSpeed = value;
      play.innerHTML = value ? icon("M8 5v14M16 5v14") : icon("m8 5 11 7-11 7V5Z");
      play.setAttribute("aria-label", value ? text("Pause simulation", "Mettre en pause") : text("Resume simulation", "Reprendre la simulation"));
      play.title = play.getAttribute("aria-label");
      const paused = value === 0;
      const label = text("Paused", "En pause");
      if (status.textContent !== label) status.textContent = label;
      status.hidden = !paused;
      if (play.classList.contains("is-paused") !== paused) play.classList.toggle("is-paused", paused);
      rate.innerHTML = `<span>${[0, 1, 2, 4][lastSpeed]}×</span>${icon("m8 10 4 4 4-4")}`;
      rate.setAttribute("aria-label", text("Simulation speed", "Vitesse de simulation") + `: ${[0, 1, 2, 4][lastSpeed]}×`);
    };
    new MutationObserver(sync).observe(speed, { subtree: true, attributes: true, attributeFilter: ["class"] });
    play.addEventListener("click", () => {
      close();
      controls.find(button => Number(button.dataset.speed) === (activeSpeed() ? 0 : lastSpeed)).click();
    });
    const open = (button, title) => {
      if (!popup.hidden && trigger === button) { close(true); return false; }
      close();
      trigger = button;
      popup.replaceChildren();
      popup.setAttribute("aria-label", title);
      const heading = document.createElement("div");
      heading.className = "topbar-popup-heading";
      heading.textContent = title;
      popup.append(heading);
      popup.hidden = false;
      button.setAttribute("aria-expanded", "true");
      const bounds = button.getBoundingClientRect();
      popup.style.right = `${Math.max(8, innerWidth - bounds.right)}px`;
      return true;
    };
    for (const button of [menu, rate]) {
      button.setAttribute("aria-controls", popup.id);
      button.setAttribute("aria-haspopup", "true");
      button.setAttribute("aria-expanded", "false");
    }
    menu.addEventListener("click", () => {
      if (!open(menu, text("Game menu", "Menu du jeu"))) return;
      for (const [id, label, path] of actions) {
        const original = document.getElementById(id);
        if (!original) continue;
        const row = document.createElement("button");
        row.type = "button";
        row.innerHTML = icon(path);
        const name = document.createElement("span");
        name.textContent = label;
        row.append(name);
        row.title = original.title;
        row.disabled = original.disabled;
        row.addEventListener("click", () => { close(true); original.click(); });
        popup.append(row);
      }
      const homeRow = document.createElement("button");
      homeRow.type = "button";
      homeRow.innerHTML = icon("M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H4a1 1 0 0 1-1-1V9.5Z");
      const homeName = document.createElement("span");
      homeName.textContent = text("Main menu", "Menu principal");
      homeRow.append(homeName);
      homeRow.title = text("Return to main menu", "Retourner au menu principal");
      homeRow.addEventListener("click", async () => {
        close(true);
        if (window.__townDialogs?.confirmReturnHome) {
          const confirmed = await window.__townDialogs.confirmReturnHome();
          if (!confirmed) return;
        }
        window.__townStartScreen?.returnToHome();
      });
      popup.append(homeRow);
      popup.querySelector("button").focus();
    });
    rate.addEventListener("click", () => {
      if (!open(rate, text("Simulation speed", "Vitesse de simulation"))) return;
      [text("Normal", "Normale"), text("Fast", "Rapide"), text("Very fast", "Très rapide")].forEach((label, index) => {
        const row = document.createElement("button");
        row.type = "button";
        row.textContent = `${[1, 2, 4][index]}×  ${label}`;
        row.setAttribute("aria-pressed", String(lastSpeed === index + 1));
        row.addEventListener("click", () => { controls[index + 1].click(); close(true); });
        popup.append(row);
      });
      popup.querySelector("button[aria-pressed=true]").focus();
    });
    document.addEventListener("pointerdown", event => {
      if (!popup.contains(event.target) && !menu.contains(event.target) && !rate.contains(event.target)) close();
    });
    popup.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault(); event.stopPropagation();
        const rows = [...popup.querySelectorAll("button:not(:disabled)")];
        const current = rows.indexOf(document.activeElement);
        rows[(current + (event.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length].focus();
      }
    });
    window.addEventListener("resize", () => close());
    sync();
  });
})();
