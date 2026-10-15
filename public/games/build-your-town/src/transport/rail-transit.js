(() => {
  const definitions = {
    highspeedRail: { kind: 1, cost: 80, name: ["High-speed rail", "Voie à grande vitesse"] },
    elevatedLrt: { kind: 2, cost: 120, name: ["Elevated LRT", "Métro léger surélevé"] },
  };
  const directions = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
  const copy = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const kind = (city, index) => city.rail[index] ? city.railKinds?.[index] ?? 0 : 0;
  const initialize = city => city.railKinds ??= new Uint8Array(city.count);

  const stationKind = type => ({ station: 0, highspeedstation: 1, lrtstation: 2 })[type];
  const isStation = type => stationKind(type) !== undefined;
  function board(city, stationIndex, railIndex) {
    const station = city.structAt(stationIndex);
    if (!station || stationKind(station.type) !== kind(city, railIndex)) return false;
    if (stationKind(station.type) === 0) return true;
    const entry = city.idx(station.x, station.y);
    return !!city.powered[entry] && city.roadDist[entry] !== 255;
  }

  function install(City, messages, buildings) {
    buildings.highspeedstation = { ...buildings.station, cost: 5000, upkeep: 40, consumes: 4, requiresRoad: true };
    buildings.lrtstation = { ...buildings.station, cost: 2500, upkeep: 24, consumes: 2, requiresRoad: true };
    messages["struct.highspeedstation"] = ["Gare à grande vitesse", "High-speed station"];
    messages["struct.lrtstation"] = ["Station de métro léger surélevée", "Elevated LRT station"];
    messages["struct.highspeedstation.desc"] = ["À côté d’une voie à grande vitesse et d’une route. Électricité requise pour les trains.", "Place beside high-speed rail and a road. Power is required for trains to run."];
    messages["struct.lrtstation.desc"] = ["Quais surélevés au niveau du viaduc, avec escaliers vers la rue. À côté du métro léger et d’une route ; électricité requise.", "Elevated platforms at viaduct height, with stairs to the street. Place beside LRT track and a road; power required."];
    for (const [tool, def] of Object.entries(definitions)) messages[`tool.${tool}`] = [def.name[1], def.name[0]];
    messages["query.highspeedRail"] = ["Voie à grande vitesse · réseau voyageurs distinct", "Shinkansen track · separate passenger network"];
    messages["query.elevatedLrt"] = ["Viaduc de métro léger · au-dessus de la circulation", "LRT viaduct · above road traffic"];
    const save = City.prototype.toJSON;
    City.prototype.toJSON = function () {
      const data = save.call(this);
      data.railKinds = [];
      for (let index = 0; index < this.count; index++) if (kind(this, index)) data.railKinds.push([index, kind(this, index)]);
      return data;
    };
    const load = City.fromJSON;
    City.fromJSON = function (data) {
      const city = load.call(this, data), kinds = initialize(city);
      if (Array.isArray(data.railKinds)) for (const entry of data.railKinds.slice(0, city.count)) {
        if (!Array.isArray(entry)) continue;
        const [index, type] = entry;
        if (Number.isInteger(index) && index >= 0 && index < city.count && city.rail[index] && (type === 1 || type === 2)) kinds[index] = type;
      }
      return city;
    };
  }

  function toolbar(groups, items, trackIcon) {
    const transport = groups.find(group => group.items?.some(item => item.tool === "rail"));
    const index = transport.items.findIndex(item => item.tool === "doubleRail");
    transport.items.splice(index + 1, 0, ...Object.entries(definitions).map(([tool, def]) => ({
      tool, name: copy(...def.name), meta: copy(`$${def.cost} / tile · flat land`, `${def.cost} $ / case · terrain plat`),
      desc: def.kind === 1
        ? copy("Dedicated ground-level track for Shinkansen-style trains. Add a powered, road-connected High-speed station beside the line. Separate from ordinary rail.", "Voie au sol réservée aux trains à grande vitesse. Ajoutez une gare à grande vitesse alimentée et reliée à la route. Réseau distinct du rail ordinaire.")
        : copy("Raised urban viaduct for light rail; crosses roads and highways above traffic. Add a powered, road-connected Elevated LRT station beside the line.", "Viaduc urbain pour métro léger, au-dessus des routes et autoroutes. Ajoutez une station surélevée alimentée et reliée à la route."),
      icon: trackIcon(["grass:0000:0", `${def.kind === 1 ? "hsrail" : "lrtrail"}:10:0000`]),
    })));
    transport.items.push(...items(["highspeedstation", "lrtstation"]));
    return groups;
  }

  function preview(city, tool, start, end, line, translate) {
    const def = definitions[tool];
    if (!def) return null;
    const path = line(start, end), footprint = path.filter(p => city.inBounds(p.x, p.y)).map(p => city.idx(p.x, p.y));
    const fail = reason => ({ tool, tiles: [], footprint, cost: 0, valid: false, reason });
    if (footprint.length !== path.length) return fail(copy("Keep the entire route inside the map", "Gardez tout le tracé sur la carte"));
    const height = city.base(start.x, start.y), tiles = [];
    for (const point of path) {
      const index = city.idx(point.x, point.y), overlay = city.overlay[index];
      if (city.terrain[index] !== 0 || !city.isFlat(point.x, point.y) || city.base(point.x, point.y) !== height) return fail(copy("Requires flat land at one elevation", "Nécessite un terrain plat de même altitude"));
      if (city.fire[index] || city.flood[index] || city.wire[index] ||
          !([0, 1].includes(overlay) || def.kind === 2 && [2, 7].includes(overlay))) return fail(translate("reason.occupied"));
      if (city.rail[index]) {
        if (kind(city, index) !== def.kind) return fail(copy("Different rail systems need separate tiles", "Les réseaux ferroviaires nécessitent des cases distinctes"));
      } else tiles.push(index);
      for (const [dx, dy] of directions) if (city.inBounds(point.x + dx, point.y + dy)) {
        const neighbor = city.idx(point.x + dx, point.y + dy);
        if (city.rail[neighbor] && kind(city, neighbor) === def.kind && city.base(point.x + dx, point.y + dy) !== height) return fail(copy("Connect tracks at the same elevation", "Reliez les voies à la même altitude"));
      }
    }
    return { tool, tiles, footprint, cost: tiles.length * def.cost, valid: tiles.length > 0, reason: tiles.length ? undefined : translate("reason.nothing") };
  }

  function apply(city, plan) {
    const def = definitions[plan.tool];
    if (!def) return null;
    const kinds = initialize(city);
    for (const index of plan.tiles) {
      city.rail[index] = 1; kinds[index] = def.kind;
      if (city.overlay[index] === 1) city.overlay[index] = 0;
    }
    city.money -= plan.cost; city.roadsDirty = true; city.gridDirty = true;
    return { ok: true, cost: plan.cost };
  }

  function canStep(city, x, y, nx, ny) {
    return city.inBounds(x, y) && city.inBounds(nx, ny) && kind(city, city.idx(x, y)) === kind(city, city.idx(nx, ny));
  }
  function mask(city, x, y) {
    return directions.reduce((result, [dx, dy, bit]) => result | (city.hasRail(x + dx, y + dy) && canStep(city, x, y, x + dx, y + dy) ? bit : 0), 0);
  }

  function setupWalkers(renderer, city, previous) {
    const stations = [...city.structs.values()].filter(s => isStation(s.type) && city.powered[city.idx(s.x, s.y)] && city.roadDist[city.idx(s.x, s.y)] !== 255);
    const seen = new Set(); let count = 0;
    for (let index = 0; index < city.count && count < 4; index++) {
      const type = kind(city, index);
      if (!type || seen.has(index)) continue;
      const component = [index]; seen.add(index);
      for (let head = 0; head < component.length; head++) {
        const tile = component[head], x = tile % city.size, y = Math.floor(tile / city.size);
        for (const [dx, dy] of directions) {
          if (!city.inBounds(x + dx, y + dy)) continue;
          const next = city.idx(x + dx, y + dy);
          if (!seen.has(next) && city.rail[next] && kind(city, next) === type && (window.__doubleRail?.canStep(city, x, y, x + dx, y + dy) ?? true)) { seen.add(next); component.push(next); }
        }
      }
      if (component.length < 12 || !stations.some(station => stationKind(station.type) === type && component.some(tile => {
        const x = tile % city.size, y = Math.floor(tile / city.size);
        return x >= station.x - 1 && x <= station.x + 2 && y >= station.y - 1 && y <= station.y + 2;
      }))) continue;
      const retained = previous.find(walker => walker.kind === "train" && walker.transitType === type && component.includes(city.idx(walker.x, walker.y)));
      if (retained) { renderer.walkers.push(retained); count++; continue; }
      for (const tile of component) {
        const x = tile % city.size, y = Math.floor(tile / city.size);
        const walker = { kind: "train", transitType: type, fleetVariant: type === 1 ? 3 : 4, speed: type === 1 ? 2.6 : 1.8,
          x, y, px: x, py: y, t: 0, seed: tile, hist: [{ x: x + 0.5, y: y + 0.5 }] };
        if (renderer.pickNext(city, walker, true)) { renderer.walkers.push(walker); count++; break; }
      }
    }
  }

  function sprite(ctx, type, railMask, project, polygon, Scene) {
    const elevated = type === 2, top = elevated ? 24 : 0;
    const scene = new Scene(ctx, 0);
    if (elevated) {
      for (const [x, y] of [[0.13, 0.13], [0.87, 0.87]]) scene.box(x - 0.045, y - 0.045, x + 0.045, y + 0.045, 21, "#7f8e98", "#b5c2c9");
      scene.box(0.12, 0.12, 0.88, 0.88, 3, "#7f8e98", "#b8c7ce", { z0: 21 });
      if (railMask & 1) scene.box(0.26, 0, 0.74, 0.5, 3, "#7f8e98", "#b8c7ce", { z0: 21 });
      if (railMask & 2) scene.box(0.5, 0.26, 1, 0.74, 3, "#7f8e98", "#b8c7ce", { z0: 21 });
      if (railMask & 4) scene.box(0.26, 0.5, 0.74, 1, 3, "#7f8e98", "#b8c7ce", { z0: 21 });
      if (railMask & 8) scene.box(0, 0.26, 0.5, 0.74, 3, "#7f8e98", "#b8c7ce", { z0: 21 });
    }
    const band = (x1, y1, x2, y2) => polygon(ctx, [project(x1, y1, top), project(x2, y1, top), project(x2, y2, top), project(x1, y2, top)], elevated ? "#bdcbd1" : "#c6c9c4");
    scene.render();
    band(0.26, 0.26, 0.74, 0.74);
    if (railMask & 1) band(0.26, 0, 0.74, 0.5);
    if (railMask & 2) band(0.5, 0.26, 1, 0.74);
    if (railMask & 4) band(0.26, 0.5, 0.74, 1);
    if (railMask & 8) band(0, 0.26, 0.5, 0.74);
    if (!railMask) band(0, 0.26, 1, 0.74);
  }

  function stationModel(type, scene, project, polygon) {
    if (type !== "highspeedstation" && type !== "lrtstation") return false;
    const elevated = type === "lrtstation", base = elevated ? 24 : 2;
    if (elevated) {
      for (const x of [0.2, 1.8]) for (const y of [0.25, 1.7]) scene.box(x - 0.075, y - 0.075, x + 0.075, y + 0.075, 21, "#7d8e99", "#a8bdc5");
      scene.box(0.08, 0.08, 1.92, 1.92, 3, "#8298a5", "#c8d8dc", { z0: 21 });
      for (let step = 0; step < 8; step++) scene.box(0.9 + step * 0.12, 1.45, 1.02 + step * 0.12, 1.85, (step + 1) * 3, "#7e8d96", "#c6d2d5");
      scene.box(0.15, 1.3, 0.55, 1.8, 23, "#596e7c", "#93b6c3");
    } else scene.box(0.08, 0.08, 1.92, 1.92, 2, "#9aa8af", "#d2dadd");
    scene.custom(base + 0.1, ctx => polygon(ctx, [project(0.1, 0.12, base + 0.2), project(1.9, 0.12, base + 0.2), project(1.9, 0.18, base + 0.2), project(0.1, 0.18, base + 0.2)], "#edca5c"));
    const accent = elevated ? "#2caaa5" : "#3476c5";
    for (const x of [0.28, 1, 1.72]) scene.box(x - 0.035, 0.68, x + 0.035, 0.75, 10, "#607a87", "#8ba6b1", { z0: base });
    scene.box(0.1, 0.2, 1.9, 1.1, 1.4, "#6f8795", elevated ? "#d7eceb" : "#d8e7f5", { z0: base + 10 });
    scene.box(0.1, 0.2, 1.9, 0.25, 1, accent, accent, { z0: base + 10 });
    scene.box(0.2, 0.95, 0.65, 1.25, 2, accent, "#b5ced0", { z0: base });
    scene.custom(base + 8, ctx => polygon(ctx, [project(0.95, 0.72, base + 5), project(1.5, 0.72, base + 5), project(1.5, 0.72, base + 7.5), project(0.95, 0.72, base + 7.5)], accent));
    return true;
  }

  function query(query, city) {
    const index = city.idx(query.tile.x, query.tile.y), type = kind(city, index);
    if (!type) return;
    query.title = type === 1 ? copy("High-speed rail", "Voie à grande vitesse") : copy("Elevated LRT", "Métro léger surélevé");
    query.lines.push(type === 1 ? copy("Shinkansen track · separate passenger network", "Voie à grande vitesse · réseau voyageurs distinct") : copy("LRT viaduct · above road traffic", "Viaduc de métro léger · au-dessus de la circulation"));
  }

  window.__railTransit = { definitions, kind, isStation, stationKind, board, install, toolbar, preview, apply, canStep, mask, setupWalkers, sprite, stationModel, query };
})();
