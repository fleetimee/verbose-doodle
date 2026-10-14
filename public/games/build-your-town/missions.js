(() => {
  // SimCity-Style Mayoral Missions & Objectives Engine for Build Your Town
  // 100% Client-side, reactive, and persistent

  const ERAS = [
    {
      id: 1,
      title: {
        en: "Era 1: Founding the Settlement",
        fr: "Ère 1 : Fonder la colonie",
      },
      subtitle: {
        en: "Establish basic infrastructure and welcome your first citizens.",
        fr: "Posez les bases de la ville et accueillez vos premiers habitants.",
      },
      missions: [
        {
          id: "era1_roads",
          title: {
            en: "Pioneer Grid",
            fr: "Tracé pionnier",
          },
          desc: {
            en: "Build at least 25 road tiles to connect the settlement.",
            fr: "Construisez au moins 25 cases de route pour relier la colonie.",
          },
          reward: 2500,
          rewardLabel: "+$2,500 State Grant",
          check: (c) => {
            const count = c.stats?.roads ?? 0;
            return {
              done: count >= 25,
              cur: count,
              target: 25,
              label: `${count} / 25 roads`,
            };
          },
        },
        {
          id: "era1_pop",
          title: {
            en: "First Community",
            fr: "Première communauté",
          },
          desc: {
            en: "Attract at least 250 residents into residential zones.",
            fr: "Attirez au moins 250 habitants dans les zones résidentielles.",
          },
          reward: 3500,
          rewardLabel: "+$3,500 Settlement Bonus",
          check: (c) => {
            const pop = c.stats?.pop ?? 0;
            return {
              done: pop >= 250,
              cur: pop,
              target: 250,
              label: `${pop.toLocaleString()} / 250 residents`,
            };
          },
        },
        {
          id: "era1_power",
          title: {
            en: "Powered Homes",
            fr: "Réseau électrique",
          },
          desc: {
            en: "Produce sufficient power with zero unpowered zones.",
            fr: "Produisez assez d'électricité sans aucune zone non alimentée.",
          },
          reward: 4000,
          rewardLabel: "+$4,000 Grid Subsidy",
          check: (c) => {
            const sup = c.power?.supply ?? 0;
            const dem = c.power?.demand ?? 0;
            const unpow = c.stats?.unpowered ?? 0;
            const ok = sup > 0 && sup >= dem && unpow === 0 && (c.stats?.pop ?? 0) > 50;
            return {
              done: ok,
              cur: sup >= dem && unpow === 0 ? 1 : 0,
              target: 1,
              label: ok ? "Grid fully stable" : `${Math.round(sup)} / ${Math.round(dem)} MW`,
            };
          },
        },
        {
          id: "era1_budget",
          title: {
            en: "Fiscal Health",
            fr: "Comptes sains",
          },
          desc: {
            en: "Achieve a positive monthly balance (+$$$) without bankruptcy.",
            fr: "Atteignez un solde mensuel positif (+$$$) sans faillite.",
          },
          reward: 5000,
          rewardLabel: "+$5,000 Stability Grant",
          check: (c) => {
            const b = c.lastBudget;
            if (!b) return { done: false, cur: 0, target: 1, label: "Evaluating..." };
            const inc = (b.taxR ?? 0) + (b.taxC ?? 0) + (b.taxI ?? 0);
            const exp =
              (b.roads ?? 0) +
              (b.power ?? 0) +
              (b.water ?? 0) +
              (b.police ?? 0) +
              (b.fire ?? 0) +
              (b.education ?? 0) +
              (b.health ?? 0) +
              (b.parks ?? 0) +
              (b.transport ?? 0) +
              (b.ordinances ?? 0) +
              (b.interest ?? 0);
            const net = Math.round(inc - exp);
            const ok = net > 0 && (c.stats?.pop ?? 0) >= 150;
            return {
              done: ok,
              cur: net > 0 ? 1 : 0,
              target: 1,
              label: ok ? `+${net} $/month` : `${net} $/month`,
            };
          },
        },
      ],
    },
    {
      id: 2,
      title: {
        en: "Era 2: Boomtown Expansion",
        fr: "Ère 2 : L'Essor de la ville",
      },
      subtitle: {
        en: "Build public safety, schooling, and expand city population.",
        fr: "Renforcez la sécurité publique, l'éducation et faites grandir la population.",
      },
      missions: [
        {
          id: "era2_safety",
          title: {
            en: "Public Safety",
            fr: "Sécurité publique",
          },
          desc: {
            en: "Construct both a Police Station and a Fire Station.",
            fr: "Construisez un commissariat de police et une caserne de pompiers.",
          },
          reward: 8000,
          rewardLabel: "+$8,000 Emergency Grant",
          check: (c) => {
            const structs = c.structs ? [...c.structs.values()] : [];
            const police = structs.some((s) => s.type === "police");
            const fire = structs.some((s) => s.type === "fire");
            const count = (police ? 1 : 0) + (fire ? 1 : 0);
            return {
              done: police && fire,
              cur: count,
              target: 2,
              label: `${count} / 2 services built`,
            };
          },
        },
        {
          id: "era2_school",
          title: {
            en: "Education First",
            fr: "Priorité à l'école",
          },
          desc: {
            en: "Construct an Elementary School for the neighborhood children.",
            fr: "Construisez une école primaire pour les enfants de la ville.",
          },
          reward: 8000,
          rewardLabel: "+$8,000 Education Fund",
          check: (c) => {
            const structs = c.structs ? [...c.structs.values()] : [];
            const hasSchool = structs.some((s) => s.type === "school");
            return {
              done: hasSchool,
              cur: hasSchool ? 1 : 0,
              target: 1,
              label: hasSchool ? "School operational" : "0 / 1 School",
            };
          },
        },
        {
          id: "era2_pop",
          title: {
            en: "Booming Population",
            fr: "Croissance soutenue",
          },
          desc: {
            en: "Grow the city to reach 1,500 residents.",
            fr: "Faites grandir la ville jusqu'à 1 500 habitants.",
          },
          reward: 10000,
          rewardLabel: "+$10,000 Expansion Fund",
          check: (c) => {
            const pop = c.stats?.pop ?? 0;
            return {
              done: pop >= 1500,
              cur: pop,
              target: 1500,
              label: `${pop.toLocaleString()} / 1,500 residents`,
            };
          },
        },
        {
          id: "era2_parks",
          title: {
            en: "Urban Greenery",
            fr: "Espaces verts",
          },
          desc: {
            en: "Build at least 2 Parks or 1 Big Park to raise land values.",
            fr: "Construisez au moins 2 parcs ou 1 grand parc pour embellir la ville.",
          },
          reward: 6000,
          rewardLabel: "+$6,000 Green City Grant",
          check: (c) => {
            const structs = c.structs ? [...c.structs.values()] : [];
            const smallParks = structs.filter((s) => s.type === "park").length;
            const bigParks = structs.filter((s) => s.type === "bigpark").length;
            const score = smallParks + bigParks * 2;
            return {
              done: score >= 2,
              cur: score,
              target: 2,
              label: `${score} / 2 park points`,
            };
          },
        },
      ],
    },
    {
      id: 3,
      title: {
        en: "Era 3: Commercial Hub & Transit",
        fr: "Ère 3 : Carrefour commercial",
      },
      subtitle: {
        en: "Develop public transit, healthcare, and formal city administration.",
        fr: "Développez les transports, la santé et fondez l'hôtel de ville.",
      },
      missions: [
        {
          id: "era3_transit",
          title: {
            en: "Public Mobility",
            fr: "Transports en commun",
          },
          desc: {
            en: "Construct a Bus Depot or Train Station with at least 15 railway tiles.",
            fr: "Construisez un dépôt de bus ou une gare avec au moins 15 rails.",
          },
          reward: 15000,
          rewardLabel: "+$15,000 Transit Grant",
          check: (c) => {
            const structs = c.structs ? [...c.structs.values()] : [];
            const hasDepot = structs.some(
              (s) => s.type === "bus" || s.type === "station"
            );
            const rails = c.stats?.rails ?? 0;
            const ok = hasDepot && (rails >= 15 || structs.some((s) => s.type === "bus"));
            return {
              done: ok,
              cur: ok ? 1 : 0,
              target: 1,
              label: ok ? "Transit system active" : "Bus or Train station required",
            };
          },
        },
        {
          id: "era3_hospital",
          title: {
            en: "City Hospital",
            fr: "Centre hospitalier",
          },
          desc: {
            en: "Construct a General Hospital to serve sick residents.",
            fr: "Construisez un hôpital pour soigner les habitants de la ville.",
          },
          reward: 12000,
          rewardLabel: "+$12,000 Healthcare Grant",
          check: (c) => {
            const structs = c.structs ? [...c.structs.values()] : [];
            const hasHospital = structs.some((s) => s.type === "hospital");
            return {
              done: hasHospital,
              cur: hasHospital ? 1 : 0,
              target: 1,
              label: hasHospital ? "Hospital built" : "0 / 1 Hospital",
            };
          },
        },
        {
          id: "era3_hall",
          title: {
            en: "City Hall & 5,000 Pop",
            fr: "Hôtel de ville & 5 000 hab.",
          },
          desc: {
            en: "Reach 5,000 residents and construct the official City Hall monument.",
            fr: "Atteignez 5 000 habitants et posez l'Hôtel de ville.",
          },
          reward: 20000,
          rewardLabel: "+$20,000 Municipal Reward",
          check: (c) => {
            const pop = c.stats?.pop ?? 0;
            const structs = c.structs ? [...c.structs.values()] : [];
            const hasHall = structs.some((s) => s.type === "cityhall");
            const ok = pop >= 5000 && hasHall;
            return {
              done: ok,
              cur: Math.min(pop, 5000),
              target: 5000,
              label: `${pop.toLocaleString()} / 5,000 pop ${hasHall ? "(Hall ✓)" : "(Need City Hall)"}`,
            };
          },
        },
        {
          id: "era3_treasury",
          title: {
            en: "City Wealth",
            fr: "Trésor communal",
          },
          desc: {
            en: "Accumulate at least $35,000 in your municipal treasury.",
            fr: "Accumulez au moins 35 000 $ dans les caisses de la ville.",
          },
          reward: 15000,
          rewardLabel: "+$15,000 Investment Bonus",
          check: (c) => {
            const money = c.money ?? 0;
            return {
              done: money >= 35000,
              cur: Math.max(0, money),
              target: 35000,
              label: `$${Math.round(money).toLocaleString()} / $35,000`,
            };
          },
        },
      ],
    },
    {
      id: 4,
      title: {
        en: "Era 4: Regional Metropolis",
        fr: "Ère 4 : Métropole régionale",
      },
      subtitle: {
        en: "Connect with global markets and transition to clean power.",
        fr: "Ouvrez la ville au commerce international et assainissez l'énergie.",
      },
      missions: [
        {
          id: "era4_global",
          title: {
            en: "Global Gateway",
            fr: "Porte sur le monde",
          },
          desc: {
            en: "Construct either a Commercial Seaport or an International Airport.",
            fr: "Construisez un port de commerce ou un aéroport international.",
          },
          reward: 25000,
          rewardLabel: "+$25,000 Trade Grant",
          check: (c) => {
            const structs = c.structs ? [...c.structs.values()] : [];
            const hasPort = structs.some(
              (s) => s.type === "port" || s.type === "airport"
            );
            return {
              done: hasPort,
              cur: hasPort ? 1 : 0,
              target: 1,
              label: hasPort ? "Gateway active" : "0 / 1 Port or Airport",
            };
          },
        },
        {
          id: "era4_cleanpower",
          title: {
            en: "Power Transition",
            fr: "Transition énergétique",
          },
          desc: {
            en: "Build wind, solar, geothermal, nuclear, or fusion power with zero blackout.",
            fr: "Déployez de l'éolien, du solaire, de la géothermie, du nucléaire ou de la fusion sans coupure.",
          },
          reward: 25000,
          rewardLabel: "+$25,000 Clean Energy Rebate",
          check: (c) => {
            const structs = c.structs ? [...c.structs.values()] : [];
            const hasClean = structs.some(
              (s) =>
                s.type === "nuclear" ||
                s.type === "wind" ||
                s.type === "solarfarm" ||
                s.type === "geothermal" ||
                s.type === "fusion"
            );
            const sup = c.power?.supply ?? 0;
            const dem = c.power?.demand ?? 0;
            const ok = hasClean && sup >= dem && dem > 0;
            return {
              done: ok,
              cur: ok ? 1 : 0,
              target: 1,
              label: ok ? "Power grid modernized" : "Build clean power",
            };
          },
        },
        {
          id: "era4_mansion",
          title: {
            en: "Mayor's Prestige",
            fr: "Prestige du maire",
          },
          desc: {
            en: "Reach 15,000 residents and construct the Mayor's Mansion.",
            fr: "Atteignez 15 000 habitants et érigez le Manoir du maire.",
          },
          reward: 30000,
          rewardLabel: "+$30,000 Civic Honor",
          check: (c) => {
            const pop = c.stats?.pop ?? 0;
            const structs = c.structs ? [...c.structs.values()] : [];
            const hasMansion = structs.some((s) => s.type === "mansion");
            const ok = pop >= 15000 && hasMansion;
            return {
              done: ok,
              cur: Math.min(pop, 15000),
              target: 15000,
              label: `${pop.toLocaleString()} / 15,000 pop ${hasMansion ? "(Mansion ✓)" : "(Need Mansion)"}`,
            };
          },
        },
        {
          id: "era4_water",
          title: {
            en: "Aqueduct Modernization",
            fr: "Réseau d'eau généralisé",
          },
          desc: {
            en: "Provide running water to at least 85% of developed city zones.",
            fr: "Alimentez en eau courante au moins 85 % des zones de la ville.",
          },
          reward: 25000,
          rewardLabel: "+$25,000 Utility Award",
          check: (c) => {
            const share = c.stats?.waterShare ?? 0;
            const pct = Math.round(share * 100);
            return {
              done: pct >= 85,
              cur: pct,
              target: 85,
              label: `${pct}% / 85% water coverage`,
            };
          },
        },
      ],
    },
    {
      id: 5,
      title: {
        en: "Era 5: Utopian Megacity",
        fr: "Ère 5 : Mégalopole utopique",
      },
      subtitle: {
        en: "Build the Arcology and cement your status as the greatest city planner.",
        fr: "Construisez l'Arcologie et devenez le plus grand bâtisseur.",
      },
      missions: [
        {
          id: "era5_arcology",
          title: {
            en: "The Arcology",
            fr: "L'Arcologie",
          },
          desc: {
            en: "Construct the self-contained futuristic Arcology mega-structure.",
            fr: "Construisez l'Arcologie, la méga-structure du futur.",
          },
          reward: 75000,
          rewardLabel: "+$75,000 Architecture Prize",
          check: (c) => {
            const structs = c.structs ? [...c.structs.values()] : [];
            const hasArc = structs.some((s) => s.type === "arcology");
            return {
              done: hasArc,
              cur: hasArc ? 1 : 0,
              target: 1,
              label: hasArc ? "Arcology stands tall!" : "0 / 1 Arcology",
            };
          },
        },
        {
          id: "era5_pop",
          title: {
            en: "Golden Metropolis",
            fr: "Mégalopole d'or",
          },
          desc: {
            en: "Reach an astounding total population of 30,000 residents.",
            fr: "Atteignez une population remarquable de 30 000 habitants.",
          },
          reward: 100000,
          rewardLabel: "+$100,000 Grand Prize",
          check: (c) => {
            const pop = c.stats?.pop ?? 0;
            return {
              done: pop >= 30000,
              cur: pop,
              target: 30000,
              label: `${pop.toLocaleString()} / 30,000 residents`,
            };
          },
        },
        {
          id: "era5_wealth",
          title: {
            en: "Financial Empire",
            fr: "Empire financier",
          },
          desc: {
            en: "Amass a fortune of $150,000 in your city treasury.",
            fr: "Amassez une fortune de 150 000 $ dans les caisses de la ville.",
          },
          reward: 50000,
          rewardLabel: "+$50,000 Grand Key to the City",
          check: (c) => {
            const money = c.money ?? 0;
            return {
              done: money >= 150000,
              cur: Math.max(0, money),
              target: 150000,
              label: `$${Math.round(money).toLocaleString()} / $150,000`,
            };
          },
        },
      ],
    },
  ];

  ERAS.push(...(window.__townExpansion?.eras || []));

  const scenarioFinished = () => {
    const key = localStorage.getItem("citybuilder.current");
    if (!key?.startsWith("scenario_")) return false;
    const run = JSON.parse(localStorage.getItem(`citybuilder.scenarioRun.${key.slice(9)}`) || "null");
    return !!run?.medals.gold;
  };
  const availableEras = () => localStorage.getItem("citybuilder.current")?.startsWith("scenario_")
    ? ERAS.filter((era) => era.id >= 6)
    : ERAS;

  // State Management
  let completedMissions = new Set();
  let activeEraId = 1;
  let currentCityKey = null;

  const getLang = () => {
    try {
      const l = localStorage.getItem("citybuilder.lang");
      if (l === "fr" || l === "en") return l;
    } catch {}
    return document.documentElement.lang === "en" ? "en" : "fr";
  };

  const getStorageKey = () => {
    try {
      const cur = localStorage.getItem("citybuilder.current");
      if (cur) return `citybuilder.missions.${cur}`;
    } catch {}
    return "citybuilder.missions.default";
  };

  const loadProgress = () => {
    try {
      const raw = localStorage.getItem(getStorageKey());
      if (raw) {
        const data = JSON.parse(raw);
        completedMissions = new Set(data.completed || []);
        activeEraId = data.activeEraId || 1;
      } else {
        completedMissions = new Set();
        activeEraId = 1;
      }
    } catch {
      completedMissions = new Set();
      activeEraId = 1;
    }
  };

  const saveProgress = () => {
    try {
      localStorage.setItem(
        getStorageKey(),
        JSON.stringify({
          completed: Array.from(completedMissions),
          activeEraId,
        })
      );
    } catch {}
  };

  // Evaluate missions and trigger rewards
  const evaluateMissions = () => {
    if (window.__townStartScreen?.isHome()) return;
    const city = window.__city;
    if (!city) return;
    if (localStorage.getItem("citybuilder.current")?.startsWith("scenario_") && !scenarioFinished()) return;

    // Check if city changed
    try {
      const curKey = localStorage.getItem("citybuilder.current");
      if (curKey !== currentCityKey) {
        currentCityKey = curKey;
        loadProgress();
      }
    } catch {}

    const lang = getLang();
    let newlyCompleted = false;

    for (const era of availableEras()) {
      for (const m of era.missions) {
        if (completedMissions.has(m.id)) continue;
        const res = m.check(city);
        if (res.done) {
          completedMissions.add(m.id);
          newlyCompleted = true;

          // Grant reward money directly to the city treasury!
          if (m.reward && typeof m.reward === "number") {
            city.money = Math.round((city.money || 0) + m.reward);
            if (window.__ui?.update) {
              window.__ui.update(city);
            }
          }

          // Trigger in-game toast celebration
          const title = m.title[lang] || m.title.en;
          const msg =
            lang === "fr"
              ? `🏆 Mission accomplie : ${title} ! +${m.reward.toLocaleString()} $`
              : `🏆 Mission Complete: ${title}! +$${m.reward.toLocaleString()} granted!`;

          if (window.__ui?.toast) {
            window.__ui.toast(msg, "good", { ms: 6000 });
          }

          // Play milestone fanfare if audio engine is active
          try {
            const btn = document.getElementById("btn-sound");
            if (btn && btn.textContent !== "🔇") {
              const audioTag = document.querySelector('script[src*="audio.js"]');
              if (audioTag) {
                // Trigger milestone chime via audio click or custom event
                window.dispatchEvent(new CustomEvent("citybuilder-milestone"));
              }
            }
          } catch {}
        }
      }
    }

    if (newlyCompleted) {
      saveProgress();
      renderPanel();
      updateBadge();
    }
  };

  const updateBadge = () => {
    const badge = document.getElementById("missions-badge");
    if (!badge) return;
    if (localStorage.getItem("citybuilder.current")?.startsWith("scenario_") && !scenarioFinished()) {
      badge.hidden = true;
      return;
    }

    const eras = availableEras();
    const currentEra = eras.find((e) => e.id === activeEraId) || eras[0];
    if (!currentEra) return;

    const remaining = currentEra.missions.filter(
      (m) => !completedMissions.has(m.id)
    ).length;

    if (remaining === 0) {
      badge.textContent = "★";
      badge.hidden = false;
      badge.style.background = "var(--accent, #f2c14e)";
      badge.style.color = "#141a28";
    } else {
      badge.textContent = String(remaining);
      badge.hidden = false;
      badge.style.background = "var(--teal, #3d9be9)";
      badge.style.color = "#ffffff";
    }
  };

  let hubMode = "missions";
  let panelSignature = "";

  // Build the Unified Career Hub Panel UI (Missions + Scenarios)
  const createMissionsPanel = () => {
    if (document.getElementById("panel-missions")) return;

    const aside = document.createElement("aside");
    aside.id = "panel-missions";
    aside.className = "panel";
    aside.hidden = true;

    aside.innerHTML = `
      <div class="head hub-head">
        <div class="career-hub-tabs">
          <button type="button" class="hub-mode-tab active" id="tab-mode-missions">🎯 Missions</button>
          <button type="button" class="hub-mode-tab" id="tab-mode-scenarios">🏆 Scenarios</button>
        </div>
        <button class="ghost close" id="missions-close">✕</button>
      </div>
      <div class="body" id="missions-body">
        <div id="view-mode-missions">
          <div class="era-selector" id="era-tabs"></div>
          <div class="era-header" id="era-header"></div>
          <div class="era-progress-bar"><div class="fill" id="era-fill"></div></div>
          <div class="missions-list" id="missions-list"></div>
        </div>
        <div id="view-mode-scenarios" hidden>
          <p class="scenarios-intro" id="hub-scenarios-intro"></p>
          <div class="scenarios-grid" id="hub-scenarios-grid"></div>
        </div>
      </div>
    `;

    document.body.appendChild(aside);

    // Tab mode switching
    const btnTabMissions = document.getElementById("tab-mode-missions");
    const btnTabScenarios = document.getElementById("tab-mode-scenarios");
    const viewMissions = document.getElementById("view-mode-missions");
    const viewScenarios = document.getElementById("view-mode-scenarios");

    btnTabMissions.addEventListener("click", () => {
      hubMode = "missions";
      btnTabMissions.classList.add("active");
      btnTabScenarios.classList.remove("active");
      viewMissions.hidden = false;
      viewScenarios.hidden = true;
      renderPanel();
    });

    btnTabScenarios.addEventListener("click", () => {
      hubMode = "scenarios";
      btnTabScenarios.classList.add("active");
      btnTabMissions.classList.remove("active");
      viewMissions.hidden = true;
      viewScenarios.hidden = false;
      renderScenariosHub();
    });

    // Event listener to close panel
    document.getElementById("missions-close").addEventListener("click", () => {
      aside.hidden = true;
    });

    // Topbar Career Hub Button
    const topMenus = document.querySelector(".group.menus");
    if (topMenus && !document.getElementById("btn-missions")) {
      const btn = document.createElement("button");
      btn.id = "btn-missions";
      btn.className = "missions";
      btn.type = "button";
      btn.title = "Career Hub: Missions & Scenarios";
      btn.setAttribute("aria-label", "Career Hub");
      btn.innerHTML = `🎯 <span class="badge" id="missions-badge" hidden>0</span>`;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Close other panels
        for (const p of [
          "panel-budget",
          "maps-menu",
          "panel-cities",
          "panel-journal",
          "demand-pop",
        ]) {
          const el = document.getElementById(p);
          if (el) el.hidden = true;
        }

        aside.hidden = !aside.hidden;
        if (!aside.hidden) {
          if (hubMode === "missions") {
            evaluateMissions();
            renderPanel();
          } else {
            renderScenariosHub();
          }
        }
      });

      // Insert right after cities button or at start of menus
      const citiesBtn = document.getElementById("btn-cities");
      if (citiesBtn && citiesBtn.nextSibling) {
        topMenus.insertBefore(btn, citiesBtn.nextSibling);
      } else {
        topMenus.appendChild(btn);
      }
    }
  };

  const renderScenariosHub = () => {
    const intro = document.getElementById("hub-scenarios-intro");
    const grid = document.getElementById("hub-scenarios-grid");
    const lang = getLang();
    if (intro) {
      intro.textContent =
        lang === "fr"
          ? "Prenez les rênes de villes pré-construites confrontées à des défis uniques. Décrochez les médailles de Bronze 🥉, Argent 🥈 et Or 🥇 !"
          : "Take charge of pre-built cities facing unique crises! Conquer challenges to earn Bronze 🥉, Silver 🥈, and Gold 🥇 medals.";
    }
    if (grid && typeof window.__renderScenariosList === "function") {
      const signature = `${lang}:${localStorage.getItem("citybuilder.scenarios.medals") || ""}`;
      if (grid.dataset.signature === signature && grid.childElementCount > 0) return;
      const aside = document.getElementById("panel-missions");
      window.__renderScenariosList(grid, () => {
        if (aside) aside.hidden = true;
      });
      grid.dataset.signature = signature;
    }
  };

  // Render the active era and mission list
  const renderPanel = () => {
    const inScenario = localStorage.getItem("citybuilder.current")?.startsWith("scenario_");
    const missionsTab = document.getElementById("tab-mode-missions");
    const endgameReady = scenarioFinished();
    if (missionsTab) missionsTab.hidden = !!inScenario && !endgameReady;
    if (inScenario && !endgameReady) {
      hubMode = "scenarios";
      document.getElementById("tab-mode-missions").classList.remove("active");
      document.getElementById("tab-mode-scenarios").classList.add("active");
      document.getElementById("view-mode-missions").hidden = true;
      document.getElementById("view-mode-scenarios").hidden = false;
      renderScenariosHub();
      return;
    }
    const lang = getLang();
    const city = window.__city || { stats: {}, power: {}, structs: new Map() };
    const eras = availableEras();
    if (!eras.some((era) => era.id === activeEraId)) activeEraId = eras[0].id;
    const currentEra = eras.find((e) => e.id === activeEraId) || eras[0];
    const signature = JSON.stringify([
      localStorage.getItem("citybuilder.current"), lang, activeEraId, hubMode,
      [...completedMissions], currentEra.missions.map((m) => m.check(city)),
    ]);
    if (signature === panelSignature) return;
    panelSignature = signature;

    // 1. Era Tabs
    const tabs = document.getElementById("era-tabs");
    if (tabs) {
      const tabSet = `${lang}:${eras.map((era) => era.id).join(",")}`;
      if (tabs.dataset.tabSet !== tabSet) {
        tabs.innerHTML = "";
        tabs.dataset.tabSet = tabSet;
      }
      eras.forEach((era) => {
        const eraCompletedCount = era.missions.filter((m) =>
          completedMissions.has(m.id)
        ).length;
        const allDone = eraCompletedCount === era.missions.length;

        let tabBtn = tabs.querySelector(`[data-era="${era.id}"]`);
        if (!tabBtn) {
          tabBtn = document.createElement("button");
          tabBtn.type = "button";
          tabBtn.dataset.era = String(era.id);
          tabBtn.addEventListener("click", () => {
            activeEraId = era.id;
            saveProgress();
            renderPanel();
            updateBadge();
          });
          tabs.appendChild(tabBtn);
        }
        tabBtn.className = `era-tab ${era.id === activeEraId ? "active" : ""} ${allDone ? "completed" : ""}`;
        tabBtn.innerHTML = `<span>${allDone ? "✓" : era.id}</span>`;
        tabBtn.title = era.title[lang] || era.title.en;
        tabBtn.setAttribute("aria-pressed", String(era.id === activeEraId));
      });
    }

    // 2. Era Header & Subtitle
    const eraHeader = document.getElementById("era-header");
    if (eraHeader) {
      const eraCompletedCount = currentEra.missions.filter((m) =>
        completedMissions.has(m.id)
      ).length;
      const pct = Math.round((eraCompletedCount / currentEra.missions.length) * 100);

      eraHeader.innerHTML = `
        <div class="era-title-row">
          <h3>${currentEra.title[lang] || currentEra.title.en}</h3>
          <span class="era-stat">${eraCompletedCount} / ${currentEra.missions.length} (${pct}%)</span>
        </div>
        <p class="era-sub">${currentEra.subtitle[lang] || currentEra.subtitle.en}</p>
      `;

      const fill = document.getElementById("era-fill");
      if (fill) fill.style.width = `${pct}%`;
    }

    // 3. Missions List
    const list = document.getElementById("missions-list");
    if (list) {
      list.innerHTML = "";

      currentEra.missions.forEach((m) => {
        const isDone = completedMissions.has(m.id);
        const checkResult = m.check(city);
        const cur = checkResult.cur ?? 0;
        const target = checkResult.target ?? 1;
        const progressPct = isDone
          ? 100
          : Math.min(100, Math.max(0, Math.round((cur / target) * 100)));

        const card = document.createElement("div");
        card.className = `mission-card ${isDone ? "done" : ""}`;

        card.innerHTML = `
          <div class="mission-top">
            <div class="mission-name">
              <span class="mission-icon">${isDone ? "✓" : "○"}</span>
              <strong>${m.title[lang] || m.title.en}</strong>
            </div>
            <span class="mission-reward ${isDone ? "claimed" : ""}">${isDone ? (lang === "fr" ? "Réclamé" : "Claimed") : m.rewardLabel}</span>
          </div>
          <p class="mission-desc">${m.desc[lang] || m.desc.en}</p>
          <div class="mission-progress-bar">
            <div class="fill" style="width: ${progressPct}%"></div>
          </div>
          <div class="mission-foot">
            <span class="progress-label">${checkResult.label || `${cur} / ${target}`}</span>
            <span class="progress-pct">${progressPct}%</span>
          </div>
        `;

        list.appendChild(card);
      });
    }
  };

  window.__openEndgameMissions = () => {
    if (localStorage.getItem("citybuilder.current")?.startsWith("scenario_") && !scenarioFinished()) return;
    loadProgress();
    activeEraId = 6;
    hubMode = "missions";
    document.getElementById("tab-mode-missions").classList.add("active");
    document.getElementById("tab-mode-scenarios").classList.remove("active");
    document.getElementById("view-mode-missions").hidden = false;
    document.getElementById("view-mode-scenarios").hidden = true;
    window.__ui?.closePanels();
    const cheats = document.getElementById("panel-cheats");
    if (cheats) cheats.hidden = true;
    document.getElementById("panel-missions").hidden = false;
    renderPanel();
    saveProgress();
    updateBadge();
  };

  // Add Custom CSS for Missions UI
  const injectStyles = () => {
    if (document.getElementById("missions-style")) return;
    const style = document.createElement("style");
    style.id = "missions-style";
    style.textContent = `
      #btn-missions {
        position: relative;
        font-family: inherit;
        font-size: 15px;
        padding: 0 10px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      #btn-missions .badge {
        font-size: 10px;
        font-weight: 800;
        border-radius: 9px;
        padding: 1px 5px;
        min-width: 14px;
        line-height: 1.2;
        text-align: center;
      }
      #panel-missions {
        width: min(520px, 94vw);
      }
      .career-hub-tabs {
        display: flex;
        gap: 4px;
        background: rgba(0, 0, 0, 0.4);
        padding: 3px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .hub-mode-tab {
        border: none;
        background: transparent;
        color: var(--muted, #a8b0c2);
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        padding: 4px 14px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .hub-mode-tab:hover {
        color: #fff;
      }
      .hub-mode-tab.active {
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%);
        color: var(--accent, #f2c14e);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      }
      #view-mode-scenarios {
        max-height: 56vh;
        overflow-y: auto;
        padding-right: 4px;
      }
      .era-selector {
        display: flex;
        gap: 6px;
        margin-bottom: 12px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .era-tab {
        flex: 1;
        padding: 6px 4px;
        font-size: 12px;
        font-weight: 700;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
        border-radius: 8px;
        cursor: pointer;
        color: var(--muted, #a8b0c2);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.15s ease;
      }
      .era-tab:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .era-tab.active {
        background: linear-gradient(180deg, #5fd7de 0%, var(--teal, #1f8a91) 100%);
        color: #05282b;
        border-color: #1f8a91;
      }
      .era-tab.completed span {
        color: #3fb34f;
      }
      .era-tab.active.completed span {
        color: #05282b;
      }
      .era-header {
        margin-bottom: 8px;
      }
      .era-title-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .era-title-row h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: var(--text, #fff);
      }
      .era-stat {
        font-size: 12px;
        font-weight: 700;
        color: var(--accent, #f2c14e);
      }
      .era-sub {
        margin: 4px 0 8px;
        font-size: 12px;
        color: var(--muted, #a8b0c2);
        line-height: 1.4;
      }
      .era-progress-bar {
        height: 6px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 14px;
      }
      .era-progress-bar .fill {
        height: 100%;
        background: linear-gradient(90deg, #3d7fe0, #3fb34f);
        transition: width 0.3s ease;
      }
      .missions-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 52vh;
        overflow-y: auto;
        padding-right: 2px;
      }
      .mission-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
        border-radius: 10px;
        padding: 10px 12px;
        transition: border-color 0.2s ease;
      }
      .mission-card:hover {
        border-color: rgba(255, 255, 255, 0.25);
      }
      .mission-card.done {
        background: rgba(63, 179, 79, 0.06);
        border-color: rgba(63, 179, 79, 0.35);
      }
      .mission-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .mission-name {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 700;
      }
      .mission-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        font-size: 11px;
        background: rgba(255, 255, 255, 0.1);
        color: var(--muted, #a8b0c2);
      }
      .mission-card.done .mission-icon {
        background: #3fb34f;
        color: #fff;
      }
      .mission-reward {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(242, 193, 78, 0.15);
        color: var(--accent, #f2c14e);
        white-space: nowrap;
      }
      .mission-reward.claimed {
        background: rgba(63, 179, 79, 0.15);
        color: #3fb34f;
      }
      .mission-desc {
        margin: 2px 0 8px;
        font-size: 12px;
        color: var(--muted, #a8b0c2);
        line-height: 1.35;
      }
      .mission-progress-bar {
        height: 5px;
        background: rgba(0, 0, 0, 0.35);
        border-radius: 3px;
        overflow: hidden;
      }
      .mission-progress-bar .fill {
        height: 100%;
        background: linear-gradient(90deg, #3d7fe0, #5fd7de);
        transition: width 0.3s ease;
      }
      .mission-card.done .mission-progress-bar .fill {
        background: #3fb34f;
      }
      .mission-foot {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: var(--muted, #a8b0c2);
        margin-top: 5px;
        font-variant-numeric: tabular-nums;
      }
    `;
    document.head.appendChild(style);
  };

  // Initialization
  const init = () => {
    injectStyles();
    createMissionsPanel();
    loadProgress();
    window.addEventListener("citybuilder-scenario-change", () => {
      loadProgress();
      renderPanel();
      updateBadge();
    });
    evaluateMissions();
    updateBadge();

    // Regular evaluation loop (every 2.5 seconds)
    setInterval(() => {
      evaluateMissions();
      const panel = document.getElementById("panel-missions");
      if (panel && !panel.hidden) {
        renderPanel();
      }
    }, 2500);

    // Also observe city date changes for immediate month-end triggers
    const dateEl = document.getElementById("date");
    if (dateEl) {
      new MutationObserver(() => {
        evaluateMissions();
      }).observe(dateEl, { childList: true, characterData: true, subtree: true });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
