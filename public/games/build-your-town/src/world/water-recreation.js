(() => {
  const networks = new WeakMap();
  const animations = new WeakMap();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clear = (city, index) => city.terrain[index] === 1 && city.overlay[index] === 0 &&
    !city.wire[index] && !city.rail[index] && !city.fire[index] && !city.flood[index];

  function edges(city, building, size) {
    const result = [];
    for (let offset = 0; offset < size; offset++) {
      for (const [x, y] of [[building.x + offset, building.y - 1], [building.x + offset, building.y + size],
        [building.x - 1, building.y + offset], [building.x + size, building.y + offset]]) {
        if (city.inBounds(x, y)) result.push(city.idx(x, y));
      }
    }
    return result;
  }

  function undamaged(city, building, size) {
    for (let y = building.y; y < building.y + size; y++) {
      for (let x = building.x; x < building.x + size; x++) {
        const index = city.idx(x, y);
        if (city.fire[index] || city.flood[index]) return false;
      }
    }
    return true;
  }

  function refresh(city, definitions) {
    const previous = new Int32Array(city.count).fill(-2);
    const queue = [];
    for (const dock of city.structs.values()) {
      if (dock.type !== "shuttledock") continue;
      const size = definitions[dock.type].size;
      if (!undamaged(city, dock, size) || !window.__recreation.operating(city, dock, definitions[dock.type])) continue;
      for (const tile of edges(city, dock, size)) {
        if (!clear(city, tile) || previous[tile] !== -2) continue;
        previous[tile] = -1;
        queue.push(tile);
      }
    }
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const tile = queue[cursor], x = tile % city.size, y = Math.floor(tile / city.size);
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        if (!city.inBounds(x + dx, y + dy)) continue;
        const next = city.idx(x + dx, y + dy);
        if (previous[next] !== -2 || !clear(city, next)) continue;
        previous[next] = tile;
        queue.push(next);
      }
    }
    const routes = new Map();
    for (const park of city.structs.values()) {
      if (!definitions[park.type].needsShuttle || !undamaged(city, park, definitions[park.type].size)) continue;
      const destination = edges(city, park, definitions[park.type].size).find(tile => previous[tile] !== -2);
      if (destination === undefined) continue;
      const path = [];
      for (let tile = destination; tile !== -1; tile = previous[tile]) path.push(tile);
      routes.set(park.id, { building: park, path: path.reverse() });
    }
    networks.set(city, routes);
    return routes;
  }

  function connected(city, building) {
    return networks.get(city)?.get(building.id)?.building === building;
  }

  function update(renderer, city, time, speed, definitions) {
    let state = animations.get(renderer);
    if (!state || state.city !== city) {
      state = { city, clock: 0, last: time, refreshed: -Infinity, tiles: new Map() };
      animations.set(renderer, state);
    }
    state.clock += Math.min(0.12, Math.max(0, (time - state.last) / 1000)) * speed * (reducedMotion.matches ? 0 : 1);
    state.last = time;
    if (time - state.refreshed >= 1000) {
      refresh(city, definitions);
      state.refreshed = time;
    }
    state.tiles.clear();
    let count = 0;
    for (const { path, building } of networks.get(city)?.values() ?? []) {
      if (count++ >= 24 || !city.structs.has(building.id) || path.some(tile => !clear(city, tile))) continue;
      const length = path.length - 1;
      // Dwell at either landing before traversing the same safe route home.
      const period = length * 2 + 4;
      const phase = (state.clock * 0.65 + building.id * 0.3) % period;
      const distance = phase < 2 ? 0 : phase < length + 2 ? phase - 2
        : phase < length + 4 ? length : period - phase;
      const step = Math.min(length, Math.floor(distance));
      const tile = path[step], next = path[Math.min(length, step + 1)];
      const fraction = distance - step;
      const x = tile % city.size + 0.5 + (next % city.size - tile % city.size) * fraction;
      const y = Math.floor(tile / city.size) + 0.5 + (Math.floor(next / city.size) - Math.floor(tile / city.size)) * fraction;
      const index = city.idx(Math.floor(x), Math.floor(y));
      const boats = state.tiles.get(index) ?? [];
      boats.push({ x, y, axis: Math.floor(tile / city.size) === Math.floor(next / city.size) ? "x" : "y" });
      state.tiles.set(index, boats);
    }
  }

  function draw(renderer, city, index, x, y, scale) {
    const boats = animations.get(renderer)?.tiles.get(index);
    if (!boats) return;
    const ctx = renderer.ctx;
    for (const boat of boats) {
      const u = boat.x - Math.floor(boat.x), v = boat.y - Math.floor(boat.y);
      const point = (along, across, height = 0) => {
        const a = u + (boat.axis === "x" ? along : across);
        const b = v + (boat.axis === "x" ? across : along);
        return [x + (a - b) * 32 * scale, y + (a + b) * 16 * scale - height * scale];
      };
      const polygon = (points, color) => {
        ctx.fillStyle = color; ctx.beginPath();
        points.forEach((p, i) => i ? ctx.lineTo(...point(...p)) : ctx.moveTo(...point(...p)));
        ctx.closePath(); ctx.fill();
      };
      ctx.save();
      polygon([[-0.3, -0.16], [0.22, -0.16], [0.36, 0], [0.22, 0.16], [-0.3, 0.16]], "#fff0d0");
      polygon([[-0.24, -0.12, 2], [0.15, -0.12, 2], [0.2, 0.12, 2], [-0.24, 0.12, 2]], "#4489ac");
      for (const along of [-0.16, 0, 0.15]) {
        const [px, py] = point(along, 0, 5);
        ctx.fillStyle = "#efbb89"; ctx.beginPath(); ctx.arc(px, py, 1.4 * scale, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }
  window.__waterRecreation = { refresh, connected, update, draw };
})();
