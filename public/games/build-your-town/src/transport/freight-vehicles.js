(() => {
  const states = new WeakMap();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const maxVehicles = 48;
  function currentLeg(shipment, time) {
    let age = time - shipment.at;
    if (age < 0 || age >= shipment.duration) return null;
    for (const leg of shipment.legs) {
      const rate = window.__freightRoutes.rates[leg.mode];
      const length = Math.max(0, leg.path.length - 1), travel = length / rate;
      if (age < travel) return { leg, progress: age * rate };
      age -= travel;
      if (age < 0.15) return null;
      age -= 0.15;
    }
    return null;
  }
  function road(city, tile) { return city.overlay[tile] === 2 || city.overlay[tile] === 7; }
  function valid(city, leg) {
    return leg.path.every((tile, n) => !city.fire[tile] && !city.flood[tile] &&
      (leg.mode === "rail" ? city.rail[tile] === 1 && !window.__railTransit?.kind(city, tile) : road(city, tile) && (!n || (window.__roadLayout?.canStep(city, leg.path[n - 1], tile) ?? true))));
  }
  function pointAt(city, leg, progress) {
    if (progress < 0 || leg.path.length < 2) return null;
    const segment = Math.min(leg.path.length - 2, Math.floor(progress));
    const a = leg.path[segment], b = leg.path[segment + 1], t = Math.min(1, progress - segment);
    const ax = a % city.size, ay = Math.floor(a / city.size), bx = b % city.size, by = Math.floor(b / city.size);
    const dx = bx - ax, dy = by - ay;
    const lane = tile => leg.mode === "rail" ? 0.5 : window.__roadLayout?.wide(city, tile % city.size, Math.floor(tile / city.size))?.lane ?? (dx ? dx > 0 ? 0.64 : 0.36 : dy > 0 ? 0.36 : 0.64);
    const point = { x: ax + dx * t + (dx ? 0.5 : lane(a) + (lane(b) - lane(a)) * t),
      y: ay + dy * t + (dx ? lane(a) + (lane(b) - lane(a)) * t : 0.5), dx, dy };
    return leg.mode === "rail" ? window.__doubleRail?.position(city, point) ?? point : point;
  }
  function rotate(point, size, turns) {
    let { x, y, dx, dy } = point;
    for (let n = 0; n < turns; n++) { [x, y] = [size - y, x]; [dx, dy] = [-dy, dx]; }
    return { x, y, axis: dx ? "x" : "y", back: +(dx + dy < 0), dx, dy };
  }
  function sourceCity(city) { return city.industry === window.__city?.industry ? window.__city : city; }
  function update(renderer, view, enabled) {
    const city = sourceCity(view);
    let state = states.get(renderer);
    if (!state || state.city !== city) { state = { city, trucks: new Map(), vehicles: 0 }; states.set(renderer, state); }
    state.trucks.clear(); state.vehicles = 0;
    if (!enabled || reduced.matches || !city.industry?.freight?.length) return;
    const now = window.__freightRoutes.hour(city), turns = (window.__mapRotation?.getAngle() ?? 0) / 90;
    for (const shipment of city.industry.freight.slice().reverse()) {
      if (state.vehicles >= maxVehicles) break;
      const active = currentLeg(shipment, now);
      if (!active || !valid(city, active.leg)) continue;
      const train = active.leg.mode === "rail", count = train ? 4 : 1;
      for (let car = 0; car < count && state.vehicles < maxVehicles; car++) {
        const location = pointAt(city, active.leg, active.progress - car * 0.68);
        if (!location) continue;
        const point = rotate(location, city.size, turns), x = Math.floor(point.x), y = Math.floor(point.y);
        if (!view.inBounds(x, y)) continue;
        const index = view.idx(x, y), vehicle = { ...point, resource: shipment.resource, u: point.x - x, v: point.y - y };
        if (train) {
          const front = window.__trainFleet.railHeight(renderer, view, { x: point.x + point.dx * 0.22, y: point.y + point.dy * 0.22 });
          const rear = window.__trainFleet.railHeight(renderer, view, { x: point.x - point.dx * 0.22, y: point.y - point.dy * 0.22 });
          vehicle.kind = `freight-${car ? "wagon" : "loco"}-${shipment.resource}`;
          vehicle.train = true;
          vehicle.rideHeight = front !== null && rear !== null ? ((front + rear) / 2 - Math.min(...view.corners(x, y))) * 8 : undefined;
          const travel = point.back ? -1 : 1;
          vehicle.pitch = front !== null && rear !== null ? -(front - rear) * 8 / (0.44 * 32 * travel * (point.axis === "x" ? 1 : -1)) : 0;
          const vehicles = renderer.vehiclesByTile.get(index) ?? [];
          vehicles.push(vehicle); renderer.vehiclesByTile.set(index, vehicles);
        } else {
          const vehicles = state.trucks.get(index) ?? [];
          vehicles.push(vehicle); state.trucks.set(index, vehicles);
        }
        state.vehicles++;
      }
    }
  }
  function drawRoad(renderer, city, index, x, y, scale, corners) {
    const trucks = states.get(renderer)?.trucks.get(index);
    if (!trucks) return;
    const lowest = Math.min(...corners);
    for (const vehicle of trucks) {
      const height = window.__seaRail.roadHeight(city, index, renderer, vehicle.u, vehicle.v, corners);
      const image = renderer.sprites.get(`freight:truck:${vehicle.resource}:${vehicle.axis}:${vehicle.back}`, scale);
      renderer.roadVehicleDraws.push({ image, tile: index,
        x: x + (vehicle.u - vehicle.v) * 32 * scale - 32 * scale,
        y: y + (vehicle.u + vehicle.v) * 16 * scale - (height - lowest) * 8 * scale - 128 * scale });
    }
  }
  function sprite(ctx, kind, resource, axis, back, project, polygon) {
    const train = kind !== "truck", locomotive = kind === "loco";
    const color = window.__industry.resources[resource]?.color ?? "#a9c9e7";
    const point = (along, across, height) => axis === "x"
      ? project(0.5 + (back ? -along : along), 0.5 + across, height)
      : project(0.5 + across, 0.5 + (back ? -along : along), height);
    const width = train ? 0.125 : 0.11, half = train ? 0.3 : 0.4;
    const box = (front, rear, bottom, top, wall, roof, across = width) => {
      polygon(ctx, [point(rear, across, bottom), point(front, across, bottom), point(front, across, top), point(rear, across, top)], wall, "#263442", 0.35);
      const end = back ? rear : front;
      polygon(ctx, [point(end, -across, bottom), point(end, across, bottom), point(end, across, top), point(end, -across, top)], wall, "#263442", 0.35);
      polygon(ctx, [point(rear, -across, top), point(front, -across, top), point(front, across, top), point(rear, across, top)], roof, "#263442", 0.35);
    };
    polygon(ctx, [point(-half, -width, 0), point(half, -width, 0), point(half, width, 0), point(-half, width, 0)], "rgba(20,28,35,0.25)");
    box(half, -half, 0.6, 2.5, "#35415f", "#657584");
    if (locomotive) {
      box(0.29, -0.29, 2.5, 6.5, "#d8ad4b", "#edce83");
      box(0.22, -0.02, 6.5, 11, "#e2e8ee", "#9caab5");
      box(-0.1, -0.2, 6.5, 8, "#35415f", "#657584", 0.07);
      polygon(ctx, [point(0.221, -0.09, 7.3), point(0.221, 0.09, 7.3), point(0.221, 0.09, 10), point(0.221, -0.09, 10)], "#315769");
      for (let n = -0.26; n < -0.05; n += 0.055) polygon(ctx, [point(n, width + 0.001, 3.2), point(n + 0.025, width + 0.001, 3.2), point(n + 0.025, width + 0.001, 5.8), point(n, width + 0.001, 5.8)], "#35415f");
    } else {
      const front = train ? 0.26 : 0.08, rear = train ? -0.26 : -0.38;
      const bulk = resource === "coal" || resource === "iron" || resource === "copper";
      box(front, rear, 2.5, bulk ? 6.5 : 10, color, color);
      if (bulk) {
        const center = (front + rear) / 2;
        polygon(ctx, [point(rear + 0.04, -width + 0.025, 6.6), point(front - 0.04, -width + 0.025, 6.6), point(front - 0.04, width - 0.025, 6.6), point(rear + 0.04, width - 0.025, 6.6)], "#35415f");
        polygon(ctx, [point(rear + 0.06, width - 0.025, 6.7), point(front - 0.06, width - 0.025, 6.7), point(center, 0, 9)], resource === "coal" ? "#363d47" : resource === "iron" ? "#a76d52" : "#619e90");
      }
      for (let n = rear + 0.04; n < front; n += 0.07) polygon(ctx, [point(n, width + 0.001, 3), point(n + 0.012, width + 0.001, 3), point(n + 0.012, width + 0.001, bulk ? 6 : 9.4), point(n, width + 0.001, bulk ? 6 : 9.4)], "rgba(38,52,66,0.38)");
      if (!train) {
        box(0.37, 0.16, 2.5, 9, "#e2e8ee", "#9caab5");
        polygon(ctx, [point(0.371, -0.08, 5.5), point(0.371, 0.08, 5.5), point(0.371, 0.08, 8), point(0.371, -0.08, 8)], "#315769");
        polygon(ctx, [point(0.19, width + 0.001, 5.7), point(0.31, width + 0.001, 5.7), point(0.31, width + 0.001, 8), point(0.19, width + 0.001, 8)], "#315769");
      }
    }
    for (const along of train ? [-0.22, -0.14, 0.14, 0.22] : [-0.3, -0.19, 0.27]) {
      const [x, y] = point(along, width + 0.01, 1.6);
      ctx.fillStyle = "#222831"; ctx.beginPath(); ctx.ellipse(x, y, 1.1, 1.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#a9c9e7"; ctx.beginPath(); ctx.ellipse(x, y, 0.45, 0.65, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (!train || locomotive) for (const across of [-0.075, 0.045]) polygon(ctx,
      [point(half, across, 3), point(half, across + 0.025, 3), point(half, across + 0.025, 3.8), point(half, across, 3.8)], "#f3ecd8");
  }
  function trainSprite(ctx, kind, axis, back, project, polygon) {
    const [, model, resource] = kind.split("-"); sprite(ctx, model, resource, axis, back, project, polygon);
  }
  window.__freightVehicles = { update, drawRoad, sprite, trainSprite,
    hasActive: renderer => !reduced.matches && (states.get(renderer)?.vehicles ?? 0) > 0 };
})();
