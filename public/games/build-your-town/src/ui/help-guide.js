(() => {
  const copy = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const step = (id, title, intro, lines, rows, action, label, note) => ({ id, title, intro, lines, rows, action, label, note });
  const item = (sprite, size, en, fr) => ({ sprite, size, label: copy(en, fr) });
  function screens() {
    const road = () => item("road:10:0000", 1, "Road access", "Accès routier");
    const homes = () => item("bld:3:2:2", 1, "Homes", "Logements");
    const industry = () => item("bld:5:2:0", 1, "Jobs", "Emplois");
    const power = () => item("st:wind", 1, "Electricity", "Électricité");
    const coal = () => item("st:coalmine", 3, "Coal", "Charbon");
    const iron = () => item("st:ironmine", 3, "Iron ore", "Minerai de fer");
    const copper = () => item("st:coppermine", 3, "Copper ore", "Minerai de cuivre");
    const steel = () => item("st:steelmill", 4, "Steel", "Acier");
    const goods = () => item("st:goodsfactory", 4, "Goods", "Produits");
    const touch = matchMedia("(pointer: coarse)").matches;
    return [
      step("start", copy("Build your first neighborhood", "Créez votre premier quartier"),
        copy("Start small. Give homes a road, electricity, and nearby jobs.", "Commencez petit : une route, de l’électricité et des emplois près des logements."), [
          copy("Lay a road or highway. Zone residential land for homes and industrial land for jobs within 12 tiles of the network.", "Tracez une route ou une autoroute. Zonez des logements et des industries à 12 cases maximum du réseau."),
          copy("Build a power plant and connect it with power lines. Add water as your neighborhood grows.", "Construisez une centrale et raccordez-la avec des lignes électriques. Ajoutez l’eau à mesure que le quartier grandit."),
          copy("Run at 1× and let buildings develop. Select a lot with the magnifier to see its progress and what it needs.", "Reprenez à 1× pour laisser les bâtiments se développer. Sélectionnez un terrain avec la loupe pour voir sa progression et ses besoins."),
        ], [[road(), power(), homes()]], "res", copy("Choose residential zoning", "Choisir les logements"),
        copy("Ordinary industrial zones provide starter jobs. Mines and factories are optional specializations you can add later.", "Les zones industrielles ordinaires fournissent les premiers emplois. Mines et usines sont des spécialisations à ajouter ensuite.")),
      step("move", copy("Move around your town", "Déplacez-vous dans la ville"),
        copy("Explore the map without changing what you have built.", "Explorez la carte sans modifier vos constructions."), [
          touch ? copy("Drag with one finger to move. Pinch with two fingers to zoom.", "Glissez un doigt pour déplacer la vue. Pincez avec deux doigts pour zoomer.") : copy("Pan with right-drag, middle-drag, Space + drag, or the arrow keys. Scroll the mouse wheel to zoom.", "Déplacez la vue avec le clic droit ou central, Espace + glisser, ou les flèches. La molette règle le zoom."),
          copy("Select a spot on the minimap to jump there. Use its + and − buttons for precise zoom steps.", "Choisissez un endroit sur la mini-carte pour vous y rendre. Ses boutons + et − règlent précisément le zoom."),
          copy("Use the play/pause and speed controls to stop time or run at 1×, 2×, or 4×. The sun button changes viewing light only.", "Utilisez lecture/pause et les vitesses 1×, 2× ou 4×. Le bouton soleil change uniquement l’éclairage de la vue."),
        ], [[homes(), industry(), item("st:park", 1, "Explore", "Explorez")]], "query", copy("Explore with the magnifier", "Explorer avec la loupe")),
      step("build", copy("Place buildings and draw networks", "Construisez et tracez vos réseaux"),
        copy("Choose a tool, check the preview, then build.", "Choisissez un outil, vérifiez l’aperçu, puis construisez."), [
          touch ? copy("Choose a tool in the bottom bar. Press and hold, then drag to draw roads, zones, or power lines.", "Choisissez un outil en bas. Maintenez l’appui puis glissez pour tracer routes, zones ou lignes électriques.") : copy("Choose a tool on the left. Drag to draw roads, zones, or power lines; click to place a building.", "Choisissez un outil à gauche. Glissez pour tracer routes, zones ou lignes électriques ; cliquez pour poser un bâtiment."),
          copy("Open a tool group to choose a building. A red preview explains why the location is blocked, such as occupied land or uneven ground.", "Ouvrez un groupe pour choisir un bâtiment. Un aperçu rouge indique un emplacement bloqué : terrain occupé, pente ou autre contrainte."),
          touch ? copy("For buildings, hold and drag to adjust the position, then release to place. Tap the active tool again to return to the magnifier.", "Pour un bâtiment, maintenez et glissez pour le positionner, puis relâchez. Touchez à nouveau l’outil actif pour revenir à la loupe.") : copy("Press Escape or select the active tool again to return to the magnifier. Roads become bridges when you draw across water.", "Appuyez sur Échap ou sélectionnez à nouveau l’outil actif pour revenir à la loupe. Une route tracée sur l’eau devient un pont."),
        ], [[road(), item("zone:3", 1, "Zone land", "Zonez"), homes()]], "road", copy("Choose roads", "Choisir les routes")),
      step("utilities", copy("Connect electricity and water", "Raccordez l’électricité et l’eau"),
        copy("A building needs a working connection, not just a nearby utility.", "Un bâtiment doit être raccordé à un service en fonctionnement."), [
          copy("Connect power plants to neighborhoods with power lines or adjoining powered buildings. Electricity can cross one road tile.", "Reliez les centrales aux quartiers par des lignes ou des bâtiments alimentés voisins. Le courant peut franchir une case de route."),
          copy("Place a powered water tower inland or a pump on the shore. Water reaches the surrounding tiles; no pipes are needed.", "Placez un château d’eau alimenté à terre ou une pompe sur la rive. L’eau dessert les cases voisines, sans canalisations."),
          copy("Select a utility to see its network or coverage. If growth stops, inspect the affected lot and check road access, power, and water.", "Sélectionnez un service pour voir son réseau ou sa portée. Si la croissance s’arrête, inspectez le terrain : route, courant et eau."),
        ], [[power(), item("st:tower", 1, "Water coverage", "Couverture d’eau"), homes()]], "tower", copy("Choose a water tower", "Choisir un château d’eau")),
      step("growth", copy("Help neighborhoods grow", "Faites grandir les quartiers"),
        copy("Demand brings development. Good connections let it continue.", "La demande lance le développement ; les raccordements permettent de le poursuivre."), [
          copy("Read the R, C, and I bars: residential, commercial, and industrial demand. Add the type your town needs.", "Lisez les barres R, C et I : demande de logements, commerces et industries. Ajoutez ce dont la ville a besoin."),
          copy("The magnifier shows each lot’s next-tier progress and any blocker. Road or highway access within 12 tiles, jobs or workers, power, and demand are essential; tier 3 and above also need water.", "La loupe montre la progression et les blocages. Un accès routier ou autoroutier à 12 cases maximum, des emplois ou travailleurs, du courant et de la demande sont essentiels ; l’eau est aussi requise dès le niveau 3."),
          copy("Leave room for larger buildings: tier 4 needs a flat 2×2 block of tier-3 lots; tier 5 needs a 3×3 block of tier-4 lots.", "Gardez de la place : le niveau 4 exige un bloc plat de 2×2 terrains de niveau 3 ; le niveau 5, un bloc de 3×3 terrains de niveau 4."),
        ], [[item("bld:3:1:2", 1, "First homes", "Premiers logements"), item("bld:3:2:2", 1, "Developing", "Développement"), item("bld:3:3:2", 1, "Denser homes", "Logements plus denses")]], "query", copy("Inspect a lot", "Inspecter un terrain")),
      step("mining", copy("Find deposits and start mining", "Trouvez des gisements et extrayez"),
        copy("Coal, iron, and copper come from specific places on your map.", "Le charbon, le fer et le cuivre se trouvent à des endroits précis de la carte."), [
          copy("Choose Industrial, then ordinary zoning, a coal mine, an iron mine, or a copper mine. Use the factory-outline ledger button to show deposits.", "Choisissez Industriel, puis une zone ordinaire ou une mine de charbon, de fer ou de cuivre. Le bouton en forme d’usine ouvre la carte des gisements."),
          copy("Place the matching mine on a deposit and provide road access, electricity, and water. Its output enters the local freight network each game hour.", "Placez la mine sur le bon gisement et fournissez route, courant et eau. Sa production rejoint le réseau de fret local à chaque heure de jeu."),
          copy("Deposits are finite. Mines stop when the deposit is exhausted or storage is full. Keep polluting facilities away from homes.", "Les gisements sont limités. Une mine s’arrête si le gisement est épuisé ou le stock plein. Éloignez les installations polluantes des logements."),
        ], [[coal(), iron(), copper()]], "industry", copy("Open resources and deposits", "Ouvrir les ressources et gisements"),
        copy("At full capacity: coal 24/day, iron 20/day, copper 12/day. These are game days, not real-world days.", "À pleine capacité : 24 charbons/jour, 20 fers/jour, 12 cuivres/jour. Il s’agit de jours de jeu.")),
      step("processing", copy("Turn raw materials into goods", "Transformez les matières premières"),
        copy("Connect suppliers and processors to the same freight network.", "Reliez les fournisseurs et les usines au même réseau de fret."), [
          copy("A steel mill uses 12 coal + 16 iron ore to make 12 steel per game day at full capacity.", "À pleine capacité, une aciérie consomme 12 charbons + 16 minerais de fer pour produire 12 aciers par jour de jeu."),
          copy("A goods factory uses 8 steel + 6 copper ore to make 10 goods per game day. Both processors need road access, power, and water.", "Une usine consomme 8 aciers + 6 minerais de cuivre pour produire 10 produits par jour. Les deux usines ont besoin d’une route, de courant et d’eau."),
          copy("Inspect a facility to see stored materials and why production is waiting. A nearby supplier on a disconnected road cannot deliver.", "Inspectez une installation pour voir son stock et les raisons d’un arrêt. Un fournisseur proche mais sur une route déconnectée ne peut pas livrer."),
        ], [[coal(), iron(), steel()], [steel(), copper(), goods()]], "industry", copy("Review production and stocks", "Vérifier la production et les stocks")),
      step("freight", copy("Deliver supplies and sell surplus", "Livrez et vendez le surplus"),
        copy("Roads connect your industries. Freight access turns spare stock into income.", "Les routes relient vos industries. Un accès au fret transforme le surplus en recettes."), [
          copy("Cargo trucks show transfers on connected roads and highways. Container and bulk freight trains serve rail links between operating terminals or seaports.", "Les camions montrent les transferts sur les routes et autoroutes reliées. Les trains de conteneurs ou de vrac relient les terminaux ou ports actifs près des rails."),
          copy("Exports need a freight terminal, an operating seaport, or a road reaching the map edge. Connected processors keep two days of inputs before surplus is sold.", "Les exports nécessitent un terminal, un port actif ou une route jusqu’au bord de la carte. Les usines reliées gardent deux jours d’intrants avant la vente du surplus."),
          copy("Goods and steel sell first. Export income settles at midnight. Local coal can also reduce a connected coal power plant’s upkeep by up to 40%.", "Produits et acier sont vendus en priorité. Les recettes sont versées à minuit. Le charbon local réduit aussi jusqu’à 40 % l’entretien d’une centrale à charbon reliée."),
        ], [[goods(), item("st:freightterminal", 3, "Freight access", "Accès au fret"), item("income", 1, "Export income", "Recettes d’export")]], "industry", copy("Review freight connections", "Vérifier les raccordements de fret"),
        copy("Daily export limits: terminal 48 units, seaport 96, map-edge road network 24. Each facility stores up to 240 units of each resource.", "Limites d’export par jour : terminal 48 unités, port 96, réseau routier au bord de la carte 24. Chaque installation stocke jusqu’à 240 unités par ressource.")),
      step("money", copy("Keep your budget healthy", "Gardez un budget équilibré"),
        copy("Watch the monthly forecast before committing to more construction.", "Vérifiez les prévisions mensuelles avant de construire davantage."), [
          copy("Select your funds to open Budget. Compare tax and industry income with upkeep, service funding, and loan interest.", "Sélectionnez vos fonds pour ouvrir le budget. Comparez recettes fiscales et industrielles à l’entretien, aux services et aux intérêts."),
          copy("The budget shows monthly estimates. Income and costs accrue during the day and settle at midnight; exporting more changes the forecast.", "Le budget affiche des estimations mensuelles. Recettes et dépenses s’accumulent puis sont réglées à minuit ; les exports modifient les prévisions."),
          copy("Use the Journal for trends and advice. Six consecutive months below your difficulty’s bankruptcy threshold end the game.", "Consultez le journal pour suivre les tendances et conseils. Six mois consécutifs sous le seuil de faillite de la difficulté mettent fin à la partie."),
        ], [[homes(), industry(), item("st:cityhall", 2, "Monthly budget", "Budget mensuel")]], "budget", copy("Open budget", "Ouvrir le budget")),
      step("care", copy("Keep your town safe—and saved", "Protégez et sauvegardez votre ville"),
        copy("Add services as you grow, and check problems where they happen.", "Ajoutez des services en grandissant et inspectez les problèmes sur place."), [
          copy("Parks, schools, hospitals, police, and fire stations support neighborhoods. Inspect them to check coverage and operating conditions.", "Parcs, écoles, hôpitaux, police et pompiers soutiennent les quartiers. Inspectez-les pour vérifier leur portée et leur fonctionnement."),
          copy("Use the minimap’s map button to inspect pollution, crime, traffic, and utilities. If a disaster damages a connection, repair access before expanding.", "Le bouton cartes de la mini-carte révèle pollution, criminalité, trafic et services. Après une catastrophe, réparez les raccordements avant de vous agrandir."),
          copy("Your city saves automatically. Use My cities and the save import/export controls to manage towns and backups. Reopen Help whenever you need a reminder.", "La ville se sauvegarde automatiquement. Utilisez Mes villes et l’import/export pour gérer villes et sauvegardes. L’aide reste disponible à tout moment."),
        ], [[item("st:park", 1, "Parks", "Parcs"), item("st:fire", 2, "Emergency services", "Secours"), item("st:hospital", 3, "Healthy neighborhoods", "Quartiers sains")]], "query", copy("Return to your town", "Revenir à la ville")),
    ];
  }

  function bind(ui, sprite) {
    const help = document.getElementById("help"), dialog = help.querySelector(".tutorial");
    const title = document.getElementById("help-title"), body = help.querySelector(".body");
    const list = document.getElementById("help-list"), picture = document.getElementById("help-pic");
    const previous = document.getElementById("help-prev"), next = document.getElementById("help-next");
    let opener, city, previousSpeed = 0, open = false, paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current;
    const node = (tag, text, className) => {
      const el = document.createElement(tag);
      if (text !== undefined) el.textContent = text;
      if (className) el.className = className;
      return el;
    };
    dialog.classList.add("town-guide"); dialog.setAttribute("aria-labelledby", "help-title");
    title.setAttribute("aria-live", "polite");
    document.getElementById("help-close").setAttribute("aria-label", copy("Close help", "Fermer l’aide"));
    const toolbar = node("div", undefined, "guide-toolbar");
    const topicLabel = node("label", copy("Help topic", "Rubrique d’aide")); topicLabel.htmlFor = "help-topic";
    const topics = node("select"); topics.id = "help-topic";
    screens().forEach((screen, index) => { const option = node("option", screen.title); option.value = String(index); topics.append(option); });
    const status = node("p", copy("Your town is paused while you read. These demos do not change your city.", "La ville est en pause pendant la lecture. Ces démonstrations ne la modifient pas."), "guide-status");
    toolbar.append(topicLabel, topics, status); dialog.insertBefore(toolbar, body);
    const intro = node("p", "", "guide-intro"), note = node("p", "", "guide-note");
    const controls = node("div", undefined, "guide-demo-controls");
    const toggle = node("button"); toggle.type = "button";
    const replay = node("button", copy("Replay", "Revoir")); replay.type = "button";
    controls.append(toggle, replay);
    const action = node("button", "", "guide-action"); action.type = "button";
    body.replaceChildren(intro, picture, controls, list, note, action);
    picture.setAttribute("aria-hidden", "true");
    document.getElementById("help-dots").hidden = true;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    function motionState() {
      help.classList.toggle("guide-paused", paused);
      toggle.textContent = reduced.matches ? copy("Static demo · reduced motion", "Démo fixe · mouvements réduits") : paused ? copy("Play demo", "Animer la démo") : copy("Pause demo", "Mettre la démo en pause");
      toggle.disabled = reduced.matches;
      toggle.setAttribute("aria-pressed", String(!paused && !reduced.matches));
      replay.disabled = reduced.matches;
    }
    function renderDemo() {
      const fragment = document.createDocumentFragment();
      for (const [rowIndex, row] of current.rows.entries()) {
        const line = node("div", undefined, "guide-demo-row");
        row.forEach((entry, index) => {
          if (index) {
            const connector = node("span", undefined, "guide-connector");
            const combining = current.id === "processing" && index === 1;
            connector.textContent = combining ? "+" : "→";
            if (!combining && !["mining", "move", "care"].includes(current.id)) connector.append(node("i", undefined, "guide-cargo"));
            line.append(connector);
          }
          const figure = node("div", undefined, "guide-model");
          figure.classList.add(`guide-model-${index}`);
          let artwork;
          if (entry.sprite === "income") {
            artwork = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            artwork.setAttribute("viewBox", "0 0 112 112"); artwork.setAttribute("fill", "none");
            artwork.setAttribute("stroke", "currentColor"); artwork.setAttribute("stroke-width", "3");
            const path = document.createElementNS(artwork.namespaceURI, "path");
            path.setAttribute("d", "M22 42h64v36H22zM28 34h64v36M34 26h64v36M54 48a12 12 0 1 0 0 24 12 12 0 0 0 0-24M30 52h6m36 16h6");
            artwork.append(path);
          } else artwork = sprite([entry.sprite], entry.size, 112, 1.25);
          artwork.classList.add("guide-sprite");
          figure.append(artwork, node("span", entry.label));
          if (current.id === "mining") figure.append(node("i", undefined, "guide-yield"));
          line.append(figure);
        });
        line.dataset.row = String(rowIndex); fragment.append(line);
      }
      picture.replaceChildren(fragment);
      picture.dataset.lesson = current.id;
      controls.hidden = current.id === "care";
      motionState();
    }
    function show(index) {
      const all = screens(); ui.helpIndex = Math.max(0, Math.min(all.length - 1, index)); current = all[ui.helpIndex];
      title.textContent = current.title; intro.textContent = current.intro;
      list.replaceChildren(...current.lines.map(text => node("li", text)));
      note.textContent = current.note ?? ""; note.hidden = !current.note;
      action.textContent = current.label;
      topics.value = String(ui.helpIndex);
      previous.textContent = copy("Back", "Précédent"); previous.disabled = ui.helpIndex === 0;
      next.textContent = ui.helpIndex === all.length - 1 ? copy("Done", "Terminer") : copy("Next", "Suivant");
      document.getElementById("help-step").textContent = `${ui.helpIndex + 1} / ${all.length}`;
      body.scrollTop = 0; renderDemo();
    }
    function finish() {
      if (!open) return;
      open = false; picture.replaceChildren();
      if (window.__city === city && !city?.bankrupt && !window.__townStartScreen?.isHome()) ui.handlers.onSpeed(previousSpeed);
      const canRestore = opener?.isConnected && opener.matches("button, select, input, a[href], [tabindex]") && opener.getClientRects().length && !opener.closest("[hidden]");
      const target = canRestore ? opener : document.getElementById("btn-game-menu") ?? document.getElementById("btn-help");
      target?.focus({ preventScroll: true });
    }
    function close() { help.hidden = true; finish(); }
    ui.tutorialScreens = screens;
    ui.showHelp = show;
    ui.openHelp = () => {
      if (open) return;
      opener = document.activeElement; city = window.__city;
      previousSpeed = Number(document.querySelector("#speed button.active")?.dataset.speed ?? 0);
      ui.closePanels(); ui.handlers.onSpeed(0); open = true;
      help.hidden = false; show(0); document.getElementById("help-close").focus();
    };
    document.getElementById("btn-help").addEventListener("click", () => ui.openHelp());
    document.getElementById("help-close").addEventListener("click", close);
    previous.addEventListener("click", () => show(ui.helpIndex - 1));
    next.addEventListener("click", () => ui.helpIndex === screens().length - 1 ? close() : show(ui.helpIndex + 1));
    topics.addEventListener("change", () => show(Number(topics.value)));
    toggle.addEventListener("click", () => { paused = !paused; motionState(); });
    replay.addEventListener("click", () => { paused = false; renderDemo(); });
    reduced.addEventListener("change", () => { paused = reduced.matches; motionState(); });
    action.addEventListener("click", () => {
      const target = current.action; close();
      if (target === "industry") {
        ui.closePanels(); document.getElementById("btn-industry")?.click();
      } else if (target === "budget") {
        ui.openPanel("panel-budget"); document.getElementById("tax")?.focus();
      } else {
        ui.handlers.onTool(target, false);
        const button = ui.toolButtons.get(target) ?? [...ui.groupButtons.values()].find(group => group.items.some(item => item.tool === target))?.button;
        button?.scrollIntoView({ block: "nearest", inline: "nearest" }); button?.focus({ preventScroll: true });
      }
    });
    help.addEventListener("click", event => { if (event.target === help) close(); });
    help.addEventListener("keydown", event => {
      event.stopPropagation();
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key === "Tab") {
        const buttons = [...dialog.querySelectorAll("button:not(:disabled), select")].filter(el => el.getClientRects().length);
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (event.target.tagName === "SELECT") return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault(); show(ui.helpIndex + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    new MutationObserver(() => { if (help.hidden) finish(); }).observe(help, { attributes: true, attributeFilter: ["hidden"] });
    document.addEventListener("visibilitychange", () => { help.classList.toggle("guide-background", document.hidden); });
  }
  window.__townHelp = { bind };
})();
