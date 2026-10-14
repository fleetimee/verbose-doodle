(() => {
  function enrich(city, bounds, definitions, preview, apply) {
    const center = { x: bounds.x + bounds.size / 2, y: bounds.y + bounds.size / 2 };
    const skyline = new Set(["arcology", "supertall", "officeskyscraper", "skylineapartments", "residentialtower"]);
    const existing = new Set([...city.structs.values()].map(building => building.type));
    let seed = city.seed;
    const random = () => {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    };
    city.money = 1e9;
    city.maxPop = 1e6;
    const types = Object.entries(definitions).filter(([type, definition]) =>
      !existing.has(type) && definition.size && !definition.landscaping);
    types.sort(([a, first], [b, second]) => Number(second.category === "power") - Number(first.category === "power") || Number(skyline.has(b)) - Number(skyline.has(a)));
    for (const [type, definition] of types) {
      const size = definition.size;
      const angle = random() * Math.PI * 2;
      const radius = skyline.has(type) ? 9 : definition.category === "power" ? 24 : 15;
      const target = { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
      const candidates = [];
      const startX = definition.needsShore ? 0 : bounds.x;
      const startY = definition.needsShore ? 0 : bounds.y;
      const endX = definition.needsShore ? city.size : bounds.x + bounds.size;
      const endY = definition.needsShore ? city.size : bounds.y + bounds.size;
      for (let y = startY; y + size <= endY; y++) for (let x = startX; x + size <= endX; x++) {
        let valid = true, occupied = 0, shoreline = false;
        const height = city.base(x, y);
        for (let dy = -1; dy <= size; dy++) for (let dx = -1; dx <= size; dx++) {
          if (!city.inBounds(x + dx, y + dy)) continue;
          if (city.terrain[city.idx(x + dx, y + dy)] === 1) shoreline = true;
        }
        if (definition.needsShore && !shoreline) continue;
        for (let dy = 0; dy < size && valid; dy++) for (let dx = 0; dx < size; dx++) {
          const index = city.idx(x + dx, y + dy), overlay = city.overlay[index];
          if (city.terrain[index] !== 0 || city.rail[index] || city.structId[index] ||
              overlay === 2 || overlay === 7 || !city.isFlat(x + dx, y + dy) || city.base(x + dx, y + dy) !== height) { valid = false; break; }
          if (overlay >= 3 && overlay <= 5) occupied++;
          const building = city.buildingAt(index);
          if (building && (building.x < x || building.y < y || building.x + building.size > x + size || building.y + building.size > y + size)) { valid = false; break; }
        }
        if (valid) candidates.push({ x, y, score: Math.hypot(x - target.x, y - target.y) + occupied * 0.3 });
      }
      candidates.sort((a, b) => a.score - b.score);
      for (const point of candidates.slice(0, 40)) {
        const needsClearing = Array.from({ length: size * size }, (_, index) => city.overlay[city.idx(point.x + index % size, point.y + Math.floor(index / size))]).some(value => value > 1);
        if (needsClearing) {
          const clear = preview(city, "bulldoze", point, { x: point.x + size - 1, y: point.y + size - 1 });
          if (!clear.valid) continue;
          apply(city, clear);
        }
        const plan = preview(city, type, point, point);
        if (!plan.valid) continue;
        apply(city, plan);
        existing.add(type);
        break;
      }
    }
    city.gridDirty = true;
    city.money = 250000;
    city.randomDisasters = false;
  }
  function finish(city) {
    // The decorative preview has full utilities without changing any saved city.
    city.powered.fill(1);
    city.watered.fill(1);
    city.fire.fill(0);
    city.flood.fill(0);
    city.actors = [];
  }
  window.__townShowcase = { enrich, finish };
})();
