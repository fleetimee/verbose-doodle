(() => {
  let definitions, capacities, zones, translate;
  const key = building => `${building.type}:${building.x}:${building.y}`;
  const copy = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  function install(allDefinitions, residents, commerce, industry, overlays, localize) {
    definitions = allDefinitions; zones = overlays; translate = localize;
    capacities = { [zones.Res]: [residents, 0.5], [zones.Com]: [commerce, 0.8], [zones.Ind]: [industry, 0.6] };
  }
  function report(city) {
    const rows = [], state = window.__industry.initialize(city);
    const days = window.__townCalendar.daysInMonth(city.year, city.month), rate = city.taxRate / 100;
    const value = index => 0.6 + city.landValue[index] / 255 * 0.8;
    for (const building of city.structs.values()) {
      const def = definitions[building.type], index = city.idx(building.x, building.y);
      let taxes = 0;
      if (def.taxable && city.powered[index] && city.roadDist[index] !== 255) taxes = ((def.pop ?? 0) * 0.5 + (def.jobs ?? 0) * 0.8) * value(index) * rate;
      const industry = window.__industry.byType[building.type];
      if (industry && !window.__industry.inspect(city, building).reason) taxes += industry.jobs * 0.6 * rate;
      const recent = state.lastByBuilding[key(building)];
      const exports = (recent?.exports ?? 0) * days, savings = (recent?.savings ?? 0) * days;
      const upkeep = def.upkeep * city.diff.costMul * (def.dept ? city.funding[def.dept] / 100 : 1);
      rows.push({ id: `s-${building.id}`, type: building.type, taxable: !!def.taxable, name: translate(`struct.${building.type}`), x: building.x, y: building.y, taxes, exports, income: taxes + exports, savings, upkeep, net: taxes + exports + savings - upkeep });
    }
    // Include every developed tile exactly once, including legacy saves without lot records.
    const covered = new Set();
    function lot(building, id) {
      let taxes = 0, developed = false;
      for (let y = building.y; y < building.y + building.size; y++) for (let x = building.x; x < building.x + building.size; x++) {
        const index = city.idx(x, y), formula = capacities[city.overlay[index]];
        if (covered.has(index) || !formula || !city.level[index]) continue;
        covered.add(index); developed = true; taxes += formula[0][city.level[index]] * formula[1] * value(index) * rate;
      }
      if (!developed) return;
      const name = building.zone === zones.Res ? copy("Residential building", "Bâtiment résidentiel") : building.zone === zones.Com ? copy("Commercial building", "Bâtiment commercial") : copy("Industrial building", "Bâtiment industriel");
      rows.push({ id, type: `zone-${building.zone}`, name, x: building.x, y: building.y, taxes, exports: 0, income: taxes, savings: 0, upkeep: 0, net: taxes });
    }
    for (const building of city.buildings.values()) lot(building, `b-${building.id}`);
    for (let index = 0; index < city.count; index++) if (!covered.has(index) && capacities[city.overlay[index]] && city.level[index]) lot({ x: index % city.size, y: Math.floor(index / city.size), size: 1, zone: city.overlay[index] }, `t-${index}`);
    const totals = rows.reduce((sum, row) => { for (const field of ["income", "savings", "upkeep", "net"]) sum[field] += row[field]; return sum; }, { income: 0, savings: 0, upkeep: 0, net: 0 });
    const assignedTrade = rows.reduce((sum, row) => sum + row.exports + row.savings, 0);
    return { rows, totals, unassignedTrade: Math.max(0, (state.lastTrade + state.lastFuel) * days - assignedTrade), citywideCosts: ["roads", "ordinances", "interest"].reduce((sum, field) => sum + (city.lastBudget[field] ?? 0), 0) };
  }
  window.__buildingFinances = { install, report };
})();
