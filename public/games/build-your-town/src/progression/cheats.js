(() => {
  const getLang = () => {
    try {
      const lang = localStorage.getItem("citybuilder.lang");
      if (lang === "en" || lang === "fr") return lang;
    } catch {}
    return document.documentElement.lang === "en" ? "en" : "fr";
  };

  const CHEATS = [
    { id: "cash-small", en: "Add $10,000", fr: "Ajouter 10 000 $", apply: (city) => { city.money += 10000; } },
    { id: "cash-large", en: "Add $100,000", fr: "Ajouter 100 000 $", apply: (city) => { city.money += 100000; } },
    { id: "debt", en: "Clear debt and bonds", fr: "Effacer dettes et emprunts", apply: (city) => {
      city.money = Math.max(0, city.money);
      city.bonds = 0;
    } },
    { id: "grow", en: "Grow all existing zones", fr: "Développer les zones existantes", apply: (city) => {
      for (let i = 0; i < city.count; i++) {
        if (city.overlay[i] >= 3 && city.overlay[i] <= 5) {
          city.level[i] = Math.min(5, city.level[i] + 1);
        }
      }
      city.gridDirty = true;
    } },
    { id: "unlock", en: "Unlock all construction", fr: "Débloquer toutes les constructions", apply: (city) => {
      city.maxPop = Math.max(city.maxPop, 100000);
    } },
    { id: "hazards", en: "Stop fires, floods and tornadoes", fr: "Arrêter feux, inondations et tornades", apply: (city) => {
      city.fire.fill(0);
      city.flood.fill(0);
      city.burning = 0;
      city.actors = [];
      city.shakeMs = 0;
      city.gridDirty = true;
    } },
    { id: "rubble", en: "Clear all rubble", fr: "Déblayer toutes les ruines", apply: (city) => {
      for (let i = 0; i < city.count; i++) {
        if (city.overlay[i] === 8) city.overlay[i] = 0;
      }
      city.roadsDirty = true;
      city.gridDirty = true;
    } },
  ];

  let panel;
  let button;
  const closePanel = () => {
    panel.hidden = true;
    button.setAttribute("aria-expanded", "false");
    if (window.__city?.bankrupt) document.getElementById("bankrupt").hidden = false;
  };
  const refresh = () => {
    const city = window.__city;
    if (!city) return;
    const lang = getLang();
    const ready = !!window.__refreshCity && !!localStorage.getItem("citybuilder.current");
    for (const control of panel.querySelectorAll("button[data-cheat], input")) control.disabled = !ready;
    const amount = Math.round(city.money).toLocaleString(lang === "fr" ? "fr-FR" : "en-US");
    document.getElementById("cheat-funds").textContent = `${city.name} · ${lang === "fr" ? `Fonds : ${amount} $` : `Funds: $${amount}`}`;
    document.getElementById("cheat-disasters").checked = city.randomDisasters;
    const override = window.__townWeather?.getOverride();
    if (override) {
      document.getElementById("cheat-season").value = override.season ?? "";
      document.getElementById("cheat-weather").value = override.kind ?? "";
    }
  };

  const applyCheat = (cheat) => {
    const city = window.__city;
    if (!city || !window.__refreshCity || !localStorage.getItem("citybuilder.current")) return;
    cheat.apply(city);
    if (city.money >= city.diff.bankruptAt) {
      city.bankrupt = false;
      city.brokeMonths = 0;
      document.getElementById("bankrupt").hidden = true;
    }
    window.__refreshCity();
    refresh();
    const label = cheat[getLang()];
    document.getElementById("cheat-result").textContent = label;
    window.__ui.toast(label, "good", { ms: 3000 });
  };

  const openPanel = () => {
    window.__ui?.closePanels();
    document.getElementById("panel-missions").hidden = true;
    document.getElementById("bankrupt").hidden = true;
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    refresh();
    document.getElementById("cheats-close").focus();
  };

  const init = () => {
    const lang = getLang();
    panel = document.createElement("aside");
    panel.id = "panel-cheats";
    panel.className = "panel";
    panel.hidden = true;
    panel.setAttribute("aria-labelledby", "cheats-title");
    panel.innerHTML = `
      <div class="head">
        <span id="cheats-title">${lang === "fr" ? "Triches" : "Cheats"}</span>
        <button type="button" class="ghost close" id="cheats-close" aria-label="${lang === "fr" ? "Fermer les triches" : "Close cheats"}">✕</button>
      </div>
      <div class="body">
        <p class="cheat-note">${lang === "fr" ? "Modifiez la ville actuelle pour expérimenter. Les changements sont sauvegardés immédiatement et comptent pour les objectifs." : "Experiment with the current city. Changes save immediately and count toward objectives."}</p>
        <p id="cheat-funds"></p>
        <h3>${lang === "fr" ? "Trésorerie" : "Treasury"}</h3>
        <div class="cheat-actions">${CHEATS.slice(0, 3).map((cheat) => `<button type="button" data-cheat="${cheat.id}">${cheat[lang]}</button>`).join("")}</div>
        <h3>Construction</h3>
        <div class="cheat-actions">${CHEATS.slice(3, 5).map((cheat) => `<button type="button" data-cheat="${cheat.id}">${cheat[lang]}</button>`).join("")}</div>
        <p class="cheat-note">${lang === "fr" ? "Le développement augmente d'un niveau les logements, commerces et industries déjà zonés. Fournissez toujours routes, emplois, eau et électricité pour conserver cette croissance." : "Growth raises existing residential, commercial and industrial zones by one level. Keep roads, jobs, water and power available to sustain it."}</p>
        <h3>${lang === "fr" ? "Saison et météo" : "Season and weather"}</h3>
        <div class="cheat-selects">
          <label>${lang === "fr" ? "Saison" : "Season"}<select id="cheat-season"></select></label>
          <label>${lang === "fr" ? "Météo" : "Weather"}<select id="cheat-weather"></select></label>
        </div>
        <p class="cheat-note">${lang === "fr" ? "Force la saison et la météo affichées, sans changer le calendrier. Remettez « Auto » pour suivre la ville. Réinitialisé au rechargement." : "Forces the displayed season and weather without changing the calendar. Set back to Auto to follow the city. Resets on reload."}</p>
        <h3>${lang === "fr" ? "Catastrophes" : "Disasters"}</h3>
        <div class="cheat-actions">${CHEATS.slice(5).map((cheat) => `<button type="button" data-cheat="${cheat.id}">${cheat[lang]}</button>`).join("")}</div>
        <label class="cheat-toggle"><input type="checkbox" id="cheat-disasters"> ${lang === "fr" ? "Catastrophes aléatoires" : "Random disasters"}</label>
        <p class="cheat-note">${lang === "fr" ? "Les événements scénarisés restent actifs. Le nettoyage ne reconstruit pas les bâtiments détruits." : "Scripted events still apply. Cleanup does not rebuild destroyed buildings."}</p>
        <p id="cheat-result" role="status" aria-live="polite"></p>
      </div>`;
    document.body.appendChild(panel);

    button = document.createElement("button");
    button.id = "btn-cheats";
    button.type = "button";
    button.textContent = lang === "fr" ? "Triches" : "Cheats";
    button.setAttribute("aria-controls", panel.id);
    button.setAttribute("aria-expanded", "false");
    document.querySelector(".group.menus").appendChild(button);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (panel.hidden) openPanel();
      else closePanel();
    });
    document.getElementById("cheats-close").addEventListener("click", () => {
      closePanel();
      button.focus();
    });
    panel.addEventListener("click", (event) => {
      const id = event.target.closest("button[data-cheat]")?.dataset.cheat;
      const cheat = CHEATS.find((item) => item.id === id);
      if (cheat) applyCheat(cheat);
    });
    const weather = window.__townWeather;
    if (weather) {
      const fill = (id, items) => {
        const select = document.getElementById(id);
        select.append(new Option("Auto", ""), ...items.map((item) => new Option(item[lang], item.id)));
        select.addEventListener("change", () => {
          weather.setOverride({ [id === "cheat-season" ? "season" : "kind"]: select.value || null });
          const label = select.selectedOptions[0].textContent;
          document.getElementById("cheat-result").textContent = label;
          window.__ui?.toast(label, "good", { ms: 2000 });
        });
      };
      fill("cheat-season", weather.options.seasons);
      fill("cheat-weather", weather.options.kinds);
    } else document.querySelector(".cheat-selects").hidden = true;
    document.getElementById("cheat-disasters").addEventListener("change", (event) => {
      const enabled = event.target.checked;
      applyCheat({ en: enabled ? "Random disasters enabled" : "Random disasters disabled", fr: enabled ? "Catastrophes aléatoires activées" : "Catastrophes aléatoires désactivées", apply: (city) => { city.randomDisasters = enabled; } });
    });
    document.addEventListener("keydown", (event) => {
      if (panel.hidden || event.key !== "Escape") return;
      closePanel();
      button.focus();
      event.stopPropagation();
    });
    document.getElementById("map").addEventListener("pointerdown", closePanel);
    for (const id of ["btn-budget", "btn-maps", "btn-cities", "btn-journal", "btn-help", "btn-missions"]) {
      document.getElementById(id)?.addEventListener("click", closePanel);
    }
    const rescue = document.createElement("button");
    rescue.type = "button";
    rescue.textContent = lang === "fr" ? "Ouvrir les triches" : "Open cheats";
    rescue.addEventListener("click", openPanel);
    document.querySelector("#bankrupt .actions").appendChild(rescue);
    setInterval(() => { if (!panel.hidden) refresh(); }, 1000);
  };

  const style = document.createElement("style");
  style.textContent = `
    #btn-cheats { height: 36px; padding: 0 10px; color: var(--teal); }
    #panel-cheats { z-index: 9; width: min(360px, calc(100vw - 24px)); }
    #panel-cheats .cheat-note { color: var(--muted); font-size: 12px; line-height: 1.5; margin: 8px 0; }
    #cheat-funds { color: var(--text); font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
    #panel-cheats .cheat-actions { display: flex; flex-direction: column; gap: 6px; }
    #panel-cheats .cheat-actions button { min-height: 44px; text-align: left; }
    #panel-cheats .cheat-toggle { display: flex; align-items: center; gap: 8px; min-height: 44px; margin-top: 10px; }
    #panel-cheats .cheat-selects { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    #panel-cheats .cheat-selects label { display: flex; flex-direction: column; gap: 4px; color: var(--muted); font-size: 12px; }
    #panel-cheats select { min-height: 44px; }
    #panel-cheats input { width: 18px; height: 18px; accent-color: var(--teal); }
    #panel-cheats button:focus-visible, #panel-cheats input:focus-visible, #panel-cheats select:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
    #cheat-result { color: var(--ok); min-height: 18px; }
    @media (max-width: 900px) { #panel-cheats { width: auto; max-height: 65dvh; } }
  `;
  document.head.appendChild(style);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
