(() => {
  const getLang = () => document.documentElement.lang === "fr" ? "fr" : "en";
  const inspectFire = (city) => {
    let count = 0;
    let covered = 0;
    let ordered = 0;
    for (let i = 0; i < city.fire.length; i++) {
      if (!city.fire[i]) continue;
      count++;
      if (city.cover.fire[i] > 0) covered++;
      if (city.fireOrders?.[i] && window.__disasterRecovery?.canFight(city, i)) ordered++;
    }
    const stations = [...city.structs.values()].filter((building) => building.type === "fire" || building.type === "firecommand").length;
    return { count, covered, ordered, stations, funding: city.funding.fire };
  };

  let panel = null;
  let currentCity = null;
  let collapsed = false;
  let previousFocus = null;
  let previousPending = 0;
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
    const recovery = window.__disasterRecovery?.progress(city);
    const target = index >= 0 ? index : recovery?.next ?? -1;
    if (target >= 0) window.__focusCityTile(target % city.size, Math.floor(target / city.size));
    else if (city.actors[0]) window.__focusCityTile(city.actors[0].x, city.actors[0].y);
    update();
  };

  const update = () => {
    if (!panel || !window.__city) return;
    const city = window.__city;
    const fire = inspectFire(city);
    const recovery = window.__disasterRecovery?.progress(city) ?? { pending: 0, complete: 0, total: 0 };
    const manual = window.__disasterRecovery?.isManual() ?? false;
    const tornado = manual && city.actors.some(actor => actor.kind === "tornado");
    if (currentCity === city && previousPending > 0 && !recovery.pending && !fire.count && !tornado) {
      window.__ui.toast(getLang() === "fr" ? "Reconstruction terminée : tous les dégâts suivis sont réparés." : "Recovery complete: all tracked damage repaired.", "good", { ms: 5000 });
    }
    if (currentCity !== city) collapsed = false;
    previousPending = recovery.pending;
    currentCity = city;
    if (!fire.count && !recovery.pending && !tornado) {
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
    setText("fire-response-title", fire.count ? (fr ? "Intervention incendie" : "Fire response") : (fr ? "Reconstruction après sinistre" : "Disaster recovery"));
    setText("fire-response-count", fr
      ? `${fire.count} feu(x) · ${fire.ordered} intervention(s) · ${recovery.complete}/${recovery.total} cases restaurées`
      : `${fire.count} fires · ${fire.ordered} assigned · ${recovery.complete}/${recovery.total} tiles restored`);
    let advice;
    if (!manual && fire.count) advice = fr
      ? "Les pompiers interviennent automatiquement selon la couverture et le financement. Construisez une caserne près des feux et financez-la. Activez l'intervention manuelle dans les réglages pour diriger les secours."
      : "Fire crews respond automatically based on coverage and funding. Build and fund a station near the fires. Enable manual disaster response in settings to direct crews yourself.";
    else if (!fire.count) advice = fr
      ? "Le sinistre ne répare pas la ville. Démolissez les décombres, reconstruisez les routes, réseaux et équipements, puis rezonez les terrains."
      : "Damage stays until you repair it. Bulldoze debris, rebuild roads, utilities and facilities, then rezone damaged neighborhoods.";
    else if (!fire.stations || fire.covered < fire.count) advice = fr
      ? "Construisez une caserne couvrant les feux, financez les pompiers et cliquez sur Envoyer les pompiers. Les nouveaux feux nécessitent un nouvel ordre."
      : "Build a station covering the fires, fund it, then click Dispatch firefighters. Newly spreading fires need another order.";
    else advice = fr
      ? "Envoyez les pompiers pour autoriser l'intervention. Sans votre ordre, les feux se propagent ou laissent des décombres. Reprenez la simulation pour intervenir."
      : "Dispatch firefighters to authorize a response. Without your order, fires spread or burn buildings into debris. Resume the simulation for crews to work.";
    if (tornado) advice += fr ? " La tornade est encore active : mettez en pause pour préparer la reconstruction." : " The tornado is still active; pause to plan recovery.";
    setText("fire-response-advice", advice);
    setText("fire-response-locate", fire.count ? (fr ? "Localiser le feu" : "Go to fire") : (fr ? "Localiser les dégâts" : "Go to damage"));
    setText("fire-response-dispatch", fr ? "Envoyer les pompiers" : "Dispatch firefighters");
    document.getElementById("fire-response-dispatch").hidden = !manual;
    document.getElementById("fire-response-dispatch").disabled = !fire.count || fire.covered <= fire.ordered || fire.funding <= 0;
    setText("fire-response-clear", fr ? "Déblayer les décombres" : "Clear debris");
    setText("fire-response-rebuild", fr ? "Reconstruire la prochaine case" : "Rebuild next tile");
    document.getElementById("fire-response-clear").disabled = !recovery.pending;
    document.getElementById("fire-response-rebuild").disabled = !recovery.pending;
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
          <button type="button" class="primary" id="fire-response-dispatch"></button>
          <button type="button" id="fire-response-clear"></button>
          <button type="button" id="fire-response-rebuild"></button>
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
    document.getElementById("fire-response-dispatch").addEventListener("click", () => {
      window.__dispatchFirefighters();
      update();
    });
    document.getElementById("fire-response-clear").addEventListener("click", () => {
      closeOtherPanels();
      window.__ui.handlers.onTool("bulldoze", false);
      locate();
    });
    document.getElementById("fire-response-rebuild").addEventListener("click", () => {
      const city = window.__city;
      const index = window.__disasterRecovery.progress(city).next;
      if (index < 0) return;
      const task = city.disasterRecovery[index];
      const missingRail = task.rail && city.overlay[index] === task.overlay &&
        (!city.rail[index] || (window.__railTransit?.kind(city, index) ?? 0) !== (task.railKind ?? 0));
      const railTool = task.railKind === 1 ? "highspeedRail" : task.railKind === 2 ? "elevatedLrt" : "rail";
      const tool = missingRail ? railTool : task.type ?? ({ 2: "road", 3: "res", 4: "com", 5: "ind", 7: "highway" }[task.overlay]) ?? (task.rail ? task.railKind === 1 ? "highspeedRail" : task.railKind === 2 ? "elevatedLrt" : "rail" : "wire");
      closeOtherPanels();
      window.__ui.handlers.onTool(tool, false);
      window.__focusCityTile(index % city.size, Math.floor(index / city.size));
      update();
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
    #fire-response button:disabled { opacity: 0.45; cursor: default; }
    .fire-response-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    #fire-response button:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
    @media (max-width: 900px) { #fire-response { bottom: calc(106px + env(safe-area-inset-bottom)); max-height: calc(100dvh - 170px - env(safe-area-inset-bottom)); } }
  `;
  document.head.appendChild(style);
  window.__fireResponse = { update };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
