(() => {
  let definitions;
  const install = (buildings, messages) => {
    definitions = buildings;
    for (const [type, fun] of Object.entries({ park: 20, bigpark: 40, botanicalgarden: 60, grandmuseum: 60 })) {
      definitions[type].fun = fun;
      const radius = definitions[type].radius;
      messages[`struct.${type}.desc`][0] += ` Jusqu'à ${fun} points de loisirs à ${radius} cases.`;
      messages[`struct.${type}.desc`][1] += ` Up to ${fun} Fun within ${radius} tiles.`;
    }
    messages["query.shuttleConnected"] = ["Navette : trajet ouvert vers un embarcadère", "Shuttle: connected to a visitor dock"];
    messages["query.shuttleMissing"] = ["Navette indisponible : vérifiez le trajet, la route et les dégâts de l’embarcadère.", "No shuttle: check the water route, dock road access and damage."];
    messages["reason.waterRecreation"] = ["Choisissez de l'eau libre directement au bord de la terre.", "Choose clear water directly beside land."];
    messages["top.fun"] = ["Loisirs", "Fun"];
    messages["top.fun.title"] = ["Loisirs moyens des habitants. Les parcs et attractions stimulent légèrement la demande.", "Residents' average Fun. Parks and attractions give demand a small boost."];
    messages["query.fun"] = ["Loisirs ici : {n} / 100", "Fun here: {n} / 100"];
    messages["query.attractionOpen"] = ["Attraction ouverte", "Attraction operating"];
    messages["query.attractionClosed"] = ["Attraction fermée : vérifiez l'électricité, la route, le littoral et les dégâts.", "Attraction closed: check power, road access, shoreline and damage."];
  };

  const structRoadDist = (city, building, size = 1) => {
    let min = 255;
    for (let y = building.y; y < building.y + size; y++) {
      for (let x = building.x; x < building.x + size; x++) {
        if (city.inBounds(x, y)) {
          const dist = city.roadDist[city.idx(x, y)];
          if (dist < min) min = dist;
        }
      }
    }
    return min;
  };

  const operating = (city, building, definition) => {
    const index = city.idx(building.x, building.y);
    if (definition.consumes && !city.powered[index]) return false;
    const roadDist = structRoadDist(city, building, definition.size);
    if (definition.requiresRoad && !definition.waterOnly && roadDist === 255) return false;
    if (city.roadDist[index] > roadDist) city.roadDist[index] = roadDist;
    if (definition.needsShuttle) return !!window.__waterRecreation?.connected(city, building);
    if (definition.waterOnly) {
      let access = false;
      for (let y = building.y - 1; y <= building.y + definition.size; y++) {
        for (let x = building.x - 1; x <= building.x + definition.size; x++) {
          if (!city.inBounds(x, y)) continue;
          const inside = x >= building.x && x < building.x + definition.size && y >= building.y && y < building.y + definition.size;
          const tile = city.idx(x, y);
          if (inside && city.terrain[tile] !== 1) return false;
          const edge = (x >= building.x && x < building.x + definition.size) || (y >= building.y && y < building.y + definition.size);
          if (!inside && edge && city.terrain[tile] === 0 && city.roadDist[tile] < 255) access = true;
        }
      }
      if (!access) return false;
    }
    let shore = !definition.needsShore;
    for (let y = building.y; y < building.y + definition.size; y++) {
      for (let x = building.x; x < building.x + definition.size; x++) {
        const tile = city.idx(x, y);
        if (city.fire[tile] || city.flood[tile]) return false;
      }
    }
    if (!shore) {
      const water = (x, y) => city.inBounds(x, y) && city.terrain[city.idx(x, y)] === 1;
      for (let offset = 0; offset < definition.size; offset++) {
        if (water(building.x + offset, building.y - 1) || water(building.x + offset, building.y + definition.size)
          || water(building.x - 1, building.y + offset) || water(building.x + definition.size, building.y + offset)) shore = true;
      }
    }
    return shore;
  };

  const coverage = (city, definitions) => {
    city.fun ??= new Uint8Array(city.count);
    city.fun.fill(0);
    window.__waterRecreation?.refresh(city, definitions);
    for (const building of city.structs.values()) {
      const definition = definitions[building.type];
      if (!definition.fun || !operating(city, building, definition)) continue;
      const radius = definition.radius;
      const cx = building.x + (definition.size - 1) / 2;
      const cy = building.y + (definition.size - 1) / 2;
      for (let y = Math.max(0, Math.floor(cy - radius)); y <= Math.min(city.size - 1, Math.ceil(cy + radius)); y++) {
        for (let x = Math.max(0, Math.floor(cx - radius)); x <= Math.min(city.size - 1, Math.ceil(cx + radius)); x++) {
          const distance = Math.hypot(x - cx, y - cy);
          if (distance > radius) continue;
          const index = city.idx(x, y);
          if (city.terrain[index] !== 0) continue;
          const score = Math.round(definition.fun * (1 - distance / (radius + 1)));
          city.fun[index] = Math.max(city.fun[index], score);
        }
      }
    }
  };

  const stats = (city, residentsByLevel) => {
    let residents = 0;
    let total = 0;
    for (let index = 0; index < city.count; index++) {
      if (city.overlay[index] !== 3) continue;
      const count = residentsByLevel[city.level[index]];
      residents += count;
      total += count * (city.fun?.[index] ?? 0);
    }
    for (const building of city.structs.values()) {
      const definition = definitions[building.type];
      const index = city.idx(building.x, building.y);
      const roadDist = structRoadDist(city, building, definition.size);
      if (city.roadDist[index] > roadDist) city.roadDist[index] = roadDist;
      if (!definition.pop || !city.powered[index] || (definition.requiresRoad && roadDist === 255)) continue;
      let score = 0;
      for (let y = building.y; y < building.y + definition.size; y++) {
        for (let x = building.x; x < building.x + definition.size; x++) score += city.fun?.[city.idx(x, y)] ?? 0;
      }
      residents += definition.pop;
      total += definition.pop * score / (definition.size * definition.size);
    }
    city.stats.fun = residents ? total / residents : 0;
  };

  window.__recreation = { install, operating, coverage, stats };
})();
