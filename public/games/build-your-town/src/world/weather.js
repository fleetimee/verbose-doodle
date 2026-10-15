(() => {
  const text = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const seasons = [
    { id: "winter", en: "Winter", fr: "Hiver" },
    { id: "spring", en: "Spring", fr: "Printemps" },
    { id: "summer", en: "Summer", fr: "Été" },
    { id: "autumn", en: "Autumn", fr: "Automne" },
  ];
  const kinds = {
    clear: ["Clear", "Dégagé"], cloudy: ["Cloudy", "Nuageux"], rain: ["Rain", "Pluie"],
    storm: ["Storm", "Orage"], snow: ["Snow", "Neige"], fog: ["Fog", "Brouillard"],
  };
  // Cumulative odds per season, in the order of `kinds`.
  const odds = {
    winter: [["clear", 0.3], ["cloudy", 0.25], ["snow", 0.3], ["fog", 0.15]],
    spring: [["clear", 0.4], ["cloudy", 0.2], ["rain", 0.33], ["storm", 0.07]],
    summer: [["clear", 0.6], ["cloudy", 0.15], ["rain", 0.13], ["storm", 0.12]],
    autumn: [["clear", 0.3], ["cloudy", 0.25], ["rain", 0.28], ["fog", 0.17]],
  };
  const tints = { winter: "rgba(190,215,255,0.07)", spring: "rgba(150,230,150,0.04)", summer: "rgba(255,220,120,0.05)", autumn: "rgba(235,140,50,0.07)" };
  const levels = { rain: 0, snow: 0, storm: 0, fog: 0, cloud: 0, leaves: 0, petals: 0 };
  let enabled = true, button, last = 0, pending = false, current = { season: seasons[1], kind: "clear" };
  try { enabled = localStorage.getItem("citybuilder.weatherEffects") !== "false"; } catch {}

  const hash = (a, b = 0) => {
    let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35);
    h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  };
  const seasonOf = month => seasons[Math.floor(((month + 1) % 12) / 3)];

  // Foliage stage per month (Jan = 0); summer keeps the original greens.
  const stages = ["winter", "winter", "spring-1", "spring-2", "spring-2", "", "", "", "autumn-1", "autumn-2", "autumn-3", "winter"];
  const autumnColors = [[217, 130, 43], [181, 72, 29], [224, 181, 60], [168, 98, 36]];
  const blossoms = [[247, 198, 214], [255, 227, 236]];
  let latestCity = null, lastStage = null;
  const recolored = new Map();
  // Cheat panel overrides; null means follow the calendar and daily forecast.
  const override = { season: null, kind: null };
  const overrideStages = { winter: "winter", spring: "spring-2", summer: "", autumn: "autumn-2" };
  const foliageStage = month => stages[month] ?? "";
  const stageFor = city => override.season ? overrideStages[override.season] : foliageStage(city.month);
  const textHash = value => { let h = 0; for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 0x01000193); return h >>> 0; };
  // Foliage greens have a low red-to-green ratio; the grass palette sits near 0.63. The alternate forest style
  // (light green and golden leaves) overlaps grass on red, but its blue-to-green ratio stays below grass (~0.47).
  const isFoliage = (r, g, b) => {
    if (g > 60 && g > b && r / g < 0.52) return true;
    if (g > b && b / g < 0.43 && r / g >= 0.5 && r / g < 0.8) return true;
    return r > g * 1.25 && r > 150 && b / g < 0.5;
  };
  // Grass (~#6aa84f) keeps r/g near 0.63 and b/g near 0.47 under tile shading. Drier land blends it toward sand,
  // pushing r/g up to ~1 and b/g up to ~0.7; pure sand (r/g > 1.08) and water stay outside.
  const isGrass = (r, g, b) => g > 45 && g >= r * 0.99 && g > b && r / g >= 0.5 && b / g >= 0.4 && b / g <= 0.7;
  // Sprites that paint grass underneath; the rest are only touched when they hold foliage.
  const groundKeys = ["grass:", "road:", "boulevard:", "hwy:", "rail:", "railover:", "st:", "park:", "bld:", "big:"];
  const foliageKeys = ["tree:", "plant:"];
  function recolor(source, stage, seed, zoom) {
    const canvas = document.createElement("canvas");
    canvas.width = source.width; canvas.height = source.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source, 0, 0);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height), data = image.data;
    const cell = Math.max(1, Math.round(2.2 * zoom)), [season, level] = stage.split("-");
    for (let i = 0; i < data.length; i += 4) {
      if (!data[i + 3]) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (!isFoliage(r, g, b)) {
        if (!isGrass(r, g, b)) continue;
        const ground = Math.max(0.55, Math.min(1.05, g / 160));
        if (season === "winter") {
          data[i] = 234 * ground; data[i + 1] = 240 * ground; data[i + 2] = 247 * ground;
        } else if (season === "autumn") {
          const mix = level === "3" ? 0.5 : level === "2" ? 0.4 : 0.2;
          data[i] = r + (176 * ground - r) * mix; data[i + 1] = g + (150 * ground - g) * mix; data[i + 2] = b + (78 * ground - b) * mix;
        }
        continue;
      }
      const pixel = i / 4, cx = Math.floor((pixel % canvas.width) / cell), cy = Math.floor(pixel / canvas.width / cell);
      const patch = hash(cx + seed, cy), pick = hash(cx, cy + seed * 7 + 3);
      const shade = Math.max(0.85, Math.min(1.3, g / 130));
      let color = null;
      if (season === "autumn") {
        const turned = level === "1" ? 0.3 : level === "2" ? 0.85 : 0.95;
        if (patch < turned) {
          color = autumnColors[Math.floor(pick * autumnColors.length)];
          if (level === "3") color = color.map(value => value * 0.72);
        } else if (level === "3") color = [122, 90, 58];
      } else if (season === "winter") {
        color = patch < 0.55 ? [232, 238, 242] : [107, 99, 88];
      } else if (season === "spring") {
        if (patch < (level === "1" ? 0.1 : 0.3)) color = blossoms[Math.floor(pick * blossoms.length)];
        else { data[i] = Math.min(255, r * 1.15); data[i + 1] = Math.min(255, g * 1.12); data[i + 2] = b * 0.95; continue; }
      }
      if (!color) continue;
      data[i] = Math.min(255, color[0] * shade); data[i + 1] = Math.min(255, color[1] * shade); data[i + 2] = Math.min(255, color[2] * shade);
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  }
  function installFoliage(renderer, city) {
    latestCity = city;
    const sprites = renderer.sprites;
    if (sprites && !sprites.seasonalFoliage) {
      sprites.seasonalFoliage = true;
      const original = sprites.get;
      sprites.get = function (key, zoom, ...rest) {
        const canvas = original.call(this, key, zoom, ...rest);
        const stage = enabled && latestCity ? stageFor(latestCity) : "";
        if (!stage || typeof key !== "string") return canvas;
        const groundChanges = stage === "winter" || stage.startsWith("autumn");
        if (!foliageKeys.some(prefix => key.startsWith(prefix)) && !(groundChanges && groundKeys.some(prefix => key.startsWith(prefix)))) return canvas;
        const id = `${stage}|${key}@${zoom}`;
        let result = recolored.get(id);
        if (!result || result.source !== canvas) {
          result = { source: canvas, canvas: recolor(canvas, stage, textHash(key), zoom) };
          recolored.set(id, result);
        }
        return result.canvas;
      };
    }
    const stage = enabled ? stageFor(city) : "";
    if (stage !== lastStage) {
      lastStage = stage;
      if (recolored.size > 4000) recolored.clear();
      setTimeout(() => window.__townView?.redraw(), 0);
    }
  }

  function forecast(city) {
    const season = override.season ? seasons.find(item => item.id === override.season) : seasonOf(city.month);
    const day = city.calendar?.day ?? 1;
    const roll = hash((city.seed | 0) + city.year * 400 + city.month * 31 + day, 7);
    let total = 0, kind = "clear";
    for (const [name, chance] of odds[season.id]) { total += chance; if (roll < total) { kind = name; break; } }
    if (override.kind) kind = override.kind;
    return { season, kind };
  }
  function targets({ season, kind }) {
    const t = { rain: 0, snow: 0, storm: 0, fog: 0, cloud: 0, leaves: 0, petals: 0 };
    if (kind === "rain") { t.rain = 0.7; t.cloud = 0.6; }
    if (kind === "storm") { t.rain = 1; t.storm = 1; t.cloud = 1; }
    if (kind === "snow") { t.snow = 0.8; t.cloud = 0.4; }
    if (kind === "fog") { t.fog = 1; t.cloud = 0.2; }
    if (kind === "cloudy") t.cloud = 0.5;
    if (season.id === "autumn" && !t.snow) t.leaves = t.rain ? 0.3 : 0.8;
    if (season.id === "spring" && !t.rain) t.petals = 0.7;
    return t;
  }
  const icons = { clear: "☀", cloudy: "☁", rain: "🌧", storm: "⛈", snow: "❄", fog: "🌫" };
  function sync() {
    if (!button) return;
    const [en, fr] = kinds[current.kind];
    const summary = `${text(current.season.en, current.season.fr)} · ${text(en, fr)}`;
    const state = enabled ? text("click to hide effects", "cliquer pour masquer") : text("effects hidden, click to show", "effets masqués, cliquer pour afficher");
    button.textContent = icons[current.kind];
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", `${summary}, ${state}`);
    button.title = `${summary} (${state})`;
  }
  function scatter(ctx, count, width, height, time, fall, draw) {
    for (let i = 0; i < count; i++) {
      const speed = fall * (0.6 + hash(i, 3) * 0.8);
      const x = hash(i, 1) * width, y = (hash(i, 2) * height + time * speed) % height;
      draw(x, y, i, time);
    }
  }
  function render(ctx, width, height, time) {
    const k = Math.max(0.6, Math.min(2, width / 1200)), area = width * height / (1280 * 720);
    const sec = time / 1000;
    if (levels.cloud > 0.01) {
      ctx.fillStyle = `rgba(70,80,100,${levels.cloud * 0.22})`; ctx.fillRect(0, 0, width, height);
    }
    if (levels.fog > 0.01) {
      const drift = Math.sin(sec / 9) * 0.04;
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `rgba(215,222,232,${levels.fog * (0.38 + drift)})`);
      gradient.addColorStop(1, `rgba(215,222,232,${levels.fog * (0.58 - drift)})`);
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    }
    if (levels.rain > 0.01) {
      const count = Math.min(700, Math.floor(260 * levels.rain * area));
      ctx.strokeStyle = `rgba(190,215,245,${0.35 + levels.rain * 0.25})`; ctx.lineWidth = k; ctx.beginPath();
      scatter(ctx, count, width, height, sec, 1100 * k, (x, y) => {
        ctx.moveTo(x, y); ctx.lineTo(x - 4 * k, y + 14 * k);
      });
      ctx.stroke();
    }
    if (levels.snow > 0.01) {
      const count = Math.min(500, Math.floor(180 * levels.snow * area));
      ctx.fillStyle = `rgba(255,255,255,${0.55 + levels.snow * 0.3})`; ctx.beginPath();
      scatter(ctx, count, width, height, sec, 70 * k, (x, y, i) => {
        const radius = (1 + hash(i, 4) * 1.8) * k;
        const sx = x + Math.sin(sec * 0.8 + i) * 14 * k;
        ctx.moveTo(sx + radius, y); ctx.arc(sx, y, radius, 0, Math.PI * 2);
      });
      ctx.fill();
    }
    if (levels.leaves > 0.01) {
      const colors = ["#d9822b", "#b5481d", "#e0b53c", "#8f5a24"];
      scatter(ctx, Math.floor(40 * levels.leaves * area), width, height, sec, 55 * k, (x, y, i) => {
        const sx = x + Math.sin(sec * 0.9 + i) * 30 * k;
        ctx.fillStyle = colors[i % colors.length]; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.ellipse(sx, y, 4 * k, 2 * k, sec + i, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    if (levels.petals > 0.01) {
      scatter(ctx, Math.floor(30 * levels.petals * area), width, height, sec, 40 * k, (x, y, i) => {
        const sx = x + Math.sin(sec * 0.7 + i) * 24 * k;
        ctx.fillStyle = i % 2 ? "#f7c6d6" : "#ffe3ec"; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.ellipse(sx, y, 3 * k, 1.8 * k, sec * 0.8 + i, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    if (levels.storm > 0.5) {
      const slot = Math.floor(time / 6500), into = time - slot * 6500;
      if (hash(slot, 11) < 0.6 && into < 350) {
        const flash = into < 80 ? 0.5 : into < 160 ? 0.15 : into < 240 ? 0.35 : 0.05;
        ctx.fillStyle = `rgba(235,240,255,${flash * levels.storm})`; ctx.fillRect(0, 0, width, height);
      }
    }
  }
  function draw(renderer, city) {
    if (!enabled || renderer.flat || renderer.dataMap !== "none") return;
    const now = performance.now(), dt = Math.min(0.25, (now - (last || now)) / 1000);
    last = now;
    const next = forecast(city), goal = targets(next);
    if (next.season !== current.season || next.kind !== current.kind) { current = next; sync(); }
    let active = false;
    for (const key in levels) {
      levels[key] += (goal[key] - levels[key]) * Math.min(1, dt * 0.8);
      if (Math.abs(goal[key] - levels[key]) < 0.005) levels[key] = goal[key];
      if (levels[key] > 0.01) active = true;
    }
    const ctx = renderer.ctx, width = renderer.canvas.width, height = renderer.canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = tints[next.season.id]; ctx.fillRect(0, 0, width, height);
    render(ctx, width, height, now);
    ctx.restore();
    if (active && !pending) {
      pending = true;
      setTimeout(() => { pending = false; window.__townView?.redraw(); }, 33);
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    const group = document.getElementById("town-time");
    if (!group) return;
    button = document.createElement("button"); button.type = "button"; button.className = "town-icon town-weather";
    button.addEventListener("click", () => {
      enabled = !enabled;
      try { localStorage.setItem("citybuilder.weatherEffects", String(enabled)); } catch {}
      sync(); window.__townView?.redraw();
    });
    group.append(button); sync();
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  });
  const dayNight = window.__dayNight;
  if (dayNight) {
    const base = dayNight.draw;
    // Weather renders after the night overlay so rain and snow stay visible in darkness.
    dayNight.draw = (renderer, city, ...rest) => {
      base(renderer, city, ...rest);
      installFoliage(renderer, city);
      draw(renderer, city);
    };
  }
  function setOverride(patch) {
    if ("season" in patch) override.season = seasons.some(item => item.id === patch.season) ? patch.season : null;
    if ("kind" in patch) override.kind = kinds[patch.kind] ? patch.kind : null;
    if (latestCity) { current = forecast(latestCity); sync(); }
    window.__townView?.redraw();
  }
  window.__townWeather = {
    forecast: city => forecast(city), seasonOf, foliageStage, setOverride,
    getOverride: () => ({ ...override }),
    options: { seasons: seasons.map(({ id, en, fr }) => ({ id, en, fr })), kinds: Object.entries(kinds).map(([id, [en, fr]]) => ({ id, en, fr })) },
  };
})();
