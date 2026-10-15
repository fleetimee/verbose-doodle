(() => {
  const copy = (en, fr) => document.documentElement.lang === "fr" ? fr : en;

  const axisAt = (city, index) => city.rail[index] && !(window.__railTransit?.kind(city, index)) ? city.doubleTracks?.[index] ?? 0 : 0;
  function install(City, messages) {
    messages["query.doubleRail"] = ["Deux voies dans une case · circulation à droite", "Two tracks in one tile · right-hand running"];
    const save = City.prototype.toJSON;
    City.prototype.toJSON = function () {
      const data = save.call(this); data.doubleTracks = [];
      for (let index = 0; index < this.count; index++) if (axisAt(this, index)) data.doubleTracks.push([index, axisAt(this, index)]);
      return data;
    };
    const load = City.fromJSON;
    City.fromJSON = function (data) {
      const city = load.call(this, data); city.doubleTracks = new Uint8Array(city.count);
      if (Array.isArray(data.doubleTracks)) for (const entry of data.doubleTracks.slice(0, city.count)) {
        if (!Array.isArray(entry)) continue;
        const [index, axis] = entry;
        if (Number.isInteger(index) && index >= 0 && index < city.count && city.rail[index] &&
            !(window.__railTransit?.kind(city, index)) && (axis === 1 || axis === 2)) city.doubleTracks[index] = axis;
      }
      return city;
    };
  }

  function toolbar(groups, icon) {
    const transport = groups.find(group => group.items?.some(item => item.tool === "rail"));
    const index = transport.items.findIndex(item => item.tool === "rail");
    transport.items.splice(index + 1, 0, {
      tool: "doubleRail",
      name: copy("Double-track railway", "Double voie ferrée"),
      meta: copy("$50 / tile · two tracks", "50 $ / case · deux voies"),
      desc: copy("Two parallel tracks inside one tile, like highway lanes. Plant trees or power poles in the center strip. Drag a right angle to turn a corner. Flat land only.", "Deux voies dans une case, comme les voies d’autoroute. Plantez ou posez des poteaux au centre. Tracez un angle droit pour tourner. Terrain plat uniquement."),
      icon: icon(["grass:0000:0", "compactrail:x:0.23:0.23:0000"]),
    });
    return groups;
  }

  function preview(city, tool, start, end, planRail, translate) {
    if (tool !== "doubleRail") return null;
    const zero = start.x === end.x && start.y === end.y;
    const restoredAxis = city.inBounds(start.x, start.y) ? city.disasterRecovery?.[city.idx(start.x, start.y)]?.doubleAxis : 0;
    const horizontal = zero && restoredAxis ? restoredAxis === 1 : Math.abs(end.x - start.x) >= Math.abs(end.y - start.y);
    const axis = horizontal ? 1 : 2, from = horizontal ? start.x : start.y, to = horizontal ? end.x : end.y;
    const points = [];
    for (let along = Math.min(from, to); along <= Math.max(from, to); along++) points.push(horizontal ? { x: along, y: start.y } : { x: start.x, y: along });
    const footprint = points.filter(p => city.inBounds(p.x, p.y)).map(p => city.idx(p.x, p.y));
    const invalid = reason => ({ tool, tiles: [], footprint, cost: 0, valid: false, reason });
    if (footprint.length !== points.length) return invalid(translate("reason.offmap"));
    const height = city.base(start.x, start.y), tiles = [];
    let cost = 0;
    const native = planRail(city, "rail", points), available = new Set(native.tiles);
    for (const point of points) {
      const index = city.idx(point.x, point.y);
      if (city.terrain[index] !== 0 || !city.isFlat(point.x, point.y) || city.base(point.x, point.y) !== height) return invalid(copy("Requires flat land at one elevation", "Nécessite un terrain plat de même altitude"));
      if (window.__railTransit?.kind(city, index)) return invalid(copy("Keep ordinary double track separate from high-speed rail and LRT", "Séparez la double voie ordinaire de la grande vitesse et du métro léger"));
      if (city.overlay[index] === 7) return invalid(copy("Use Railway for highway overpasses", "Utilisez Voie ferrée pour franchir les autoroutes"));
      if (city.fire[index] || city.flood[index] || !city.rail[index] && !available.has(index)) return invalid(native.note ?? translate("reason.occupied"));
      if (city.rail[index] && !axisAt(city, index) && (window.__railTransit.mask(city, point.x, point.y) & ~(axis === 1 ? 10 : 5))) return invalid(copy("Keep ordinary Railway at junctions; build a clear compact corridor", "Gardez les aiguillages en voie ordinaire ; libérez le corridor compact"));
      // A tile that already carries double track is kept; meeting it at a right
      // angle turns a corner or crosses, instead of rejecting the whole drag.
      if (axisAt(city, index)) continue;
      tiles.push(index); cost += city.rail[index] ? 25 : 50;
    }
    return { tool, tiles, footprint, cost, valid: tiles.length > 0, doubleAxis: axis, reason: tiles.length ? undefined : translate("reason.nothing") };
  }
  function apply(city, plan) {
    if (plan.tool !== "doubleRail") return null;
    city.doubleTracks ??= new Uint8Array(city.count);
    for (const index of plan.tiles) {
      city.rail[index] = 1; city.doubleTracks[index] = plan.doubleAxis;
      if (city.railKinds) city.railKinds[index] = 0;
      if (city.overlay[index] === 1) city.overlay[index] = 0;
    }
    city.money -= plan.cost; city.roadsDirty = true; city.gridDirty = true;
    return { ok: true, cost: plan.cost };
  }
  const axisMask = axis => axis === 1 ? 10 : 5;
  const armBit = (dx, dy) => dx > 0 ? 2 : dx < 0 ? 8 : dy > 0 ? 4 : 1;

  // Connected arms of a compact tile: the two along its alignment, plus a
  // perpendicular arm only where another double track turns in. Parallel tracks
  // running alongside a corridor keep their own lane and stay straight, and
  // single-track branches stay on ordinary Railway.
  function arms(city, x, y) {
    const axis = axisAt(city, city.idx(x, y));
    if (!axis) return 0;
    const dx = +(axis === 1), dy = +(axis === 2);
    let result = 0;
    for (const sign of [-1, 1]) {
      const nx = x + dx * sign, ny = y + dy * sign;
      if (city.hasRail(nx, ny) && (window.__railTransit?.canStep(city, x, y, nx, ny) ?? true)) result |= armBit(dx * sign, dy * sign);
    }
    for (const [sx, sy] of axis === 1 ? [[0, -1], [0, 1]] : [[-1, 0], [1, 0]]) {
      const neighborAxis = city.inBounds(x + sx, y + sy) ? axisAt(city, city.idx(x + sx, y + sy)) : 0;
      if (neighborAxis && neighborAxis !== axis && (window.__railTransit?.canStep(city, x, y, x + sx, y + sy) ?? true)) result |= armBit(sx, sy);
    }
    return result;
  }
  // A corner tile joins two perpendicular double tracks; it draws and drives as
  // a shared turnout so both lanes can leave onto the turning track.
  const turning = (city, x, y) => (arms(city, x, y) & ~axisMask(axisAt(city, city.idx(x, y)))) !== 0;

  function compact(city, x, y) {
    if (!city.inBounds(x, y)) return null;
    const index = city.idx(x, y), axis = axisAt(city, index);
    if (!axis || turning(city, x, y)) return null;
    const dx = +(axis === 1), dy = +(axis === 2);
    const edge = sign => {
      const nx = x + dx * sign, ny = y + dy * sign;
      if (!city.hasRail(nx, ny)) return 0.23;
      return axisAt(city, city.idx(nx, ny)) === axis && !turning(city, nx, ny) ? 0.23 : 0;
    };
    return { axis: axis === 1 ? "x" : "y", start: edge(-1), center: 0.23, end: edge(1) };
  }
  function lane(city, index, dx, dy) {
    if (!compact(city, index % city.size, Math.floor(index / city.size))) return null;
    const axis = axisAt(city, index);
    if (!axis) return null;
    return axis === 1 ? dx >= 0 ? 1 : 0 : dy >= 0 ? 0 : 1;
  }
  function compactSprite(ctx, axis, start, end, project) {
    for (const side of [-1, 1]) sprite(ctx, axis, start * side, 0.23 * side, end * side, project, true);
  }
  function query(query, city) {
    if (!axisAt(city, city.idx(query.tile.x, query.tile.y))) return;
    query.title = copy("Double-track railway", "Double voie ferrée");
    query.lines.push(copy("Two tracks in one tile · right-hand running", "Deux voies dans une case · circulation à droite"));
  }

  // Adjacent parallel tracks stay straight instead of becoming a ladder of junctions.
  function layout(city, x, y) {
    const type = window.__railTransit?.kind(city, city.idx(x, y)) ?? 0;
    const rail = (a, b) => city.inBounds(a, b) && city.rail[city.idx(a, b)] && !axisAt(city, city.idx(a, b)) && (window.__railTransit?.kind(city, city.idx(a, b)) ?? 0) === type && city.terrain[city.idx(a, b)] === 0;
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

  function mask(city, x, y) {
    if (!city.inBounds(x, y)) return null;
    if (axisAt(city, city.idx(x, y))) return arms(city, x, y);
    return layout(city, x, y)?.mask ?? null;
  }

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

  function position(city, point, direction = null) {
    const x = Math.floor(point.x), y = Math.floor(point.y);
    if (!city.inBounds(x, y)) return point;
    const single = compact(city, x, y);
    if (single) {
      const side = lane(city, city.idx(x, y), direction?.x ?? point.dx ?? 1, direction?.y ?? point.dy ?? 0) ? 1 : -1;
      const amount = shift(single, single.axis === "x" ? point.x - x : point.y - y) * side;
      return { ...point, x: point.x + (single.axis === "y" ? amount : 0), y: point.y + (single.axis === "x" ? amount : 0) };
    }
    const path = profile(city, x, y);
    if (!path) return point;
    const amount = shift(path, path.axis === "x" ? point.x - x : point.y - y);
    return { ...point, x: point.x + (path.axis === "y" ? amount : 0), y: point.y + (path.axis === "x" ? amount : 0) };
  }

  function sprite(ctx, axis, start, center, end, project, narrow = false) {
    const path = { start, center, end };
    const point = (along, across) => axis === "x"
      ? project(along, 0.5 + shift(path, along) + across)
      : project(0.5 + shift(path, along) + across, along);
    const stroke = (points, color, width) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke();
    };
    for (let along = 0.05; along < 1; along += 0.09) stroke([point(along, narrow ? -0.13 : -0.16), point(along, narrow ? 0.13 : 0.16)], "#6b5537", 1.5);
    for (const across of narrow ? [-0.06, 0.06] : [-0.07, 0.07]) stroke([0, 0.25, 0.5, 0.75, 1].map(along => point(along, across)), "#3a3a3a", 1.2);
  }

  function median(city, x, y) {
    const single = compact(city, x, y);
    if (single && single.start === single.center && single.end === single.center) {
      const index = city.idx(x, y);
      if (!city.fire[index] && !city.flood[index] && city.overlay[index] <= 1) return { ...single, owner: index, other: index, side: 1, singleTile: true };
    }
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
    const dx = strip.singleTile && strip.axis === "y" ? 0.5 : 0, dy = strip.singleTile && strip.axis === "x" ? 0.5 : 0;
    renderer.ctx.drawImage(image, Math.round(x - 32 * scale + (dx - dy) * 32 * scale), Math.round(y - 112 * scale + (dx + dy) * 16 * scale));
  }

  function canStep(city, x, y, nx, ny) {
    if (window.__railTransit && !window.__railTransit.canStep(city, x, y, nx, ny)) return false;
    const direction = nx > x ? 2 : nx < x ? 8 : ny > y ? 4 : 1;
    const reverse = direction === 1 ? 4 : direction === 4 ? 1 : direction === 2 ? 8 : 2;
    const from = mask(city, x, y), to = mask(city, nx, ny);
    return (from === null || (from & direction) !== 0) && (to === null || (to & reverse) !== 0);
  }

  window.__doubleRail = { install, toolbar, preview, apply, axisAt, compact, compactSprite, lane, query, mask, canStep, layout, profile, position, sprite, median, drawMedian };
})();
