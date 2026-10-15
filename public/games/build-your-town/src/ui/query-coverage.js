(() => {
  let selected = null;
  let visible = true;
  let growthView = null;
  const zoneColors = { 3: "#75d47d", 4: "#7cbaff", 5: "#f2c14e" };
  const colors = { power: "#f2c14e", water: "#72c8ee", police: "#8daeff", fire: "#ef967c", education: "#d1a4ed", health: "#85d5ca", park: "#b1df89" };
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const iconPaths = {
    track: "M7 3v18M17 3v18M5 6h14M5 10h14M5 14h14M5 18h14",
    power: "m13 2-9 12h7l-1 8 10-12h-7l1-8Z",
    water: "M12 3s-7 8-7 12a7 7 0 0 0 14 0c0-4-7-12-7-12Z",
    road: "m8 3-3 18M16 3l3 18M12 4v3m0 4v3m0 4v3",
    activity: "M3 12h4l3-8 4 16 3-8h4",
    people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m9-7a4 4 0 0 1 0 8m4 9v-2a4 4 0 0 0-3-4",
    fun: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 9h.01M16 9h.01M8 14s1 3 4 3 4-3 4-3",
    altitude: "m2 20 7-15 5 10 3-6 5 11H2Zm5-11 2 3 2-3",
    land: "m3 7 6-3 6 3 6-3v16l-6 3-6-3-6 3V7Zm6-3v16m6-13v16",
    pollution: "M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5",
    shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6",
    info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-12v7m0-10h.01",
    grid: "M3 3h18v18H3V3Zm0 9h18M12 3v18",
    money: "M3 5h18v14H3V5Zm9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    range: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-5a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v4m0 12v4M2 12h4m12 0h4",
  };
  const icon = (name) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.7");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("query-icon");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", iconPaths[name] ?? iconPaths.info);
    svg.append(path);
    return svg;
  };
  const matches = (line, key, translate) => {
    const template = translate(key);
    if (template === key) return false;
    const pattern = template.split(/(\{[^}]+\})/).map(part =>
      part.startsWith("{") ? ".+" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    ).join("");
    return new RegExp(`^${pattern}`).test(line);
  };

  function show(query, city, definitions, translate, language) {
    selected = query?.tile ?? null;
    growthView = null;
    visible = true;
    if (!query) return;
    const fr = language === "fr";
    const copy = (en, french) => fr ? french : en;
    document.getElementById("query-title").textContent = query.title;
    const body = document.getElementById("query-body");
    body.replaceChildren();
    body.append(node("p", "query-location", translate("query.tile", query.tile)));
    if (window.__zoneGrowth?.inspect(city, city.idx(selected.x, selected.y))) {
      const section = node("section", "query-growth");
      const heading = node("div", "query-growth-heading");
      const label = node("strong", "");
      const value = node("span", "query-growth-value");
      heading.append(label, value);
      const progress = node("progress", "query-growth-bar");
      progress.max = 100;
      progress.setAttribute("aria-label", copy("Progress to next building tier", "Progression vers le prochain niveau"));
      const status = node("p", "query-growth-status");
      status.dataset.townHelp = "growth";
      const statusText = node("span", "");
      status.append(statusText);
      const tiers = node("div", "query-growth-tiers");
      for (let tier = 1; tier <= 5; tier++) tiers.append(node("span", "", String(tier)));
      section.append(heading, progress, tiers, status);
      body.append(section);
      growthView = { city, section, label, value, progress, status, statusText, tiers, translate, copy };
      refreshGrowth(city);
    }
    const building = city.structAt(city.idx(selected.x, selected.y));
    const definition = building && definitions[building.type];
    if (definition) {
      body.append(node("p", "query-description", translate(`struct.${building.type}.desc`)));
      const facts = node("dl", "query-facts");
      const fact = (label, value, symbol) => {
        const term = node("dt", "");
        term.dataset.townHelp = { grid: "footprint", money: "upkeep", power: "electricity", range: "coverage", shield: definition.dept }[symbol] ?? "query";
        term.append(icon(symbol), node("span", "", label));
        facts.append(term, node("dd", "", value));
      };
      fact(copy("Footprint", "Emprise"), `${definition.size} × ${definition.size}`, "grid");
      fact(copy("Base upkeep", "Entretien de base"), `${new Intl.NumberFormat(fr ? "fr" : "en", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(definition.upkeep)} ${copy("/ month", "/ mois")}`, "money");
      if (definition.consumes) fact(copy("Power needed", "Électricité requise"), `${definition.consumes} MW`, "power");
      if (definition.power) fact(copy("Generation", "Production"), `${definition.onWater && city.terrain[city.idx(building.x, building.y)] === 1 ? definition.power * 1.5 : definition.power} MW`, "power");
      if (definition.radius) fact(copy("Coverage radius", "Rayon de couverture"), copy(`${definition.radius} tiles`, `${definition.radius} cases`), "range");
      if (definition.dept) fact(copy("Funding", "Financement"), `${city.funding[definition.dept]}%`, "shield");
      body.append(facts);
      if (definition.radius || definition.power) {
        const coverage = node("section", "query-coverage");
        const color = colors[definition.dept ?? definition.category] ?? colors.park;
        coverage.style.setProperty("--coverage-color", color);
        const toggle = node("button", "query-range-toggle", copy("Hide coverage", "Masquer la couverture"));
        toggle.type = "button";
        toggle.setAttribute("aria-pressed", "true");
        toggle.addEventListener("click", () => {
          visible = !visible;
          toggle.setAttribute("aria-pressed", String(visible));
          toggle.textContent = visible ? copy("Hide coverage", "Masquer la couverture") : copy("Show coverage", "Afficher la couverture");
          window.dispatchEvent(new Event("resize"));
        });
        coverage.append(toggle, node("p", "query-range-note", definition.power
          ? copy("Powered network highlighted. Connect buildings with power lines; no fixed radius.", "Réseau alimenté en surbrillance. Reliez les bâtiments par des lignes électriques ; aucun rayon fixe.")
          : copy("Potential reach highlighted. Check operating conditions below; service strength fades with distance.", "Portée potentielle en surbrillance. Vérifiez les conditions ci-dessous ; les services diminuent avec la distance.")));
        body.append(coverage);
      }
    }
    const details = node("section", "query-details");
    details.append(node("h3", "", copy("Connections & operation", "Connexions et activité")));
    const environment = node("section", "query-details query-environment");
    environment.append(node("h3", "", copy("Surroundings", "Environnement")));
    const metrics = node("dl", "query-metrics");
    environment.append(metrics);
    const skip = new Set([translate("query.tile", query.tile)]);
    if (definition) {
      const description = translate(`struct.${building.type}.desc`);
      skip.add(description);
      skip.add(query.lines[query.lines.indexOf(description) + 1]);
      for (const line of query.lines) if (line === translate("query.funding", { pct: city.funding[definition.dept] }) || line === translate("query.produces", { mw: definition.power })) skip.add(line);
    }
    const types = [
      ["track", ["highspeedRail", "elevatedLrt", "doubleRail"]],
      ["power", ["powered", "unpowered", "powerYes", "powerNo", "wire"]],
      ["water", ["waterYes", "waterNo", "flooded"]],
      ["road", ["noRoad", "onRoad", "roadAt", "traffic"]],
      ["activity", ["attractionOpen", "attractionClosed", "onFire"]],
      ["people", ["structJobs", "structResidents", "pop", "jobs", "jobsOk", "jobsNo", "workersOk", "workersNo"]],
      ["fun", ["fun"]], ["altitude", ["altitude"]], ["land", ["lv"]],
      ["pollution", ["pollution"]], ["shield", ["crime", "services", "noServices"]],
    ];
    for (const line of query.lines) {
      if (skip.has(line)) continue;
      const type = types.find(([, keys]) => keys.some(key => matches(line, `query.${key}`, translate)))?.[0] ?? "info";
      const topic = matches(line, "query.crime", translate) ? "crime"
        : matches(line, "query.traffic", translate) ? "traffic"
        : matches(line, "query.onFire", translate) || matches(line, "query.flooded", translate) ? "tileDamage"
        : { track: matches(line, "query.doubleRail", translate) ? "compactRail" : "railTransit", power: "electricity", water: "tileWater", road: "tileRoad", activity: "tileOperation", people: "tileJobs",
          fun: "fun", altitude: "altitude", land: "lv", pollution: "pollution", shield: "coverage", info: "tileDevelopment" }[type];
      const metric = ["fun", "altitude", "land", "pollution"].includes(type) || matches(line, "query.crime", translate);
      if (metric) {
        const separator = line.indexOf(":");
        const term = node("dt", "");
        term.dataset.townHelp = topic;
        term.append(icon(type), node("span", "", separator < 0 ? line : line.slice(0, separator).trim()));
        metrics.append(term, node("dd", "", separator < 0 ? "" : line.slice(separator + 1).trim()));
        continue;
      }
      const row = node("div", `query-condition query-condition-${type}`);
      const text = node("span", "query-condition-text", line);
      text.dataset.townHelp = topic;
      row.append(icon(type), text);
      if (["unpowered", "powerNo", "waterNo", "noRoad", "onFire", "flooded", "attractionClosed", "jobsNo", "workersNo"].some(key => matches(line, `query.${key}`, translate))) row.classList.add("query-warning");
      else if (["powered", "powerYes", "waterYes", "attractionOpen", "jobsOk", "workersOk"].some(key => matches(line, `query.${key}`, translate))) row.classList.add("query-success");
      if (matches(line, "query.services", translate) || matches(line, "query.noServices", translate)) environment.append(row);
      else details.append(row);
    }
    if (details.children.length > 1) body.append(details);
    if (environment.children.length > 2 || metrics.children.length) body.append(environment);
    document.getElementById("query-close").setAttribute("aria-label", copy("Close tile details", "Fermer les détails"));
  }
  function overlay(city, definitions, preview, tool, hover) {
    const placing = definitions[tool] && hover;
    const tile = placing ? hover : visible && !document.getElementById("query").hidden && selected;
    if (!tile || !city.inBounds(tile.x, tile.y)) return preview;
    const building = placing ? { ...tile, type: tool } : city.structAt(city.idx(tile.x, tile.y));
    const definition = building && definitions[building.type];
    if (!definition || !definition.radius && !definition.power) return preview;
    const tiles = [];
    if (definition.power) {
      if (placing) return preview;
      const network = city.powerNetwork?.[city.idx(building.x, building.y)];
      if (network >= 0) for (let index = 0; index < city.count; index++) {
        if (city.powered[index] && city.powerNetwork[index] === network) tiles.push(index);
      }
    } else {
      const cx = building.x + (definition.size - 1) / 2;
      const cy = building.y + (definition.size - 1) / 2;
      const radius = definition.radius;
      for (let y = Math.max(0, Math.floor(cy - radius)); y <= Math.min(city.size - 1, Math.ceil(cy + radius)); y++) {
        for (let x = Math.max(0, Math.floor(cx - radius)); x <= Math.min(city.size - 1, Math.ceil(cx + radius)); x++) {
          if (Math.hypot(x - cx, y - cy) <= radius && city.terrain[city.idx(x, y)] === 0) tiles.push(city.idx(x, y));
        }
      }
    }
    // Invalid placement retains its red footprint instead of suggesting usable coverage.
    if (placing && preview?.color === "#e0392b") return preview;
    return { tiles: [...new Set([...tiles, ...preview?.tiles ?? []])], color: colors[definition.dept ?? definition.category] ?? colors.park, alpha: 0.22, stroke: "rgba(255,255,255,0.18)" };
  }
  function refreshGrowth(city) {
    if (!growthView || growthView.city !== city || !selected || document.getElementById("query").hidden) return;
    const state = window.__zoneGrowth.inspect(city, city.idx(selected.x, selected.y));
    if (!state) { growthView.section.hidden = true; return; }
    const { section, label, value, progress, status, statusText, tiers, translate, copy } = growthView;
    section.hidden = false;
    const percent = Math.floor(state.progress * 100);
    const paused = document.querySelector('#speed button[data-speed="0"].active') !== null;
    const renderKey = `${state.zone}:${state.tier}:${percent}:${state.status}:${paused}`;
    if (growthView.renderKey === renderKey) return;
    growthView.renderKey = renderKey;
    section.style.setProperty("--growth-color", zoneColors[state.zone]);
    label.textContent = state.tier === 5 ? copy("Tier 5 · Fully developed", "Niveau 5 · Développement maximal")
      : copy(`Tier ${state.tier} → ${state.next}`, `Niveau ${state.tier} → ${state.next}`);
    value.textContent = `${percent}%`;
    progress.value = percent;
    for (const [index, step] of [...tiers.children].entries()) {
      step.classList.toggle("reached", index < state.tier);
      step.classList.toggle("next", index === state.tier);
    }
    const messages = {
      growing: copy("Developing toward the next tier", "Développement vers le prochain niveau"),
      complete: copy("Maximum tier reached", "Niveau maximal atteint"),
      bankrupt: copy("Growth stopped: city is bankrupt", "Croissance arrêtée : ville en faillite"),
      disaster: copy("Growth blocked by fire or flooding", "Croissance bloquée par un incendie ou une inondation"),
      road: copy("Needs road access", "Accès routier nécessaire"),
      power: copy("Needs a power connection", "Connexion électrique nécessaire"),
      jobs: copy("Needs reachable jobs", "Emplois accessibles nécessaires"),
      workers: copy("Needs reachable residents", "Résidents accessibles nécessaires"),
      demand: state.zone === 3
        ? copy("Low housing demand · Add jobs or lower taxes", "Faible demande de logements · Ajoutez des emplois ou baissez les impôts")
        : state.zone === 4
          ? copy("Low shop demand · Grow population or lower taxes", "Faible demande commerciale · Augmentez la population ou baissez les impôts")
          : copy("Low industry demand · Grow population or lower taxes", "Faible demande industrielle · Augmentez la population ou baissez les impôts"),
      water: copy("Needs water to reach tier 3 and above", "Eau nécessaire à partir du niveau 3"),
      pollution: copy("Reduce pollution to allow higher tiers", "Réduisez la pollution pour atteindre les niveaux supérieurs"),
      land: copy("Improve land value with parks and services", "Améliorez la valeur foncière avec des parcs et des services"),
      footprint: copy(`Ready: needs a connected ${state.next === 4 ? "2 × 2" : "3 × 3"} block of tier ${state.tier} zones`,
        `Prêt : nécessite un bloc connecté de ${state.next === 4 ? "2 × 2" : "3 × 3"} zones de niveau ${state.tier}`),
    };
    statusText.textContent = messages[state.status];
    if (paused && state.status === "growing") statusText.textContent = copy("Paused · Development progress retained", "En pause · Progression conservée");
    status.classList.toggle("query-warning", !["growing", "complete"].includes(state.status));
    document.getElementById("query-title").textContent = translate("query.zone", { label: translate(`zone.${state.zone}`), lvl: state.tier });
  }
  function drawGrowth(renderer, city) {
    if (!selected || document.getElementById("query").hidden || renderer.dataMap !== "none") return;
    refreshGrowth(city);
    const state = window.__zoneGrowth?.inspect(city, city.idx(selected.x, selected.y));
    if (!state) return;
    let { x, y } = selected;
    const turns = (window.__mapRotation?.getAngle() ?? 0) / 90;
    for (let turn = 0; turn < turns; turn++) [x, y] = [city.size - 1 - y, x];
    const point = renderer.worldToScreen((x - y) * 32,
      (x + y + 1) * 16 - city.base(selected.x, selected.y) * 8);
    const width = Math.max(42, Math.min(70, 58 * renderer.camera.zoom));
    const left = point.x - width / 2, top = point.y + 6;
    const ctx = renderer.ctx;
    ctx.save();
    ctx.setTransform(renderer.dpr, 0, 0, renderer.dpr, 0, 0);
    ctx.fillStyle = "#182131";
    ctx.strokeStyle = "#dce5ef";
    ctx.lineWidth = 1;
    ctx.fillRect(left - 3, top - 3, width + 6, 25);
    ctx.strokeRect(left - 3, top - 3, width + 6, 25);
    ctx.fillStyle = "#edf0f5";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${state.tier}/5 · ${Math.floor(state.progress * 100)}%`, point.x, top + 8);
    ctx.fillStyle = "#41516a";
    ctx.fillRect(left, top + 12, width, 5);
    ctx.fillStyle = zoneColors[state.zone];
    ctx.fillRect(left, top + 12, width * state.progress, 5);
    ctx.restore();
  }
  window.__queryCoverage = { show, overlay, refreshGrowth, drawGrowth };
})();
