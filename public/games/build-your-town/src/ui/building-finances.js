(() => {
  let ui, panel, results, summary, title, sort, group, queryTile, opener, currentCity;
  const copy = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const money = value => new Intl.NumberFormat(document.documentElement.lang, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
  const label = () => copy("Building finances", "Finances des bâtiments");
  function button() {
    const element = node("button", copy("Compare building income", "Comparer les recettes des bâtiments"), "finance-open");
    element.type = "button"; element.setAttribute("aria-controls", "panel-building-finances");
    element.addEventListener("click", () => {
      opener = element; ui.closePanels(); document.getElementById("query").hidden = true; panel.hidden = false; update(window.__city); panel.querySelector(".close").focus();
    });
    return element;
  }
  function hide() {
    panel.hidden = true;
    if (opener?.isConnected) {
      const query = opener.closest("#query");
      if (query) query.hidden = false;
      const parent = opener.closest(".panel");
      if (parent?.hidden) ui.openPanel(parent.id);
      if (!opener.closest("[hidden]")) opener.focus();
    }
  }
  function mount(target) {
    ui = target;
    if (panel) return;
    panel = node("section", undefined, "panel"); panel.id = "panel-building-finances"; panel.hidden = true;
    panel.setAttribute("aria-labelledby", "building-finances-title");
    const head = node("div", undefined, "head"); title = node("h2", label()); title.id = "building-finances-title";
    const close = node("button", "×", "close"); close.type = "button"; close.addEventListener("click", hide); head.append(title, close);
    const body = node("div", undefined, "body"), controls = node("div", undefined, "finance-controls");
    sort = node("select"); sort.id = "finance-sort";
    group = node("select"); group.id = "finance-group";
    const sortLabel = node("label"), groupLabel = node("label");
    sortLabel.append(node("span"), sort); groupLabel.append(node("span"), group); controls.append(sortLabel, groupLabel);
    for (const value of ["income", "net", "upkeep"]) { const option = node("option"); option.value = value; sort.append(option); }
    for (const value of ["building", "type"]) { const option = node("option"); option.value = value; group.append(option); }
    sort.addEventListener("change", () => update(window.__city)); group.addEventListener("change", () => update(window.__city));
    summary = node("p", undefined, "finance-summary"); results = node("div", undefined, "finance-results");
    body.append(controls, summary, results); panel.append(head, body); document.body.append(panel);
    panel.addEventListener("keydown", event => { event.stopPropagation(); if (event.key === "Escape") { event.preventDefault(); hide(); } });
    panel.addEventListener("pointerdown", event => event.stopPropagation());
    const closePanels = ui.closePanels.bind(ui);
    ui.closePanels = () => { closePanels(); panel.hidden = true; };
    const budget = document.getElementById("budget-body"); budget.prepend(button());
  }
  function update(city) {
    if (!city || !panel) return;
    if (city !== currentCity) { currentCity = city; queryTile = null; }
    document.querySelectorAll(".finance-open").forEach(element => { element.textContent = copy("Compare building income", "Comparer les recettes des bâtiments"); });
    if (queryTile && !document.getElementById("query").hidden) renderQuery(city);
    if (panel.hidden) return;
    const report = window.__buildingFinances.report(city);
    title.textContent = label(); panel.querySelector(".close").setAttribute("aria-label", copy("Close building finances", "Fermer les finances des bâtiments"));
    sort.parentElement.firstChild.textContent = copy("Rank by", "Classer par"); group.parentElement.firstChild.textContent = copy("Show", "Afficher");
    const columns = [copy("Income", "Recettes"), copy("Savings", "Économies"), copy("Upkeep", "Entretien"), copy("Net", "Solde")];
    [...sort.options].forEach((option, i) => { option.textContent = [columns[0], columns[3], columns[2]][i]; });
    group.options[0].textContent = copy("Each building", "Chaque bâtiment"); group.options[1].textContent = copy("Building types", "Types de bâtiments");
    summary.textContent = copy("Monthly forecast. Income = taxes + exports. Net = income + fuel savings − upkeep. Exports and savings use the latest simulated hour; this is not a lifetime earnings total.", "Prévision mensuelle. Recettes = impôts + exports. Solde = recettes + économies de combustible − entretien. Exports et économies suivent la dernière heure simulée ; ce ne sont pas des gains cumulés.");
    let rows = report.rows;
    if (group.value === "type") {
      const types = new Map();
      for (const row of rows) {
        if (!types.has(row.type)) types.set(row.type, { ...row, count: 0, income: 0, savings: 0, upkeep: 0, net: 0 });
        const total = types.get(row.type); total.count++;
        for (const field of ["income", "savings", "upkeep", "net"]) total[field] += row[field];
      }
      rows = [...types.values()];
    }
    rows = rows.slice().sort((a, b) => b[sort.value] - a[sort.value] || a.name.localeCompare(b.name) || a.y - b.y || a.x - b.x);
    const fragment = document.createDocumentFragment();
    if (!rows.length) fragment.append(node("p", copy("No buildings yet. Build services or develop zones to compare their finances here.", "Aucun bâtiment. Construisez des services ou développez des zones pour comparer leurs finances ici.")));
    else {
      const scroll = node("div", undefined, "finance-table-scroll"); scroll.tabIndex = 0; scroll.setAttribute("role", "region"); scroll.setAttribute("aria-label", copy("Building ranking, scroll for all columns", "Classement des bâtiments, défiler pour toutes les colonnes"));
      const table = node("table"), caption = node("caption", copy("Highest first · monthly amounts", "Du plus élevé au plus bas · montants mensuels"));
      const header = node("tr");
      for (const text of [copy("Building", "Bâtiment"), ...columns]) { const cell = node("th", text); cell.scope = "col"; header.append(cell); }
      const thead = node("thead"); thead.append(header); const tbody = node("tbody");
      rows.forEach((row, rank) => {
        const tr = node("tr"), name = node("th"); name.scope = "row";
        const locate = node("button", `${rank + 1}. ${row.name}${row.count ? ` ×${row.count}` : ""}`); locate.type = "button"; locate.dataset.financeRow = row.id;
        locate.title = copy(`Locate at ${row.x}, ${row.y}`, `Localiser en ${row.x}, ${row.y}`);
        locate.addEventListener("click", () => window.__focusCityTile(row.x, row.y));
        name.append(locate, node("small", row.count ? copy("Combined total · locate first", "Total cumulé · localiser le premier") : `${row.x}, ${row.y}`)); tr.append(name);
        for (const field of ["income", "savings", "upkeep", "net"]) tr.append(node("td", money(row[field]), field === "net" && row.net < 0 ? "finance-negative" : ""));
        tbody.append(tr);
      });
      const footer = node("tr"), totalLabel = node("th", copy("All buildings", "Tous les bâtiments")); totalLabel.scope = "row"; footer.append(totalLabel);
      for (const field of ["income", "savings", "upkeep", "net"]) footer.append(node("td", money(report.totals[field])));
      const tfoot = node("tfoot"); tfoot.append(footer); table.append(caption, thead, tbody, tfoot); scroll.append(table); fragment.append(scroll);
    }
    fragment.append(node("p", copy("Services, stations, and freight terminals earn no fares or service fees. They support residents, jobs, and trade; export income belongs to the producing facility. Zoned buildings pay taxes and have no city-paid building upkeep.", "Services, gares et terminaux ne perçoivent aucun tarif ni frais. Ils soutiennent habitants, emplois et commerce ; les exports sont attribués au producteur. Les bâtiments de zone paient des impôts, sans entretien municipal du bâtiment."), "finance-note"));
    fragment.append(node("p", `${copy("Citywide costs outside this ranking (roads, wires, rail, highways, ordinances, bond interest)", "Coûts municipaux hors classement (routes, câbles, rails, autoroutes, arrêtés, intérêts)")}: ${money(report.citywideCosts)}.`, "finance-note"));
    if (report.unassignedTrade > 0.001) fragment.append(node("p", `${copy("Exports / savings not attributed to a current building", "Exports / économies sans bâtiment actuel")}: ${money(report.unassignedTrade)}. ${copy("Older saves and recently demolished facilities may have unattributed earnings until the next simulated hour.", "Les anciennes sauvegardes et les installations récemment démolies peuvent avoir des gains non attribués jusqu’à la prochaine heure simulée.")}`, "finance-note"));
    const signature = fragment.textContent;
    if (results.dataset.signature !== signature) {
      const focused = results.contains(document.activeElement) ? document.activeElement.dataset.financeRow : null;
      const scrollFocused = document.activeElement === results.querySelector(".finance-table-scroll");
      const scrollTop = panel.querySelector(".body").scrollTop, scrollLeft = results.querySelector(".finance-table-scroll")?.scrollLeft ?? 0;
      results.replaceChildren(fragment); results.dataset.signature = signature;
      if (focused) [...results.querySelectorAll("[data-finance-row]")].find(element => element.dataset.financeRow === focused)?.focus({ preventScroll: true });
      panel.querySelector(".body").scrollTop = scrollTop;
      const scroll = results.querySelector(".finance-table-scroll");
      if (scroll) {
        scroll.scrollLeft = scrollLeft;
        if (scrollFocused) scroll.focus({ preventScroll: true });
      }
    }
  }
  function query(selected, city) { currentCity = city; queryTile = selected?.tile ?? null; if (queryTile) renderQuery(city); }
  function renderQuery(city) {
    const body = document.getElementById("query-body"), index = city.idx(queryTile.x, queryTile.y);
    const building = city.structAt(index), lot = city.buildingAt(index);
    const id = building ? `s-${building.id}` : lot ? `b-${lot.id}` : `t-${index}`;
    const row = window.__buildingFinances.report(city).rows.find(item => item.id === id);
    let section = body.querySelector(".building-finance-query");
    if (!row) { section?.remove(); return; }
    if (!section) { section = node("section", undefined, "building-finance-query query-details"); body.append(section); }
    const content = [node("h3", copy("Monthly finances", "Finances mensuelles"))], ledger = node("dl", undefined, "finance-ledger");
    for (const [name, value] of [[copy("Taxes", "Impôts"), row.taxes], [copy("Export income", "Recettes d’export"), row.exports], [copy("Fuel savings", "Économies de combustible"), row.savings], [copy("Upkeep", "Entretien"), row.upkeep], [copy("Net contribution", "Contribution nette"), row.net]]) ledger.append(node("dt", name), node("dd", money(value)));
    content.push(ledger, node("p", copy("Forecast at current taxes and funding. Exports and savings follow the latest simulated hour.", "Prévision selon impôts et financement actuels. Exports et économies suivent la dernière heure simulée.")));
    if (building && !row.taxable && !window.__industry.byType[building.type]) content.push(node("p", copy("No direct income is modeled for this building. Its benefit is the capacity or coverage it provides to the city.", "Aucune recette directe n’est prévue pour ce bâtiment. Il apporte de la capacité ou une couverture à la ville.")));
    const signature = content.map(element => element.textContent).join();
    if (section.dataset.signature !== signature) {
      const focused = section.contains(document.activeElement);
      section.replaceChildren(...content, button()); section.dataset.signature = signature;
      if (focused) section.querySelector("button").focus({ preventScroll: true });
    }
  }
  window.__buildingFinanceUI = { mount, update, query };
})();
