(() => {
  const tools = {
    landfill: { source: 1, target: 0, cost: 50, name: ["Remblayer", "Landfill"], desc: ["Transformez l'eau libre en terrain constructible au niveau de la mer. Glissez pour sélectionner une zone.", "Turn empty water into buildable land at sea level. Drag to select an area."] },
    digwater: { source: 0, target: 1, cost: 30, name: ["Creuser un bassin", "Dig water"], desc: ["Transformez un terrain libre et plat au niveau de la mer en eau. Abaissez d'abord les terrains élevés. Glissez pour sélectionner une zone.", "Turn empty, flat land at sea level into water. Lower raised land first. Drag to select an area."] },
  };
  function install(messages) {
    for (const [tool, definition] of Object.entries(tools)) {
      messages[`tool.${tool}`] = definition.name;
      messages[`tool.${tool}.desc`] = definition.desc;
    }
    messages["terrain.empty"] = ["Démolissez d'abord les bâtiments, routes, arbres et réseaux dans la zone.", "Bulldoze buildings, roads, trees and utilities in the area first."];
    messages["terrain.level"] = ["Abaissez et aplanissez d'abord le terrain au niveau de la mer (altitude 0).", "Lower and level the land to sea level (altitude 0) first."];
    messages["terrain.unchanged"] = ["Aucune case à convertir dans cette zone.", "No tiles to convert in this area."];
  }
  function preview(city, tool, start, end, translate) {
    const definition = tools[tool];
    if (!definition) return null;
    const tiles = [];
    let reason;
    for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
      for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
        if (!city.inBounds(x, y)) continue;
        const index = city.idx(x, y);
        if (city.terrain[index] !== definition.source) continue;
        tiles.push(index);
        if (city.overlay[index] !== 0 || city.wire[index] || city.rail[index] || city.fire[index] || city.flood[index]) reason = translate("terrain.empty");
        else if (city.base(x, y) !== 0 || !city.isFlat(x, y)) reason ??= translate("terrain.level");
      }
    }
    if (!tiles.length) reason = translate("terrain.unchanged");
    return { tool, tiles, cost: tiles.length * definition.cost, valid: !reason, reason, terrainChange: definition.target };
  }
  function apply(city, plan) {
    const definition = tools[plan.tool];
    if (!definition || plan.terrainChange !== definition.target) return null;
    for (const index of plan.tiles) {
      city.terrain[index] = definition.target;
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
        desc: translate(`tool.${tool}.desc`), icon: picture(tool === "landfill" ? ["water:0:1:0:0", "icon:bulldozer"] : ["water:0:1:0:0"]) });
    }
    return groups;
  }
  window.__terrainEditing = { install, preview, apply, toolbar };
})();
