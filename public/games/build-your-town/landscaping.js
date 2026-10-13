(() => {
  let nativeRound;
  let nativeConifer;
  const plants = {
    landscape_tree: { cost: 10, variant: 2, name: ["Arbre", "Tree"] },
    landscape_smalltree: { cost: 6, variant: 0, name: ["Petit arbre", "Small tree"] },
    landscape_cemara: { cost: 12, variant: 3, name: ["Cemara", "Cemara tree"] },
    landscape_palm: { cost: 15, variant: 4, name: ["Palmier", "Palm tree"] },
    landscape_flowering: { cost: 14, variant: 5, name: ["Arbre fleuri", "Flowering tree"] },
    landscape_bushes: { cost: 4, variant: 1, name: ["Buissons", "Bushes"] },
  };
  const sanitize = (city, values) => {
    const result = {};
    if (!values || typeof values !== "object" || Array.isArray(values)) return result;
    for (const [key, value] of Object.entries(values)) {
      const index = Number(key);
      if (Number.isInteger(index) && index >= 0 && index < city.count && Object.values(plants).some(plant => plant.variant === value)) result[index] = value;
    }
    return result;
  };

  function install(City, definitions, messages, round, conifer) {
    nativeRound = round;
    nativeConifer = conifer;
    for (const [type, plant] of Object.entries(plants)) {
      definitions[type] = { size: 1, cost: plant.cost, upkeep: 0, category: "park" };
      messages[`struct.${type}`] = plant.name;
      messages[`struct.${type}.desc`] = [
        "Sur un terrain libre ou au centre d'une route double. Aucun entretien.",
        "Plant on empty land or a merged-road median. No upkeep.",
      ];
    }
    messages["group.landscaping"] = ["Aménagement paysager", "Landscaping"];
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

  function toolbar(groups, items, translate, icon) {
    const parksIndex = groups.findIndex(group => group.items?.some(item => item.tool === "park"));
    groups.splice(parksIndex, 0, {
      group: translate("group.landscaping"),
      icon: icon("landscape_tree", 1.6),
      items: items(Object.keys(plants)),
    });
    return groups;
  }

  const hash = (value) => {
    let result = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
    result = Math.imul(result ^ (result >>> 16), 0x45d9f3b);
    return (result ^ (result >>> 16)) >>> 0;
  };

  function visual(city, building) {
    if (!plants[building.type]) return null;
    let grouped = false;
    if (building.type !== "landscape_bushes") {
      for (let dy = -1; dy <= 1 && !grouped; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if ((!dx && !dy) || !city.inBounds(building.x + dx, building.y + dy)) continue;
          const index = city.idx(building.x + dx, building.y + dy);
          const neighbor = city.structAt(index)?.type;
          if (city.overlay[index] === 1 || (plants[neighbor] && neighbor !== "landscape_bushes")) {
            grouped = true;
            break;
          }
        }
      }
    }
    return { variant: hash(city.seed ^ city.idx(building.x, building.y)) % 16, grouped };
  }

  function paint(ctx, type, project, variant = 0, grouped = false, forestStyle = 0) {
    const bushes = type === "landscape_bushes";
    const small = type === "landscape_smalltree";
    const count = bushes ? 3 : grouped ? 2 + variant % 3 : 1;
    const trees = [];
    for (let n = 0; n < count; n++) {
      const seed = hash(variant * 11 + n * 97);
      trees.push({
        u: count === 1 ? 0.46 + (seed & 255) / 255 * 0.08 : 0.22 + (seed & 255) / 255 * 0.56,
        v: count === 1 ? 0.46 + (seed >>> 8 & 255) / 255 * 0.08 : 0.22 + (seed >>> 8 & 255) / 255 * 0.56,
        radius: (count === 1 ? 6 : 4.5) + (seed >>> 16 & 255) / 255 * 2.5,
        seed,
      });
    }
    trees.sort((a, b) => a.u + a.v - b.u - b.v);
    for (const { u, v, radius, seed } of trees) {
      const [x, y] = project(u, v);
      if (bushes) {
        const size = 3 + seed % 3 * 0.4;
        ctx.fillStyle = seed & 1 ? "#548348" : "#658e50";
        ctx.beginPath(); ctx.arc(x, y - size, size, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#96b96c";
        ctx.beginPath(); ctx.arc(x - size * 0.3, y - size * 1.3, size * 0.45, 0, Math.PI * 2); ctx.fill();
      } else if (type === "landscape_cemara" || (type !== "landscape_palm" && type !== "landscape_flowering" && forestStyle === 1)) {
        nativeConifer(ctx, u, v, radius * (small ? 0.6 : 0.95), seed);
      } else if (type === "landscape_palm") {
        const height = 16 + radius;
        const lean = (seed % 5 - 2) * 0.5;
        ctx.strokeStyle = "#806248"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean, y - height * 0.5, x + lean, y - height); ctx.stroke();
        for (const [dx, dy] of [[-1, 0.4], [1, 0.4], [-0.8, -0.4], [0.8, -0.4], [-0.25, -0.7], [0.25, -0.7]]) {
          const width = radius * 1.4;
          ctx.fillStyle = dx < 0 ? "#427a49" : "#6c9d53";
          ctx.beginPath(); ctx.moveTo(x + lean, y - height);
          ctx.quadraticCurveTo(x + lean + dx * width * 0.7, y - height + dy * width - 3, x + lean + dx * width, y - height + dy * width);
          ctx.quadraticCurveTo(x + lean + dx * width * 0.45, y - height + dy * width * 0.3 + 2, x + lean, y - height); ctx.fill();
        }
      } else if (type === "landscape_flowering") {
        ctx.fillStyle = "#5a3d1e"; ctx.fillRect(x - 1, y - 4, 2, 5);
        const color = seed & 1 ? "#c97f9f" : "#d995ae";
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y - radius - 2, radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#efb7c6";
        ctx.beginPath(); ctx.arc(x - radius * 0.3, y - radius * 1.3 - 2, radius * 0.45, 0, Math.PI * 2); ctx.fill();
      } else {
        nativeRound(ctx, u, v, radius * (small ? 0.65 : 1), seed, forestStyle);
      }
    }
  }

  function draw(type, scene, project) {
    if (!plants[type]) return false;
    scene.custom(40, ctx => paint(ctx, type, project));
    return true;
  }
  window.__landscaping = { install, preview, apply, clear, toolbar, visual, paint, draw };
})();
