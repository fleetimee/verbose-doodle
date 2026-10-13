(() => {
  const copy = (en, fr) => ({ en, fr });
  const text = (value, lang) => value[lang] || value.en;
  const BRIEFINGS = {
    quake_recovery: [
      copy("Inspect the damage while the city is paused. Use Bulldoze to clear rubble, not intact buildings.", "Inspectez les dégâts en pause. Utilisez le bulldozer pour enlever les décombres, pas les bâtiments intacts."),
      copy("Check fire-station coverage and reconnect damaged power lines. Resume at normal speed so firefighters can work.", "Vérifiez la couverture des pompiers et réparez les lignes électriques. Reprenez à vitesse normale pour laisser agir les pompiers."),
      copy("Earn Bronze by clearing every rubble tile and extinguishing all fires. Then build a new fire station and hospital for Silver.", "Obtenez le bronze en déblayant toutes les ruines et en éteignant tous les feux. Construisez ensuite une nouvelle caserne et un hôpital pour l'argent."),
    ],
    debt_crisis: [
      copy("Open the budget before spending. Compare tax income with monthly service costs.", "Ouvrez le budget avant de dépenser. Comparez les recettes fiscales aux coûts mensuels des services."),
      copy("Adjust taxes and service funding gradually. Cutting essential services too far can stop the city growing.", "Ajustez progressivement les impôts et le financement. Trop réduire les services essentiels peut bloquer la croissance."),
      copy("Resume at normal speed and check the next monthly balance. Earn Bronze with a positive balance, then save $10,000 for Silver.", "Reprenez à vitesse normale et vérifiez le prochain bilan mensuel. Un solde positif donne le bronze, puis épargnez 10 000 $ pour l'argent."),
    ],
    smog_to_green: [
      copy("Place three new small or large parks near residential neighborhoods. Existing parks do not count.", "Placez trois nouveaux petits ou grands parcs près des logements. Les parcs existants ne comptent pas."),
      copy("Keep the power supply above demand while adding clean generation. Do not remove a coal plant before replacing its capacity.", "Gardez une production électrique supérieure à la demande en ajoutant de l'énergie propre. Remplacez la capacité du charbon avant de le supprimer."),
      copy("After Bronze, add new clean power for Silver. Then improve water coverage, grow the population, and keep a positive monthly balance.", "Après le bronze, ajoutez une nouvelle production propre pour l'argent. Améliorez ensuite l'eau, la population et le solde mensuel."),
    ],
    island_transit: [
      copy("Use Roads to connect isolated land. Drag across water to build bridges; they cost more than land roads.", "Reliez les terres isolées avec les routes. Traversez l'eau pour créer des ponts, plus chers que les routes terrestres."),
      copy("Add 40 road or bridge tiles beyond the starting network for Bronze. Plan short crossings to protect your budget.", "Ajoutez 40 cases de routes ou ponts au réseau initial pour le bronze. Privilégiez les traversées courtes pour préserver le budget."),
      copy("For Silver, build a new rail station beside a road and railway, then add 20 rail tiles. A bus depot does not count.", "Pour l'argent, placez une nouvelle gare près d'une route et de rails, puis ajoutez 20 cases de rails. Un dépôt de bus ne compte pas."),
    ],
  };

  const hint = (title, body, action, label) => ({ title, body, action, label });
  const grow = () => hint(
    copy("Make room for new residents", "Accueillez de nouveaux habitants"),
    copy("Zone new housing near roads, jobs, power, and water. Check the residential demand bar, then let the city grow at normal speed. Your population target is shown below.", "Zonez des logements près des routes, emplois, de l'électricité et de l'eau. Vérifiez la demande résidentielle, puis laissez la ville grandir à vitesse normale. L'objectif de population est indiqué ci-dessous."),
    "res", copy("Select residential zoning", "Choisir la zone résidentielle"));
  const budget = () => hint(
    copy("Review the monthly balance", "Vérifiez le solde mensuel"),
    copy("Open Budget to compare income and costs. Adjust taxes or funding, then resume at normal speed to see the next monthly result.", "Ouvrez le budget pour comparer recettes et dépenses. Ajustez les impôts ou financements, puis reprenez à vitesse normale pour voir le prochain bilan."),
    "budget", copy("Open budget", "Ouvrir le budget"));
  const wait = () => hint(
    copy("Let the city respond", "Laissez la ville réagir"),
    copy("This goal is ready to be checked. Resume at normal speed. Medals are evaluated after the first month of the scenario.", "Cet objectif est prêt à être vérifié. Reprenez à vitesse normale. Les médailles sont évaluées après le premier mois du scénario."),
    "play", copy("Resume at normal speed", "Reprendre à vitesse normale"));

  const nextHint = (scenario, city, state, tier) => {
    if (scenario[tier].check(city).done) return wait();
    const newCount = (types) => state.countNew(city, types);
    const has = (type) => [...city.structs.values()].some((s) => s.type === type);
    if (scenario.id === "quake_recovery") {
      if (tier === "bronze") {
        if (city.burning > 0) return hint(
          copy("Give firefighters access", "Donnez accès aux pompiers"),
          copy("Check that a fire station has road access near the burning area. Reconnect damaged roads, then run at normal speed so fires can be extinguished.", "Vérifiez qu'une caserne est reliée aux routes près des feux. Réparez les routes, puis reprenez à vitesse normale pour éteindre les incendies."),
          "fire", copy("Select fire station", "Choisir la caserne"));
        return hint(copy("Clear the remaining rubble", "Déblayez les ruines restantes"),
          copy("Select Bulldoze, then clear the rubble tiles on the map. All rubble must be removed for Bronze. Keep intact roads and buildings.", "Choisissez le bulldozer et retirez les décombres. Toutes les ruines doivent disparaître pour le bronze. Gardez les routes et bâtiments intacts."),
          "bulldoze", copy("Select bulldozer", "Choisir le bulldozer"));
      }
      if (tier === "silver") {
        if (!newCount(["fire"])) return hint(copy("Build a new fire station", "Construisez une nouvelle caserne"),
          copy("Place a new fire station beside a road. Starting buildings do not count toward this construction goal.", "Placez une nouvelle caserne près d'une route. Les bâtiments initiaux ne comptent pas pour cet objectif."),
          "fire", copy("Select fire station", "Choisir la caserne"));
        if (!newCount(["hospital"])) return hint(copy("Restore health services", "Rétablissez les soins"),
          copy("Place a new hospital near homes with road access and power.", "Placez un nouvel hôpital près des logements, avec une route et de l'électricité."),
          "hospital", copy("Select hospital", "Choisir l'hôpital"));
        return hint(copy("Reconnect the power grid", "Reconnectez le réseau électrique"),
          copy("Check supply and demand at the top of the screen. Repair broken power lines; add generation if supply is too low.", "Vérifiez la production et la demande en haut de l'écran. Réparez les lignes et ajoutez de la production si nécessaire."),
          "wire", copy("Select power lines", "Choisir les lignes électriques"));
      }
      return city.stats.pop < Math.max(4000, state.baseline.pop + 1000) ? grow() : budget();
    }
    if (scenario.id === "debt_crisis") {
      if (tier === "bronze") return budget();
      if (tier === "silver" || city.money < 25000) return hint(
        copy("Build up the treasury", "Reconstituez la trésorerie"),
        copy("Keep the monthly balance positive and limit new spending. Let monthly income rebuild your funds; borrowing does not improve the monthly balance.", "Gardez un solde mensuel positif et limitez les dépenses. Laissez les recettes reconstituer les fonds ; emprunter n'améliore pas le solde mensuel."),
        "budget", copy("Open budget", "Ouvrir le budget"));
      if (!has("cityhall")) return hint(copy("Place City Hall", "Placez l'hôtel de ville"),
        copy("City Hall unlocks at 2,000 residents. Place it beside a road to meet the Gold goal.", "L'hôtel de ville se débloque à 2 000 habitants. Placez-le près d'une route pour l'objectif d'or."),
        "cityhall", copy("Select City Hall", "Choisir l'hôtel de ville"));
      return grow();
    }
    if (scenario.id === "smog_to_green") {
      if (tier === "bronze") return hint(copy("Add parks near homes", "Ajoutez des parcs près des logements"),
        copy(`Parks still needed: ${Math.max(0, 3 - newCount(["park", "bigpark"]))}. Build near homes. Small and large parks both count; the starting parks do not.`, `Parcs encore nécessaires : ${Math.max(0, 3 - newCount(["park", "bigpark"]))}. Placez-les près des logements. Petits et grands parcs comptent, mais pas les parcs initiaux.`),
        "park", copy("Select small park", "Choisir le petit parc"));
      if (tier === "silver") return hint(copy("Add clean power without blackouts", "Ajoutez de l'énergie propre sans coupure"),
        copy("Build new wind, solar, geothermal, nuclear, or fusion generation. Keep total supply above demand; one wind turbine may not replace a coal plant.", "Ajoutez de l'éolien, du solaire, de la géothermie, du nucléaire ou de la fusion. Gardez une production supérieure à la demande ; une éolienne ne remplace pas forcément une centrale à charbon."),
        "wind", copy("Select wind turbine", "Choisir l'éolienne"));
      if ((city.stats.waterShare || 0) < 0.8) return hint(copy("Bring water to more homes", "Apportez l'eau à plus de logements"),
        copy("Place water towers near unserved homes. A tower serves nearby tiles; spread them out to reach at least 80% water coverage.", "Placez des châteaux d'eau près des logements non desservis. Répartissez-les pour atteindre au moins 80 % de couverture."),
        "tower", copy("Select water tower", "Choisir le château d'eau"));
      return city.stats.pop < Math.max(5000, state.baseline.pop + 2000) ? grow() : budget();
    }
    if (tier === "bronze") return hint(copy("Extend the island road network", "Étendez le réseau routier insulaire"),
      copy("Select Roads and drag between disconnected neighborhoods. Water crossings become bridges. The counter below measures additional tiles beyond the starting network.", "Tracez des routes entre les quartiers isolés. Les traversées de l'eau deviennent des ponts. Le compteur mesure les cases ajoutées au réseau initial."),
      "road", copy("Select roads", "Choisir les routes"));
    if (tier === "silver") {
      if (!newCount(["station"])) return hint(copy("Place a new rail station", "Placez une nouvelle gare"),
        copy("Place a new station beside both a road and a railway. Then extend the rail network by 20 tiles.", "Placez une nouvelle gare près d'une route et de rails. Ajoutez ensuite 20 cases au réseau ferroviaire."),
        "station", copy("Select rail station", "Choisir la gare"));
      return hint(copy("Extend the railway", "Étendez le chemin de fer"),
        copy("Add 20 rail tiles beyond the starting network. Connect the station to the neighborhoods it should serve.", "Ajoutez 20 cases de rails au réseau initial. Reliez la gare aux quartiers à desservir."),
        "rail", copy("Select railway", "Choisir les rails"));
    }
    if (!newCount(["port"])) return hint(copy("Build a new seaport", "Construisez un nouveau port"),
      copy("Place a new seaport on the shoreline with road access. Keep enough funds to support further growth.", "Placez un nouveau port sur la côte avec un accès routier. Gardez des fonds pour poursuivre la croissance."),
      "port", copy("Select seaport", "Choisir le port"));
    return city.stats.pop < Math.max(6000, state.baseline.pop + 2500) ? grow() : budget();
  };

  let dialog = null;
  let briefingCity = null;
  let previousSpeed = 0;
  let returnFocus = null;
  const setSpeed = (speed) => document.querySelector(`#speed button[data-speed="${speed}"]`)?.click();
  const clearHighlight = () => document.querySelectorAll(".scenario-tool-hint").forEach((el) => el.classList.remove("scenario-tool-hint"));

  const useAction = (action) => {
    clearHighlight();
    const ui = window.__ui;
    if (action === "play") { setSpeed(1); return; }
    if (action === "budget") {
      ui.openPanel("panel-budget");
      document.getElementById("tax")?.focus();
      return;
    }
    ui.closePanels();
    ui.handlers.onTool(action, false);
    const button = ui.toolButtons.get(action) || [...ui.groupButtons.values()]
      .find((group) => group.items.some((item) => item.tool === action))?.button;
    if (button) {
      button.classList.add("scenario-tool-hint");
      button.scrollIntoView({ block: "nearest", inline: "nearest" });
      button.focus({ preventScroll: true });
    }
  };

  const showBriefing = (scenario, lang, force = false) => {
    const seenKey = `citybuilder.scenarioBriefing.${scenario.id}`;
    if (!force && localStorage.getItem(seenKey)) return;
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "scenario-briefing";
      dialog.setAttribute("aria-labelledby", "scenario-briefing-title");
      document.body.appendChild(dialog);
      dialog.addEventListener("close", () => {
        if (window.__city === briefingCity) setSpeed(previousSpeed);
        const target = returnFocus?.id ? document.getElementById(returnFocus.id) : returnFocus;
        if (target?.isConnected) target.focus({ preventScroll: true });
      });
      dialog.addEventListener("keydown", (event) => event.stopPropagation());
    }
    if (dialog.open) return;
    briefingCity = window.__city;
    returnFocus = document.activeElement;
    previousSpeed = Number(document.querySelector("#speed button.active")?.dataset.speed || 0);
    setSpeed(0);
    dialog.innerHTML = `
      <h2 id="scenario-briefing-title">${text(scenario.name, lang)}</h2>
      <p>${text(scenario.desc, lang)}</p>
      <h3>${lang === "fr" ? "Vos premières actions" : "Your first moves"}</h3>
      <ol>${BRIEFINGS[scenario.id].map((step) => `<li>${text(step, lang)}</li>`).join("")}</ol>
      <p class="briefing-note">${lang === "fr" ? "La ville est en pause. Les objectifs flottants indiquent la prochaine action et vos progrès. Vous pouvez rouvrir ce briefing à tout moment." : "The city is paused. The floating tracker shows your next action and progress. You can reopen this briefing anytime."}</p>
      <div class="briefing-actions">
        <button type="button" id="briefing-skip" class="ghost">${lang === "fr" ? "Explorer librement" : "Explore on my own"}</button>
        <button type="button" id="briefing-start" class="primary" autofocus>${lang === "fr" ? "Commencer en pause" : "Start planning"}</button>
      </div>`;
    document.getElementById("briefing-start").addEventListener("click", () => {
      localStorage.setItem(seenKey, "seen");
      previousSpeed = 0;
      dialog.close();
      document.getElementById("scenario-guide-action")?.focus();
    });
    document.getElementById("briefing-skip").addEventListener("click", () => {
      localStorage.setItem(seenKey, "seen");
      dialog.close();
    });
    dialog.oncancel = () => localStorage.setItem(seenKey, "seen");
    dialog.showModal();
  };

  const render = (scenario, city, state, lang) => {
    if (dialog?.open && city !== briefingCity) dialog.close();
    const container = document.getElementById("scenario-next-action");
    if (!container) return;
    const tier = ["bronze", "silver", "gold"].find((name) => !state.medals[name]);
    const next = tier ? nextHint(scenario, city, state, tier) : null;
    const markup = next ? `
      <h3>${text(next.title, lang)}</h3>
      <p>${text(next.body, lang)}</p>
      <button type="button" class="primary" id="scenario-guide-action">${text(next.label, lang)}</button>
      <button type="button" class="ghost" id="scenario-guide-briefing">${lang === "fr" ? "Relire le briefing" : "Read briefing"}</button>` : `
      <h3>${lang === "fr" ? "Scénario terminé" : "Scenario complete"}</h3>
      <p>${lang === "fr" ? "Les trois médailles sont acquises. Continuez avec les ères 6 et 7 : services avancés, nouveaux quartiers et 100 000 habitants." : "You earned all three medals. Continue with Eras 6 and 7: advanced services, new districts and 100,000 residents."}</p>
      <button type="button" class="primary" id="scenario-guide-endgame">${lang === "fr" ? "Ouvrir les objectifs de fin de partie" : "Open endgame goals"}</button>
      <button type="button" class="ghost" id="scenario-guide-briefing">${lang === "fr" ? "Relire le briefing" : "Read briefing"}</button>`;
    if (container.innerHTML === markup) return;
    const focusedId = container.contains(document.activeElement) ? document.activeElement.id : null;
    container.innerHTML = markup;
    document.getElementById("scenario-guide-action")?.addEventListener("click", () => useAction(next.action));
    document.getElementById("scenario-guide-endgame")?.addEventListener("click", () => window.__openEndgameMissions?.());
    document.getElementById("scenario-guide-briefing").addEventListener("click", () => showBriefing(scenario, lang, true));
    if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });
  };

  const style = document.createElement("style");
  style.textContent = `
    #scenario-next-action { border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 4px; }
    #scenario-next-action h3 { margin: 0 0 5px; font: 800 15px/1.25 var(--font-head); color: var(--text); }
    #scenario-next-action p { margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: var(--text); }
    #scenario-next-action button { min-height: 36px; max-width: 100%; text-align: left; font-size: 12px; }
    #scenario-next-action .ghost { display: block; margin-top: 2px; color: var(--muted); }
    #scenario-briefing { width: min(560px, calc(100vw - 24px)); max-height: calc(100dvh - 32px); overflow-y: auto; background: var(--panel-flat); color: var(--text); border: 1px solid var(--border); border-radius: 16px; padding: 24px; font: 600 14px/1.55 var(--font-body); }
    #scenario-briefing::backdrop { background: rgb(8 12 20 / 78%); }
    #scenario-briefing h2 { font: 800 26px/1.2 var(--font-head); margin: 0 0 12px; }
    #scenario-briefing h3 { font: 800 18px/1.3 var(--font-head); margin: 22px 0 8px; }
    #scenario-briefing p { margin: 0 0 12px; }
    #scenario-briefing ol { padding-left: 22px; margin: 0; }
    #scenario-briefing li { padding-left: 4px; margin-bottom: 10px; }
    #scenario-briefing .briefing-note { color: var(--muted); font-size: 12px; margin-top: 18px; }
    .briefing-actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
    .briefing-actions button { min-height: 44px; }
    #toolbar .scenario-tool-hint { outline: 2px solid var(--teal); outline-offset: 2px; }
    #scenario-briefing button:focus-visible, #scenario-next-action button:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; }
    @media (max-width: 600px) {
      #scenario-briefing { padding: 18px; }
      #scenario-next-action button { min-height: 44px; }
      .briefing-actions { flex-direction: column-reverse; }
      .briefing-actions button { width: 100%; }
    }
  `;
  document.head.appendChild(style);
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("map").addEventListener("pointerdown", clearHighlight);
  });
  window.__scenarioGuide = { render, showBriefing, useAction };
})();
