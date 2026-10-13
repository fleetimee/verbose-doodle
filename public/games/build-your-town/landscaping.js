(() => {
  const plants = {
    landscape_tree: { cost: 10, variant: 2, name: ["Arbre", "Tree"] },
    landscape_smalltree: { cost: 6, variant: 0, name: ["Petit arbre", "Small tree"] },
    landscape_bushes: { cost: 4, variant: 1, name: ["Buissons", "Bushes"] },
  };
  const sanitize = (city, values) => {
    const result = {};
    if (!values || typeof values !== "object" || Array.isArray(values)) return result;
    for (const [key, value] of Object.entries(values)) {
      const index = Number(key);
      if (Number.isInteger(index) && index >= 0 && index < city.count && [0, 1, 2].includes(value)) result[index] = value;
    }
    return result;
  };

  function install(City, definitions, messages) {
    for (const [type, plant] of Object.entries(plants)) {
      definitions[type] = { size: 1, cost: plant.cost, upkeep: 0, category: "park" };
      messages[`struct.${type}`] = plant.name;
      messages[`struct.${type}.desc`] = [
        "Sur un terrain libre ou au centre d'une route double. Aucun entretien.",
        "Plant on empty land or a merged-road median. No upkeep.",
      ];
    }
    messages["landscape.median"] = ["Choisissez un terre-plein central, loin d'un carrefour ou d'une extrémité.",
      "Choose a merged-road median away from junctions and road ends."];
    messages["landscape.same"] = ["Cette plantation est déjà présente.", "This planting is already here."];
    const serialize = City.prototype.toJSON;
    City.prototype.toJSON = function () {
      const data = serialize.call(this);
      data.medianPlants = sanitize(this, this.medianPlants);
      return data;
    };
    const deserialize = City.fromJSON;
    City.fromJSON = function (data) {
      const city = deserialize.call(this, data);
      city.medianPlants = sanitize(city, data.medianPlants);
      return city;
    };
  }

  function preview(city, tool, position, translate) {
    const plant = plants[tool];
    if (!plant || !city.inBounds(position.x, position.y)) return null;
    const index = city.idx(position.x, position.y);
    if (city.overlay[index] !== 2) return null;
    const layout = window.__roadLayout?.wide(city, position.x, position.y);
    let owner = index;
    if (layout?.side === 0) owner += layout.axis === "x" ? city.size : 1;
    const median = layout && window.__roadLayout.median(city, position.x, position.y, layout);
    const x = owner % city.size, y = Math.floor(owner / city.size);
    const other = owner - (layout?.axis === "x" ? city.size : 1);
    const safe = median && !city.fire[owner] && !city.fire[other] && !city.flood[owner] && !city.flood[other];
    const unchanged = city.medianPlants?.[owner] === plant.variant;
    return { tool, tiles: safe && !unchanged ? [owner] : [], footprint: [owner],
      cost: plant.cost, valid: !!safe && !unchanged, medianOwner: owner,
      reason: translate(unchanged ? "landscape.same" : "landscape.median") };
  }

  function apply(city, plan) {
    if (plan.medianOwner === undefined || !plants[plan.tool]) return null;
    city.medianPlants ||= {};
    city.medianPlants[plan.medianOwner] = plants[plan.tool].variant;
    city.money -= plan.cost;
    return { ok: true, cost: plan.cost };
  }

  function clear(city, index) {
    if (!city.medianPlants) return;
    const layout = window.__roadLayout?.wide(city, index % city.size, Math.floor(index / city.size));
    const owner = layout?.side === 0 ? index + (layout.axis === "x" ? city.size : 1) : index;
    delete city.medianPlants[owner];
  }

  function toolbar(groups, items) {
    const group = groups.find(group => group.items?.some(item => item.tool === "park"));
    group?.items.unshift(...items(Object.keys(plants)));
    return groups;
  }

  function draw(type, scene, project) {
    if (!plants[type]) return false;
    const bushes = type === "landscape_bushes";
    const small = type === "landscape_smalltree";
    const height = bushes ? 3 : small ? 10 : 20;
    if (!bushes) scene.cylinder(0.5, 0.5, small ? 0.025 : 0.04, height - 2, "#705239", "#937052");
    scene.custom(40, ctx => {
      for (const [u, v, radius] of bushes ? [[0.3, 0.4, 4], [0.65, 0.5, 4.5], [0.45, 0.7, 3.8]] : [[0.5, 0.5, small ? 5 : 8]]) {
        const [x, y] = project(u, v, height);
        ctx.fillStyle = "#527a45";
        ctx.beginPath(); ctx.ellipse(x, y, radius, radius * 0.95, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#89aa60";
        ctx.beginPath(); ctx.ellipse(x - radius * 0.25, y - radius * 0.25, radius * 0.75, radius * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      }
    });
    return true;
  }
  window.__landscaping = { install, preview, apply, clear, toolbar, draw };
})();
