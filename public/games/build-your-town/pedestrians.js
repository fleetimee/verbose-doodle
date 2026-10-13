(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const shirts = ["#e9b44c", "#60b9c5", "#db776f", "#9b8cc9", "#e5e7de"];
  const skin = ["#f2c5a0", "#c58d65", "#80533e"];
  const destinations = new Set([
    "park", "bigpark", "school", "hospital", "station", "stadium",
    "university", "medicalcenter", "botanicalgarden", "grandmuseum",
    "residentialtower", "researchcampus", "beachcarnival", "volleyballcourt", "soccerfield", "shoppingmall", "skylineapartments", "officeskyscraper", "supertall",
  ]);
  const states = new WeakMap();
  const hash = (value) => {
    let result = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
    result = Math.imul(result ^ (result >>> 16), 0x45d9f3b);
    return (result ^ (result >>> 16)) >>> 0;
  };
  function sidewalkAxis(city, index) {
    const x = index % city.size;
    const y = Math.floor(index / city.size);
    const wide = window.__roadLayout?.wide(city, x, y);
    if (wide) return wide.axis;
    const horizontal = city.isRoadway(x - 1, y) || city.isRoadway(x + 1, y);
    const vertical = city.isRoadway(x, y - 1) || city.isRoadway(x, y + 1);
    return horizontal === vertical ? null : horizontal ? "x" : "y";
  }
  const safe = (city, index, axis) => city.terrain[index] === 0 &&
    city.overlay[index] === 2 && !city.fire[index] && !city.flood[index] && !city.rail[index] &&
    (axis ? sidewalkAxis(city, index) === axis : sidewalkAxis(city, index) !== null);

  function activity(city, x, y) {
    let total = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > 2 || !city.inBounds(x + dx, y + dy)) continue;
        const index = city.idx(x + dx, y + dy);
        if (city.fire[index] || city.flood[index]) continue;
        const zone = city.overlay[index];
        if (zone >= 3 && zone <= 5) total += city.level[index];
        else if (zone === 6 && destinations.has(city.structAt(index)?.type)) total += 3;
      }
    }
    return total;
  }

  function refresh(city, state) {
    const candidates = [];
    state.roads.clear();
    const previousCrossings = state.crossings;
    state.crossings = new Map();
    for (let index = 0; index < city.count; index++) {
      if (!safe(city, index)) continue;
      const x = index % city.size;
      const y = Math.floor(index / city.size);
      const density = activity(city, x, y);
      if (!density) continue;
      state.roads.add(index);
      const axis = sidewalkAxis(city, index);
      const dx = axis === "x" ? 1 : 0;
      const dy = axis === "y" ? 1 : 0;
      if (!window.__roadLayout?.wide(city, x, y) && hash(index ^ city.seed) % 4 === 0 && city.isFlat(x, y) &&
          city.inBounds(x - dx, y - dy) && city.inBounds(x + dx, y + dy) &&
          safe(city, city.idx(x - dx, y - dy), axis) &&
          safe(city, city.idx(x + dx, y + dy), axis)) {
        state.crossings.set(index, previousCrossings.get(index) || { since: state.clock });
      }
      candidates.push({ index, density, rank: hash(index ^ city.seed) });
    }
    candidates.sort((a, b) => a.rank - b.rank);
    const existing = new Map(state.people.map((person) => [person.id, person]));
    state.people = [];
    for (const candidate of candidates) {
      const count = Math.min(3, 1 + Math.floor(candidate.density / 8));
      for (let slot = 0; slot < count && state.people.length < 240; slot++) {
        const id = candidate.index * 3 + slot;
        const previous = existing.get(id);
        if (previous && state.roads.has(previous.index) && safe(city, previous.index, previous.axis)) {
          state.people.push(previous);
          continue;
        }
        const seed = hash(id ^ city.seed);
        state.people.push({ id, seed, index: candidate.index, axis: sidewalkAxis(city, candidate.index),
          position: 0.1 + (seed % 800) / 1000, direction: seed & 1 ? 1 : -1,
          side: seed & 2 ? 0.12 : 0.88, phase: seed % 100, nextCross: 0 });
      }
      if (state.people.length >= 240) break;
    }
  }

  function update(renderer, city, time, speed) {
    let state = states.get(renderer);
    if (!state || state.city !== city) {
      state = { city, people: [], roads: new Set(), tiles: new Map(), crossings: new Map(),
        cars: new Map(), clock: 0, delta: 0, last: time, refreshed: -Infinity };
      states.set(renderer, state);
    }
    const elapsed = Math.min(0.12, Math.max(0, (time - state.last) / 1000));
    state.last = time;
    state.delta = reducedMotion.matches ? 0 : elapsed * speed;
    state.clock += state.delta;
    if (time - state.refreshed >= 2000) {
      refresh(city, state);
      state.refreshed = time;
    }
    state.tiles.clear();
    for (const [key, car] of state.cars) {
      const crossing = crossingAt(state, car.index);
      if (crossing !== car.crossing || !safe(city, car.index)) {
        state.cars.delete(key);
        continue;
      }
      advanceCar(state, car);
    }
    const delta = state.delta;
    for (const person of state.people) {
      if (!safe(city, person.index, person.axis)) continue;
      const layout = window.__roadLayout?.wide(city, person.index % city.size, Math.floor(person.index / city.size));
      if (layout) { person.side = layout.side ? 0.88 : 0.12; person.crossing = false; }
      const crossing = crossingAt(state, person.index);
      const phase = crossingPhase(state, crossing);
      const previousPosition = person.position;
      if (person.crossing) {
        if (!crossing) {
          person.side = person.side < 0.5 ? 0.12 : 0.88;
          person.crossing = false;
          person.nextCross = state.clock + 12;
        } else {
          const direction = person.targetSide > person.side ? 1 : -1;
          person.side += delta * 0.48 * direction;
          if ((person.targetSide - person.side) * direction <= 0) {
            person.side = person.targetSide;
            person.crossing = false;
            person.nextCross = state.clock + 12 + person.seed % 10;
          }
        }
      } else {
        person.position += delta * (0.26 + (person.seed % 10) / 100) * person.direction;
        if (crossing && state.clock >= person.nextCross &&
            (previousPosition - 0.5) * person.direction <= 0 &&
            (person.position - 0.5) * person.direction >= 0) {
          person.position = 0.5;
          if (delta > 0 && phase >= 11 && phase < 14) {
            person.crossing = true;
            person.targetSide = person.side < 0.5 ? 0.88 : 0.12;
          }
        }
      }
      person.phase += delta * 9;
      if (person.position < 0 || person.position > 1) {
        const x = person.index % city.size;
        const y = Math.floor(person.index / city.size);
        const nx = x + (person.axis === "x" ? person.direction : 0);
        const ny = y + (person.axis === "y" ? person.direction : 0);
        const next = city.idx(nx, ny);
        if (city.inBounds(nx, ny) && state.roads.has(next) && safe(city, next, person.axis) &&
            city.base(nx, ny) === city.base(x, y)) {
          person.index = next;
          person.position += person.direction > 0 ? -1 : 1;
        } else {
          person.position = person.position < 0 ? -person.position : 2 - person.position;
          person.direction *= -1;
        }
      }
      const list = state.tiles.get(person.index) || [];
      list.push(person);
      state.tiles.set(person.index, list);
    }
  }

  function draw(renderer, index, x, y, scale, corners) {
    const people = states.get(renderer)?.tiles.get(index);
    if (!people) return;
    const ctx = renderer.ctx;
    const lowest = Math.min(...corners);
    ctx.save();
    ctx.lineCap = "round";
    for (const person of people) {
      const u = person.axis === "x" ? person.position : person.side;
      const v = person.axis === "y" ? person.position : person.side;
      const height = corners[0] * (1 - u) * (1 - v) + corners[1] * u * (1 - v) +
        corners[2] * u * v + corners[3] * (1 - u) * v;
      const px = x + (u - v) * 32 * scale;
      const py = y + (u + v) * 16 * scale - (height - lowest) * 8 * scale;
      const stride = reducedMotion.matches ? 0 : Math.sin(person.phase) * 1.3 * scale;
      ctx.fillStyle = "rgba(20,24,34,0.25)";
      ctx.beginPath();
      ctx.ellipse(px, py, 2.4 * scale, 1.1 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#303748";
      ctx.lineWidth = 1.25 * scale;
      ctx.beginPath();
      ctx.moveTo(px, py - 3 * scale);
      ctx.lineTo(px - stride, py);
      ctx.moveTo(px, py - 3 * scale);
      ctx.lineTo(px + stride, py);
      ctx.stroke();
      ctx.strokeStyle = shirts[person.seed % shirts.length];
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(px, py - 6 * scale);
      ctx.lineTo(px, py - 3 * scale);
      ctx.stroke();
      ctx.lineWidth = scale;
      ctx.beginPath();
      ctx.moveTo(px - 1.2 * scale, py - 5.5 * scale);
      ctx.lineTo(px - 1.6 * scale, py - 3.5 * scale + stride);
      ctx.moveTo(px + 1.2 * scale, py - 5.5 * scale);
      ctx.lineTo(px + 1.6 * scale, py - 3.5 * scale - stride);
      ctx.stroke();
      ctx.fillStyle = skin[(person.seed >>> 4) % skin.length];
      ctx.beginPath();
      ctx.arc(px, py - 7.3 * scale, 1.35 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function crossingAt(state, index) {
    const x = index % state.city.size, y = Math.floor(index / state.city.size);
    return window.__roadLayout?.wide(state.city, x, y) ? null : state.crossings.get(index);
  }

  function crossingPhase(state, crossing) {
    return crossing ? (state.clock - crossing.since) % 18 : 0;
  }

  function drawCrosswalk(ctx, state, index, x, y, scale, crossing) {
    const horizontal = sidewalkAxis(state.city, index) === "x";
    const point = (along, across) => {
      const u = horizontal ? along : across;
      const v = horizontal ? across : along;
      return [x + (u - v) * 32 * scale, y + (u + v) * 16 * scale];
    };
    ctx.strokeStyle = "#f3eee0";
    ctx.lineWidth = 2 * scale;
    for (let across = 0.22; across <= 0.8; across += 0.1) {
      const start = point(0.42, across);
      const end = point(0.58, across);
      ctx.beginPath();
      ctx.moveTo(...start);
      ctx.lineTo(...end);
      ctx.stroke();
    }
    const phase = crossingPhase(state, crossing);
    for (const side of [0.08, 0.92]) {
      const [px, py] = point(side < 0.5 ? 0.32 : 0.68, side);
      ctx.strokeStyle = "#414953";
      ctx.lineWidth = scale;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - 8 * scale);
      ctx.stroke();
      ctx.fillStyle = "#222b36";
      ctx.fillRect(px - 2 * scale, py - 11 * scale, 4 * scale, 6 * scale);
      ctx.fillStyle = phase < 9 ? "#5bdc82" : "#ef6661";
      ctx.beginPath();
      ctx.arc(px, py - 9.5 * scale, scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = phase >= 11 && phase < 14 ? "#5bdc82" : "#ef6661";
      ctx.beginPath();
      ctx.arc(px, py - 6.5 * scale, scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRoad(renderer, index, x, y, scale) {
    const state = states.get(renderer);
    const crossing = state ? crossingAt(state, index) : null;
    if (!crossing || !safe(state.city, index)) return;
    renderer.ctx.save();
    drawCrosswalk(renderer.ctx, state, index, x, y, scale, crossing);
    renderer.ctx.restore();
  }

  function advanceCar(state, car) {
    const red = crossingPhase(state, car.crossing) >= 9;
    const stop = car.direction > 0 ? 0.3 : 0.7;
    let next = car.position + state.delta * car.rate * car.direction;
    if (red && (car.position - stop) * car.direction <= 0 &&
        (next - stop) * car.direction >= 0) next = stop;
    if (next > 1 || next < 0) next = red ? stop : car.direction > 0 ? next - 1 : next + 1;
    car.position = next;
  }

  function vehiclePosition(renderer, city, index, id, initial, direction, rate) {
    const state = states.get(renderer);
    const crossing = state ? crossingAt(state, index) : null;
    if (!crossing || state.city !== city || !safe(city, index)) return initial;
    const key = `${index}:${id}`;
    let car = state.cars.get(key);
    if (!car || car.crossing !== crossing) {
      const red = crossingPhase(state, crossing) >= 9;
      car = { index, position: red ? direction > 0 ? 0.3 : 0.7 : initial,
        crossing, direction, rate };
      state.cars.set(key, car);
    }
    return car.position;
  }
  function limitVehicleStep(renderer, city, from, to) {
    const state = states.get(renderer);
    if (!state || state.city !== city) return 1;
    let fraction = 1;
    const indices = new Set([
      city.idx(Math.floor(from.x), Math.floor(from.y)),
      city.idx(Math.floor(to.x), Math.floor(to.y)),
    ]);
    for (const index of indices) {
      const crossing = crossingAt(state, index);
      if (!crossing || crossingPhase(state, crossing) < 9 || !safe(city, index)) continue;
      const axis = sidewalkAxis(city, index);
      const origin = axis === "x" ? index % city.size : Math.floor(index / city.size);
      const start = from[axis];
      const end = to[axis];
      const stop = origin + (end >= start ? 0.3 : 0.7);
      if (end > start && start <= stop && end > stop || end < start && start >= stop && end < stop) {
        fraction = Math.min(fraction, (stop - start) / (end - start));
      }
    }
    return fraction;
  }
  function hasCrosswalk(renderer, city, index) {
    const state = states.get(renderer);
    return state?.city === city && !!crossingAt(state, index) && safe(city, index);
  }
  window.__townPedestrians = { update, draw, drawRoad, vehiclePosition, limitVehicleStep, hasCrosswalk };
})();
