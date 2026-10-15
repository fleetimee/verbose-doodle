(() => {
  let definitions, messages, renderBuilding, renderTool;
  const items = new Map();
  const copy = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const translated = key => {
    const pair = messages[key];
    return pair ? pair[document.documentElement.lang === "fr" ? 0 : 1] : "";
  };
  const number = value => new Intl.NumberFormat(document.documentElement.lang, { maximumFractionDigits: 2 }).format(value);
  const money = value => new Intl.NumberFormat(document.documentElement.lang, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
  const name = tool => translated(`struct.${tool}`) || translated(`tool.${tool}`) || items.get(tool)?.name || items.get(tool)?.label || tool;
  const toolIcons = {
    road: ["road:10:0000"], highway: ["hwy:10:0000"], rail: ["grass:0000:0", "rail:10:0000"],
    doubleRail: ["grass:0000:0", "compactrail:x:0.23:0.23:0000"], highspeedRail: ["grass:0000:0", "hsrail:10:0000"],
    elevatedLrt: ["grass:0000:0", "lrtrail:10:0000"], wire: ["grass:0000:0", "wire:10:0000"],
    res: ["bld:3:1:2"], com: ["bld:4:2:0"], ind: ["bld:5:2:0"],
  };
  function install(buildings, translations, render, toolRender) { definitions = buildings; messages = translations; renderBuilding = render; renderTool = toolRender; }
  function register(button, tool, item) {
    items.set(tool, item);
    const pair = messages[`struct.${tool}`] ?? messages[`tool.${tool}`];
    window.__townHelpTopics[`item:${tool}`] = { title: pair ? [pair[1], pair[0]] : [item.name || item.label, item.name || item.label], body: ["", ""] };
    button.dataset.townHelp = `item:${tool}`;
  }
  const guides = {
    res: ["Homes provide residents who support shops and work in commercial or industrial buildings. New zones grow gradually; drawing more housing does not create residents immediately. Higher tiers hold more people but require stronger infrastructure and larger connected footprints.", "Les logements accueillent les habitants qui fréquentent les commerces et travaillent dans les commerces ou industries. Les zones se développent progressivement. Les niveaux élevés accueillent davantage de personnes mais exigent de meilleures infrastructures et des blocs reliés plus grands."],
    com: ["Commercial buildings provide jobs and serve your population. Demand depends on how many residents need shops compared with existing commercial employment. Build alongside growing neighborhoods rather than covering the map with empty shops.", "Les commerces créent des emplois et desservent la population. La demande dépend des besoins des habitants face aux emplois commerciaux existants. Accompagnez la croissance des quartiers plutôt que de multiplier les zones vides."],
    ind: ["Ordinary industrial zoning grows automatically and provides jobs without requiring a resource deposit. Keep transport links to homes, and leave separation from housing because industrial pollution reduces nearby land value and can block higher residential tiers.", "L’industrie ordinaire se développe automatiquement et crée des emplois sans gisement. Reliez-la aux logements et éloignez-la des habitations : la pollution réduit la valeur foncière et peut bloquer les niveaux résidentiels élevés."],
    road: ["Roads connect homes, jobs, facilities, and freight. Zones can develop within 12 tile steps of a road or highway, but the network must actually connect the places people need to reach. Parallel road pairs can become a divided corridor with a planted median.", "Les routes relient logements, emplois, installations et fret. Les zones se développent à 12 cases maximum d’une voie, mais le réseau doit réellement relier leurs destinations. Deux routes parallèles peuvent former un axe séparé avec terre-plein planté."],
    highway: ["Highways offer four times ordinary road capacity and a faster route. Nearby zones use the same 12-tile access reach as roads. Add connections at useful locations: a disconnected highway cannot carry workers between separate districts.", "Les autoroutes offrent quatre fois la capacité routière et des trajets plus rapides. Leur portée d’accès reste de 12 cases. Ajoutez des liaisons utiles : une autoroute isolée ne relie pas les quartiers."],
    wire: ["Power lines extend the electricity network; generation capacity alone does not power disconnected buildings. Use the power map to find gaps. Along ordinary double track, poles can occupy the narrow middle strip while remaining functional power lines.", "Les lignes étendent le réseau électrique ; une capacité suffisante n’alimente pas les bâtiments isolés. Consultez la carte électrique. Sur une double voie ordinaire, les poteaux peuvent occuper la bande centrale tout en transportant l’électricité."],
    rail: ["Ordinary rail serves passenger trains and freight. Place Rail stations beside railway and road access for passenger connections. Freight terminals connect railway to local road districts. The network must be continuous; visually close but disconnected ends do not transfer traffic.", "Le rail ordinaire transporte voyageurs et fret. Placez des gares près des voies et des routes. Les terminaux relient le rail aux quartiers routiers. Le réseau doit être continu : des extrémités proches mais non reliées ne transfèrent rien."],
    doubleRail: ["This tool lays two ordinary railway tracks inside each tile, like highway lanes. Trains use separate lanes for opposite directions. A new tile costs $50; upgrading existing ordinary rail costs $25. Plant trees or bushes, or lay power lines, in the center strip. Drag a second double-track line at a right angle to turn a corner; the corner tile becomes a shared turnout. Use ordinary Railway for bridges and highway overpasses.", "Cet outil trace deux voies ordinaires dans chaque case, comme les voies d’autoroute. Les trains utilisent des voies distinctes selon leur direction. Une case coûte 50 $, une amélioration du rail ordinaire 25 $. Plantez ou posez des lignes électriques au centre. Tracez une seconde double voie à angle droit pour tourner : la case d’angle devient un aiguillage partagé. Utilisez Voie ferrée pour les ponts et passages d’autoroute."],
    highspeedRail: ["A dedicated ground-level passenger network with five-car, white-and-blue Shinkansen-style trains. It stays separate from ordinary rail and freight. Build at least 12 connected tiles and add a powered High-speed station with road access. Its faster train animation does not change passenger route costs.", "Réseau voyageurs au sol avec rames rapides blanc et bleu de cinq voitures, distinct du rail ordinaire et du fret. Construisez au moins 12 cases reliées et une gare dédiée alimentée et accessible par route. L’animation plus rapide ne modifie pas le coût des trajets."],
    elevatedLrt: ["A raised urban passenger railway on piers, above road and highway traffic. Match it with an Elevated LRT station whose platforms sit at deck height. At least 12 connected tiles and a powered, road-connected matching station are needed to show a light-rail train.", "Réseau urbain voyageurs sur piliers, au-dessus de la circulation. Utilisez une station de métro léger dont les quais sont au niveau du viaduc. Une rame apparaît avec au moins 12 cases reliées et une station correspondante alimentée et accessible par route."],
    query: ["Inspect a tile before spending money. The query box explains connections, utilities, development progress, and local surroundings. Each help icon expands the meaning of its row and suggests what to improve.", "Inspectez une case avant de dépenser. Les détails expliquent connexions, services, progression et environnement. Les icônes d’aide détaillent chaque ligne et les améliorations possibles."],
    bulldoze: ["Clears the selected tiles so they can be reused. Inspect the footprint first: clearing a shared infrastructure tile can remove its road, rail, and power line together, and removing the only connection can stop nearby buildings. Construction and demolition are immediate expenses.", "Libère les cases sélectionnées. Vérifiez l’emprise : supprimer une case partagée peut retirer route, rail et ligne électrique ensemble. Couper la seule liaison peut arrêter les bâtiments voisins. Construction et démolition se paient immédiatement."],
    raise: ["Raises terrain. Preview the affected area and cost before applying it. Changing height can make a future building footprint uneven, so finish terrain preparation before laying out streets and large buildings.", "Relève le terrain. Vérifiez zone et coût dans l’aperçu. Un changement de hauteur peut rendre une emprise irrégulière ; préparez le relief avant les rues et grands bâtiments."],
    lower: ["Lowers terrain. Use the preview to check surrounding changes and constraints. Water edges and occupied land can restrict editing; avoid cutting a slope through an intended flat building site.", "Abaisse le terrain. L’aperçu montre les changements et contraintes. Rives et terrains occupés peuvent limiter les travaux ; préservez les surfaces destinées aux bâtiments."],
    level: ["Flattens an area for construction. Large buildings and merged high-tier zones need a flat footprint at one elevation. Review the full highlighted area and price, not only the tile under the pointer.", "Aplanit une zone. Grands bâtiments et zones fusionnées exigent une emprise plane à une même altitude. Vérifiez toute la surface surlignée et son coût."],
  };
  const categories = {
    power: ["Generation supplies the city only through a connected electrical network. Compare output, pollution, and recurring upkeep before expanding. Check both total capacity and the power map: a city can have surplus generation while individual districts remain disconnected.", "La production alimente la ville via un réseau électrique relié. Comparez puissance, pollution et entretien. Vérifiez capacité totale et carte électrique : un excédent ne garantit pas que tous les quartiers soient raccordés."],
    water: ["Water infrastructure supports development beyond low density. Coverage is local, so a well-supplied city can still have dry tiles. Combine facilities to close gaps, supply their electricity, and inspect the water overlay before zoning for higher tiers.", "Les installations d’eau permettent de dépasser la faible densité. La couverture est locale : certaines cases peuvent manquer d’eau malgré un bon total municipal. Combinez les installations, fournissez l’électricité et consultez la carte de l’eau."],
    service: ["Services improve conditions within their operating reach. Placement, power, and department funding matter; building a facility alone does not guarantee strong service at every tile. Query a served neighborhood and compare its local conditions with the service map.", "Les services améliorent les conditions dans leur portée. Emplacement, électricité et financement comptent ; construire ne garantit pas une bonne desserte partout. Inspectez les quartiers et comparez-les à la carte du service."],
    park: ["Recreation can improve neighborhood appeal and land value. Benefits depend on the particular attraction and its operating conditions. Spread destinations where residents can reach them, and check utilities or transport requirements before paying for a large site.", "Les loisirs peuvent améliorer attractivité et valeur foncière. Les bénéfices dépendent de l’équipement et de ses conditions d’activité. Répartissez les destinations accessibles et vérifiez services et transports avant un grand projet."],
    transport: ["Transport facilities support connected travel and trade. Their effect depends on the surrounding network, not simply on being present in the city. Keep road access and required utilities working, and inspect the connected districts when a facility appears idle.", "Les transports soutiennent déplacements et échanges grâce aux réseaux reliés. Leur présence seule ne suffit pas. Maintenez accès routier et services, puis inspectez les quartiers desservis si l’installation paraît inactive."],
    reward: ["A milestone building adds its listed city benefit after it is unlocked and placed. It still occupies land and may consume power or incur recurring upkeep. Plan its footprint and connections before claiming the site.", "Un bâtiment de palier apporte l’effet indiqué après déblocage et placement. Il occupe du terrain et peut consommer de l’électricité ou coûter en entretien. Préparez son emprise et ses connexions."],
  };
  const partners = {
    res: ["com", "ind", "tower", "park"], com: ["res", "road", "park"], ind: ["res", "road", "freightterminal"],
    rail: ["station", "freightterminal", "road"], doubleRail: ["station", "landscape_smalltree", "wire"],
    highspeedRail: ["highspeedstation", "road", "wind"], highspeedstation: ["highspeedRail", "road", "wind"],
    elevatedLrt: ["lrtstation", "road", "wind"], lrtstation: ["elevatedLrt", "road", "wind"],
    station: ["rail", "road", "bus"], bus: ["road", "station", "res"],
    coalmine: ["steelmill", "coal", "freightterminal"], ironmine: ["steelmill", "coalmine", "freightterminal"],
    coppermine: ["goodsfactory", "steelmill", "freightterminal"], steelmill: ["coalmine", "ironmine", "goodsfactory"],
    goodsfactory: ["steelmill", "coppermine", "freightterminal"], freightterminal: ["rail", "road", "goodsfactory"],
    pump: ["wire", "tower", "wind"], tower: ["pump", "wire", "res"], coal: ["coalmine", "wire", "road"],
    road: ["res", "com", "ind"], highway: ["road", "bus", "freightterminal"], wire: ["wind", "tower", "res"],
  };
  function recommendations(tool, def) {
    if (partners[tool]) return partners[tool];
    if (def.needsShuttle) return ["shuttledock", "road", "wind"];
    if (tool.startsWith("landscape_")) return ["doubleRail", "road", "park"];
    if (def.category === "power") return ["wire", "res", "tower"];
    if (def.category === "service") return ["res", "wire", "road"];
    return ["road", "wind", "park"].filter(item => item !== tool);
  }
  function reason(source, target) {
    if (source === "coal" && target === "coalmine" || source === "coalmine" && target === "coal") return copy("Connected local coal can reduce the plant’s upkeep by up to 40%.", "Le charbon local relié peut réduire l’entretien de la centrale jusqu’à 40 %.");
    if (source === "doubleRail" && target.startsWith("landscape_")) return copy("Plant the narrow strip between ordinary parallel tracks.", "Plantez la bande centrale entre les voies ordinaires.");
    if (source === "doubleRail" && target === "wire") return copy("Place working power poles in the middle strip.", "Placez des poteaux électriques fonctionnels au centre.");
    if (target === "highspeedRail" || target === "elevatedLrt" || target === "highspeedstation" || target === "lrtstation") return copy("Matching track and station are required for this passenger system.", "Voie et station correspondantes sont requises pour ce réseau voyageurs.");
    if (target === "coalmine" || target === "ironmine" || target === "coppermine") return copy("Supplies a raw material used by the connected processing chain.", "Fournit une matière première à la chaîne de transformation reliée.");
    if (target === "steelmill") return copy("Converts coal and iron into steel for downstream factories.", "Transforme charbon et fer en acier pour les usines en aval.");
    if (target === "goodsfactory") return copy("Uses steel and copper to produce manufactured goods.", "Utilise acier et cuivre pour produire des biens manufacturés.");
    if (target === "freightterminal") return copy("Links road districts to ordinary rail and provides export capacity.", "Relie les quartiers routiers au rail ordinaire et offre une capacité d’export.");
    if (target === "rail" || target === "station") return copy("Connect ordinary passenger rail; terminals can also use ordinary rail for freight.", "Reliez le réseau voyageurs ordinaire ; les terminaux utilisent aussi ce rail pour le fret.");
    if (target === "res") return copy("Provides residents who can work in jobs and support local destinations.", "Accueille les habitants qui travaillent et fréquentent les destinations locales.");
    if (target === "com" || target === "ind") return copy("Developed buildings provide jobs for connected residents.", "Les bâtiments développés créent des emplois pour les habitants reliés.");
    if (target === "wind" || target === "wire") return copy("Supply electricity and connect required utilities to the site.", "Fournissez l’électricité et raccordez les services nécessaires.");
    if (target === "tower" || target === "pump") return copy("Extend water coverage for nearby growth and facilities that need it.", "Étendez l’eau pour la croissance et les installations qui en ont besoin.");
    if (target === "park") return copy("Improve nearby appeal and land value; this does not replace utilities or demand.", "Améliorez attractivité et valeur foncière sans remplacer services ni demande.");
    if (target === "shuttledock") return copy("Connects offshore leisure destinations to an operating shuttle route.", "Relie les loisirs au large à une navette en activité.");
    return copy("Connect the site to a usable transport network and nearby destinations.", "Reliez le site à un réseau utilisable et aux destinations voisines.");
  }
  function preview(tool, pixels = 140) {
    if (definitions[tool]) return renderBuilding(tool, pixels);
    return toolIcons[tool] ? renderTool(toolIcons[tool], pixels) : items.get(tool)?.icon?.() ?? null;
  }
  function get(tool) {
    const def = definitions[tool] ?? {}, item = items.get(tool) ?? {};
    const industry = window.__industry?.byType[tool];
    const facts = [], add = (en, fr, value) => { if (value !== undefined) facts.push([copy(en, fr), value]); };
    add("Construction", "Construction", def.cost !== undefined ? money(def.cost) : undefined);
    add("Base monthly upkeep", "Entretien mensuel de base", def.upkeep !== undefined ? money(def.upkeep) : undefined);
    add("Footprint", "Emprise", def.size ? `${def.size} × ${def.size}` : undefined);
    if (def.unlockPop) add("Unlocks at peak population", "Population maximale requise", number(def.unlockPop));
    const lock = window.__ui?.handlers.lockReason(tool);
    add("Availability", "Disponibilité", lock || copy("Available", "Disponible"));
    add("Base electricity use", "Consommation électrique de base", def.consumes ? `${number(def.consumes)} MW` : undefined);
    add("Power generation", "Production électrique", def.power ? `${number(def.power)} MW` : undefined);
    add("Coverage radius", "Rayon de couverture", def.radius ? copy(`${number(def.radius)} tiles`, `${number(def.radius)} cases`) : undefined);
    add("Residents", "Habitants", def.pop ? number(def.pop) : undefined);
    add("Jobs", "Emplois", (def.industryJobs || def.jobs) ? number(def.industryJobs || def.jobs) : undefined);
    add("Recreation strength", "Intensité des loisirs", def.fun ? number(def.fun) : undefined);
    add("Power connection reach", "Portée du raccordement électrique", def.powerRange ? copy(`${number(def.powerRange)} tiles`, `${number(def.powerRange)} cases`) : undefined);
    add("Pollution source", "Source de pollution", def.pollution ? number(def.pollution) : undefined);
    if (!definitions[tool] && (item.meta || item.cost)) add("Placement cost", "Coût de placement", item.meta || item.cost);
    const requirements = [];
    if (def.size) requirements.push(def.waterOnly ? copy("Place the entire footprint on water.", "Placez toute l’emprise sur l’eau.") : def.onWater ? copy("Can be placed on suitable land or water; check the footprint preview.", "Peut se placer sur terre ou sur l’eau ; vérifiez l’emprise.") : copy("Clear a flat footprint at one ground elevation.", "Libérez une emprise plane à la même altitude."));
    if (def.needsShore) requirements.push(copy("Requires a shoreline location.", "Nécessite un emplacement sur la rive."));
    if (def.requiresRoad || industry) requirements.push(copy("Keep a working road connection to the footprint.", "Maintenez un accès routier à l’emprise."));
    if (def.consumes) requirements.push(copy("Connect the footprint to a powered electrical network.", "Reliez l’emprise à un réseau électrique alimenté."));
    if (def.needsShuttle) requirements.push(copy("Needs an operating shuttle dock and a clear water route.", "Nécessite un quai de navette en activité et un itinéraire aquatique libre."));
    if (industry && !industry.exportCapacity) requirements.push(copy("Requires local water supply as well as road access and power.", "Nécessite eau, route et électricité."));
    if (industry?.deposit) requirements.push(copy("Place near the matching non-exhausted resource deposit; use Show deposits to find it.", "Placez près du gisement correspondant non épuisé ; affichez les gisements pour le repérer."));
    if (["station", "highspeedstation", "lrtstation"].includes(tool)) requirements.push(copy("Place beside the matching railway and a road at the same ground elevation.", "Placez près du rail correspondant et d’une route, à la même altitude du sol."));
    if (tool === "highspeedRail" || tool === "elevatedLrt") requirements.push(copy("Flat land only; no water routes or slopes. Different rail systems require separate tiles.", "Terrain plat uniquement, sans eau ni pentes. Les réseaux ferroviaires nécessitent des cases distinctes."));
    const description = translated(`struct.${tool}.desc`) || translated(`tool.${tool}.desc`) || item.desc || "";
    let guide = guides[tool] ? copy(...guides[tool]) : categories[def.category] ? copy(...categories[def.category]) : copy("Use the placement preview to check the full footprint, cost, and any restrictions. Query the completed item to inspect its local conditions and connections.", "Vérifiez emprise, coût et contraintes dans l’aperçu. Inspectez ensuite l’élément construit pour connaître son état et ses connexions.");
    if (industry) guide = copy("This facility belongs to the resource economy. Materials move through connected roads or ordinary freight rail. Keep suppliers connected and check inventory before adding more production. Exports reserve two days of processing inputs before selling surplus.", "Cette installation appartient à l’économie des ressources. Les matériaux circulent par routes reliées ou fret ferroviaire ordinaire. Vérifiez fournisseurs et stocks avant d’augmenter la production. Les exports réservent deux jours d’intrants avant de vendre le surplus.");
    const recipe = values => Object.entries(values ?? {}).map(([resource, amount]) => `${number(amount)} ${window.__industry.resources[resource].name[document.documentElement.lang === "fr" ? 0 : 1]}`).join(" + ");
    if (industry?.input) add("Inputs per day", "Intrants par jour", recipe(industry.input));
    if (industry?.output) add("Output per day", "Production par jour", recipe(industry.output));
    if (industry?.exportCapacity) add("Export capacity per day", "Capacité d’export par jour", number(industry.exportCapacity));
    return { title: name(tool), description, guide, facts, requirements,
      tips: copy("Construction spends funds immediately; recurring upkeep continues while the city runs. Check the preview for the final price and unlock state. Companion suggestions below are useful combinations, not additional mandatory requirements.", "Construire dépense immédiatement des fonds ; l’entretien continue pendant la simulation. Vérifiez prix final et déblocage dans l’aperçu. Les suggestions ci-dessous sont des associations utiles, pas des obligations supplémentaires."),
      companions: recommendations(tool, def).filter(other => other !== tool && (definitions[other] || toolIcons[other] || items.has(other))).map(other => ({ tool: other, name: name(other), reason: reason(tool, other), locked: (window.__city?.maxPop ?? 0) < (definitions[other]?.unlockPop ?? 0) })) };
  }
  window.__townItemHelp = { install, register, get, preview };
})();
