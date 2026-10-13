(() => {
  const states = new WeakMap();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const road = (city, index) => index >= 0 && index < city.count && (city.overlay[index] === 2 || city.overlay[index] === 7);
  const neighbors = (city, index) => {
    const x = index % city.size, y = Math.floor(index / city.size);
    return [x > 0 ? index - 1 : -1, x < city.size - 1 ? index + 1 : -1,
      y > 0 ? index - city.size : -1, y < city.size - 1 ? index + city.size : -1]
      .filter(next => road(city, next) && (window.__roadLayout?.canStep(city, index, next) ?? true));
  };
  function destination(city, vehicle) {
    const choices = neighbors(city, vehicle.to);
    const forward = choices.filter(index => index !== vehicle.from);
    const candidates = forward.length ? forward : choices;
    if (!candidates.length) return null;
    return candidates[(vehicle.id * 17 + vehicle.trips * 13) % candidates.length];
  }
  function position(city, from, to) {
    const x = from % city.size, y = Math.floor(from / city.size);
    const dx = to % city.size - x, dy = Math.floor(to / city.size) - y;
    const wide = window.__roadLayout?.wide(city, x, y);
    const lane = wide?.lane ?? (dx ? dx > 0 ? 0.6 : 0.4 : dy > 0 ? 0.4 : 0.6);
    return { x: x + (dx ? 0.5 : lane), y: y + (dx ? lane : 0.5) };
  }
  function update(renderer, city, time, speed) {
    let state = states.get(renderer);
    if (!state || state.city !== city) {
      state = { city, cars: [], tiles: new Map(), last: time, refresh: -Infinity, clock: 0, spawnAt: -Infinity, sequence: 0, roads: [] };
      states.set(renderer, state);
    }
    const delta = reducedMotion.matches ? 0 : Math.min(0.12, Math.max(0, (time - state.last) / 1000)) * speed;
    state.last = time;
    state.clock += delta;
    if (time - state.refresh >= 1000) {
      state.roads = [];
      for (let index = 0; index < city.count; index++) if (road(city, index) && city.traffic[index] > 0 && neighbors(city, index).length) state.roads.push(index);
      state.refresh = time;
    }
    const target = Math.min(32, Math.ceil(state.roads.length / 28));
    if (speed > 0 && state.cars.length < target && state.clock - state.spawnAt >= 0.8) {
      for (let attempt = 0; attempt < Math.min(state.roads.length, 32); attempt++) {
        const id = state.sequence + 1;
        const from = state.roads[(id * 37 + attempt * 19) % state.roads.length];
        const x = from % city.size, y = Math.floor(from / city.size);
        if (state.cars.some(car => Math.hypot(car.x - x, car.y - y) < 4)) continue;
        const choices = neighbors(city, from);
        const to = choices[id % choices.length];
        const start = position(city, from, to);
        state.cars.push({ id, from, to, start, x: start.x, y: start.y, progress: 0, trips: 0, color: id % 8, speed: 0.32 + id % 5 * 0.025 });
        state.sequence = id;
        state.spawnAt = state.clock;
        break;
      }
    }
    state.tiles.clear();
    state.cars = state.cars.filter(car => road(city, car.from) && road(city, car.to));
    for (const car of state.cars) {
      const end = position(city, car.to, car.to + (car.to - car.from));
      const dx = end.x - car.x, dy = end.y - car.y;
      const next = { x: car.x + dx * Math.min(1, delta * car.speed / Math.max(0.001, 1 - car.progress)),
        y: car.y + dy * Math.min(1, delta * car.speed / Math.max(0.001, 1 - car.progress)) };
      const fraction = window.__townPedestrians?.limitVehicleStep(renderer, city, car, next) ?? 1;
      car.progress = Math.min(1, car.progress + delta * car.speed * fraction);
      car.x = car.start.x + (end.x - car.start.x) * car.progress;
      car.y = car.start.y + (end.y - car.start.y) * car.progress;
      car.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      car.back = (car.axis === "x" ? dx : dy) < 0 ? 1 : 0;
      if (car.progress >= 1) {
        const nextTile = destination(city, car);
        if (nextTile !== null) {
          car.start = { x: car.x, y: car.y };
          car.from = car.to;
          car.to = nextTile;
          car.progress = 0;
          car.trips++;
        }
      }
      const index = city.idx(Math.floor(car.x), Math.floor(car.y));
      const list = state.tiles.get(index) ?? [];
      list.push(car);
      state.tiles.set(index, list);
    }
  }
  function draw(renderer, city, index, x, y, scale, corners) {
    const cars = states.get(renderer)?.tiles.get(index);
    if (!cars) return;
    const lowest = Math.min(...corners);
    const bridge = window.__seaRail?.roadHeights(city, index, renderer) ?? [0, 0, 0, 0];
    corners = corners.map((height, corner) => height + bridge[corner]);
    for (const car of cars) {
      const u = car.x - Math.floor(car.x), v = car.y - Math.floor(car.y);
      const height = corners[0] * (1 - u) * (1 - v) + corners[1] * u * (1 - v) + corners[2] * u * v + corners[3] * (1 - u) * v;
      const px = x + (u - v) * 32 * scale;
      const py = y + (u + v) * 16 * scale - (height - lowest) * 8 * scale;
      const image = renderer.sprites.get(`car:${car.axis}:${car.color}:${car.back}:0`, scale);
      renderer.ctx.drawImage(image, Math.round(px - 32 * scale), Math.round(py - 128 * scale));
    }
  }
  window.__trafficVehicles = { update, draw };
})();
