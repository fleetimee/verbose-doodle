(() => {
  let ui, panel, body, selectedResource = "all", layer = false, placing = null, queryTile = null;
  const copy = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const number = value => new Intl.NumberFormat(document.documentElement.lang, { maximumFractionDigits: 1 }).format(value);
  const money = value => new Intl.NumberFormat(document.documentElement.lang, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  const resourceName = resource => window.__industry.resources[resource].name[document.documentElement.lang === "fr" ? 0 : 1];
  const buildingName = def => def.name[document.documentElement.lang === "fr" ? 0 : 1];
  const reasons = () => ({ road: copy("No road connection", "Aucun accès routier"), power: copy("No electricity", "Sans électricité"), water: copy("Water required", "Eau requise"), damage: copy("Fire or flood damage", "Incendie ou inondation"), deposit: copy("Deposit missing or exhausted", "Gisement absent ou épuisé"), inputs: copy("Waiting for connected suppliers", "En attente de fournisseurs reliés"), storage: copy("Storage full · add freight access", "Stock plein · ajouter un accès fret") });
  const recipe = values => Object.entries(values ?? {}).map(([r, value]) => `${number(value)} ${resourceName(r)}`).join(" + ");
  function icon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "1.7"); svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", "M3 21V10l6 3V9l6 4V3h4v18H3Zm4-4h2m3 0h2m3 0h2"); svg.append(path);
    return svg;
  }
  function mount(target) {
    ui = target;
    if (panel) return;
    const button = node("button", undefined, "menu-btn");
    button.id = "btn-industry"; button.type = "button"; button.append(icon());
    button.title = copy("Industry & resources", "Industries et ressources"); button.setAttribute("aria-label", button.title);
    button.setAttribute("aria-controls", "panel-industry"); button.setAttribute("aria-expanded", "false");
    document.getElementById("toolbar").append(button);
    panel = node("section", undefined, "panel"); panel.id = "panel-industry"; panel.hidden = true;
    panel.setAttribute("aria-labelledby", "industry-title");
    const head = node("div", undefined, "head"), title = node("h2", button.title);
    title.id = "industry-title";
    const close = node("button", "×", "close"); close.type = "button"; close.setAttribute("aria-label", copy("Close industry", "Fermer les industries"));
    head.append(title, close); body = node("div", undefined, "body");
    const controls = node("div", undefined, "industry-controls");
    const toggle = node("button", copy("Show deposits", "Afficher les gisements")); toggle.type = "button"; toggle.setAttribute("aria-pressed", "false");
    const filter = node("select"); filter.setAttribute("aria-label", copy("Resource map", "Carte des ressources"));
    for (const r of ["all", "coal", "iron", "copper"]) {
      const option = node("option", r === "all" ? copy("All deposits", "Tous les gisements") : resourceName(r)); option.value = r; filter.append(option);
    }
    const redraw = () => { toggle.setAttribute("aria-pressed", String(layer)); toggle.textContent = layer ? copy("Hide deposits", "Masquer les gisements") : copy("Show deposits", "Afficher les gisements"); window.__townView?.redraw(); };
    toggle.addEventListener("click", () => { layer = !layer; redraw(); });
    filter.addEventListener("change", () => { selectedResource = filter.value; layer = true; redraw(); });
    controls.append(toggle, filter); panel.append(head, controls, body); document.body.append(panel);
    panel.addEventListener("keydown", event => {
      if (event.key !== "Escape") event.stopPropagation();
    });
    const hide = () => { panel.hidden = true; button.setAttribute("aria-expanded", "false"); button.focus(); };
    close.addEventListener("click", hide);
    button.addEventListener("click", () => {
      if (!panel.hidden) { hide(); return; }
      ui.closePanels(); panel.hidden = false; button.setAttribute("aria-expanded", "true"); update(window.__city); close.focus();
    });
    const closePanels = ui.closePanels.bind(ui);
    ui.closePanels = () => { closePanels(); panel.hidden = true; button.setAttribute("aria-expanded", "false"); };
    ui.flyout.addEventListener("keydown", event => {
      const found = [...ui.groupButtons.entries()].find(([, group]) => group.items.some(item => item.tool === "coalmine"));
      if (!found || ui.openFlyout !== found[0]) return;
      if (event.key === "Escape") {
        event.preventDefault(); event.stopPropagation(); ui.closeFlyout(); found[1].button.focus();
      } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        const options = [...ui.flyout.querySelectorAll("button:not(:disabled)")];
        const current = options.indexOf(document.activeElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 :
          (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        options[next]?.focus();
      }
    });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !panel.hidden) { event.stopPropagation(); hide(); } });
    const budgetBody = document.getElementById("budget-body");
    for (const [id, label] of [["industry-trade", copy("Resource exports + fuel savings", "Exports et économies de charbon")], ["industry-upkeep", copy("Industry upkeep", "Entretien industriel")]]) {
      const row = node("div", undefined, "row"); row.append(node("span", label), node("span"));
      const amount = node("span", "", "num"); amount.id = id; row.append(amount); budgetBody.append(row);
    }
  }
  function update(city) {
    if (!city || !panel) return;
    const industry = window.__industry, state = industry.initialize(city);
    document.getElementById("industry-trade").textContent = money(city.lastBudget.industryTrade ?? 0);
    document.getElementById("industry-upkeep").textContent = money(city.lastBudget.industryUpkeep ?? 0);
    if (queryTile && !document.getElementById("query").hidden) renderQuery(city);
    if (panel.hidden) return;
    // Keep controls and focus stable while simulation values refresh.
    const fragment = document.createDocumentFragment();
    fragment.append(node("p", copy("Coal → power savings. Coal + iron → steel. Steel + copper → goods. Roads carry supplies; terminals beside rail bridge road districts.", "Charbon → économies d’énergie. Charbon + fer → acier. Acier + cuivre → produits. Les routes transportent les ressources ; les terminaux près du rail relient les quartiers."), "industry-intro"));
    const ledger = node("dl", undefined, "industry-ledger");
    ledger.append(node("dt", copy("Export revenue to date", "Recettes d’export cumulées")), node("dd", money(state.earned)));
    ledger.append(node("dt", copy("Exported units", "Unités exportées")), node("dd", number(state.exported)));
    for (const r of Object.keys(industry.resources)) {
      const quantity = Object.values(state.stocks).reduce((sum, stock) => sum + stock[r], 0);
      ledger.append(node("dt", `${resourceName(r)} · ${money(industry.resources[r].price)}${copy(" / unit", " / unité")}`), node("dd", number(quantity)));
    }
    fragment.append(ledger, node("h3", copy("Facilities", "Installations")));
    for (const def of industry.buildings) {
      const facilities = [...city.structs.values()].filter(b => b.type === def.type);
      const open = facilities.filter(b => !industry.inspect(city, b).reason).length;
      const row = node("div", undefined, "industry-facility");
      const label = node("div"); label.append(node("strong", buildingName(def)), node("span", `${open}/${facilities.length} ${copy("operating", "en activité")}`, "industry-secondary"));
      row.append(label);
      const build = node("button", copy("Build", "Construire")); build.type = "button";
      build.dataset.industryAction = `build-${def.type}`;
      build.disabled = city.maxPop < def.unlockPop; build.title = build.disabled ? copy(`Requires ${def.unlockPop} residents`, `${def.unlockPop} habitants requis`) : `${money(def.cost)} · ${def.size}×${def.size}`;
      build.addEventListener("click", () => { ui.closePanels(); ui.handlers.onTool(def.type, false); }); row.append(build);
      if (facilities.length) {
        const locate = node("button", copy("Locate", "Localiser")); locate.type = "button";
        locate.dataset.industryAction = `locate-${def.type}`;
        locate.addEventListener("click", () => window.__focusCityTile(facilities[0].x, facilities[0].y)); row.append(locate);
      }
      fragment.append(row);
      fragment.append(node("p", def.output ? `${recipe(def.input)}${def.input ? " → " : ""}${recipe(def.output)} ${copy("/ day", "/ jour")}` : copy("48 exports/day · road access and electricity", "48 exports/jour · route et électricité"), "industry-recipe"));
    }
    fragment.append(node("h3", copy("Deposits", "Gisements")));
    for (const deposit of state.deposits) {
      const row = node("div", undefined, "industry-deposit");
      const focus = node("button", `${resourceName(deposit.resource)} · ${deposit.x}, ${deposit.y}`); focus.type = "button";
      focus.dataset.industryAction = `deposit-${deposit.x}-${deposit.y}`;
      focus.addEventListener("click", () => { selectedResource = deposit.resource; layer = true; filterResource(); window.__focusCityTile(deposit.x, deposit.y); });
      row.append(focus, node("span", `${number(deposit.remaining)} ${copy("left", "restantes")}`)); fragment.append(row);
    }
    fragment.append(node("p", copy("Exports require a freight terminal, an operating seaport, or a road reaching the map edge. Two days of factory inputs are reserved before surplus is sold. Storage holds 240 units of each resource per facility. Mines stop when deposits run out; demolishing a facility discards its stock.", "Les exports nécessitent un terminal, un port actif ou une route jusqu’au bord de la carte. Deux jours d’intrants sont réservés avant la vente du surplus. Chaque installation stocke 240 unités par ressource. Les mines s’arrêtent à l’épuisement ; démolir supprime le stock."), "industry-note"));
    // Refresh values without losing keyboard focus or the player's scroll position.
    const signature = fragment.textContent + [...fragment.querySelectorAll("button")].map(b => b.disabled).join();
    if (body.dataset.signature !== signature) {
      const action = body.contains(document.activeElement) ? document.activeElement.dataset.industryAction : null;
      const scroll = body.scrollTop;
      body.replaceChildren(fragment); body.dataset.signature = signature;
      if (action) body.querySelector(`[data-industry-action="${action}"]`)?.focus({ preventScroll: true });
      body.scrollTop = scroll;
    }
  }
  function filterResource() {
    panel.querySelector("select").value = selectedResource;
    const toggle = panel.querySelector(".industry-controls button"); toggle.setAttribute("aria-pressed", String(layer));
    toggle.textContent = layer ? copy("Hide deposits", "Masquer les gisements") : copy("Show deposits", "Afficher les gisements");
  }
  function query(query, city) {
    queryTile = query?.tile ?? null;
    if (queryTile) renderQuery(city);
  }
  function renderQuery(city) {
    const body = document.getElementById("query-body");
    let section = body.querySelector(".industry-query");
    const building = city.structAt(city.idx(queryTile.x, queryTile.y));
    const info = building && window.__industry.inspect(city, building);
    const deposit = window.__industry.depositAt(city, queryTile);
    if (!info && !deposit && building?.type !== "coal") { section?.remove(); return; }
    if (!section) { section = node("section", undefined, "industry-query query-details"); body.append(section); }
    const content = [node("h3", copy("Industry & resources", "Industries et ressources"))];
    if (deposit) content.push(node("p", `${resourceName(deposit.resource)} · ${number(deposit.remaining)} ${copy("units remaining", "unités restantes")}`));
    if (info) {
      const status = info.reason ? reasons()[info.reason] : copy("Operating", "En activité");
      content.push(node("p", status, info.reason ? "query-warning" : "query-success"));
      content.push(node("p", `${info.reason ? 0 : info.definition.jobs} ${copy("active jobs", "emplois actifs")} · ${info.definition.consumes} MW · ${copy("Water", "Eau")}: ${info.definition.exportCapacity ? copy("not required", "non requise") : city.watered[city.idx(building.x, building.y)] ? copy("connected", "raccordée") : copy("missing", "absente")}`));
      if (info.definition.output) content.push(node("p", `${recipe(info.definition.input)}${info.definition.input ? " → " : ""}${recipe(info.definition.output)} ${copy("/ day at full capacity", "/ jour à pleine capacité")}`));
      const inventory = Object.entries(info.stock).filter(([, value]) => value > 0.001).map(([r, value]) => `${resourceName(r)} ${number(value)}`).join(" · ");
      content.push(node("p", `${copy("Stored", "Stock")}: ${inventory || "0"}`));
      content.push(node("p", `${copy("Connected export capacity", "Capacité d’export reliée")}: ${number(info.exportCapacity)} ${copy("units/day", "unités/jour")}`));
    }
    if (building?.type === "coal") content.push(node("p", copy("A connected coal mine supplies local fuel: up to 40% less plant upkeep, consuming 8 coal/day. Without local coal the plant uses its usual fuel supply.", "Une mine reliée fournit le combustible local : jusqu’à 40 % d’entretien en moins, pour 8 charbons/jour. Sans charbon local, la centrale utilise son approvisionnement habituel.")));
    for (const element of content) {
      if (element.tagName !== "P") continue;
      const text = element.textContent;
      element.dataset.townHelp = text.startsWith(`${copy("Stored", "Stock")}:`) || text.startsWith(`${copy("Connected export capacity", "Capacité d’export reliée")}:`)
        ? "exports" : deposit && element === content[1] ? "deposits" : "industry";
    }
    const signature = content.map(el => el.textContent).join();
    if (section.dataset.signature !== signature) { section.replaceChildren(...content); section.dataset.signature = signature; }
  }
  function overlay(_city, preview, tool) { placing = window.__industry.byType[tool]?.deposit ?? null; return preview; }
  function draw(renderer, city) {
    if ((!layer && !placing) || renderer.dataMap !== "none") return;
    const resource = placing ?? selectedResource;
    const ctx = renderer.ctx, turns = (window.__mapRotation?.getAngle() ?? 0) / 90;
    const project = (x, y) => {
      const height = city.base(Math.min(city.size - 1, Math.floor(x)), Math.min(city.size - 1, Math.floor(y)));
      for (let n = 0; n < turns; n++) [x, y] = [city.size - y, x];
      return renderer.worldToScreen((x - y) * 32, (x + y) * 16 - height * 8);
    };
    ctx.save(); ctx.setTransform(renderer.dpr, 0, 0, renderer.dpr, 0, 0);
    for (const deposit of window.__industry.initialize(city).deposits) {
      if (resource !== "all" && deposit.resource !== resource || deposit.remaining <= 0) continue;
      const center = project(deposit.x + 0.5, deposit.y + 0.5);
      if (center.x < -300 || center.x > renderer.width + 300 || center.y < -200 || center.y > renderer.height + 200) continue;
      ctx.strokeStyle = window.__industry.resources[deposit.resource].color; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 1;
      for (let y = Math.max(0, deposit.y - 7); y <= Math.min(city.size - 1, deposit.y + 7); y++) for (let x = Math.max(0, deposit.x - 7); x <= Math.min(city.size - 1, deposit.x + 7); x++) {
        if (Math.hypot(x - deposit.x, y - deposit.y) > 7 || city.terrain[city.idx(x, y)] !== 0) continue;
        ctx.beginPath();
        for (const [n, [u, v]] of [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]].entries()) { const p = project(u, v); if (n) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
        ctx.closePath(); ctx.globalAlpha = 0.16; ctx.fill(); ctx.globalAlpha = 0.5; ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.font = "bold 11px sans-serif";
      const label = `${resourceName(deposit.resource)} · ${number(deposit.remaining)}`, width = ctx.measureText(label).width + 16;
      ctx.fillStyle = "#182131"; ctx.fillRect(center.x - width / 2, center.y - 24, width, 21);
      ctx.fillStyle = window.__industry.resources[deposit.resource].color; ctx.textAlign = "center"; ctx.fillText(label, center.x, center.y - 10);
    }
    ctx.restore();
  }
  function choose(target = ui) {
    const found = [...target.groupButtons.entries()].find(([, group]) => group.items.some(item => item.tool === "coalmine"));
    if (!found) return;
    const [name, group] = found;
    group.button.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (target.openFlyout !== name) group.button.click();
    target.flyout.querySelector("button:not(:disabled)")?.focus();
  }
  window.__industryUI = { mount, update, query, overlay, draw, choose };
})();
