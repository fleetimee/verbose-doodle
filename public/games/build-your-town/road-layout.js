(() => {
  const road = (city, x, y, height) => city.inBounds(x, y) &&
    city.overlay[city.idx(x, y)] === 2 && !city.rail[city.idx(x, y)] &&
    city.terrain[city.idx(x, y)] === 0 && city.isFlat(x, y) && city.base(x, y) === height;

  function wide(city, x, y) {
    if (!city.inBounds(x, y)) return null;
    const height = city.base(x, y);
    if (!road(city, x, y, height)) return null;
    for (const axis of ["x", "y"]) {
      for (const offset of [-1, 1]) {
        const across = axis === "x" ? y : x;
        const along = axis === "x" ? x : y;
        const lower = Math.min(across, across + offset);
        const exists = (a, b) => axis === "x" ? road(city, a, b, height) : road(city, b, a, height);
        for (let start = along - 2; start <= along; start++) {
          let valid = true;
          for (let a = start; a < start + 3; a++) {
            if (!exists(a, lower) || !exists(a, lower + 1) ||
                (exists(a, lower - 1) || exists(a, lower + 2))) { valid = false; break; }
          }
          if (!valid) continue;
          const side = across === lower ? 0 : 1;
          const direction = axis === "x" ? side ? 1 : -1 : side ? -1 : 1;
          return { axis, side, direction, lane: side ? 0.35 : 0.65 };
        }
      }
    }
    return null;
  }

  function canStep(city, from, to) {
    const x = from % city.size, y = Math.floor(from / city.size);
    const layout = wide(city, x, y);
    if (!layout) return true;
    const dx = to % city.size - x, dy = Math.floor(to / city.size) - y;
    const along = layout.axis === "x" ? dx : dy;
    if (along) return along * layout.direction > 0;
    const nx = x + (layout.axis === "x" ? layout.direction : 0);
    const ny = y + (layout.axis === "y" ? layout.direction : 0);
    const ahead = wide(city, nx, ny);
    return !ahead || ahead.axis !== layout.axis || ahead.side !== layout.side;
  }

  function median(city, x, y, layout) {
    if (!layout) return false;
    const dx = layout.axis === "x" ? 1 : 0;
    const dy = layout.axis === "y" ? 1 : 0;
    const before = wide(city, x - dx, y - dy);
    const after = wide(city, x + dx, y + dy);
    return before?.axis === layout.axis && after?.axis === layout.axis &&
      before.side === layout.side && after.side === layout.side;
  }

  function sprite(ctx, axis, side, direction, project, polygon, grass, planted) {
    grass(ctx, 0);
    const point = (along, across) => axis === "x" ? project(along, across) : project(across, along);
    const band = (low, high, color) => polygon(ctx, [point(0, low), point(1, low), point(1, high), point(0, high)], color);
    band(side ? 0 : 0.26, side ? 0.74 : 1, "#9aa0a6");
    band(side ? 0 : 0.3, side ? 0.7 : 1, "#565b61");
    if (planted) {
      band(side ? 0 : 0.89, side ? 0.11 : 1, "#b6bba5");
      band(side ? 0 : 0.915, side ? 0.085 : 1, "#708d4c");
    }
    ctx.strokeStyle = planted ? "#c3c9ad" : "#d8c25a";
    ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(...point(0, side ? planted ? 0.11 : 0.025 : planted ? 0.89 : 0.975));
    ctx.lineTo(...point(1, side ? planted ? 0.11 : 0.025 : planted ? 0.89 : 0.975)); ctx.stroke();
    const lane = side ? 0.35 : 0.65;
    const tip = 0.5 + direction * 0.09;
    polygon(ctx, [point(tip, lane), point(0.5 - direction * 0.04, lane - 0.045),
      point(0.5 - direction * 0.04, lane + 0.045)], "#e9e6da");
  }
  function plantSprite(ctx, axis, variant, project, polygon) {
    const point = (along, across, height = 0) => axis === "x"
      ? project(along, across, height) : project(across, along, height);
    const shrub = (along, radius, color) => {
      const [px, py] = point(along, 0, 2);
      ctx.fillStyle = "rgba(34,49,30,0.22)";
      ctx.beginPath(); ctx.ellipse(px, py + 2, radius + 0.6, radius * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#4e7041";
      ctx.beginPath(); ctx.ellipse(px, py, radius, radius * 0.75, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(px - 0.6, py - 0.8, radius * 0.8, radius * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    };
    shrub(0.22, 2.1, "#91ac63");
    shrub(0.78, 2.3, variant === 2 ? "#b0b778" : "#7e9d59");
    if (variant === 1) { shrub(0.5, 2.8, "#86a45d"); return; }
    const [bx, by] = point(0.5, 0);
    const [tx, ty] = point(0.5, 0, 8);
    ctx.strokeStyle = "#806248"; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
    if (variant === 2) {
      polygon(ctx, [point(0.5, -0.075, 5), point(0.5, 0.075, 5),
        point(0.5, 0, 12)], "#52794a", "#42603b", 0.5);
      polygon(ctx, [point(0.46, -0.04, 7), point(0.54, 0.04, 7),
        point(0.5, 0, 12)], "#87a65d");
    } else {
      ctx.fillStyle = "#527a45";
      ctx.beginPath(); ctx.ellipse(tx, ty - 0.7, 3.3, 3.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#89aa60";
      ctx.beginPath(); ctx.ellipse(tx - 0.8, ty - 1.5, 2.6, 2.7, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawMedian(renderer, city, index, x, y, scale) {
    const tx = index % city.size, ty = Math.floor(index / city.size);
    const layout = wide(city, tx, ty);
    if (!layout || layout.side !== 1 || !median(city, tx, ty, layout)) return;
    const variant = city.medianPlants?.[index] ?? ((layout.axis === "x" ? tx : ty) + city.seed) % 3;
    const image = renderer.sprites.get(`median:${layout.axis}:${variant}`, scale);
    renderer.ctx.drawImage(image, Math.round(x - 32 * scale), Math.round(y - 112 * scale));
  }
  window.__roadLayout = { wide, median, canStep, sprite, plantSprite, drawMedian };
})();
