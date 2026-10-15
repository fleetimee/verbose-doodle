(() => {
  const limit = 64;
  const rates = { road: 1.5, rail: 3.6 };
  const hour = city => {
    const day = window.__townCalendar.initialize(city).day;
    return Date.UTC(city.year, city.month, day, 0) / 3600000 + city.dayTime;
  };
  const duration = legs => legs.reduce((sum, leg) => sum + Math.max(0, leg.path.length - 1) / rates[leg.mode], 0) + Math.max(0, legs.length - 1) * 0.15;
  const adjacent = (city, tile) => {
    const x = tile % city.size;
    return [x ? tile - 1 : -1, x + 1 < city.size ? tile + 1 : -1,
      tile >= city.size ? tile - city.size : -1, tile + city.size < city.count ? tile + city.size : -1].filter(i => i >= 0);
  };
  function build(city, definitions, blocked) {
    const count = city.count, total = count * 2;
    const valid = node => {
      const tile = node % count;
      return !city.fire[tile] && !city.flood[tile] && (node >= count ? city.rail[tile] === 1 : city.overlay[tile] === 2 || city.overlay[tile] === 7);
    };
    const entry = building => typeof building === "number" ? building : building.entry ?? city.entry[city.idx(building.x, building.y)];
    const transfers = new Map(), exporters = [];
    const link = (a, b) => { const links = transfers.get(a) ?? []; links.push(b); transfers.set(a, links); };
    for (const building of city.structs.values()) {
      if (building.type !== "freightterminal" && building.type !== "port") continue;
      const def = definitions[building.type], start = entry(building);
      if (start < 0 || !valid(start) || !window.__recreation.operating(city, building, { ...def, requiresRoad: true }) ||
          building.type === "freightterminal" && blocked(city, building)) continue;
      exporters.push({ entry: start, capacity: building.type === "port" ? 96 : 48, building });
      for (let y = building.y - 1; y <= building.y + def.size; y++) for (let x = building.x - 1; x <= building.x + def.size; x++) {
        if (!city.inBounds(x, y)) continue;
        const tile = city.idx(x, y);
        if (city.rail[tile]) { link(start, tile + count); link(tile + count, start); }
      }
    }
    const directedLinks = new Map();
    const neighbors = (node, directed) => {
      if (directed && directedLinks.has(node)) return directedLinks.get(node);
      const rail = node >= count, index = node % count;
      const links = [...adjacent(city, index).map(tile => tile + (rail ? count : 0)).filter(next => valid(next) &&
        (rail || !directed || (window.__roadLayout?.canStep(city, node, next) ?? true))), ...transfers.get(node) ?? []];
      if (directed) directedLinks.set(node, links);
      return links;
    };
    const labels = new Int32Array(total).fill(-1);
    let sequence = 0;
    for (let start = 0; start < total; start++) {
      if (!valid(start) || labels[start] !== -1) continue;
      const queue = [start]; labels[start] = sequence++;
      for (let head = 0; head < queue.length; head++) for (const next of neighbors(queue[head], false)) {
        if (labels[next] === -1) { labels[next] = labels[start]; queue.push(next); }
      }
    }
    const searches = new Map();
    function route(from, to) {
      const start = entry(from);
      if (start < 0 || labels[start] < 0) return null;
      const targets = (to.entries ?? [entry(to)]).filter(tile => tile >= 0 && labels[tile] === labels[start]);
      if (!targets.length) return null;
      let previous = searches.get(start);
      if (!previous) {
        previous = new Int32Array(total).fill(-1); previous[start] = start;
        const queue = [start];
        for (let head = 0; head < queue.length; head++) for (const next of neighbors(queue[head], true)) {
          if (previous[next] === -1) { previous[next] = queue[head]; queue.push(next); }
        }
        searches.set(start, previous);
      }
      const target = targets.find(tile => previous[tile] !== -1);
      if (target === undefined) return null;
      const path = [target];
      while (path.at(-1) !== start) path.push(previous[path.at(-1)]);
      path.reverse();
      const legs = [];
      for (const node of path) {
        const mode = node >= count ? "rail" : "road";
        if (legs.at(-1)?.mode !== mode) legs.push({ mode, path: [] });
        legs.at(-1).path.push(node % count);
      }
      return legs;
    }
    const groups = new Map();
    for (const building of city.structs.values()) {
      const tile = entry(building), id = tile >= 0 ? labels[tile] : -1;
      if (id < 0) continue;
      if (!groups.has(id)) groups.set(id, { buildings: [], exporters: [], capacity: 0, route });
      groups.get(id).buildings.push(building);
    }
    for (const exporter of exporters) {
      const group = groups.get(labels[exporter.entry]);
      if (group) { group.exporters.push(exporter); group.capacity += exporter.capacity; }
    }
    const edges = new Map();
    for (let n = 0; n < city.size; n++) for (const tile of [n, (city.size - 1) * city.size + n, n * city.size, n * city.size + city.size - 1]) {
      if (!valid(tile)) continue;
      const exits = edges.get(labels[tile]) ?? new Set();
      exits.add(tile); edges.set(labels[tile], exits);
    }
    for (const [id, exits] of edges) {
      const group = groups.get(id);
      if (group) { group.exporters.push({ entries: [...exits], capacity: 24 }); group.capacity += 24; }
    }
    return [...groups.values()];
  }
  function prune(city) {
    const state = window.__industry.initialize(city), now = hour(city);
    state.freight ??= [];
    state.freight = state.freight.filter(shipment => now < shipment.at + shipment.duration + 0.25).slice(-limit);
    return state.freight;
  }
  function record(city, resource, amount, legs) {
    if (!(amount > 1e-9) || !legs || !legs.some(leg => leg.path.length > 1)) return;
    // A bounded fleet represents actual hourly transfers; inventory and revenue
    // are settled by the economy, never by visibility or frame delivery.
    if (legs.reduce((sum, leg) => sum + leg.path.length, 0) > 2048) return;
    const state = window.__industry.initialize(city), list = prune(city), at = hour(city);
    const signature = `${resource}:${legs[0].path[0]}:${legs.at(-1).path.at(-1)}`;
    const previous = list.find(s => s.at === at && s.signature === signature);
    if (previous) { previous.amount += amount; return; }
    state.freightSequence = (state.freightSequence ?? 0) + 1;
    list.push({ id: state.freightSequence, resource, amount, at, duration: duration(legs), legs, signature });
    if (list.length > limit) list.shift();
  }
  function restore(city, saved) {
    const state = window.__industry.initialize(city), now = hour(city);
    state.freight = [];
    state.freightSequence = Number.isSafeInteger(saved?.freightSequence) && saved.freightSequence >= 0 ? saved.freightSequence : 0;
    for (const shipment of Array.isArray(saved?.freight) ? saved.freight.slice(-limit) : []) {
      if (!Number.isSafeInteger(shipment?.id) || shipment.id < 1 || !Object.hasOwn(window.__industry.resources, shipment.resource) ||
          !Number.isFinite(shipment.amount) || shipment.amount <= 0 || shipment.amount > 100000 || !Number.isFinite(shipment.at) ||
          shipment.at > now + 1e-6 || !Array.isArray(shipment.legs) || !shipment.legs.length || shipment.legs.length > 32) continue;
      const legs = [];
      let length = 0, valid = true;
      for (const leg of shipment.legs) {
        if (!leg || !Object.hasOwn(rates, leg.mode) || !Array.isArray(leg.path) || !leg.path.length) { valid = false; break; }
        length += leg.path.length;
        if (length > 2048 || leg.path.some(tile => !Number.isInteger(tile) || tile < 0 || tile >= city.count)) { valid = false; break; }
        for (let n = 1; n < leg.path.length; n++) if (!adjacent(city, leg.path[n - 1]).includes(leg.path[n])) valid = false;
        legs.push({ mode: leg.mode, path: leg.path.slice() });
      }
      if (!valid) continue;
      const travel = duration(legs);
      if (now >= shipment.at + travel + 0.25) continue;
      state.freight.push({ id: shipment.id, resource: shipment.resource, amount: shipment.amount, at: shipment.at, duration: travel, legs,
        signature: `${shipment.resource}:${legs[0].path[0]}:${legs.at(-1).path.at(-1)}` });
      state.freightSequence = Math.max(state.freightSequence, shipment.id);
    }
  }
  window.__freightRoutes = { build, record, restore, prune, hour, rates };
})();
