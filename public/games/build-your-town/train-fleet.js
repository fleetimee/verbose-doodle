(() => {
  const spacing = 0.68;
  const palettes = [
    { body: "#e2e8ee", stripe: "#2874bd", roof: "#8b9aa8", height: 8, cars: 3 },
    { body: "#cce5df", stripe: "#178776", roof: "#566d70", height: 9, cars: 4 },
    { body: "#f5eee2", stripe: "#bd3e42", roof: "#acafb6", height: 7, cars: 5 },
  ];
  const bound = new WeakSet();
  function reverse(walker) {
    const path = [{ x: walker.x + 0.5, y: walker.y + 0.5 }, ...walker.hist];
    const clipped = [path[0]];
    let remaining = spacing * (palettes[walker.fleetVariant ?? 0].cars - 1);
    for (let index = 1; index < path.length; index++) {
      const before = clipped[clipped.length - 1], next = path[index];
      const length = Math.hypot(next.x - before.x, next.y - before.y);
      if (!length) continue;
      if (length >= remaining) {
        clipped.push({ x: before.x + (next.x - before.x) * remaining / length,
          y: before.y + (next.y - before.y) * remaining / length });
        remaining = 0;
        break;
      }
      clipped.push(next);
      remaining -= length;
    }
    if (remaining > 0.001 || clipped.length < 2) return false;
    walker.hist = clipped.reverse();
    const head = walker.hist[0], next = walker.hist[1];
    const axis = Math.abs(next.x - head.x) >= Math.abs(next.y - head.y) ? "x" : "y";
    const direction = Math.sign(head[axis] - next[axis]);
    const position = head[axis] - 0.5;
    const previous = direction > 0 ? Math.floor(position) : Math.ceil(position);
    walker.px = axis === "x" ? previous : Math.round(head.x - 0.5);
    walker.py = axis === "y" ? previous : Math.round(head.y - 0.5);
    walker.x = walker.px + (axis === "x" ? direction : 0);
    walker.y = walker.py + (axis === "y" ? direction : 0);
    walker.t = Math.abs(position - previous);
    return true;
  }
  function bind(renderer) {
    if (bound.has(renderer)) return;
    bound.add(renderer);
    const step = renderer.stepWalker.bind(renderer);
    renderer.stepWalker = (city, walker, delta) => {
      if (walker.kind !== "train") return step(city, walker, delta);
      if (!renderer.walkable(city, "train", walker.x, walker.y)) return;
      walker.t += walker.speed * delta;
      while (walker.t >= 1) {
        const remaining = walker.t - 1;
        const dx = walker.x - walker.px, dy = walker.y - walker.py;
        const forward = [[dx, dy], [-dy, dx], [dy, -dx]].some(([x, y]) =>
          renderer.walkable(city, "train", walker.x + x, walker.y + y));
        if (!forward && reverse(walker)) walker.t += remaining;
        else if (renderer.pickNext(city, walker, false)) walker.t = remaining;
        else { walker.t = 0.999; break; }
      }
      const point = { x: walker.px + (walker.x - walker.px) * walker.t + 0.5,
        y: walker.py + (walker.y - walker.py) * walker.t + 0.5 };
      const previous = walker.hist[1];
      if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 0.04) {
        walker.hist.unshift(point);
        if (walker.hist.length > 120) walker.hist.pop();
      } else walker.hist[0] = point;
    };
    const place = renderer.placeCars.bind(renderer);
    renderer.placeCars = (city, walker) => {
      if (walker.kind !== "train") return place(city, walker);
      const variant = walker.fleetVariant ??= renderer.walkers.filter(item => item.kind === "train").indexOf(walker) % palettes.length;
      const count = palettes[variant].cars;
      for (let car = 0; car < count; car++) {
        let remaining = car * spacing, point, direction;
        for (let index = 0; index + 1 < walker.hist.length; index++) {
          const head = walker.hist[index], tail = walker.hist[index + 1];
          const length = Math.hypot(head.x - tail.x, head.y - tail.y);
          if (!length) continue;
          if (remaining <= length) {
            point = { x: head.x + (tail.x - head.x) * remaining / length,
              y: head.y + (tail.y - head.y) * remaining / length };
            direction = { x: head.x - tail.x, y: head.y - tail.y };
            break;
          }
          remaining -= length;
        }
        if (!point) continue;
        const x = Math.floor(point.x), y = Math.floor(point.y);
        if (!city.inBounds(x, y)) continue;
        const axis = Math.abs(direction.x) >= Math.abs(direction.y) ? "x" : "y";
        const index = city.idx(x, y), vehicles = renderer.vehiclesByTile.get(index) ?? [];
        vehicles.push({ u: point.x - x, v: point.y - y, kind: `fleet-${variant}-${car === 0 ? 0 : car === count - 1 ? 2 : 1}`,
          axis, back: +(direction[axis] < 0), train: true });
        renderer.vehiclesByTile.set(index, vehicles);
      }
    };
  }
  function sprite(ctx, kind, axis, back, project, polygon) {
    const [, variant, car] = kind.split("-").map(Number);
    const palette = palettes[variant] ?? palettes[0];
    const rear = car === 2;
    const facing = rear ? !back : !!back;
    const point = (along, across, height) => axis === "x"
      ? project(0.5 + (facing ? -along : along), 0.5 + across, height)
      : project(0.5 + across, 0.5 + (facing ? -along : along), height);
    const box = (front, tail, low, high, color, roof) => {
      polygon(ctx, [point(tail, 0.11, low), point(front, 0.11, low),
        point(front, 0.11, high), point(tail, 0.11, high)], color, "#344452", 0.4);
      const end = facing ? tail : front;
      polygon(ctx, [point(end, -0.11, low), point(end, 0.11, low),
        point(end, 0.11, high), point(end, -0.11, high)], color, "#344452", 0.4);
      polygon(ctx, [point(tail, -0.11, high), point(front, -0.11, high),
        point(front, 0.11, high), point(tail, 0.11, high)], roof, "#344452", 0.4);
    };
    const cab = car !== 1;
    const diesel = cab && variant === 2;
    const commuter = cab && variant === 0;
    box(0.28, -0.28, 0, 1.4, "#2a323b", "#2a323b");
    if (diesel) {
      box(0.3, -0.3, 1.4, 3.2, "#ce5b32", "#ce5b32");
      box(0.3, -0.3, 3.2, 5.7, "#e6e4dc", "#a0a6aa");
      box(0.015, -0.27, 5.7, 11.5, "#f2eee5", "#737e88");
      polygon(ctx, [point(0.016, -0.09, 8), point(0.016, 0.09, 8),
        point(0.016, 0.09, 10.7), point(0.016, -0.09, 10.7)], "#345366", "#344452", 0.4);
      polygon(ctx, [point(-0.22, 0.112, 8), point(-0.05, 0.112, 8),
        point(-0.05, 0.112, 10.5), point(-0.22, 0.112, 10.5)], "#345366");
      for (let along = 0.08; along < 0.27; along += 0.045) polygon(ctx,
        [point(along, 0.113, 3.8), point(along + 0.018, 0.113, 3.8),
          point(along + 0.018, 0.113, 5.2), point(along, 0.113, 5.2)], "#48545b");
      box(0.18, 0.13, 5.7, 7.6, "#414b53", "#414b53");
      box(0.31, 0.25, 1.4, 2.2, "#344452", "#344452");
    } else if (commuter) {
      box(0.19, -0.3, 1.4, 8, palette.body, palette.roof);
      polygon(ctx, [point(0.19, 0.11, 1.4), point(0.32, 0.11, 1.4),
        point(0.23, 0.11, 7.5), point(0.19, 0.11, 8)], palette.body, "#344452", 0.4);
      polygon(ctx, [point(0.32, -0.11, 1.4), point(0.32, 0.11, 1.4),
        point(0.23, 0.11, 7.5), point(0.23, -0.11, 7.5)], palette.stripe, "#344452", 0.4);
      polygon(ctx, [point(0.275, -0.09, 4.4), point(0.275, 0.09, 4.4),
        point(0.235, 0.09, 7.2), point(0.235, -0.09, 7.2)], "#294959");
      box(0.19, -0.3, 2.5, 3.6, palette.stripe, palette.stripe);
    } else {
      box(0.3, -0.3, 1.4, palette.height, palette.body, palette.roof);
      box(0.3, -0.3, 2.5, 3.6, palette.stripe, palette.stripe);
      if (cab) {
        box(0.1, -0.15, palette.height, palette.height + 1.5, "#8caaa9", "#b4c9c5");
        polygon(ctx, [point(0.301, -0.095, 4.4), point(0.301, 0.095, 4.4),
          point(0.301, 0.095, 8.3), point(0.301, -0.095, 8.3)], "#243c48", "#344452", 0.4);
      }
    }
    if (!diesel) for (let along = -0.24; along < (commuter ? 0.15 : 0.23); along += 0.12) {
      polygon(ctx, [point(along, 0.112, 4.6), point(along + 0.08, 0.112, 4.6),
        point(along + 0.08, 0.112, palette.height - 0.8), point(along, 0.112, palette.height - 0.8)], "#294959");
    }
    if (cab) for (const across of [-0.065, 0.045]) polygon(ctx,
      [point(0.322, across, 2.3), point(0.322, across + 0.02, 2.3),
        point(0.322, across + 0.02, 3.1), point(0.322, across, 3.1)], rear ? "#e75454" : "#fff0b6");
  }

  function drawLayer(renderer, trains, occluders, halfWidth, halfHeight, anchorX, anchorY, scale, heightAt) {
    const ctx = renderer.ctx;
    trains.sort((a, b) => a.tile - b.tile);
    for (const train of trains) for (const vehicle of train.vehicles) {
      const image = renderer.sprites.get(`vehicle:${vehicle.kind}:${vehicle.axis}:${vehicle.back}`, scale);
      const x = train.x + (vehicle.u - vehicle.v) * halfWidth - anchorX;
      const y = train.y + (vehicle.u + vehicle.v) * halfHeight -
        heightAt(vehicle.u, vehicle.v, train.heights) * scale - halfHeight - anchorY;
      ctx.drawImage(image, x, y);
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, image.width, image.height);
      ctx.clip();
      for (const building of occluders) {
        if (building.tile <= train.tile || building.x >= x + image.width ||
            building.x + building.image.width <= x || building.y >= y + image.height ||
            building.y + building.image.height <= y) continue;
        ctx.drawImage(building.image, building.x, building.y);
      }
      ctx.restore();
    }
  }
  function drawRoadLayer(renderer, vehicles, buildings, roofs) {
    const ctx = renderer.ctx;
    const roofSet = new Set(roofs);
    const objects = [...buildings, ...roofs].sort((a, b) => a.tile - b.tile);
    vehicles.sort((a, b) => a.tile - b.tile || a.y - b.y);
    for (const vehicle of vehicles) {
      ctx.drawImage(vehicle.image, vehicle.x, vehicle.y);
      ctx.save();
      ctx.beginPath();
      ctx.rect(vehicle.x, vehicle.y, vehicle.image.width, vehicle.image.height);
      ctx.clip();
      for (const object of objects) {
        const roof = roofSet.has(object);
        if (object.tile < vehicle.tile || object.tile === vehicle.tile && !roof ||
            object.x >= vehicle.x + vehicle.image.width || object.x + object.image.width <= vehicle.x ||
            object.y >= vehicle.y + vehicle.image.height || object.y + object.image.height <= vehicle.y) continue;
        ctx.drawImage(object.image, object.x, object.y);
      }
      ctx.restore();
    }
  }
  window.__trainFleet = { bind, sprite, drawLayer, drawRoadLayer };
})();
