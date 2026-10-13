(() => {
  const BUILDINGS = [
    { type: "solarfarm", name: ["Ferme solaire", "Solar farm"], desc: ["180 MW propres sur 3 × 3 cases. Se débloque à 12 000 habitants.", "180 MW of clean power on a 3 × 3 footprint. Unlocks at 12,000 residents."], size: 3, cost: 8000, upkeep: 8, power: 180, category: "power", unlockPop: 12000 },
    { type: "geothermal", name: ["Centrale géothermique", "Geothermal plant"], desc: ["750 MW propres, sans dépendre du littoral. Se débloque à 35 000 habitants.", "750 MW of clean power without a shoreline requirement. Unlocks at 35,000 residents."], size: 3, cost: 22000, upkeep: 28, power: 750, category: "power", unlockPop: 35000 },
    { type: "desalination", name: ["Usine de dessalement", "Desalination plant"], desc: ["Sur le littoral, distribue l'eau à 24 cases. Consomme 12 MW. Se débloque à 20 000 habitants.", "Shoreline water supply with a 24-tile radius. Uses 12 MW. Unlocks at 20,000 residents."], size: 3, cost: 18000, upkeep: 35, radius: 24, consumes: 12, needsShore: true, category: "water", unlockPop: 20000 },
    { type: "reservoir", name: ["Réservoir municipal", "Municipal reservoir"], desc: ["Distribue l'eau à 34 cases, sans littoral. Consomme 6 MW. Se débloque à 50 000 habitants.", "Inland water supply with a 34-tile radius. Uses 6 MW. Unlocks at 50,000 residents."], size: 4, cost: 30000, upkeep: 45, radius: 34, consumes: 6, category: "water", unlockPop: 50000 },
    { type: "university", name: ["Université", "University"], desc: ["Couverture scolaire à 24 cases. Consomme 8 MW. Se débloque à 20 000 habitants.", "Education coverage within 24 tiles. Uses 8 MW. Unlocks at 20,000 residents."], size: 4, cost: 16000, upkeep: 45, radius: 24, consumes: 8, dept: "education", category: "service", unlockPop: 20000 },
    { type: "medicalcenter", name: ["Centre médical", "Medical center"], desc: ["Couverture sanitaire à 24 cases. Consomme 12 MW. Se débloque à 35 000 habitants.", "Health coverage within 24 tiles. Uses 12 MW. Unlocks at 35,000 residents."], size: 4, cost: 25000, upkeep: 65, radius: 24, consumes: 12, dept: "health", category: "service", unlockPop: 35000 },
    { type: "policehq", name: ["Quartier général de police", "Police headquarters"], desc: ["Couverture policière à 24 cases. Consomme 6 MW. Se débloque à 25 000 habitants.", "Police coverage within 24 tiles. Uses 6 MW. Unlocks at 25,000 residents."], size: 3, cost: 14000, upkeep: 38, radius: 24, consumes: 6, dept: "police", category: "service", unlockPop: 25000 },
    { type: "firecommand", name: ["Centre de secours", "Fire command center"], desc: ["Couverture incendie à 24 cases. Consomme 6 MW. Se débloque à 25 000 habitants.", "Fire coverage within 24 tiles. Uses 6 MW. Unlocks at 25,000 residents."], size: 3, cost: 14000, upkeep: 38, radius: 24, consumes: 6, dept: "fire", category: "service", unlockPop: 25000 },
    { type: "botanicalgarden", name: ["Jardin botanique", "Botanical garden"], desc: ["Améliore la valeur foncière à 16 cases. Se débloque à 30 000 habitants.", "Improves land value within 16 tiles. Unlocks at 30,000 residents."], size: 4, cost: 18000, upkeep: 30, radius: 16, category: "park", unlockPop: 30000 },
    { type: "grandmuseum", name: ["Grand musée", "Grand museum"], desc: ["Améliore la valeur foncière à 14 cases. Consomme 5 MW. Se débloque à 40 000 habitants.", "Improves land value within 14 tiles. Uses 5 MW. Unlocks at 40,000 residents."], size: 3, cost: 16000, upkeep: 28, radius: 14, consumes: 5, category: "park", unlockPop: 40000 },
    { type: "residentialtower", name: ["Tour résidentielle", "Residential tower"], desc: ["2 500 habitants et 500 emplois avec électricité et accès routier. Génère des impôts. Se débloque à 40 000 habitants.", "2,500 residents and 500 jobs with power and road access. Generates tax income. Unlocks at 40,000 residents."], size: 3, cost: 25000, upkeep: 60, consumes: 18, pop: 2500, jobs: 500, taxable: true, requiresRoad: true, category: "reward", unlockPop: 40000 },
    { type: "researchcampus", name: ["Campus de recherche", "Research campus"], desc: ["2 500 emplois avec électricité et accès routier. Couverture scolaire à 16 cases et recettes fiscales. Se débloque à 60 000 habitants.", "2,500 jobs with power and road access. Education coverage within 16 tiles and tax income. Unlocks at 60,000 residents."], size: 4, cost: 40000, upkeep: 90, radius: 16, consumes: 20, jobs: 2500, taxable: true, requiresRoad: true, dept: "education", category: "service", unlockPop: 60000 },
  ];

  const install = (buildings, messages) => {
    for (const { type, name, desc, ...definition } of BUILDINGS) {
      buildings[type] = { ...definition, endgame: true };
      messages[`struct.${type}`] = name;
      messages[`struct.${type}.desc`] = desc;
    }
    messages["group.districts"] = ["Grands quartiers", "Advanced districts"];
    messages["query.structResidents"] = ["{n} habitants avec électricité et accès routier", "{n} residents with power and road access"];
    messages["query.structJobs"] = ["{n} emplois avec électricité et accès routier", "{n} jobs with power and road access"];
  };

  const toolbar = (groups, items, translate, icon) => {
    for (const [anchor, types] of [
      ["wind", ["solarfarm", "geothermal"]],
      ["pump", ["desalination", "reservoir"]],
      ["police", ["university", "medicalcenter", "policehq", "firecommand"]],
      ["park", ["botanicalgarden", "grandmuseum"]],
    ]) groups.find((group) => group.items?.some((item) => item.tool === anchor)).items.push(...items(types));
    groups.splice(groups.length - 1, 0, {
      group: translate("group.districts"),
      icon: icon("residentialtower", 1.6),
      items: items(["residentialtower", "researchcampus"]),
    });
    return groups;
  };

  // Use the game's isometric primitives for both map buildings and construction previews.
  const draw = (type, scene, project, polygon) => {
    const building = BUILDINGS.find((item) => item.type === type);
    if (!building) return false;
    const face = (points, color, depth = 40) => scene.custom(depth, (ctx) => polygon(ctx, points.map((point) => project(...point)), color));
    const trees = (size) => {
      for (const [x, y] of [[0.25, 0.25], [size - 0.25, 0.25], [0.25, size - 0.25], [size - 0.25, size - 0.25]]) scene.tree(x, y, 5);
    };
    switch (type) {
      case "solarfarm":
        for (let y = 0.35; y < 2.8; y += 0.8) for (let x = 0.25; x < 2.7; x += 0.8) {
          scene.box(x, y, x + 0.65, y + 0.55, 2, "#7a8794", "#b7c2cb");
          face([[x, y, 8], [x + 0.65, y, 8], [x + 0.65, y + 0.55, 3], [x, y + 0.55, 3]], "#3568a2", x + y);
          face([[x + 0.3, y, 8.2], [x + 0.33, y, 8.2], [x + 0.33, y + 0.55, 3.2], [x + 0.3, y + 0.55, 3.2]], "#b9dbf4", x + y + 0.01);
        }
        break;
      case "geothermal":
        scene.box(0.2, 0.3, 1.85, 1.5, 22, "#879c91", "#d1e0d6", { windows: true });
        for (const y of [0.6, 1.7]) {
          scene.cylinder(2.35, y, 0.42, 26, "#a6b8b0", "#d7e6df");
          scene.cylinder(2.35, y, 0.16, 12, "#b9c8c0", "#718d80", { z0: 26 });
          scene.steam(2.35, y, 38);
        }
        scene.box(0.3, 2.1, 1.7, 2.7, 10, "#5e7f6b", "#86a38b");
        break;
      case "desalination":
        scene.box(0.2, 0.2, 1.6, 1.35, 18, "#adc8d8", "#e2edf4", { windows: true });
        for (const [x, y] of [[2.25, 0.65], [2.25, 1.95], [0.75, 2.2]]) {
          scene.cylinder(x, y, 0.46, 8, "#94aebd", "#467eae");
          scene.cylinder(x, y, 0.39, 1, "#7db1d3", "#a7d6eb", { z0: 8 });
        }
        scene.box(1.45, 1.7, 1.65, 2.75, 4, "#678ca6", "#a1bdd0");
        break;
      case "reservoir":
        scene.box(0.25, 0.25, 3.75, 3.75, 6, "#9baea9", "#d0dfd7");
        face([[0.45, 0.45, 6.2], [3.55, 0.45, 6.2], [3.55, 3.55, 6.2], [0.45, 3.55, 6.2]], "#4e9bc6", 15);
        scene.box(0.4, 0.4, 1.25, 1.2, 12, "#bbcfca", "#edf1df", { z0: 6, windows: true });
        scene.box(3.35, 0.3, 3.55, 3.7, 2, "#c8d3c9", "#e2e7d7", { z0: 6, key: 30 });
        break;
      case "university":
        scene.house(0.3, 0.3, 3.7, 1.4, 25, 9, "#d8bc9c", "#805b58", { chimney: false });
        scene.house(0.3, 1.4, 1.2, 3.5, 20, 8, "#d8bc9c", "#805b58", { chimney: false });
        scene.house(2.8, 1.4, 3.7, 3.5, 20, 8, "#d8bc9c", "#805b58", { chimney: false });
        scene.box(1.65, 0.6, 2.35, 1.3, 52, "#b79473", "#d8c4aa", { windows: true, floors: true });
        scene.disc(2, 2.7, 0.5, "#779a69");
        trees(4);
        break;
      case "medicalcenter":
        scene.box(0.3, 0.3, 2.3, 2.3, 42, "#dde7eb", "#f4f7f7", { windows: true, floors: true });
        scene.box(2.3, 0.5, 3.7, 2.3, 24, "#c2d8df", "#e7eff0", { windows: true });
        scene.box(0.3, 2.3, 3.7, 3.6, 14, "#dde7eb", "#eaf1f2", { windows: true });
        face([[1, 1.2, 42.2], [1.6, 1.2, 42.2], [1.6, 1.4, 42.2], [1, 1.4, 42.2]], "#cc514d", 50);
        face([[1.2, 1, 42.2], [1.4, 1, 42.2], [1.4, 1.6, 42.2], [1.2, 1.6, 42.2]], "#cc514d", 50);
        break;
      case "policehq":
        scene.box(0.25, 0.25, 2.1, 1.75, 36, "#708eaa", "#b6cadb", { windows: true, floors: true });
        scene.box(0.25, 1.75, 2.7, 2.55, 14, "#8ba6bc", "#d4dfe7", { windows: true });
        scene.antenna(1.5, 0.8, 36, 18);
        scene.beacon(2.3, 2.2, 17, "#3d7fe0");
        scene.box(2.3, 0.35, 2.7, 1.45, 5, "#e4ecf0", "#f2f6f8");
        break;
      case "firecommand":
        scene.box(0.2, 0.25, 2.4, 1.5, 24, "#b95047", "#e9b89d", { windows: true });
        scene.house(2.35, 0.3, 2.8, 0.8, 48, 6, "#b95047", "#565d69", { chimney: false });
        scene.box(0.2, 1.5, 2.4, 2.35, 12, "#c75d50", "#e9d3bb");
        for (const x of [0.5, 1.3]) scene.box(x, 2.25, x + 0.5, 2.85, 6, "#cf4545", "#eee7d7");
        scene.beacon(2.55, 0.55, 55, "#ff6b57");
        break;
      case "botanicalgarden":
        for (const [x, y, radius] of [[1.25, 1.3, 0.95], [2.75, 2.5, 0.75]]) {
          scene.cylinder(x, y, radius, 6, "#7faaa0", "#a8c9be");
          scene.dome(x, y, radius, 6, "#b5ded4", 0.75);
        }
        scene.box(0.4, 2.8, 1.5, 3.5, 8, "#879d70", "#d3e1b8", { windows: true });
        trees(4);
        for (const x of [1.8, 2.6]) scene.disc(x, 0.4, 0.25, "#77b565");
        break;
      case "grandmuseum":
        scene.box(0.2, 0.3, 2.8, 2.1, 22, "#c7baa3", "#e8ddc7", { windows: true });
        scene.box(0.3, 2.1, 2.7, 2.7, 3, "#c6b79d", "#e3d9c4");
        for (const x of [0.5, 1.15, 1.8, 2.45]) scene.cylinder(x, 2.15, 0.09, 21, "#dcd0b7", "#eee5d2");
        scene.box(0.25, 1.95, 2.75, 2.4, 3, "#dacdb2", "#f1e7cf", { z0: 22, key: 30 });
        scene.dome(1.5, 1.15, 0.6, 22, "#89a8a4");
        break;
      case "residentialtower":
        scene.box(0.25, 0.25, 2.75, 2.75, 12, "#b4c7cc", "#dee8e6", { windows: true });
        scene.box(0.65, 0.65, 2.35, 2.35, 58, "#7cabb8", "#b7d6da", { z0: 12, windows: true, floors: true });
        scene.box(1, 1, 2, 2, 24, "#91bcc5", "#d1e5e8", { z0: 70, windows: true, floors: true });
        scene.antenna(1.5, 1.5, 94, 8);
        trees(3);
        break;
      case "researchcampus":
        scene.box(0.3, 0.3, 1.6, 3.5, 24, "#7b9ba7", "#d0dfe3", { windows: true, floors: true });
        scene.box(1.6, 0.3, 3.7, 1.5, 30, "#7b9ba7", "#d0dfe3", { windows: true, floors: true });
        scene.cylinder(2.7, 2.7, 0.7, 8, "#9cb8c3", "#cee0e8");
        scene.dome(2.7, 2.7, 0.7, 8, "#d7eaf0");
        scene.antenna(2.7, 2.7, 30, 12);
        trees(4);
        break;
    }
    return true;
  };

  const monthlyNet = (city) => {
    const b = city.lastBudget;
    if (!b) return 0;
    const income = (b.taxR || 0) + (b.taxC || 0) + (b.taxI || 0);
    const expenses = ["roads", "power", "water", "police", "fire", "education", "health", "parks", "transport", "ordinances", "interest"].reduce((sum, key) => sum + (b[key] || 0), 0);
    return Math.round(income - expenses);
  };
  const active = (city, type) => [...city.structs.values()].filter((building) => building.type === type && city.powered[city.idx(building.x, building.y)] && (!BUILDINGS.find((item) => item.type === type)?.requiresRoad || city.roadDist[city.idx(building.x, building.y)] !== 255)).length;
  const result = (done, cur, target, label) => ({ done, cur, target, label });
  const mission = (id, en, fr, descEn, descFr, reward, check) => ({ id, title: { en, fr }, desc: { en: descEn, fr: descFr }, reward, rewardLabel: `+$${reward.toLocaleString("en-US")}`, check });
  const ERAS = [
    {
      id: 6, title: { en: "Era 6: Sustainable Metropolis", fr: "Ère 6 : Métropole durable" },
      subtitle: { en: "Use advanced utilities and citywide services to support 50,000 residents.", fr: "Déployez de nouveaux réseaux et services pour accueillir 50 000 habitants." },
      missions: [
        mission("era6_energy", "Clean Energy District", "Quartier d'énergie propre", "Build a solar farm or geothermal plant and supply all developed zones with power.", "Construisez une ferme solaire ou une centrale géothermique et alimentez toutes les zones développées.", 30000, (c) => {
          const built = active(c, "solarfarm") + active(c, "geothermal") > 0;
          const ok = built && c.power.demand > 0 && c.power.supply >= c.power.demand && c.stats.unpowered === 0;
          return result(ok, Number(built) + Number(c.power.demand > 0 && c.power.supply >= c.power.demand && c.stats.unpowered === 0), 2, `Clean plant: ${built ? "✓" : "✗"} | Unpowered: ${c.stats.unpowered}`);
        }),
        mission("era6_water", "Water for Everyone", "De l'eau pour tous", "Build a desalination plant or reservoir and reach 90% water coverage.", "Construisez une usine de dessalement ou un réservoir et atteignez 90 % de couverture en eau.", 30000, (c) => {
          const built = active(c, "desalination") + active(c, "reservoir") > 0;
          const water = Math.floor(c.stats.waterShare * 100);
          return result(built && water >= 90, Number(built) + Math.min(1, water / 90), 2, `Advanced water: ${built ? "✓" : "✗"} | Water: ${water}% / 90%`);
        }),
        mission("era6_services", "Public Service Network", "Réseau de services publics", "Operate a university, medical center, police headquarters and fire command center with power.", "Alimentez une université, un centre médical, un quartier général de police et un centre de secours.", 40000, (c) => {
          const count = ["university", "medicalcenter", "policehq", "firecommand"].filter((type) => active(c, type)).length;
          return result(count === 4, count, 4, `${count} / 4 advanced services powered`);
        }),
        mission("era6_culture", "A City Worth Living In", "Une ville où vivre", "Build a botanical garden and grand museum, then reach 50,000 residents.", "Construisez un jardin botanique et un grand musée, puis atteignez 50 000 habitants.", 50000, (c) => {
          const garden = [...c.structs.values()].some((s) => s.type === "botanicalgarden");
          const museum = active(c, "grandmuseum") > 0;
          const pop = c.stats.pop;
          return result(garden && museum && pop >= 50000, Number(garden) + Number(museum) + Math.min(1, pop / 50000), 3, `Garden: ${garden ? "✓" : "✗"} | Museum: ${museum ? "✓" : "✗"} | ${pop.toLocaleString()} / 50,000`);
        }),
      ],
    },
    {
      id: 7, title: { en: "Era 7: World Capital", fr: "Ère 7 : Capitale mondiale" },
      subtitle: { en: "Build research districts and sustain a healthy city of 100,000 residents.", fr: "Développez la recherche et faites prospérer une ville de 100 000 habitants." },
      missions: [
        mission("era7_research", "Knowledge Economy", "Économie du savoir", "Operate two research campuses and two residential towers with power and road access.", "Alimentez et reliez aux routes deux campus de recherche et deux tours résidentielles.", 60000, (c) => {
          const labs = Math.min(2, active(c, "researchcampus"));
          const towers = Math.min(2, active(c, "residentialtower"));
          return result(labs === 2 && towers === 2, labs + towers, 4, `Research: ${labs} / 2 | Towers: ${towers} / 2`);
        }),
        mission("era7_coverage", "No Neighborhood Left Behind", "Des services pour chaque quartier", "Reach 80% police, fire, education and health coverage with every department funded at least 80%.", "Atteignez 80 % de couverture policière, incendie, scolaire et sanitaire, avec chaque service financé à au moins 80 %.", 60000, (c) => {
          const departments = ["police", "fire", "education", "health"];
          const count = departments.filter((dept) => c.stats.coverage[dept] >= 0.8 && c.funding[dept] >= 80).length;
          return result(c.stats.pop > 0 && count === 4, count, 4, `${count} / 4 departments at 80% coverage and funding`);
        }),
        mission("era7_capital", "World Capital", "Capitale mondiale", "Reach 100,000 residents, 95% water coverage, no unpowered zones and a positive monthly balance.", "Atteignez 100 000 habitants, 95 % de couverture en eau, zéro zone sans électricité et un solde mensuel positif.", 100000, (c) => {
          const water = Math.floor(c.stats.waterShare * 100);
          const net = monthlyNet(c);
          const power = c.power.supply >= c.power.demand && c.power.demand > 0 && c.stats.unpowered === 0;
          const pop = c.stats.pop;
          return result(pop >= 100000 && water >= 95 && power && net > 0, Math.min(1, pop / 100000) + Math.min(1, water / 95) + Number(power) + Number(net > 0), 4, `${pop.toLocaleString()} / 100,000 | Water: ${water}% | Power: ${power ? "✓" : "✗"} | Net: $${net}/mo`);
        }),
        mission("era7_wealth", "Lasting Prosperity", "Prospérité durable", "Hold $500,000, repay all bonds and maintain a positive monthly balance without bankruptcy.", "Conservez 500 000 $, remboursez tous les emprunts et gardez un solde mensuel positif sans faillite.", 75000, (c) => {
          const net = monthlyNet(c);
          const money = Math.max(0, c.money);
          return result(money >= 500000 && c.bonds === 0 && net > 0 && !c.bankrupt, Math.min(1, money / 500000) + Number(c.bonds === 0) + Number(net > 0 && !c.bankrupt), 3, `$${Math.round(money).toLocaleString()} / $500,000 | Bonds: ${c.bonds} | Net: $${net}/mo`);
        }),
      ],
    },
  ];
  window.__townExpansion = { buildings: BUILDINGS, eras: ERAS, install, toolbar, draw };
})();
