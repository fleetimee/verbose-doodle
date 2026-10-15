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
    const dx = vehicle.to % city.size - vehicle.from % city.size;
    const dy = Math.floor(vehicle.to / city.size) - Math.floor(vehicle.from / city.size);
    const straight = choices.find(index => index % city.size - vehicle.to % city.size === dx &&
      Math.floor(index / city.size) - Math.floor(vehicle.to / city.size) === dy);
    if (straight !== undefined && (city.rail[vehicle.from] || city.rail[vehicle.to] || city.rail[straight])) return straight;
    const forward = choices.filter(index => index !== vehicle.from);
    const candidates = forward.length ? forward : choices;
    if (!candidates.length) return null;
    return candidates[(vehicle.id * 17 + vehicle.trips * 13) % candidates.length];
  }
  function position(city, tile, neighbor, arriving = false) {
    const x = tile % city.size, y = Math.floor(tile / city.size);
    const sign = arriving ? -1 : 1;
    const dx = (neighbor % city.size - x) * sign, dy = (Math.floor(neighbor / city.size) - y) * sign;
    const wide = window.__roadLayout?.wide(city, x, y);
    if (wide) return wide.axis === "x" ? { x: x + 0.5, y: y + wide.lane } : { x: x + wide.lane, y: y + 0.5 };
    const lane = dx ? dx > 0 ? 0.6 : 0.4 : dy > 0 ? 0.4 : 0.6;
    return { x: x + (dx ? 0.5 : lane), y: y + (dx ? lane : 0.5) };
  }
  function pathPoint(car, end, progress) {
    if (!car.arc) return { x: car.start.x + (end.x - car.start.x) * progress, y: car.start.y + (end.y - car.start.y) * progress };
    const across = car.arc.axis === "x" ? "y" : "x", along = car.arc.axis;
    const middle = (car.start[across] + end[across]) / 2;
    const radius = Math.abs(end[across] - car.start[across]) / 2;
    return { [along]: car.start[along] + car.arc.direction * radius * Math.sin(Math.PI * progress),
      [across]: middle + (car.start[across] - middle) * Math.cos(Math.PI * progress) };
  }
  function beginSegment(city, car, nextTile) {
    const previous = car.from, current = car.to;
    const dx = current % city.size - previous % city.size, dy = Math.floor(current / city.size) - Math.floor(previous / city.size);
    car.start = { x: car.x, y: car.y }; car.from = current; car.to = nextTile; car.progress = 0; car.trips++;
    car.arc = null; car.afterTurn = undefined;
    if (nextTile === previous) {
      car.to = current; car.afterTurn = nextTile;
      car.arc = { axis: dx ? "x" : "y", direction: Math.sign(dx || dy), end: position(city, current, nextTile) };
      return;
    }
    const layout = window.__roadLayout?.wide(city, current % city.size, Math.floor(current / city.size));
    const other = window.__roadLayout?.wide(city, nextTile % city.size, Math.floor(nextTile / city.size));
    if (layout && other && layout.axis === other.axis && layout.side !== other.side &&
        (layout.axis === "x" ? current % city.size === nextTile % city.size : Math.floor(current / city.size) === Math.floor(nextTile / city.size))) {
      car.arc = { axis: layout.axis, direction: layout.direction, end: position(city, nextTile, current, true) };
    }
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
    const target = Math.ceil(Math.min(32, Math.ceil(state.roads.length / 28)) * (window.__dayNight?.traffic(city) ?? 1));
    if (speed > 0 && state.cars.length < target && state.clock - state.spawnAt >= 0.8) {
      for (let attempt = 0; attempt < Math.min(state.roads.length, 32); attempt++) {
        const id = state.sequence + 1;
        const from = state.roads[(id * 37 + attempt * 19) % state.roads.length];
        const x = from % city.size, y = Math.floor(from / city.size);
        if (state.cars.some(car => Math.hypot(car.x - x, car.y - y) < 4)) continue;
        const choices = neighbors(city, from);
        const to = choices[id % choices.length];
        const start = position(city, from, to);
        state.cars.push({ id, from, to, start, x: start.x, y: start.y, progress: 0, trips: 0, color: id % 8, model: id % 9, speed: 0.32 + id % 5 * 0.025 });
        state.sequence = id;
        state.spawnAt = state.clock;
        break;
      }
    }
    state.tiles.clear();
    let surplus = Math.max(0, state.cars.length - target);
    state.cars = state.cars.filter(car => {
      if (!road(city, car.from) || !road(city, car.to) || car.afterTurn !== undefined && !road(city, car.afterTurn)) return false;
      if (speed > 0 && surplus > 0 && car.trips >= 8 && car.progress === 0) { surplus--; return false; }
      return true;
    });
    for (const car of state.cars) {
      const end = car.arc?.end ?? position(city, car.to, car.from, true);
      const travel = car.arc ? Math.max(0.2, Math.hypot(end.x - car.start.x, end.y - car.start.y) * Math.PI / 2) : 1;
      const step = delta * car.speed / travel;
      const next = pathPoint(car, end, Math.min(1, car.progress + step));
      const fraction = window.__townPedestrians?.limitVehicleStep(renderer, city, car, next) ?? 1;
      car.progress = Math.min(1, car.progress + step * fraction);
      const point = pathPoint(car, end, car.progress);
      const before = pathPoint(car, end, Math.max(0, car.progress - 0.01));
      const after = pathPoint(car, end, Math.min(1, car.progress + 0.01));
      car.x = point.x; car.y = point.y;
      const headingX = after.x - before.x, headingY = after.y - before.y;
      car.axis = Math.abs(headingX) >= Math.abs(headingY) ? "x" : "y";
      car.back = (car.axis === "x" ? headingX : headingY) < 0 ? 1 : 0;
      if (car.progress >= 1) {
        if (car.afterTurn !== undefined) {
          const nextTile = car.afterTurn;
          car.start = { x: car.x, y: car.y }; car.to = nextTile; car.progress = 0;
          car.arc = null; car.afterTurn = undefined;
        } else {
          const nextTile = destination(city, car);
          if (nextTile !== null) beginSegment(city, car, nextTile);
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
    for (const car of cars) {
      const u = car.x - Math.floor(car.x), v = car.y - Math.floor(car.y);
      const height = window.__seaRail.roadHeight(city, index, renderer, u, v, corners);
      const px = x + (u - v) * 32 * scale;
      const py = y + (u + v) * 16 * scale - (height - lowest) * 8 * scale;
      const image = renderer.sprites.get(`carfleet:${car.model}:${car.axis}:${car.color}:${car.back}`, scale);
      renderer.roadVehicleDraws.push({ image, x: px - 32 * scale, y: py - 128 * scale, tile: index });
    }
  }
  function rotate(renderer, city, point, tile) {
    const state = states.get(renderer);
    if (!state) return;
    state.city = city;
    state.refresh = -Infinity;
    state.tiles.clear();
    for (const car of state.cars) {
      const continuous = value => {
        const rotated = point({ x: value.x - 0.5, y: value.y - 0.5 });
        return { x: rotated.x + 0.5, y: rotated.y + 0.5 };
      };
      Object.assign(car, continuous(car));
      car.start = continuous(car.start);
      if (car.arc) {
        const origin = point({ x: 0, y: 0 });
        const direction = point({ x: car.arc.axis === "x" ? car.arc.direction : 0, y: car.arc.axis === "y" ? car.arc.direction : 0 });
        const dx = direction.x - origin.x, dy = direction.y - origin.y;
        car.arc.end = continuous(car.arc.end); car.arc.axis = dx ? "x" : "y"; car.arc.direction = Math.sign(dx || dy);
      }
      if (car.afterTurn !== undefined) car.afterTurn = tile(car.afterTurn);
      car.from = tile(car.from);
      car.to = tile(car.to);
    }
  }
  window.__trafficVehicles = { update, draw, rotate,
    hasActive: renderer => !reducedMotion.matches && !!states.get(renderer)?.cars.length };
})();
