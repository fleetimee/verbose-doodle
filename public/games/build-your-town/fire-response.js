(() => {
  const getLang = () => document.documentElement.lang === "fr" ? "fr" : "en";
  const inspectFire = (city) => {
    let count = 0;
    let covered = 0;
    for (let i = 0; i < city.fire.length; i++) {
      if (!city.fire[i]) continue;
      count++;
      if (city.cover.fire[i] > 0) covered++;
    }
    const stations = [...city.structs.values()].filter((building) => building.type === "fire" || building.type === "firecommand").length;
    return { count, covered, stations, funding: city.funding.fire };
  };

  let panel = null;
  let currentCity = null;
  let collapsed = false;
  let previousFocus = null;
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element.textContent !== value) element.textContent = value;
  };
  const paused = () => document.querySelector('#speed button.active')?.dataset.speed === "0";
  const closeOtherPanels = () => {
    window.__ui.closePanels();
    for (const id of ["panel-missions", "panel-cheats"]) {
      const other = document.getElementById(id);
      if (other) other.hidden = true;
    }
    document.getElementById("btn-cheats")?.setAttribute("aria-expanded", "false");
  };
  const locate = () => {
    const city = window.__city;
    if (!city) return;
    const index = city.fire.findIndex((value) => value > 0);
    if (index >= 0) window.__focusCityTile(index % city.size, Math.floor(index / city.size));
    update();
  };

  const update = () => {
    if (!panel || !window.__city) return;
    const city = window.__city;
    const fire = inspectFire(city);
    if (currentCity !== city || !fire.count) collapsed = false;
    currentCity = city;
    if (!fire.count) {
      if (!panel.hidden && panel.contains(document.activeElement)) {
        const target = previousFocus?.isConnected && !panel.contains(previousFocus)
          ? previousFocus : document.querySelector('#speed button.active');
        target?.focus({ preventScroll: true });
      }
      panel.hidden = true;
      return;
    }
    if (panel.hidden) previousFocus = document.activeElement;
    panel.hidden = false;
    const fr = getLang() === "fr";
    setText("fire-response-title", fr ? "Incendie en cours" : "Fire emergency");
    setText("fire-response-count", fr ? `${fire.count} case(s) en feu · ${fire.covered} couverte(s) · financement ${fire.funding} %` : `${fire.count} burning tile${fire.count === 1 ? "" : "s"} · ${fire.covered} covered · funding ${fire.funding}%`);
    let advice;
    if (!fire.stations) advice = fr
      ? "Construisez une caserne près du feu. Les services incendie interviennent automatiquement selon leur couverture et leur financement."
      : "Build a fire station near the fire. Fire services respond automatically based on coverage and funding.";
    else if (fire.funding < 100) advice = fr
      ? "Augmentez le financement des pompiers dans le budget. Vérifiez aussi que les cases en feu sont couvertes par une caserne."
      : "Increase fire-department funding in the budget. Also check that a station covers the burning tiles.";
    else if (fire.covered < fire.count) advice = fr
      ? "Des feux sont hors de portée des services incendie. Affichez la couverture et placez une caserne plus près."
      : "Some fires are outside fire-service coverage. View the coverage map and place a station closer.";
    else advice = fr
      ? "Les feux sont couverts. Laissez tourner la ville à vitesse normale pour que les pompiers interviennent."
      : "The fires are covered. Run the city at normal speed so fire services can respond.";
    setText("fire-response-advice", advice);
    setText("fire-response-locate", fr ? "Localiser le feu" : "Go to fire");
    setText("fire-response-coverage", fr ? "Couverture incendie" : "View fire coverage");
    setText("fire-response-station", fr ? "Construire une caserne" : "Build fire station");
    setText("fire-response-budget", fr ? "Budget des pompiers" : "Review fire funding");
    setText("fire-response-speed", paused()
      ? (fr ? "Reprendre à vitesse normale" : "Resume at normal speed")
      : (fr ? "Mettre en pause pour planifier" : "Pause to plan"));
    setText("fire-response-toggle", collapsed
      ? (fr ? "Que faire ?" : "What to do") : (fr ? "Réduire" : "Minimize"));
    document.getElementById("fire-response-body").hidden = collapsed;
    document.getElementById("fire-response-toggle").setAttribute("aria-expanded", String(!collapsed));
  };

  const init = () => {
    panel = document.createElement("aside");
    panel.id = "fire-response";
    panel.hidden = true;
    panel.setAttribute("aria-labelledby", "fire-response-title");
    panel.innerHTML = `
      <div class="fire-response-head">
        <h2 id="fire-response-title"></h2>
        <button type="button" class="ghost" id="fire-response-toggle" aria-controls="fire-response-body" aria-expanded="true"></button>
      </div>
      <p id="fire-response-count"></p>
      <button type="button" class="primary" id="fire-response-locate"></button>
      <div id="fire-response-body">
        <p id="fire-response-advice"></p>
        <div class="fire-response-actions">
          <button type="button" id="fire-response-coverage"></button>
          <button type="button" id="fire-response-station"></button>
          <button type="button" id="fire-response-budget"></button>
          <button type="button" id="fire-response-speed"></button>
        </div>
      </div>`;
    document.body.appendChild(panel);
    document.getElementById("fire-response-locate").addEventListener("click", () => {
      closeOtherPanels();
      locate();
    });
    document.getElementById("fire-response-coverage").addEventListener("click", () => {
      closeOtherPanels();
      window.__ui.handlers.onDataMap("fire");
      locate();
    });
    document.getElementById("fire-response-station").addEventListener("click", () => {
      closeOtherPanels();
      window.__scenarioGuide.useAction("fire");
      locate();
    });
    document.getElementById("fire-response-budget").addEventListener("click", () => {
      closeOtherPanels();
      window.__ui.openPanel("panel-budget");
      document.getElementById("fund-fire").focus();
    });
    document.getElementById("fire-response-speed").addEventListener("click", () => {
      document.querySelector(`#speed button[data-speed="${paused() ? 1 : 0}"]`).click();
      update();
    });
    document.getElementById("fire-response-toggle").addEventListener("click", () => {
      collapsed = !collapsed;
      update();
    });
    update();
    setInterval(update, 500);
  };

  const style = document.createElement("style");
  style.textContent = `
    #fire-response { position: fixed; z-index: 9; left: 50%; bottom: 42px; transform: translateX(-50%); width: min(440px, calc(100vw - 24px)); max-height: calc(100dvh - 130px); overflow-y: auto; padding: 12px 14px; background: var(--panel-flat); color: var(--text); border: 1px solid var(--danger); border-radius: 12px; }
    .fire-response-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    #fire-response-title { font: 800 18px/1.25 var(--font-head); margin: 0; color: var(--danger); }
    #fire-response-count { color: var(--muted); font-size: 12px; margin: 4px 0 10px; }
    #fire-response-advice { font-size: 13px; line-height: 1.5; margin: 12px 0; }
    #fire-response button { min-height: 44px; }
    .fire-response-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    #fire-response button:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
    @media (max-width: 900px) { #fire-response { bottom: calc(106px + env(safe-area-inset-bottom)); max-height: calc(100dvh - 170px - env(safe-area-inset-bottom)); } }
  `;
  document.head.appendChild(style);
  window.__fireResponse = { update };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
