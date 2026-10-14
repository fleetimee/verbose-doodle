(() => {
  // Planet Zoo / Planet Coaster Style Career Scenario Mode for Build Your Town
  // Pre-built narrative challenge maps with Bronze 🥉, Silver 🥈, Gold 🥇 medals

  const SCENARIOS = [
    {
      id: "quake_recovery",
      name: {
        en: "After the Quake",
        fr: "Après le séisme",
      },
      tag: {
        en: "Disaster Recovery",
        fr: "Secours d'urgence",
      },
      difficulty: "Intermediate",
      diffColor: "#f2c14e",
      icon: "🌋",
      seed: 190672,
      mapKind: "coast",
      cityName: "Bayview 1906",
      desc: {
        en: "A magnitude 7.2 earthquake has crippled the coastal city of Bayview! Fractured roads, damaged electrical grids, and rubble block emergency services. Rebuild the shattered city into a proud metropolis.",
        fr: "Un séisme de magnitude 7,2 a frappé la ville côtière de Bayview ! Routes éventrées, décombres et coupures électriques paralysent la cité. Reconstruisez une métropole fière de ses cendres.",
      },
      setup: (city) => {
        city.money = 12000;
      },
      bronze: {
        title: {
          en: "Clear the Wreckage",
          fr: "Déblayer les ruines",
        },
        desc: {
          en: "Extinguish all active fires and bulldoze rubble to stabilize the core.",
          fr: "Éteignez tous les feux et nettoyez les décombres pour sécuriser la ville.",
        },
        check: (c) => {
          const burning = c.burning || 0;
          let rubbleCount = 0;
          if (c.overlay) {
            for (let i = 0; i < c.count; i++) {
              if (c.overlay[i] === 8) rubbleCount++; // 8 is b.Rubble
            }
          }
          const ok = burning === 0 && rubbleCount === 0;
          return {
            done: ok,
            label: burning > 0 ? `Fires active: ${burning}` : `Rubble remaining: ${rubbleCount}`,
          };
        },
      },
      silver: {
        title: {
          en: "Essential Lifelines",
          fr: "Services vitaux",
        },
        desc: {
          en: "Construct a Fire Station and Hospital, with 100% stable electrical supply.",
          fr: "Construisez une caserne et un hôpital, avec un réseau électrique stable.",
        },
        check: (c) => {
          const fire = countNewStructures(c, ["fire"]) >= 1;
          const hosp = countNewStructures(c, ["hospital"]) >= 1;
          const powOk = (c.power?.supply || 0) >= (c.power?.demand || 0) && (c.power?.demand || 0) > 0;
          const ok = fire && hosp && powOk;
          return {
            done: ok,
            label: `Fire: ${fire ? "✓" : "✗"} | Hospital: ${hosp ? "✓" : "✗"} | Power: ${powOk ? "✓" : "✗"}`,
          };
        },
      },
      gold: {
        title: {
          en: "The Renaissance",
          fr: "La Renaissance",
        },
        desc: {
          en: "Add 1,000 residents and reach at least 4,000 residents with a positive monthly balance.",
          fr: "Gagnez 1 000 habitants pour atteindre au moins 4 000 habitants avec un budget mensuel positif.",
        },
        check: (c) => {
          const pop = c.stats?.pop || 0;
          const b = c.lastBudget;
          let net = 0;
          if (b) {
            const inc = (b.taxR || 0) + (b.taxC || 0) + (b.taxI || 0);
            const exp =
              (b.roads || 0) +
              (b.power || 0) +
              (b.water || 0) +
              (b.police || 0) +
              (b.fire || 0) +
              (b.education || 0) +
              (b.health || 0) +
              (b.parks || 0) +
              (b.transport || 0) +
              (b.ordinances || 0) +
              (b.interest || 0);
            net = Math.round(inc - exp);
          }
          const ok = pop >= Math.max(4000, (scenarioBaseline?.pop || 0) + 1000) && net > 0;
          return {
            done: ok,
            label: `${pop.toLocaleString()} / ${Math.max(4000, (scenarioBaseline?.pop || 0) + 1000).toLocaleString()} pop | Net: ${net >= 0 ? "+" : ""}${net}$/mo`,
          };
        },
      },
    },
    {
      id: "debt_crisis",
      name: {
        en: "Bailout Bay",
        fr: "Crise de la dette",
      },
      tag: {
        en: "Financial Turnaround",
        fr: "Redressement financier",
      },
      difficulty: "Advanced",
      diffColor: "#e0392b",
      icon: "💸",
      seed: 440219,
      mapKind: "river",
      cityName: "Oakhaven Debt",
      desc: {
        en: "The former mayor plunged Oakhaven into -$6,000 of debt with a crippling monthly deficit! If the debt breaches -$10,000, bankruptcy is declared. Turn this sinking ship around before time runs out.",
        fr: "L'ancien maire a plongé Oakhaven dans une dette de -6 000 $ avec un lourd déficit ! Si la dette atteint -10 000 $, la faillite sonne. Redressez les comptes avant qu'il ne soit trop tard.",
      },
      setup: (city) => {
        city.money = -6000;
        city.taxRate = 4;
      },
      bronze: {
        title: {
          en: "Stop the Bleeding",
          fr: "Stopper l'hémorragie",
        },
        desc: {
          en: "Achieve a positive monthly balance (above $0/month) to halt the deficit.",
          fr: "Atteignez un solde mensuel positif (au-dessus de 0 $/mois) pour arrêter les pertes.",
        },
        check: (c) => {
          const b = c.lastBudget;
          if (!b || (scenarioBaseline && c.year * 12 + c.month <= scenarioBaseline.month)) {
            return { done: false, label: "Awaiting the first monthly balance..." };
          }
          const inc = (b.taxR || 0) + (b.taxC || 0) + (b.taxI || 0);
          const exp =
            (b.roads || 0) +
            (b.power || 0) +
            (b.water || 0) +
            (b.police || 0) +
            (b.fire || 0) +
            (b.education || 0) +
            (b.health || 0) +
            (b.parks || 0) +
            (b.transport || 0) +
            (b.ordinances || 0) +
            (b.interest || 0);
          const net = Math.round(inc - exp);
          const ok = net > 0;
          return {
            done: ok,
            label: ok ? `In the black! (+${net} $/mo)` : `Current: ${net} $/mo`,
          };
        },
      },
      silver: {
        title: {
          en: "Out of the Red",
          fr: "Sortir du rouge",
        },
        desc: {
          en: "Pay off all municipal debt and accumulate at least +$10,000 in treasury funds.",
          fr: "Remboursez toutes les dettes et atteignez au moins +10 000 $ de trésorerie.",
        },
        check: (c) => {
          const m = c.money || 0;
          const ok = m >= 10000;
          return {
            done: ok,
            label: `$${Math.round(m).toLocaleString()} / $10,000 savings`,
          };
        },
      },
      gold: {
        title: {
          en: "Prosperity Unleashed",
          fr: "Prospérité retrouvée",
        },
        desc: {
          en: "Add 1,500 residents and reach at least 3,500 residents with City Hall erected and $25,000 saved.",
          fr: "Gagnez 1 500 habitants pour atteindre au moins 3 500 habitants avec l'Hôtel de ville érigé et 25 000 $ en réserve.",
        },
        check: (c) => {
          const pop = c.stats?.pop || 0;
          const money = c.money || 0;
          const structs = c.structs ? [...c.structs.values()] : [];
          const hasHall = structs.some((s) => s.type === "cityhall");
          const ok = pop >= Math.max(3500, (scenarioBaseline?.pop || 0) + 1500) && money >= 25000 && hasHall;
          return {
            done: ok,
            label: `${pop.toLocaleString()}/${Math.max(3500, (scenarioBaseline?.pop || 0) + 1500).toLocaleString()} pop | $${Math.round(money).toLocaleString()}/$25k | Hall: ${hasHall ? "✓" : "✗"}`,
          };
        },
      },
    },
    {
      id: "smog_to_green",
      name: {
        en: "Smog to Green",
        fr: "Du smog à la ville verte",
      },
      tag: {
        en: "Ecological Overhaul",
        fr: "Transition écologique",
      },
      difficulty: "Intermediate",
      diffColor: "#3fb34f",
      icon: "🏭",
      seed: 881033,
      mapKind: "mountain",
      cityName: "Blackwood Green",
      desc: {
        en: "Blackwood was founded around choking coal generators and filthy factories right next to homes. Thick smog blankets the streets and citizens are falling ill. Transform this industrial nightmare into a clean, green garden city.",
        fr: "Blackwood a grandi autour de centrales à charbon crachant leur fumée sur les maisons. Un smog épais étouffe les rues. Métamorphosez ce quartier noirci en une cité-jardin exemplaire.",
      },
      setup: (city) => {
        city.money = 15000;
      },
      bronze: {
        title: {
          en: "Green Lungs",
          fr: "Poumons verts",
        },
        desc: {
          en: "Build 3 additional small or large parks to filter air around residential neighborhoods.",
          fr: "Posez 3 parcs supplémentaires pour aérer les quartiers résidentiels.",
        },
        check: (c) => {
          const parks = countNewStructures(c, ["park", "bigpark"]);
          const ok = parks >= 3;
          return {
            done: ok,
            label: `${parks} / 3 parks constructed`,
          };
        },
      },
      silver: {
        title: {
          en: "Clean Power Transition",
          fr: "Transition énergétique",
        },
        desc: {
          en: "Build new wind, solar, geothermal, nuclear, or fusion power and maintain full electrical coverage.",
          fr: "Ajoutez de l'éolien, du solaire, de la géothermie, du nucléaire ou de la fusion avec zéro panne.",
        },
        check: (c) => {
          const hasClean = countNewStructures(c, ["wind", "solarfarm", "geothermal", "nuclear", "fusion"]) >= 1;
          const powOk = (c.power?.supply || 0) >= (c.power?.demand || 0) && (c.power?.demand || 0) > 0;
          const ok = hasClean && powOk;
          return {
            done: ok,
            label: `Clean Power: ${hasClean ? "✓" : "✗"} | Supply: ${powOk ? "Stable" : "Deficit"}`,
          };
        },
      },
      gold: {
        title: {
          en: "Eco-Metropolis",
          fr: "Éco-mégalopole",
        },
        desc: {
          en: "Achieve over 80% running water coverage, grow population by 2,000 to at least 5,000, and maintain a positive monthly balance.",
          fr: "Alimentez plus de 80 % de la ville en eau, gagnez 2 000 habitants pour atteindre au moins 5 000 habitants et gardez des comptes sains.",
        },
        check: (c) => {
          const water = Math.round((c.stats?.waterShare || 0) * 100);
          const pop = c.stats?.pop || 0;
          const net = monthlyBalance(c);
          const ok = water >= 80 && pop >= Math.max(5000, (scenarioBaseline?.pop || 0) + 2000) && net > 0;
          return {
            done: ok,
            label: `Water: ${water}% / 80% | Pop: ${pop.toLocaleString()} / ${Math.max(5000, (scenarioBaseline?.pop || 0) + 2000).toLocaleString()} | Net: ${net}$/mo`,
          };
        },
      },
    },
    {
      id: "island_transit",
      name: {
        en: "Archipelago Links",
        fr: "Liaisons insulaires",
      },
      tag: {
        en: "Transit Mastery",
        fr: "Défi transports",
      },
      difficulty: "Expert",
      diffColor: "#5fd7de",
      icon: "🏝️",
      seed: 512994,
      mapKind: "islands",
      cityName: "Coral Archipelago",
      desc: {
        en: "Citizens on Coral Isle are isolated across open waterways. Workers cannot reach jobs on neighboring islands, causing economic standstill. Construct an ambitious bridge, rail, and ferry network to unite the islands.",
        fr: "Les habitants de Coral Isle sont coupés les uns des autres par l'eau. Les travailleurs ne peuvent pas rejoindre leurs emplois. Bâtissez un réseau ambitieux de ponts, rails et ports pour unir l'archipel.",
      },
      setup: (city) => {
        city.money = 25000;
      },
      bronze: {
        title: {
          en: "Island Bridges",
          fr: "Ponts maritimes",
        },
        desc: {
          en: "Build 40 additional road and bridge tiles to link the central islands together.",
          fr: "Construisez 40 cases supplémentaires de routes et ponts pour relier les îles centrales.",
        },
        check: (c) => {
          const roads = Math.max(0, (c.stats?.roads || 0) - (scenarioBaseline?.roads || 0));
          const ok = roads >= 40;
          return {
            done: ok,
            label: `${roads} / 40 road/bridge tiles`,
          };
        },
      },
      silver: {
        title: {
          en: "Island Commuter Rail",
          fr: "Ligne ferroviaire insulaire",
        },
        desc: {
          en: "Build a Train Station and 20 additional rail tiles.",
          fr: "Construisez une gare ferroviaire et 20 cases de rails supplémentaires.",
        },
        check: (c) => {
          const hasStation = countNewStructures(c, ["station"]) >= 1;
          const rails = Math.max(0, (c.stats?.rails || 0) - (scenarioBaseline?.rails || 0));
          const ok = hasStation && rails >= 20;
          return {
            done: ok,
            label: `Station: ${hasStation ? "✓" : "✗"} | Rails: ${rails} / 20`,
          };
        },
      },
      gold: {
        title: {
          en: "Maritime Trade Capital",
          fr: "Capitale du commerce maritime",
        },
        desc: {
          en: "Construct a Commercial Seaport, grow population by 2,500 to at least 6,000, and amass $40,000.",
          fr: "Construisez un port de commerce, gagnez 2 500 habitants pour atteindre au moins 6 000 habitants et amassez 40 000 $.",
        },
        check: (c) => {
          const hasPort = countNewStructures(c, ["port"]) >= 1;
          const pop = c.stats?.pop || 0;
          const money = c.money || 0;
          const ok = hasPort && pop >= Math.max(6000, (scenarioBaseline?.pop || 0) + 2500) && money >= 40000;
          return {
            done: ok,
            label: `Seaport: ${hasPort ? "✓" : "✗"} | Pop: ${pop.toLocaleString()}/${Math.max(6000, (scenarioBaseline?.pop || 0) + 2500).toLocaleString()} | Funds: $${Math.round(money).toLocaleString()}/$40k`,
          };
        },
      },
    },
  ];

  let activeScenario = null;
  let scenarioCity = null;
  let scenarioBaseline = null;
  let scenarioReady = true;
  let runMedals = {};
  let hudCollapsed = false;

  const countNewStructures = (city, types) => {
    const structs = city.structs ? [...city.structs.values()] : [];
    return structs.filter((s) => types.includes(s.type) &&
      !scenarioBaseline?.structs.includes(`${s.type}:${s.x}:${s.y}`)).length;
  };

  const monthlyBalance = (city) => {
    const b = city.lastBudget;
    if (!b) return 0;
    return Math.round((b.taxR || 0) + (b.taxC || 0) + (b.taxI || 0) -
      ["roads", "power", "water", "police", "fire", "education", "health",
        "parks", "transport", "ordinances", "interest"].reduce((sum, key) => sum + (b[key] || 0), 0));
  };

  const captureBaseline = (city) => ({
    month: city.year * 12 + city.month,
    pop: city.stats?.pop || 0,
    roads: city.stats?.roads || 0,
    rails: city.stats?.rails || 0,
    structs: [...city.structs.values()].map((s) => `${s.type}:${s.x}:${s.y}`),
  });

  const syncScenario = () => {
    if (window.__townStartScreen?.isHome()) return;
    const key = localStorage.getItem("citybuilder.current");
    const scenario = SCENARIOS.find((s) => key === `scenario_${s.id}`) || null;
    if (scenario === activeScenario && scenarioCity === window.__city) return;
    activeScenario = scenario;
    scenarioCity = window.__city;
    scenarioBaseline = null;
    runMedals = {};
    scenarioReady = true;
    if (scenario) {
      const saved = JSON.parse(localStorage.getItem(`citybuilder.scenarioRun.${scenario.id}`) || "null");
      scenarioBaseline = saved?.baseline || captureBaseline(window.__city);
      runMedals = saved?.medals || {};
      saveRun();
    }
    window.dispatchEvent(new CustomEvent("citybuilder-scenario-change"));
  };

  const saveRun = () => {
    localStorage.setItem(`citybuilder.scenarioRun.${activeScenario.id}`,
      JSON.stringify({ baseline: scenarioBaseline, medals: runMedals }));
  };
  let scenarioMedals = {}; // { scenarioId: { bronze: bool, silver: bool, gold: bool } }

  const getLang = () => {
    try {
      const l = localStorage.getItem("citybuilder.lang");
      if (l === "fr" || l === "en") return l;
    } catch {}
    return document.documentElement.lang === "en" ? "en" : "fr";
  };

  const loadMedals = () => {
    try {
      const raw = localStorage.getItem("citybuilder.scenarios.medals");
      if (raw) scenarioMedals = JSON.parse(raw);
    } catch {
      scenarioMedals = {};
    }
  };

  const saveMedals = () => {
    try {
      localStorage.setItem("citybuilder.scenarios.medals", JSON.stringify(scenarioMedals));
    } catch {}
  };

  // Launch a Pre-Built Scenario
  const startScenario = (scenario) => {
    if (!window.__City || !window.__buildTown || !window.__startCity) {
      alert("Game engine loading, please try in a moment.");
      return;
    }

    // 1. Generate base city
    const seed = scenario.seed;
    const kind = scenario.mapKind || "coast";
    const city = window.__City.generate(seed, scenario.cityName, scenario.id === "island_transit" ? "difficile" : scenario.id === "debt_crisis" ? "facile" : "moyen", kind);

    // 2. Pre-build town infrastructure using the engine's built-in generator
    window.__buildTown(city, { years: 6, size: 50, mode: "mixed" });

    // 3. Apply scenario specific starting balance & hazards
    activeScenario = scenario;
    scenarioReady = scenario.id !== "quake_recovery";
    hudCollapsed = false;
    scenarioBaseline = captureBaseline(city);
    runMedals = {};
    saveRun();
    scenario.setup(city);
    // The simulated prehistory must not carry a loss into a fresh scenario.
    city.bankrupt = false;
    city.brokeMonths = 0;
    city.log = city.log.filter(entry => entry.key !== "log.bankrupt" && entry.key !== "advice.bankruptSoon");

    // 4. Set as active city in the game
    const key = `scenario_${scenario.id}`;
    localStorage.removeItem(`citybuilder.missions.${key}`);
    window.__startCity(city, key);
    if (scenario.id === "quake_recovery") {
      window.__triggerDisaster("quake");
      window.__triggerDisaster("fire");
      scenarioReady = true;
      // Persist the damaged starting city rather than the intact generated town.
      window.__startCity(city, key);
    }
    scenarioCity = city;

    window.dispatchEvent(new CustomEvent("citybuilder-scenario-change"));
    try {
      localStorage.setItem("citybuilder.activeScenario", scenario.id);
    } catch {}

    // Close scenario modal
    const modal = document.getElementById("modal-scenarios");
    if (modal) modal.hidden = true;

    // Toast
    const lang = getLang();
    const title = scenario.name[lang] || scenario.name.en;
    if (window.__ui?.toast) {
      window.__ui.toast(`🏆 Scenario: ${title} launched! Check your objectives.`, "good", {
        ms: 5000,
      });
    }

    renderHUD();
    window.__scenarioGuide?.showBriefing(scenario, lang);
  };

  // Check medal achievements
  const evaluateActiveScenario = () => {
    if (window.__townStartScreen?.isHome()) return;
    syncScenario();
    if (!activeScenario || !scenarioReady) return;
    const city = window.__city;
    if (!city) return;
    if (scenarioBaseline && city.year * 12 + city.month <= scenarioBaseline.month) return;

    const id = activeScenario.id;
    if (!scenarioMedals[id]) {
      scenarioMedals[id] = { bronze: false, silver: false, gold: false };
    }

    const m = runMedals;
    let newlyEarned = null;

    // 1. Bronze
    if (!m.bronze) {
      const res = activeScenario.bronze.check(city);
      if (res.done) {
        m.bronze = true;
        newlyEarned = "🥉 Bronze Medal";
      }
    }

    // 2. Silver
    if (!m.silver && m.bronze) {
      const res = activeScenario.silver.check(city);
      if (res.done) {
        m.silver = true;
        newlyEarned = "🥈 Silver Medal";
      }
    }

    // 3. Gold
    if (!m.gold && m.silver) {
      const res = activeScenario.gold.check(city);
      if (res.done) {
        m.gold = true;
        newlyEarned = "🥇 Gold Medal Mastery!";
      }
    }

    if (newlyEarned) {
      scenarioMedals[id] = {
        bronze: scenarioMedals[id].bronze || m.bronze,
        silver: scenarioMedals[id].silver || m.silver,
        gold: scenarioMedals[id].gold || m.gold,
      };
      saveRun();
      saveMedals();
      if (m.gold) window.dispatchEvent(new CustomEvent("citybuilder-scenario-change"));
      renderHUD();
      try {
        window.dispatchEvent(new CustomEvent("citybuilder-milestone"));
      } catch {}
      if (window.__ui?.toast) {
        window.__ui.toast(`🎉 ${newlyEarned} Achieved in ${activeScenario.name[getLang()] || activeScenario.name.en}!`, "good", {
          ms: 7000,
        });
      }
    }
  };

  // Render the Scenario Tracker HUD in game
  const renderHUD = () => {
    let hud = document.getElementById("scenario-hud");
    if (!activeScenario) {
      if (hud) hud.hidden = true;
      return;
    }

    const city = window.__city;
    if (!city) return;

    if (!hud) {
      hud = document.createElement("div");
      hud.id = "scenario-hud";
      document.body.appendChild(hud);
    }

    hud.hidden = false;
    const lang = getLang();
    const id = activeScenario.id;
    const m = runMedals;

    const bRes = activeScenario.bronze.check(city);
    const sRes = activeScenario.silver.check(city);
    const gRes = activeScenario.gold.check(city);

    const markup = `
      <div class="hud-header">
        <div class="hud-title">
          <span class="hud-icon">${activeScenario.icon}</span>
          <strong>${activeScenario.name[lang] || activeScenario.name.en}</strong>
        </div>
        <button type="button" class="hud-toggle" id="hud-toggle-btn" aria-controls="hud-body-content" aria-expanded="${!hudCollapsed}" aria-label="${lang === "fr" ? "Afficher ou masquer les objectifs" : "Expand or collapse objectives"}">${hudCollapsed ? "▲" : "▼"}</button>
      </div>
      <div class="hud-body" id="hud-body-content" ${hudCollapsed ? "hidden" : ""}>
        <section id="scenario-next-action" aria-label="${lang === "fr" ? "Prochaine action" : "Next action"}"></section>
        <div class="hud-medal ${m.bronze ? "done" : ""}">
          <span class="medal-icon">🥉</span>
          <div class="medal-info">
            <span class="medal-name">${activeScenario.bronze.title[lang] || activeScenario.bronze.title.en}</span>
            <small>${scenarioReady ? bRes.label : "Preparing disaster recovery..."}</small>
          </div>
        </div>
        <div class="hud-medal ${m.silver ? "done" : ""}">
          <span class="medal-icon">🥈</span>
          <div class="medal-info">
            <span class="medal-name">${activeScenario.silver.title[lang] || activeScenario.silver.title.en}</span>
            <small>${sRes.label}</small>
          </div>
        </div>
        <div class="hud-medal ${m.gold ? "done" : ""}">
          <span class="medal-icon">🥇</span>
          <div class="medal-info">
            <span class="medal-name">${activeScenario.gold.title[lang] || activeScenario.gold.title.en}</span>
            <small>${gRes.label}</small>
          </div>
        </div>
      </div>
    `;

    const focusedId = hud.contains(document.activeElement) ? document.activeElement.id : null;
    if (hud.dataset.markup !== markup) {
      hud.innerHTML = markup;
      hud.dataset.markup = markup;
    }
    window.__scenarioGuide?.render(activeScenario, city, {
      medals: runMedals,
      baseline: scenarioBaseline,
      countNew: countNewStructures,
    }, lang);
    if (focusedId) document.getElementById(focusedId)?.focus({ preventScroll: true });

    document.getElementById("hud-toggle-btn").onclick = () => {
      const content = document.getElementById("hud-body-content");
      if (content) {
        hudCollapsed = !hudCollapsed;
        content.hidden = hudCollapsed;
        document.getElementById("hud-toggle-btn").textContent = content.hidden ? "▲" : "▼";
        document.getElementById("hud-toggle-btn").setAttribute("aria-expanded", String(!hudCollapsed));
      }
    };
  };

  // Build the Scenario Selection Browser Modal
  const openScenarioBrowser = () => {
    let modal = document.getElementById("modal-scenarios");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-scenarios";
      modal.className = "modal";
      document.body.appendChild(modal);
    }

    const lang = getLang();
    loadMedals();

    modal.innerHTML = `
      <div class="tutorial scenarios-dialog" role="dialog" aria-modal="true">
        <div class="head">
          <h2>🏆 <span data-i18n="scenarios.title">Scénarios & Défis de Carrière</span></h2>
          <button type="button" class="ghost close" id="scenarios-close">✕</button>
        </div>
        <div class="body scenarios-body">
          <p class="scenarios-intro">
            ${
              lang === "fr"
                ? "Prenez les rênes de villes pré-construites confrontées à des défis uniques. Rétablissez les comptes, reconstruisez après un séisme ou transformez une cité polluée pour décrocher les médailles de Bronze 🥉, Argent 🥈 et Or 🥇 !"
                : "Take charge of pre-built cities facing unique crises! Balance broken budgets, rebuild from devastating earthquakes, or conquer island logistics to earn Bronze 🥉, Silver 🥈, and Gold 🥇 medals."
            }
          </p>
          <div class="scenarios-grid" id="scenarios-grid"></div>
        </div>
      </div>
    `;

    const grid = modal.querySelector("#scenarios-grid");
    SCENARIOS.forEach((s) => {
      const id = s.id;
      const medals = scenarioMedals[id] || { bronze: false, silver: false, gold: false };

      const card = document.createElement("div");
      card.className = "scenario-card";

      card.innerHTML = `
        <div class="sc-card-top">
          <div class="sc-header-left">
            <span class="sc-icon">${s.icon}</span>
            <div>
              <h3>${s.name[lang] || s.name.en}</h3>
              <span class="sc-tag" style="border-color:${s.diffColor};color:${s.diffColor}">${s.tag[lang] || s.tag.en}</span>
              <small>${s.difficulty}</small>
            </div>
          </div>
          <div class="sc-medals-earned">
            <span class="m-icon ${medals.bronze ? "lit" : "dim"}">🥉</span>
            <span class="m-icon ${medals.silver ? "lit" : "dim"}">🥈</span>
            <span class="m-icon ${medals.gold ? "lit" : "dim"}">🥇</span>
          </div>
        </div>
        <p class="sc-desc">${s.desc[lang] || s.desc.en}</p>
        <div class="sc-objectives">
          <div class="sc-obj"><span class="m-dot">🥉</span> <span>${s.bronze.title[lang] || s.bronze.title.en}</span></div>
          <div class="sc-obj"><span class="m-dot">🥈</span> <span>${s.silver.title[lang] || s.silver.title.en}</span></div>
          <div class="sc-obj"><span class="m-dot">🥇</span> <span>${s.gold.title[lang] || s.gold.title.en}</span></div>
        </div>
        <div class="sc-foot">
          <button type="button" class="primary sc-launch-btn">
            ${lang === "fr" ? "Lancer le scénario ▶" : "Launch Scenario ▶"}
          </button>
        </div>
      `;

      card.querySelector(".sc-launch-btn").addEventListener("click", () => {
        startScenario(s);
      });

      grid.appendChild(card);
    });

    modal.hidden = false;
    modal.querySelector("#scenarios-close").addEventListener("click", () => {
      modal.hidden = true;
    });
  };

  // Inject Styles
  const injectStyles = () => {
    if (document.getElementById("scenarios-style")) return;
    const style = document.createElement("style");
    style.id = "scenarios-style";
    style.textContent = `
      #btn-scenarios {
        position: relative;
        font-family: inherit;
        font-size: 15px;
        padding: 0 10px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      #modal-scenarios {
        z-index: 12;
      }
      .scenarios-dialog {
        max-width: 820px;
        width: min(820px, 95vw);
        max-height: 85vh;
        background: linear-gradient(180deg, #1b2338 0%, #141a28 100%);
        border: 2px solid var(--accent, #f2c14e);
        border-radius: 16px;
        box-shadow: 0 12px 50px rgba(0, 0, 0, 0.75);
        display: flex;
        flex-direction: column;
      }
      .scenarios-body {
        overflow-y: auto;
        padding: 16px 22px 24px;
      }
      .scenarios-intro {
        margin: 0 0 16px;
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--muted, #a8b0c2);
      }
      .scenarios-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 14px;
      }
      .scenario-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: all 0.2s ease;
      }
      .scenario-card:hover {
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.05);
      }
      .sc-card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .sc-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .sc-icon {
        font-size: 28px;
      }
      .sc-header-left h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 800;
        color: var(--text, #fff);
      }
      .sc-tag {
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        border: 1px solid;
        border-radius: 5px;
        padding: 1px 5px;
        display: inline-block;
        margin-top: 2px;
      }
      .sc-medals-earned {
        display: flex;
        gap: 2px;
        font-size: 16px;
      }
      .m-icon.dim {
        opacity: 0.2;
        filter: grayscale(1);
      }
      .m-icon.lit {
        opacity: 1;
        filter: drop-shadow(0 0 4px rgba(242, 193, 78, 0.6));
      }
      .sc-desc {
        margin: 0;
        font-size: 12px;
        line-height: 1.45;
        color: var(--muted, #a8b0c2);
      }
      .sc-objectives {
        background: rgba(0, 0, 0, 0.25);
        border-radius: 8px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 11.5px;
      }
      .sc-obj {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text, #e2e8f0);
      }
      .sc-launch-btn {
        width: 100%;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
      }

      /* Scenario HUD Widget */
      #scenario-hud {
        position: fixed;
        top: 54px;
        right: 12px;
        z-index: 8;
        background: rgba(20, 26, 40, 0.92);
        backdrop-filter: blur(8px);
        border: 1px solid var(--accent, #f2c14e);
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
        width: min(290px, calc(100vw - 24px));
        max-height: calc(100dvh - 180px);
        overflow-y: auto;
        padding: 8px 10px;
        font-size: 11.5px;
      }
      .hud-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .hud-title {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--accent, #f2c14e);
        font-size: 12px;
      }
      .hud-toggle {
        background: none;
        border: none;
        color: var(--muted, #a8b0c2);
        cursor: pointer;
        padding: 0 4px;
        font-size: 10px;
      }
      .hud-body {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .hud-body[hidden] {
        display: none;
      }
      .hud-medal {
        display: flex;
        align-items: center;
        gap: 6px;
        opacity: 0.75;
      }
      .hud-medal.done {
        opacity: 1;
        color: #3fb34f;
      }
      .hud-medal.done .medal-name {
        text-decoration: line-through;
        color: #3fb34f;
      }
      .medal-icon {
        font-size: 14px;
      }
      .medal-info {
        display: flex;
        flex-direction: column;
        line-height: 1.25;
      }
      .medal-info small {
        font-size: 10px;
        color: var(--muted, #a8b0c2);
      }
    `;
    document.head.appendChild(style);
  };

  // Expose scenario list renderer for the unified Career Hub
  window.__renderScenariosList = (container, onLaunch) => {
    if (!container) return;
    container.innerHTML = "";
    const lang = getLang();
    loadMedals();

    SCENARIOS.forEach((s) => {
      const id = s.id;
      const medals = scenarioMedals[id] || { bronze: false, silver: false, gold: false };

      const card = document.createElement("div");
      card.className = "scenario-card";

      card.innerHTML = `
        <div class="sc-card-top">
          <div class="sc-header-left">
            <span class="sc-icon">${s.icon}</span>
            <div>
              <h3>${s.name[lang] || s.name.en}</h3>
              <span class="sc-tag" style="border-color:${s.diffColor};color:${s.diffColor}">${s.tag[lang] || s.tag.en}</span>
              <small>${s.difficulty}</small>
            </div>
          </div>
          <div class="sc-medals-earned">
            <span class="m-icon ${medals.bronze ? "lit" : "dim"}">🥉</span>
            <span class="m-icon ${medals.silver ? "lit" : "dim"}">🥈</span>
            <span class="m-icon ${medals.gold ? "lit" : "dim"}">🥇</span>
          </div>
        </div>
        <p class="sc-desc">${s.desc[lang] || s.desc.en}</p>
        <div class="sc-objectives">
          <div class="sc-obj"><span class="m-dot">🥉</span> <span>${s.bronze.title[lang] || s.bronze.title.en}</span></div>
          <div class="sc-obj"><span class="m-dot">🥈</span> <span>${s.silver.title[lang] || s.silver.title.en}</span></div>
          <div class="sc-obj"><span class="m-dot">🥇</span> <span>${s.gold.title[lang] || s.gold.title.en}</span></div>
        </div>
        <div class="sc-foot">
          <button type="button" class="primary sc-launch-btn">
            ${lang === "fr" ? "Lancer le scénario ▶" : "Launch Scenario ▶"}
          </button>
        </div>
      `;

      card.querySelector(".sc-launch-btn").addEventListener("click", () => {
        startScenario(s);
        if (typeof onLaunch === "function") onLaunch();
      });

      container.appendChild(card);
    });
  };
  window.__openScenarioModal = openScenarioBrowser;

  // Initialization
  const init = () => {
    injectStyles();
    loadMedals();
    syncScenario();
    renderHUD();

    // Loop to evaluate medals
    setInterval(() => {
      evaluateActiveScenario();
      renderHUD();
    }, 2500);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
