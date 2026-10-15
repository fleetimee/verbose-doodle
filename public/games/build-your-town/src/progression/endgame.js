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
    { type: "volleyballcourt", name: ["Terrain de volley-ball", "Volleyball court"], desc: ["Jusqu'à 45 points de loisirs à 6 cases. Route à 3 cases requise, sans électricité. Se débloque à 500 habitants.", "Up to 45 Fun within 6 tiles. Needs a road within 3 tiles; no power required. Unlocks at 500 residents."], size: 2, cost: 250, upkeep: 2, radius: 6, fun: 45, requiresRoad: true, category: "park", unlockPop: 500 },
    { type: "soccerfield", name: ["Terrain de football", "Soccer field"], desc: ["Jusqu'à 65 points de loisirs à 10 cases. Route à 3 cases requise, sans électricité. Se débloque à 1 000 habitants.", "Up to 65 Fun within 10 tiles. Needs a road within 3 tiles; no power required. Unlocks at 1,000 residents."], size: 4, cost: 1500, upkeep: 8, radius: 10, fun: 65, requiresRoad: true, category: "park", unlockPop: 1000 },
    { type: "shoppingmall", name: ["Centre commercial", "Shopping mall"], desc: ["Jusqu'à 75 points de loisirs à 14 cases et 600 emplois imposables. Route à 3 cases et 8 MW requis. Se débloque à 10 000 habitants.", "Up to 75 Fun within 14 tiles and 600 taxable jobs. Needs a road within 3 tiles and 8 MW. Unlocks at 10,000 residents."], size: 4, cost: 12000, upkeep: 35, radius: 14, fun: 75, jobs: 600, taxable: true, requiresRoad: true, consumes: 8, category: "park", unlockPop: 10000 },
    { type: "shuttledock", name: ["Embarcadère de navette", "Visitor shuttle dock"], desc: ["À terre, au bord de l'eau. Route à 3 cases requise. Relie les parcs flottants par bateau, sans électricité. Se débloque à 3 500 habitants.", "Place on land beside water with a road within 3 tiles. Connects floating water parks by boat; no power required. Unlocks at 3,500 residents."], size: 2, cost: 1800, upkeep: 8, needsShore: true, requiresRoad: true, category: "park", unlockPop: 3500 },
    { type: "floatingwaterpark", name: ["Parc aquatique flottant", "Floating water park"], desc: ["Sur 4 × 4 cases d'eau libre, même au large. Un embarcadère accessible par route et un trajet d'eau libre sont requis. Jusqu'à 95 loisirs à 20 cases. Se débloque à 5 000 habitants.", "Place on 4 × 4 clear water tiles, including offshore. Needs a clear water route to a road-connected Visitor shuttle dock. Up to 95 Fun within 20 tiles; no power required. Unlocks at 5,000 residents."], size: 4, cost: 9000, upkeep: 40, radius: 20, fun: 95, waterOnly: true, onWater: true, needsShuttle: true, category: "park", unlockPop: 5000 },
    { type: "jetski", name: ["Circuit de jet-ski", "Jet ski circuit"], desc: ["Sur 3 × 3 cases d'eau libre au bord de la terre. Route à 3 cases du rivage requise. Jusqu'à 60 loisirs à 10 cases. Sans électricité. Se débloque à 2 000 habitants.", "Place on 3 × 3 clear water tiles touching land. Needs a road within 3 tiles of the shore. Up to 60 Fun within 10 tiles; no power required. Unlocks at 2,000 residents."], size: 3, cost: 2200, upkeep: 10, radius: 10, fun: 60, waterOnly: true, onWater: true, requiresRoad: true, category: "park", unlockPop: 2000 },
    { type: "bananaboat", name: ["Bouée banane", "Banana boat rides"], desc: ["Sur 3 × 3 cases d'eau libre au bord de la terre. Route à 3 cases du rivage requise. Jusqu'à 75 loisirs à 12 cases. Sans électricité. Se débloque à 3 500 habitants.", "Place on 3 × 3 clear water tiles touching land. Needs a road within 3 tiles of the shore. Up to 75 Fun within 12 tiles; no power required. Unlocks at 3,500 residents."], size: 3, cost: 3500, upkeep: 15, radius: 12, fun: 75, waterOnly: true, onWater: true, requiresRoad: true, category: "park", unlockPop: 3500 },
    { type: "beachcarnival", name: ["Fête foraine du littoral", "Beach carnival"], desc: ["Jusqu’à 90 points de loisirs à 12 cases. Littoral, électricité et route à 3 cases requis. Consomme 4 MW. Se débloque à 5 000 habitants.", "Up to 90 Fun within 12 tiles. Needs shoreline, power and a road within 3 tiles. Uses 4 MW. Unlocks at 5,000 residents."], size: 4, cost: 6000, upkeep: 25, radius: 12, fun: 90, consumes: 4, needsShore: true, requiresRoad: true, category: "park", unlockPop: 5000 },
    { type: "residentialtower", name: ["Tour résidentielle", "Residential tower"], desc: ["2 500 habitants et 500 emplois avec électricité et accès routier. Génère des impôts. Se débloque à 40 000 habitants.", "2,500 residents and 500 jobs with power and road access. Generates tax income. Unlocks at 40,000 residents."], size: 3, cost: 25000, upkeep: 60, consumes: 18, pop: 2500, jobs: 500, taxable: true, requiresRoad: true, category: "reward", unlockPop: 40000 },
    { type: "skylineapartments", name: ["Tours résidentielles jumelles", "Skyline apartments"], desc: ["6 000 habitants et 1 200 emplois imposables. Route à 3 cases et 36 MW requis. Se débloque à 60 000 habitants.", "6,000 residents and 1,200 taxable jobs. Needs a road within 3 tiles and 36 MW. Unlocks at 60,000 residents."], size: 4, cost: 60000, upkeep: 140, consumes: 36, pop: 6000, jobs: 1200, taxable: true, requiresRoad: true, category: "reward", unlockPop: 60000 },
    { type: "officeskyscraper", name: ["Gratte-ciel de bureaux", "Office skyscraper"], desc: ["6 500 emplois imposables. Route à 3 cases et 48 MW requis. Se débloque à 75 000 habitants.", "6,500 taxable jobs. Needs a road within 3 tiles and 48 MW. Unlocks at 75,000 residents."], size: 4, cost: 85000, upkeep: 190, consumes: 48, jobs: 6500, taxable: true, requiresRoad: true, category: "reward", unlockPop: 75000 },
    { type: "supertall", name: ["Tour métropolitaine", "Metropolitan supertall"], desc: ["10 000 habitants et 5 000 emplois imposables. Route à 3 cases et 90 MW requis. Se débloque à 100 000 habitants.", "10,000 residents and 5,000 taxable jobs. Needs a road within 3 tiles and 90 MW. Unlocks at 100,000 residents."], size: 4, cost: 160000, upkeep: 350, consumes: 90, pop: 10000, jobs: 5000, taxable: true, requiresRoad: true, category: "reward", unlockPop: 100000 },
    { type: "researchcampus", name: ["Campus de recherche", "Research campus"], desc: ["2 500 emplois avec électricité et accès routier. Couverture scolaire à 16 cases et recettes fiscales. Se débloque à 60 000 habitants.", "2,500 jobs with power and road access. Education coverage within 16 tiles and tax income. Unlocks at 60,000 residents."], size: 4, cost: 40000, upkeep: 90, radius: 16, consumes: 20, jobs: 2500, taxable: true, requiresRoad: true, dept: "education", category: "service", unlockPop: 60000 },
  ];

  const install = (buildings, messages) => {
    for (const { type, name, desc, ...definition } of BUILDINGS) {
      buildings[type] = { ...definition, endgame: true };
      messages[`struct.${type}`] = name;
      messages[`struct.${type}.desc`] = desc;
    }
    messages["group.recreation"] = ["Loisirs", "Recreation"];
    messages["group.landmarks"] = ["Monuments", "Landmarks"];
    messages["group.districts"] = ["Grands quartiers", "Advanced districts"];
    messages["query.structResidents"] = ["{n} habitants avec électricité et accès routier", "{n} residents with power and road access"];
    messages["query.structJobs"] = ["{n} emplois avec électricité et accès routier", "{n} jobs with power and road access"];
  };

  const toolbar = (groups, items, translate, icon) => {
    for (const [anchor, types] of [
      ["wind", ["solarfarm", "geothermal"]],
      ["pump", ["desalination", "reservoir"]],
      ["police", ["university", "medicalcenter", "policehq", "firecommand"]],
    ]) groups.find((group) => group.items?.some((item) => item.tool === anchor)).items.push(...items(types));
    const parksIndex = groups.findIndex((group) => group.items?.some((item) => item.tool === "park"));
    groups.splice(parksIndex, 1,
      { ...groups[parksIndex], items: items(["park", "bigpark", "botanicalgarden"]) },
      { group: translate("group.recreation"), icon: icon("volleyballcourt", 1.6), items: items(["volleyballcourt", "soccerfield", "shuttledock", "floatingwaterpark", "jetski", "bananaboat", "beachcarnival", "shoppingmall", "grandmuseum"]) },
      { group: translate("group.landmarks"), icon: icon("statue", 1.6), items: items(["statue", "cityhall", "mansion", "arcology"]) },
    );
    groups.splice(groups.length - 1, 0, {
      group: translate("group.districts"),
      icon: icon("residentialtower", 1.6),
      items: items(["residentialtower", "researchcampus", "skylineapartments", "officeskyscraper", "supertall"]),
    });
    return groups;
  };

  // Use the game's isometric primitives for both map buildings and construction previews.
  const draw = (type, scene, project, polygon, { animatedBase = false } = {}) => {
    const building = BUILDINGS.find((item) => item.type === type);
    if (!building) return false;
    const face = (points, color, depth = 40) => scene.custom(depth, (ctx) => polygon(ctx, points.map((point) => project(...point)), color));
    const line = (points, color = "#f5f0db", width = 1, depth = 25) => scene.custom(depth, (ctx) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      points.forEach((point, index) => index ? ctx.lineTo(...project(...point)) : ctx.moveTo(...project(...point)));
      ctx.stroke();
    });
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
          if (!animatedBase) scene.steam(2.35, y, 38);
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
      case "volleyballcourt":
        face([[0.12, 0.08, 0.3], [1.88, 0.08, 0.3], [1.88, 1.92, 0.3], [0.12, 1.92, 0.3]], "#e4c993", -1);
        line([[0.25, 0.2, 0.5], [1.75, 0.2, 0.5], [1.75, 1.8, 0.5], [0.25, 1.8, 0.5], [0.25, 0.2, 0.5]]);
        for (const y of [0.6, 1.4]) line([[0.25, y, 0.5], [1.75, y, 0.5]]);
        for (const x of [0.18, 1.82]) scene.cylinder(x, 1, 0.025, 10, "#688c9a", "#b8d5dc");
        for (const z of [4, 6, 8, 10]) line([[0.18, 1, z], [1.82, 1, z]], z === 10 ? "#fff3d9" : "#899da3", 0.7, 30);
        for (let x = 0.35; x < 1.82; x += 0.2) line([[x, 1, 4], [x, 1, 10]], "#899da3", 0.6, 30);
        if (!animatedBase) scene.disc(1.4, 1.6, 0.065, "#faf0d0", 1);
        break;
      case "soccerfield":
        for (let n = 0; n < 8; n++) {
          const y = 0.25 + n * 0.4375;
          face([[0.35, y, 0.3], [3.65, y, 0.3], [3.65, y + 0.4375, 0.3], [0.35, y + 0.4375, 0.3]], n % 2 ? "#609552" : "#72a560", -1);
        }
        line([[0.45, 0.35, 0.5], [3.55, 0.35, 0.5], [3.55, 3.65, 0.5], [0.45, 3.65, 0.5], [0.45, 0.35, 0.5]]);
        line([[0.45, 2, 0.5], [3.55, 2, 0.5]]);
        line(Array.from({ length: 25 }, (_, n) => [2 + Math.cos(n * Math.PI / 12) * 0.45, 2 + Math.sin(n * Math.PI / 12) * 0.45, 0.5]));
        for (const [end, inside, behind] of [[0.35, 1.05, 0.12], [3.65, 2.95, 3.88]]) {
          line([[1.1, end, 0.5], [1.1, inside, 0.5], [2.9, inside, 0.5], [2.9, end, 0.5]]);
          line([[1.6, end, 0.5], [1.6, end, 6], [2.4, end, 6], [2.4, end, 0.5]], "#fff4df", 1.3, 30);
          for (const x of [1.6, 1.8, 2, 2.2, 2.4]) line([[x, end, 6], [x, behind, 0.5]], "#c9d9c0", 0.55, 30);
          line([[1.6, behind, 0.5], [2.4, behind, 0.5]], "#c9d9c0", 0.7, 30);
        }
        for (const x of [0.06, 3.8]) {
          scene.box(x, 1.15, x + 0.14, 2.85, 3, "#8e8e82", "#d6d0b6");
          scene.box(x, 1.3, x + 0.14, 2.7, 2, "#6f897d", "#bcc5aa", { z0: 3 });
        }
        if (!animatedBase) scene.disc(2.2, 2.1, 0.065, "#f9f1d9", 1);
        break;
      case "shoppingmall":
        face([[0.15, 3.2, 0.3], [3.85, 3.2, 0.3], [3.85, 3.9, 0.3], [0.15, 3.9, 0.3]], "#929b9e", -1);
        scene.box(0.25, 0.3, 3.75, 3.05, 23, "#cbbfa8", "#e7ddc8", { windows: true, floors: true });
        scene.box(1.35, 0.5, 2.65, 2.8, 6, "#7496a4", "#c1dce0", { z0: 23 });
        face([[1.5, 0.7, 29.2], [2.5, 0.7, 29.2], [2.5, 2.6, 29.2], [1.5, 2.6, 29.2]], "#94c4d0", 20);
        for (const [x, color] of [[0.35, "#cd6952"], [1.25, "#4a9c9f"], [2.75, "#c79545"]]) {
          scene.box(x, 2.95, x + 0.8, 3.17, 10, "#517487", "#b6d5dc");
          face([[x, 2.95, 12], [x + 0.8, 2.95, 12], [x + 0.8, 3.25, 10], [x, 3.25, 10]], color, 25);
        }
        scene.box(2.15, 2.95, 2.6, 3.2, 13, "#456c83", "#a5cad5");
        for (const x of [0.5, 1.25, 2.75, 3.5]) line([[x, 3.45, 0.5], [x, 3.85, 0.5]], "#e8e4d4", 0.7, -0.5);
        scene.box(0.65, 3.45, 1.05, 3.75, 3, "#608dba", "#bbd4dd");
        scene.box(2.85, 3.45, 3.25, 3.75, 3, "#b8634e", "#eac6a4");
        scene.tree(0.12, 0.15, 3); scene.tree(3.88, 0.15, 3);
        break;
      case "shuttledock":
        scene.box(0.05, 0.05, 1.95, 1.95, 3, "#8d7052", "#d8b789");
        scene.house(0.2, 0.2, 1.25, 1.1, 10, 5, "#efe4cb", "#449dba", { chimney: false });
        for (const x of [0.2, 1.8]) scene.cylinder(x, 1.8, 0.055, 7, "#79624b", "#f2d6a8");
        scene.box(1.4, 0.25, 1.8, 0.8, 4, "#467988", "#a3ced3");
        break;
      case "floatingwaterpark":
        scene.box(0.15, 0.15, 3.85, 3.85, 2, "#d78c35", "#f9d45c");
        face([[0.5, 0.5, 2.2], [3.5, 0.5, 2.2], [3.5, 3.5, 2.2], [0.5, 3.5, 2.2]], "#4daec7", 3);
        for (const [x, y, color] of [[0.6, 0.6, "#ef8261"], [2.6, 0.6, "#78cb97"], [0.6, 2.6, "#eb81ac"]]) {
          scene.box(x, y, x + 0.8, y + 0.8, 5, color, "#fff1ae", { z0: 2 });
        }
        scene.box(2.65, 2.6, 3.35, 3.3, 18, "#9175bd", "#d5b2eb", { z0: 2 });
        face([[2.65, 2.6, 20], [3.35, 2.6, 20], [2.5, 1.3, 4], [1.8, 1.3, 4]], "#f17f59", 24);
        scene.box(1.5, 3.5, 2.5, 3.95, 2, "#936f4f", "#dfc099", { z0: 2 });
        for (const x of [0.2, 3.8]) for (const y of [0.2, 3.8]) scene.cylinder(x, y, 0.07, 4, "#e27544", "#fff2d1", { z0: 2 });
        break;
      case "jetski":
      case "bananaboat": {
        scene.box(0.08, 0.12, 0.38, 2.88, 3, "#926d49", "#d9b583");
        for (const y of [0.25, 1.5, 2.75]) scene.cylinder(0.23, y, 0.045, 5, "#6f5541", "#f0d0a0");
        for (const [x, y] of [[0.75, 0.45], [2.65, 0.45], [2.65, 2.65], [0.75, 2.65]]) {
          scene.cylinder(x, y, 0.07, 2, "#df7040", "#fff0bf");
        }
        for (const y of type === "jetski" ? [1, 2] : [0.8]) {
          face([[1.15, y, 1], [1.55, y - 0.2, 1], [2.15, y, 1], [1.55, y + 0.2, 1]], "#f4f0d9", 10);
          scene.box(1.4, y - 0.1, 1.85, y + 0.1, 3, "#dc5746", "#f29357");
          scene.box(1.48, y - 0.07, 1.7, y + 0.07, 2, "#374958", "#455965", { z0: 3 });
          line([[1.88, y - 0.12, 4], [1.88, y + 0.12, 4]], "#344753", 1.3);
        }
        if (type === "bananaboat") {
          line([[1.55, 1, 1], [1.55, 1.55, 1]], "#e8ddbf");
          scene.box(1.35, 1.55, 1.75, 2.65, 3, "#dda82e", "#ffe252");
          for (const y of [1.65, 2, 2.35]) {
            scene.cylinder(1.55, y, 0.065, 5, "#ed7952", "#f5c69e", { z0: 3 });
            line([[1.3, y, 3], [1.8, y, 3]], "#415267");
          }
          scene.cylinder(1.55, 2.65, 0.18, 5, "#e4b432", "#ffe56b");
        }
        break;
      }
      case "beachcarnival":
        face([[0.15, 0.15, 0.2], [3.85, 0.15, 0.2], [3.85, 3.85, 0.2], [0.15, 3.85, 0.2]], "#e8d1a0", -1);
        scene.box(0.2, 2.85, 3.8, 3.15, 1, "#ad8660", "#d8b38b");
        for (const [x, color] of [[0.45, "#da6254"], [1.55, "#4aabb1"], [2.65, "#e9b941"]]) {
          scene.house(x - 0.04, 3.2, x + 0.84, 3.85, 7, 6, "#f7e2b2", color, { chimney: false, door: false });
        }
        scene.cylinder(2.85, 1.6, 0.72, 3, "#cf8d5d", "#f5d3a1");
        scene.cylinder(2.85, 1.6, 0.06, 17, "#e8c45f", "#f9e8b1");
        if (!animatedBase) for (let n = 0; n < 8; n++) {
          const a = n * Math.PI / 4;
          const b = (n + 1) * Math.PI / 4;
          face([[2.85, 1.6, 24], [2.85 + Math.cos(a) * 0.8, 1.6 + Math.sin(a) * 0.8, 17], [2.85 + Math.cos(b) * 0.8, 1.6 + Math.sin(b) * 0.8, 17]], n % 2 ? "#f9e8bc" : "#d95756", 20);
          scene.cylinder(2.85 + Math.cos(a) * 0.5, 1.6 + Math.sin(a) * 0.5, 0.07, 5, "#5f9fa4", "#a6d5cb", { z0: 3 });
        }
        scene.custom(30, (ctx) => {
          const center = project(1.15, 1.45, 30);
          const rim = Array.from({ length: 16 }, (_, n) => {
            const angle = n * Math.PI / 8;
            return project(1.15 + Math.cos(angle) * 0.8, 1.45, 30 + Math.sin(angle) * 23);
          });
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#607c8e";
          for (const x of [0.6, 1.7]) {
            const foot = project(x, 1.45, 1);
            ctx.beginPath(); ctx.moveTo(...foot); ctx.lineTo(...center); ctx.stroke();
          }
          if (animatedBase) return;
          ctx.strokeStyle = "#f6e6b9";
          ctx.beginPath();
          rim.forEach((point, n) => n ? ctx.lineTo(...point) : ctx.moveTo(...point));
          ctx.closePath(); ctx.stroke();
          for (let n = 0; n < rim.length; n += 2) {
            ctx.beginPath(); ctx.moveTo(...center); ctx.lineTo(...rim[n]); ctx.stroke();
            ctx.fillStyle = ["#e16b57", "#53aeb4", "#efbd45", "#8b85bb"][n / 2 % 4];
            ctx.fillRect(rim[n][0] - 3, rim[n][1], 6, 5);
          }
        });
        break;
      case "residentialtower":
        scene.box(0.25, 0.25, 2.75, 2.75, 12, "#b4c7cc", "#dee8e6", { windows: true });
        scene.box(0.65, 0.65, 2.35, 2.35, 58, "#7cabb8", "#b7d6da", { z0: 12, windows: true, floors: true });
        scene.box(1, 1, 2, 2, 24, "#91bcc5", "#d1e5e8", { z0: 70, windows: true, floors: true });
        scene.antenna(1.5, 1.5, 94, 8);
        trees(3);
        break;
      case "skylineapartments":
        scene.box(0.2, 0.2, 3.8, 3.8, 12, "#b4b7aa", "#ddd6be", { windows: true });
        scene.box(0.6, 0.6, 1.75, 1.8, 94, "#91afb1", "#d2e0d7", { z0: 12, windows: true, floors: true });
        scene.box(2.1, 1.85, 3.45, 3.3, 112, "#91afb1", "#d2e0d7", { z0: 12, windows: true, floors: true });
        for (const z of [28, 46, 64, 82, 100]) scene.box(0.55, 0.55, 1.8, 1.85, 1.5, "#c2c6b5", "#e6ddc4", { z0: z });
        for (const z of [28, 46, 64, 82, 100, 118]) scene.box(2.05, 1.8, 3.5, 3.35, 1.5, "#c2c6b5", "#e6ddc4", { z0: z });
        scene.box(0.85, 0.85, 1.5, 1.55, 10, "#77949b", "#bcd2ce", { z0: 106, windows: true });
        scene.box(2.4, 2.15, 3.15, 3, 10, "#77949b", "#bcd2ce", { z0: 124, windows: true });
        face([[0.4, 2.2, 12.2], [1.6, 2.2, 12.2], [1.6, 3.4, 12.2], [0.4, 3.4, 12.2]], "#71915b", 20);
        scene.tree(0.75, 2.7, 3); scene.tree(1.25, 3.2, 3);
        break;
      case "officeskyscraper":
        scene.box(0.25, 0.25, 3.75, 3.75, 12, "#8d9da4", "#c7d2d0", { windows: true });
        scene.box(0.85, 0.85, 3.15, 3.15, 105, "#5f899d", "#a7cbd3", { z0: 12, windows: true, floors: true });
        scene.box(1.05, 1.05, 2.95, 2.95, 15, "#648c9f", "#bbd9de", { z0: 117, windows: true });
        scene.box(1.45, 1.45, 2.55, 2.55, 7, "#849ea9", "#d5e2de", { z0: 132 });
        for (const x of [1.35, 1.95, 2.55]) line([[x, 3.16, 14], [x, 3.16, 116]], "#bdd7dc", 0.7, 30);
        for (const y of [1.35, 1.95, 2.55]) line([[3.16, y, 14], [3.16, y, 116]], "#789dac", 0.7, 30);
        scene.antenna(2, 2, 139, 22);
        scene.box(1.4, 3.45, 2.6, 3.85, 9, "#517c91", "#a8c9d0");
        scene.tree(0.35, 3.6, 3); scene.tree(3.65, 0.35, 3);
        break;
      case "supertall":
        scene.box(0.2, 0.2, 3.8, 3.8, 14, "#9a9ca5", "#d4d2cb", { windows: true });
        scene.box(1, 1, 3, 3, 104, "#698799", "#aec6d0", { z0: 14, windows: true, floors: true });
        scene.box(1.25, 1.25, 2.75, 2.75, 18, "#728b9c", "#bed0d6", { z0: 118, windows: true });
        scene.box(1.5, 1.5, 2.5, 2.5, 12, "#859ca9", "#d3dce0", { z0: 136, windows: true });
        scene.box(1.75, 1.75, 2.25, 2.25, 8, "#bdaf83", "#eddbac", { z0: 148 });
        scene.antenna(2, 2, 156, 12);
        for (const x of [1.35, 1.75, 2.15, 2.55]) line([[x, 3.01, 16], [x, 3.01, 117]], "#bdd0d7", 0.65, 30);
        scene.box(1.25, 3.4, 2.75, 3.85, 11, "#6d8595", "#d0c4a5");
        face([[0.4, 2.4, 14.2], [0.85, 2.4, 14.2], [0.85, 3.5, 14.2], [0.4, 3.5, 14.2]], "#7b9661", 20);
        face([[3.15, 0.4, 14.2], [3.6, 0.4, 14.2], [3.6, 1.5, 14.2], [3.15, 1.5, 14.2]], "#7b9661", 20);
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
  const active = (city, type) => [...city.structs.values()].filter((building) => {
    if (building.type !== type) return false;
    const def = BUILDINGS.find((item) => item.type === type);
    const size = def?.size || 1;
    const rDist = structRoadDist(city, building, size);
    const idx = city.idx(building.x, building.y);
    if (city.roadDist[idx] > rDist) city.roadDist[idx] = rDist;
    return city.powered[idx] && (!def?.requiresRoad || rDist !== 255);
  }).length;
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
