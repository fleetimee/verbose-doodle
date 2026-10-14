(() => {
  function railing(ctx, point, width = 0.23, railway = false) {
    ctx.save();
    ctx.setLineDash([]);
    for (const across of [-width, width]) {
      ctx.strokeStyle = railway ? "#34434b" : "#a94c35"; ctx.lineWidth = railway ? 1.2 : 1;
      for (let post = 0; post <= (railway ? 8 : 4); post++) {
        const t = post / (railway ? 8 : 4);
        ctx.beginPath(); ctx.moveTo(...point(t, across, 0.3));
        ctx.lineTo(...point(t, across, railway ? 5 : 4)); ctx.stroke();
      }
      if (railway) {
        ctx.strokeStyle = "#6e818a"; ctx.lineWidth = 0.5;
        for (let panel = 0; panel < 8; panel++) {
          const from = panel / 8, to = (panel + 1) / 8;
          ctx.beginPath(); ctx.moveTo(...point(from, across, 0.8)); ctx.lineTo(...point(to, across, 4.8));
          ctx.moveTo(...point(from, across, 4.8)); ctx.lineTo(...point(to, across, 0.8)); ctx.stroke();
        }
      }
      for (const height of railway ? [0.8, 2.8, 4.8] : [1.8, 3.7]) {
        ctx.strokeStyle = railway ? height === 4.8 ? "#8d9ca4" : "#42535d" : height === 3.7 ? "#e17c4f" : "#b8583b";
        ctx.lineWidth = height === 3.7 || height === 4.8 ? 1.2 : 0.8;
        ctx.beginPath();
        for (let step = 0; step <= 24; step++) {
          const p = point(step / 24, across, height);
          step ? ctx.lineTo(...p) : ctx.moveTo(...p);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  function curve(mask) {
    const ends = [[1, 0.5, 0], [2, 1, 0.5], [4, 0.5, 1], [8, 0, 0.5]]
      .filter(([arm]) => mask & arm);
    if (ends.length !== 2 || ends[0][1] === ends[1][1] || ends[0][2] === ends[1][2]) return null;
    const [a, b] = ends;
    return { ends, point(t) {
      const q = 1 - t;
      const u = q * q * a[1] + q * t + t * t * b[1];
      const v = q * q * a[2] + q * t + t * t * b[2];
      const du = 2 * q * (0.5 - a[1]) + 2 * t * (b[1] - 0.5);
      const dv = 2 * q * (0.5 - a[2]) + 2 * t * (b[2] - 0.5);
      const length = Math.hypot(du, dv);
      return { u, v, nu: -dv / length, nv: du / length };
    } };
  }
  function endHeight(arm, baseRamp, upperRamp) {
    const base = baseRamp < 0 || (baseRamp & arm) ? 0 : 1.5;
    return base + (upperRamp < 0 || upperRamp !== 16 && (upperRamp & arm) ? 0 : 1.5);
  }
  function curveHeight(mask, baseRamp, upperRamp, u, v) {
    const path = curve(mask);
    if (!path) return null;
    let nearest = 0, distance = Infinity;
    for (let step = 0; step < 32; step++) {
      const a = path.point(step / 32), b = path.point((step + 1) / 32);
      const du = b.u - a.u, dv = b.v - a.v;
      const fraction = Math.max(0, Math.min(1, ((u - a.u) * du + (v - a.v) * dv) / (du * du + dv * dv)));
      const next = (a.u + du * fraction - u) ** 2 + (a.v + dv * fraction - v) ** 2;
      if (next < distance) { distance = next; nearest = (step + fraction) / 32; }
    }
    return endHeight(path.ends[0][0], baseRamp, upperRamp) * (1 - nearest) +
      endHeight(path.ends[1][0], baseRamp, upperRamp) * nearest;
  }
  function curveSprite(ctx, mask, baseRamp, upperRamp, road, project, polygon, Shapes, noSupports = false) {
    const path = curve(mask);
    if (!path) return false;
    const first = endHeight(path.ends[0][0], baseRamp, upperRamp);
    const last = endHeight(path.ends[1][0], baseRamp, upperRamp);
    const point = (t, across = 0, offset = 0) => {
      const p = path.point(t);
      return project(Math.max(0, Math.min(1, p.u + p.nu * across)),
        Math.max(0, Math.min(1, p.v + p.nv * across)), (first * (1 - t) + last * t) * 8 + offset);
    };
    const shapes = new Shapes(ctx, 0);
    for (const t of noSupports ? [] : [0.2, 0.8]) {
      const p = path.point(t), height = (first * (1 - t) + last * t) * 8;
      if (height > 2.5) shapes.box(p.u - 0.04, p.v - 0.04, p.u + 0.04, p.v + 0.04,
        height - 2.5, "#6b6f75", "#8a8f96");
    }
    shapes.render();
    const samples = Array.from({ length: 25 }, (_, index) => index / 24);
    const strip = width => [...samples.map(t => point(t, width)), ...samples.toReversed().map(t => point(t, -width))];
    for (const across of [-0.24, 0.24]) polygon(ctx,
      [...samples.map(t => point(t, across)), ...samples.toReversed().map(t => point(t, across, -2.5))],
      road ? "#6b6f75" : "#3c4851");
    polygon(ctx, strip(0.24), road ? "#9aa0a6" : "#8d867a");
    if (road) polygon(ctx, strip(0.2), "#565b61");
    const line = (across, color, width, dash = []) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.beginPath();
      samples.forEach((t, index) => { const p = point(t, across); index ? ctx.lineTo(...p) : ctx.moveTo(...p); });
      ctx.stroke(); ctx.setLineDash([]);
    };
    if (road) line(0, "#d8c25a", 1.2, [3, 3]);
    else {
      for (let t = 0.05; t < 1; t += 0.09) {
        ctx.strokeStyle = "#6b5537"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(...point(t, -0.16)); ctx.lineTo(...point(t, 0.16)); ctx.stroke();
      }
      line(-0.07, "#3a3a3a", 1.2); line(0.07, "#3a3a3a", 1.2);
    }
    railing(ctx, point, 0.23, !road);
    return true;
  }
  function sprite(ctx, mask, baseRamp, upperRamp, project, polygon, Shapes, rampHeights, noSupports = false) {
    if (curveSprite(ctx, mask, baseRamp, upperRamp, false, project, polygon, Shapes, noSupports)) return;
    const heights = rampHeights(baseRamp);
    if (upperRamp >= 0) {
      const extra = rampHeights(upperRamp === 16 ? 0 : upperRamp);
      for (let index = 0; index < 4; index++) heights[index] += extra[index];
    }
    const height = (u, v) => heights[0] * (1 - u) * (1 - v) + heights[1] * u * (1 - v) + heights[2] * u * v + heights[3] * (1 - u) * v;
    const point = (u, v, offset = 0) => project(u, v, height(u, v) * 8 + offset);
    const shapes = new Shapes(ctx, 0);
    const support = (u, v) => shapes.box(u - 0.045, v - 0.045, u + 0.045, v + 0.045,
      Math.max(0, height(u, v) * 8 - 2.5), "#6b6f75", "#8a8f96");
    // Edge piers leave the road bridge clear below a rail overpass.
    for (const [u, v] of noSupports ? [] : mask === 5 ? [[0.3, 0.05], [0.7, 0.95]] : [[0.05, 0.3], [0.95, 0.7]]) support(u, v);
    shapes.render();
    const corners = mask === 5 ? [[0.26, 0], [0.74, 0], [0.74, 1], [0.26, 1]] : [[0, 0.26], [1, 0.26], [1, 0.74], [0, 0.74]];
    for (let index = 0; index < 4; index++) {
      const a = corners[index], b = corners[(index + 1) % 4];
      polygon(ctx, [point(...a, -2.5), point(...b, -2.5), point(...b), point(...a)], "#3c4851");
    }
    polygon(ctx, corners.map(corner => point(...corner)), "#8d867a");
    // Rails share the same height field as the deck and moving trains.
    const raisedProject = (u, v, z = 0) => project(u, v, height(u, v) * 8 + z);
    for (const across of [-0.07, 0.07]) {
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = 1.2;
      const a = mask === 5 ? [0.5 + across, 0] : [0, 0.5 + across];
      const b = mask === 5 ? [0.5 + across, 1] : [1, 0.5 + across];
      ctx.beginPath();ctx.moveTo(...raisedProject(...a));ctx.lineTo(...raisedProject(...b));ctx.stroke();
    }
    for (let along = 0.07; along < 1; along += 0.14) {
      const a = mask === 5 ? [0.34, along] : [along, 0.34];
      const b = mask === 5 ? [0.66, along] : [along, 0.66];
      ctx.strokeStyle = "#6b5537";ctx.lineWidth = 1.5;
      ctx.beginPath();ctx.moveTo(...raisedProject(...a));ctx.lineTo(...raisedProject(...b));ctx.stroke();
    }
    railing(ctx, (along, across, z) => mask === 5
      ? point(0.5 + across, along, z) : point(along, 0.5 + across, z), 0.23, true);
  }
  function roadHeights(city, index, renderer) {
    if (city.terrain[index] !== 1) return [0, 0, 0, 0];
    const mask = renderer.rampMask(city, index % city.size, Math.floor(index / city.size));
    const heights = [1.5, 1.5, 1.5, 1.5];
    if (mask & 1) heights[0] = heights[1] = 0;
    if (mask & 2) heights[1] = heights[2] = 0;
    if (mask & 4) heights[2] = heights[3] = 0;
    if (mask & 8) heights[3] = heights[0] = 0;
    return heights;
  }
  function roadHeight(city, index, renderer, u, v, corners) {
    const interpolate = heights => heights[0] * (1 - u) * (1 - v) + heights[1] * u * (1 - v) +
      heights[2] * u * v + heights[3] * (1 - u) * v;
    if (city.terrain[index] !== 1) return interpolate(corners);
    const x = index % city.size, y = Math.floor(index / city.size);
    const curved = curveHeight(renderer.roadMask(city, x, y), renderer.rampMask(city, x, y), -1, u, v);
    return interpolate(corners) + (curved ?? interpolate(roadHeights(city, index, renderer)));
  }
  function supportsBlocked(city, x, y) {
    return [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]]
      .some(([dx, dy]) => city.isRoadway(x + dx, y + dy));
  }
  window.__seaRail = { railing, supportsBlocked, sprite, curveSprite, curveHeight, roadHeight, roadHeights };
})();
