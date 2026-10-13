(() => {
  // Comprehensive Import & Export Save Manager for Build Your Town
  // Supports cross-machine export/import of single cities, raw saves, and full multi-city backups

  const PREFIX_CITY = "citybuilder.city.";
  const KEY_INDEX = "citybuilder.index";
  const KEY_CURRENT = "citybuilder.current";
  const KEY_SCENARIOS = "citybuilder.scenarios.medals";

  const getLang = () => {
    try {
      const l = localStorage.getItem("citybuilder.lang");
      if (l === "fr" || l === "en") return l;
    } catch {}
    return document.documentElement.lang === "en" ? "en" : "fr";
  };

  const getCityList = () => {
    try {
      const raw = localStorage.getItem(KEY_INDEX);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveCityList = (list) => {
    try {
      localStorage.setItem(KEY_INDEX, JSON.stringify(list));
    } catch {}
  };

  const downloadJson = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // 1. Export Active or Specific City
  const exportCity = (targetKey) => {
    const activeKey = targetKey || localStorage.getItem(KEY_CURRENT);
    const list = getCityList();
    const meta = list.find((item) => item.key === activeKey);

    let cityData = null;
    try {
      const raw = localStorage.getItem(PREFIX_CITY + activeKey);
      if (raw) cityData = JSON.parse(raw);
    } catch {}

    // Fallback to active memory city if matching
    if (!cityData && window.__city && (!targetKey || targetKey === activeKey)) {
      cityData = window.__city.toJSON();
    }

    if (!cityData) {
      const msg = getLang() === "fr" ? "Impossible d'exporter : données introuvables." : "Export failed: city data not found.";
      if (window.__ui?.toast) window.__ui.toast(msg, "error");
      return;
    }

    // Include mission progression for this city
    let missionData = null;
    try {
      const mRaw = localStorage.getItem(`citybuilder.missions.${activeKey}`);
      if (mRaw) missionData = JSON.parse(mRaw);
    } catch {}

    const cityName = (meta?.name || cityData.name || "City").replace(/[^a-zA-Z0-9_\-]/g, "_");
    const year = cityData.year || 1900;
    const month = (cityData.month || 0) + 1;
    const filename = `${cityName}-${year}m${month}.city.json`;

    const payload = {
      format: "buildyourtown-save",
      version: 1,
      exportedAt: new Date().toISOString(),
      city: {
        key: activeKey,
        name: meta?.name || cityData.name || "City",
        pop: meta?.pop || cityData.stats?.pop || 0,
        year,
        month: cityData.month || 0,
        data: cityData,
      },
      missions: missionData,
    };

    downloadJson(payload, filename);

    const lang = getLang();
    const successMsg =
      lang === "fr"
        ? `✓ Ville « ${payload.city.name} » exportée (${filename})`
        : `✓ City "${payload.city.name}" exported (${filename})`;
    if (window.__ui?.toast) window.__ui.toast(successMsg, "good");
  };

  // 2. Export All Cities (Full Cross-Machine Backup)
  const exportAllCities = () => {
    const list = getCityList();
    if (list.length === 0 && !window.__city) {
      const msg = getLang() === "fr" ? "Aucune ville à exporter." : "No cities to export.";
      if (window.__ui?.toast) window.__ui.toast(msg, "error");
      return;
    }

    const exportedCities = [];
    const missionMap = {};

    list.forEach((meta) => {
      try {
        const raw = localStorage.getItem(PREFIX_CITY + meta.key);
        if (raw) {
          exportedCities.push({
            key: meta.key,
            meta,
            data: JSON.parse(raw),
          });
          const mRaw = localStorage.getItem(`citybuilder.missions.${meta.key}`);
          if (mRaw) missionMap[meta.key] = JSON.parse(mRaw);
        }
      } catch {}
    });

    let scenarioMedals = {};
    try {
      const medRaw = localStorage.getItem(KEY_SCENARIOS);
      if (medRaw) scenarioMedals = JSON.parse(medRaw);
    } catch {}

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `buildyourtown-backup-${dateStr}.json`;

    const payload = {
      format: "buildyourtown-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      activeKey: localStorage.getItem(KEY_CURRENT),
      cities: exportedCities,
      missions: missionMap,
      scenarioMedals,
    };

    downloadJson(payload, filename);

    const lang = getLang();
    const successMsg =
      lang === "fr"
        ? `✓ Sauvegarde complète de ${exportedCities.length} ville(s) exportée !`
        : `✓ Full backup of ${exportedCities.length} city(ies) exported!`;
    if (window.__ui?.toast) window.__ui.toast(successMsg, "good");
  };

  // 3. Import Save File (Handles Single City, Backup, or Raw format)
  const importSaveFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        processImportedJson(json, file.name);
      } catch (err) {
        console.error("Import error:", err);
        const msg = getLang() === "fr" ? "Fichier de sauvegarde invalide ou corrompu." : "Invalid or corrupt save file.";
        if (window.__ui?.toast) window.__ui.toast(msg, "error");
      }
    };
    reader.readAsText(file);
  };

  const processImportedJson = (json, originalFilename) => {
    const lang = getLang();

    // CASE A: Full Backup Archive
    if (json.format === "buildyourtown-backup" && Array.isArray(json.cities)) {
      const list = getCityList();
      let importedCount = 0;
      let lastImportedKey = null;

      json.cities.forEach((c) => {
        if (!c.key || !c.data) return;
        // Store city
        localStorage.setItem(PREFIX_CITY + c.key, JSON.stringify(c.data));

        // Update list
        const existingIdx = list.findIndex((item) => item.key === c.key);
        const meta = c.meta || {
          key: c.key,
          name: c.data.name || "Imported City",
          pop: c.data.stats?.pop || 0,
          year: c.data.year || 1900,
          month: c.data.month || 0,
          savedAt: Date.now(),
        };

        if (existingIdx >= 0) {
          list[existingIdx] = meta;
        } else {
          list.unshift(meta);
        }

        // Restore missions
        if (json.missions && json.missions[c.key]) {
          localStorage.setItem(`citybuilder.missions.${c.key}`, JSON.stringify(json.missions[c.key]));
        }

        importedCount++;
        lastImportedKey = c.key;
      });

      // Restore scenario medals if present
      if (json.scenarioMedals) {
        localStorage.setItem(KEY_SCENARIOS, JSON.stringify(json.scenarioMedals));
      }

      saveCityList(list);

      // Load active or last city
      const keyToLoad = json.activeKey || lastImportedKey;
      if (keyToLoad && window.__City) {
        try {
          const raw = localStorage.getItem(PREFIX_CITY + keyToLoad);
          if (raw) {
            const cityObj = window.__City.fromJSON(JSON.parse(raw));
            window.__startCity(cityObj, keyToLoad);
          }
        } catch {}
      }

      refreshCityListUI();

      try {
        window.dispatchEvent(new CustomEvent("citybuilder-milestone"));
      } catch {}

      const msg =
        lang === "fr"
          ? `✓ Sauvegarde restaurée : ${importedCount} ville(s) importée(s) !`
          : `✓ Backup restored: ${importedCount} city(ies) imported!`;
      if (window.__ui?.toast) window.__ui.toast(msg, "good", { ms: 6000 });
      return;
    }

    // CASE B: Single City Envelope or Raw City JSON
    let cityData = null;
    let cityName = "Imported City";
    let cityKey = null;
    let missionData = null;

    if (json.format === "buildyourtown-save" && json.city?.data) {
      cityData = json.city.data;
      cityName = json.city.name || cityData.name || "Imported City";
      cityKey = json.city.key || `city_${Date.now()}`;
      missionData = json.missions || null;
    } else if (json.terrain && json.overlay && (json.size === 128 || json.v)) {
      // Raw city JSON
      cityData = json;
      cityName = json.name || "Imported City";
      cityKey = `city_${Date.now()}`;
    }

    if (!cityData || !cityData.terrain) {
      const msg = lang === "fr" ? "Format de ville non reconnu." : "Unrecognized city format.";
      if (window.__ui?.toast) window.__ui.toast(msg, "error");
      return;
    }

    // Ensure unique key if desired
    if (!cityKey) cityKey = `city_${Date.now()}`;

    // Validate reconstruction with engine
    if (!window.__City) {
      const msg = lang === "fr" ? "Moteur de jeu non prêt." : "Game engine not ready.";
      if (window.__ui?.toast) window.__ui.toast(msg, "error");
      return;
    }

    let reconstructed = null;
    try {
      reconstructed = window.__City.fromJSON(cityData);
    } catch (e) {
      console.error("City fromJSON failed:", e);
      const msg = lang === "fr" ? "Version de sauvegarde incompatible." : "Incompatible save version.";
      if (window.__ui?.toast) window.__ui.toast(msg, "error");
      return;
    }

    // Persist to localStorage
    localStorage.setItem(PREFIX_CITY + cityKey, JSON.stringify(cityData));
    localStorage.setItem(KEY_CURRENT, cityKey);

    if (missionData) {
      localStorage.setItem(`citybuilder.missions.${cityKey}`, JSON.stringify(missionData));
    }

    // Add to city index
    const list = getCityList();
    const existingIdx = list.findIndex((item) => item.key === cityKey);
    const meta = {
      key: cityKey,
      name: cityName,
      pop: cityData.stats?.pop || 0,
      year: cityData.year || 1900,
      month: cityData.month || 0,
      savedAt: Date.now(),
    };

    if (existingIdx >= 0) {
      list[existingIdx] = meta;
    } else {
      list.unshift(meta);
    }
    saveCityList(list);

    // Immediately load the imported city into game canvas!
    window.__startCity(reconstructed, cityKey);

    refreshCityListUI();

    try {
      window.dispatchEvent(new CustomEvent("citybuilder-milestone"));
    } catch {}

    const msg =
      lang === "fr"
        ? `✓ Ville « ${cityName} » importée et chargée avec succès !`
        : `✓ City "${cityName}" imported and loaded successfully!`;
    if (window.__ui?.toast) window.__ui.toast(msg, "good", { ms: 6000 });
  };

  const refreshCityListUI = () => {
    if (window.__ui?.setCityList) {
      const list = getCityList();
      const current = localStorage.getItem(KEY_CURRENT);
      window.__ui.setCityList(list, current);
    }
  };

  // UI Integration into #panel-cities
  const initUI = () => {
    const panelCities = document.getElementById("panel-cities");
    if (!panelCities) return;

    const body = panelCities.querySelector(".body");
    if (!body || document.getElementById("save-mgr-actions")) return;

    // Create Hidden File Input for Import
    let fileInput = document.getElementById("save-import-input");
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "save-import-input";
      fileInput.accept = ".json,.city.json";
      fileInput.hidden = true;
      document.body.appendChild(fileInput);

      fileInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (file) {
          importSaveFile(file);
          fileInput.value = "";
        }
      });
    }

    // Create Action Buttons Container
    const actionContainer = document.createElement("div");
    actionContainer.id = "save-mgr-actions";
    actionContainer.className = "save-mgr-container";

    const lang = getLang();
    actionContainer.innerHTML = `
      <div class="save-actions-grid">
        <button type="button" class="save-btn import-btn" id="btn-import-save">
          <span>📥</span> ${lang === "fr" ? "Importer une sauvegarde" : "Import Save File"}
        </button>
        <button type="button" class="save-btn export-btn" id="btn-export-active">
          <span>📤</span> ${lang === "fr" ? "Exporter la ville" : "Export City"}
        </button>
        <button type="button" class="save-btn backup-btn" id="btn-export-all">
          <span>💾</span> ${lang === "fr" ? "Sauvegarde complète" : "Full Backup"}
        </button>
      </div>
    `;

    body.appendChild(actionContainer);

    // Event Listeners
    document.getElementById("btn-import-save").addEventListener("click", () => {
      fileInput.click();
    });

    document.getElementById("btn-export-active").addEventListener("click", () => {
      exportCity();
    });

    document.getElementById("btn-export-all").addEventListener("click", () => {
      exportAllCities();
    });

    // Observer on #cities-list to append per-row Export buttons
    const citiesListEl = document.getElementById("cities-list");
    if (citiesListEl) {
      const enhanceRows = () => {
        const rows = citiesListEl.querySelectorAll(".row.city");
        const list = getCityList();

        rows.forEach((row, idx) => {
          if (row.querySelector(".btn-row-export")) return;

          const meta = list[idx];
          if (!meta) return;

          const exportBtn = document.createElement("button");
          exportBtn.type = "button";
          exportBtn.className = "ghost btn-row-export";
          exportBtn.title = lang === "fr" ? "Exporter ce fichier" : "Export this city file";
          exportBtn.innerHTML = "📥";
          exportBtn.style.padding = "0 8px";
          exportBtn.style.fontSize = "14px";

          exportBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            exportCity(meta.key);
          });

          // Insert right before the delete button (last child)
          const lastBtn = row.lastElementChild;
          if (lastBtn) {
            row.insertBefore(exportBtn, lastBtn);
          } else {
            row.appendChild(exportBtn);
          }
        });
      };

      enhanceRows();
      new MutationObserver(enhanceRows).observe(citiesListEl, { childList: true });
    }
  };

  // Inject Styles
  const injectStyles = () => {
    if (document.getElementById("save-mgr-style")) return;
    const style = document.createElement("style");
    style.id = "save-mgr-style";
    style.textContent = `
      .save-mgr-container {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid var(--border, rgba(255, 255, 255, 0.12));
      }
      .save-actions-grid {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .save-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px 12px;
        font-size: 12.5px;
        font-weight: 700;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.15));
        color: var(--text, #fff);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .save-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
      }
      .save-btn.import-btn {
        background: rgba(95, 215, 222, 0.12);
        border-color: rgba(95, 215, 222, 0.4);
        color: var(--teal, #5fd7de);
      }
      .save-btn.import-btn:hover {
        background: rgba(95, 215, 222, 0.22);
      }
      .save-btn.backup-btn {
        background: rgba(242, 193, 78, 0.08);
        border-color: rgba(242, 193, 78, 0.3);
        color: var(--accent, #f2c14e);
      }
      .save-btn.backup-btn:hover {
        background: rgba(242, 193, 78, 0.18);
      }
      .btn-row-export:hover {
        color: var(--accent, #f2c14e) !important;
      }
    `;
    document.head.appendChild(style);
  };

  const init = () => {
    injectStyles();
    initUI();
    // Also re-check when panel is opened
    const btnCities = document.getElementById("btn-cities");
    if (btnCities) {
      btnCities.addEventListener("click", () => setTimeout(initUI, 50));
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
