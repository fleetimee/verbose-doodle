(() => {
  function operating(city, building, definition) {
    for (let y = building.y; y < building.y + definition.size; y++) {
      for (let x = building.x; x < building.x + definition.size; x++) {
        const tile = city.idx(x, y);
        if (city.fire[tile] || city.flood[tile]) return false;
      }
    }
    return true;
  }

  function links(city, definitions) {
    const graph = new Map();
    const add = (from, to) => {
      const neighbors = graph.get(from) ?? [];
      neighbors.push(to);
      graph.set(from, neighbors);
    };
    for (const building of city.structs.values()) {
      const definition = definitions[building.type];
      const radius = definition.powerRange;
      if (!radius || !operating(city, building, definition)) continue;
      const origin = city.idx(building.x, building.y);
      const cx = building.x + (definition.size - 1) / 2;
      const cy = building.y + (definition.size - 1) / 2;
      for (let y = Math.max(0, Math.ceil(cy - radius)); y <= Math.min(city.size - 1, Math.floor(cy + radius)); y++) {
        for (let x = Math.max(0, Math.ceil(cx - radius)); x <= Math.min(city.size - 1, Math.floor(cx + radius)); x++) {
          const tile = city.idx(x, y);
          if (tile === origin || Math.hypot(x - cx, y - cy) > radius || !city.conducts(tile)) continue;
          add(origin, tile);
          add(tile, origin);
        }
      }
    }
    return graph;
  }
  window.__powerGrid = { links, operating };
})();
