(() => {
  function sprite(ctx, mask, baseRamp, upperRamp, project, polygon, Shapes, rampHeights) {
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
    for (const [u, v] of mask === 5 ? [[0.3, 0.05], [0.7, 0.95]] : [[0.05, 0.3], [0.95, 0.7]]) support(u, v);
    shapes.render();
    const corners = mask === 5 ? [[0.26, 0], [0.74, 0], [0.74, 1], [0.26, 1]] : [[0, 0.26], [1, 0.26], [1, 0.74], [0, 0.74]];
    for (let index = 0; index < 4; index++) {
      const a = corners[index], b = corners[(index + 1) % 4];
      polygon(ctx, [point(...a, -2.5), point(...b, -2.5), point(...b), point(...a)], "#655e54");
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
  window.__seaRail = { sprite, roadHeights };
})();
