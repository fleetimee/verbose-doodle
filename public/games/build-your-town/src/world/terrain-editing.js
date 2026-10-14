(() => {
  const tools = {
    beach: { source: 0, target: 0, cost: 15, name: ["Plage", "Beach"], desc: ["Peignez du sable sur un terrain libre et plat directement au bord de l'eau.", "Paint sand on clear, flat land directly beside water."] },
    landfill: { source: 1, target: 0, cost: 50, name: ["Remblayer", "Landfill"], desc: ["Transformez l'eau libre en terrain constructible au niveau de la mer. Glissez pour sélectionner une zone.", "Turn empty water into buildable land at sea level. Drag to select an area."] },
    digwater: { source: 0, target: 1, cost: 30, name: ["Creuser un bassin", "Dig water"], desc: ["Transformez un terrain libre en eau. Le terrain est automatiquement abaissé au niveau de la mer. Glissez pour sélectionner une zone.", "Turn empty land into water. Raised ground is automatically lowered to sea level. Drag to select an area."] },
  };
  function install(messages, City) {
    for (const [tool, definition] of Object.entries(tools)) {
      messages[`tool.${tool}`] = definition.name;
      messages[`tool.${tool}.desc`] = definition.desc;
    }
    messages["terrain.beachShore"] = ["Les plages doivent être directement au bord de l'eau.", "Beach tiles must be directly beside water."];
    messages["terrain.beachFlat"] = ["Choisissez un terrain plat pour la plage.", "Choose flat land for the beach."];
    messages["query.beach"] = ["Plage", "Beach"];
    const serialize = City.prototype.toJSON;
    City.prototype.toJSON = function () {
      const data = serialize.call(this);
      data.beaches = this.beaches ? Array.from(this.beaches.keys()).filter(index => this.beaches[index]) : [];
      return data;
    };
    const deserialize = City.fromJSON;
    City.fromJSON = function (data) {
      const city = deserialize.call(this, data);
      city.beaches = new Uint8Array(city.count);
      for (const index of Array.isArray(data.beaches) ? data.beaches : []) {
        if (Number.isInteger(index) && index >= 0 && index < city.count && city.terrain[index] === 0) city.beaches[index] = 1;
      }
      return city;
    };
    messages["terrain.empty"] = ["Démolissez d'abord les bâtiments, routes, arbres et réseaux dans la zone.", "Bulldoze buildings, roads, trees and utilities in the area first."];
    messages["terrain.level"] = ["Abaissez et aplanissez d'abord le terrain au niveau de la mer (altitude 0).", "Lower and level the land to sea level (altitude 0) first."];
    messages["terrain.unchanged"] = ["Aucune case à convertir dans cette zone.", "No tiles to convert in this area."];
  }
  function preview(city, tool, start, end, translate, levelTerrain) {
    const definition = tools[tool];
    if (!definition) return null;
    const tiles = [];
    let reason;
    let needsExcavation = false;
    for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
      for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
        if (!city.inBounds(x, y)) continue;
        const index = city.idx(x, y);
        if (city.terrain[index] !== definition.source || tool === "beach" && city.beaches?.[index]) continue;
        tiles.push(index);
        if (city.overlay[index] !== 0 || city.wire[index] || city.rail[index] || city.fire[index] || city.flood[index]) reason = translate("terrain.empty");
        else if (tool === "beach") {
          const shoreline = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) =>
            city.inBounds(x + dx, y + dy) && city.terrain[city.idx(x + dx, y + dy)] === 1);
          if (!shoreline) reason ??= translate("terrain.beachShore");
          else if (!city.isFlat(x, y)) reason ??= translate("terrain.beachFlat");
        } else if (city.base(x, y) !== 0 || !city.isFlat(x, y)) {
          if (tool === "digwater") needsExcavation = true;
          else reason ??= translate("terrain.level");
        }
      }
    }
    if (!tiles.length) reason = translate("terrain.unchanged");
    let excavation;
    if (!reason && needsExcavation) {
      const xs = tiles.map(index => index % city.size), ys = tiles.map(index => Math.floor(index / city.size));
      const left = Math.min(...xs), top = Math.min(...ys), right = Math.max(...xs), bottom = Math.max(...ys);
      const working = Object.create(city);
      working.elev = city.elev.slice();
      const changes = new Map(), affected = new Set();
      let unitCost = 0;
      for (let pass = 0; pass < 32; pass++) {
        let leveled = true;
        for (let y = top; y <= bottom + 1; y++) for (let x = left; x <= right + 1; x++) {
          if (working.elev[y * (city.size + 1) + x] !== 0) leveled = false;
        }
        if (leveled) break;
        const step = levelTerrain(working, left, top, right, bottom, 0);
        if (!step.valid) { reason = step.reason; break; }
        unitCost = step.cost / step.changes.size;
        for (const [index, height] of step.changes) {
          working.elev[index] = height;
          changes.set(index, height);
        }
        for (const index of step.tiles) affected.add(index);
      }
      for (let y = top; y <= bottom + 1; y++) for (let x = left; x <= right + 1; x++) {
        if (working.elev[y * (city.size + 1) + x] !== 0) reason ??= translate("terrain.level");
      }
      for (const [index, height] of changes) if (height === city.elev[index]) changes.delete(index);
      excavation = { changes, tiles: [...affected], cost: changes.size * unitCost, valid: !reason };
    }
    return { tool, tiles, cost: tiles.length * definition.cost + (excavation?.cost ?? 0),
      valid: !reason, reason, terrainChange: definition.target, excavation };
  }
  function apply(city, plan, applyTerrain) {
    const definition = tools[plan.tool];
    if (!definition || plan.terrainChange !== definition.target) return null;
    if (plan.tool === "beach") {
      city.beaches ??= new Uint8Array(city.count);
      for (const index of plan.tiles) city.beaches[index] = 1;
      city.money -= plan.cost;
      return { ok: true, cost: plan.cost };
    }
    if (plan.excavation) applyTerrain(city, plan.excavation);
    for (const index of plan.tiles) {
      city.terrain[index] = definition.target;
      if (city.beaches) city.beaches[index] = 0;
      city.landValue[index] = definition.target === 0 ? 60 : 0;
      city.pollution[index] = 0;
      city.crime[index] = 0;
    }
    city.money -= plan.cost;
    city.gridDirty = true;
    city.roadsDirty = true;
    return { ok: true, cost: plan.cost };
  }
  function toolbar(groups, translate, picture) {
    const terrain = groups.find(group => group.items?.some(item => item.tool === "level"));
    if (!terrain) return groups;
    for (const [tool, definition] of Object.entries(tools)) {
      terrain.items.push({ tool, name: translate(`tool.${tool}`), meta: translate("perTile", { n: definition.cost }),
        desc: translate(`tool.${tool}.desc`), icon: picture(tool === "beach" ? ["beach:0000:1"] : tool === "landfill" ? ["water:0:1:0:0", "icon:bulldozer"] : ["water:0:1:0:0"]) });
    }
    return groups;
  }
  function paintBeach(ctx, project, polygon, variant) {
    polygon(ctx, [project(0, 0), project(1, 0), project(1, 1), project(0, 1)], variant & 1 ? "#dcc68f" : "#e3cf9d");
    for (let index = 0; index < 7; index++) {
      const u = ((index * 37 + variant * 13) % 83 + 8) / 100;
      const v = ((index * 23 + variant * 19) % 83 + 8) / 100;
      const [x, y] = project(u, v);
      ctx.fillStyle = index % 2 ? "#c5ac74" : "#efe0b9";
      ctx.fillRect(x, y, 1.5, 0.8);
    }
  }
  window.__terrainEditing = { install, preview, apply, toolbar, paintBeach };
})();
