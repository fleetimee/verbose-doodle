(() => {
  const spacing = 0.68;
  const palettes = [
    { body: "#e2e8ee", stripe: "#2874bd", roof: "#8b9aa8", height: 8, cars: 3 },
    { body: "#cce5df", stripe: "#178776", roof: "#566d70", height: 9, cars: 4 },
    { body: "#f5eee2", stripe: "#bd3e42", roof: "#acafb6", height: 7, cars: 5 },
    { body: "#f5f8fa", stripe: "#256bc1", roof: "#dbe7ec", height: 7.5, cars: 5 },
    { body: "#d9eeed", stripe: "#159d95", roof: "#829fa9", height: 8.5, cars: 3 },
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
  function railHeight(renderer, city, point) {
    const x = Math.floor(point.x), y = Math.floor(point.y);
    if (!city.inBounds(x, y)) return null;
    const index = city.idx(x, y);
    if (!city.rail[index]) return null;
    if (window.__railTransit?.kind(city, index) === 2) return city.base(x, y) + 3;
    const ramp = mask => {
      const heights = [1.5, 1.5, 1.5, 1.5];
      if (mask & 1) heights[0] = heights[1] = 0;
      if (mask & 2) heights[1] = heights[2] = 0;
      if (mask & 4) heights[2] = heights[3] = 0;
      if (mask & 8) heights[3] = heights[0] = 0;
      return heights;
    };
    let extra = [0, 0, 0, 0];
    const deck = renderer.railDeck(city, x, y);
    const upper = deck ? 0 : renderer.railRamp(city, x, y, renderer.railMask(city, x, y));
    if (city.terrain[index] === 1) {
      const base = renderer.railBridgeRamp(city, x, y);
      extra = ramp(base);
      if (upper >= 0) {
        const raised = ramp(upper);
        extra = extra.map((value, corner) => value + raised[corner]);
      }
    } else if (upper >= 0) extra = ramp(upper);
    const curved = window.__seaRail.curveHeight(renderer.railMask(city, x, y),
      city.terrain[index] === 1 ? renderer.railBridgeRamp(city, x, y) : -1,
      deck ? 16 : upper, point.x - x, point.y - y);
    if (curved !== null) {
      const [a, b, c, d] = city.corners(x, y), u = point.x - x, v = point.y - y;
      return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * u * v + d * (1 - u) * v + curved;
    }
    const heights = city.corners(x, y).map((height, corner) => height + extra[corner]);
    const u = point.x - x, v = point.y - y;
    return heights[0] * (1 - u) * (1 - v) + heights[1] * u * (1 - v) +
      heights[2] * u * v + heights[3] * (1 - u) * v;
  }
  function bind(renderer) {
    if (bound.has(renderer)) return;
    bound.add(renderer);
    window.__railSignals.bind(renderer);
    const step = renderer.stepWalker.bind(renderer);
    renderer.stepWalker = (city, walker, delta) => {
      if (walker.kind !== "train") return step(city, walker, delta);
      if (!renderer.walkable(city, "train", walker.x, walker.y) ||
          (window.__railTransit?.kind(city, city.idx(walker.x, walker.y)) ?? 0) !== (walker.transitType ?? 0)) return;
      walker.signalWaiting = !window.__railSignals.canMove(renderer, city, walker);
      if (walker.signalWaiting) return;
      walker.t += walker.speed * delta;
      while (walker.t >= 1) {
        const remaining = walker.t - 1;
        const dx = walker.x - walker.px, dy = walker.y - walker.py;
        const forward = [[dx, dy], [-dy, dx], [dy, -dx]].some(([x, y]) =>
          renderer.walkable(city, "train", walker.x + x, walker.y + y) &&
          (window.__doubleRail?.canStep(city, walker.x, walker.y, walker.x + x, walker.y + y) ?? true));
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
      const variant = walker.fleetVariant ??= renderer.walkers.filter(item => item.kind === "train").indexOf(walker) % 3;
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
        point = window.__doubleRail?.position(city, point) ?? point;
        const x = Math.floor(point.x), y = Math.floor(point.y);
        if (!city.inBounds(x, y)) continue;
        const axis = Math.abs(direction.x) >= Math.abs(direction.y) ? "x" : "y";
        const index = city.idx(x, y), vehicles = renderer.vehiclesByTile.get(index) ?? [];
        const travel = direction[axis] < 0 ? -1 : 1;
        const wheel = offset => ({ x: point.x + (axis === "x" ? offset * travel : 0),
          y: point.y + (axis === "y" ? offset * travel : 0) });
        const front = railHeight(renderer, city, wheel(0.22));
        const rear = railHeight(renderer, city, wheel(-0.22));
        const rideHeight = front !== null && rear !== null
          ? ((front + rear) / 2 - Math.min(...city.corners(x, y))) * 8 : undefined;
        const pitch = front !== null && rear !== null
          ? -(front - rear) * 8 / (0.44 * 32 * travel * (axis === "x" ? 1 : -1)) : 0;
        vehicles.push({ u: point.x - x, v: point.y - y, kind: `fleet-${variant}-${car === 0 ? 0 : car === count - 1 ? 2 : 1}`,
          axis, back: +(travel < 0), train: true, rideHeight, pitch });
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
    if (variant === 3) {
      const front = cab ? 0.05 : 0.3;
      box(front, -0.3, 1.4, 7.5, palette.body, palette.roof);
      box(front, -0.3, 2.5, 3.2, palette.stripe, palette.stripe);
      if (cab) {
        polygon(ctx, [point(0.05, 0.11, 1.4), point(0.43, 0.055, 1.4), point(0.39, 0.055, 2.8), point(0.05, 0.11, 7.5)], palette.body, "#698795", 0.4);
        polygon(ctx, [point(0.05, -0.11, 7.5), point(0.05, 0.11, 7.5), point(0.39, 0.055, 2.8), point(0.39, -0.055, 2.8)], "#ecf4f8", "#698795", 0.4);
        polygon(ctx, [point(0.07, -0.08, 7.1), point(0.07, 0.08, 7.1), point(0.17, 0.065, 5.5), point(0.17, -0.065, 5.5)], "#1d4059");
        polygon(ctx, [point(0.05, 0.112, 2.5), point(0.4, 0.057, 1.8), point(0.39, 0.057, 2.3), point(0.05, 0.112, 3.2)], palette.stripe);
        polygon(ctx, [point(0.3, -0.04, 2.5), point(0.35, -0.035, 2), point(0.35, 0.035, 2), point(0.3, 0.04, 2.5)], rear ? "#e45c62" : "#f8edc8");
      }
      for (let along = -0.25; along < (cab ? 0.01 : 0.23); along += 0.1) polygon(ctx,
        [point(along, 0.112, 4.3), point(along + 0.06, 0.112, 4.3), point(along + 0.06, 0.112, 6.3), point(along, 0.112, 6.3)], "#23485f");
      if (!cab) box(0.08, -0.08, 7.5, 8.2, "#91a7b3", "#b0c5cf");
      return;
    }
    if (variant === 4) {
      box(0.29, -0.29, 1.4, 8.5, palette.body, palette.roof);
      box(0.29, -0.29, 1.6, 3, palette.stripe, palette.stripe);
      box(0.29, -0.29, 7.8, 8.5, palette.stripe, palette.stripe);
      if (cab) polygon(ctx, [point(0.291, -0.1, 3.3), point(0.291, 0.1, 3.3), point(0.291, 0.1, 7.6), point(0.291, -0.1, 7.6)], "#203e50", "#527e8b", 0.4);
      for (const along of [-0.25, 0.05]) polygon(ctx,
        [point(along, 0.112, 3.5), point(along + 0.16, 0.112, 3.5), point(along + 0.16, 0.112, 7.4), point(along, 0.112, 7.4)], "#244958");
      polygon(ctx, [point(-0.06, 0.113, 1.8), point(0.04, 0.113, 1.8), point(0.04, 0.113, 7.6), point(-0.06, 0.113, 7.6)], "#519b9b", "#1d636b", 0.4);
      box(0.13, -0.13, 8.5, 9.6, "#607e8d", "#abc4cc");
      if (!cab) {
        const roof = [point(-0.08, 0, 9.8), point(0, 0, 12.2), point(0.1, 0, 10), point(-0.08, 0, 9.8)];
        ctx.strokeStyle = "#496573"; ctx.lineWidth = 0.8; ctx.beginPath();
        roof.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke();
      }
      if (cab) for (const across of [-0.075, 0.055]) polygon(ctx,
        [point(0.292, across, 2.3), point(0.292, across + 0.02, 2.3), point(0.292, across + 0.02, 3), point(0.292, across, 3)], rear ? "#e76e66" : "#fff2cf");
      return;
    }
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
        (vehicle.rideHeight ?? heightAt(vehicle.u, vehicle.v, train.heights)) * scale - halfHeight - anchorY;
      const angle = Math.max(-0.28, Math.min(0.28, Math.atan(vehicle.pitch ?? 0)));
      const pivotX = image.width / 2, pivotY = anchorY + halfHeight;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const corners = [[0, 0], [image.width, 0], [image.width, image.height], [0, image.height]]
        .map(([u, v]) => ({ x: x + pivotX + (u - pivotX) * cos - (v - pivotY) * sin,
          y: y + pivotY + (u - pivotX) * sin + (v - pivotY) * cos }));
      const left = Math.min(...corners.map(point => point.x));
      const right = Math.max(...corners.map(point => point.x));
      const top = Math.min(...corners.map(point => point.y));
      const bottom = Math.max(...corners.map(point => point.y));
      ctx.save();
      ctx.translate(x + pivotX, y + pivotY);
      ctx.rotate(angle);
      ctx.drawImage(image, -pivotX, -pivotY);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.rect(left, top, right - left, bottom - top);
      ctx.clip();
      for (const building of occluders) {
        if (building.tile < train.tile || building.x >= right ||
            building.x + building.image.width <= left || building.y >= bottom ||
            building.y + building.image.height <= top) continue;
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
  window.__trainFleet = { bind, sprite, drawLayer, drawRoadLayer, railHeight };
})();
