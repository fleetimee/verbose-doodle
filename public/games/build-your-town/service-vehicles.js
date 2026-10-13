(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const departments = {
    police: { kind: "police", funding: "police" },
    policehq: { kind: "police", funding: "police" },
    hospital: { kind: "ambulance", funding: "health" },
    medicalcenter: { kind: "ambulance", funding: "health" },
    fire: { kind: "fireengine", funding: "fire" },
    firecommand: { kind: "fireengine", funding: "fire" },
  };
  const states = new WeakMap();
  const drivable = (city, index) => (city.overlay[index] === 2 || city.overlay[index] === 7) &&
    !city.fire[index] && !city.flood[index];

  function neighbors(city, index) {
    const x = index % city.size;
    const y = Math.floor(index / city.size);
    const result = [];
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      if (!city.inBounds(x + dx, y + dy)) continue;
      const next = city.idx(x + dx, y + dy);
      if (drivable(city, next) && (window.__roadLayout?.canStep(city, index, next) ?? true)) result.push(next);
    }
    return result;
  }

  function entrances(city, station, size) {
    const result = [];
    for (let offset = 0; offset < size; offset++) {
      for (const [x, y] of [[station.x + offset, station.y - 1],
        [station.x + offset, station.y + size], [station.x - 1, station.y + offset],
        [station.x + size, station.y + offset]]) {
        if (city.inBounds(x, y) && drivable(city, city.idx(x, y))) result.push(city.idx(x, y));
      }
    }
    return result;
  }

  function incident(city, index, kind) {
    if (kind === "fireengine") return city.fire[index] > 0;
    const occupied = city.overlay[index] >= 3 && city.overlay[index] <= 5 && city.level[index] > 0;
    if (kind === "police") return occupied && city.crime[index] >= 80;
    return occupied && (city.fire[index] > 0 || city.flood[index] > 0 ||
      city.overlay[index] === 3 && city.pollution[index] >= 90 && city.cover.health[index] < 64);
  }

  function route(renderer, city, origin, station, radius, kind, state) {
    const previous = new Map([[origin, -1]]);
    const queue = [origin];
    let target = null;
    let call = null;
    for (let cursor = 0; cursor < queue.length && cursor < 2048; cursor++) {
      const index = queue[cursor];
      const x = index % city.size, y = Math.floor(index / city.size);
      if (!window.__townPedestrians?.hasCrosswalk(renderer, city, index)) {
        for (let dy = -2; dy <= 2 && target === null; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (!city.inBounds(x + dx, y + dy)) continue;
            const tile = city.idx(x + dx, y + dy);
            const key = `${kind}:${tile}`;
            if (!incident(city, tile, kind) || Math.hypot(x + dx - station.x, y + dy - station.y) > radius ||
              (state.cooldowns.get(key) ?? 0) > state.clock ||
              [...state.vehicles.values()].some(vehicle => vehicle.call === key)) continue;
            target = index;
            call = key;
            break;
          }
        }
        if (target !== null) break;
      }
      for (const next of neighbors(city, index)) {
        const nx = next % city.size, ny = Math.floor(next / city.size);
        if (previous.has(next) || Math.hypot(nx - station.x, ny - station.y) > radius) continue;
        previous.set(next, index);
        queue.push(next);
      }
    }
    if (target === null || target === origin) return null;
    const path = [];
    for (let index = target; index !== -1; index = previous.get(index)) path.push(index);
    path.reverse();
    return { path, responding: true, call };
  }

  function returnRoute(city, from, destination) {
    const previous = new Map([[from, -1]]);
    const queue = [from];
    for (let cursor = 0; cursor < queue.length && cursor < 2048; cursor++) {
      const index = queue[cursor];
      if (index === destination) {
        const path = [];
        for (let tile = index; tile !== -1; tile = previous.get(tile)) path.push(tile);
        return path.reverse();
      }
      for (const next of neighbors(city, index)) {
        if (previous.has(next)) continue;
        previous.set(next, index);
        queue.push(next);
      }
    }
    return null;
  }

  function point(city, path, step) {
    const index = path[step];
    const other = path[Math.min(step + 1, path.length - 1)];
    const before = path[Math.max(0, step - 1)];
    const reference = other === index ? before : other;
    const dx = other === index ? index % city.size - reference % city.size : reference % city.size - index % city.size;
    const dy = other === index ? Math.floor(index / city.size) - Math.floor(reference / city.size)
      : Math.floor(reference / city.size) - Math.floor(index / city.size);
    const layout = window.__roadLayout?.wide(city, index % city.size, Math.floor(index / city.size));
    if (layout) return { x: index % city.size + (layout.axis === "y" ? layout.lane : 0.5),
      y: Math.floor(index / city.size) + (layout.axis === "x" ? layout.lane : 0.5) };
    return { x: index % city.size + 0.5 - dy * 0.1,
      y: Math.floor(index / city.size) + 0.5 + dx * 0.1 };
  }

  function dispatch(renderer, city, station, definition, vehicle, state) {
    const department = departments[station.type];
    const funding = city.funding[department.funding];
    const current = vehicle ? city.idx(Math.floor(vehicle.x), Math.floor(vehicle.y)) : undefined;
    const origin = current !== undefined && drivable(city, current) ? current : entrances(city, station, definition.size).find(index => neighbors(city, index).length > 0);
    if (origin === undefined) return null;
    const trip = route(renderer, city, origin, station, definition.radius * Math.min(1.5, funding / 100),
      department.kind, state);
    if (!trip) return null;
    const returning = returnRoute(city, trip.path[trip.path.length - 1], origin);
    if (!returning) return null;
    const path = [...trip.path, ...returning.slice(1)];
    const start = point(city, path, 0);
    const next = point(city, path, 1);
    // Start behind a crossing's stop line rather than spawning in its center.
    if (Math.abs(next.x - start.x) > Math.abs(next.y - start.y)) start.x += next.x > start.x ? -0.4 : 0.4;
    else start.y += next.y > start.y ? -0.4 : 0.4;
    if (origin === current) { start.x = vehicle.x; start.y = vehicle.y; }
    return { station, kind: department.kind, path, step: 0, x: start.x, y: start.y,
      sequence: vehicle?.sequence || 0, responding: trip.responding, call: trip.call,
      dispatched: state.clock, dwell: 0, outboundEnd: trip.path.length - 1 };
  }

  function update(renderer, city, time, speed, definitions) {
    let state = states.get(renderer);
    if (!state || state.city !== city) {
      state = { city, vehicles: new Map(), tiles: new Map(), last: time, clock: 0, refresh: -Infinity, cooldowns: new Map() };
      states.set(renderer, state);
    }
    const delta = reducedMotion.matches ? 0 : Math.min(0.12, Math.max(0, (time - state.last) / 1000)) * speed;
    state.last = time;
    state.clock += delta;
    if (time - state.refresh >= 1000) {
      const eligible = new Set();
      const counts = { police: 0, ambulance: 0, fireengine: 0 };
      for (const vehicle of state.vehicles.values()) counts[vehicle.kind]++;
      for (const [key, until] of state.cooldowns) if (until <= state.clock) state.cooldowns.delete(key);
      for (const station of city.structs.values()) {
        const department = departments[station.type];
        const definition = definitions[station.type];
        if (!department || city.funding[department.funding] <= 0 ||
            (definition.endgame && !city.powered[city.idx(station.x, station.y)])) continue;
        eligible.add(station);
        if (speed > 0 && !state.vehicles.has(station) && counts[department.kind] < 3) {
          const vehicle = dispatch(renderer, city, station, definition, null, state);
          if (vehicle) {
            state.vehicles.set(station, vehicle);
            counts[department.kind]++;
          }
        }
      }
      for (const station of state.vehicles.keys()) if (!eligible.has(station)) state.vehicles.delete(station);
      state.refresh = time;
    }
    state.tiles.clear();
    for (let [station, vehicle] of state.vehicles) {
      if (city.funding[departments[station.type].funding] <= 0 || !city.structs.has(station.id)) continue;
      const index = city.idx(Math.floor(vehicle.x), Math.floor(vehicle.y));
      const invalid = !drivable(city, index) || vehicle.path.some((index, step) => !drivable(city, index) || step > 0 &&
        !(window.__roadLayout?.canStep(city, vehicle.path[step - 1], index) ?? true));
      if (vehicle.step >= vehicle.path.length - 1) {
        state.cooldowns.set(vehicle.call, state.clock + 60);
        state.vehicles.delete(station);
        continue;
      }
      if (invalid) {
        // Road edits can invalidate a trip; wait at base for another reachable call.
        state.vehicles.delete(station);
        continue;
      }
      if (vehicle.dwell > 0) vehicle.dwell = Math.max(0, vehicle.dwell - delta);
      else {
        const target = point(city, vehicle.path, vehicle.step + 1);
        const dx = target.x - vehicle.x;
        const dy = target.y - vehicle.y;
        const distance = Math.hypot(dx, dy);
        const travel = Math.min(distance, delta * (vehicle.responding ? 0.9 : 0.65));
        const next = { x: vehicle.x + (distance ? dx / distance * travel : 0),
          y: vehicle.y + (distance ? dy / distance * travel : 0) };
        const fraction = window.__townPedestrians?.limitVehicleStep(renderer, city, vehicle, next) ?? 1;
        vehicle.x += (next.x - vehicle.x) * fraction;
        vehicle.y += (next.y - vehicle.y) * fraction;
        vehicle.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
        vehicle.back = (vehicle.axis === "x" ? dx : dy) < 0 ? 1 : 0;
        if (distance <= travel && fraction === 1) {
          vehicle.step++;
          if (vehicle.step === vehicle.outboundEnd) {
            vehicle.dwell = 4;
            vehicle.responding = false;
          }
        }
      }
      const tile = city.idx(Math.floor(vehicle.x), Math.floor(vehicle.y));
      const list = state.tiles.get(tile) || [];
      list.push(vehicle);
      state.tiles.set(tile, list);
    }
  }

  function draw(renderer, index, x, y, scale, corners) {
    const state = states.get(renderer);
    const vehicles = state?.tiles.get(index);
    if (!vehicles) return;
    const lowest = Math.min(...corners);
    const bridge = window.__seaRail?.roadHeights(city, index, renderer) ?? [0, 0, 0, 0];
    corners = corners.map((height, corner) => height + bridge[corner]);
    for (const vehicle of vehicles) {
      const u = vehicle.x - Math.floor(vehicle.x);
      const v = vehicle.y - Math.floor(vehicle.y);
      const height = corners[0] * (1 - u) * (1 - v) + corners[1] * u * (1 - v) +
        corners[2] * u * v + corners[3] * (1 - u) * v;
      const px = x + (u - v) * 32 * scale;
      const py = y + (u + v) * 16 * scale - (height - lowest) * 8 * scale;
      const flashing = vehicle.responding;
      const frame = flashing && !reducedMotion.matches ? Math.floor(state.clock * 4) % 2 + 1 : 0;
      const sprite = renderer.sprites.get(`emergency:${vehicle.kind}:${vehicle.axis || "x"}:${vehicle.back || 0}:${frame}`, scale);
      renderer.ctx.drawImage(sprite, Math.round(px - 32 * scale), Math.round(py - 128 * scale));
    }
  }

  function sprite(ctx, kind, axis, back, frame, project, polygon) {
    const point = (along, across, height) => axis === "x"
      ? project(0.5 + (back ? -along : along), 0.5 + across, height)
      : project(0.5 + across, 0.5 + (back ? -along : along), height);
    const box = (front, rear, left, right, bottom, top, color, roof) => {
      polygon(ctx, [point(front, right, bottom), point(rear, right, bottom),
        point(rear, right, top), point(front, right, top)], color, "#303747", 0.45);
      const end = back ? rear : front;
      polygon(ctx, [point(end, left, bottom), point(end, right, bottom),
        point(end, right, top), point(end, left, top)], color, "#303747", 0.45);
      polygon(ctx, [point(front, left, top), point(rear, left, top),
        point(rear, right, top), point(front, right, top)], roof, "#303747", 0.45);
    };
    const fire = kind === "fireengine";
    const ambulance = kind === "ambulance";
    const length = fire ? 0.46 : ambulance ? 0.38 : 0.32;
    box(length / 2, -length / 2, -0.09, 0.09, 1, fire ? 6 : 4, fire ? "#b93632" : "#dce4ec", fire ? "#e35b49" : "#f5f5ed");
    box(0.08, -length / 2 + 0.02, -0.075, 0.075, 4, ambulance ? 8 : 7,
      fire ? "#d74737" : "#dce4ec", "#f0f1ec");
    polygon(ctx, [point(0.09, -0.07, 4.3), point(0.09, 0.07, 4.3),
      point(0.03, 0.07, 6.8), point(0.03, -0.07, 6.8)], "#91c9e3", "#303747", 0.4);
    box(0.12, -length / 2 + 0.01, 0.091, 0.095, 2.5, 3.5,
      ambulance ? "#de5149" : fire ? "#f5dfac" : "#346bb4", ambulance ? "#de5149" : "#346bb4");
    if (fire) {
      for (const across of [-0.045, 0.045]) {
        const a = point(-0.17, across, 8), b = point(0.06, across, 8);
        ctx.strokeStyle = "#bfcbd1"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
      }
      for (let along = -0.15; along <= 0.05; along += 0.045) {
        ctx.strokeStyle = "#dce4e8"; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(...point(along, -0.045, 8)); ctx.lineTo(...point(along, 0.045, 8)); ctx.stroke();
      }
    }
    if (ambulance) {
      polygon(ctx, [point(-0.1, -0.025, 8.1), point(-0.04, -0.025, 8.1),
        point(-0.04, 0.025, 8.1), point(-0.1, 0.025, 8.1)], "#dc4945");
      polygon(ctx, [point(-0.085, -0.06, 8.1), point(-0.055, -0.06, 8.1),
        point(-0.055, 0.06, 8.1), point(-0.085, 0.06, 8.1)], "#dc4945");
    }
    for (const across of [-0.045, 0.045]) {
      const color = across < 0 ? "#ef6059" : "#53b5ff";
      box(0.02, -0.03, across - 0.025, across + 0.025, ambulance ? 8 : 7, ambulance ? 9.3 : 8.3,
        color, frame && (frame === 1) === (across < 0) ? "#fff0cc" : color);
    }
    for (const along of [-length / 2 + 0.065, length / 2 - 0.055]) {
      const [px, py] = point(along, 0.1, 1.5);
      ctx.fillStyle = "#242c38"; ctx.beginPath(); ctx.ellipse(px, py, 1.4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  window.__serviceVehicles = { update, draw, sprite };
})();
