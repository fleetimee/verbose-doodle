(() => {
  const resources = {
    coal: { name: ["Charbon", "Coal"], color: "#aab4c9", price: 4 },
    iron: { name: ["Minerai de fer", "Iron ore"], color: "#e4a07c", price: 6 },
    copper: { name: ["Minerai de cuivre", "Copper ore"], color: "#83cfba", price: 10 },
    steel: { name: ["Acier", "Steel"], color: "#a9c9e7", price: 22 },
    goods: { name: ["Produits manufacturés", "Manufactured goods"], color: "#edce83", price: 45 },
  };
  const buildings = [
    { type: "coalmine", name: ["Mine de charbon", "Coal mine"], size: 3, cost: 3200, upkeep: 35, consumes: 4, jobs: 80, pollution: 38, unlockPop: 0, deposit: "coal", output: { coal: 24 } },
    { type: "ironmine", name: ["Mine de fer", "Iron mine"], size: 3, cost: 4200, upkeep: 45, consumes: 6, jobs: 100, pollution: 30, unlockPop: 500, deposit: "iron", output: { iron: 20 } },
    { type: "coppermine", name: ["Mine de cuivre", "Copper mine"], size: 3, cost: 5500, upkeep: 55, consumes: 8, jobs: 110, pollution: 26, unlockPop: 1500, deposit: "copper", output: { copper: 12 } },
    { type: "steelmill", name: ["Aciérie", "Steel mill"], size: 4, cost: 9000, upkeep: 90, consumes: 18, jobs: 240, pollution: 65, unlockPop: 2000, input: { coal: 12, iron: 16 }, output: { steel: 12 } },
    { type: "goodsfactory", name: ["Usine de fabrication", "Goods factory"], size: 4, cost: 12500, upkeep: 110, consumes: 14, jobs: 300, pollution: 22, unlockPop: 3500, input: { steel: 8, copper: 6 }, output: { goods: 10 } },
    { type: "freightterminal", name: ["Terminal de fret", "Freight terminal"], size: 3, cost: 2400, upkeep: 25, consumes: 2, jobs: 40, pollution: 8, unlockPop: 0, exportCapacity: 48 },
  ];
  const byType = Object.fromEntries(buildings.map(def => [def.type, def]));
  const runtime = new WeakMap();
  const storage = 240;
  let definitions;
  const finite = (value, max) => Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
  const hash = value => { value = Math.imul(value ^ value >>> 16, 2246822507); return (value ^ value >>> 13) >>> 0; };
  const key = building => `${building.type}:${building.x}:${building.y}`;
  function initialize(city) {
    if (city.industry) {
      city.industry.freight ??= [];
      city.industry.freightSequence ??= 0;
      return city.industry;
    }
    const deposits = [];
    for (const resource of ["coal", "iron", "copper"]) for (let n = 0; n < 3; n++) {
      let best, score = -Infinity;
      for (let y = 3; y < city.size - 5; y += 3) for (let x = 3; x < city.size - 5; x += 3) {
        if (city.terrain[city.idx(x, y)] !== 0) continue;
        let land = true, flat = true;
        const base = city.base(x, y);
        for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
          if (city.terrain[city.idx(x + dx, y + dy)] !== 0) land = false;
          if (!city.isFlat(x + dx, y + dy) || city.base(x + dx, y + dy) !== base) flat = false;
        }
        if (!land || deposits.some(d => Math.hypot(d.x - x, d.y - y) < 19)) continue;
        const value = (flat ? 2 : 0) + hash(city.seed ^ city.idx(x, y) ^ ((deposits.length + 1) * 7919)) / 4294967296;
        if (value > score) { score = value; best = { resource, x: x + 1, y: y + 1, remaining: 18000 }; }
      }
      if (best) deposits.push(best);
    }
    city.industry = { v: 1, deposits, stocks: {}, earned: 0, exported: 0, lastTrade: 0, lastFuel: 0, freight: [], freightSequence: 0 };
    return city.industry;
  }
  function depositAt(city, building, resource) {
    const size = byType[building.type]?.size ?? 1;
    return initialize(city).deposits.find(d => (!resource || d.resource === resource) &&
      d.remaining > 0 && Math.hypot(d.x - (building.x + (size - 1) / 2), d.y - (building.y + (size - 1) / 2)) <= 7);
  }
  function stock(city, building) {
    const stocks = initialize(city).stocks;
    return stocks[key(building)] ??= Object.fromEntries(Object.keys(resources).map(type => [type, 0]));
  }
  function blocker(city, building) {
    const def = byType[building.type];
    if (!def) return null;
    const index = city.idx(building.x, building.y);
    for (let y = building.y; y < building.y + def.size; y++) for (let x = building.x; x < building.x + def.size; x++) {
      const tile = city.idx(x, y);
      if (city.fire[tile] || city.flood[tile]) return "damage";
    }
    if (city.roadDist[index] === 255) return "road";
    if (!city.powered[index]) return "power";
    if (!def.exportCapacity && !city.watered[index]) return "water";
    if (def.deposit && !depositAt(city, building, def.deposit)) return "deposit";
    return null;
  }
  const networks = city => window.__freightRoutes.build(city, definitions, blocker);
  function available(city, group, resource, destination) {
    return group.buildings.reduce((sum, building) => sum +
      (byType[building.type] && (!destination || group.route(building, destination)) ? stock(city, building)[resource] : 0), 0);
  }
  function take(city, group, resource, amount, destination) {
    const requested = amount;
    for (const building of group.buildings) {
      if (!byType[building.type] || !(stock(city, building)[resource] > 0)) continue;
      const route = destination ? group.route(building, destination) : null;
      if (destination && !route) continue;
      const inventory = stock(city, building), used = Math.min(amount, inventory[resource]);
      inventory[resource] -= used; amount -= used;
      if (used > 0 && destination) window.__freightRoutes.record(city, resource, used, route);
      if (amount < 1e-9) break;
    }
    return requested - amount;
  }
  function evaluate(city, produce) {
    const state = initialize(city), status = new Map(), fuel = new Set();
    let income = 0, exported = 0, fuelSaving = 0;
    const present = new Set([...city.structs.values()].filter(b => byType[b.type]).map(key));
    for (const name of Object.keys(state.stocks)) if (!present.has(name)) delete state.stocks[name];
    if (!present.size) {
      runtime.set(city, { status, fuel });
      if (produce) { state.lastTrade = 0; state.lastFuel = 0; }
      return status;
    }
    for (const group of networks(city)) {
      const reserve = Object.fromEntries(Object.keys(resources).map(resource => [resource, 0]));
      for (const building of group.buildings) {
        const def = byType[building.type];
        if (def && !blocker(city, building)) for (const [r, rate] of Object.entries(def.input ?? {})) reserve[r] += rate * 2;
        if (building.type === "coal" && city.powered[city.idx(building.x, building.y)]) reserve.coal += 16;
      }
      // Extraction precedes processing; processing precedes exports.
      for (const type of buildings.map(def => def.type)) for (const building of group.buildings) {
        if (building.type !== type) continue;
        const def = byType[type], inventory = stock(city, building);
        let reason = blocker(city, building), fraction = 1;
        if (!reason && def.output) {
          for (const [resource, rate] of Object.entries(def.output)) fraction = Math.min(fraction, Math.max(0, storage - inventory[resource]) / (rate / 24));
          if (def.deposit) fraction = Math.min(fraction, depositAt(city, building, def.deposit).remaining / (def.output[def.deposit] / 24));
          for (const [resource, rate] of Object.entries(def.input ?? {})) fraction = Math.min(fraction, available(city, group, resource, building) / (rate / 24));
          if (fraction <= 1e-9) reason = Object.entries(def.output).some(([r]) => inventory[r] >= storage - 1e-9) ? "storage" : "inputs";
          if (produce && !reason) {
            for (const [r, rate] of Object.entries(def.input ?? {})) take(city, group, r, rate / 24 * fraction, building);
            for (const [r, rate] of Object.entries(def.output)) inventory[r] += rate / 24 * fraction;
            if (def.deposit) depositAt(city, building, def.deposit).remaining = Math.max(0, depositAt(city, building, def.deposit).remaining - def.output[def.deposit] / 24 * fraction);
          }
        }
        status.set(building.id, { reason, fraction: reason ? 0 : fraction, exportCapacity: group.capacity });
      }
      for (const plant of group.buildings.filter(b => b.type === "coal")) {
        const def = definitions.coal;
        if (!window.__recreation.operating(city, plant, { ...def, requiresRoad: true })) continue;
        const quantity = Math.min(8 / 24, available(city, group, "coal", plant));
        if (quantity <= 0) continue;
        fuel.add(plant.id);
        const saving = def.upkeep * city.diff.costMul * 0.4 / window.__townCalendar.daysInMonth(city.year, city.month) / 24 * (quantity / (8 / 24));
        fuelSaving += saving;
        if (produce) take(city, group, "coal", quantity, plant);
      }
      if (!produce) continue;
      for (const exporter of group.exporters) {
        let capacity = exporter.capacity / 24;
        for (const resource of ["goods", "steel", "copper", "iron", "coal"]) {
          const amount = Math.min(capacity, Math.max(0, available(city, group, resource, exporter) - reserve[resource]));
          const delivered = take(city, group, resource, amount, exporter); capacity -= delivered;
          income += delivered * resources[resource].price; exported += delivered;
        }
      }
    }
    for (const building of city.structs.values()) if (byType[building.type] && !status.has(building.id)) {
      status.set(building.id, { reason: blocker(city, building) ?? "road", fraction: 0, exportCapacity: 0 });
    }
    runtime.set(city, { status, fuel });
    if (produce) {
      window.__freightRoutes.prune(city);
      state.earned += income; state.exported += exported;
      state.lastTrade = income * 24; state.lastFuel = fuelSaving * 24;
      window.__townCalendar.initialize(city).dailyBudget += income + fuelSaving;
    }
    return status;
  }
  function inspect(city, building) {
    // Rotation creates a render-only city view. Inventories and deposits always
    // belong to the original world coordinates, never that view's coordinates.
    if (city !== window.__city && city.industry === window.__city?.industry) {
      building = window.__city.structs.get(building.id) ?? building;
      city = window.__city;
    }
    const def = byType[building.type];
    if (!def) return null;
    const current = runtime.get(city)?.status.get(building.id);
    const reason = blocker(city, building);
    return { ...(current ?? { reason: def.input ? "inputs" : null, fraction: 1, exportCapacity: 0 }),
      ...(reason ? { reason, fraction: 0 } : {}), stock: stock(city, building), definition: def };
  }
  function stats(city) {
    evaluate(city, false);
    for (const building of city.structs.values()) {
      const def = byType[building.type];
      if (def && !inspect(city, building).reason) city.stats.jobsI += def.jobs;
    }
  }
  function budget(city, budget) {
    const state = initialize(city), days = window.__townCalendar.daysInMonth(city.year, city.month);
    budget.industryTrade = (state.lastTrade + state.lastFuel) * days;
    budget.industryUpkeep = 0;
    for (const building of city.structs.values()) {
      const def = byType[building.type];
      if (!def) continue;
      budget.industryUpkeep += def.upkeep * city.diff.costMul;
      if (!inspect(city, building)?.reason) budget.taxI += def.jobs * 0.6 * city.taxRate / 100;
    }
  }
  function preview(city, type, position, result, translate) {
    const def = byType[type];
    if (!result.valid || !def?.deposit || depositAt(city, { ...position, type }, def.deposit)) return result;
    return { ...result, valid: false, tiles: [], reason: translate("industry.depositRequired", { resource: translate(`industry.resource.${def.deposit}`) }) };
  }
  function install(City, allDefinitions, messages) {
    definitions = allDefinitions;
    for (const def of buildings) {
      definitions[def.type] = { ...def, jobs: 0, industryJobs: def.jobs, endgame: true, industry: true, requiresRoad: true, category: "transport" };
      messages[`struct.${def.type}`] = def.name;
      messages[`struct.${def.type}.desc`] = [0, 1].map(lang => {
        const label = resource => resources[resource].name[lang];
        const recipe = values => Object.entries(values).map(([r, rate]) => `${rate} ${label(r)}`).join(" + ");
        const output = def.output ? `${def.input ? `${recipe(def.input)} → ` : ""}${recipe(def.output)} ${lang ? "/ day." : "/ jour."}` : lang ? "Exports up to 48 units / day. Place beside rail to transfer freight between road districts." : "Exporte jusqu’à 48 unités / jour. Près du rail, relie les réseaux routiers par le train.";
        return `${output} ${lang ? `${def.jobs} jobs. Road, power${def.exportCapacity ? "" : " and water"} required.` : `${def.jobs} emplois. Route, électricité${def.exportCapacity ? "" : " et eau"} nécessaires.`}${def.deposit ? lang ? " Build on a matching deposit." : " Construire sur le gisement correspondant." : ""}`;
      });
    }
    for (const [r, def] of Object.entries(resources)) messages[`industry.resource.${r}`] = def.name;
    messages["industry.generic"] = ["Zone industrielle ordinaire", "Ordinary industrial zoning"];
    messages["industry.generic.desc"] = ["Tracez des zones : les entreprises se développent automatiquement avec route ou autoroute à 12 cases maximum, courant et travailleurs. Aucun gisement requis.", "Paint industrial lots. Businesses develop automatically with road or highway access within 12 tiles, power, and workers. No deposit required."];
    messages["group.industry"] = ["Industries et ressources", "Industry & resources"];
    messages["industry.depositRequired"] = ["Gisement de {resource} requis. Les gisements sont en surbrillance.", "Requires a {resource} deposit. Matching deposits are highlighted."];
    const save = City.prototype.toJSON;
    City.prototype.toJSON = function () { initialize(this); window.__freightRoutes.prune(this); return { ...save.call(this), industry: JSON.parse(JSON.stringify(this.industry)) }; };
    const load = City.fromJSON;
    City.fromJSON = function (data) {
      const city = load.call(this, data), saved = data.industry;
      if (saved?.v === 1 && Array.isArray(saved.deposits)) {
        city.industry = { v: 1, deposits: saved.deposits.slice(0, 9).filter(d => ["coal", "iron", "copper"].includes(d.resource) && Number.isInteger(d.x) && Number.isInteger(d.y) && city.inBounds(d.x, d.y)).map(d => ({ resource: d.resource, x: d.x, y: d.y, remaining: finite(d.remaining, 18000) })), stocks: {},
          earned: finite(saved.earned, Number.MAX_SAFE_INTEGER), exported: finite(saved.exported, Number.MAX_SAFE_INTEGER), lastTrade: finite(saved.lastTrade, 100000), lastFuel: finite(saved.lastFuel, 100000) };
        for (const building of city.structs.values()) {
          if (!byType[building.type]) continue;
          const inventory = stock(city, building), source = saved.stocks?.[key(building)];
          for (const r of Object.keys(resources)) inventory[r] = finite(source?.[r], storage);
        }
      } else initialize(city);
      window.__freightRoutes.restore(city, saved);
      return city;
    };
    const remove = City.prototype.removeStruct;
    City.prototype.removeStruct = function (building) {
      if (this.industry) delete this.industry.stocks[key(building)];
      runtime.delete(this);
      return remove.call(this, building);
    };
  }
  function toolbar(groups, items, translate) {
    const index = groups.findIndex(group => group.tool === "ind");
    const zoning = groups[index];
    groups.splice(index, 1, { group: translate("tool.ind"), icon: zoning.icon, items: [
      { tool: "ind", name: translate("industry.generic"), meta: translate("perTile", { n: 30 }), desc: translate("industry.generic.desc"), icon: zoning.icon },
      ...items(buildings.map(def => def.type)),
    ] });
    return groups;
  }
  window.__industry = { install, toolbar, preview, stats, budget, inspect, initialize, depositAt,
    hour: city => evaluate(city, true), resources, buildings, byType, storage,
    operating: (city, building) => !inspect(city, building)?.reason };
})();
