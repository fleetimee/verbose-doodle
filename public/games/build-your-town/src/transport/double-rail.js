(() => {
  const copy = (en, fr) => document.documentElement.lang === "fr" ? fr : en;

  function toolbar(groups) {
    const transport = groups.find(group => group.items?.some(item => item.tool === "rail"));
    const index = transport.items.findIndex(item => item.tool === "rail");
    transport.items.splice(index + 1, 0, {
      tool: "doubleRail",
      name: copy("Double-track railway", "Double voie ferrée"),
      meta: copy("$50 / pair · land only", "50 $ / paire · sur terre"),
      desc: copy("Drag a straight two-tile-wide railway. Plant trees or lay power lines in the middle strip. Use Railway for bridges and junctions.", "Tracez une double voie droite de deux cases de large. Plantez ou posez des lignes électriques au centre. Utilisez Voie ferrée pour les ponts et aiguillages."),
      icon: transport.items[index].icon,
    });
    return groups;
  }

  function preview(city, tool, start, end, planRail, translate) {
    if (tool !== "doubleRail") return null;
    const horizontal = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y);
    const from = horizontal ? start.x : start.y;
    const to = horizontal ? end.x : end.y;
    const lanes = [[], []];
    for (let along = Math.min(from, to); along <= Math.max(from, to); along++) {
      for (let side = 0; side < 2; side++) {
        lanes[side].push(horizontal ? { x: along, y: start.y + side } : { x: start.x + side, y: along });
      }
    }
    const footprint = lanes.flat();
    const invalid = reason => ({ tool: "rail", tiles: [], footprint: footprint.filter(p => city.inBounds(p.x, p.y)).map(p => city.idx(p.x, p.y)), cost: 0, valid: false, reason });
    if (footprint.some(p => !city.inBounds(p.x, p.y) || city.terrain[city.idx(p.x, p.y)] !== 0)) {
      return invalid(copy("Double track requires two clear land tiles across. Use Railway for bridges.", "La double voie nécessite deux cases de terre. Utilisez Voie ferrée pour les ponts."));
    }
    const plans = lanes.map(lane => planRail(city, "rail", lane));
    const tiles = [...new Set(plans.flatMap(plan => plan.tiles))];
    const available = new Set(tiles);
    if (footprint.some(p => window.__railTransit?.kind(city, city.idx(p.x, p.y)))) return invalid(copy("Keep double track separate from high-speed rail and LRT", "Séparez la double voie des voies rapides et du métro léger"));
    if (footprint.some(p => !city.rail[city.idx(p.x, p.y)] && !available.has(city.idx(p.x, p.y)))) {
      return invalid(plans.find(plan => plan.reason || plan.note)?.reason ?? plans.find(plan => plan.note)?.note ?? translate("reason.occupied"));
    }
    return { tool: "rail", tiles, footprint: footprint.map(p => city.idx(p.x, p.y)), cost: plans.reduce((sum, plan) => sum + plan.cost, 0), valid: tiles.length > 0, reason: tiles.length ? undefined : translate("reason.nothing") };
  }

  // Adjacent parallel tracks stay straight instead of becoming a ladder of junctions.
  function layout(city, x, y) {
    const type = window.__railTransit?.kind(city, city.idx(x, y)) ?? 0;
    const rail = (a, b) => city.inBounds(a, b) && city.rail[city.idx(a, b)] && (window.__railTransit?.kind(city, city.idx(a, b)) ?? 0) === type && city.terrain[city.idx(a, b)] === 0;
    if (!rail(x, y)) return null;
    for (const horizontal of [true, false]) {
      const along = horizontal ? x : y, across = horizontal ? y : x;
      const at = (a, b) => horizontal ? rail(a, b) : rail(b, a);
      for (const side of [-1, 1]) {
        for (let start = along - 2; start <= along; start++) {
          if (![0, 1, 2].every(step => at(start + step, across) && at(start + step, across + side))) continue;
          // Preserve branches on the outside of the pair.
          const mask = (at(along - 1, across) ? horizontal ? 8 : 1 : 0) |
            (at(along + 1, across) ? horizontal ? 2 : 4 : 0) |
            (at(along, across - side) ? horizontal ? side > 0 ? 1 : 4 : side > 0 ? 8 : 2 : 0);
          return { axis: horizontal ? "x" : "y", side: side > 0 ? 0 : 1, mask };
        }
      }
    }
    return null;
  }

  function mask(city, x, y) { return layout(city, x, y)?.mask ?? null; }

  function offset(city, x, y) {
    if (window.__railTransit?.kind(city, city.idx(x, y))) return 0;
    const pair = layout(city, x, y);
    if (!pair || !city.isFlat(x, y) || city.overlay[city.idx(x, y)] > 1 ||
        (pair.mask & ~(pair.axis === "x" ? 10 : 5))) return 0;
    const dx = +(pair.axis === "x"), dy = +(pair.axis === "y");
    if (city.isRoadway(x - dx, y - dy) || city.isRoadway(x + dx, y + dy)) return 0;
    const otherX = x + (pair.axis === "y" ? pair.side ? -1 : 1 : 0);
    const otherY = y + (pair.axis === "x" ? pair.side ? -1 : 1 : 0);
    if (!city.isFlat(otherX, otherY) || city.base(x, y) !== city.base(otherX, otherY)) return 0;
    return pair.side ? -0.18 : 0.18;
  }

  function profile(city, x, y) {
    const pair = layout(city, x, y), center = offset(city, x, y);
    if (!pair || !center) return null;
    const dx = +(pair.axis === "x"), dy = +(pair.axis === "y");
    const edge = sign => city.hasRail(x + dx * sign, y + dy * sign)
      ? (center + offset(city, x + dx * sign, y + dy * sign)) / 2 : center;
    return { ...pair, start: edge(-1), center, end: edge(1) };
  }

  const shift = (profile, along) => along < 0.5
    ? profile.start + (profile.center - profile.start) * along * 2
    : profile.center + (profile.end - profile.center) * (along - 0.5) * 2;

  function position(city, point) {
    const x = Math.floor(point.x), y = Math.floor(point.y);
    if (!city.inBounds(x, y)) return point;
    const path = profile(city, x, y);
    if (!path) return point;
    const amount = shift(path, path.axis === "x" ? point.x - x : point.y - y);
    return { ...point, x: point.x + (path.axis === "y" ? amount : 0), y: point.y + (path.axis === "x" ? amount : 0) };
  }

  function sprite(ctx, axis, start, center, end, project) {
    const path = { start, center, end };
    const point = (along, across) => axis === "x"
      ? project(along, 0.5 + shift(path, along) + across)
      : project(0.5 + shift(path, along) + across, along);
    const stroke = (points, color, width) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke();
    };
    for (let along = 0.05; along < 1; along += 0.09) stroke([point(along, -0.16), point(along, 0.16)], "#6b5537", 1.5);
    for (const across of [-0.07, 0.07]) stroke([0, 0.25, 0.5, 0.75, 1].map(along => point(along, across)), "#3a3a3a", 1.2);
  }

  function median(city, x, y) {
    const pair = profile(city, x, y);
    if (!pair || pair.start !== pair.center || pair.end !== pair.center) return null;
    const owner = city.idx(x, y) + (pair.side === 0 ? pair.axis === "x" ? city.size : 1 : 0);
    const other = owner - (pair.axis === "x" ? city.size : 1);
    if (!offset(city, other % city.size, Math.floor(other / city.size)) ||
        !offset(city, owner % city.size, Math.floor(owner / city.size))) return null;
    if (city.fire[owner] || city.fire[other] || city.flood[owner] || city.flood[other]) return null;
    return { ...pair, owner, other };
  }

  function drawMedian(renderer, city, index, x, y, scale) {
    const strip = median(city, index % city.size, Math.floor(index / city.size));
    if (!strip || strip.side !== 1) return;
    const variant = city.medianPlants?.[strip.owner] ?? city.medianPlants?.[strip.other];
    if (variant === undefined) return;
    const image = renderer.sprites.get(`median:${strip.axis}:${variant}`, scale);
    renderer.ctx.drawImage(image, Math.round(x - 32 * scale), Math.round(y - 112 * scale));
  }

  function canStep(city, x, y, nx, ny) {
    if (window.__railTransit && !window.__railTransit.canStep(city, x, y, nx, ny)) return false;
    const direction = nx > x ? 2 : nx < x ? 8 : ny > y ? 4 : 1;
    const reverse = direction === 1 ? 4 : direction === 4 ? 1 : direction === 2 ? 8 : 2;
    const from = mask(city, x, y), to = mask(city, nx, ny);
    return (from === null || (from & direction) !== 0) && (to === null || (to & reverse) !== 0);
  }

  window.__doubleRail = { toolbar, preview, mask, canStep, layout, profile, position, sprite, median, drawMedian };
})();
