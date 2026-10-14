(() => {
  // SimCity-Style Random Encounters, Citizen Petitions & Dilemmas Engine
  // 100% Client-side, interactive, and reactive

  const ENCOUNTERS = [
    {
      id: "hollywood_shoot",
      icon: "🎬",
      role: {
        en: "Film Producer",
        fr: "Producteur de cinéma",
      },
      title: {
        en: "Hollywood Blockbuster Shoot",
        fr: "Tournage d'un film d'action",
      },
      story: {
        en: "A major studio wants to film high-speed car chases on our downtown streets. They offer a hefty permit fee, but traffic will slow down.",
        fr: "Un grand studio veut tourner des courses-poursuites dans nos rues. Ils proposent une belle redevance, mais la circulation sera ralentie.",
      },
      choiceA: {
        label: {
          en: "Grant Filming Permit (+$4,500 Funds)",
          fr: "Accorder l'autorisation (+4 500 $)",
        },
        badge: "+$4,500 Cash",
        apply: (city) => {
          city.money = Math.round((city.money || 0) + 4500);
          city.demand.c = Math.min(1, (city.demand.c || 0) + 0.25);
          return {
            en: "Filming permit approved! Studio deposited $4,500 into city treasury.",
            fr: "Permis accordé ! Le studio a versé 4 500 $ dans les caisses municipales.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Deny Permit (Keep Streets Clear)",
          fr: "Refuser (Garder les rues fluides)",
        },
        badge: "No change",
        apply: () => ({
          en: "The Mayor declined the film shoot to protect daily commuters.",
          fr: "Le Maire a refusé le tournage pour préserver la circulation des citoyens.",
        }),
      },
    },
    {
      id: "gold_strike",
      icon: "⛏️",
      role: {
        en: "Geological Surveyor",
        fr: "Géologue en chef",
      },
      title: {
        en: "Mineral Vein Discovered!",
        fr: "Veine minérale découverte !",
      },
      story: {
        en: "Road excavators struck a rare deposit of valuable minerals in the rocky hills. How should the municipality handle the finding?",
        fr: "Des terrassiers ont mis au jour un gisement minéral précieux dans les collines. Que doit décider la mairie ?",
      },
      choiceA: {
        label: {
          en: "Sell Mineral Rights (+$8,000 Funds)",
          fr: "Vendre les droits d'extraction (+8 000 $)",
        },
        badge: "+$8,000 Cash",
        apply: (city) => {
          city.money = Math.round((city.money || 0) + 8000);
          return {
            en: "Mineral rights sold! Treasury received an $8,000 windfall.",
            fr: "Droits vendus ! La trésorerie municipale encaisse 8 000 $.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Preserve as Nature Reserve (+Land Value)",
          fr: "Créer une réserve naturelle (+Valeur foncière)",
        },
        badge: "+Land Value",
        apply: (city) => {
          if (city.stats) {
            city.stats.avgLandValue = Math.min(255, (city.stats.avgLandValue || 60) + 15);
          }
          return {
            en: "Site protected as geological heritage! Surrounding land value surged.",
            fr: "Site classé au patrimoine géologique ! La valeur foncière progresse.",
          };
        },
      },
    },
    {
      id: "summer_carnival",
      icon: "🎪",
      role: {
        en: "Cultural Director",
        fr: "Directrice de la culture",
      },
      title: {
        en: "Annual Town Fair & Carnival",
        fr: "Fête foraine de la ville",
      },
      story: {
        en: "Citizens and local merchants petition the Mayor to sponsor an annual summer street carnival with live music, games, and food stalls.",
        fr: "Les habitants et commerçants réclament une fête foraine estivale avec musique, manèges et stands artisanaux.",
      },
      choiceA: {
        label: {
          en: "Sponsor Festival (-$2,500, +Demand Surge)",
          fr: "Financer la fête (-2 500 $, +Forte demande)",
        },
        badge: "-$2,500 / +Demand",
        apply: (city) => {
          city.money = Math.max(0, Math.round((city.money || 0) - 2500));
          city.demand.r = Math.min(1, (city.demand.r || 0) + 0.35);
          city.demand.c = Math.min(1, (city.demand.c || 0) + 0.35);
          return {
            en: "The fair is a smash hit! Residents celebrate and demand for homes jumps.",
            fr: "La fête est un triomphe ! Les habitants célèbrent et la demande explose.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Decline to Save Funds",
          fr: "Refuser pour économiser",
        },
        badge: "Save $2,500",
        apply: () => ({
          en: "Festival cancelled. Funds remain safely in the treasury.",
          fr: "Festival annulé. Les fonds restent dans les caisses.",
        }),
      },
    },
    {
      id: "heatwave_strain",
      icon: "⚡",
      role: {
        en: "Power Grid Engineer",
        fr: "Ingénieur réseau électrique",
      },
      title: {
        en: "Scorching Heatwave Alert",
        fr: "Alerte canicule sur le réseau",
      },
      story: {
        en: "Blistering summer heat has caused citywide air conditioner use to surge. Power generators are operating at redline capacity!",
        fr: "Une vague de chaleur sans précédent fait tourner les climatiseurs à plein régime. Les générateurs surchauffent !",
      },
      choiceA: {
        label: {
          en: "Deploy Backup Generators (-$3,000 Funds)",
          fr: "Déployer des générateurs de secours (-3 000 $)",
        },
        badge: "-$3,000 Grid Shield",
        apply: (city) => {
          city.money = Math.max(0, Math.round((city.money || 0) - 3000));
          city.power.supply = Math.round((city.power.supply || 0) + 50);
          return {
            en: "Backup capacity activated! The city avoided brownouts.",
            fr: "Générateurs d'urgence enclenchés ! Coupures de courant évitées.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Request Voluntary Citizen Conservation",
          fr: "Appeler à la sobriété volontaire",
        },
        badge: "Free (Slight demand dip)",
        apply: (city) => {
          city.demand.r = Math.max(-0.5, (city.demand.r || 0) - 0.15);
          return {
            en: "Citizens turned off non-essentials. A bit sweaty, but the budget was spared.",
            fr: "Les habitants ont réduit leur consommation. Quelques plaintes mais budget épargné.",
          };
        },
      },
    },
    {
      id: "arson_scare",
      icon: "👩‍🚒",
      role: {
        en: "Fire Chief",
        fr: "Cheffe des pompiers",
      },
      title: {
        en: "Industrial Hazard Scare",
        fr: "Risque d'incendie industriel",
      },
      story: {
        en: "Dry winds and stacked industrial barrels have created a severe fire risk. The fire department requests funding for round-the-clock water patrols.",
        fr: "Vents secs et matériaux inflammables font craindre un départ de feu dans les usines. Les pompiers demandent des patrouilles.",
      },
      choiceA: {
        label: {
          en: "Fund Preventative Patrols (-$2,000 Funds)",
          fr: "Financer les patrouilles préventives (-2 000 $)",
        },
        badge: "-$2,000 / Safety Guarantee",
        apply: (city) => {
          city.money = Math.max(0, Math.round((city.money || 0) - 2000));
          return {
            en: "Patrols secured all hazardous zones! Fire risk completely neutralized.",
            fr: "Patrouilles déployées ! Risque d'incendie complètement neutralisé.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Take the Chance (30% Fire Risk)",
          fr: "Prendre le risque (30 % risque de feu)",
        },
        badge: "Gamble",
        apply: () => {
          if (Math.random() < 0.35 && typeof window.__triggerDisaster === "function") {
            setTimeout(() => window.__triggerDisaster("fire"), 1000);
            return {
              en: "Bad luck! A spark ignited and a fire broke out in the city!",
              fr: "Pas de chance ! Une étincelle a provoqué un départ de feu !",
            };
          }
          return {
            en: "Lucky break! The dry spell passed with no fires.",
            fr: "Ouf ! La vague de sécheresse s'est achevée sans incident.",
          };
        },
      },
    },
    {
      id: "ancient_ruins",
      icon: "🏛️",
      role: {
        en: "Museum Curator",
        fr: "Conservateur du musée",
      },
      title: {
        en: "Ancient Artifacts Unearthed",
        fr: "Ruines antiques découvertes",
      },
      story: {
        en: "Utility workers discovered ancient stone columns and pottery under the pavement! Historians beg for an archaeological preservation grant.",
        fr: "Des ouvriers ont découvert des colonnes et poteries antiques sous la chaussée ! Les archéologues supplient de préserver le site.",
      },
      choiceA: {
        label: {
          en: "Establish Heritage Site (-$3,500, +Tourism)",
          fr: "Classer site historique (-3 500 $, +Tourisme)",
        },
        badge: "-$3,500 / +Tourism",
        apply: (city) => {
          city.money = Math.max(0, Math.round((city.money || 0) - 3500));
          city.demand.c = Math.min(1, (city.demand.c || 0) + 0.3);
          return {
            en: "Monument built! Tourists flock into town and commercial growth increases.",
            fr: "Monument érigé ! Les touristes affluent et stimulent les commerces.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Document Quickly & Keep Building",
          fr: "Documenter rapidement et poursuivre",
        },
        badge: "Free",
        apply: () => ({
          en: "Relics transferred to city archives. Construction proceeded without delay.",
          fr: "Objets transférés aux archives. Les chantiers continuent sans retard.",
        }),
      },
    },
    {
      id: "tech_hq",
      icon: "💼",
      role: {
        en: "Chamber of Commerce",
        fr: "Chambre de commerce",
      },
      title: {
        en: "Tech Giant Regional Headquarters",
        fr: "Siège régional de haute technologie",
      },
      story: {
        en: "A cutting-edge tech corporation wants to establish a regional campus here! They ask for a municipal infrastructure incentive.",
        fr: "Une entreprise technologique de pointe souhaite implanter son campus ici. Elle sollicite une aide municipale.",
      },
      choiceA: {
        label: {
          en: "Approve Incentive (-$5,000, +Huge Job Boom)",
          fr: "Accorder l'aide (-5 000 $, +Boom de l'emploi)",
        },
        badge: "-$5,000 / +Major Growth",
        apply: (city) => {
          city.money = Math.max(0, Math.round((city.money || 0) - 5000));
          city.demand.c = Math.min(1, (city.demand.c || 0) + 0.45);
          city.demand.i = Math.min(1, (city.demand.i || 0) + 0.3);
          return {
            en: "Tech campus approved! Commercial and industrial demand skyrocketed.",
            fr: "Campus validé ! La demande commerciale et industrielle s'envole.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Fair Market Only (Decline Incentive)",
          fr: "Refuser (Aucun passe-droit)",
        },
        badge: "Save $5,000",
        apply: () => ({
          en: "Incentive rejected. The firm will have to grow organically like everyone else.",
          fr: "Aide refusée. L'entreprise devra s'installer aux conditions ordinaires.",
        }),
      },
    },
    {
      id: "union_negotiation",
      icon: "👷",
      role: {
        en: "Civic Workers Union",
        fr: "Syndicat des agents municipaux",
      },
      title: {
        en: "Municipal Workers Petition",
        fr: "Pétition des agents municipaux",
      },
      story: {
        en: "Road crews and utility technicians request new protective equipment and safety upgrades to cope with expanding city services.",
        fr: "Les ouvriers de voirie et techniciens de l'eau demandent une modernisation de leur équipement de sécurité.",
      },
      choiceA: {
        label: {
          en: "Approve Equipment Bonus (-$3,000 Funds)",
          fr: "Financer les équipements (-3 000 $)",
        },
        badge: "-$3,000 / +Worker Morale",
        apply: (city) => {
          city.money = Math.max(0, Math.round((city.money || 0) - 3000));
          city.demand.r = Math.min(1, (city.demand.r || 0) + 0.2);
          return {
            en: "Equipment upgraded! Happy municipal workers boost city efficiency.",
            fr: "Matériel modernisé ! Les agents travaillent avec efficacité et fierté.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Hold Strict Budget Limits",
          fr: "Maintenir la rigueur budgétaire",
        },
        badge: "Save $3,000",
        apply: () => ({
          en: "The Mayor stood firm on fiscal discipline. Budget remains intact.",
          fr: "Le Maire maintient la rigueur budgétaire. Les caisses restent intactes.",
        }),
      },
    },
    {
      id: "ufo_frenzy",
      icon: "🛸",
      role: {
        en: "Amateur Astronomer",
        fr: "Astronome amateur",
      },
      title: {
        en: "Mysterious Lights Over Town!",
        fr: "Lueurs mystérieuses dans le ciel !",
      },
      story: {
        en: "Multiple residents reported glowing disc-like craft hovering silently over the bay last night! The local newspaper is having a field day.",
        fr: "Plusieurs témoins affirment avoir aperçu d'étranges disques lumineux au-dessus de la baie ! La presse locale s'emballe.",
      },
      choiceA: {
        label: {
          en: "Host 'Alien Festival' (-$1,000, Earns Tourism $)",
          fr: "Lancer le 'Festival Ovni' (-1 000 $, +Tourisme)",
        },
        badge: "Net +$3,500 Windfall",
        apply: (city) => {
          city.money = Math.round((city.money || 0) + 3500);
          return {
            en: "Souvenirs and flying saucer burgers sold out! Net +$3,500 festival profit.",
            fr: "T-shirts ovni et burgers extraterrestres vendus ! Bénéfice net : +3 500 $.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Official Denial: 'Weather Balloons'",
          fr: "Démenti officiel : 'Ballons météo'",
        },
        badge: "No cost",
        apply: () => ({
          en: "City hall issued a stern denial. The excitement calmed down.",
          fr: "La mairie publie un démenti formel. Le calme revient en ville.",
        }),
      },
    },
    {
      id: "philanthropist_legacy",
      icon: "📜",
      role: {
        en: "Estate Attorney",
        fr: "Notaire de famille",
      },
      title: {
        en: "Philanthropist's Last Will",
        fr: "Legs d'un bienfaiteur",
      },
      story: {
        en: "A wealthy founding pioneer of the city has passed away peacefully, leaving a substantial bequest directly to the Mayor's office.",
        fr: "Un illustre pionnier de la ville s'est éteint en léguant une part généreuse de sa fortune à la municipalité.",
      },
      choiceA: {
        label: {
          en: "Accept Bequest into Treasury (+$6,500 Cash)",
          fr: "Accepter le legs dans les caisses (+6 500 $)",
        },
        badge: "+$6,500 Cash",
        apply: (city) => {
          city.money = Math.round((city.money || 0) + 6500);
          return {
            en: "Bequest processed! $6,500 credited to municipal treasury.",
            fr: "Legs enregistré ! 6 500 $ ont été versés dans la trésorerie.",
          };
        },
      },
      choiceB: {
        label: {
          en: "Establish Community Endowment (+$3,000 +Land Value)",
          fr: "Créer une fondation civique (+3 000 $ +Valeur)",
        },
        badge: "+$3,000 / +Value",
        apply: (city) => {
          city.money = Math.round((city.money || 0) + 3000);
          if (city.stats) {
            city.stats.avgLandValue = Math.min(255, (city.stats.avgLandValue || 60) + 10);
          }
          return {
            en: "Endowment fund established! $3,000 cash plus elevated civic land value.",
            fr: "Fondation créée ! 3 000 $ versés et hausse du prestige foncier.",
          };
        },
      },
    },
  ];

  let currentModal = null;
  let lastEncounterTime = Date.now();
  const MIN_POP_FOR_ENCOUNTERS = 150;
  const frequencies = {
    rare: { cooldown: 300000, chance: 0.15 },
    normal: { cooldown: 90000, chance: 0.25 },
    frequent: { cooldown: 45000, chance: 0.5 },
  };
  let options = { enabled: true, frequency: "normal" };
  try {
    const saved = JSON.parse(localStorage.getItem("citybuilder.encounters") || "null");
    if (saved) options = { enabled: saved.enabled !== false,
      frequency: Object.hasOwn(frequencies, saved.frequency) ? saved.frequency : "normal" };
  } catch {}
  window.__townEncounters = {
    getOptions: () => ({ ...options }),
    setOptions: value => {
      options = { enabled: value.enabled !== false,
        frequency: Object.hasOwn(frequencies, value.frequency) ? value.frequency : "normal" };
      lastEncounterTime = Date.now();
      if (!options.enabled && currentModal) currentModal.hidden = true;
      try { localStorage.setItem("citybuilder.encounters", JSON.stringify(options)); } catch {}
    },
  };
  window.addEventListener("town-city-entered", () => { lastEncounterTime = Date.now(); });

  const getLang = () => {
    try {
      const l = localStorage.getItem("citybuilder.lang");
      if (l === "fr" || l === "en") return l;
    } catch {}
    return document.documentElement.lang === "en" ? "en" : "fr";
  };

  // Open the Mayoral Encounter Modal
  const triggerEncounter = (encounter) => {
    if (!options.enabled || window.__townStartScreen?.isHome()) return;
    const lang = getLang();
    const city = window.__city;
    if (!city) return;

    // Check if other modals are active
    const welcome = document.getElementById("welcome");
    const bankrupt = document.getElementById("bankrupt");
    if (welcome && !welcome.hidden) return;
    if (bankrupt && !bankrupt.hidden) return;

    // Play chime sound
    try {
      window.dispatchEvent(new CustomEvent("citybuilder-milestone"));
    } catch {}

    // Create Modal element if needed
    let modal = document.getElementById("modal-encounter");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "modal-encounter";
      modal.className = "modal";
      document.body.appendChild(modal);
    }

    const title = encounter.title[lang] || encounter.title.en;
    const role = encounter.role[lang] || encounter.role.en;
    const story = encounter.story[lang] || encounter.story.en;
    const choiceAText = encounter.choiceA.label[lang] || encounter.choiceA.label.en;
    const choiceBText = encounter.choiceB.label[lang] || encounter.choiceB.label.en;

    modal.innerHTML = `
      <div class="tutorial encounter-dialog" role="dialog" aria-modal="true">
        <div class="head">
          <h2><span class="enc-icon">${encounter.icon}</span> ${title}</h2>
        </div>
        <div class="body">
          <div class="enc-role-badge">📢 ${role}</div>
          <p class="enc-story">${story}</p>
        </div>
        <div class="foot actions enc-actions">
          <button type="button" class="primary big enc-btn" id="enc-choice-a">
            <span class="btn-title">${choiceAText}</span>
            <span class="btn-badge">${encounter.choiceA.badge}</span>
          </button>
          <button type="button" class="big enc-btn" id="enc-choice-b">
            <span class="btn-title">${choiceBText}</span>
            <span class="btn-badge">${encounter.choiceB.badge}</span>
          </button>
        </div>
      </div>
    `;

    modal.hidden = false;
    currentModal = modal;

    const closeModal = () => {
      modal.hidden = true;
      currentModal = null;
      lastEncounterTime = Date.now();
    };

    // Choice A
    document.getElementById("enc-choice-a").addEventListener("click", () => {
      const result = encounter.choiceA.apply(city);
      if (window.__ui?.update) window.__ui.update(city);
      const text = result[lang] || result.en;
      if (window.__ui?.toast) window.__ui.toast(`📜 ${text}`, "good", { ms: 5000 });
      if (typeof city.addLog === "function") {
        city.addLog("log.encounter", { text }, "info");
      }
      closeModal();
    });

    // Choice B
    document.getElementById("enc-choice-b").addEventListener("click", () => {
      const result = encounter.choiceB.apply(city);
      if (window.__ui?.update) window.__ui.update(city);
      const text = result[lang] || result.en;
      if (window.__ui?.toast) window.__ui.toast(`📜 ${text}`, "info", { ms: 5000 });
      if (typeof city.addLog === "function") {
        city.addLog("log.encounter", { text }, "info");
      }
      closeModal();
    });
  };

  // Evaluate if it's time for a random encounter
  const checkRandomEncounter = () => {
    if (window.__townStartScreen?.isHome()) { lastEncounterTime = Date.now(); return; }
    if (!options.enabled) return;
    if (currentModal && !currentModal.hidden) return;

    const city = window.__city;
    if (!city || !city.stats) return;

    const pop = city.stats.pop || 0;
    if (pop < MIN_POP_FOR_ENCOUNTERS) return;

    const elapsed = Date.now() - lastEncounterTime;
    if (elapsed < frequencies[options.frequency].cooldown) return;

    // Frequency controls both the minimum delay and the chance of an event.
    if (Math.random() < frequencies[options.frequency].chance) {
      const pick = ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)];
      triggerEncounter(pick);
    }
  };

  // Inject Styles for the Encounter Dialog
  const injectStyles = () => {
    if (document.getElementById("encounters-style")) return;
    const style = document.createElement("style");
    style.id = "encounters-style";
    style.textContent = `
      #modal-encounter {
        z-index: 15;
      }
      .encounter-dialog {
        max-width: 480px;
        width: min(480px, 94vw);
        background: linear-gradient(180deg, #1b2338 0%, #141a28 100%);
        border: 2px solid var(--accent, #f2c14e);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
        border-radius: 14px;
        overflow: hidden;
      }
      .encounter-dialog .head {
        background: rgba(242, 193, 78, 0.12);
        border-bottom: 1px solid rgba(242, 193, 78, 0.25);
        padding: 14px 18px;
      }
      .encounter-dialog .head h2 {
        margin: 0;
        font-size: 17px;
        font-weight: 800;
        color: var(--accent, #f2c14e);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .enc-icon {
        font-size: 22px;
      }
      .encounter-dialog .body {
        padding: 16px 18px;
        flex-direction: column;
        gap: 10px;
      }
      .enc-role-badge {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--teal, #5fd7de);
      }
      .enc-story {
        margin: 0;
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--text, #e2e8f0);
      }
      .enc-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 14px 18px 18px;
      }
      .enc-btn {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px !important;
        font-size: 13px !important;
        text-align: left;
        border-radius: 8px;
        cursor: pointer;
      }
      .enc-btn .btn-badge {
        font-size: 11px;
        font-weight: 800;
        opacity: 0.85;
        margin-left: 10px;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  };

  // Initialization
  const init = () => {
    injectStyles();
    setInterval(checkRandomEncounter, 15000); // Check every 15 seconds
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
